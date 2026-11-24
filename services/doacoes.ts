import type { AxiosResponse } from "axios"

import { api, isArrayOf, isRecord, parseBody, parseEnvelope } from "@/lib/api"
import type {
  CreateDoacaoBody,
  CreateDonationRequest,
  DoacaoRow,
  Donation,
  DonationStatus,
  ListDonationsOptions,
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
    typeof value.id_fornecedor === "number" &&
    isDonationStatus(value.status)
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

export async function createDonation(
  request: CreateDonationRequest
): Promise<Donation> {
  const body: CreateDoacaoBody = {
    descricao: request.description.trim(),
    id_fornecedor: request.supplierId,
  }

  const { data } = await api.post<
    unknown,
    AxiosResponse<unknown>,
    CreateDoacaoBody
  >("/api/doacoes", body)

  return toDonation(parseEnvelope(data, isDoacaoRow))
}

export async function listDonations({
  onlyAvailable = true,
  signal,
}: ListDonationsOptions = {}): Promise<readonly Donation[]> {
  const { data } = await api.get<unknown>("/api/doacoes", {
    params: { apenas_disponiveis: onlyAvailable },
    signal,
  })

  return parseBody(data, isArrayOf(isDoacaoRow)).map(toDonation)
}

export async function getDonation(
  id: number,
  signal?: AbortSignal
): Promise<Donation> {
  const { data } = await api.get<unknown>(`/api/doacoes/${id}`, { signal })

  return toDonation(parseBody(data, isDoacaoRow))
}
