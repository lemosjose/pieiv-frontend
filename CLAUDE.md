# Projeto — donations platform

Academic project for **IFTM — PIE IV, 2026/2**. A web platform where donors register
items to give away, institutions register to receive them, donations are published, and
the two sides schedule a pickup.

**Stack:** Next.js 16 (App Router) · React 19.2 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui on Base UI · Playwright.

This file is the single entry point: everything needed to clone, run, and contribute is
below. The `.claude/steering/` docs hold the detail — they are linked from each section.

---

## 1. Getting started

### Prerequisites

| Need | Version | Why |
| --- | --- | --- |
| Node.js | **20.9+** (LTS) | Next.js 16 minimum. Node 18 will not work. |
| npm | 10+ | `package-lock.json` is the committed lockfile — do not switch to pnpm/yarn. |
| Git | any | — |

Browsers supported by the built app: Chrome/Edge 111+, Firefox 111+, Safari 16.4+.

### First run

```bash
git clone <repo-url>
cd Projeto
npm ci                          # use `npm ci`, not `npm install` — respects the lockfile
cp .env.example .env.local      # then edit the values
npm run dev                     # http://localhost:3000
```

### Environment variables

[.env.example](.env.example) is the committed template and the checklist of every
variable the app reads. Your real values go in **`.env.local`**, which is gitignored and
must never be committed. `.env.example` must never contain a real secret.

| Variable | Required | Default | What it is |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | in production | `http://localhost:3333` in dev | Base URL of the backend API. No trailing slash. |
| `NEXT_PUBLIC_API_TIMEOUT` | no | `10000` | Request timeout in ms. |

Set it per environment — `http://localhost:3333` locally,
`https://api.seu-dominio.com.br` in production (configured in the host's dashboard, not
in a file). Values are read and validated once in [lib/env.ts](lib/env.ts) and imported
from there; **never reach for `process.env` elsewhere in the codebase**. A missing or
malformed URL throws a named error at startup telling you which variable is wrong —
except in development, where the localhost fallback keeps a fresh clone running before
any backend exists.

`NEXT_PUBLIC_` means the value is inlined into the browser bundle and is **public**.
That is fine for an API base URL. Database URLs, API keys, and session secrets must not
carry the prefix, and may only be read server-side. Adding a variable means touching
three files in one change: `.env.example`, `lib/env.ts`, and this table.

Nothing else needs configuring — no database or external service is wired up yet
(see §4).

For end-to-end tests, one extra step downloads the browsers (~1 GB, once):

```bash
npx playwright install --with-deps
```

### Verify your setup

```bash
npm run typecheck && npm run lint
```

> ⚠️ **`npm run typecheck` currently fails** on `routes/routes.ts` — a work-in-progress
> file with an unterminated JSX expression, two `export default`s, and JSX inside a
> `.ts` file. It is not part of the structure described below. Fix or delete it; see §6.

---

## 2. Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on :3000. Turbopack; outputs to `.next/dev`. |
| `npm run build` | Production build. Turbopack by default in Next 16. |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. Must be clean. |
| `npm run lint` | ESLint flat config. (`next lint` no longer exists in v16.) |
| `npm run format` | Prettier over all `.ts`/`.tsx`, including Tailwind class sorting. |
| `npx playwright test` | End-to-end tests across Chromium, Firefox, WebKit. |
| `npx playwright test --ui` | Interactive test runner — best for writing specs. |
| `npx shadcn@latest add <name>` | Add a UI primitive into `components/ui/`. |
| `npx next typegen` | Regenerate `PageProps` / `LayoutProps` / `RouteContext` types. |

`dev` and `build` can now run concurrently (separate output directories), but two
`dev` servers on the same project are blocked by a lockfile.

---

## 3. Project map

```
app/                 Routes, layouts, Server Components.
  layout.tsx         Root layout: fonts, ThemeProvider.
  page.tsx           Home — still the starter placeholder.
  globals.css        Tailwind v4 entry + design tokens. No tailwind.config.*.
components/
  ui/                shadcn/ui primitives. Generated via CLI — treat as vendored.
  theme-provider.tsx Providers + the "d" dark-mode hotkey.
hooks/               Client hooks. login.ts / signup.ts are empty stubs.
lib/
  env.ts             Typed, validated environment variables. The only process.env reader.
  api.ts             The single axios instance + getApiErrorMessage().
  utils.ts           cn() — the only sanctioned class merger.
public/              Static assets.
integracao/          Playwright specs.
.github/workflows/   CI — runs Playwright on push/PR to main and master.
.claude/steering/    The detailed guides (see §7).
```

Import via the `@/*` alias (`@/components/ui/button`), never `../../`.

**Server Components are the default.** Use `"use client"` only for state, effects, event
handlers, or browser APIs — and put it on the smallest component that needs it, not on a
page or layout. [structure.md](.claude/steering/structure.md) has the full rules.

**Styling:** Tailwind utilities only. Colors come from the CSS variables in
`app/globals.css` (`bg-background`, `text-muted-foreground`) — never a raw hex. New
tokens are added under `@theme inline`, `:root`, **and** `.dark`. Variants use `cva`
merged through `cn()`, the way `components/ui/button.tsx` already does.

---

## 4. What needs building

**Nothing from the product scope exists yet** — the app is still the starter page. The
five prototype screens, their agreed routes, and the open questions blocking each are in
[product.md](.claude/steering/product.md):

| # | Screen | Route |
| --- | --- | --- |
| 1 | Tela de Cadastro | `app/cadastro/` |
| 2 | Formulário de Cadastro para instituições | `app/instituicoes/cadastro/` |
| 3 | Formulário de Cadastro de doações | `app/doacoes/nova/` |
| 4 | Tela de Divulgação de doações | `app/doacoes/` + `[id]/` |
| 5 | Agendamento de retirada | `app/doacoes/[id]/agendamento/` |

Route segments and UI copy are Portuguese (domain vocabulary); code identifiers are
English.

The five endpoints backing them are specified in
[api.md](.claude/steering/api.md), with payload types in [types/api.ts](types/api.ts):

```
POST /api/usuarios                    register fornecedor / instituição
POST /api/doacoes                     publish a surplus food lot
GET  /api/doacoes                     lots with status DISPONIVEL
POST /api/agendamentos                reserve a lot (SQL transaction)
GET  /api/agendamentos/{id_usuario}   a user's reservations / pending collections
```

**The blocking decision is where data lives.** There is no database, ORM, or API client
in the project, so every form above currently submits to nowhere. Decide this before
building screens. Also unresolved: the auth mechanism, whether the divulgação listing is
public or authenticated-only, whether institutions are verified, and where donation
photos are stored.

Before the forms, define the shared domain types (`Doacao`, `Instituicao`, `Doador`,
`Agendamento`, and the scheduling status union) once in `lib/` — the five screens must
agree on shapes.

---

## 5. Rules

1. **No `any`.** Also no `!` non-null assertions, no `@ts-ignore`, and no `as` outside
   `as const` and narrowing after a real runtime check. Input from outside the program
   (`fetch`, `FormData`, `searchParams`, env vars) is `unknown` and gets narrowed
   explicitly with a type guard.
2. **Do not commit.** Make changes in the working tree; the repo owner commits.
3. **This is Next.js 16, not the Next.js you remember** — see §6.
4. **Server Components by default**, `"use client"` pushed as far down as it goes.
5. **Validate and authorize inside Server Actions.** The client is never a security
   boundary, and no secret ever reaches a `NEXT_PUBLIC_*` variable.
6. **Config comes from `lib/env.ts`, HTTP from `lib/api.ts`.** No bare `process.env`
   reads and no `axios.create()` outside that one module.
7. **`camelCase` everywhere** — variables, functions, object keys, payload fields,
   constants, and filenames. Exceptions only where required: `PascalCase` for components
   and types, `SCREAMING_SNAKE` for env variable names in `.env`, `kebab-case` for route
   segments and shadcn-generated `components/ui/` files. Convert `snake_case` API
   responses at the boundary in `lib/api.ts`.
8. **Few comments.** Default to none. A comment is justified only when it explains a
   non-obvious *why* the code cannot — no file headers, no JSDoc restating a signature,
   no narrating the next line, no commented-out code.
9. **Accessible markup:** real `<button>`/`<a>`/`<input>` or a Base UI primitive, never a
   `<div onClick>`. Every input labelled, every icon-only control named.

**Definition of done:** `npm run typecheck && npm run lint && npm run format`, plus a
Playwright spec for any new user-facing flow, and no `any`/`!`/`@ts-ignore` introduced.

Full contract: [guidelines.md](.claude/steering/guidelines.md).

---

## 6. Next.js 16 gotchas

The conventions changed from earlier versions, so older knowledge and most tutorials are
wrong here. The authoritative docs ship inside the dependency at
**`node_modules/next/dist/docs/`** — read the relevant page before writing framework
code. The traps most likely to bite:

- **Request APIs are async, with no sync fallback.** `cookies()`, `headers()`,
  `draftMode()`, and `params`/`searchParams` must be `await`ed.
- **Use the generated route-prop helpers** — `PageProps<"/doacoes/[id]">` etc. — instead
  of hand-writing prop types. Run `npx next typegen` if they are missing.
- **`middleware.ts` is now `proxy.ts`**, exporting `proxy()`, Node runtime only.
- **`revalidateTag(tag, "max")`** takes a cache profile now. For read-your-writes after a
  mutation use `updateTag()`; to refresh the client router use `refresh()`.
- **Turbopack config is top-level** `turbopack: {}`, not `experimental.turbopack`. A
  webpack config will fail the build unless you pass `--webpack`.
- **Parallel-route slots require an explicit `default.tsx`** or the build fails.
- **`next/image` defaults tightened**: `qualities` is `[75]`, local IPs blocked,
  `images.domains` deprecated in favour of `remotePatterns`.
- **JSX belongs in `.tsx` files**, not `.ts` — this is what breaks `routes/routes.ts`
  today. Pages live in `app/<segment>/page.tsx`; a `routes/` folder is not a Next.js
  convention and does not produce routes.

More in [tech.md](.claude/steering/tech.md).

---

## 7. Steering docs

| Doc | Read it when |
| --- | --- |
| [product.md](.claude/steering/product.md) | You need the scope, the screen checklists, or the open product questions. |
| [tech.md](.claude/steering/tech.md) | Versions, commands, dependency policy, the full Next 16 changelog. |
| [structure.md](.claude/steering/structure.md) | Deciding where a new file goes; server/client and styling rules. |
| [guidelines.md](.claude/steering/guidelines.md) | Writing code — the typing contract, React/Next rules, error handling. |
| [api.md](.claude/steering/api.md) | Implementing or calling an endpoint — the five agreed routes, their validation and status codes. |
| [testing.md](.claude/steering/testing.md) | Writing Playwright specs; known gaps in the test setup. |

[AGENTS.md](AGENTS.md) carries the same pointers for non-Claude agents.

---

## 8. Known issues

Three things are half-finished. They are recorded rather than hidden, so nobody
rediscovers them the hard way.

1. **`routes/routes.ts` breaks `npm run typecheck`** — invalid JSX in a `.ts` file, two
   `export default`s. Delete it and create pages under `app/` instead (§6).
2. **Playwright never tests this app.** `playwright.config.ts` has `baseURL` and
   `webServer` commented out, so CI starts no server, and
   `integracao/example.spec.ts` is still the generated sample hitting `playwright.dev`.
   The config fix is in [testing.md](.claude/steering/testing.md).
3. **CI runs no typecheck and no lint**, and `vitest` is installed with no config and no
   script — configure it for `lib/`/`hooks/` logic or remove the dependency.
4. **`NEXT_PUBLIC_API_BASE_URL` points at nothing.** The axios instance is configured and
   ready, but no backend serves `localhost:3333` yet, so every request will fail until
   one exists.
