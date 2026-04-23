require('dotenv').config();
const { pool } = require('../dbService');

async function reset() {
    try {
        console.log('Apagando tabelas antigas...');
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');
        await pool.query('DROP TABLE IF EXISTS consultaveis CASCADE;');
        await pool.query('DROP TABLE IF EXISTS laras CASCADE;');
        console.log('Tabelas antigas apagadas com sucesso! Agora você pode rodar o bot normalmente.');
    } catch (e) {
        console.error('Erro ao apagar tabelas:', e);
    } finally {
        process.exit();
    }
}

reset();
