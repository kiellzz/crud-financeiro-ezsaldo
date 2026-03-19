Projeto CRUD em andamento (apenas rodando localmente, por enquanto)

# EZSaldo • CRUD Financeiro

EZSaldo é um **sistema financeiro minimalista**, que permite ao usuário **cadastrar contas, adicionar, editar e remover transações**, visualizar saldo atualizado e histórico de gastos/receitas.  

O projeto é dividido em **frontend** (HTML/CSS/JS) e **backend** (Node.js, Express, MongoDB, JWT).

---

## 🚀 Funcionalidades

- Cadastro e login de usuários (com senha criptografada)
- Adição de transações de receita e despesa
- Edição e exclusão de transações
- Histórico de transações
- Saldo atualizado em tempo real
- Diferenciação de saldo positivo/negativo com cores
- Confirmação visual de logout e exclusão
- Loader em transições e ações para melhor UX

---

## 🖥 Estrutura do Projeto
crud-financeiro/
├─ backend/
│ ├─ src/
│ │ ├─ models/
│ │ │ └─ User.js
│ │ │ └─ Transaction.js
│ │ ├─ routes/
│ │ │ └─ authRoutes.js
│ │ │ └─ transactionRoutes.js
│ │ └─ server.js
│ ├─ package.json
│ └─ .env
├─ frontend/
│ ├─ login.html
│ ├─ register.html
│ ├─ dashboard.html
│ ├─ style.css
│ └─ auth.js
│ └─ dashboard.js
└─ README.md


---

## ⚙️ Instalação

Clone o repositório:

git clone https://github.com/kiellzz/crud-financeiro-ezsaldo.git
cd crud-financeiro-ezsaldo
cd backend
npm install

O backend ficará disponível em: http://localhost:5000/
