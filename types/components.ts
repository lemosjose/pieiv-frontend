import type { UserRole } from "@/types/api"

export interface SignUpField {
  name: string
  label: string
  type: "text" | "email" | "password" | "tel"
  autoComplete: string
  placeholder?: string
  minLength?: number
}

export interface SignUpProps {
  role: UserRole
}

export interface SignUpPageProps extends SignUpProps {
  title: string
  description: string
}

export interface SignUpOption {
  href: string
  title: string
  description: string
  action: string
}
