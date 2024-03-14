// Importando os módulos necessários
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Inicializando o aplicativo Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para analisar o corpo das solicitações
app.use(bodyParser.json());

// Conectando ao banco de dados MongoDB
mongoose.connect('mongodb+srv://kaueteixeirap:sdyHsa8Cm6v6cYBc@agoravaimesmodb.5mkrmuf.mongodb.net/?retryWrites=true&w=majority&appName=AgoraVaiMesmoDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com o MongoDB:'));
db.once('open', function() {
  console.log('Conectado ao MongoDB');
});

// Definindo o esquema do modelo
const CarCrashSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  distance_cm: Number // Adicionando o campo para armazenar a distância medida
});

const CarCrash = mongoose.model('CarCrash', CarCrashSchema);

// Rota para lidar com a solicitação POST do ESP8266
app.post('/crash', async (req, res) => {
  try {
    // Verifica se há dados no corpo da solicitação
    if (!req.body.distance_cm) {
      console.error('Dados de distância não fornecidos.');
      return res.status(400).send('Dados de distância não fornecidos.');
    }

    // Obtém a distância do corpo da solicitação
    const distance_cm = req.body.distance_cm;

    // Cria uma nova instância do modelo CarCrash com a distância fornecida
    const newCrash = new CarCrash({ distance_cm });

    // Salva no banco de dados
    await newCrash.save();
    console.log('Dados do acidente salvos no banco de dados.');

    // Envia resposta 200 (OK) de volta para o ESP8266
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao salvar os dados do acidente no banco de dados:', error);
    // Envia resposta 500 (Erro interno do servidor) de volta para o ESP8266 em caso de erro
    res.sendStatus(500);
  }
});


// Rota para obter a distância medida pelo ESP8266
app.get('/distance', async (req, res) => {
  try {
    // Consultar o último registro no banco de dados
    const latestCrash = await CarCrash.findOne().sort({ date: -1 }).exec();
    if (!latestCrash) {
      // Se não houver registro, enviar resposta 404 (Não encontrado)
      res.sendStatus(404);
      return;
    }
    // Enviar a distância medida como resposta
    res.json({ distance_cm: latestCrash.distance_cm });
  } catch (error) {
    console.error('Erro ao consultar a distância no banco de dados:', error);
    // Enviar resposta 500 (Erro interno do servidor) em caso de erro
    res.sendStatus(500);
  }
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
