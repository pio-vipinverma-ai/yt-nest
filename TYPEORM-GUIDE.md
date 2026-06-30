# TypeORM Integration Guide

## Overview

This Todo application uses TypeORM with SQLite database for data persistence.

## Database Configuration

The database is configured in [app.module.ts](src/app.module.ts):

```typescript
TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: 'todos.db',
  entities: [Todo],
  synchronize: true, // Auto-create tables (disable in production)
  logging: true,
})
```

### Configuration Options

- **type**: Database type (better-sqlite3, postgres, mysql, etc.)
- **database**: Database file name (SQLite) or connection details
- **entities**: Array of entity classes
- **synchronize**: Auto-creates database tables (⚠️ disable in production)
- **logging**: Logs all SQL queries to console

## Entity Definition

The Todo entity is defined with TypeORM decorators in [todo.entity.ts](src/todo/entities/todo.entity.ts):

```typescript
@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Key Decorators

- `@Entity()`: Marks class as a database entity
- `@PrimaryGeneratedColumn('uuid')`: Auto-generated UUID primary key
- `@Column()`: Defines a table column with options
- `@CreateDateColumn()`: Automatically set on creation
- `@UpdateDateColumn()`: Automatically updated on modification

## Repository Pattern

The service uses TypeORM Repository for database operations:

```typescript
constructor(
  @InjectRepository(Todo)
  private readonly todoRepository: Repository<Todo>,
) {}
```

### Repository Methods Used

- `create()`: Creates entity instance (not saved yet)
- `save()`: Inserts or updates entity
- `find()`: Retrieves multiple entities with options
- `findOne()`: Retrieves single entity
- `delete()`: Removes entity by ID

## Service Layer with TypeORM

All methods in [todo.service.ts](src/todo/todo.service.ts) are now async and use the repository:

### Create
```typescript
async create(createTodoDto: CreateTodoDto): Promise<Todo> {
  const todo = this.todoRepository.create(createTodoDto);
  return await this.todoRepository.save(todo);
}
```

### Read All
```typescript
async findAll(): Promise<Todo[]> {
  return await this.todoRepository.find({
    order: { createdAt: 'DESC' },
  });
}
```

### Read One
```typescript
async findOne(id: string): Promise<Todo> {
  const todo = await this.todoRepository.findOne({ where: { id } });
  if (!todo) {
    throw new NotFoundException(`Todo with ID "${id}" not found`);
  }
  return todo;
}
```

### Update
```typescript
async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
  const todo = await this.findOne(id);
  Object.assign(todo, updateTodoDto);
  return await this.todoRepository.save(todo);
}
```

### Delete
```typescript
async remove(id: string): Promise<void> {
  const result = await this.todoRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException(`Todo with ID "${id}" not found`);
  }
}
```

### Query with Filters
```typescript
async findCompleted(): Promise<Todo[]> {
  return await this.todoRepository.find({
    where: { completed: true },
    order: { createdAt: 'DESC' },
  });
}
```

## Database File

- **Location**: `todos.db` (root directory)
- **Type**: SQLite database file
- **Auto-created**: Yes, on first run
- **Git**: Excluded via `.gitignore`

## Testing with TypeORM

Tests use mock repositories instead of real database connections:

```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

{
  provide: getRepositoryToken(Todo),
  useValue: mockRepository,
}
```

## Switching to Other Databases

### PostgreSQL

1. Install driver:
```bash
npm install pg
```

2. Update configuration:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'todos_db',
  entities: [Todo],
  synchronize: false, // Use migrations in production
})
```

### MySQL

1. Install driver:
```bash
npm install mysql2
```

2. Update configuration:
```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'your_username',
  password: 'your_password',
  database: 'todos_db',
  entities: [Todo],
  synchronize: false,
})
```

## Production Best Practices

### 1. Disable synchronize
```typescript
synchronize: false // Never auto-sync schema in production
```

### 2. Use Migrations
```bash
npm install -g typeorm

# Generate migration
typeorm migration:generate -n CreateTodoTable

# Run migrations
typeorm migration:run
```

### 3. Use Environment Variables
```typescript
TypeOrmModule.forRoot({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Todo],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
})
```

### 4. Connection Pooling
```typescript
TypeOrmModule.forRoot({
  // ... other options
  extra: {
    max: 10, // Maximum pool size
    min: 2,  // Minimum pool size
  },
})
```

## Useful Commands

```bash
# Start development server
npm run start:dev

# Run tests
npm test

# Generate migration (after installing typeorm globally)
typeorm migration:generate -n MigrationName

# Run migrations
typeorm migration:run

# Revert migration
typeorm migration:revert
```

## Troubleshooting

### Database locked
- SQLite issue: Close all connections or restart the app

### Table doesn't exist
- Check `synchronize: true` in development
- Run migrations in production

### Connection timeout
- Verify database is running
- Check connection credentials
- Ensure firewall allows connection

## Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM Repository API](https://typeorm.io/repository-api)
