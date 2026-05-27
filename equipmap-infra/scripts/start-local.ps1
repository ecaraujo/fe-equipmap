[CmdletBinding()]
param(
  [switch]$NoBuild,
  [switch]$NoFrontend,
  [switch]$NoWait,
  [int]$HealthTimeoutSeconds = 180
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-Command {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-PortInUse {
  param([int]$Port)
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return [bool]$connection
}

function Invoke-Compose {
  param([string[]]$ComposeArgs)
  & docker @ComposeArgs
  if ($LASTEXITCODE -ne 0) {
    throw "docker $($ComposeArgs -join ' ') failed with exit code $LASTEXITCODE"
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$infraDir = Join-Path $repoRoot 'equipmap-infra'
$envFile = Join-Path $infraDir '.env'
$envExample = Join-Path $infraDir '.env.example'

if (-not (Test-Command 'docker')) {
  throw 'Docker CLI nao encontrado no PATH. Instale/inicie o Docker Desktop e tente novamente.'
}

if (-not $NoWait -and -not (Test-Command 'node')) {
  throw 'Node.js nao encontrado no PATH. Ele e necessario para executar scripts/check-health.mjs.'
}

Write-Step 'Preparing local environment'
if (-not (Test-Path $envFile)) {
  Copy-Item -Path $envExample -Destination $envFile
  Write-Host "Created $envFile from .env.example"
} else {
  Write-Host "Using existing $envFile"
}

$ports = @(4000, 5432, 5672, 9000, 9001, 15672, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088)
if (-not $NoFrontend) {
  $ports += 5173
}

$busyPorts = $ports | Where-Object { Test-PortInUse $_ }
if ($busyPorts.Count -gt 0) {
  Write-Host "Some expected ports are already listening: $($busyPorts -join ', ')" -ForegroundColor Yellow
  Write-Host 'If they belong to an existing EquipMap stack, Docker Compose will reuse/recreate the containers.'
  Write-Host 'If they belong to another process, stop it before starting this stack.'
}

Write-Step 'Starting Docker Compose stack'
Push-Location $infraDir
try {
  $services = @()
  if ($NoFrontend) {
    $services = @(
      'postgres',
      'rabbitmq',
      'minio',
      'minio-init',
      'auth-service',
      'condominium-service',
      'equipment-service',
      'maintenance-service',
      'warranty-service',
      'parking-service',
      'brigadier-service',
      'notification-service',
      'bff-equipmap'
    )
  }

  $composeArgs = @('compose', '--env-file', '.env', 'up', '-d')
  if (-not $NoBuild) {
    $composeArgs += '--build'
  }
  $composeArgs += $services

  Invoke-Compose -ComposeArgs $composeArgs

  if (-not $NoWait) {
    Write-Step 'Waiting for service healthchecks'
    $deadline = (Get-Date).AddSeconds($HealthTimeoutSeconds)
    do {
      try {
        node scripts\check-health.mjs
        if ($LASTEXITCODE -eq 0) {
          break
        }
      } catch {
        Write-Host 'Services are still starting...'
      }

      if ((Get-Date) -ge $deadline) {
        throw "Healthchecks did not pass within $HealthTimeoutSeconds seconds."
      }

      Start-Sleep -Seconds 5
    } while ($true)
  }
} finally {
  Pop-Location
}

Write-Step 'EquipMap is running'
if (-not $NoFrontend) {
  Write-Host 'Frontend:        http://localhost:5173'
}
Write-Host 'BFF GraphQL:     http://localhost:4000/graphql'
Write-Host 'RabbitMQ UI:     http://localhost:15672  (equipmap / equipmap)'
Write-Host 'MinIO Console:   http://localhost:9001   (equipmap / equipmap123)'
Write-Host 'Admin login:     admin@equipmap.local / admin123'
Write-Host ''
Write-Host 'Useful commands:'
Write-Host '  docker compose --env-file equipmap-infra/.env -f equipmap-infra/docker-compose.yml ps'
Write-Host '  docker compose --env-file equipmap-infra/.env -f equipmap-infra/docker-compose.yml logs -f bff-equipmap'
Write-Host '  docker compose --env-file equipmap-infra/.env -f equipmap-infra/docker-compose.yml down'
