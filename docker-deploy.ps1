# Logware Docker Deployment Script
# PowerShell script to deploy the Logware platform using Docker

Write-Host "==== Logware Docker Deployment ====" -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = (docker info 2>$null)
if (-not $dockerRunning) {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running... proceeding with deployment." -ForegroundColor Green

# Create docker network if it doesn't exist
$networkExists = docker network ls | Select-String -Pattern "logware-network"
if (-not $networkExists) {
    Write-Host "Creating logware-network..." -ForegroundColor Yellow
    docker network create logware-network
} else {
    Write-Host "logware-network already exists." -ForegroundColor Green
}

# Load environment variables
if (Test-Path .\.env.production) {
    Write-Host "Loading environment variables from .env.production" -ForegroundColor Yellow
    Get-Content .\.env.production | ForEach-Object {
        if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.StartsWith('#')) {
            $key, $value = $_.Split('=', 2)
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "Warning: .env.production file not found. Using default values." -ForegroundColor Yellow
}

# Create directories for volume mounts if they don't exist
if (-not (Test-Path .\docker\data\mongodb)) {
    New-Item -ItemType Directory -Path .\docker\data\mongodb -Force | Out-Null
    Write-Host "Created MongoDB data directory." -ForegroundColor Yellow
}

if (-not (Test-Path .\docker\logs)) {
    New-Item -ItemType Directory -Path .\docker\logs -Force | Out-Null
    Write-Host "Created logs directory." -ForegroundColor Yellow
}

# Stop and remove existing containers to ensure clean deployment
Write-Host "Stopping any existing Logware containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Build and start the containers
Write-Host "Building and starting Logware containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
Write-Host "Checking deployment status..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$containers = docker-compose -f docker-compose.prod.yml ps -q | Measure-Object | Select-Object -ExpandProperty Count

if ($containers -gt 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "The application is now running at:"
    Write-Host "  Frontend: http://localhost:$($env:FRONTEND_PORT -eq $null ? '80' : $env:FRONTEND_PORT)" -ForegroundColor Cyan
    Write-Host "  Backend API: http://localhost:$($env:BACKEND_PORT -eq $null ? '5000' : $env:BACKEND_PORT)" -ForegroundColor Cyan
    
    Write-Host "`nUse the following commands to manage the deployment:"
    Write-Host "  - View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
    Write-Host "  - Stop services: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
    Write-Host "  - Restart services: docker-compose -f docker-compose.prod.yml restart" -ForegroundColor Yellow
} else {
    Write-Host "Error: Deployment failed. Please check the logs." -ForegroundColor Red
    docker-compose -f docker-compose.prod.yml logs
}
