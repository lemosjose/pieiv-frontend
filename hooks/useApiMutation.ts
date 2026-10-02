"use client"

import { useCallback, useState } from "react"

import { getApiErrorMessage } from "@/lib/api"

export type ApiMutation<TInput, TData> = {
  data: TData | null
  error: string | null
  isLoading: boolean
  mutate: (input: TInput) => Promise<TData | null>
  reset: () => void
}

export function useApiMutation<TInput, TData>(
  request: (input: TInput) => Promise<TData>
): ApiMutation<TInput, TData> {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(
    async (input: TInput): Promise<TData | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await request(input)
        setData(result)
        return result
      } catch (caught: unknown) {
        setError(getApiErrorMessage(caught))
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [request]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, mutate, reset }
}
