from datetime import datetime
from typing import Literal, Optional, Any, List
from pydantic import BaseModel, ConfigDict, Field, field_validator


# SCHEMAS DE ENTRADA

class Usuario(BaseModel):
    nome_razao: str = Field(min_length=3, max_length=100)
    tipo_perfil: Literal["FORNECEDOR", "INSTITUICAO"]
    documento: str = Field(min_length=1, max_length=20)

    @field_validator("nome_razao")
    @classmethod
    def validar_nome(cls, valor: str):
        if not valor.strip():
            raise ValueError("O nome não pode ficar vazio")
        return valor.strip()


class Doacao(BaseModel):
    descricao: str = Field(min_length=1, max_length=255)
    id_fornecedor: int = Field(gt=0)


class Agendamento(BaseModel):
    id_doacao: int = Field(gt=0)
    id_instituicao: int = Field(gt=0)
    data_retirada: datetime


# SCHEMAS DE RESPOSTA DO BANCO DE DADOS

class UsuarioResponse(BaseModel):
    id_usuario: int
    nome_razao: str
    tipo_perfil: str
    documento: str

    model_config = ConfigDict(from_attributes=True)


class DoacaoResponse(BaseModel):
    id_doacao: int
    descricao: str
    id_fornecedor: int
    status: str

    model_config = ConfigDict(from_attributes=True)


class AgendamentoResponse(BaseModel):
    id_agendamento: int
    id_doacao: int
    id_instituicao: int
    data_retirada: datetime

    model_config = ConfigDict(from_attributes=True)


class AgendamentoDetalhadoResponse(BaseModel):
    id_agendamento: int
    id_doacao: int
    id_instituicao: int
    data_retirada: datetime
    descricao_doacao: Optional[str] = None
    status_doacao: Optional[str] = None
    nome_fornecedor: Optional[str] = None
    nome_instituicao: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Schema padrão para respostas envelopadas com mensagem (seguindo o padrão da colega)
class RespostaPadrao(BaseModel):
    mensagem: str
    dados: Any
