export type UserRole = "FORNECEDOR" | "INSTITUICAO"
export type DonationStatus =
  "DISPONIVEL" | "RESERVADO" | "CONCLUIDO" | "CANCELADO"

export type TypeGuard<T> = (value: unknown) => value is T

// Wire shapes mirror the DDL columns. Columns without NOT NULL are nullable.

export interface UsuarioRow {
  id_usuario: number
  nome_razao: string
  tipo_perfil: UserRole | null
  documento: string
}

export interface DoacaoRow {
  id_doacao: number
  descricao: string
  id_fornecedor: number | null
  status: DonationStatus | null
}

export interface AgendamentoRow {
  id_agendamento: number
  id_doacao: number | null
  id_instituicao: number | null
  data_retirada: string
}

export interface DoacaoComFornecedorRow extends Omit<
  DoacaoRow,
  "id_fornecedor" | "status"
> {
  id_fornecedor: number
  status: DonationStatus
  nome_razao: string
}

export interface AgendamentoComDoacaoRow extends Omit<
  AgendamentoRow,
  "id_doacao" | "id_instituicao"
> {
  id_doacao: number
  id_instituicao: number
  descricao: string
  status: DonationStatus | null
  id_fornecedor: number
  nome_razao: string
}

export interface CreateUsuarioBody {
  nome_razao: string
  tipo_perfil: UserRole
  documento: string
}

export interface CreateDoacaoBody {
  descricao: string
}

export interface CreateAgendamentoBody {
  id_doacao: number
  data_retirada: string
}

export interface ApiResponse<TData> {
  code: number
  data: TData
}

export interface ApiError {
  code: number
  message: string
  field?: string
}

export type CreateUsuarioResponse = ApiResponse<UsuarioRow>
export type CreateDoacaoResponse = ApiResponse<DoacaoRow>
export type ListDoacoesResponse = ApiResponse<readonly DoacaoComFornecedorRow[]>
export type CreateAgendamentoResponse = ApiResponse<AgendamentoRow>
export type ListAgendamentosResponse = ApiResponse<
  readonly AgendamentoComDoacaoRow[]
>

export interface User {
  id: number
  name: string
  role: UserRole | null
  document: string
}

export interface Donation {
  id: number
  description: string
  supplierId: number | null
  status: DonationStatus | null
}

export interface Appointment {
  id: number
  donationId: number | null
  institutionId: number | null
  pickupDate: string
}

export interface DonationWithSupplier {
  id: number
  description: string
  status: DonationStatus
  supplier: {
    id: number
    name: string
  }
}

export interface AppointmentWithDonation {
  id: number
  institutionId: number
  pickupDate: string
  donation: {
    id: number
    description: string
    status: DonationStatus | null
    supplierId: number
  }
  counterpartName: string
}

export interface CreateUserRequest {
  name: string
  role: UserRole
  document: string
}

export interface CreateDonationRequest {
  description: string
}

export interface CreateAppointmentRequest {
  donationId: number
  pickupDate: string
}
