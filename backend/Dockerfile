# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first so `dotnet restore` is cached independently of source changes.
COPY BrunoVehicleHire.slnx ./
COPY src/BrunoVehicleHire.Domain/*.csproj src/BrunoVehicleHire.Domain/
COPY src/BrunoVehicleHire.Application/*.csproj src/BrunoVehicleHire.Application/
COPY src/BrunoVehicleHire.Infrastructure/*.csproj src/BrunoVehicleHire.Infrastructure/
COPY src/BrunoVehicleHire.Api/*.csproj src/BrunoVehicleHire.Api/
COPY tests/BrunoVehicleHire.Tests/*.csproj tests/BrunoVehicleHire.Tests/
RUN dotnet restore BrunoVehicleHire.slnx

COPY . .
RUN dotnet publish src/BrunoVehicleHire.Api/BrunoVehicleHire.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "BrunoVehicleHire.Api.dll"]
