# Todo Entity - PostgreSQL Schema Reference

## Entity Overview

The Todo entity is optimized for PostgreSQL with the following features:

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | uuid | No | Auto-generated | Primary key (UUID v4) |
| **title** | varchar(100) | No | - | Todo title |
| **description** | varchar(500) | Yes | null | Optional description |
| **completed** | boolean | No | false | Completion status |
| **createdAt** | timestamp | No | CURRENT_TIMESTAMP | Creation time |
| **updatedAt** | timestamp | No | CURRENT_TIMESTAMP | Last update time |

### Indexes

1. **Primary Key Index**: On `id` (automatically created)
2. **Completed Index**: On `completed` (for filtering queries)
3. **CreatedAt Index**: On `createdAt` (for sorting by date)

## Generated PostgreSQL Schema

When TypeORM synchronizes, it will create the following table:

```sql
-- Create UUID extension (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create todos table
CREATE TABLE "todos" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" varchar(100) NOT NULL,
    "description" varchar(500),
    "completed" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "IDX_todos_completed" ON "todos" ("completed");
CREATE INDEX "IDX_todos_createdAt" ON "todos" ("createdAt");
```

## PostgreSQL-Specific Features

### 1. UUID Primary Key
- Uses PostgreSQL's `uuid_generate_v4()` function
- More secure and distributed-friendly than auto-increment
- 128-bit unique identifier

### 2. Timestamp with Timezone
- Native PostgreSQL timestamp support
- Automatic timezone handling
- Better for international applications

### 3. Indexes for Performance
- **completed**: Speeds up queries filtering by status
- **createdAt**: Optimizes sorting by date

Example queries that benefit:
```sql
-- Fast due to completed index
SELECT * FROM todos WHERE completed = false;

-- Fast due to createdAt index
SELECT * FROM todos ORDER BY "createdAt" DESC;

-- Fast due to both indexes
SELECT * FROM todos 
WHERE completed = true 
ORDER BY "createdAt" DESC;
```

## Entity Code

```typescript
@Entity('todos')
@Index(['completed'])
@Index(['createdAt'])
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  completed!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
```

## Example Usage

### Creating a Todo
```typescript
const todo = todoRepository.create({
  title: 'Buy groceries',
  description: 'Milk, bread, eggs',
});
await todoRepository.save(todo);
```

Generated SQL:
```sql
INSERT INTO "todos" ("id", "title", "description", "completed", "createdAt", "updatedAt") 
VALUES (uuid_generate_v4(), 'Buy groceries', 'Milk, bread, eggs', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Finding Completed Todos
```typescript
const completed = await todoRepository.find({
  where: { completed: true },
  order: { createdAt: 'DESC' },
});
```

Generated SQL:
```sql
SELECT * FROM "todos" 
WHERE "completed" = true 
ORDER BY "createdAt" DESC;
```

### Updating a Todo
```typescript
todo.completed = true;
await todoRepository.save(todo);
```

Generated SQL:
```sql
UPDATE "todos" 
SET "completed" = true, "updatedAt" = CURRENT_TIMESTAMP 
WHERE "id" = 'uuid-here';
```

## Performance Considerations

### Index Usage
```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE tablename = 'todos'
ORDER BY idx_scan DESC;
```

### Table Statistics
```sql
-- View table size
SELECT 
    pg_size_pretty(pg_total_relation_size('todos')) as total_size,
    pg_size_pretty(pg_table_size('todos')) as table_size,
    pg_size_pretty(pg_indexes_size('todos')) as indexes_size;

-- Count records
SELECT COUNT(*) FROM todos;
```

## Migrations (Production)

For production, use migrations instead of `synchronize`:

```typescript
// Migration file
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTodosTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE "todos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(100) NOT NULL,
        "description" varchar(500),
        "completed" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX "IDX_todos_completed" ON "todos" ("completed");
      CREATE INDEX "IDX_todos_createdAt" ON "todos" ("createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "todos"`);
  }
}
```

## Data Types Mapping

| TypeScript | TypeORM | PostgreSQL |
|------------|---------|------------|
| string | varchar | character varying |
| boolean | boolean | boolean |
| Date | timestamp | timestamp without time zone |
| string (uuid) | uuid | uuid |

## Advanced PostgreSQL Features

### Full-Text Search (Optional Enhancement)
```typescript
@Index(['title'], { fulltext: true })
@Column({ type: 'text' })
title!: string;
```

### JSON Fields (Optional Enhancement)
```typescript
@Column({ type: 'jsonb', nullable: true })
metadata?: Record<string, any>;
```

### Enum Type (Optional Enhancement)
```typescript
export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Column({
  type: 'enum',
  enum: TodoPriority,
  default: TodoPriority.MEDIUM,
})
priority!: TodoPriority;
```

## Useful PostgreSQL Commands

```sql
-- View table structure
\d todos

-- View indexes
\di

-- View all todos
SELECT * FROM todos;

-- View recent todos
SELECT * FROM todos ORDER BY "createdAt" DESC LIMIT 10;

-- Statistics
SELECT 
    completed,
    COUNT(*) as count
FROM todos
GROUP BY completed;
```

## Best Practices

1. ✅ Use UUID for primary keys (better for distributed systems)
2. ✅ Add indexes on frequently queried columns
3. ✅ Use specific column types (varchar vs text)
4. ✅ Set explicit nullability
5. ✅ Use migrations in production (not synchronize)
6. ✅ Add proper constraints and defaults
7. ✅ Document your entity with comments

## Troubleshooting

### UUID Extension Not Found
```sql
-- Run as superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Slow Queries
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM todos WHERE completed = false;
```

### Index Not Being Used
```sql
-- Update statistics
ANALYZE todos;

-- Rebuild index
REINDEX TABLE todos;
```
