const express = require('express');
const { handleWebhook } = require('./services/paymentService');

const app = express();
app.use(express.json());

// Rota de Health Check para a Render não derrubar a aplicação
app.get('/', (req, res) => {
    res.status(200).send('Bot está rodando e online!');
});

// Rota do Webhook da Skale Pay
app.post('/webhook/skalepay', handleWebhook);

const PORT = process.env.PORT || 3000;

function startServer() {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
    });
}

module.exports = { startServer };
