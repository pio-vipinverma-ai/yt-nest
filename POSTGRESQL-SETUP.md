# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the NestJS Todo Application.

## Prerequisites

- PostgreSQL installed on your local system
- Access to PostgreSQL command line or pgAdmin

## Installation

### Windows

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (recommended: PostgreSQL 14+)
   - Run the installer

2. **Installation Steps**
   - Keep default port: `5432`
   - Set a password for the `postgres` user (remember this!)
   - Install pgAdmin (comes with installer)
   - Complete installation

3. **Verify Installation**
   ```powershell
   psql --version
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or using Postgres.app
# Download from: https://postgresapp.com/
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Setup

### Method 1: Using Command Line (psql)

1. **Connect to PostgreSQL**
   ```powershell
   # Windows (PowerShell)
   psql -U postgres

   # Or specify full path if not in PATH
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE todo_db;
   ```

3. **Verify Database**
   ```sql
   \l
   ```
   You should see `todo_db` in the list.

4. **Exit psql**
   ```sql
   \q
   ```

### Method 2: Using pgAdmin

1. **Open pgAdmin** (installed with PostgreSQL)

2. **Connect to Server**
   - Expand "Servers" → "PostgreSQL"
   - Enter your password

3. **Create Database**
   - Right-click "Databases" → "Create" → "Database"
   - Database name: `todo_db`
   - Owner: `postgres`
   - Click "Save"

4. **Verify**
   - Database should appear under "Databases" list

## Configure Application

### 1. Update `.env` File

Edit the `.env` file in your project root:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_DATABASE=todo_db

# Application
PORT=3000
NODE_ENV=development
```

**Important**: Replace `your_postgres_password_here` with your actual PostgreSQL password!

### 2. Verify Configuration

The application is already configured to use these environment variables in [app.module.ts](src/app.module.ts).

## Start the Application

```powershell
npm run start:dev
```

You should see output like:
```
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'todos'
query: CREATE TABLE "todos" (...)
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000
```

## Verify Database

### Using psql

```sql
-- Connect to database
psql -U postgres -d todo_db

-- List tables
\dt

-- View todos table structure
\d todos

-- View data
SELECT * FROM todos;

-- Exit
\q
```

### Using pgAdmin

1. Navigate to: Servers → PostgreSQL → Databases → todo_db → Schemas → public → Tables
2. Right-click `todos` → "View/Edit Data" → "All Rows"

## Troubleshooting

### Connection Refused

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solutions**:
1. Verify PostgreSQL is running:
   ```powershell
   # Windows
   Get-Service -Name postgresql*
   
   # Should show "Running"
   ```

2. Start PostgreSQL service:
   ```powershell
   # Windows (Run as Administrator)
   Start-Service postgresql-x64-15  # Adjust version number
   
   # Or use Services app (services.msc)
   ```

3. Check port 5432 is available:
   ```powershell
   netstat -an | findstr "5432"
   ```

### Authentication Failed

**Error**: `password authentication failed for user "postgres"`

**Solutions**:
1. Verify password in `.env` matches PostgreSQL password
2. Reset PostgreSQL password:
   ```sql
   -- As superuser
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```

### Database Does Not Exist

**Error**: `database "todo_db" does not exist`

**Solution**: Create the database using one of the methods above.

### Permission Denied

**Error**: `permission denied for schema public`

**Solution**:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

## Database Schema

The application will automatically create this table:

```sql
CREATE TABLE todos (
    id uuid PRIMARY KEY,
    title varchar(100) NOT NULL,
    description varchar(500),
    completed boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);
```

## Production Configuration

### 1. Disable synchronize

In production, **never** use `synchronize: true`. Update your production `.env`:

```env
NODE_ENV=production
```

This automatically disables synchronize in [app.module.ts](src/app.module.ts).

### 2. Use Migrations

```bash
# Install TypeORM CLI
npm install -g typeorm

# Generate migration
npm run typeorm migration:generate -- -n CreateTodoTable

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

### 3. Enable SSL

For production databases (like RDS, Heroku Postgres):

```typescript
// In app.module.ts
ssl: {
  rejectUnauthorized: false, // For self-signed certificates
}
```

### 4. Use Connection Pooling

PostgreSQL supports connection pooling by default. Configure in `.env`:

```env
DB_POOL_MAX=10
DB_POOL_MIN=2
```

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
```

### Production
```env
NODE_ENV=production
DB_HOST=your-production-host
DB_PORT=5432
DB_SSL=true
```

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to database
\c todo_db

-- List tables
\dt

-- Describe table
\d todos

-- View table data
SELECT * FROM todos;

-- Count records
SELECT COUNT(*) FROM todos;

-- Drop table (careful!)
DROP TABLE todos;

-- Drop database (careful!)
DROP DATABASE todo_db;
```

## Connection String Alternative

Instead of individual variables, you can use a connection string:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/todo_db
```

Update `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: [Todo],
  synchronize: configService.get('NODE_ENV') === 'development',
})
```

## Backup and Restore

### Backup
```powershell
pg_dump -U postgres -d todo_db -f backup.sql
```

### Restore
```powershell
psql -U postgres -d todo_db -f backup.sql
```

## GUI Tools

- **pgAdmin**: Included with PostgreSQL installer
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/
- **DataGrip**: https://www.jetbrains.com/datagrip/

## Testing Connection

Create a test script `test-db-connection.ps1`:

```powershell
Write-Host "Testing PostgreSQL connection..." -ForegroundColor Yellow

try {
    psql -U postgres -d todo_db -c "SELECT version();"
    Write-Host "✓ Connection successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Connection failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

## Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database created (`todo_db`)
3. ✅ `.env` file configured
4. ✅ Application updated
5. 🚀 Start the application: `npm run start:dev`
6. 🧪 Test the API: `.\test-api.ps1`

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeORM PostgreSQL](https://typeorm.io/#/connection-options/postgres-connection-options)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)

---

Need help? Check the troubleshooting section or create an issue!
