# Spec Development Principles

## Introduction

We use **TypeScript** with `@osomepteltd/typespec` for defining our API specifications. Specs live in the [SDK repository](https://github.com/OsomePteLtd/sdk/tree/master/spec). Specs are grouped by domain (`core`, `accounting`, `payment`, `bank`, etc).

Files use the `.ts` extension and are organized as:

- `spec/{domain}/{feature}.ts` - Feature-specific types and endpoints
- `spec/{domain}/index.ts` - Service definition and controller exports
- `spec/shared/` - Shared types across domains

Example structure:

```
spec/payment/intent.ts          # Intent types and endpoints
spec/payment/customerSession.ts # Customer session types
spec/payment/index.ts           # Payot service definition
spec/bank/connection.ts         # Bank connection types and endpoints
```

We have 3 types of specs:

- `common` - for both agents and clients (default)
- `agent` - only for agents (use `agent()` wrapper)
- `client` - only for clients

## Core Imports

```typescript
import {
  array,
  b,              // boolean
  controller,
  d,              // date
  endpoint,
  enumerable,
  extend,
  f,              // float
  i,              // integer
  nullable,
  o,              // object
  optional,
  request,
  s,              // string
  shape,
  t,              // timestamp
} from '@osomepteltd/typespec';
```

## Index Endpoints

Example:

```typescript
'get-connections': endpoint({
  http: { method: 'get', path: '/bank/connections' },
  request: request({
    queryStringParameters: shape(
      { filter: BkConnectionFilter },
      { synonyms: ['BkConnectionIndexRequestQuery'] },
    ),
    synonyms: ['BkConnectionIndexRequest'],
  }),
  response: BkConnectionListResponse,
}),
```

Type definitions:

```typescript
export const BkConnectionStatus = enumerable(['active', 'disconnected']);

export const BkConnection = shape({
  id: i,
  createdAt: t,
  updatedAt: t,
  companyId: i,
  status: BkConnectionStatus,
  company: optional(Company),
});

export const BkConnectionFilter = shape({
  companyId: optional(nullable(i)),
  statuses: optional(nullable(array(BkConnectionStatus))),
});

export const BkConnectionListResponse = shape({ connections: array(BkConnection) });
```

Here we have the following names:

- `${Entity}` - for the entity
- `${Entity}Filter` - for the filter parameters
- `${Entity}IndexRequest` - for the "index" request (via synonyms)
- `${Entity}IndexRequestQuery` - for the "index" query string parameters (via synonyms)
- `${Entity}ListResponse` - for the list response body

## Create Endpoints

Example:

```typescript
'create-connection': endpoint({
  http: { method: 'post', path: '/bank/connections' },
  request: request({ body: BkConnectionCreateRequestBody }),
  response: BkConnectionResponse,
}),
```

Type definitions:

```typescript
export const BkConnectionNew = shape({
  companyId: i,
  publicToken: optional(nullable(s)),
  provider: BkConnectionProvider,
});

export const BkConnectionCreateRequestBody = shape({ connection: BkConnectionNew });
export const BkConnectionResponse = shape({ connection: BkConnection });
```

Here we added the following names:

- `${Entity}New` - for the parameters to create an entity
- `${Entity}CreateRequestBody` - for the "create" request body
- `${Entity}Response` - for the entity response body

## Get Endpoints

Example:

```typescript
'get-connection': endpoint({
  http: { method: 'get', path: '/bank/connections/{id}' },
  request: BkConnectionRequest,
  response: BkConnectionResponse,
}),
```

Type definitions:

```typescript
export const BkConnectionRequest = request({ pathParameters: { id: i } });
```

Here we added the following name:

- `${Entity}Request` - for the base entity request with path parameters

## Update Endpoints

Example:

```typescript
'update-connection': endpoint({
  http: { method: 'patch', path: '/bank/connections/{id}' },
  request: request({
    pathParameters: { id: i },
    body: BkConnectionUpdateRequestBody,
  }),
  response: BkConnectionResponse,
}),
```

Type definitions:

```typescript
export const BkConnectionUpdate = shape({
  status: optional(BkConnectionStatus),
});

export const BkConnectionUpdateRequestBody = shape({ connection: BkConnectionUpdate });
```

Here we added the following names:

- `${Entity}Update` - for the parameters to update an entity
- `${Entity}UpdateRequestBody` - for the "update" request body

## Delete Endpoints

Example:

```typescript
'delete-connection': endpoint({
  http: { method: 'delete', path: '/bank/connections/{id}' },
  request: BkConnectionRequest,
  // No response = 204 status code
}),
```

Omit the `response` field to indicate a 204 status code with no content.

## Controller Pattern

Group endpoints into a controller:

```typescript
export const connection = controller({
  endpoints: {
    'get-connections': endpoint({ ... }),
    'get-connection': endpoint({ ... }),
    'create-connection': endpoint({ ... }),
    'update-connection': endpoint({ ... }),
    'delete-connection': endpoint({ ... }),
  },
});
```

## Service Index

Register controllers in the service index file (`index.ts`):

```typescript
import { service } from '@osomepteltd/typespec';
import { connection } from './connection';
import { account } from './account';

export const scrooge = service({
  prefix: 'Bk',
  controllers: {
    connection,
    account,
  },
});
```

## Service Prefixes

| Prefix | Domain     | Service       |
| ------ | ---------- | ------------- |
| `Ac`   | accounting | pablo, skyler |
| `Bk`   | bank       | scrooge       |
| `Bi`   | billing    | billy         |
| `Co`   | corpsec    | hermes        |
| `Pt`   | payment    | payot         |
| `In`   | invoicing  | invoker       |
| `Ec`   | ecommerce  | shiva         |

## Agent-Only Fields

Use the `agent()` wrapper for fields only exposed to agent apps:

```typescript
import { agent } from '../shared';

export const BkConnectionFilter = shape({
  companyId: optional(nullable(i)),
  companyIds: agent(optional(nullable(array(i)))), // Only for agents
});
```

## Zod-based Schemas (Alternative Pattern)

For OpenAPI integration, some specs use Zod directly:

```typescript
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const PtCustomerSessionRequestPath = z.object({
  customerId: z.string().openapi({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
  }),
});

export const PtCustomerSessionResponse = z.object({
  customerSessionClientSecret: z.string().openapi({
    description: 'Stripe customer session client secret',
  }),
});

// Type exports
export type PtCustomerSessionResponse = z.infer<typeof PtCustomerSessionResponse>;
```

## Naming Conventions Summary

| Pattern                              | Usage                  | Example                         |
| ------------------------------------ | ---------------------- | ------------------------------- |
| `${Prefix}${Entity}`                 | Entity type            | `BkConnection`, `PtIntent`      |
| `${Prefix}${Entity}Status`           | Status enum            | `BkConnectionStatus`            |
| `${Prefix}${Entity}Filter`           | Filter params          | `BkConnectionFilter`            |
| `${Prefix}${Entity}New`              | Create params          | `BkConnectionNew`               |
| `${Prefix}${Entity}Update`           | Update params          | `BkConnectionUpdate`            |
| `${Prefix}${Entity}Request`          | Base request           | `BkConnectionRequest`           |
| `${Prefix}${Entity}Response`         | Single entity response | `BkConnectionResponse`          |
| `${Prefix}${Entity}ListResponse`     | List response          | `BkConnectionListResponse`      |
| `${Prefix}${Entity}CreateRequestBody`| Create body            | `BkConnectionCreateRequestBody` |
| `${Prefix}${Entity}UpdateRequestBody`| Update body            | `BkConnectionUpdateRequestBody` |
