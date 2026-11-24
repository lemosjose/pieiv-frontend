import type { AxiosResponse } from "axios"

import { api, isArrayOf, isRecord, parseBody, parseEnvelope } from "@/lib/api"
import type {
  CreateUserRequest,
  CreateUsuarioBody,
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
    isUserRole(value.tipo_perfil) &&
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

  return toUser(parseEnvelope(data, isUsuarioRow))
}

export async function listUsers(
  signal?: AbortSignal
): Promise<readonly User[]> {
  const { data } = await api.get<unknown>("/api/usuarios", { signal })

  return parseBody(data, isArrayOf(isUsuarioRow)).map(toUser)
}

export async function getUser(id: number, signal?: AbortSignal): Promise<User> {
  const { data } = await api.get<unknown>(`/api/usuarios/${id}`, { signal })

  return toUser(parseBody(data, isUsuarioRow))
}
