export interface ApiMutation<TInput, TData> {
  data: TData | null
  error: string | null
  isLoading: boolean
  mutate: (input: TInput) => Promise<TData | null>
  reset: () => void
}

export interface ApiQuery<TData> {
  data: TData | null
  error: string | null
  isLoading: boolean
  refetch: () => void
}
