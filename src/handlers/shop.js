const { shopKeyboard, consultaveisKeyboard, larasKeyboard } = require('../utils/keyboards');
const { getEstoque, getUser, comprarProduto } = require('../dbService');

module.exports = (bot) => {
    bot.action('menu_shop', (ctx) => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        const nextDay = date.toLocaleDateString('pt-BR');

        const text = `• Consultáveis - Cartões acessivel pelo própio aplicativo bancario (O MELHOR MATERIAL DE TODA A NET)\n` +
                     `• Laras - Contas Laranjas criadas com dados de Terceiros para receber dinheiro de forma anônima.\n\n` +
                     `🔥 A PROMOÇÃO EM TODO NOSSO ESTOQUE ACABA DIA ${nextDay}.\n\n` +
                     `Escolha o tipo de material:`;

        ctx.editMessageText(text, shopKeyboard()).catch(() => {});
    });

    const renderConsultavel = async (ctx, index) => {
        const consultaveis = await getEstoque('consultaveis');
        if (consultaveis.length === 0) {
            return ctx.editMessageText('❌ Estoque esgotado no momento.', shopKeyboard()).catch(() => {});
        }
        
        if (index >= consultaveis.length) index = 0;
        if (index < 0) index = consultaveis.length - 1;

        const item = consultaveis[index];
        let user = await getUser(ctx.from.id);
        if (!user) user = { total_compras: 0, saldo: 0, id: ctx.from.id };
        
        const precoFinal = parseFloat(item.preco);
        const saldo = parseFloat(user.saldo);

        const text = `${item.bandeira} | ${item.nivel}\n` +
                     `🔢 BIN: ${item.bin}\n` +
                     `🗓 Val: ${item.validade}\n` +
                     `🔐 CVV: ${item.cvv}\n` +
                     `💰 Limite: R$ ${item.limite}\n\n` +
                     `🏦 Banco: ${item.banco}\n` +
                     `🌎 País: ${item.pais}\n\n` +
                     `👤 Nome: Incluso ${item.nome_incluso ? '✅' : '❌'}\n` +
                     `📝 CPF: Incluso ${item.cpf_incluso ? '✅' : '❌'}\n\n` +
                     `💲 Preço: R$ ${precoFinal.toFixed(2).replace('.', ',')}\n` +
                     `💲 Seu Saldo: R$ ${saldo.toFixed(2).replace('.', ',')}\n\n` +
                     `Item ${index + 1} de ${consultaveis.length}\n` +
                     `⚠ Passe para o próximo para ver as melhores opções possíveis!`;
        
        ctx.editMessageText(text, { parse_mode: 'HTML', ...consultaveisKeyboard(index, consultaveis.length, item.id) }).catch((e) => console.error("Erro render consultaveis:", e));
    };

    bot.action('shop_consultaveis', (ctx) => renderConsultavel(ctx, 0));
    
    bot.action(/^next_consultavel_(\d+)$/, (ctx) => {
        let index = parseInt(ctx.match[1]) + 1;
        renderConsultavel(ctx, index);
    });

    bot.action(/^prev_consultavel_(\d+)$/, (ctx) => {
        let index = parseInt(ctx.match[1]) - 1;
        renderConsultavel(ctx, index);
    });

    bot.action(/^buy_consultavel_(\d+)$/, async (ctx) => {
        const itemId = parseInt(ctx.match[1]);
        let user = await getUser(ctx.from.id);
        if (!user) {
            return ctx.answerCbQuery('❌ Usuário não encontrado. Envie /start novamente.', { show_alert: true });
        }
        const consultaveis = await getEstoque('consultaveis');
        const item = consultaveis.find(i => i.id === itemId);

        if (!item) {
            return ctx.answerCbQuery('❌ Item não encontrado no estoque atual.', { show_alert: true });
        }

        const precoFinal = parseFloat(item.preco);

        const transacao = await comprarProduto(user.id, 'consultaveis', itemId, precoFinal);

        if (transacao.success) {
            const purchasedItem = transacao.item;
            const msgText = `✅ <b>COMPRA APROVADA</b> ✅\n\n` +
                            `💳 <b>Card:</b> ${purchasedItem.bin} ${purchasedItem.validade} ${purchasedItem.cvv}\n` +
                            `🏦 <b>Banco:</b> ${purchasedItem.banco}\n` +
                            `⭐ <b>Limite:</b> R$ ${purchasedItem.limite}\n\n` +
                            `Obrigado pela preferência!`;
            
            ctx.editMessageText(msgText, { parse_mode: 'HTML', ...shopKeyboard() }).catch((e) => console.error("Erro tela compra:", e));
        } else {
            ctx.answerCbQuery(`❌ ${transacao.message}`, { show_alert: true });
        }
    });

    // Laras
    const renderLara = async (ctx, index) => {
        const laras = await getEstoque('laras');
        if (laras.length === 0) {
            return ctx.editMessageText('❌ Estoque esgotado no momento.', shopKeyboard()).catch(() => {});
        }

        if (index >= laras.length) index = 0;
        if (index < 0) index = laras.length - 1;

        const item = laras[index];
        let user = await getUser(ctx.from.id);
        if (!user) user = { total_compras: 0, saldo: 0, id: ctx.from.id };

        const precoFinal = parseFloat(item.preco);

        const text = `🏦 <b>${item.tipo}</b> 🏦\n` +
                     `👤 <b>Titular:</b> ${item.titular}\n` +
                     `🆔 <b>CPF:</b> ${item.cpf}\n` +
                     `🎂 <b>Nascimento:</b> ${item.nascimento}\n` +
                     `📌 <b>Status:</b> ${item.status_conta}\n` +
                     `📊 <b>SCORE:</b> ${item.score}\n` +
                     `💸 <b>Limite diário:</b> R$ ${item.limite_diario}\n` +
                     `🛜 <b>Condição:</b> ${item.condicao}\n\n` +
                     `Valor: R$ ${precoFinal.toFixed(2).replace('.', ',')}\n` +
                     `${index + 1} de ${laras.length}`;
        
        ctx.editMessageText(text, { parse_mode: 'HTML', ...larasKeyboard(index, laras.length, item.id) }).catch((e) => console.error("Erro render laras:", e));
    };

    bot.action('shop_laras', (ctx) => renderLara(ctx, 0));

    bot.action(/^next_lara_(\d+)$/, (ctx) => {
        let index = parseInt(ctx.match[1]) + 1;
        renderLara(ctx, index);
    });

    bot.action(/^prev_lara_(\d+)$/, (ctx) => {
        let index = parseInt(ctx.match[1]) - 1;
        renderLara(ctx, index);
    });

    bot.action(/^buy_lara_(\d+)$/, async (ctx) => {
        const itemId = parseInt(ctx.match[1]);
        let user = await getUser(ctx.from.id);
        if (!user) {
            return ctx.answerCbQuery('❌ Usuário não encontrado. Envie /start novamente.', { show_alert: true });
        }
        const laras = await getEstoque('laras');
        const item = laras.find(i => i.id === itemId);

        if (!item) {
            return ctx.answerCbQuery('❌ Item não encontrado no estoque atual.', { show_alert: true });
        }

        const precoFinal = parseFloat(item.preco);

        const transacao = await comprarProduto(user.id, 'laras', itemId, precoFinal);

        if (transacao.success) {
            const purchasedItem = transacao.item;
            const msgText = `✅ <b>COMPRA DE LARA APROVADA</b> ✅\n\n` +
                            `🏦 <b>Titular:</b> ${purchasedItem.titular}\n` +
                            `📧 <b>Email:</b> ${purchasedItem.email}\n` +
                            `🔑 <b>Secret:</b> ${purchasedItem.secret_key}\n` +
                            `📲 <b>Chave 2FA:</b> ${purchasedItem.chave2fa}\n` +
                            `🔒 <b>Senhas:</b> 4d (${purchasedItem.senha4}) | 6d (${purchasedItem.senha6}) | 8d (${purchasedItem.senha8})\n\n` +
                            `Obrigado pela preferência! Mantenha estes dados seguros.`;
            
            ctx.editMessageText(msgText, { parse_mode: 'HTML', ...shopKeyboard() }).catch((e) => console.error("Erro tela compra lara:", e));
        } else {
            ctx.answerCbQuery(`❌ ${transacao.message}`, { show_alert: true });
        }
    });
};
