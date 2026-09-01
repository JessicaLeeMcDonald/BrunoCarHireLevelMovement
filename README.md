# Bruno Vehicle Hire

[![Backend Tests](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/tests.yml/badge.svg)](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/tests.yml)
[![Frontend CI](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/frontend.yml/badge.svg)](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/frontend.yml)
[![Docker Build](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/docker-build.yml/badge.svg)](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/docker-build.yml)
[![CodeQL](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/codeql.yml/badge.svg)](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/JessicaLeeMcDonald/BrunoCarHireLevelMovement?label=version&sort=semver)](https://github.com/JessicaLeeMcDonald/BrunoCarHireLevelMovement/releases)
![Tests](https://img.shields.io/badge/tests-13%2F13%20passing-2ea44f)
![Coverage](<https://img.shields.io/badge/coverage-25%25%20(scoped)-blue>)

A full-stack vehicle hire management system — vehicles, customers, and bookings, with Clean Architecture + CQRS on the backend and a feature-based React frontend.

## Tech stack

- **Backend:** .NET 10, ASP.NET Core Web API, EF Core (SQL Server), MediatR (CQRS), FluentValidation, Serilog, Swashbuckle
- **Frontend:** React 19 + TypeScript, Vite, React Router, Axios, TanStack React Query, React Hook Form + Zod
- **Database:** SQL Server (via Docker)
- **Tests:** xUnit + Moq + FluentAssertions

## Architecture

### Backend — Clean Architecture + CQRS

```
backend/
├── src/
│   ├── BrunoVehicleHire.Domain/          # Entities, value objects, domain events, exceptions,
│   │                                       repository/UoW interfaces — no external dependencies
│   ├── BrunoVehicleHire.Application/      # MediatR commands/queries, DTOs, FluentValidation,
│   │                                       validation pipeline behavior, domain event handlers
│   ├── BrunoVehicleHire.Infrastructure/   # EF Core DbContext, repositories, UnitOfWork,
│   │                                       booking overlap checker, seed data
│   └── BrunoVehicleHire.Api/              # Thin controllers, API key auth, global exception
│                                           middleware, Swagger, Serilog
└── tests/
    └── BrunoVehicleHire.Tests/            # Unit tests (handlers + domain rules)
```

Each layer only depends on the layers "below" it (`Api → Application + Infrastructure → Application + Domain`, `Application → Domain`), so the Domain project has zero framework dependencies.

**Domain highlights**

- `Vehicle`, `Customer`, `Booking` are rich entities — business rules live on the entity (`Vehicle.SoftDelete()`, `Booking.Cancel()`/`Complete()`/`Delete()` all self-validate and throw domain exceptions on an invalid transition).
- `DateRange` is a value object encapsulating the `EndDate > StartDate` rule and pairwise overlap detection (`OverlapsWith`) — this is what `DateRangeOverlapTests` exercises directly, with no mocks.
- Checking whether a _new_ booking overlaps _other_ bookings requires querying the database, which a single entity can't do — that's `IBookingOverlapChecker`, a domain-defined interface implemented in Infrastructure and called from `CreateBookingCommandHandler` before constructing the `Booking`.
- `BookingCreatedEvent` demonstrates the domain events pattern (bonus requirement): raised inside `Booking.Create`, collected and dispatched by `UnitOfWork.SaveChangesAsync` via a generic `DomainEventNotification<T>` wrapper (keeps `IDomainEvent` free of any MediatR dependency), handled by a logging handler in the Application layer.

**API highlights**

- API key auth via a custom `AuthenticationHandler` reading `X-Api-Key` — integrates with `[Authorize]` and Swagger's security definition rather than reinventing 401 handling in ad-hoc middleware.
- `GlobalExceptionMiddleware` maps every domain exception to an RFC7807 `ProblemDetails` response with the correct status code (400/404/409/500) and, for field-attributable errors, an `errors: { fieldName: [...] }` dictionary that the frontend consumes directly.
- Mapping is manual (`ToDto()` extension methods) rather than AutoMapper — a deliberate call given the small number of entities; it keeps the mapping explicit and avoids reflection overhead for no real benefit here.

**Design patterns in use**

Beyond the required Repository/CQRS/MediatR/Unit of Work, a few classic patterns fall out of the design naturally rather than being bolted on:

- **Factory Method** — `Vehicle.Create()`, `Customer.Create()`, `Booking.Create()` are the only way to construct these entities (private parameterless constructors for EF Core only). Each factory enforces its invariants at construction time, so an invalid entity can never exist.
- **Observer** — `Booking.Create()` raises `BookingCreatedEvent`; `UnitOfWork.SaveChangesAsync` collects and publishes it via MediatR's `IPublisher`, and `BookingCreatedEventHandler` subscribes independently. The entity has no idea anything is listening.
- **Value Object** — `DateRange` is immutable and equality-by-value, encapsulating the overlap/ordering rules so they can't be re-implemented (or gotten wrong) elsewhere.
- **Pipeline/Decorator** — `ValidationBehavior<TRequest, TResponse>` wraps every command/query handler via MediatR's pipeline behaviors, running FluentValidation before the handler ever executes, without any handler needing to know validation happened.

Deliberately not reached for: Strategy, Builder, Singleton, Adapter, etc. — the domain here is three entities and one real business rule, and forcing in more named patterns than the problem calls for would be over-engineering.

### Frontend — feature-based React

```
frontend/src/
├── app/          # Providers (React Query, error boundary, toast, dialog), router, nav layout
├── features/
│   ├── vehicles/
│   ├── customers/
│   └── bookings/
│       each: api/ (axios calls) · hooks/ (React Query + mutations) · schemas/ (Zod)
│       types/ (dto.ts wire shape + model.ts app shape, with a mapper) · components/ · pages/
└── shared/
    ├── api/        # Single axios instance + API-key interceptor, RFC7807 error normalizer
    ├── components/ # Modal, ConfirmDialog, DataTable, Pagination, FormField, DateRangeField,
    │               # Skeleton, EmptyState, ErrorBoundary, Toast
    ├── context/    # DialogContext — imperative confirm() with no prop drilling
    ├── hooks/      # useDebouncedValue, useQueryParamsState (filters/pagination synced to the URL)
    └── utils/      # date/currency formatting
```

**State management:** TanStack Query is the state layer for all server data — the domain here is entirely server-state (lists, filters resolved server-side, mutation results), so there's no Redux/Zustand. Query keys use a per-feature factory (`vehicleKeys.list(filters)`, etc.), mutations invalidate the relevant list/detail keys on success, and booking mutations additionally invalidate vehicle list keys since availability changes when a booking is created. Local UI-only state (which confirm dialog is open, toast queue) lives in small contexts.

**DTO vs. model:** each feature has a `types/dto.ts` mirroring the API's JSON shape exactly and a `types/model.ts` with the app-facing shape (dates as `Date` instead of ISO strings); a `toXModel()` mapper runs inside each query's `select`, so components never see raw wire data.

**Vehicles** is the reference pattern the other two features follow: filterable + paginated list, Zod/RHF-validated create/edit form, remove-with-confirm. **Bookings** is the richest — vehicle/customer selects, a date range picker, and server-driven overlap errors surfaced inline on the vehicle field (matching the backend's `errors.vehicleId` contract), plus status-gated Complete/Cancel/Delete actions.

## Getting started

Two ways to run this: fully containerized (fastest, nothing but Docker required), or natively on your machine (better for active development — hot reload on both sides).

### Option A — Fully Dockerized

**Prerequisite:** Docker Desktop only.

```bash
docker compose up -d --build
```

This builds and runs all three services — SQL Server, the API, and the frontend — each from its own `Dockerfile` ([`backend/Dockerfile`](backend/Dockerfile), [`frontend/Dockerfile`](frontend/Dockerfile)):

- **`sqlserver`** — unchanged, with a healthcheck the other services wait on.
- **`api`** — multi-stage build (SDK image to publish, `aspnet` runtime image to run); the connection string and API key are supplied as environment variables in `docker-compose.yml` rather than `dotnet user-secrets` (which is a local-machine-only mechanism that doesn't exist inside a container) — same dev-only values used everywhere else in this README. Uploaded vehicle photos persist in a named volume (`vehicle-images`) across container recreates.
- **`frontend`** — multi-stage build (Node to run `vite build`, then a minimal `nginx` image to serve the static output), with an `nginx.conf` that falls back to `index.html` for client-side routes so refreshing `/vehicles` doesn't 404.

Migrations and seeding still happen automatically on the API container's first start, exactly as they do natively. Once it's up:

- Frontend: `http://localhost:5173`
- API / Swagger: `http://localhost:5080/swagger`

`docker compose down` stops everything (add `-v` wipe the database and uploaded images — the named volumes otherwise persist across restarts).

### Option B — Native, with hot reload

**Prerequisites:** .NET 10 SDK, Node.js 20+, Docker Desktop.

```powershell
.\setup.ps1
```

This single script: starts SQL Server in Docker and waits for it to report healthy, configures the backend's connection string and API key via `dotnet user-secrets`, writes `frontend/.env.local`, and restores/installs both projects' packages. It's idempotent — re-running it is always safe, and it won't overwrite an `.env.local` you've already customized. Pass `-ApiKey "your-own-key"` for a different dev key.

In two terminals:

```bash
cd backend && dotnet run --project src/BrunoVehicleHire.Api
```

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`. Swagger UI is at `http://localhost:5080/swagger` (use the "Authorize" button with the API key to try authenticated requests).

<details>
<summary><strong>Doing Option B by hand instead (no PowerShell, e.g. macOS/Linux)</strong></summary>

```bash
# 1. Start SQL Server
docker compose up -d sqlserver --wait

# 2. Configure backend secrets (never committed)
cd backend/src/BrunoVehicleHire.Api
dotnet user-secrets set "ConnectionStrings:Default" "Server=localhost,1433;Database=BrunoVehicleHire;User Id=sa;Password=BrunoDev!2026;TrustServerCertificate=True"
dotnet user-secrets set "ApiKey:Value" "bruno-dev-local-key-2026"
cd ../../..

# 3. Frontend environment
cd frontend
cp .env.example .env.local
# edit .env.local: set VITE_API_KEY to the same value used above
npm install
cd ..
```

Then run the backend and frontend as shown above.

</details>

## Running tests

```bash
cd backend
dotnet test
```

Every push and PR to `main` also runs this in CI — see [`.github/workflows/tests.yml`](.github/workflows/tests.yml). The workflow runs the full suite with code coverage collection (`coverlet`) and publishes a coverage report to the run's job summary, so results are visible without downloading anything.

### Results (last full run)

|                      |                                                     |
| -------------------- | --------------------------------------------------- |
| **Result**           | ✅ **13 / 13 passing** — 0 failed, 0 skipped        |
| **Duration**         | ~75 ms (mocked repositories, no database)           |
| **Required minimum** | 2 commands ✓ · 2 queries ✓ · 1 business-rule test ✓ |

<details>
<summary><strong>Full breakdown by required category</strong></summary>

| Category      | Test class                             | Cases | What it proves                                                                                                                                                                                                                                     |
| ------------- | -------------------------------------- | :---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business rule | `DateRangeOverlapTests`                |   5   | `EndDate > StartDate` is enforced at construction; `OverlapsWith` correctly detects overlap across 4 date-range scenarios (partial overlap, adjacent-not-overlapping, disjoint, fully-contained) — tested directly on the value object, zero mocks |
| Command       | `CreateBookingCommandHandlerTests`     |   2   | A valid booking is created with the correct calculated `TotalPrice`; an overlapping booking throws `OverlappingBookingException` and never reaches `SaveChanges`                                                                                   |
| Command       | `SoftDeleteVehicleCommandHandlerTests` |   2   | An existing vehicle is marked deleted and saved; a missing vehicle throws `NotFoundException`                                                                                                                                                      |
| Query         | `GetVehiclesListQueryHandlerTests`     |   2   | Repository results map correctly into a `PagedResult<VehicleDto>`; out-of-range pagination input is normalized rather than erroring                                                                                                                |
| Query         | `GetBookingByIdQueryHandlerTests`      |   2   | An existing booking maps to its DTO; a missing booking throws `NotFoundException`                                                                                                                                                                  |

</details>

### Coverage

<details>
<summary><strong>25% overall (Domain 58% · Application 26% · Infrastructure 0%) — scope is deliberate, see below</strong></summary>

| Layer                           | Line coverage | Why                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | :-----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Domain`                        |    **58%**    | Entities and `DateRange` carry the real business rules — this is the layer the required business-rule test targets directly, and it shows.                                                                                                                                                                   |
| `Application`                   |    **26%**    | The 4 required handlers (2 commands, 2 queries) are covered at 90–100%; the other CRUD handlers, validators, and DI wiring were out of scope for the assessment's stated minimum and are exercised manually via Swagger/Bruno instead of by a unit test.                                                     |
| `Infrastructure`                |    **0%**     | Repository/EF Core code needs a real database to test meaningfully — mocking `DbContext` directly is famously awkward and tests little of value. This is intentionally an **integration-test gap**, not a unit-test gap: the honest fix is tests against a real (test-container) SQL Server, not more mocks. |
| _(EF Core migrations excluded)_ |       —       | Auto-generated scaffolding, not hand-written logic — including them would dilute the number without saying anything real.                                                                                                                                                                                    |

**Why not chase a higher number:** the required minimum was 2 commands, 2 queries, and 1 business-rule test — met exactly, and covered at 90–100% each. The 25% aggregate reflects an intentionally narrow, high-value test surface rather than broad shallow coverage across code that's better verified by an integration test or manual API exercise. See the [Assumptions](#assumptions) section and the project's interview notes for the fuller version of this trade-off.

</details>

The frontend has no dedicated unit test suite (only the backend tests were required by the assessment); `npm run build` (type-checks with `tsc -b`) and `npm run lint` (oxlint) are the frontend's correctness gates.

## Versioning

Semantic version tags (`vMAJOR.MINOR.PATCH`) are cut automatically by [`.github/workflows/release.yml`](.github/workflows/release.yml) on every push to `main` — it bumps the patch version, tags it, and publishes a matching GitHub Release. The badge at the top of this README always reflects the latest release.

To bump minor or major instead of the default patch, include `#minor` or `#major` anywhere in the commit message.

## Seed data

On first run, `DbSeeder` inserts 3 vehicles, 2 customers, and 2 bookings (one upcoming/active, one past/completed) so the app and Swagger examples have data to work with immediately. Seeding is idempotent (skipped if any vehicle already exists).

## Assumptions

- **Single internal-tool tenant.** One shared API key for the whole app — no per-user login, roles, or permissions. This is a staff-facing counter tool, not a customer-facing multi-tenant product.
- **Bookings are date-only, not date-time.** Overlap and availability checks compare calendar days; there's no same-day multiple-shift/hourly granularity.
- **Bookings aren't edited after creation.** Only cancel/complete/delete are supported, matching how a real rental desk works — to change dates or the vehicle, cancel and create a new booking rather than amend one in place.
- **`TotalPrice` is snapshotted at booking creation** (`dailyRate × days` at that moment) and never recalculated — a later change to a vehicle's daily rate doesn't retroactively change existing bookings' totals.
- **A booking can outlive the vehicle it references.** Soft-deleting a vehicle removes it from listings and future bookability, but past/existing bookings still display it correctly.
- **Vehicle photos are optional**, and seed data ships original illustrative artwork rather than real vehicle photography, to avoid any real-world trademark/likeness concerns in a demo dataset.
- **Local secrets are dev-only convenience values** (via `dotnet user-secrets`), not a production secrets-management strategy (e.g., Key Vault) — out of scope for this assessment.
