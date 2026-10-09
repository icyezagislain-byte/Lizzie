# The Detectives

Interviewer-led field research for “Redesigning Rwanda's Health Insurance,” with separate CBHI, MINALOC, and RSSB response tables.

## Run & Operate

- `corepack pnpm install` — install dependencies. Do not use `npm run install`.
- Replace the placeholder service-role key in the ignored `artifacts/api-server/.env` with a newly rotated key.
- Apply `supabase/migrations/20261009_create_interview_tables.sql` in Supabase SQL Editor before saving records.
- Run `corepack pnpm --filter @workspace/api-server run dev` and `corepack pnpm --filter @workspace/the-detectives run dev` in separate terminals.
- `corepack pnpm run typecheck` — full typecheck across all packages.
- `corepack pnpm run build` — typecheck + build all packages.
- `corepack pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec.
- See [SETUP.md](SETUP.md) for the non-developer step-by-step guide.

Interview routes are public to anyone with the link. Response browsing requires the shared `ADMIN_ACCESS_CODE`, which is checked by the server and exchanged for a 12-hour signed session. The service-role key belongs only in the API server `.env`; never put it in a frontend variable or file. Anyone who learns the shared admin code can view all responses.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
