# Quick PostgreSQL Setup Script
# Run this script to create the database

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "`n✗ PostgreSQL not found in PATH" -ForegroundColor Red
    Write-Host "`nTrying common PostgreSQL installation paths..." -ForegroundColor Yellow
    
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
    )
    
    $found = $false
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $psqlPath = $path
            $found = $true
            Write-Host "✓ Found PostgreSQL at: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $found) {
        Write-Host "`n✗ Could not find PostgreSQL installation" -ForegroundColor Red
        Write-Host "`nPlease install PostgreSQL from:" -ForegroundColor Yellow
        Write-Host "https://www.postgresql.org/download/windows/`n" -ForegroundColor White
        exit 1
    }
} else {
    $psqlPath = "psql"
}

Write-Host "`n[1/3] Checking PostgreSQL connection..." -ForegroundColor Yellow

# Test connection
$testConnection = & $psqlPath -U postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to connect to PostgreSQL" -ForegroundColor Red
    Write-Host "`nPossible issues:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL service is not running" -ForegroundColor White
    Write-Host "  2. Wrong password for 'postgres' user" -ForegroundColor White
    Write-Host "  3. PostgreSQL not listening on localhost:5432`n" -ForegroundColor White
    
    Write-Host "To start PostgreSQL service (as Administrator):" -ForegroundColor Yellow
    Write-Host "  Get-Service -Name postgresql*" -ForegroundColor White
    Write-Host "  Start-Service postgresql-x64-15`n" -ForegroundColor White
    exit 1
}

Write-Host "✓ Connected to PostgreSQL successfully" -ForegroundColor Green

Write-Host "`n[2/3] Creating database 'todo_db'..." -ForegroundColor Yellow

# Check if database exists
$dbExists = & $psqlPath -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='todo_db'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "⚠ Database 'todo_db' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/N)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & $psqlPath -U postgres -c "DROP DATABASE todo_db;" 2>&1 | Out-Null
        
        Write-Host "Creating new database..." -ForegroundColor Yellow
        & $psqlPath -U postgres -c "CREATE DATABASE todo_db;" 2>&1 | Out-Null
        Write-Host "✓ Database recreated successfully" -ForegroundColor Green
    } else {
        Write-Host "✓ Using existing database" -ForegroundColor Green
    }
} else {
    & $psqlPath -U postgres -c "CREATE DATABASE todo_db;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database 'todo_db' created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[3/3] Verifying database..." -ForegroundColor Yellow

$dbList = & $psqlPath -U postgres -tAc "SELECT datname FROM pg_database WHERE datname='todo_db';"

if ($dbList -eq "todo_db") {
    Write-Host "✓ Database verified" -ForegroundColor Green
} else {
    Write-Host "✗ Database verification failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! ✓" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nDatabase Information:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: todo_db" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Update your .env file with PostgreSQL credentials" -ForegroundColor White
Write-Host "  2. Run: npm run start:dev" -ForegroundColor White
Write-Host "  3. The 'todos' table will be created automatically`n" -ForegroundColor White

Write-Host "To view database:" -ForegroundColor Yellow
Write-Host "  psql -U postgres -d todo_db`n" -ForegroundColor White
