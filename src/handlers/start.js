const { mainKeyboard } = require('../utils/keyboards');
const { createUser } = require('../dbService');

function getStartMessage(name) {
    return `Olá, ${name} - Seja bem-vindo a melhor Store de material do telegram!\n\n` +
           `🌌 Aqui você acessa CCs de qualidade superior e preços justos.\n\n` +
           `💳 Material testado em tempo real: Garantia de qualidade sem falhas.\n` +
           `💳 CCs Virgens: Obtidas de lojas virtuais legítimas.`;
}

module.exports = (bot) => {
    bot.start(async (ctx) => {
        const userId = ctx.from.id;
        const name = ctx.from.first_name || 'Usuário';
        await createUser(userId, name);
        
        ctx.reply(getStartMessage(name), mainKeyboard());
    });

    bot.action('menu_main', (ctx) => {
        const name = ctx.from.first_name || 'Usuário';
        ctx.editMessageText(getStartMessage(name), mainKeyboard()).catch(() => {});
    });
};
