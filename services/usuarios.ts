import type { AxiosResponse } from "axios"

import { api, isRecord, parseApiResponse } from "@/lib/api"
import type {
  CreateUserRequest,
  CreateUsuarioBody,
  CreateUsuarioResponse,
  User,
  UserRole,
  UsuarioRow,
} from "@/types/api"

const userRoles: readonly UserRole[] = ["FORNECEDOR", "INSTITUICAO"]

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function isUserRole(value: unknown): value is UserRole {
  return userRoles.some((role) => role === value)
}

function isUsuarioRow(value: unknown): value is UsuarioRow {
  return (
    isRecord(value) &&
    typeof value.id_usuario === "number" &&
    typeof value.nome_razao === "string" &&
    (value.tipo_perfil === null || isUserRole(value.tipo_perfil)) &&
    typeof value.documento === "string"
  )
}

function toUser(row: UsuarioRow): User {
  return {
    id: row.id_usuario,
    name: row.nome_razao,
    role: row.tipo_perfil,
    document: row.documento,
  }
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const body: CreateUsuarioBody = {
    nome_razao: request.name.trim(),
    tipo_perfil: request.role,
    documento: onlyDigits(request.document),
  }

  const { data } = await api.post<
    unknown,
    AxiosResponse<unknown>,
    CreateUsuarioBody
  >("/api/usuarios", body)

  const response: CreateUsuarioResponse = parseApiResponse(data, isUsuarioRow)
  return toUser(response.data)
}
