## Core Principles

1. **Declarative over Imperative**: Code should read like a specification of what to do, not how to do it
2. **Single Responsibility**: Each function, class, and file does exactly one thing
3. **Smallest Possible Scope**: Write the minimum code needed to achieve the desired outcome
4. **Human Reviewability**: Any human should be able to verify correctness in < 2 minutes per file

## Complexity Limits

### Function Complexity
- **Maximum Cyclomatic Complexity**: 5
- **Maximum Function Length**: 15 lines (excluding type signatures and blank lines)
- **Maximum Nesting Depth**: 2 levels
- **Maximum Parameters**: 3 (use object parameters if more needed)

**When a function exceeds these limits, extract sub-functions immediately.**

### File Complexity
- **Maximum File Length**: 200 lines
- **Maximum Exports per File**: 5
- **One Primary Responsibility** per file

## Function Design

### Orchestration vs Implementation
**Handlers and high-level functions should ONLY orchestrate, never implement.**
```typescript
// ❌ WRONG - handler contains business logic
export async function registerUserHandler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const body = JSON.parse(event.body);

  if (!body.email || !body.email.includes('@')) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [body.email]);
  if (existingUser.length > 0) {
    return { statusCode: 409, body: 'User exists' };
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);
  await db.query('INSERT INTO users VALUES (?, ?)', [body.email, hashedPassword]);

  return { statusCode: 201, body: 'Created' };
}

// ✅ CORRECT - handler orchestrates extracted functions
export async function registerUserHandler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const input = parseRegistrationInput(event);
  validateRegistrationInput(input);

  await ensureUserDoesNotExist(input.email);
  const user = await createUser(input);

  return formatSuccessResponse(user);
}
```

### Pure Functions Preferred
- Favor pure functions (no side effects, deterministic output)
- Side effects (DB, API calls) isolated in clearly named functions
- All business logic should be testable without mocks
```typescript
// ✅ Pure function (preferred)
export function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ✅ Impure function (clearly named, isolated)
export async function persistOrderToDatabase(order: Order): Promise<void> {
  await db.insert('orders', order);
}
```

## TypeScript Type Safety

### Strict Mode Required
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### No `any`, Minimal `unknown`
- **NEVER use `any`** - use `unknown` and type guards instead
- Prefer specific types over generic types
- Use branded types for IDs and sensitive values
```typescript
// ❌ WRONG
function processData(data: any) { }

// ✅ CORRECT
function processData(data: unknown): Result {
  if (!isValidData(data)) {
    throw new ValidationError();
  }
  return transform(data);
}

function isValidData(data: unknown): data is ValidData {
  // type guard implementation
}
```

### Type Imports
Always use `import type` for type-only imports to ensure clean separation and tree-shaking.
```typescript
import type { User, CreateUserInput } from './types/user.types';
import { createUser } from './services/user.service';
```



## Error Handling

### Explicit Error Types
All errors must be typed and handled explicitly.
```typescript
// error.d.ts
export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// service.ts
export function getUser(id: string): User {
  const user = findUserById(id);

  if (!user) {
    throw new NotFoundError('User', id);
  }

  return user;
}
```

### No Silent Failures
- Never catch and ignore errors
- Every error path must be explicit
- Use Result types for expected failures
```typescript
// result.d.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// validator.ts
export function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes('@')) {
    return {
      success: false,
      error: new ValidationError('email', 'Must contain @')
    };
  }

  return { success: true, data: email };
}
```

## Testing Requirements

Every file with business logic must have a corresponding `.test.ts` file.

### Test Organization
```
src/
├── services/
│   ├── user.ts
│   └── user.test.ts
```

### Test Coverage Requirements
- **Minimum Line Coverage**: 80%
- **Minimum Branch Coverage**: 75%
- All public functions must have tests
- All error paths must be tested

### Test Structure
```typescript
// user.test.ts
import { describe, it, expect } from 'vitest';
import { createUser } from './user.service';

describe('createUser', () => {
  it('creates user with valid input', () => {
    const result = createUser({ email: 'test@example.com' });
    expect(result.email).toBe('test@example.com');
  });

  it('throws ValidationError for invalid email', () => {
    expect(() => createUser({ email: 'invalid' }))
      .toThrow(ValidationError);
  });
});
```

## Extraction Triggers

Extract a new function when:
1. A function exceeds 15 lines
2. Nesting depth exceeds 2 levels
3. You use a comment to explain "what" code does (comment indicates abstraction needed)
4. Logic can be named meaningfully
5. Logic is repeated (DRY principle)

Extract to a new file when:
1. File exceeds 200 lines
2. File has more than one primary responsibility
3. Functions are unrelated to the file's primary purpose

## Naming Conventions

### Exports
Follows these linting conventions
- Constants are UPPER_SNAKE_CASE
- Exported functions, classes, public class properties, and variables are UpperCamelCase
- Private functions and class properties are in camelCase

### Functions
- **Actions**: `create`, `update`, `delete`, `validate`, `transform`, `calculate`, `format`
- **Queries**: `get`, `find`, `list`, `search`, `exists`, `has`
- **Boolean predicates**: `is`, `has`, `can`, `should`
```typescript
// ✅ CORRECT
function createUser(input: CreateUserInput): User { }
function getUserById(id: string): User | null { }
function isValidEmail(email: string): boolean { }
function hasPermission(user: User, action: string): boolean { }
```

### Variables
- Use full words, not abbreviations (except universally known: `id`, `url`, `html`)
- Constants in `SCREAMING_SNAKE_CASE`
- Boolean variables should read like questions
```typescript
const MAX_RETRIES = 3;
const isUserActive = checkUserStatus(user);
const hasCompletedOnboarding = user.onboardingStep === 'complete';
```

**Remember: The goal is code that can be verified correct by a human in under 2 minutes per file.**