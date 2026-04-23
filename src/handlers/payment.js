const { addBalanceKeyboard } = require('../utils/keyboards');
const { userStates } = require('../state');
const { getUser } = require('../dbService');
const { generatePix } = require('../services/paymentService');

module.exports = (bot) => {
    bot.action('menu_add_balance', (ctx) => {
        ctx.editMessageText('De que forma deseja adicionar saldo?', addBalanceKeyboard()).catch(() => {});
    });

    bot.action('add_balance_auto', async (ctx) => {
        const user = await getUser(ctx.from.id);
        const saldo = user ? parseFloat(user.saldo) : 0;
        
        const text = `💰 **Adicionar Saldo**\n` +
                     `💳 Seu Saldo: R$ ${saldo.toFixed(2).replace('.', ',')}\n` +
                     `🎯 Digite o valor que deseja depositar (mínimo R$ 15):\n` +
                     `Exemplos:\n` +
                     `/pix 25\n` +
                     `/pix 50 \n` +
                     `━━━━━━━━━━\n` +
                     `⚡ Pagamento PIX aprovado automaticamente!\n` +
                     `🕐 Crédito instantâneo na sua carteira!\n` +
                     `⁉ Caso tenha algum problema, chame o suporte.\n\n` +
                     `Por favor, digite o valor que você deseja recarregar agora:`;
        
        userStates.set(ctx.from.id, { action: 'awaiting_pix_amount' });
        ctx.editMessageText(text, { parse_mode: 'Markdown' }).catch(() => {});
    });

    // Handle text messages or /pix command
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;
        const state = userStates.get(userId);
        
        let amountText = ctx.message.text.trim();
        
        if (amountText.toLowerCase().startsWith('/pix ')) {
            amountText = amountText.replace('/pix ', '').trim();
        }

        if (state && state.action === 'awaiting_pix_amount') {
            const amount = parseFloat(amountText.replace(',', '.'));
            
            if (isNaN(amount) || amount < 15) {
                return ctx.reply('❌ Valor inválido. O mínimo para depósito é R$ 15,00. Digite novamente:');
            }

            userStates.delete(userId);
            
            ctx.reply(`⏳ Gerando PIX no valor de R$ ${amount.toFixed(2).replace('.', ',')}... aguarde.`);

            const pix = await generatePix(userId, amount);

            if (pix.success) {
                const textPix = `✅ **PIX GERADO COM SUCESSO**\n\n` +
                                `Valor: R$ ${amount.toFixed(2).replace('.', ',')}\n\n` +
                                `Pix Copia e Cola abaixo:\n\n` +
                                `\`${pix.copyPaste}\`\n\n` +
                                `*O saldo será creditado automaticamente assim que o pagamento for confirmado.*`;
                ctx.reply(textPix, { parse_mode: 'Markdown' });
            } else {
                ctx.reply('❌ Ocorreu um erro ao comunicar com o Gateway de Pagamento. Tente novamente mais tarde.');
            }
        }
    });
};
