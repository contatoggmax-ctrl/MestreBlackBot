const { Markup } = require('telegraf');

function mainKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('👤 Meu Perfil', 'menu_profile'), Markup.button.callback('🛒 Comprar', 'menu_shop')],
        [Markup.button.callback('➕ Adicionar Saldo', 'menu_add_balance'), Markup.button.callback('🎁 Resgatar GIFT', 'menu_gift')]
    ]);
}

function profileKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('➕ Adicionar Saldo', 'menu_add_balance'), Markup.button.callback('📜 Historico de compras', 'menu_history')],
        [Markup.button.callback('🔙 Voltar', 'menu_main')]
    ]);
}

function shopKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('💳 Consultáveis', 'shop_consultaveis'), Markup.button.callback('🍊 Lara', 'shop_laras')],
        [Markup.button.callback('🔙 Voltar', 'menu_main')]
    ]);
}

function addBalanceKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🤖 Automático', 'add_balance_auto')],
        [Markup.button.callback('🔙 Voltar', 'menu_main')]
    ]);
}

function historyKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Voltar', 'menu_profile')]
    ]);
}

function consultaveisKeyboard(currentIndex, totalItems, itemId) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('💰 COMPRAR', `buy_consultavel_${itemId}`)],
        [
            Markup.button.callback('⏮ ANTERIOR', `prev_consultavel_${currentIndex}`),
            Markup.button.callback('⏭ PRÓXIMO', `next_consultavel_${currentIndex}`)
        ],
        [
            Markup.button.url('⁉ TUTORIAL DE ACESSO', 'https://t.me/tutoriais_fake_link'),
            Markup.button.callback('🔙 VOLTAR', 'menu_shop')
        ]
    ]);
}

function larasKeyboard(currentIndex, totalItems, itemId) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('💰 COMPRAR', `buy_lara_${itemId}`)],
        [
            Markup.button.callback('⏮ ANTERIOR', `prev_lara_${currentIndex}`),
            Markup.button.callback('⏭ PRÓXIMO', `next_lara_${currentIndex}`)
        ],
        [Markup.button.callback('🔙 VOLTAR', 'menu_shop')]
    ]);
}

function backToShopKeyboard() {
     return Markup.inlineKeyboard([
        [Markup.button.callback('🔙 VOLTAR', 'menu_shop')]
    ]);
}

module.exports = {
    mainKeyboard,
    profileKeyboard,
    shopKeyboard,
    addBalanceKeyboard,
    historyKeyboard,
    consultaveisKeyboard,
    larasKeyboard,
    backToShopKeyboard
};
