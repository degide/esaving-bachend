# esaving-backend

A NestJS-based backend for the eSaving (Credit Jambo) technical test. Built with Prisma (Postgres), JWT authentication, and modular architecture to support accounts, users, loans, transactions, sessions and notifications. This file documents how to run, test, deploy and the design decisions and justifications required by the practical test.

---

## Table of contents
- Project overview
- Local Setup
- Environment variables
- Database (Prisma + Postgres)
- Running with Docker
- Testing
- API docs
- Development guidelines (contributores)
- Design decisions
- Project structure
- Security
- Author

---

## Project overview
### Tech stack:
  - NestJS (TypeScript) for application architecture (modular, DI, testability)
  - Prisma ORM for type-safe DB access and migrations
  - Postgres as the relational database
  - JWT for auth, Local strategy for credential validation
  - Docker for containerised deployments

### Repository structure

```bash
esaving-backens/
    ├── prisma
    │   ├── migrations                          # Database migrations.
    │   ├── schema.prisma                       # Database schema
    │   └── seeds                               # Database seed scripts (Bonus)
    ├── src
    │   ├── app.module.ts                       # Main app module
    │   ├── common                              # Shared resources
    │   │   ├── decorators
    │   │   │   └── auth.decorator.ts
    │   │   ├── dto
    │   │   │   └── response.dto.ts
    │   │   ├── exceptions                      # Custom exceptions
    │   │   ├── guards                          # Guards (Auth)
    │   │   │   ├── jwt-auth.guard.ts
    │   │   │   ├── local-auth.guard.ts
    │   │   │   └── role.guard.ts
    │   │   └── types                           # Shared types
    │   │       └── index.ts
    │   ├── config
    │   │   ├── app.config.ts
    │   │   ├── index.ts
    │   │   └── notification.config.ts
    │   ├── global.d.ts                         # Global typings
    │   ├── main.ts                             # Main entry file
    │   ├── middleware                          # Middlewares
    │   └── modules                             #Core feature modules
    │       ├── accounts
    │       │   ├── accounts.controller.spec.ts
    │       │   ├── accounts.controller.ts
    │       │   ├── accounts.module.ts
    │       │   ├── accounts.service.spec.ts
    │       │   ├── accounts.service.ts
    │       │   └── dto
    │       │       ├── account.dto.ts
    │       │       └── response.dto.ts
    │       ├── admin
    │       │   ├── admin.controller.spec.ts
    │       │   ├── admin.controller.ts
    │       │   ├── admin.module.ts
    │       │   ├── admin.service.spec.ts
    │       │   ├── admin.service.ts
    │       │   └── dto
    │       │       └── user-stats.dto.ts
    │       ├── auth
    │       │   ├── auth.controller.spec.ts
    │       │   ├── auth.controller.ts
    │       │   ├── auth.module.ts
    │       │   ├── auth.service.spec.ts
    │       │   ├── auth.service.ts
    │       │   ├── dto
    │       │   │   └── login.dto.ts
    │       │   └── strategies
    │       │       ├── jwt.strategy.ts
    │       │       └── local.strategy.ts
    │       ├── healthz
    │       │   ├── healthz.controller.spec.ts
    │       │   ├── healthz.controller.ts
    │       │   └── healthz.module.ts
    │       ├── loans
    │       │   ├── dto
    │       │   │   └── loans.dto.ts
    │       │   ├── loans.controller.spec.ts
    │       │   ├── loans.controller.ts
    │       │   ├── loans.module.ts
    │       │   ├── loans.service.spec.ts
    │       │   └── loans.service.ts
    │       ├── notifications
    │       │   ├── dto
    │       │   │   ├── notification.dto.ts
    │       │   │   └── response.dto.ts
    │       │   ├── notifications.controller.spec.ts
    │       │   ├── notifications.controller.ts
    │       │   ├── notifications.module.ts
    │       │   ├── notifications.service.spec.ts
    │       │   └── notifications.service.ts
    │       ├── prisma
    │       │   ├── prisma.models.ts
    │       │   └── prisma.service.ts
    │       ├── sessions
    │       │   ├── dto
    │       │   │   └── session.dto.ts
    │       │   ├── sessions.controller.spec.ts
    │       │   ├── sessions.controller.ts
    │       │   ├── sessions.module.ts
    │       │   ├── sessions.service.spec.ts
    │       │   └── sessions.service.ts
    │       ├── transactions
    │       │   ├── dto
    │       │   │   └── transactions.dto.ts
    │       │   ├── transactions.controller.spec.ts
    │       │   ├── transactions.controller.ts
    │       │   ├── transactions.module.ts
    │       │   ├── transactions.service.spec.ts
    │       │   └── transactions.service.ts
    │       └── users
    │           ├── dto
    │           │   ├── user.dto.ts
    │           │   └── user-profile.dto.ts
    │           ├── users.controller.spec.ts
    │           ├── users.controller.ts
    │           ├── users.module.ts
    │           ├── users.service.spec.ts
    │           └── users.service.ts
    ├── test
    │   ├── app.e2e-spec.ts                     # App Module e2s tests
    │   └── jest-e2e.json                       # Jest e2e tests config
    ├── README.md
    ├── tsconfig.build.json
    ├── tsconfig.json
    ├── Dockerfile                              # Dockerfile
    ├── env.example                             # Example env
    ├── eslint.config.mjs
    ├── LICENCE
    ├── nest-cli.json
    ├── package.json
    └── package-lock.json
```

## Local setup

### Prerequisites
- Node.js 22+ (LTS recommended)
- npm or yarn
- Postgres 16+
- (Optional) Docker & Docker Compose

### Setup
1) Copy environment template
    - `cp env.example .env`
    - Edit .env to set DATABASE_URL, JWT secrets and any other variables
2) Install dependencies
    - `npm ci`
3) Run Prisma generate
    - `npm run prisma:generate`
4) Apply database migrations & run seed (development)
    - `npx run prisma:migrate`
    - `npm run prisma:seed`
5) Start dev server
    - `npm run start:dev`
    - Default: `http://localhost:5002`

6) Health check
- `GET /api/healthz`

## Environment variables

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d
```
Make sure secrets are stored in secret managers for production.

## Database (Prisma + Postgres)

Update prisma schema `prisma/schema.prisma` to change/update the database schema. Prisma studio is accessible by running `npm run prisma:studio`


## Running with Docker

A pre-build image using github workflows: `ghcr.io/degide/esaving-backend@latest`

To build a local image, follow the following steps:
1. Build image: `docker build -t esaving-backend@latest .`
2. Run: `docker run -e DATABASE_URL="postgresql://..." -p 3000:3000 esaving-backend`

## Testing
This project implements isolated tests for services and utilities.
- Run unit tests: `npm run test:cov`
- Run e2e tests: `npm run test:e2e`

## API docs

Each module exposes a controller with REST endpoints. DTOs are under src/modules/*/dto.

- JSON: `GET /api/json`
- YAML: `/api/yaml` or [API docs YAML file](https://raw.githubusercontent.com/degide/esaving-backend/refs/heads/master/swagger.yaml)

Visit [/api/documentation](http://localhost:5002/api/documentation) to view the openapi documentation.

## Development guidelines (contributors)

Contributions to this projet must follow the following guidelines:
- TypeScript types enforced. Use Prisma models and DTOs for runtime validation.
- Use DTO + class-validator for input validation.
- Keep controllers thin (validate, authorize, forward to service).
- Business logic lives in services.
- Keep modules cohesive and small.
- Unit tests for services and guards, integration tests for controllers.
- Commit messages follow Conventional Commits (recommended): feat:, fix:, chore:, docs:, test:, refactor:


## Design decisions

### Framework: NestJS

A NodeJs framework. Provides modular structure, built-in DI, `guards/interceptors` and decorators which accelerate building well-structured and testable backend. NestJs provides built-in exception handling which requires (optionally) less tweaking. It maps cleanly to domain modules required by the test and scales well in a team due to conventions.

### ORM: Prisma

Type-safe DB client with good DX, migrations, and simpler query building than raw SQL while still allowing raw queries for complex cases. Prisma models map to TS types reducing RT errors.

### Database: PostgreSQL

ACID-compliant relational DB needed for financial operations (transactions, balances). Postgres has mature tooling and reliability for such workloads.

### Auth: JWT + Guards

JWT provides stateless authentication that scales for APIs. Combined with Nest Guards and role-based checks ensures clear and testable authorization flows. Sessions module can be used for session management or revocation lists if needed.

### Project structure
Each domain (accounts, users, loans, transactions, notifications) is self-contained. This increases maintainability, enables independent testing and easier onboarding.

### Security
Rate limiting, secret management, TLS, input validation are standard production requirements for protecting sensitive user and financial data.


## Author
- Egide HARERIMANA [egideharerimana085@gmail.com]