# Logger Implementation Guide

## Overview

Comprehensive logging has been implemented across all controllers in your NestJS application. Every controller event is now tracked and logged with appropriate log levels for monitoring, debugging, and auditing purposes.

## What is Logging?

Logging is the process of recording application events during runtime. It helps with:
- **Debugging**: Identify what happened and when
- **Monitoring**: Track application behavior in production
- **Auditing**: Keep records of user actions
- **Performance Analysis**: Understand response times and bottlenecks

## Controllers with Logging Implemented

### 1. **AppController** (`src/app.controller.ts`)
Logs root endpoint requests and health checks.

**Logged Events:**
- ✅ Incoming GET request to root endpoint
- ✅ Successfully retrieved hello message
- ❌ Error handling with stack trace

### 2. **AuthController** (`src/auth/auth.controller.ts`)
Logs all authentication-related events.

**Logged Events:**
- ✅ Register: Email registration attempts
  ```
  [INFO] Incoming register request for email: user@example.com
  [INFO] Successfully registered user: user@example.com
  [ERROR] Registration failed for email: user@example.com
  ```

- ✅ Login: Authentication attempts
  ```
  [INFO] Incoming login request for email: user@example.com
  [INFO] Successfully logged in user: user@example.com
  [WARN] Login failed for email: user@example.com
  ```

- ✅ Profile: User profile fetching
  ```
  [INFO] Fetching profile for user: <user-id>
  [INFO] Successfully retrieved profile for user: <user-id>
  [ERROR] Error fetching profile for user: <user-id>
  ```

### 3. **TodoController** (`src/todo/todo.controller.ts`)
Comprehensive logging for all CRUD operations.

**Logged Events:**

#### CREATE (POST /todos)
```
[INFO] [CREATE] Incoming request from user <user-id> to create todo: "Buy groceries"
[INFO] [CREATE] Successfully created todo with ID: <todo-id> for user: <user-id>
[ERROR] [CREATE] Failed to create todo for user <user-id>, Error: <error-message>
```

#### READ ALL (GET /todos)
```
[INFO] [FIND_ALL] Fetching todos for user <user-id> with query: {...}
[INFO] [FIND_ALL] Successfully retrieved 10 todos for user <user-id>
[ERROR] [FIND_ALL] Failed to fetch todos for user <user-id>, Error: <error-message>
```

#### READ ONE (GET /todos/:id)
```
[INFO] [FIND_ONE] Fetching todo <todo-id> for user <user-id>
[INFO] [FIND_ONE] Successfully retrieved todo <todo-id>
[ERROR] [FIND_ONE] Failed to fetch todo <todo-id>, Error: <error-message>
```

#### UPDATE (PATCH /todos/:id)
```
[INFO] [UPDATE] Updating todo <todo-id> for user <user-id> with data: {...}
[INFO] [UPDATE] Successfully updated todo <todo-id>
[ERROR] [UPDATE] Failed to update todo <todo-id>, Error: <error-message>
```

#### DELETE (DELETE /todos/:id)
```
[INFO] [DELETE] Deleting todo <todo-id> for user <user-id>
[INFO] [DELETE] Successfully deleted todo <todo-id>
[ERROR] [DELETE] Failed to delete todo <todo-id>, Error: <error-message>
```

## Log Levels

### Available Log Levels

| Level | Method | Usage | Example |
|-------|--------|-------|---------|
| **LOG** | `logger.log()` | General information | User registration, successful operations |
| **ERROR** | `logger.error()` | Errors requiring attention | Failed operations, exceptions |
| **WARN** | `logger.warn()` | Warnings that don't stop execution | Failed login attempts |
| **DEBUG** | `logger.debug()` | Debug information (development) | Detailed request/response data |
| **VERBOSE** | `logger.verbose()` | Detailed logging (development) | Step-by-step operation flow |

## Usage Examples

### Basic Logging in a Controller

```typescript
import { Controller, Get, Logger } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  // Initialize logger for this controller
  private readonly logger = new Logger(ExampleController.name);

  @Get()
  getExample() {
    // Log incoming request
    this.logger.log('Incoming GET request');
    
    try {
      // Perform operation
      const result = this.service.getData();
      
      // Log success
      this.logger.log('Successfully retrieved data');
      return result;
    } catch (error) {
      // Log error with stack trace
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Failed to get data: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
```

### Adding Logging to Your Own Controllers

Template for new controller methods:

```typescript
@Post('action')
async action(@Body() dto: ActionDto) {
  // 1. Log incoming request with parameters
  this.logger.log(`Incoming action with data: ${JSON.stringify(dto)}`);
  
  try {
    // 2. Perform the operation
    const result = await this.service.performAction(dto);
    
    // 3. Log success with result info
    this.logger.log(`Successfully performed action, result ID: ${result.id}`);
    return result;
  } catch (error) {
    // 4. Log error with details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    this.logger.error(`Action failed: ${errorMessage}`, errorStack);
    throw error;
  }
}
```

## Viewing Logs

### In Development

Logs appear in your terminal where you ran `npm run start:dev`:

```
[Nest] 12345 - 06/26/2026, 10:30:45 AM     LOG [TodoController] [CREATE] Incoming request from user abc-123...
[Nest] 12345 - 06/26/2026, 10:30:46 AM     LOG [TodoController] [CREATE] Successfully created todo with ID: xyz-789...
```

### Log Format

```
[Nest] <ProcessID> - <Date>, <Time> <Period>     <LEVEL> [<Context>] <Message>
```

- **ProcessID**: Node.js process identifier
- **Date, Time**: When the event occurred
- **LEVEL**: LOG, ERROR, WARN, DEBUG, VERBOSE
- **Context**: Class name that generated the log
- **Message**: The actual log message

### In Production

For production, configure a file-based logger:

```typescript
// main.ts
import * as fs from 'fs';
import * as path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const app = await NestFactory.create(AppModule, {
  logger: new Logger(),
});
```

## Best Practices

### ✅ DO

- **Log important events**: User actions, errors, state changes
- **Include context**: User ID, resource ID, operation type
- **Use appropriate levels**: Info for normal flow, Error for exceptions
- **Include timestamps**: NestJS Logger includes them automatically
- **Log parameters**: What was requested and what was the result

### ❌ DON'T

- **Log sensitive data**: Passwords, API keys, tokens (masked in auth logs)
- **Log too much**: Avoid verbose logging in production for performance
- **Use generic messages**: "Error occurred" vs "Failed to create todo"
- **Ignore errors**: Always log exceptions
- **Mix concerns**: Use separate loggers for different modules

## Error Handling Pattern

The logging implementation follows this consistent pattern:

```typescript
try {
  // Operation
  result = await service.operation();
  
  // Success log
  this.logger.log(`[OPERATION] Success details`);
  return result;
} catch (error) {
  // Type-safe error handling
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  // Error log with context
  this.logger.error(`[OPERATION] Failed: ${errorMessage}`, errorStack);
  throw error;
}
```

## Performance Considerations

- Logging has minimal performance impact in NestJS
- All logs in controllers are synchronous and fast
- I/O intensive logging (file/database) should be handled asynchronously
- For high-traffic applications, consider log aggregation services:
  - **Winston**: File-based logging
  - **Pino**: Fast JSON logging
  - **ELK Stack**: Elasticsearch, Logstash, Kibana
  - **Datadog**: Cloud-based log management

## Debugging with Logs

### Find User Actions
```bash
# View all logs for a specific user
grep "user <user-id>" logs/application.log
```

### Find Failed Operations
```bash
# View all errors
grep "ERROR" logs/application.log

# View failed operations for a resource
grep "Failed.*<resource-id>" logs/application.log
```

### Track Request Flow
```bash
# Follow a complete request cycle
grep "<todo-id>" logs/application.log
```

## Extending the Logger

### Add Custom Logger for Services

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  async create(createTodoDto: CreateTodoDto, userId: string) {
    this.logger.log(`Creating todo for user ${userId}`);
    // Service logic
  }
}
```

### Create a Custom Logger Middleware

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: any, res: any, next: Function) {
    this.logger.log(`${req.method} ${req.url}`);
    next();
  }
}
```

## Summary

✅ **Comprehensive Logging Implemented**
- All 3 controllers have logging
- All CRUD operations tracked
- Error handling with stack traces
- User action auditing
- Production-ready logging structure

**Key Features:**
- Request tracking with user context
- Success and failure logging
- Error stack traces for debugging
- Consistent logging patterns
- Type-safe error handling

## Next Steps

1. **Review logs** during development to understand flow
2. **Set up log aggregation** for production
3. **Add logging to services** for deeper visibility
4. **Configure log levels** based on environment
5. **Set up alerts** for critical errors

