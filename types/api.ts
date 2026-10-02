export type UserRole = "FORNECEDOR" | "INSTITUICAO"
export type DocumentType = "CPF" | "CNPJ"
export type DonationStatus =
  "DISPONIVEL" | "RESERVADO" | "CONCLUIDO" | "CANCELADO"
export type AppointmentStatus = "ATIVO" | "CONCLUIDO" | "CANCELADO"

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  document: string
  documentType: DocumentType
  createdAt: string
}

export type Donation = {
  id: number
  description: string
  quantity: number
  unit: string
  expiresAt: string
  pickupAddress: string
  userId: number
  status: DonationStatus
  createdAt: string
}

export type Appointment = {
  id: number
  donationId: number
  userId: number
  takenDate: string
  status: AppointmentStatus
  createdAt: string
}

export type ApiResponse<TData> = {
  code: number
  data: TData
}

export type ApiError = {
  code: number
  message: string
  field?: string
}

export type CreateUserRequest = {
  name: string
  email: string
  password: string
  role: UserRole
  document: string
}

export type CreateDonationRequest = {
  description: string
  quantity: number
  unit: string
  expiresAt: string
  pickupAddress: string
}

export type CreateAppointmentRequest = {
  donationId: number
  takenDate: string
}

export type DonationWithSupplier = Donation & {
  supplier: Pick<User, "id" | "name">
}

export type AppointmentWithDonation = Appointment & {
  donation: Pick<
    Donation,
    "id" | "description" | "quantity" | "unit" | "pickupAddress" | "status"
  >
  counterpart: Pick<User, "id" | "name">
}

export type CreateUserResponse = ApiResponse<User>
export type CreateDonationResponse = ApiResponse<Donation>
export type ListDonationsResponse = ApiResponse<DonationWithSupplier[]>
export type CreateAppointmentResponse = ApiResponse<Appointment>
export type ListAppointmentsResponse = ApiResponse<AppointmentWithDonation[]>
