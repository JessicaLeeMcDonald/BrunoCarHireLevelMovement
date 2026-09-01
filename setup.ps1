#requires -version 5.1
<#
.SYNOPSIS
  One-time local environment setup for Bruno Vehicle Hire.

.DESCRIPTION
  Starts SQL Server (Docker), configures backend secrets via dotnet user-secrets,
  writes the frontend's .env.local, and installs frontend dependencies.
  Safe to re-run at any time — every step is idempotent.

.PARAMETER ApiKey
  Override the dev API key used by both the backend and the frontend.
  Defaults to the value already documented in the README.

.EXAMPLE
  .\setup.ps1
#>

param(
    [string]$ApiKey = "bruno-dev-local-key-2026"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$connectionString = "Server=localhost,1433;Database=BrunoVehicleHire;User Id=sa;Password=BrunoDev!2026;TrustServerCertificate=True"

function Write-Step($text) {
    Write-Host ""
    Write-Host "==> $text" -ForegroundColor Cyan
}

function Require-Command($name, $hint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "Missing required tool: $name" -ForegroundColor Red
        Write-Host "  $hint" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Bruno Vehicle Hire -- local setup" -ForegroundColor Green
Write-Host "This configures everything needed to run the app locally. Safe to re-run."

Write-Step "Checking prerequisites"
Require-Command "dotnet" "Install the .NET 10 SDK: https://dotnet.microsoft.com/download"
Require-Command "docker" "Install Docker Desktop: https://www.docker.com/products/docker-desktop"
Require-Command "npm"    "Install Node.js 20+: https://nodejs.org"
Write-Host "  dotnet, docker, npm all found."

Write-Step "Starting SQL Server (Docker) and waiting for it to be healthy"
Push-Location $root
try {
    docker compose up -d --wait
    if ($LASTEXITCODE -ne 0) { throw "docker compose failed to bring SQL Server up healthy." }
}
finally {
    Pop-Location
}
Write-Host "  SQL Server is up and healthy on localhost:1433."

Write-Step "Configuring backend secrets (dotnet user-secrets)"
$apiProject = Join-Path $root "backend\src\BrunoVehicleHire.Api\BrunoVehicleHire.Api.csproj"
dotnet user-secrets init --project $apiProject | Out-Null
dotnet user-secrets set "ConnectionStrings:Default" $connectionString --project $apiProject | Out-Null
dotnet user-secrets set "ApiKey:Value" $ApiKey --project $apiProject | Out-Null
Write-Host "  Connection string and API key stored outside the repo via user-secrets."

Write-Step "Writing frontend/.env.local"
$envLocalPath = Join-Path $root "frontend\.env.local"
if (Test-Path $envLocalPath) {
    Write-Host "  frontend/.env.local already exists -- leaving it untouched."
}
else {
    @"
VITE_API_BASE_URL=http://localhost:5080/api
VITE_API_KEY=$ApiKey
"@ | Set-Content -Path $envLocalPath -NoNewline
    Write-Host "  Created frontend/.env.local."
}

Write-Step "Restoring backend packages"
dotnet restore (Join-Path $root "backend\BrunoVehicleHire.slnx") | Out-Null
Write-Host "  Backend packages restored."

Write-Step "Installing frontend packages (npm install)"
Push-Location (Join-Path $root "frontend")
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host "The database will auto-migrate and seed the first time the API runs."
Write-Host ""
Write-Host "Next steps, in two terminals:"
Write-Host "  1) cd backend && dotnet run --project src/BrunoVehicleHire.Api"
Write-Host "  2) cd frontend && npm run dev"
Write-Host ""
Write-Host "Then open http://localhost:5173"
