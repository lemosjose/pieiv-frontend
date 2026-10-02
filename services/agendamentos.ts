import { api } from "@/lib/api"
import type {
  Appointment,
  AppointmentWithDonation,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  ListAppointmentsResponse,
} from "@/types/api"

export async function createAppointment(
  payload: CreateAppointmentRequest
): Promise<Appointment> {
  const { data } = await api.post<CreateAppointmentResponse>(
    "/api/agendamentos",
    payload
  )

  return data.data
}

export async function listAppointmentsByUser(
  userId: number,
  signal?: AbortSignal
): Promise<AppointmentWithDonation[]> {
  const { data } = await api.get<ListAppointmentsResponse>(
    `/api/agendamentos/${userId}`,
    { signal }
  )

  return data.data
}
