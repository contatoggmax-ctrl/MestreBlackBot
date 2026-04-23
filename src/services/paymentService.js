const axios = require('axios');
const { addSaldo } = require('../dbService');

const SKALEPAY_URL = 'https://api.skalepay.com.br/api/v1'; // Ajuste conforme a documentação oficial
const SECRET_KEY = process.env.SKALEPAY_SECRET_KEY;

// Função para gerar o token Basic Auth em Base64
function getAuthHeader() {
    const token = Buffer.from(`${SECRET_KEY}:x`).toString('base64');
    return `Basic ${token}`;
}

async function generatePix(userId, amount, userEmail = 'cliente@bot.com') {
    try {
        const response = await axios.post(`${SKALEPAY_URL}/transactions`, {
            amount: Math.round(amount * 100), // Enviar em centavos se a API exigir, ou apenas amount
            payment_method: 'pix',
            customer: {
                email: userEmail
            },
            externalRef: userId.toString() // O ID do Telegram! Fundamental para o Webhook.
        }, {
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        // Retorna o qrcode e o código copia e cola (Ajuste os campos conforme o retorno real da API)
        return {
            success: true,
            qrCodeBase64: response.data.pix_qr_code_base64 || null,
            copyPaste: response.data.pix_copy_paste || 'PIX_COPIA_COLA_MOCK'
        };
    } catch (error) {
        console.error('Erro ao gerar PIX Skale Pay:', error.response ? error.response.data : error.message);
        return { success: false };
    }
}

async function handleWebhook(req, res) {
    try {
        const payload = req.body;
        
        // Verifica se é uma transação paga
        // Os campos dependem da documentação exata da Skale Pay
        if (payload.status === 'paid' || payload.status === 'approved') {
            const userId = payload.externalRef;
            const amount = parseFloat(payload.amount); // ou payload.amount / 100 se vier em centavos

            if (userId && amount) {
                // Adiciona o saldo ao usuário no banco
                await addSaldo(userId, amount);
                console.log(`✅ Saldo de R$ ${amount} adicionado ao usuário ${userId} via Webhook Skale Pay.`);
            }
        }

        res.status(200).send('Webhook recebido');
    } catch (error) {
        console.error('Erro no processamento do webhook:', error);
        res.status(500).send('Erro interno');
    }
}

module.exports = {
    generatePix,
    handleWebhook
};
