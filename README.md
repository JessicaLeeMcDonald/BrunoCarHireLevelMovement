# Bruno Vehicle Hire

A full-stack vehicle hire management system built for the "Solid Developer" assessment — vehicles, customers, and bookings, with Clean Architecture + CQRS on the backend and a feature-based React frontend.

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
- Checking whether a *new* booking overlaps *other* bookings requires querying the database, which a single entity can't do — that's `IBookingOverlapChecker`, a domain-defined interface implemented in Infrastructure and called from `CreateBookingCommandHandler` before constructing the `Booking`.
- `BookingCreatedEvent` demonstrates the domain events pattern (bonus requirement): raised inside `Booking.Create`, collected and dispatched by `UnitOfWork.SaveChangesAsync` via a generic `DomainEventNotification<T>` wrapper (keeps `IDomainEvent` free of any MediatR dependency), handled by a logging handler in the Application layer.

**API highlights**

- API key auth via a custom `AuthenticationHandler` reading `X-Api-Key` — integrates with `[Authorize]` and Swagger's security definition rather than reinventing 401 handling in ad-hoc middleware.
- `GlobalExceptionMiddleware` maps every domain exception to an RFC7807 `ProblemDetails` response with the correct status code (400/404/409/500) and, for field-attributable errors, an `errors: { fieldName: [...] }` dictionary that the frontend consumes directly.
- Mapping is manual (`ToDto()` extension methods) rather than AutoMapper — a deliberate call given the small number of entities; it keeps the mapping explicit and avoids reflection overhead for no real benefit here.

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

### Prerequisites

- .NET 10 SDK
- Node.js 20+ and npm
- Docker (for SQL Server)

### 1. Start SQL Server

```bash
docker compose up -d
```

This starts `mcr.microsoft.com/mssql/server:2022-latest` on port 1433.

### 2. Configure local secrets (one-time per machine)

The connection string and API key are never committed — they're stored via `dotnet user-secrets`, outside the repo:

```bash
cd backend/src/BrunoVehicleHire.Api
dotnet user-secrets set "ConnectionStrings:Default" "Server=localhost,1433;Database=BrunoVehicleHire;User Id=sa;Password=BrunoDev!2026;TrustServerCertificate=True"
dotnet user-secrets set "ApiKey:Value" "bruno-dev-local-key-2026"
```

(The password above matches the SQL Server container started in step 1. You can pick your own API key value instead — just use the same one in step 4.)

### 3. Run the backend API

```bash
cd backend
dotnet run --project src/BrunoVehicleHire.Api
```

On startup in the `Development` environment, the app automatically applies EF Core migrations and seeds a few vehicles, customers, and bookings if the database is empty (`DbSeeder`) — no manual migration step needed. The API listens on `http://localhost:5080`; Swagger UI is at `http://localhost:5080/swagger` (use the "Authorize" button with the API key from step 2 to try authenticated requests).

### 4. Run the frontend

```bash
cd frontend
cp .env.example .env.local
# edit .env.local: set VITE_API_KEY to the same value you used in step 2
npm install
npm run dev
```

Open `http://localhost:5173`.

## Running tests

```bash
cd backend
dotnet test
```

13 tests: `DateRangeOverlapTests` (the required business-rule test), `CreateBookingCommandHandlerTests` + `SoftDeleteVehicleCommandHandlerTests` (the required 2 command tests), `GetVehiclesListQueryHandlerTests` + `GetBookingByIdQueryHandlerTests` (the required 2 query tests) — all against mocked repositories via Moq, no database involved.

The frontend has no dedicated unit test suite (only the backend tests were required by the assessment); `npm run build` (type-checks with `tsc -b`) and `npm run lint` (oxlint) are the frontend's correctness gates.

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
