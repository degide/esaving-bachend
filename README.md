# esaving-backend

A NestJS-based backend for the eSaving (Credit Jambo) technical test. Built with Prisma (Postgres), JWT authentication, and modular architecture to support accounts, users, loans, transactions, sessions and notifications. This file documents how to run, test, deploy and the design decisions and justifications required by the practical test.

---

## Table of contents
- Project overview
- Quick start (local)
- Environment variables
- Database (Prisma) — migrations & seed
- Scripts
- Running with Docker
- Testing strategy & running tests
- API surface (endpoints summary)
- Development guidelines & repository structure
- Observability, security & performance considerations
- CI / CD recommendations
- Design decisions
- Author

---

## Project overview
### - Tech stack:
  - NestJS (TypeScript) for application architecture (modular, DI, testability)
  - Prisma ORM for type-safe DB access and migrations
  - Postgres as the relational database
  - JWT for auth, Local strategy for credential validation
  - Docker for containerised deployments
- Goals:
  - Clear separation of concerns and modularity
  - Production-like defaults (migrations, seeding, logging)
  - Easy onboarding for reviewers and maintainers
  - Testable code with unit and e2e tests

### Repository structure (top-level)
- prisma/ — schema.prisma, migrations, seeds
- src/ — application source
  - modules/ — domain modules (accounts, auth, users, loans, transactions, notifications, sessions, prisma, admin, healthz)
  - common/ — shared decorators, guards, DTOs, exceptions
  - config/ — typed configuration
  - main.ts / app.module.ts — bootstrap and root module
- test/ — e2e tests
- Dockerfile, env.example, package.json, tsconfig.json

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
1. Build image: `docker build -t esaving-backend@latest .`
2. Run: `docker run -e DATABASE_URL="postgresql://..." -p 3000:3000 esaving-backend`

## Testing strategy & running tests
This project implements isolated tests for services and utilities.
- Run unit tests: `npm run test:cov`
- Run e2e tests: `npm run test:e2e`

## API docs

Each module exposes a controller with REST endpoints. DTOs are under src/modules/*/dto.

JSON: `GET /api/json`
YAML: `/api/yaml` or [API docs YAML file](https://raw.githubusercontent.com/degide/esaving-backend/refs/heads/master/swagger.yaml)

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