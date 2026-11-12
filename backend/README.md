# Back-end FastAPI - Plataforma de doações (PIE IV)

Este repositório contém a API REST desenvolvida em **FastAPI** e **SQLAlchemy**, integrada ao banco de dados **PostgreSQL**, estruturada para alimentar a interface em **Next.js**.

---

## Estrutura de arquivos

```text
backend/
├── main.py              # Ponto de inicialização do FastAPI, CORS e inclusão de rotas
├── database.py          # Conexão com o PostgreSQL e injeção de dependência de sessão
├── models.py            # Modelos relacionais do SQLAlchemy (Usuarios, Doacoes, Agendamentos)
├── schemas.py           # Validações de entrada Pydantic e modelos de resposta
├── routers/
│   ├── __init__.py
│   ├── usuarios.py      # POST /api/usuarios, GET /api/usuarios e busca por ID
│   ├── doacoes.py       # POST e GET /api/doacoes (filtro de disponíveis)
│   └── agendamentos.py  # POST (Transação SQL) e GET /api/agendamentos/{id_usuario} (JOIN)
├── requirements.txt     # Dependências do Python
└── .env.example         # Exemplo de variáveis de ambiente do banco
```

---

## Como instalar e rodar o projeto

### 1. Criar e ativar o ambiente virtual (venv)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # No Linux/macOS
# ou venv\Scripts\activate no Windows
```

### 2. Instalar as dependências
```bash
pip install -r requirements.txt
```

### 3. Configurar o Banco de Dados
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Ajuste a variável `DATABASE_URL` com as suas credenciais do PostgreSQL:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/nome_do_banco
```

### 4. Executar a Aplicação
```bash
uvicorn main:app --reload --port 8000
```
- A documentação interativa Swagger estará disponível em: **http://localhost:8000/docs**
- O front-end Next.js rodando em **http://localhost:3000** já possui permissão de acesso via CORS.

---

## Resumo das rotas e regras de negócio

| Método | Endpoint | Descrição / Regra de Negócio |
| :--- | :--- | :--- |
| `POST` | `/api/usuarios` | Valida dados e verifica duplicidade de documento (`documento UNIQUE`), retornando `HTTP 409 Conflict` se já existir. Salva no PostgreSQL. |
| `GET` | `/api/usuarios` | Lista todos os usuários cadastrados no banco de dados. |
| `GET` | `/api/usuarios/{id_usuario}` | Consulta um usuário específico pelo ID. Retorna `HTTP 404` se não existir. |
| `POST` | `/api/doacoes` | Valida se o fornecedor existe e tem perfil `FORNECEDOR`. Cria o item com status inicial `DISPONIVEL`. |
| `GET` | `/api/doacoes` | Retorna as doações com filtro padrão `status = 'DISPONIVEL'` para exibição no painel de retirada. |
| `POST` | `/api/agendamentos` | **Transação SQL ACID**: Valida instituição e se a doação está `DISPONIVEL`. Insere o agendamento e atualiza a doação para `RESERVADO`. Executa `commit` ou `rollback` em caso de erro. |
| `GET` | `/api/agendamentos` | Lista geral de todos os agendamentos registrados. |
| `GET` | `/api/agendamentos/{id_usuario}` | Realiza `JOIN` condicional: lista reservas ativas se o usuário for `INSTITUICAO` ou coletas agendadas se for `FORNECEDOR`. |
