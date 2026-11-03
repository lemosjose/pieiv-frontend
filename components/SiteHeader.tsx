import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-3">
      <Link href="/" className="text-sm font-medium">
        Início
      </Link>
      <nav aria-label="Cadastro" className="flex flex-wrap gap-2">
        <Link
          href="/instituicoes/cadastro"
          className={buttonVariants({ variant: "ghost" })}
        >
          Sou instituição
        </Link>
        <Link
          href="/fornecedores/cadastro"
          className={buttonVariants({ variant: "ghost" })}
        >
          Sou fornecedor
        </Link>
      </nav>
    </header>
  )
}
