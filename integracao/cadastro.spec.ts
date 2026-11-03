import { expect, test } from "@playwright/test"

const forms = [
  {
    link: "Cadastrar instituição",
    url: "/instituicoes/cadastro",
    heading: "Cadastro de instituição",
    nameLabel: "Nome da instituição",
    documentLabel: "CNPJ",
  },
  {
    link: "Cadastrar fornecedor",
    url: "/fornecedores/cadastro",
    heading: "Cadastro de fornecedor",
    nameLabel: "Nome ou razão social",
    documentLabel: "CPF ou CNPJ",
  },
] as const

for (const form of forms) {
  test(`${form.heading} abre a partir da página inicial`, async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: form.link }).click()

    await expect(page).toHaveURL(form.url)
    await expect(
      page.getByRole("heading", { name: form.heading })
    ).toBeVisible()
    await expect(page.getByLabel(form.nameLabel)).toBeVisible()
    await expect(page.getByLabel(form.documentLabel)).toBeVisible()
  })

  test(`${form.heading} não envia dados no protótipo`, async ({ page }) => {
    await page.goto(form.url)
    const status = page.getByRole("status")
    const submit = page.getByRole("button", { name: "Cadastrar" })

    await submit.click()
    await expect(status).toBeHidden()

    for (const textbox of await page.locator("input").all()) {
      await textbox.fill("valor de teste")
    }
    await page.getByLabel("E-mail").fill("contato@exemplo.com.br")
    await submit.click()

    await expect(status).toContainText("nenhum dado foi enviado")
    await expect(page).toHaveURL(form.url)
  })
}
