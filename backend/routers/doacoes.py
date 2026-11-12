from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/doacoes",
    tags=["Doações"]
)


# POST /api/doacoes: Cadastro de Doação no PostgreSQL
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar uma nova doação vinculada a um fornecedor"
)
def cadastrar_doacao(
    doacao: schemas.Doacao,
    db: Session = Depends(get_db)
):
    """
    Cadastra uma nova doação no sistema com status inicial 'DISPONIVEL'.
    Valida se o fornecedor existe no banco e se possui o perfil 'FORNECEDOR'.
    """
    # 1. Verifica se o fornecedor existe no PostgreSQL
    fornecedor = db.query(models.Usuario).filter(
        models.Usuario.id_usuario == doacao.id_fornecedor
    ).first()

    if fornecedor is None or fornecedor.tipo_perfil != "FORNECEDOR":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fornecedor não encontrado ou perfil incompatível (deve ser FORNECEDOR)."
        )

    # 2. Cria a nova doação com status inicial 'DISPONIVEL' conforme o roteiro
    nova_doacao = models.Doacao(
        descricao=doacao.descricao,
        id_fornecedor=doacao.id_fornecedor,
        status="DISPONIVEL"
    )

    db.add(nova_doacao)
    db.commit()
    db.refresh(nova_doacao)

    return {
        "mensagem": "Doação cadastrada com sucesso!",
        "dados": schemas.DoacaoResponse.model_validate(nova_doacao)
    }


# GET /api/doacoes: Listagem de Doações com Filtro 'DISPONIVEL'
@router.get(
    "",
    response_model=List[schemas.DoacaoResponse],
    summary="Listar doações disponíveis para retirada"
)
def listar_doacoes(
    apenas_disponiveis: bool = True,
    db: Session = Depends(get_db)
):
    """
    Conforme o roteiro:
    Executa a query 'SELECT * FROM Doacoes WHERE status = 'DISPONIVEL'' para garantir
    que o front-end renderize no painel apenas os itens aguardando retirada.
    Se o parâmetro 'apenas_disponiveis=False' for passado, retorna todo o histórico.
    """
    query = db.query(models.Doacao)

    if apenas_disponiveis:
        query = query.filter(models.Doacao.status == "DISPONIVEL")

    doacoes = query.all()
    return doacoes


# GET /api/doacoes/{id_doacao}: Buscar doação por ID
@router.get(
    "/{id_doacao}",
    response_model=schemas.DoacaoResponse,
    summary="Buscar doação pelo ID"
)
def buscar_doacao(id_doacao: int, db: Session = Depends(get_db)):
    """
    Busca os detalhes de uma doação específica pelo seu identificador.
    """
    doacao = db.query(models.Doacao).filter(models.Doacao.id_doacao == id_doacao).first()
    if not doacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doação não encontrada."
        )
    return doacao
