import axios, { AxiosError, type AxiosInstance } from "axios"

import { env } from "@/lib/env"
import type { ApiError, ApiResponse, TypeGuard } from "@/types/api"

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

export function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number"
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

export function parseApiResponse<TData>(
  body: unknown,
  isData: TypeGuard<TData>
): ApiResponse<TData> {
  if (!isRecord(body)) {
    throw new UnexpectedResponseError()
  }

  const { code, data } = body

  if (typeof code !== "number" || !isData(data)) {
    throw new UnexpectedResponseError()
  }

  return { code, data }
}

function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.code === "number" &&
    typeof value.message === "string" &&
    (value.field === undefined || typeof value.field === "string")
  )
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (isApiError(error.response?.data)) {
      return error.response.data.message
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
