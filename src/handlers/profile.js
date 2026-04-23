const { profileKeyboard, historyKeyboard } = require('../utils/keyboards');
const { getUser } = require('../dbService');

module.exports = (bot) => {
    bot.action('menu_profile', async (ctx) => {
        const user = await getUser(ctx.from.id);
        const saldo = user ? parseFloat(user.saldo) : 0;
        const nome = user ? user.nome : 'Usuário';

        const text = `👤 **Meu Perfil**\n\n` +
                     `ID: ${ctx.from.id}\n` +
                     `Nome: ${nome}\n` +
                     `Saldo Atual: R$ ${saldo.toFixed(2).replace('.', ',')}`;
        
        ctx.editMessageText(text, { parse_mode: 'Markdown', ...profileKeyboard() }).catch(() => {});
    });

    bot.action('menu_history', async (ctx) => {
        const user = await getUser(ctx.from.id);
        const cards = user ? user.cards_comprados : 0;
        const total = user ? parseFloat(user.total_compras) : 0;
        const gifts = user ? user.gifts_resgatados : 0;

        const text = `📜 **Histórico de Compras**\n\n` +
                     `💳 Cards: ${cards}\n` +
                     `💰 Saldo: R$ ${total.toFixed(2).replace('.', ',')}\n` +
                     `🎁 Gifts: ${gifts}\n\n` +
                     `Atenção: Os valores presentes nesta sessão são o total comprado, adicionado e resgatado, respectivamente.`;
        
        ctx.editMessageText(text, { parse_mode: 'Markdown', ...historyKeyboard() }).catch(() => {});
    });
};
