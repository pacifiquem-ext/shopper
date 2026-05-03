---
trigger: always_on
---

# NestJS Production Architecture Rules

## Core Principles
- High cohesion inside modules, loose coupling between modules
- Clear dependency direction (always downward)
- Strict layer contracts, predictable error/response systems
- Zero hidden dependencies

## Module Organization

### Domain-Based Structure
Modules represent **business domains**, not technical groupings.

**✅ Valid:** `auth`, `users`, `orders`, `payments`, `inventory`, `products`
**❌ Invalid:** `helpers`, `utils`, `shared-business`, `misc`

### Standard Module Structure
```
module-name/
├── module-name.module.ts
├── controllers/          # HTTP layer only
├── services/             # Business logic only  
├── dtos/                 # External contracts
└── [guards|strategies|mappers]  # Optional
```
**Location:** `/server/modules/{module-name}/`

### Module Self-Test
Every module must answer:
1. What domain does it own?
2. What services does it expose?
3. What data does it control?

If unclear, redesign the module.

## Layer Responsibilities

### Controllers
**Purpose:** HTTP communication ONLY
- Accept requests, validate via DTOs, call services
- **FORBIDDEN:** Business logic, direct DB/Prisma access, repositories, raw request bodies

```typescript
// ✅ CORRECT
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}

// ❌ INCORRECT
@Post('login')
async login(@Body() body: any) {
  return this.prisma.user.findUnique(...);
}
```

### Services  
**Purpose:** Business logic and orchestration
- Implement domain logic, call repositories, call other module services
- **FORBIDDEN:** Direct DB access, HTTP objects (Request/Response), Prisma queries

```typescript
// ✅ CORRECT
async login(dto: LoginDto) {
  const user = await this.userRepository.findByEmail(dto.email);
  if (!user) throw new UserNotFoundException();
  return this.generateTokens(user);
}

// ❌ INCORRECT  
async login(dto: LoginDto) {
  return this.prisma.user.findUnique({ where: { email: dto.email } });
}
```

### Repositories
**Purpose:** Database operations ONLY
- Perform CRUD, abstract queries, return entities/primitives
- **FORBIDDEN:** Business logic, DTOs, transactions (belong in services)

```typescript
// ✅ CORRECT
@Injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}

// ❌ INCORRECT - Business logic
async createUser(dto: CreateUserDto) {
  const hashed = await bcrypt.hash(dto.password, 10);
  return this.prisma.user.create({ data: { ...dto, password: hashed } });
}
```

### DTOs
**Purpose:** Define external contracts
- All controller inputs MUST use validated DTOs
- **FORBIDDEN:** Use in repository layer

```typescript
// ✅ CORRECT
export class LoginDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(8)
  password: string;
}
```

## Dependency Flow

**Rule:** Dependencies flow DOWNWARD only

```
Controller → Service → Repository → Database
```

**FORBIDDEN:**
- Controller → Prisma/Database/Repository
- Service → Request/Response/Prisma
- Repository → DTO/Business logic

**Verify:** Check imports in each layer
- Controllers: DTOs, Services, Decorators only
- Services: Repositories, Other Services, Helpers only  
- Repositories: Prisma, Entities only

## Cross-Module Communication

**Rule:** Modules communicate via exported **services ONLY**

```typescript
// ✅ CORRECT
// users.module.ts
@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService]  // Export service only
})

// orders.service.ts
constructor(
  private usersService: UsersService  // Use exported service
) {}
```

**FORBIDDEN:**
- Accessing another module's repository
- Accessing another module's controller

## Common Folder (`/server/common`)

**Purpose:** Technical infrastructure ONLY

**✅ Allowed:** config, database, logger, cache, helper, exceptions, message, request, response, tenant
**❌ Forbidden:** Business logic (order-service, user-business, payment-logic)

## Constants (`/server/common/constants`)

**Location:** `/server/common/constants/{module-name}.ts`

**Rules:**
- Module constants in `/server/common/constants/{module}.ts`
- Shared constants in `/server/common/constants/shared.ts`
- Import from `/server/common/constants/index.ts`
- **ZERO hardcoded strings/numbers** anywhere in `/server`

```typescript
// ✅ CORRECT
export const AuthRoles = {
  ADMIN: "ADMIN",
  USER: "USER"
} as const;

import { AuthRoles } from '@/common/constants';
if (user.role === AuthRoles.ADMIN) { ... }

// ❌ INCORRECT
if (user.role === "ADMIN") { ... }
```

## Exceptions (`/server/common/exceptions`)

**Location:** `/server/common/exceptions/{module-name}.exception.ts`

**Rules:**
- Each module gets its own exception file
- Extend `DomainException` base class
- All exceptions MUST have i18n translation keys
- Wrap risky operations in try/catch
- **NEVER** throw generic Error/BadRequestException

```typescript
// ✅ CORRECT
export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super('auth.user.not_found', { identifier }, 404);
  }
}

// Usage
if (!user) throw new UserNotFoundException(dto.email);

// ❌ INCORRECT
throw new BadRequestException('User not found');
```

**Response Format:** Must align with `/server/common/response/dtos/response.error.dto.ts`

## Helper Services (`/server/common/helper/services`)

**Available Helpers:**
1. **Encryption** - `/helper/services/helper.encryption.service.ts`
   - Use for: Password hashing, comparing, encryption/decryption
2. **Pagination** - `/helper/services/helper.pagination.service.ts`
   - Use for: ALL paginated endpoints
3. **Query Builder** - `/helper/services/helper.query.builder.service.ts`
   - Use for: WHERE, ORDER BY, SELECT, range filters, pagination
4. **Query Service** - `/helper/services/helper.query.service.ts`
   - Use for: Complex query orchestration

**Rule:** ALWAYS check helpers first before implementing similar logic

```typescript
// ✅ CORRECT
constructor(private encryptionHelper: HelperEncryptionService) {}
const hashed = await this.encryptionHelper.hash(dto.password);

// ❌ INCORRECT
import * as bcrypt from 'bcrypt';
const hashed = await bcrypt.hash(dto.password, 10);
```

## Logging (`/server/common/logger`)

**Location:** `/server/common/logger/services/logger.service.ts`

**Rules:**
- ALL actions MUST be logged
- **NEVER** use console.log
- Log structure: Event name (UPPERCASE_SNAKE_CASE) + metadata

```typescript
// ✅ CORRECT
this.logger.info('ORDER_CREATED', {
  orderId: order.id,
  userId: dto.userId,
  total: order.total
});

// ❌ INCORRECT
console.log('Order created');
this.logger.info('order created');  // Wrong format
```

**Levels:** info, warn, error, debug

## Translation (`/server/common/message`)

**Service:** `/server/common/message/services/message.service.ts`
**Files:** `/server/languages/{locale}/{module}.json`

**Rules:**
- ALL user-facing text MUST be translatable
- Translation key format: `module.context.action`
- **NEVER** hardcode user messages

```typescript
// ✅ CORRECT
this.messageService.get('auth.user.not_found', { email: dto.email })

// Language file: /server/languages/en/auth.json
{
  "user": {
    "not_found": "User with email {{email}} not found"
  }
}

// ❌ INCORRECT
throw new NotFoundException('User not found');
```

## Response Standardization (`/server/common/response`)

**DTOs Location:** `/server/common/response/dtos/`
- `response.success.dto.ts` - Successful operations
- `response.error.dto.ts` - Failed operations  
- `response.paginated.dto.ts` - Paginated lists
- `response.generic.dto.ts` - Generic wrapper

**Interceptor:** `/server/common/response/interceptors/response.interceptor.ts`

**Rules:**
- ALL responses MUST follow standard structure
- Check DTO files for exact structure
- **NEVER** create custom response formats
- Response structure NEVER changes

```typescript
// ✅ CORRECT - Interceptor handles formatting
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.service.findOne(id);
}

// ❌ INCORRECT
return {
  success: true,
  result: data,
  timestamp: Date.now()
};
```

## Request Handling (`/server/common/request`)

**Guards:** `/server/common/request/guards/`
- `jwt.access.guard.ts`, `jwt.refresh.guard.ts`, `roles.guard.ts`, `store.guard.ts`

**Decorators:** `/server/common/request/decorators/`
- `request.public.decorator.ts`, `request.role.decorator.ts`, `request.user.decorator.ts`

**Rule:** Use existing guards/decorators, don't reinvent

```typescript
// ✅ CORRECT
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('ADMIN')
async getDashboard() { ... }

// ❌ INCORRECT
async getDashboard(@Headers('authorization') token: string) {
  const user = this.jwtService.verify(token);
  if (user.role !== 'ADMIN') throw new ForbiddenException();
}
```

## Configuration (`/server/common/config`)

**Files:** `app.config.ts`, `auth.config.ts`, `doc.config.ts`, `redis.config.ts`

**Rules:**
- **ONLY** config files read `process.env`
- Modules import from config files
- Validate env vars at startup

```typescript
// ✅ CORRECT
constructor(private authConfig: AuthConfig) {}
secret: this.authConfig.jwtSecret

// ❌ INCORRECT
secret: process.env.JWT_SECRET
```

## Workers (`/server/workers`)

**Structure:** `worker.module.ts`, `processors/`, `schedulers/`

**Rules:**
- Workers orchestrate services, NO business logic
- Depend on services, NEVER controllers
- Use for: Background jobs, scheduled tasks, async operations

```typescript
// ✅ CORRECT
constructor(
  private emailService: EmailService,
  private userService: UserService
) {}

// ❌ INCORRECT
constructor(private userController: UserController) {}
```

## Transaction Management

**Rule:** Transactions in services ONLY, repositories perform single operations

```typescript
// ✅ CORRECT
async createOrder(dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    const order = await this.orderRepository.create(dto, tx);
    await this.inventoryRepository.decrementStock(dto.productId, dto.quantity, tx);
    return order;
  });
}

// ❌ INCORRECT - Transaction in repository
```

## File Naming

| Type | Pattern |
|------|---------|
| Module | `{name}.module.ts` |
| Controller | `{name}.controller.ts` |
| Service | `{name}.service.ts` |
| Repository | `{name}.repository.ts` |
| DTO | `{action}-{entity}.dto.ts` |
| Entity | `{name}.entity.ts` |
| Constants | `{name}.constants.ts` |

Use kebab-case for all file names.

## Clean Code

**Single Responsibility:**
```typescript
// ❌ INCORRECT
async createUserAndSendEmail(dto: CreateUserDto) { ... }

// ✅ CORRECT
async createUser(dto: CreateUserDto) { ... }
async sendWelcomeEmail(userId: string) { ... }
```

## Critical Rules

1. **Dependencies:** Controller → Service → Repository → Database
2. **Constants:** Zero hardcoded values, all in `/common/constants/{module}.ts`
3. **Helpers:** Use existing services in `/common/helper/services/`
4. **Logging:** Use logger service, no console.log
5. **Translation:** Use message service + `/languages/{locale}/{module}.json`
6. **Responses:** Use DTOs from `/common/response/dtos/`
7. **Exceptions:** Module-specific in `/common/exceptions/{module}.exception.ts`
8. **Config:** Only config files read process.env
9. **Cross-Module:** Via exported services only
10. **Transactions:** In services, not repositories

## Verification

1. Structure - Right folder?
2. Dependencies - Flowing downward?
3. Constants - Any hardcoded values?
4. Helpers - Existing helper available?
5. Logging - Using logger service?
6. Exceptions - Typed, module-specific?
7. Translation - Using translation keys?
8. Response - Following standard DTOs?

If ANY fails, code is incomplete. Check `/server/common/` for patterns.