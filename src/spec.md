# Spec Development Principles

## Introduction

We are using [TinySpec](https://github.com/Ajaxy/tinyspec) for defining our API. Specs live in the [SDK repository](https://github.com/OsomePteLtd/sdk/tree/master/spec). Specs are grouped by domain (`core`, `accounting`, `ecommerce`, etc).

## Client and Agent Specs

We have 3 types of specs:

- `common` – for both agents and clients
- `agent` – only for agents
- `client` – only for clients

## Index Endpoints

Example:

```
GET /bank/connections?BkConnectionIndexRequestQuery
  => BkConnectionListResponse
```

```
BkConnection !{
  id: i,
  createdAt: d,
  updatedAt: d,
  companyId: i,
  status: BkConnectionStatus,
}

BkConnectionStatus (
  active |
  disconnected
)

BkConnectionFilter !{
  companyId: i,
}

BkConnectionIndexRequest {
  queryStringParameters: BkConnectionIndexRequestQuery,
}

BkConnectionIndexRequestQuery !{
  filter: BkConnectionFilter,
}

BkConnectionListResponse !{
  connections: BkConnection[],
}
```

Here we have the following names:

- `${Entity}` – for the entity
- `${Entity}Filter` – for the filter parameters
- `${Entity}IndexRequest` – for the "index" request
- `${Entity}IndexRequestQuery` – for the "index" query string parameters
- `${Entity}ListResponse` – for the list response body

## Create Endpoints

Example:

```
POST /bank/connections BkConnectionCreateRequestBody
  => BkConnectionResponse
```

```
BkConnectionNew !{
  companyId: i,
  publicToken,
}

BkConnectionCreateRequest {
  body: BkConnectionCreateRequestBody,
}

BkConnectionCreateRequestBody !{
  connection: BkConnectionNew,
}

BkConnectionResponse !{
  connection: BkConnection,
}
```

Here we added the following names:

- `${Entity}New` – for the parameters to create an entity
- `${Entity}CreateRequest` – for the "create" request
- `${Entity}CreateRequestBody` – for the "create" request body
- `${Entity}Response` – for the entity response body

## Get Endpoints

Example:

```
GET /bank/connections/:id:i
  => BkConnectionResponse
```

```
BkConnectionRequest {
  pathParameters: !{
    id: i,
  }
}

BkConnectionGetRequest < BkConnectionRequest {}
```

Here we added the following names:

- `${Entity}Request` – for the base entity request
- `${Entity}GetRequest` – for the "get" request

## Update Endpoints

Example:

```
PATCH /bank/connections/:id:i BkConnectionUpdateRequestBody
  => BkConnectionResponse
```

```
BkConnectionUpdate !{
  status?: BkConnectionStatus,
}

BkConnectionUpdateRequest < BkConnectionRequest {
  body: BkConnectionUpdateRequestBody,
}

BkConnectionUpdateRequestBody !{
  connection: BkConnectionUpdate,
}
```

Here we added the following names:

- `${Entity}Update` – for the parameters to update an entity
- `${Entity}UpdateRequest` – for the "update" request
- `${Entity}UpdateRequestBody` – for the "update" request body

## Delete Endpoints

Example:

```
DELETE /bank/connections/:id:i
  => 204
```

```
BkConnectionDeleteRequest < BkConnectionRequest {}
```

Here we added the following name:

- `${Entity}DeleteRequest` – for the "delete" request

Specify `204` status code if your endpoint is not returning any content.
