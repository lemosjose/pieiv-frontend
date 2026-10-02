import { api } from "@/lib/api"
import type {
  CreateDonationRequest,
  CreateDonationResponse,
  Donation,
  DonationWithSupplier,
  ListDonationsResponse,
} from "@/types/api"

export async function createDonation(
  payload: CreateDonationRequest
): Promise<Donation> {
  const { data } = await api.post<CreateDonationResponse>("/api/doacoes", {
    ...payload,
    description: payload.description.trim(),
    pickupAddress: payload.pickupAddress.trim(),
  })

  return data.data
}

export async function listAvailableDonations(
  signal?: AbortSignal
): Promise<DonationWithSupplier[]> {
  const { data } = await api.get<ListDonationsResponse>("/api/doacoes", {
    signal,
  })

  return data.data
}
