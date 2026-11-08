from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import usuarios, doacoes, agendamentos

# Inicialização automática das tabelas no PostgreSQL
Base.metadata.create_all(bind=engine)

# Instância da aplicação FastAPI
app = FastAPI(
    title="API - Plataforma de Doações e Agendamentos (PIE IV)",
    description="Back-end em FastAPI integrado com PostgreSQL para conectar Fornecedores e Instituições.",
    version="1.0.0"
)

# CONFIGURAÇÃO DE CORS
# Permite que o servidor Next.js (rodando em http://localhost:3000) faça requisições
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],  # Permite todos os headers padrão
)

# REGISTRO DAS ROTAS
app.include_router(usuarios.router)
app.include_router(doacoes.router)
app.include_router(agendamentos.router)



# ROTA INICIAL
@app.get("/", tags=["Health Check"])
def raiz():
    return {
        "status": "online",
        "mensagem": "API do Back-end está ativa e pronta para receber requisições do Next.js!",
        "documentacao": "/docs"
    }


@app.get("/api/health", tags=["Health Check"])
def checagem_saude():
    return {
        "status": "healthy"
    }
