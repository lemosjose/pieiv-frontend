import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SignUpOption } from "@/types/components"

const signUpOptions: readonly SignUpOption[] = [
  {
    href: "/instituicoes/cadastro",
    title: "Sou instituição",
    description: "Receba doações disponíveis e agende a retirada.",
    action: "Cadastrar instituição",
  },
  {
    href: "/fornecedores/cadastro",
    title: "Sou fornecedor",
    description: "Publique doações para as instituições cadastradas.",
    action: "Cadastrar fornecedor",
  },
]

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">Plataforma de doações</h1>
        <p className="text-sm text-muted-foreground">
          Escolha como você quer participar.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {signUpOptions.map((option) => (
          <Card key={option.href}>
            <CardHeader>
              <CardTitle>
                <h2>{option.title}</h2>
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Link href={option.href} className={buttonVariants()}>
                {option.action}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
