// NEXT_PUBLIC_* must be referenced as static literals — a computed key is not
// inlined by the bundler and resolves to undefined in the browser.
const rawApiBaseUrl: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL
const rawApiTimeout: string | undefined = process.env.NEXT_PUBLIC_API_TIMEOUT

const isProduction = process.env.NODE_ENV === "production"
const defaultApiTimeoutMs = 10_000

class EnvError extends Error {
  constructor(name: string, problem: string) {
    super(
      `Environment variable ${name} ${problem}. ` +
        `Copy .env.example to .env.local and set it.`
    )
    this.name = "EnvError"
  }
}

// Empty means same-origin: the API is served by this app's Route Handlers under
// /api. Set it only to point at a separate backend.
function parseBaseUrl(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    return ""
  }

  const trimmed = value.trim()

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new EnvError(
      name,
      `is not a valid absolute URL (received "${trimmed}")`
    )
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new EnvError(
      name,
      `must use http or https (received "${parsed.protocol}")`
    )
  }

  return trimmed.replace(/\/+$/, "")
}

function parsePositiveInteger(
  name: string,
  value: string | undefined,
  fallback: number
): number {
  if (value === undefined || value.trim() === "") {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new EnvError(name, `must be a positive integer (received "${value}")`)
  }

  return parsed
}

export const env = {
  apiBaseUrl: parseBaseUrl("NEXT_PUBLIC_API_BASE_URL", rawApiBaseUrl),
  apiTimeoutMs: parsePositiveInteger(
    "NEXT_PUBLIC_API_TIMEOUT",
    rawApiTimeout,
    defaultApiTimeoutMs
  ),
  isProduction,
} as const

export type Env = typeof env
