import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Carrega variáveis do arquivo .env caso exista
load_dotenv()

# URL de conexão com o PostgreSQL
# Formato padrão: postgresql://usuario:senha@host:porta/nome_banco
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pieiv_db"
)

# Cria a engine do SQLAlchemy para comunicação com o PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=True 
)

# Cria a fábrica de sessões do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para os modelos declarativos
Base = declarative_base()


# Função geradora de sessão utilizada como Dependency Injection nas rotas do FastAPI
def get_db():
    """
    Fornece uma sessão transacional do banco de dados para cada requisição HTTP.
    Garante o encerramento da conexão ao término da requisição.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
