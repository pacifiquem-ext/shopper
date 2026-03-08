---
trigger: always_on
---

Core Principles

High cohesion inside modules.

Loose coupling between modules.

Clear dependency direction.

Strict contracts between layers.

Predictable error and response systems.

No hidden dependencies.

Module Design

Modules represent business domains, not technical groupings.

Good examples

auth
users
orders
payments
inventory
catalog

Bad examples

helpers
shared-business
utils
misc

Rules

A module owns its domain logic.

Modules must expose functionality only through services.

Modules must not access another module’s repositories or controllers.

Module Internal Structure

Each module must follow a predictable structure.

Example

auth
 ├ auth.module.ts
 ├ controllers
 │   └ auth.controller.ts
 ├ services
 │   └ auth.service.ts
 ├ repositories
 │   └ user.repository.ts
 ├ entities
 │   └ user.entity.ts
 ├ dtos
 │   └ login.dto.ts
 ├ constants
 │   └ auth.constants.ts
 ├ guards
 ├ strategies
 └ mappers

Responsibilities

Controllers
Handle HTTP communication only.

Services
Contain business logic and orchestration.

Repositories
Handle database operations.

Entities
Represent domain objects.

DTOs
Define external input/output structure.

Constants
Contain system configuration and statuses.

Dependency Direction

Dependencies must always flow downward.

Controller
   ↓
Service
   ↓
Repository
   ↓
Database

Forbidden patterns

Controller → Prisma
Controller → Database
Service → Request object
Repository → DTO
Service Rules

Services contain business logic only.

Rules

Services must not perform direct database access.

Services must call repositories.

Services must not contain HTTP-specific logic.

Bad

async login(dto: LoginDto) {
  return this.prisma.user.findUnique(...)
}

Good

async login(dto: LoginDto) {
  const user = await this.userRepository.findByEmail(dto.email)
  return user
}
Repository Rules

Repositories isolate the database layer.

Example

auth/repositories/user.repository.ts

Example implementation

@Injectable()
export class UserRepository {

  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    })
  }

}

Rules

Repositories must only perform persistence operations.

Repositories must not contain business logic.

Cohesion Rules

Each file must have a single responsibility.

Bad

auth.service.ts
  login
  register
  forgotPassword
  resetPassword
  verifyEmail
  sendEmail

Better

auth/services
  login.service.ts
  register.service.ts
  reset-password.service.ts

Limits

Item	Limit
File size	300 lines
Service class	200 lines
Function	40 lines
Cross Module Communication

Modules must interact through services only.

Good

OrdersService → UsersService

Bad

OrdersService → UsersRepository
OrdersService → UsersController

Modules must export services.

Example

@Module({
  providers: [UsersService],
  exports: [UsersService]
})
Common Folder Usage

Your project already has

common
 ├ cache
 ├ config
 ├ database
 ├ logger
 ├ request
 ├ response
 └ tenant

Rules

Common must only contain technical infrastructure.

Allowed

config
database
logger
cache
validation
exceptions

Forbidden

order-service
user-business
payment-logic
Status System

Never use raw strings for statuses.

Bad

return { status: "ok" }

Create centralized constants.

Example

common/constants/status.constants.ts
export const ResponseStatus = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  FAIL: "FAIL"
} as const

Statuses must always come from constants.

API Response Standard

All responses must follow the same shape.

Success

{
  status: SUCCESS,
  data: {},
  error: null
}

Error

{
  status: FAIL,
  data: null,
  error: {
    code: "USER_NOT_FOUND",
    message: "User does not exist"
  }
}

Rules

Response structure must never change.

Controllers must not return inconsistent formats.

Error Handling

Errors must be typed and categorized.

Example

common/errors

Example classes

export class DomainError extends Error {}

export class NotFoundError extends DomainError {}

export class ValidationError extends DomainError {}

Rules

Domain logic must not throw generic Error.

Infrastructure errors must be mapped to domain errors.

DTO Discipline

Controllers must never accept raw request bodies.

Bad

@Post()
create(@Body() body)

Good

@Post()
create(@Body() dto: CreateUserDto)

DTO rules

All inputs must be validated.

DTOs must represent external contracts only.

Constants Management

Constants must be grouped by domain.

Example

constants
 ├ auth.constants.ts
 ├ roles.constants.ts
 ├ permissions.constants.ts

Example

export const Roles = {
  ADMIN: "ADMIN",
  USER: "USER"
} as const

Rules

Never use literal strings across the system.

Logging Rules

Never use console logs.

Bad

console.log("User created")

Good

logger.info("USER_CREATED", {
  userId,
  timestamp: Date.now()
})

Logs must include

event name

metadata

Configuration Rules

Environment variables must be centralized.

Bad

process.env.JWT_SECRET

Good

config.auth.jwtSecret

Only config files may read environment variables.

Worker Rules

Your workers directory is good.

Workers must only depend on services, never controllers.

Example

workers/email.worker.ts

Rules

Workers must not contain business logic.

Workers orchestrate services.

Language System Rules

Language files must contain translation keys only.

Bad

"User created successfully"

Better

"user.created"

Rules

Translation text belongs to language files only.

Business logic must not contain human text.

File Naming Conventions
Type	Naming
DTO	*.dto.ts
Service	*.service.ts
Controller	*.controller.ts
Repository	*.repository.ts
Constants	*.constants.ts
Transaction Rules

Database transactions must exist only in services.

Repositories must perform single operations only.

Clean Code Rules

Never mix responsibilities.

Bad

createUserAndSendEmail()

Good

createUser()
sendWelcomeEmail()
Golden Rule

Every module must answer three questions clearly.

What domain does this module own

What services does this module expose

What data does this module control

If these answers are unclear, the module design is incorrect.