from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from database import Base


# MODELO: Usuários (Implementado)
class Usuario(Base):
    """
    Representação da tabela 'Usuarios' criada no banco de dados:
    - id_usuario: Identificador sequencial primário
    - nome_razao: Nome completo ou Razão Social
    - tipo_perfil: Papel do usuário ('FORNECEDOR' ou 'INSTITUICAO')
    - documento: CPF ou CNPJ único
    """
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nome_razao = Column(String(100), nullable=False)
    tipo_perfil = Column(String(20), nullable=False)
    documento = Column(String(20), unique=True, nullable=False, index=True)

    #Restrição de integridade para permitir apenas os dois tipos de perfil
    __table_args__ = (
        CheckConstraint(
            "tipo_perfil IN ('FORNECEDOR', 'INSTITUICAO')",
            name="check_tipo_perfil"
        ),
    )

    #Relacionamentos
    doacoes = relationship("Doacao", back_populates="fornecedor")
    agendamentos = relationship("Agendamento", back_populates="instituicao")

#MODELO: Doações

class Doacao(Base):
    """
    Representação da tabela 'Doacoes' criada no banco de dados:
    - id_doacao: Identificador primário da doação
    - descricao: Detalhes do item a ser doado
    - id_fornecedor: Chave estrangeira ligada ao usuário fornecedor
    - status: Situação da doação ('DISPONIVEL', 'RESERVADO', etc.)
    """
    __tablename__ = "doacoes"

    id_doacao = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    id_fornecedor = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    status = Column(String(20), default="DISPONIVEL", nullable=False)

    # Relacionamentos
    fornecedor = relationship("Usuario", back_populates="doacoes")
    agendamento = relationship("Agendamento", back_populates="doacao", uselist=False)

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id_agendamento = Column(Integer, primary_key=True, index=True)
    id_doacao = Column(Integer, ForeignKey("doacoes.id_doacao"), nullable=False)
    id_instituicao = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    data_retirada = Column(DateTime, nullable=False)

    doacao = relationship("Doacao", back_populates="agendamento")
    instituicao = relationship("Usuario", back_populates="agendamentos")
