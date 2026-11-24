import Image from "next/image"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignUp } from "@/components/user/SignUp"
import helpingHand from "@/public/images/helpingHand.jpg"
import volunteer from "@/public/images/volunteer.jpg"
import type { UserRole } from "@/types/api"
import type { SignUpImage, SignUpPageProps } from "@/types/components"

const roleImages: Record<UserRole, SignUpImage> = {
  INSTITUICAO: {
    src: helpingHand,
    alt: "Criança segurando a mão de um adulto",
  },
  FORNECEDOR: {
    src: volunteer,
    alt: "Voluntário organizando sacolas de alimentos para doação",
  },
}

export function SignUpPage({ role, title, description }: SignUpPageProps) {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 p-6 md:grid-cols-2">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>
            <h1>{title}</h1>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp role={role} />
        </CardContent>
      </Card>
      <Image
        src={roleImages[role].src}
        alt={roleImages[role].alt}
        placeholder="blur"
        sizes="(min-width: 768px) 420px, 0px"
        className="hidden h-full max-h-[720px] w-full object-cover md:block"
      />
    </main>
  )
}
