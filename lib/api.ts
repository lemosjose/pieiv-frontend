import axios, { AxiosError, type AxiosInstance } from "axios"

import { env } from "@/lib/env"

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

type ApiErrorBody = {
  readonly message: string
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  )
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (isApiErrorBody(error.response?.data)) {
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
