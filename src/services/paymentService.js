const axios = require('axios');
const dbService = require('../dbService');

const getAuthHeader = () => {
    const credentials = Buffer.from(`${process.env.SKALEPAY_SECRET_KEY}:x`).toString('base64');
    return `Basic ${credentials}`;
};

async function generatePix(userId, amount) {
    try {
        const valorEmCentavos = Math.round(parseFloat(amount) * 100);

        const payload = {
            amount: valorEmCentavos,
            paymentMethod: 'pix',
            externalRef: userId.toString(),
            postbackUrl: `${process.env.RENDER_URL || 'https://mestreblackbot.onrender.com'}/webhook/skalepay`,
            customer: {
                name: 'Cliente Telegram',
                email: 'cliente@bottelegram.com',
                document: {
                    number: '00003887693',
                    type: 'cpf'
                }
            },
            items: [
                {
                    title: 'Recarga de Saldo',
                    unitPrice: valorEmCentavos,
                    quantity: 1,
                    tangible: false
                }
            ],
            pix: {
                expiresInDays: 1
            }
        };

        const response = await axios.post('https://api.conta.skalepay.com.br/v1/transactions', payload, {
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        // data.pix.qrcode is the copy/paste string
        return {
            success: true,
            copyPaste: data.pix?.qrcode || 'PIX_NAO_GERADO'
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
        if (payload.status === 'paid' || payload.status === 'approved') {
            const userId = payload.externalRef;
            // payload.amount is likely in cents based on Skale Pay standards
            const amount = parseFloat(payload.amount) / 100;

            if (userId && amount) {
                await dbService.addSaldo(userId, amount);
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
