import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignUp } from "@/components/user/SignUp"
import type { SignUpPageProps } from "@/types/components"

export function SignUpPage({ role, title, description }: SignUpPageProps) {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <Card>
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
    </main>
  )
}
