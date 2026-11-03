"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserRole } from "@/types/api"
import type { SignUpField, SignUpProps } from "@/types/components"

const commonFields: readonly SignUpField[] = [
  {
    name: "email",
    label: "E-mail",
    type: "email",
    autoComplete: "email",
    placeholder: "contato@exemplo.com.br",
  },
  {
    name: "phone",
    label: "Telefone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "(34) 90000-0000",
  },
  {
    name: "address",
    label: "Endereço",
    type: "text",
    autoComplete: "street-address",
    placeholder: "Rua, número, bairro, cidade",
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    autoComplete: "new-password",
    minLength: 8,
  },
]

const roleFields: Record<UserRole, readonly SignUpField[]> = {
  INSTITUICAO: [
    {
      name: "name",
      label: "Nome da instituição",
      type: "text",
      autoComplete: "organization",
    },
    {
      name: "document",
      label: "CNPJ",
      type: "text",
      autoComplete: "off",
      placeholder: "00.000.000/0000-00",
    },
    {
      name: "contactName",
      label: "Nome do responsável",
      type: "text",
      autoComplete: "name",
    },
  ],
  FORNECEDOR: [
    {
      name: "name",
      label: "Nome ou razão social",
      type: "text",
      autoComplete: "name",
    },
    {
      name: "document",
      label: "CPF ou CNPJ",
      type: "text",
      autoComplete: "off",
      placeholder: "Somente números",
    },
  ],
}

export function SignUp({ role }: SignUpProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        // TODO: send to POST /api/usuarios once a backend exists
        event.preventDefault()
        setIsSubmitted(true)
      }}
    >
      {[...roleFields[role], ...commonFields].map(({ label, ...field }) => (
        <div key={field.name} className="flex flex-col gap-2">
          <Label htmlFor={field.name}>{label}</Label>
          <Input id={field.name} required {...field} />
        </div>
      ))}
      <Button type="submit" size="lg" className="mt-2">
        Cadastrar
      </Button>
      {isSubmitted && (
        <p role="status" className="text-xs text-muted-foreground">
          Protótipo: nenhum dado foi enviado ou salvo.
        </p>
      )}
    </form>
  )
}
