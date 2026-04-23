const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        nome VARCHAR(255),
        saldo NUMERIC(10, 2) DEFAULT 0.00,
        total_compras NUMERIC(10, 2) DEFAULT 0.00,
        cards_comprados INT DEFAULT 0,
        gifts_resgatados INT DEFAULT 0
      )
    `);

    // Tabela de Consultáveis
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultaveis (
        id SERIAL PRIMARY KEY,
        bin VARCHAR(50),
        validade VARCHAR(10),
        cvv VARCHAR(10),
        limite NUMERIC(10, 2),
        banco VARCHAR(100),
        pais VARCHAR(10),
        nome_incluso BOOLEAN DEFAULT false,
        cpf_incluso BOOLEAN DEFAULT false,
        preco NUMERIC(10, 2),
        bandeira VARCHAR(50),
        nivel VARCHAR(50),
        status VARCHAR(20) DEFAULT 'DISPONIVEL'
      )
    `);

    // Tabela de Laras
    await client.query(`
      CREATE TABLE IF NOT EXISTS laras (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(100),
        titular VARCHAR(255),
        cpf VARCHAR(20),
        nascimento VARCHAR(20),
        status_conta VARCHAR(50),
        score VARCHAR(50),
        limite_diario NUMERIC(10, 2),
        condicao VARCHAR(100),
        email VARCHAR(255),
        secret_key VARCHAR(255),
        auth2fa VARCHAR(100),
        senha4 VARCHAR(10),
        senha6 VARCHAR(10),
        senha8 VARCHAR(10),
        chave2fa VARCHAR(100),
        ocupacao VARCHAR(100),
        renda NUMERIC(10, 2),
        endividamento VARCHAR(20),
        preco NUMERIC(10, 2),
        status VARCHAR(20) DEFAULT 'DISPONIVEL'
      )
    `);

    // Populando mock data se estiver vazio (apenas para facilitar testes da Etapa 2)
    const resCons = await client.query('SELECT COUNT(*) FROM consultaveis');
    if (parseInt(resCons.rows[0].count) === 0) {
        await client.query(`INSERT INTO consultaveis (bin, validade, cvv, limite, banco, pais, nome_incluso, cpf_incluso, preco, bandeira, nivel) VALUES 
        ('5447 3173 9139 2121', '05/2033', '***', 7244.19, 'Santander Way (APP)', 'BR', true, true, 80.00, 'MASTERCARD', 'BLACK'),
        ('4984 4112 0098 7654', '12/2028', '***', 15500.00, 'Itaú Personnalité', 'BR', true, true, 120.00, 'VISA', 'INFINITE'),
        ('5162 9234 1122 3344', '08/2029', '***', 4100.50, 'Nubank (APP)', 'BR', true, true, 60.00, 'MASTERCARD', 'GOLD')
        `);
    }

    const resLaras = await client.query('SELECT COUNT(*) FROM laras');
    if (parseInt(resLaras.rows[0].count) === 0) {
        await client.query(`INSERT INTO laras (tipo, titular, cpf, nascimento, status_conta, score, limite_diario, condicao, email, secret_key, auth2fa, senha4, senha6, senha8, chave2fa, ocupacao, renda, endividamento, preco) VALUES 
        ('Conta Validada PF', 'Gabriel ******* de Souza', '085.***.***-36', '**/**/****', 'ATIVO ✅', '647 (REGULAR)', 3000.00, 'Primeiro Acesso (VIRGEM)', '*****@protonmail.com', 'sk_live_v*****************************L0r', '✅ Ativada (SMS + App)', '****', '******', '********', '***-***-***-***-***-***', 'Analista de Estoque', 2600.00, '12%', 80.00),
        ('Conta Validada PF', 'Maria ****** da Silva', '123.***.***-89', '**/**/****', 'ATIVO ✅', '850 (ÓTIMO)', 10000.00, 'Primeiro Acesso (VIRGEM)', '*****@gmail.com', 'sk_live_v*****************************H2k', '✅ Ativada (App)', '****', '******', '********', '***-***-***-***-***-***', 'Gerente Comercial', 8500.00, '5%', 150.00),
        ('Conta Validada PF', 'João ****** Oliveira', '456.***.***-12', '**/**/****', 'ATIVO ✅', '420 (BAIXO)', 1000.00, 'Primeiro Acesso (VIRGEM)', '*****@outlook.com', 'sk_live_v*****************************K9m', '✅ Ativada (SMS)', '****', '******', '********', '***-***-***-***-***-***', 'Estudante', 1200.00, '30%', 45.00)
        `);
    }

    await client.query('COMMIT');
    console.log('📦 Banco de Dados inicializado com sucesso.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro ao inicializar DB:', e);
  } finally {
    client.release();
  }
}

async function getUser(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
}

async function createUser(id, nome) {
    const res = await pool.query(
        'INSERT INTO users (id, nome) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome RETURNING *',
        [id, nome]
    );
    return res.rows[0];
}

async function addSaldo(id, valor) {
    const res = await pool.query(
        'UPDATE users SET saldo = saldo + $1 WHERE id = $2 RETURNING *',
        [valor, id]
    );
    return res.rows[0];
}

async function getEstoque(tabela) {
    // tabela: 'consultaveis' ou 'laras'
    const res = await pool.query(`SELECT * FROM ${tabela} WHERE status = 'DISPONIVEL' ORDER BY id ASC`);
    return res.rows;
}

// Compra atômica para evitar overselling
async function comprarProduto(userId, tabela, produtoId, precoFinal) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Bloquear o usuário para leitura de saldo (evita múltiplas transações simultâneas esvaziando o saldo)
        const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
        const user = userRes.rows[0];

        if (!user || parseFloat(user.saldo) < precoFinal) {
            await client.query('ROLLBACK');
            return { success: false, message: 'Saldo insuficiente.' };
        }

        // 2. Tentar reservar o item
        const itemRes = await client.query(`SELECT * FROM ${tabela} WHERE id = $1 AND status = 'DISPONIVEL' FOR UPDATE`, [produtoId]);
        const item = itemRes.rows[0];

        if (!item) {
            await client.query('ROLLBACK');
            return { success: false, message: 'Produto esgotado ou já vendido. Tente o próximo da lista.' };
        }

        // 3. Efetivar a compra
        await client.query(`UPDATE ${tabela} SET status = 'VENDIDO' WHERE id = $1`, [produtoId]);
        
        // 4. Debitar saldo e atualizar estatísticas
        const isCard = tabela === 'consultaveis';
        await client.query(`
            UPDATE users 
            SET saldo = saldo - $1, 
                total_compras = total_compras + $1,
                cards_comprados = cards_comprados + $2
            WHERE id = $3
        `, [precoFinal, isCard ? 1 : 0, userId]);

        await client.query('COMMIT');
        return { success: true, item };

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Erro na compra atômica:', e);
        return { success: false, message: 'Erro interno durante a transação.' };
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    initDB,
    getUser,
    createUser,
    addSaldo,
    getEstoque,
    comprarProduto
};
