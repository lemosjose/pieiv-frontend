import axios, { AxiosError, type AxiosInstance } from "axios"

import { env } from "@/lib/env"
import type {
  ApiEnvelope,
  ApiError,
  TypeGuard,
  ValidationIssue,
} from "@/types/api"

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

export class UnexpectedResponseError extends Error {
  constructor() {
    super("O servidor retornou uma resposta inesperada.")
    this.name = "UnexpectedResponseError"
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string"
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
}

export function isArrayOf<TItem>(
  isItem: TypeGuard<TItem>
): TypeGuard<readonly TItem[]> {
  return (value): value is readonly TItem[] =>
    Array.isArray(value) && value.every((item: unknown) => isItem(item))
}

export function parseBody<TData>(
  body: unknown,
  isData: TypeGuard<TData>
): TData {
  if (!isData(body)) {
    throw new UnexpectedResponseError()
  }

  return body
}

export function parseEnvelope<TData>(
  body: unknown,
  isData: TypeGuard<TData>
): TData {
  const isEnvelope = (value: unknown): value is ApiEnvelope<TData> =>
    isRecord(value) && typeof value.mensagem === "string" && isData(value.dados)

  return parseBody(body, isEnvelope).dados
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return isRecord(value) && typeof value.msg === "string"
}

function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    (typeof value.detail === "string" ||
      isArrayOf(isValidationIssue)(value.detail))
  )
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body: unknown = error.response?.data

    if (isApiError(body)) {
      return typeof body.detail === "string"
        ? body.detail
        : body.detail.map((issue) => issue.msg).join(" ")
    }

    if (error.code === AxiosError.ECONNABORTED) {
      return "A requisição demorou demais. Tente novamente."
    }

    if (error.response === undefined) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão."
    }

    if (error.response.status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde."
    }

    return "Não foi possível completar a requisição."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Ocorreu um erro inesperado."
}
