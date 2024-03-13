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
    // Criar uma nova instância do modelo CarCrash
    const newCrash = new CarCrash();
    // Salvar no banco de dados
    await newCrash.save();
    console.log('Dados do acidente salvos no banco de dados.');
    // Enviar resposta 200 (OK) de volta para o ESP8266
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao salvar os dados do acidente no banco de dados:', error);
    // Enviar resposta 500 (Erro interno do servidor) de volta para o ESP8266 em caso de erro
    res.sendStatus(500);
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
