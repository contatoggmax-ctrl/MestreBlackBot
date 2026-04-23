require('dotenv').config();
const { Telegraf } = require('telegraf');
const { initDB } = require('./dbService');
const { startServer } = require('./server');

// Handlers
const startHandler = require('./handlers/start');
const profileHandler = require('./handlers/profile');
const shopHandler = require('./handlers/shop');
const paymentHandler = require('./handlers/payment');

const botToken = process.env.BOT_TOKEN || 'SUA_CHAVE_AQUI';
const bot = new Telegraf(botToken);

bot.catch((err, ctx) => {
    console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
    ctx.reply('Ocorreu um erro interno. Nossa equipe já foi notificada.').catch(() => {});
});

startHandler(bot);
profileHandler(bot);
shopHandler(bot);
paymentHandler(bot);

async function bootstrap() {
    // 1. Inicializar Banco de Dados e tabelas
    await initDB();
    
    // 2. Iniciar Servidor Express (Webhook e Healthcheck)
    startServer();

    // 3. Iniciar Bot
    bot.launch().then(() => {
        console.log('🤖 Bot iniciado com sucesso!');
    }).catch(err => {
        console.error('Erro ao iniciar o bot:', err);
    });
}

bootstrap();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
