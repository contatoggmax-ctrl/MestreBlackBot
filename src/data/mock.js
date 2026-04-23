const consultaveis = [
  {
    id: 1,
    bin: '5447 3173 9139 2121',
    validade: '05/2033',
    cvv: '***',
    limite: '7.244,19',
    banco: 'Santander Way (APP)',
    pais: 'BR',
    nomeIncluso: true,
    cpfIncluso: true,
    preco: 80.00,
    bandeira: 'MASTERCARD',
    nivel: 'BLACK'
  },
  {
    id: 2,
    bin: '4984 4112 0098 7654',
    validade: '12/2028',
    cvv: '***',
    limite: '15.500,00',
    banco: 'Itaú Personnalité',
    pais: 'BR',
    nomeIncluso: true,
    cpfIncluso: true,
    preco: 120.00,
    bandeira: 'VISA',
    nivel: 'INFINITE'
  },
  {
    id: 3,
    bin: '5162 9234 1122 3344',
    validade: '08/2029',
    cvv: '***',
    limite: '4.100,50',
    banco: 'Nubank (APP)',
    pais: 'BR',
    nomeIncluso: true,
    cpfIncluso: true,
    preco: 60.00,
    bandeira: 'MASTERCARD',
    nivel: 'GOLD'
  }
];

const laras = [
  {
    id: 1,
    tipo: 'Conta Validada PF',
    titular: 'Gabriel ******* de Souza',
    cpf: '085.***.***-36',
    nascimento: '**/**/****',
    status: 'ATIVO ✅',
    score: '647 (REGULAR)',
    limiteDiario: '3.000,00',
    condicao: 'Primeiro Acesso (VIRGEM)',
    email: '*****@protonmail.com',
    secretKey: 'sk_live_v*****************************L0r',
    auth2fa: '✅ Ativada (SMS + App)',
    senha4: '****',
    senha6: '******',
    senha8: '********',
    chave2fa: '***-***-***-***-***-***',
    ocupacao: 'Analista de Estoque',
    renda: '2.600,00',
    endividamento: '12%',
    preco: 80.00
  },
  {
    id: 2,
    tipo: 'Conta Validada PF',
    titular: 'Maria ****** da Silva',
    cpf: '123.***.***-89',
    nascimento: '**/**/****',
    status: 'ATIVO ✅',
    score: '850 (ÓTIMO)',
    limiteDiario: '10.000,00',
    condicao: 'Primeiro Acesso (VIRGEM)',
    email: '*****@gmail.com',
    secretKey: 'sk_live_v*****************************H2k',
    auth2fa: '✅ Ativada (App)',
    senha4: '****',
    senha6: '******',
    senha8: '********',
    chave2fa: '***-***-***-***-***-***',
    ocupacao: 'Gerente Comercial',
    renda: '8.500,00',
    endividamento: '5%',
    preco: 150.00
  },
  {
    id: 3,
    tipo: 'Conta Validada PF',
    titular: 'João ****** Oliveira',
    cpf: '456.***.***-12',
    nascimento: '**/**/****',
    status: 'ATIVO ✅',
    score: '420 (BAIXO)',
    limiteDiario: '1.000,00',
    condicao: 'Primeiro Acesso (VIRGEM)',
    email: '*****@outlook.com',
    secretKey: 'sk_live_v*****************************K9m',
    auth2fa: '✅ Ativada (SMS)',
    senha4: '****',
    senha6: '******',
    senha8: '********',
    chave2fa: '***-***-***-***-***-***',
    ocupacao: 'Estudante',
    renda: '1.200,00',
    endividamento: '30%',
    preco: 45.00
  }
];

// Mock do usuário
const usersDb = new Map();

function getUser(id) {
    if (!usersDb.has(id)) {
        usersDb.set(id, { id, saldo: 0, total_compras: 0, cards_comprados: 0, gifts_resgatados: 0, nome: 'Usuário' });
    }
    return usersDb.get(id);
}

function updateUser(id, data) {
    const user = getUser(id);
    usersDb.set(id, { ...user, ...data });
    return usersDb.get(id);
}

module.exports = {
  consultaveis,
  laras,
  getUser,
  updateUser
};
