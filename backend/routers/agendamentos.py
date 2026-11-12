from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/agendamentos",
    tags=["Agendamentos"]
)


# ==============================================================================
# POST /api/agendamentos: Criação com Controle de Transação SQL (Commit/Rollback)
# ==============================================================================
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo agendamento com controle de transação (Inserção + UPDATE)"
)
def cadastrar_agendamento(
    agendamento: schemas.Agendamento,
    db: Session = Depends(get_db)
):
    """
    Operação crítica com controle de transação ACID no PostgreSQL:
    1. Valida se a instituição existe e possui tipo_perfil 'INSTITUICAO'.
    2. Valida se a doação existe e se ainda está 'DISPONIVEL'.
    3. Inicia a transação:
       - Insere o registro em Agendamentos.
       - Atualiza o status da doação para 'RESERVADO'.
    4. Se ambas as operações funcionarem: executa db.commit().
    5. Se ocorrer qualquer falha: executa db.rollback() para preservar a integridade.
    """
    # 1. Validação da instituição (mantendo a lógica da sua colega com consulta ao PostgreSQL)
    instituicao = db.query(models.Usuario).filter(
        models.Usuario.id_usuario == agendamento.id_instituicao
    ).first()

    if instituicao is None or instituicao.tipo_perfil != "INSTITUICAO":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instituição não encontrada ou perfil incompatível (deve ser INSTITUICAO)."
        )

    # 2. Validação da doação
    doacao = db.query(models.Doacao).filter(
        models.Doacao.id_doacao == agendamento.id_doacao
    ).first()

    if doacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doação não encontrada."
        )

    if doacao.status != "DISPONIVEL":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Doação não está disponível para agendamento (Status atual: {doacao.status})."
        )

    # 3. Bloco de Transação SQL com integridade garantida
    try:
        # Ação A: Inserção do novo agendamento
        novo_agendamento = models.Agendamento(
            id_doacao=agendamento.id_doacao,
            id_instituicao=agendamento.id_instituicao,
            data_retirada=agendamento.data_retirada
        )
        db.add(novo_agendamento)

        # Ação B: Atualização simultânea do status da doação para RESERVADO
        doacao.status = "RESERVADO"

        # Commit de ambas as operações juntas
        db.commit()
        db.refresh(novo_agendamento)

        return {
            "mensagem": "Agendamento realizado com sucesso!",
            "dados": schemas.AgendamentoResponse.model_validate(novo_agendamento)
        }

    except Exception as exc:
        # Em caso de qualquer erro em qualquer uma das ações, desfaz a transação
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na transação do agendamento. Operação desfeita com rollback: {str(exc)}"
        )


# ==============================================================================
# GET /api/agendamentos: Listar todos os agendamentos (Rota original da colega)
# ==============================================================================
@router.get(
    "",
    response_model=List[schemas.AgendamentoResponse],
    summary="Listar todos os agendamentos gerais"
)
def listar_agendamentos(db: Session = Depends(get_db)):
    """
    Retorna a lista completa de todos os agendamentos do sistema.
    """
    agendamentos = db.query(models.Agendamento).all()
    return agendamentos


# ==============================================================================
# GET /api/agendamentos/{id_usuario}: Histórico com JOIN dependendo do Perfil
# ==============================================================================
@router.get(
    "/{id_usuario}",
    response_model=List[schemas.AgendamentoDetalhadoResponse],
    summary="Histórico de agendamentos com JOIN baseado no perfil do usuário"
)
def listar_agendamentos_usuario(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    """
    Conforme o roteiro:
    Utiliza o parâmetro de rota id_usuario para realizar JOIN entre as tabelas:
    - Se o usuário for INSTITUICAO: lista o histórico de reservas ativas feitas por ela.
    - Se o usuário for FORNECEDOR: lista as coletas pendentes agendadas para as doações dele.
    """
    # 1. Busca o usuário para identificar o perfil
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # 2. Executa a query relacional com JOIN entre Agendamentos, Doações e Usuários
    if usuario.tipo_perfil == "INSTITUICAO":
        # Reservas ativas da instituição solicitante
        resultados = (
            db.query(models.Agendamento, models.Doacao, models.Usuario)
            .join(models.Doacao, models.Agendamento.id_doacao == models.Doacao.id_doacao)
            .join(models.Usuario, models.Doacao.id_fornecedor == models.Usuario.id_usuario)
            .filter(models.Agendamento.id_instituicao == id_usuario)
            .all()
        )

        return [
            schemas.AgendamentoDetalhadoResponse(
                id_agendamento=ag.id_agendamento,
                id_doacao=ag.id_doacao,
                id_instituicao=ag.id_instituicao,
                data_retirada=ag.data_retirada,
                descricao_doacao=doa.descricao,
                status_doacao=doa.status,
                nome_fornecedor=usr.nome_razao,
                nome_instituicao=usuario.nome_razao
            )
            for ag, doa, usr in resultados
        ]

    else:
        # Perfil FORNECEDOR: Coletas agendadas para doações deste fornecedor
        resultados = (
            db.query(models.Agendamento, models.Doacao, models.Usuario)
            .join(models.Doacao, models.Agendamento.id_doacao == models.Doacao.id_doacao)
            .join(models.Usuario, models.Agendamento.id_instituicao == models.Usuario.id_usuario)
            .filter(models.Doacao.id_fornecedor == id_usuario)
            .all()
        )

        return [
            schemas.AgendamentoDetalhadoResponse(
                id_agendamento=ag.id_agendamento,
                id_doacao=ag.id_doacao,
                id_instituicao=ag.id_instituicao,
                data_retirada=ag.data_retirada,
                descricao_doacao=doa.descricao,
                status_doacao=doa.status,
                nome_fornecedor=usuario.nome_razao,
                nome_instituicao=usr.nome_razao
            )
            for ag, doa, usr in resultados
        ]
