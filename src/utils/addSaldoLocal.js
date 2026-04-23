require('dotenv').config();
const { addSaldo } = require('../dbService');

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Uso: node src/utils/addSaldoLocal.js <ID_TELEGRAM> <VALOR>');
        process.exit(1);
    }

    const userId = args[0];
    const valor = parseFloat(args[1]);

    if (isNaN(valor)) {
        console.log('Valor inválido!');
        process.exit(1);
    }

    try {
        const user = await addSaldo(userId, valor);
        console.log(`✅ Sucesso! Novo saldo do usuário ${userId}: R$ ${user.saldo}`);
    } catch (e) {
        console.error('Erro ao adicionar saldo:', e.message);
    } finally {
        process.exit(0);
    }
}

main();
