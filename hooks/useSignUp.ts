"use client"

import { useApiMutation, type ApiMutation } from "@/hooks/useApiMutation"
import { createUser } from "@/services/usuarios"
import type { CreateUserRequest, User } from "@/types/api"

export function useSignUp(): ApiMutation<CreateUserRequest, User> {
  return useApiMutation(createUser)
}
