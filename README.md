> ⚠️ **Status do Projeto:** Em desenvolvimento (atualmente rodando apenas localmente).

# 💸 EZSaldo • CRUD Financeiro

O **EZSaldo** é um sistema financeiro minimalista desenvolvido para ajudar o usuário a ter controle total sobre seu dinheiro. Com ele, é possível cadastrar contas, gerenciar transações (receitas e despesas), visualizar o saldo atualizado em tempo real e acompanhar o histórico detalhado de movimentações.

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* HTML5, CSS3 e JavaScript
* Design responsivo com feedback visual (Loaders e transições)

**Backend:**
* Node.js com Express
* MongoDB (Banco de Dados NoSQL)
* JWT (JSON Web Tokens para Autenticação)

---

## 🚀 Funcionalidades

* 🔐 **Autenticação:** Cadastro e login de usuários com senha criptografada e JWT.
* ➕ **Gestão de Transações:** Adição de receitas e despesas.
* ✏️ **Controle Total:** Edição e exclusão de transações já cadastradas.
* 📜 **Histórico:** Visualização do histórico completo de movimentações.
* 💰 **Dashboard Dinâmico:** Saldo atualizado em tempo real com diferenciação visual de cores (saldo positivo/negativo).
* 🎨 **Experiência do Usuário (UX):** Confirmação visual para ações críticas (como exclusão e logout) e loaders durante as transições.

---

## 🖥 Estrutura do Projeto

```text
crud-financeiro-ezsaldo/
├─ backend/
│  ├─ src/
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  └─ Transaction.js
│  │  ├─ routes/
│  │  │  ├─ authRoutes.js
│  │  │  └─ transactionRoutes.js
│  │  └─ server.js
│  ├─ package.json
│  └─ .env
│
├─ frontend/
│  ├─ login.html
│  ├─ register.html
│  ├─ dashboard.html
│  ├─ style.css
│  ├─ auth.js
│  └─ dashboard.js
│
└─ README.md
```

---

## ⚙️ Como executar localmente

### 1. Clone o repositório
Abra o seu terminal e rode os comandos abaixo para baixar o projeto:
```bash
git clone https://github.com/kiellzz/crud-financeiro-ezsaldo.git
cd crud-financeiro-ezsaldo
```

### 2. Configurando o Backend
Navegue até a pasta do backend e instale as dependências necessárias:
```bash
cd backend
npm install
```

Configure as variáveis de ambiente:
1. Renomeie o arquivo `.env.example` para `.env`.
2. Adicione a sua string de conexão do cluster do **MongoDB** e sua chave JWT no arquivo `.env`.

Inicie o servidor:
```bash
npm start 
# ou node src/server.js (dependendo da configuração do seu package.json)
```
> 📍 O backend ficará disponível em: `http://localhost:5000/`

### 3. Rodando o Frontend
Como o frontend é feito com HTML, CSS e JS puros, você não precisa instalar dependências para ele. Basta:
* Dar um clique duplo no arquivo `login.html` para abri-lo direto no navegador.
* **Ou** utilizar a extensão *Live Server* do VS Code na pasta `frontend` para uma melhor experiência de desenvolvimento.
