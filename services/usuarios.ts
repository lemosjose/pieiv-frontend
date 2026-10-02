import { api } from "@/lib/api"
import type { CreateUserRequest, CreateUserResponse, User } from "@/types/api"

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  const { data } = await api.post<CreateUserResponse>("/api/usuarios", {
    ...payload,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    document: onlyDigits(payload.document),
  })

  return data.data
}
