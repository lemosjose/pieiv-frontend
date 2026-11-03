import type { AxiosResponse } from "axios"

import {
  api,
  isArrayOf,
  isIsoDate,
  isNullableNumber,
  isRecord,
  parseApiResponse,
} from "@/lib/api"
import { isDonationStatus } from "@/services/doacoes"
import type {
  AgendamentoComDoacaoRow,
  AgendamentoRow,
  Appointment,
  AppointmentWithDonation,
  CreateAgendamentoBody,
  CreateAgendamentoResponse,
  CreateAppointmentRequest,
  ListAgendamentosResponse,
} from "@/types/api"

function isAgendamentoRow(value: unknown): value is AgendamentoRow {
  return (
    isRecord(value) &&
    typeof value.id_agendamento === "number" &&
    isNullableNumber(value.id_doacao) &&
    isNullableNumber(value.id_instituicao) &&
    isIsoDate(value.data_retirada)
  )
}

function isAgendamentoComDoacaoRow(
  value: unknown
): value is AgendamentoComDoacaoRow {
  return (
    isRecord(value) &&
    typeof value.id_agendamento === "number" &&
    typeof value.id_doacao === "number" &&
    typeof value.id_instituicao === "number" &&
    isIsoDate(value.data_retirada) &&
    typeof value.descricao === "string" &&
    (value.status === null || isDonationStatus(value.status)) &&
    typeof value.id_fornecedor === "number" &&
    typeof value.nome_razao === "string"
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

function toAppointmentWithDonation(
  row: AgendamentoComDoacaoRow
): AppointmentWithDonation {
  return {
    id: row.id_agendamento,
    institutionId: row.id_instituicao,
    pickupDate: row.data_retirada,
    donation: {
      id: row.id_doacao,
      description: row.descricao,
      status: row.status,
      supplierId: row.id_fornecedor,
    },
    counterpartName: row.nome_razao,
  }
}

export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<Appointment> {
  const body: CreateAgendamentoBody = {
    id_doacao: request.donationId,
    data_retirada: request.pickupDate,
  }

  const { data } = await api.post<
    unknown,
    AxiosResponse<unknown>,
    CreateAgendamentoBody
  >("/api/agendamentos", body)

  const response: CreateAgendamentoResponse = parseApiResponse(
    data,
    isAgendamentoRow
  )
  return toAppointment(response.data)
}

export async function listAppointmentsByUser(
  userId: number,
  signal?: AbortSignal
): Promise<readonly AppointmentWithDonation[]> {
  const { data } = await api.get<unknown>(`/api/agendamentos/${userId}`, {
    signal,
  })

  const response: ListAgendamentosResponse = parseApiResponse(
    data,
    isArrayOf(isAgendamentoComDoacaoRow)
  )
  return response.data.map(toAppointmentWithDonation)
}
