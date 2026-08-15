<div align="center">
  <img src="apps/dashboard/src/assets/logo.png" alt="ImovDigital logo" width="240" />

  # ImovDigital

  **A multi-tenant SaaS platform that gives real estate agencies an operational dashboard and a fully customizable, SEO-ready website.**

  ![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
  ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
  ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)
</div>

> Portfolio project focused on full-stack architecture, multi-tenancy, SaaS billing, visual content editing, SEO, and production deployment. The product interface is in Brazilian Portuguese because it was designed for the Brazilian real estate market; this technical documentation is in English.

## Table of contents

- [Overview](#overview)
- [Main capabilities](#main-capabilities)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Core engineering decisions](#core-engineering-decisions)
- [Data model](#data-model)
- [API organization](#api-organization)
- [Security](#security)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [Quality and current status](#quality-and-current-status)
- [What this project demonstrates](#what-this-project-demonstrates)

## Overview

ImovDigital is a B2B SaaS product for real estate agencies. Each customer receives an isolated organization, a property and lead management dashboard, subscription-aware features, and a public website rendered from that customer's domain, content, brand, and property inventory.

The repository contains three independently deployable applications:

1. A **NestJS API** responsible for business rules, authentication, tenant isolation, persistence, billing, uploads, and external integrations.
2. A **React/Vite dashboard** used by agency teams to manage their operation and visually customize their website.
3. A **Next.js public storefront** that resolves the tenant from the hostname and server-renders the correct agency website.

Shared TypeScript packages keep contracts and formatting rules consistent across the applications. The entire workspace is managed with pnpm and Turborepo.

## Main capabilities

| Area | Capabilities |
| --- | --- |
| Multi-tenancy | Isolated agencies, tenant-aware JWTs, organization switching, branches, unique slugs, subdomains, and custom domains |
| Property management | Create, edit, publish, feature, search, filter, sort, and paginate sale/rental listings with images, costs, amenities, location, and SEO fields |
| Visual site editor | Section ordering, visibility, per-section settings, global branding, responsive previews, undo/redo, autosave, and publish-state tracking |
| Website templates | `classic` and `editorial` visual systems covering home, search, property detail, and dashboard previews |
| Lead management | Public lead capture, property attribution, inbox status, search, source filtering, and optional WhatsApp distribution |
| Team management | Owner/admin/agent membership model, plan-based seat limits, tenant-scoped users, and owner protection rules |
| Authentication | Registration, login, access/refresh tokens, password recovery, e-mail verification codes, optional 2FA, and account soft deletion |
| SaaS billing | Seven-day trial, monthly/yearly plans, Stripe Checkout, Billing Portal, webhooks, cancellation feedback, and feature/usage limits |
| Media | Direct browser uploads through Cloudflare R2 presigned URLs and tenant-scoped object keys |
| SEO | Dynamic metadata, canonical URLs, Open Graph, Twitter cards, JSON-LD, sitemaps, robots rules, and optional AI-generated listing metadata |
| Integrations | Stripe, Cloudflare R2, Resend, Anthropic, Google Maps/Places, Z-API WhatsApp, and TikTok Events API |
| Deployment | Separate Docker images, Next.js standalone output, CapRover manifests, and Caddy on-demand TLS for customer domains |

## Architecture

```mermaid
flowchart LR
    subgraph Clients
        Staff[Agency staff]
        Visitor[Website visitor]
    end

    subgraph Frontends
        Dashboard[React + Vite dashboard]
        Web[Next.js public website]
    end

    subgraph Backend
        API[NestJS REST API]
        Prisma[Prisma ORM]
    end

    Staff --> Dashboard
    Visitor -->|Subdomain or custom domain| Web
    Dashboard -->|JWT-protected requests| API
    Web -->|Tenant slug + public requests| API
    API --> Prisma
    Prisma --> PostgreSQL[(PostgreSQL)]

    API --> R2[Cloudflare R2]
    API --> Stripe[Stripe]
    API --> Resend[Resend]
    API --> Anthropic[Anthropic]
    API --> Google[Google Maps / Places]
    API --> ZAPI[Z-API / WhatsApp]
    API --> TikTok[TikTok Events API]
```

### Why there are two frontends

The authenticated dashboard and the public website have different runtime needs:

- The **dashboard** is a client-side application optimized for interactive forms, stateful workflows, drag-and-drop editing, and authenticated API calls.
- The **public website** is server-rendered with Next.js so each tenant receives crawlable pages, request-aware metadata, structured data, and hostname-based content resolution.

Keeping them independent also allows each application to be deployed and scaled according to its own traffic profile.

### Public request flow

1. A visitor opens either `{agency}.imovdigital.com.br` or the agency's custom domain.
2. Next.js reads the request hostname and resolves it to a tenant slug. Custom domains are resolved through the public API.
3. The public application fetches tenant identity, site configuration, filters, and listings from the API.
4. The selected template renders the configured sections and brand tokens.
5. Search and property detail pages remain tenant-scoped, while metadata, JSON-LD, sitemap entries, and canonical URLs are generated dynamically.
6. A contact submission creates a lead under the resolved tenant and can trigger a plan-dependent WhatsApp notification workflow.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Language | TypeScript 5.7 |
| Monorepo | pnpm workspaces, Turborepo 2 |
| Dashboard | React 19, Vite 6, React Router 7, Tailwind CSS 4 |
| Dashboard state and UX | Zustand, React Hook Form, Zod, Axios, dnd-kit, Motion, Lucide, Sonner |
| Public website | Next.js 15 App Router, React 19, Server Components, dynamic metadata, Tailwind CSS 4 |
| API | NestJS 11, Passport JWT, class-validator, Helmet, NestJS Throttler |
| Database | PostgreSQL, Prisma ORM 6 |
| Authentication | JWT access/refresh tokens, bcryptjs, e-mail OTP for 2FA and password recovery |
| Payments | Stripe Checkout, Customer Portal, subscriptions, and signed webhooks |
| Storage | Cloudflare R2 through the AWS S3 SDK and presigned uploads |
| External services | Resend, Anthropic, Google Maps/Places, Z-API, TikTok Events API |
| Infrastructure | Docker, CapRover, Caddy, on-demand TLS |

## Repository structure

```text
imob/
├── apps/
│   ├── api/                    # NestJS REST API
│   │   ├── prisma/             # Schema, plan seed, and Stripe setup script
│   │   └── src/
│   │       ├── common/         # Guards, decorators, filters, and tenant middleware
│   │       ├── modules/        # Domain-oriented API modules
│   │       └── prisma/         # Shared Prisma module and database service
│   ├── dashboard/              # Authenticated React/Vite back office
│   │   └── src/
│   │       ├── components/     # Shared controls, uploads, modals, and editor UI
│   │       ├── contexts/       # Subscription state and capability checks
│   │       ├── hooks/          # Autosave and R2 upload hooks
│   │       ├── layouts/        # Protected dashboard shell and navigation
│   │       ├── lib/            # API client, token refresh, and integrations
│   │       ├── pages/          # Route-level product features
│   │       └── store/          # Zustand visual editor state
│   └── web/                    # Public multi-tenant Next.js application
│       └── src/
│           ├── app/            # Home, search, detail, robots, and sitemap routes
│           ├── components/     # Search, cards, forms, galleries, and sections
│           ├── lib/            # API access, dates, URLs, and tenant resolution
│           └── templates/      # Classic/editorial component registries
├── packages/
│   ├── config/                 # Shared TypeScript configuration
│   ├── types/                  # Cross-application domain contracts and defaults
│   └── utils/                  # Currency, date, phone, and slug utilities
├── caddy/                      # Reverse proxy and on-demand TLS image
├── docs/                       # Template design language and extension guide
├── Dockerfile.api              # API production image
├── Dockerfile.dashboard        # Dashboard build and static server image
├── Dockerfile.web              # Next.js standalone production image
├── captain-definition-*        # CapRover deployment manifests
├── pnpm-workspace.yaml         # Workspace boundaries
├── turbo.json                  # Task graph and build outputs
└── package.json                # Root commands and toolchain versions
```

### API structure

The API follows NestJS domain modules. Controllers define HTTP boundaries, services contain business rules, and all persistence is centralized through the shared `PrismaService`.

```text
apps/api/src/modules/
├── auth/           # Registration, sessions, tokens, 2FA, recovery, tenant switching
├── tenant/         # Organization data, dashboard metrics, slug/domain management
├── plan/           # Public subscription plan catalog
├── property/       # Tenant-scoped inventory and AI-assisted SEO
├── user/           # Team membership and plan limits
├── contact/        # Agency contact channels and lead delivery settings
├── lead/           # Lead inbox operations
├── site-config/    # JSON website configuration, defaults, save, and publish
├── upload/         # R2 presigned uploads, reads, and deletion
├── subscription/   # Stripe lifecycle and analytics events
├── public/         # Storefront reads, search, leads, SEO, and domain resolution
└── admin/          # Reserved platform operations; not registered in AppModule by default
```

### Dashboard routes

| Route | Responsibility |
| --- | --- |
| `/login`, `/register` | Authentication and new tenant onboarding |
| `/forgot-password`, `/two-factor` | Account recovery and second-factor verification |
| `/dashboard` | Operational overview and usage metrics |
| `/dashboard/properties` | Listing inventory and create/edit flows |
| `/dashboard/leads` | Lead inbox and notification pipeline settings |
| `/dashboard/editor` | Full-screen website editor and responsive previews |
| `/dashboard/branding` | Legacy/basic brand settings and public-site access |
| `/dashboard/domain` | Slug, custom domain, DNS, and certificate verification |
| `/dashboard/contact` | Contact information, social channels, and map data |
| `/dashboard/team` | Tenant membership management |
| `/dashboard/subscription` | Plans, checkout, billing portal, and cancellation |
| `/dashboard/settings` | User profile, password, and account settings |
| `/dashboard/organization` | Organization selection and branch creation |

### Public website routes

| Route | Rendering behavior |
| --- | --- |
| `/` | Server-rendered section composition from the tenant's site configuration |
| `/imoveis` | Search, filters, sorting, layout selection, and pagination |
| `/imoveis/[slug]` | Listing details, gallery, costs, amenities, map, similar properties, and lead form |
| `/sitemap.xml` | Tenant-aware sitemap generated from active listings |
| `/robots.txt` | Crawl policy and tenant sitemap location |

## Core engineering decisions

### Tenant isolation at the data-access boundary

Authenticated access tokens contain the active `tenantId`. Protected controllers extract this value from the validated token rather than accepting it from request bodies. Services include the tenant identifier in reads, updates, and deletes, preventing a user from selecting another organization's resources by ID.

Public traffic uses a different boundary: the hostname resolves to a tenant slug, and public services translate that slug to the internal tenant ID before querying listings, configuration, or leads.

### Configuration-driven websites

Each tenant owns a `SiteConfig` record whose `data` column stores a typed JSON document. It includes:

- Global colors, typography, logo, favicon, and active template.
- Ordered, visible/hidden home page sections.
- Per-section settings for hero, search, listings, about, agents, testimonials, CTA, contact, and footer.
- Search page layout, filters, cards, columns, and pagination.
- Property detail gallery, contact, map, costs, amenities, and similar-listing behavior.

This design lets the editor evolve without requiring a database migration for every visual option. Shared types and defaults in `@imovdigital/types` keep the API, editor preview, and public renderer aligned.

### Template registry instead of duplicated pages

The public website resolves `classic` or `editorial` through a component registry. Both templates receive the same data and settings contracts while controlling their own visual implementation. The dashboard mirrors those variants in its previews, so the editing experience remains close to the published result.

See [`docs/site-templates.md`](docs/site-templates.md) for the design language and extension checklist.

### Subscription-aware product boundaries

Plans are persisted rather than hard-coded only in the UI. The API enforces property limits, user limits, custom-domain availability, lead access, and notification capabilities. `SubscriptionGuard` blocks canceled accounts and expired trials, while Stripe webhooks synchronize billing state.

### Direct-to-object-storage uploads

The API creates short-lived Cloudflare R2 presigned URLs. The browser uploads files directly to object storage, avoiding unnecessary API memory and bandwidth usage. The API still controls object keys and deletion.

## Data model

```mermaid
erDiagram
    PLAN ||--o{ TENANT : defines
    TENANT ||--o{ USER : contains
    TENANT ||--o{ PROPERTY : owns
    TENANT ||--o{ LEAD : receives
    TENANT ||--o| CONTACT_CONFIG : configures
    TENANT ||--o| SITE_CONFIG : publishes
    PROPERTY ||--o{ LEAD : attracts

    PLAN {
      uuid id PK
      string slug UK
      int monthlyPrice
      int yearlyPrice
      int propertyLimit
      int userLimit
      json features
    }
    TENANT {
      uuid id PK
      string slug UK
      string customDomain UK
      uuid planId FK
      enum subscriptionStatus
      datetime trialEndsAt
      string stripeCustomerId
      string stripeSubscriptionId
    }
    USER {
      uuid id PK
      uuid tenantId FK
      string email
      string passwordHash
      enum role
      datetime deletedAt
    }
    PROPERTY {
      uuid id PK
      uuid tenantId FK
      string slug
      enum type
      enum listingType
      int price
      json images
      boolean active
      boolean featured
    }
    LEAD {
      uuid id PK
      uuid tenantId FK
      uuid propertyId FK
      enum source
      boolean seen
    }
    CONTACT_CONFIG {
      uuid id PK
      uuid tenantId FK
      json businessHours
      json leadPipelineAgents
    }
    SITE_CONFIG {
      uuid id PK
      uuid tenantId FK
      json data
      boolean published
      datetime publishedAt
    }
    CANCELLATION_FEEDBACK {
      uuid id PK
      uuid tenantId
      uuid userId
      string reason
      string planName
    }
```

Important constraints include unique tenant slugs and custom domains, unique property slugs inside a tenant, unique user e-mails inside a tenant, cascade deletion for tenant-owned data, and `SetNull` behavior when a property linked to a lead is removed.

Money is stored as integer cents in Brazilian reais, avoiding floating-point errors in prices and billing values.

## API organization

All endpoints use the `/api` global prefix.

| Prefix | Access | Purpose |
| --- | --- | --- |
| `/api/auth` | Mixed | Registration, login, refresh, 2FA, password recovery, profile, and organization switching |
| `/api/plans` | Public | Available SaaS plans |
| `/api/tenant` | JWT + subscription | Tenant profile, metrics, slug, custom domain, and DNS verification |
| `/api/properties` | JWT + subscription | Tenant property inventory and SEO generation |
| `/api/users` | JWT + subscription | Team management |
| `/api/contact` | JWT + subscription | Contact and notification configuration |
| `/api/leads` | JWT + subscription | Lead inbox and read state |
| `/api/site-config` | JWT + subscription | Website configuration and publishing |
| `/api/upload` | JWT + subscription | Presigned upload and file deletion |
| `/api/files` | Public | Object delivery fallback/proxy |
| `/api/subscription` | Mixed | Subscription state, Checkout, Portal, cancellation, and Stripe webhook |
| `/api/public` | Public | Tenant storefront, listing search, lead capture, SEO, reviews, and domain resolution |
| `/api/admin` | Not enabled by default | Admin-key controller source exists, but its module is not registered in the current `AppModule` |

Public catalog reads are not globally throttled, but lead creation is explicitly rate-limited. Authentication endpoints also have stricter per-route limits.

## Security

- **JWT boundary:** protected routes validate bearer access tokens with Passport; refresh tokens use a different secret and lifetime.
- **Tenant scoping:** the active tenant comes from the validated token, and resource operations include `tenantId` in their database predicates.
- **Password storage:** passwords are hashed with bcrypt using a cost factor of 12.
- **Time-limited codes:** password recovery and 2FA codes are hashed before storage and expire after 15 and 10 minutes, respectively.
- **Enumeration resistance:** password recovery returns the same public response whether an e-mail exists or not.
- **Subscription enforcement:** a dedicated guard rejects canceled subscriptions and expired trials on protected product routes.
- **Input handling:** NestJS uses a global validation pipe with transformation, whitelisting, and rejection of unexpected fields on DTO-backed endpoints.
- **HTTP hardening:** Helmet is enabled on the API, and the Next.js application adds security headers.
- **Rate limiting:** global short/medium throttling is combined with stricter authentication and lead-submission rules.
- **Webhook integrity:** Stripe receives the raw request body and verifies the `stripe-signature` before processing events.
- **Account safeguards:** users are soft-deleted from personal settings, and business rules prevent removing the tenant owner.
- **Domain safeguards:** custom domain input is normalized and validated before infrastructure commands are constructed.

## Getting started

### Prerequisites

- Node.js 20 or newer
- Corepack and pnpm 9.15
- PostgreSQL
- Optional provider accounts for Stripe, Cloudflare R2, Resend, Anthropic, Google Maps, Z-API, and TikTok
- Stripe CLI only if local webhook testing is needed

### 1. Install dependencies

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
```

### 2. Configure the API

The applications run with their own working directories, so place the API environment file inside `apps/api`:

```bash
cp .env.example apps/api/.env
```

At minimum, update these values:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/imovdigital?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-secret"
```

External integrations can remain empty during initial development. E-mail verification codes are written to the API console when Resend is not configured.

### 3. Configure the frontends

Create `apps/dashboard/.env.local`:

```dotenv
VITE_API_URL="http://localhost:3000"
VITE_WEB_URL="http://localhost:5174"
VITE_GOOGLE_MAPS_API_KEY=""
VITE_SUPPORT_WHATSAPP=""
```

Create `apps/web/.env.local`:

```dotenv
API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
BASE_DOMAIN="imovdigital.com.br"
FALLBACK_TENANT="demo"
```

`VITE_API_URL` is an origin without `/api`; the dashboard client adds the prefix. The Next.js API URLs include `/api`.

### 4. Prepare the database

Create the PostgreSQL database referenced by `DATABASE_URL`, then run:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

The seed is idempotent and creates the Basic, Professional, and Multi-unit plans. It does not create a demo tenant; registration performs tenant onboarding transactionally.

For migration-based development, use `pnpm db:migrate` instead of `db:push`.

### 5. Start the workspace

```bash
pnpm dev
```

| Service | Local URL |
| --- | --- |
| API | `http://localhost:3000/api` |
| Dashboard | `http://localhost:5173` |
| Public website | `http://localhost:5174` |

Open the dashboard and register an account. Registration creates a tenant, owner, contact configuration, unique slug, and seven-day trial in a single database transaction.

After registration, either set `FALLBACK_TENANT` to the generated slug and restart the web app, or open the tenant through a localhost subdomain:

```text
http://your-agency-slug.localhost:5174
```

### 6. Test Stripe webhooks locally (optional)

After configuring Stripe credentials and installing the Stripe CLI:

```bash
pnpm stripe:listen
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`.

## Environment variables

### API

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Yes | Access-token signing secret |
| `JWT_EXPIRES_IN` | No | Access-token lifetime; defaults to `15m` |
| `JWT_REFRESH_SECRET` | Yes | Separate refresh-token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh-token lifetime; defaults to `7d` |
| `PORT` | No | API port; defaults to `3000` |
| `BASE_DOMAIN` | No | Base domain used for tenant subdomains and canonical URLs |
| `DASHBOARD_URL` | Stripe | Checkout and Billing Portal return URL |
| `STRIPE_SECRET_KEY` | Stripe | Server-side Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signature secret |
| `R2_ACCOUNT_ID` | Uploads | Cloudflare account identifier |
| `R2_ACCESS_KEY_ID` | Uploads | R2 S3-compatible access key |
| `R2_SECRET_ACCESS_KEY` | Uploads | R2 S3-compatible secret |
| `R2_BUCKET_NAME` | Uploads | Object storage bucket |
| `R2_PUBLIC_URL` | Uploads | Public CDN/base URL for stored files |
| `RESEND_API_KEY` | E-mail | Transactional e-mail provider key |
| `EMAIL_FROM` | E-mail | Verified sender address |
| `ANTHROPIC_API_KEY` | AI SEO | Generates property title/description metadata |
| `GOOGLE_MAPS_API_KEY` | Reviews | Server-side Google Places review lookup |
| `ZAPI_INSTANCE_ID` | WhatsApp | Z-API instance identifier |
| `ZAPI_TOKEN` | WhatsApp | Z-API instance token |
| `ZAPI_CLIENT_TOKEN` | WhatsApp | Optional Z-API client security token |
| `TIKTOK_PIXEL_ID` | Analytics | TikTok Events destination |
| `TIKTOK_ACCESS_TOKEN` | Analytics | TikTok Events API credential |
| `TIKTOK_TEST_EVENT_CODE` | No | Optional TikTok test event code |
| `ADMIN_API_KEY` | Admin API | Bearer key for internal platform endpoints |
| `SERVER_IP` | Custom domains | Expected DNS target during domain verification |
| `SSL_EMAIL` | Custom domains | ACME/certificate contact address |
| `CAPROVER_WEB_APP` | Custom domains | Target CapRover public-web application name |

### Dashboard

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Production | API origin without `/api`; local development can use the Vite proxy |
| `VITE_WEB_URL` | No | Public website origin used by preview/open-site actions |
| `VITE_GOOGLE_MAPS_API_KEY` | Maps | Browser key for address autocomplete and editor maps |
| `VITE_SUPPORT_WHATSAPP` | No | Support phone number in international format |

### Public website

| Variable | Required | Description |
| --- | --- | --- |
| `API_URL` | Production | Server-side API URL, including `/api` |
| `NEXT_PUBLIC_API_URL` | Production | Browser-visible API URL, including `/api` |
| `BASE_DOMAIN` | Production | Domain used to identify tenant subdomains |
| `FALLBACK_TENANT` | Local development | Tenant slug used when the hostname has no tenant |

## Available scripts

Run these commands from the repository root.

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts all workspace development tasks through Turborepo |
| `pnpm build` | Builds shared packages and all applications |
| `pnpm lint` | Runs package lint tasks; the public web package still requires a non-interactive ESLint configuration |
| `pnpm db:generate` | Generates the Prisma Client |
| `pnpm db:push` | Synchronizes the schema directly to the configured database |
| `pnpm db:migrate` | Creates/applies a Prisma development migration |
| `pnpm db:seed` | Upserts the three subscription plans |
| `pnpm stripe:listen` | Forwards Stripe CLI events to the local webhook |

An individual application can be targeted with a workspace filter:

```bash
pnpm --filter @imovdigital/api dev
pnpm --filter @imovdigital/dashboard dev
pnpm --filter @imovdigital/web dev
pnpm --filter @imovdigital/types build
```

## Deployment

The repository is designed to deploy the three applications independently:

| Artifact | Runtime |
| --- | --- |
| `Dockerfile.api` | Builds NestJS and runs `apps/api/dist/main.js` on port 3000 |
| `Dockerfile.dashboard` | Builds the Vite SPA and serves static files on port 80 |
| `Dockerfile.web` | Builds Next.js standalone output and runs it on port 3000 |
| `caddy/Dockerfile` | Proxies customer domains to the public website and issues on-demand TLS certificates |
| `captain-definition-*` | Selects the appropriate Dockerfile for each CapRover application |

The dashboard and public website receive browser-visible variables at build time. API secrets must be injected only at runtime.

A production environment should provide:

1. A persistent PostgreSQL instance and a migration step.
2. Separate API, dashboard, and public-web services.
3. Stripe webhook delivery to `/api/subscription/webhook`.
4. An R2 bucket and public CDN URL for media uploads.
5. Wildcard DNS for tenant subdomains.
6. Caddy or equivalent TLS/reverse-proxy infrastructure for custom domains.
7. Secure runtime secrets for JWT, Stripe, storage, e-mail, and optional integrations.

## Quality and current status

The repository uses TypeScript checks and production builds as its primary quality gates:

```bash
pnpm --filter @imovdigital/types lint
pnpm --filter @imovdigital/utils lint
pnpm --filter @imovdigital/api lint
pnpm --filter @imovdigital/dashboard lint
pnpm build
```

The public web package still uses Next.js's deprecated `next lint` command, which opens an ESLint setup prompt. Migrating that script to the ESLint CLI is required before the root `pnpm lint` command can be used as a non-interactive CI gate.

A dedicated automated test suite is not yet included. The highest-value next additions are API integration tests for tenant isolation and Stripe webhooks, service-level tests for plan limits, and end-to-end coverage for onboarding, publishing, search, and lead capture.

The project is under active development. Infrastructure-heavy integrations are optional locally and require their corresponding provider credentials in production.

## What this project demonstrates

- Designing a multi-tenant SaaS domain and enforcing tenant boundaries across authenticated and public traffic.
- Separating operational SPA concerns from server-rendered, SEO-sensitive public experiences.
- Building a configuration-driven visual editor with shared contracts, preview parity, autosave, history, and publishing state.
- Modeling subscription entitlements in both backend business rules and frontend capability checks.
- Integrating payment, storage, e-mail, AI, maps, analytics, messaging, DNS, and TLS services behind domain-focused modules.
- Owning a product end to end: data modeling, API design, frontend UX, third-party integrations, deployment artifacts, and operational trade-offs.

---

Built as a full-stack software engineering portfolio project for the Brazilian real estate market.
