<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project steering

See [CLAUDE.md](CLAUDE.md) for the entry point, and `.claude/steering/` for the full set:
[product](.claude/steering/product.md), [tech](.claude/steering/tech.md),
[structure](.claude/steering/structure.md), [guidelines](.claude/steering/guidelines.md),
[api](.claude/steering/api.md), [testing](.claude/steering/testing.md).

Non-negotiable: no `any` (or `!` / `@ts-ignore` / stray `as`) — unknown input is
`unknown`, narrowed explicitly; `camelCase` identifiers and filenames; few comments,
and only for a non-obvious *why*; config via `lib/env.ts`, HTTP via `lib/api.ts`;
Server Components by default; do not commit; `npm run typecheck && npm run lint` must
pass before a change is done.
