# NestJS Todo Application

A production-ready Todo application built with NestJS following best practices and modular architecture.

## Features

- ✅ Full CRUD operations for Todo items
- ✅ RESTful API design
- ✅ TypeScript for type safety
- ✅ Modular architecture
- ✅ DTO validation using class-validator
- ✅ Comprehensive unit tests
- ✅ Error handling with proper HTTP status codes
- ✅ Query filtering (completed/pending todos)
- ✅ CORS enabled

## Project Structure

```
src/
├── todo/
│   ├── dto/
│   │   ├── create-todo.dto.ts      # DTO for creating todos
│   │   └── update-todo.dto.ts      # DTO for updating todos
│   ├── entities/
│   │   └── todo.entity.ts          # Todo entity/interface
│   ├── todo.controller.ts          # Controller with REST endpoints
│   ├── todo.controller.spec.ts     # Controller unit tests
│   ├── todo.service.ts             # Business logic layer
│   ├── todo.service.spec.ts        # Service unit tests
│   └── todo.module.ts              # Todo feature module
├── app.module.ts                   # Root module
└── main.ts                         # Application entry point
```

## Installation

```bash
# Dependencies are already installed
npm install
```

## Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start on `http://localhost:3000`

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## API Endpoints

### Create Todo
```http
POST /todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

### Get All Todos
```http
GET /todos
GET /todos?status=completed
GET /todos?status=pending
```

### Get Todo by ID
```http
GET /todos/:id
```

### Update Todo
```http
PATCH /todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

### Delete Todo
```http
DELETE /todos/:id
```

## Quick Test

Once the server is running, test with these curl commands:

```bash
# Create a todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn NestJS","description":"Complete the tutorial"}'

# Get all todos
curl http://localhost:3000/todos

# Get only pending todos
curl http://localhost:3000/todos?status=pending
```

## Best Practices Implemented

1. **Modular Architecture**: Separate module for Todo feature
2. **DTOs**: Data Transfer Objects with validation
3. **Service Layer**: Business logic separated from controllers
4. **Entity/Interface**: Type-safe data models
5. **Validation**: Global validation pipe with class-validator
6. **Error Handling**: Proper HTTP status codes and error messages
7. **Testing**: Comprehensive unit tests for services and controllers
8. **Documentation**: API documentation and code comments
9. **CORS**: Enabled for cross-origin requests
10. **TypeScript**: Full type safety throughout the application

## Validation Rules

- **title**: Required, max 100 characters
- **description**: Optional, max 500 characters
- **completed**: Boolean value

Invalid requests will return `400 Bad Request` with validation error details.

## Next Steps

To extend this application, consider:

1. **Database Integration**: Add TypeORM/Prisma with PostgreSQL/MongoDB
2. **Authentication**: Implement JWT authentication
3. **Authorization**: Add role-based access control
4. **Pagination**: Add pagination for large datasets
5. **Swagger**: Add API documentation with @nestjs/swagger
6. **Logging**: Implement structured logging
7. **Docker**: Containerize the application
8. **CI/CD**: Set up automated testing and deployment

## Documentation

See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) for detailed API documentation.

## License

UNLICENSED
