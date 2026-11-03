import type { AxiosResponse } from "axios"

import {
  api,
  isArrayOf,
  isNullableNumber,
  isRecord,
  parseApiResponse,
} from "@/lib/api"
import type {
  CreateDoacaoBody,
  CreateDoacaoResponse,
  CreateDonationRequest,
  DoacaoComFornecedorRow,
  DoacaoRow,
  Donation,
  DonationStatus,
  DonationWithSupplier,
  ListDoacoesResponse,
} from "@/types/api"

const donationStatuses: readonly DonationStatus[] = [
  "DISPONIVEL",
  "RESERVADO",
  "CONCLUIDO",
  "CANCELADO",
]

export function isDonationStatus(value: unknown): value is DonationStatus {
  return donationStatuses.some((status) => status === value)
}

function isDoacaoRow(value: unknown): value is DoacaoRow {
  return (
    isRecord(value) &&
    typeof value.id_doacao === "number" &&
    typeof value.descricao === "string" &&
    isNullableNumber(value.id_fornecedor) &&
    (value.status === null || isDonationStatus(value.status))
  )
}

function isDoacaoComFornecedorRow(
  value: unknown
): value is DoacaoComFornecedorRow {
  return (
    isRecord(value) &&
    typeof value.id_doacao === "number" &&
    typeof value.descricao === "string" &&
    typeof value.id_fornecedor === "number" &&
    isDonationStatus(value.status) &&
    typeof value.nome_razao === "string"
  )
}

function toDonation(row: DoacaoRow): Donation {
  return {
    id: row.id_doacao,
    description: row.descricao,
    supplierId: row.id_fornecedor,
    status: row.status,
  }
}

function toDonationWithSupplier(
  row: DoacaoComFornecedorRow
): DonationWithSupplier {
  return {
    id: row.id_doacao,
    description: row.descricao,
    status: row.status,
    supplier: { id: row.id_fornecedor, name: row.nome_razao },
  }
}

export async function createDonation(
  request: CreateDonationRequest
): Promise<Donation> {
  const body: CreateDoacaoBody = { descricao: request.description.trim() }

  const { data } = await api.post<
    unknown,
    AxiosResponse<unknown>,
    CreateDoacaoBody
  >("/api/doacoes", body)

  const response: CreateDoacaoResponse = parseApiResponse(data, isDoacaoRow)
  return toDonation(response.data)
}

export async function listAvailableDonations(
  signal?: AbortSignal
): Promise<readonly DonationWithSupplier[]> {
  const { data } = await api.get<unknown>("/api/doacoes", { signal })

  const response: ListDoacoesResponse = parseApiResponse(
    data,
    isArrayOf(isDoacaoComFornecedorRow)
  )
  return response.data.map(toDonationWithSupplier)
}
