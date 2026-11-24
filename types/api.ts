export type UserRole = "FORNECEDOR" | "INSTITUICAO"
export type DonationStatus =
  "DISPONIVEL" | "RESERVADO" | "CONCLUIDO" | "CANCELADO"

export type TypeGuard<T> = (value: unknown) => value is T

export interface UsuarioRow {
  id_usuario: number
  nome_razao: string
  tipo_perfil: UserRole
  documento: string
}

export interface DoacaoRow {
  id_doacao: number
  descricao: string
  id_fornecedor: number
  status: DonationStatus
}

export interface AgendamentoRow {
  id_agendamento: number
  id_doacao: number
  id_instituicao: number
  data_retirada: string
}

export interface AgendamentoDetalhadoRow extends AgendamentoRow {
  descricao_doacao: string | null
  status_doacao: DonationStatus | null
  nome_fornecedor: string | null
  nome_instituicao: string | null
}

export interface CreateUsuarioBody {
  nome_razao: string
  tipo_perfil: UserRole
  documento: string
}

export interface CreateDoacaoBody {
  descricao: string
  id_fornecedor: number
}

export interface CreateAgendamentoBody {
  id_doacao: number
  id_instituicao: number
  data_retirada: string
}

export interface ApiEnvelope<TData> {
  mensagem: string
  dados: TData
}

export interface ValidationIssue {
  msg: string
}

export interface ApiError {
  detail: string | readonly ValidationIssue[]
}

export interface User {
  id: number
  name: string
  role: UserRole
  document: string
}

export interface Donation {
  id: number
  description: string
  supplierId: number
  status: DonationStatus
}

export interface Appointment {
  id: number
  donationId: number
  institutionId: number
  pickupDate: string
}

export interface AppointmentDetails extends Appointment {
  donationDescription: string | null
  donationStatus: DonationStatus | null
  supplierName: string | null
  institutionName: string | null
}

export interface CreateUserRequest {
  name: string
  role: UserRole
  document: string
}

export interface CreateDonationRequest {
  description: string
  supplierId: number
}

export interface CreateAppointmentRequest {
  donationId: number
  institutionId: number
  pickupDate: string
}

export interface ListDonationsOptions {
  onlyAvailable?: boolean
  signal?: AbortSignal
}
