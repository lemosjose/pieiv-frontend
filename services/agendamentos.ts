import type { AxiosResponse } from "axios"

import {
  api,
  isArrayOf,
  isIsoDate,
  isNullableString,
  isRecord,
  parseBody,
  parseEnvelope,
} from "@/lib/api"
import { isDonationStatus } from "@/services/doacoes"
import type {
  AgendamentoDetalhadoRow,
  AgendamentoRow,
  Appointment,
  AppointmentDetails,
  CreateAgendamentoBody,
  CreateAppointmentRequest,
} from "@/types/api"

function isAgendamentoRow(value: unknown): value is AgendamentoRow {
  return (
    isRecord(value) &&
    typeof value.id_agendamento === "number" &&
    typeof value.id_doacao === "number" &&
    typeof value.id_instituicao === "number" &&
    isIsoDate(value.data_retirada)
  )
}

function isAgendamentoDetalhadoRow(
  value: unknown
): value is AgendamentoDetalhadoRow {
  return (
    isAgendamentoRow(value) &&
    isRecord(value) &&
    isNullableString(value.descricao_doacao) &&
    (value.status_doacao === null || isDonationStatus(value.status_doacao)) &&
    isNullableString(value.nome_fornecedor) &&
    isNullableString(value.nome_instituicao)
  )
}

function toAppointment(row: AgendamentoRow): Appointment {
  return {
    id: row.id_agendamento,
    donationId: row.id_doacao,
    institutionId: row.id_instituicao,
    pickupDate: row.data_retirada,
  }
}

function toAppointmentDetails(
  row: AgendamentoDetalhadoRow
): AppointmentDetails {
  return {
    ...toAppointment(row),
    donationDescription: row.descricao_doacao,
    donationStatus: row.status_doacao,
    supplierName: row.nome_fornecedor,
    institutionName: row.nome_instituicao,
  }
}

export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<Appointment> {
  const body: CreateAgendamentoBody = {
    id_doacao: request.donationId,
    id_instituicao: request.institutionId,
    data_retirada: request.pickupDate,
  }

  const { data } = await api.post<
    unknown,
    AxiosResponse<unknown>,
    CreateAgendamentoBody
  >("/api/agendamentos", body)

  return toAppointment(parseEnvelope(data, isAgendamentoRow))
}

export async function listAppointments(
  signal?: AbortSignal
): Promise<readonly Appointment[]> {
  const { data } = await api.get<unknown>("/api/agendamentos", { signal })

  return parseBody(data, isArrayOf(isAgendamentoRow)).map(toAppointment)
}

export async function listAppointmentsByUser(
  userId: number,
  signal?: AbortSignal
): Promise<readonly AppointmentDetails[]> {
  const { data } = await api.get<unknown>(`/api/agendamentos/${userId}`, {
    signal,
  })

  return parseBody(data, isArrayOf(isAgendamentoDetalhadoRow)).map(
    toAppointmentDetails
  )
}
