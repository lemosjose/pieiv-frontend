"use client"

import { useApiMutation } from "@/hooks/useApiMutation"
import { createUser } from "@/services/usuarios"
import type { CreateUserRequest, User } from "@/types/api"
import type { ApiMutation } from "@/types/hooks"

export function useSignUp(): ApiMutation<CreateUserRequest, User> {
  return useApiMutation(createUser)
}
