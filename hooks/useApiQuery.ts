"use client"

import { useCallback, useEffect, useState } from "react"
import axios from "axios"

import { getApiErrorMessage } from "@/lib/api"

export type ApiQuery<TData> = {
  data: TData | null
  error: string | null
  isLoading: boolean
  refetch: () => void
}

export function useApiQuery<TData>(
  request: (signal: AbortSignal) => Promise<TData>,
  enabled = true
): ApiQuery<TData> {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    request(controller.signal)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch((caught: unknown) => {
        // A cancelled request is a cleanup, not a failure — leaving it to the
        // error branch would flash an error as the component unmounts.
        if (axios.isCancel(caught)) {
          return
        }
        setError(getApiErrorMessage(caught))
        setIsLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [request, enabled, reloadToken])

  return { data, error, isLoading, refetch }
}
