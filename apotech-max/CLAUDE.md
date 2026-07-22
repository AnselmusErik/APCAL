# apotech — Claude Context

## Project Overview
Next.js 16 app with TypeScript, Tailwind v4, Prisma + pg adapter, NextAuth v4, and a Repository + Service architecture.

## Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 + `@prisma/adapter-pg` (PgBouncer-safe) |
| Auth | NextAuth v4 (Credentials provider + JWT) |
| Validation | Zod v4 |
| Toast | react-hot-toast |
| Package manager | Yarn |

## Key Conventions

### Path Aliases
`@/*` resolves to BOTH `./src/*` AND `./` — meaning:
- `@/components/*` → `src/components/*`
- `@/server/*` → `server/*` (top-level, NOT inside src)
- `@/hooks/*` → `src/hooks/*`
- `@/lib/*` → `src/lib/*`

### Directory Structure
```
/
├── server/              # Server-only code (never imported by client components)
│   ├── db/client.ts     # Prisma singleton with pg Pool adapter
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── utils/           # errors.ts, validation.ts
│   └── types/           # Server-side TypeScript types
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (pages)/     # User-facing route group
│   │   ├── backoffice/  # Admin panel (ADMIN/MANAGER roles required)
│   │   └── api/         # API routes
│   ├── components/      # React components
│   │   ├── ui/          # Generic design system components
│   │   └── backoffice/  # Admin-specific components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # rbac.ts, rbac-middleware.ts
│   ├── providers/       # React context providers
│   ├── styles/          # globals.css (Tailwind v4 theme)
│   └── types/           # Client-side TypeScript types
├── prisma/
│   ├── schema.prisma    # Root schema (generator + datasource)
│   └── models/          # Domain-specific .prisma files
├── types/               # Global .d.ts declarations (next-auth.d.ts)
└── middleware.ts        # Next.js edge middleware (auth + RBAC)
```

### Architecture: Repository + Service Pattern
Always split data access from business logic:
- **Repository** (`server/repositories/`) — raw DB queries only, no business logic
- **Service** (`server/services/`) — business logic, calls repositories, throws typed errors
- **API Route** (`src/app/api/`) — HTTP layer, calls services, handles errors with `handleApiError()`

### RBAC (Three-layer)
1. **Edge middleware** (`middleware.ts`) — route-level protection via `withAuth` from `next-auth/middleware`
2. **API route wrapper** (`src/lib/rbac-middleware.ts`) — `withAuth()`, `withRoles()`, `withPermissions()` HOFs
3. **Server utility** (`src/lib/rbac.ts`) — `requireAuth()`, `requireRole()`, `hasRole()`, `hasPermission()` for server components

### Error Handling
Always use typed errors from `server/utils/errors.ts`:
- `AppError` — base class with `statusCode`
- `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403)
- `NotFoundError` (404), `ConflictError` (409)
- In API routes: `const { message, status } = handleApiError(error)`

### Tailwind v4
- No `tailwind.config.js` — configuration lives entirely in `src/styles/globals.css` via `@theme inline`
- PostCSS plugin: `@tailwindcss/postcss`
- Custom utilities: `.glass`, `.gradient-text`, `.glow-primary`, `.glow-accent`, `.shimmer`

### Prisma
- Multi-file schema under `prisma/models/*.prisma`
- Uses `@prisma/adapter-pg` for PgBouncer-safe connection pooling
- Two env vars: `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432)
- Seed: `yarn db:seed`

## Common Commands
```bash
yarn dev          # Start dev server
yarn build        # prisma generate + next build
yarn db:migrate   # Run migrations
yarn db:studio    # Open Prisma Studio
yarn db:seed      # Seed database
yarn lint         # ESLint
```

## Adding a New Domain
1. Create `prisma/models/<domain>.prisma` with your models
2. Create `server/repositories/<domain>Repository.ts`
3. Create `server/services/<domain>Service.ts`
4. Create `src/app/api/<domain>/route.ts` API routes
5. Create `src/app/(pages)/<domain>/page.tsx` UI pages
