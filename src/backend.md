# Backend Development Principles

## Database

1. Use foreign key constraints for foreign keys.

1. Use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) for timestamps.

1. Use `DATE` (not TIMESTAMP!) for dates.

1. Avoid JSON columns with a few exceptions:

   - We are saving raw data from an external service (for example, a Xero Invoice).
   - We are saving data with unpredictable nesting (for example, something like a form builder).

## Migrations

1. If you want to drop a column:

   1. Make a PR with removing column usage from your code
   1. Release to Production
   1. Make a PR with a migration that renames your column `mycolumn` => `mycolumn_dropme`
   1. Release to Production
   1. Wait a couple weeks
   1. Make a PR with completely dropping of the column

   Otherwise, if you will drop or rename a column in a single release with removing usage of it, Production will fail, because there is a time gap (about 30 minutes for Core and about 3 minutes for microservices) between a DB migration and deploying a new version of code.

1. If you want to update more than 1M of records:

   - Make a migration with a commented out body
   - Run the query manually from an SQL client

   You should do it because all migrations are running in a single DB transaction. Your huge update will lock many DB objects. And Production will be down for the entire duration of the migration.

1. Leave `down` migrations empty. They are not actually used, so it is not worth wasting time on them.

   ```javascript
   // bad

   up: (queryInterface, Sequelize) => {
     return queryInterface.sequelize.query(`
       ALTER TABLE "lineItems" ADD COLUMN "migrationSourceData" JSONB;
     `);
   },

   down: (queryInterface, Sequelize) => {
     return queryInterface.sequelize.query(`
       ALTER TABLE "contacts" DROP COLUMN "migrationSourceData";
     `);
   },

   // good

   up: (queryInterface, Sequelize) => {
     return queryInterface.sequelize.query(`
       ALTER TABLE "lineItems" ADD COLUMN "migrationSourceData" JSONB;
     `);
   },

   down: () => {},
   ```

1. Do not explicitly specify the index name and let the database set it since it:

   - Is easier
   - Does not require to use any specific organization-wide convention, we simply use the standard one
   - Ensures the name actually includes proper fields

   ```sql
   -- bad

   CREATE UNIQUE INDEX "subscription_period_key_value" ON "notificationPeriods" ("subscriptionId", "type", "value") WHERE ("deletedAt" IS NULL);

   -- good

   CREATE UNIQUE INDEX ON "notificationPeriods" ("subscriptionId", "type", "value") WHERE ("deletedAt" IS NULL);
   ```

## Models

1. Do not use models from other models (except for associations). For example, you should not create a method in the `Ticket` model that will do `User.findAll()`. For such case you should create a service function that will use 2 models.

1. Do not use services from models.

1. Do not define enums in models, use enums from SDK.

1. Use `separate: true` include option for inner lists. Otherwise Sequelize will generate an inefficient SQL with JOINS and then reduce it on the Node.js part. Also it is imposible to have different `order` options for different entities without `separate: true`.

   ```typescript
   // good

   const connections = await Connection.findAll({
     include: [
       Connection.institution,
       { association: Connection.accounts, order: [['id', 'ASC']], separate: true },
     ],
     where: filter,
     order: [['id', 'ASC']],
   });
   ```

## Controllers

1. Use the [Lambda Controller Sample](https://github.com/OsomePteLtd/principles/blob/main/src/samples/lambda/bankAccount.controller.ts) to create a CRUDL scaffolding controller.

1. Use 1 file per 1 resource.

1. Exceptions should be handled universally in a middlware (for Koa / Express) or in a wrapper function (for microservices).

   ```typescript
   // bad

   async function create(req: Request, res: Response, next: NextFunction) {
     try {
       // ...
       const template = await TemplateService.createTemplate(data);
       // ...
     } catch (err) {
       if (err instanceof UniqueConstraintError) {
         return res.status(422).json({
           type: 'UniqueConstraintError',
           message: 'Template with such alias and branch already exists',
         });
       }
       next(err);
     }
   }
   ```

1. Validate requests by schemas.

   ```typescript
   // bad

   export const index = api(async (event: any) => {
     const company = await validateCompany({
       companyId: event.pathParameters.companyId,
     });
     // ...
   });

   // good

   export const index = api(async (event: APIGatewayEvent) => {
     const request = castAndValidateEvent<AcBankAccountIndexRequest>(
       event,
       schemas.AcBankAccountIndexRequest,
     );
     const company = await validateCompany({
       companyId: request.pathParameters.companyId,
     });
     // ...
   });
   ```

1. Serialize responses by schemas.

   ```typescript
   // bad

   return {
     body: { bankAccounts },
   };

   // good

   return {
     body: serialize({ bankAccounts }, schemas.AcBankAccountListResponse),
   };
   ```

1. Use service functions for creating, updating and deleting entities and use directly ORM `find*` functions for querying entities. More info in [Services](#services).

1. Use the following query parameters for list requests:

   - `search` - for a text search query
   - `filter` - for filtering parameters
   - `sort` - for ordering
   - `page` - for a page number, starts from 1
   - `perPage` - for a page size

   All query parameters should be optional and should have default values.

   Examples:

   ```
   /companies?page=3&perPage=25
   /companies?filter[status]=active&sort=name
   ```

1. Use the following fields for list responses:

   - entiry name in plural (for example `companyUsers`) - for entities
   - `page` - for a page number, starts from 1
   - `perPage` - for a page size
   - `totalCount` - for a total count of entities found by a query

   Example:

   ```typescript
   {
      companyUsers: [...],
      page: 1,
      perPage: 25,
      totalCount: 31
   }
   ```

## Services

1. Business logic should be inside services.

1. The right file name for a service will be `services/model.service.ts` or `services/domain.service.ts`.

1. All methods for creating, updating and destroying models should be wrapped into service functions. For example, there should be `createUser` service function instead of using `User.create` from controllers. In this case, for example, a socket call goes to such a service function.

1. Do not add `find*` service functions, use directly ORM `find*` functions from controllers instead. Exception: the finder function is very complex and has very specific domain logic, so it’s guaranteed it will not be used by different parts of the app. E.g., `findAllDocumentsRelatedToDocumentThroughReconciliations`.

## Jobs

1. SQS handlers should be jobs.

1. The right file name for a job will be `jobs/model.job.ts` or `jobs/domain.job.ts`.

   ```
   // bad

   jobs/downloadInvoice.job.ts

   // good

   jobs/invoice.job.ts
   ```

1. A job function should have the `Job` suffix, for example `syncTransactionsJob()`.

1. A job function should be a thin wrapper for a service function.

   ```typescript
   // bad

   export async function syncAccountsJob({ connectionId }: { connectionId: number }) {
     // very complex in-place logic
   }

   // good

   export async function syncAccountsJob({ connectionId }: { connectionId: number }) {
     debug(`[syncAccountsJob] connectionId = ${connectionId}`);
     const connection = await Connection.findByPk(connectionId, { rejectOnEmpty: true });
     await syncAccounts(connection);
     debug(`[syncAccountsJob] connectionId = ${connectionId}, done`);
   }
   ```

## Tests

1. All HTTP endpoints, lambdas and jobs should be covered by tests.

1. Prefer to write integration tests rather then unit tests, i.e. it is better to write a test for a controller than for a service. Write unit tests only for covering some corner cases that are difficult to cover with integration tests.

1. Use seed functions for preparing a database state for your tests. Use `faker` for random values and use other seed functions for associations.

   Example:

   ```typescript
   export async function seedConnection(overrides: Partial<ConnectionAttributes> = {}) {
     let { institutionId } = overrides;
     if (!institutionId) {
       const institution = await seedInstitution();
       institutionId = institution.id;
     }
     const defaults: Partial<ConnectionAttributes> & ConnectionAttributesNew = {
       institutionId,
       companyId: generateFakeId(),
       externalId: faker.random.uuid(),
       accessToken: faker.random.uuid(),
       status: ConnectionStatus.active,
     };
     const attributes = { ...defaults, ...overrides };
     return Connection.create({
       ...attributes,
       accessToken: encrypt(attributes.accessToken),
     });
   }
   ```

1. Do not seed common data for multiple tests in `beforeEach`, keep you tests isolated. More info [here](https://thoughtbot.com/blog/lets-not).

1. Use `describe` blocks for each endpoint.

1. A first test in a `describe` block should be a test for a basic scenario. The good name for this test will be `success`.

   Example:

   ```typescript
   describe('POST /bank/links', () => {
     it('success', async () => {
       // ...
     });
   });
   ```

1. Group ACL tests for each endpoint into "ACL" `describe` blocks.

   Example:

   ```typescript
   describe('POST /bank/links', () => {
     // ...

     describe('ACL', () => {
       it('fails without permissions', async () => {
         // ...
       });
     });
   });
   ```

1. If you use a stub then you must check a call and/or calls arguments

## Microservices

1. Don't post messages to other service SQS queues. Consider using 1) SNS event if the current service does not want to know about what happens with the event and who in fact uses it, 2) direct Lambda invocation if the service wants to know what happens and what is the result, 3) async Lambda invocation if the service knows what happens, but does not want to know the result, or can not afford waiting for the result.

   By the moment, there are usages like this, but they are deprecated.

### Canonical Microservice

Treat [Pablo](https://github.com/OsomePteLtd/pablo) as a canonical microservice.

### Timeouts

- For API Gateway:

  - do not specify `timeout` by default (it will be `6 seconds`);
  - specify `timeout: 30` for slow endpoints (i.g. reports), 30 seconds is maximum for API Gateway;

- SQS, SNS, CRON, etc:

  - specify `timeout: 900`, it is maximum for AWS Lambda;

- Other values:

  - if you need some other value of timeout please add a comment why you need it.

### Best Practices Checklist

Main:

| Service / Feature | latest major TS | relative imports | typed models |
| ----------------- | --------------- | ---------------- | ------------ |
| analytix          | 🍅              | 🍏               | 🍅           |
| auditor           | 🍅              | 🍏               | 🍅           |
| billy             | 🍏              | 🍏               | 🍅           |
| bouncer           | ❓              | ❓               | ❓           |
| core              | ❓              | ❓               | ❓           |
| dealer            | 🍏              | 🍏               | 🍏           |
| flexflow          | ❓              | ❓               | ❓           |
| hero              | ❓              | ❓               | ❓           |
| jamal             | ❓              | ❓               | ❓           |
| pablo             | ❓              | ❓               | ❓           |
| payot             | ❓              | ❓               | ❓           |
| pechkin           | ❓              | ❓               | ❓           |
| scrooge           | ❓              | ❓               | ❓           |
| shiva             | 🍏              | 🍏               | 🍏           |
| tigerdocs         | ❓              | ❓               | ❓           |

Toolkit:

| Service / Feature | wrappers | logger | ACL | lambda | eventBus | migrate | retry DLQ |
| ----------------- | -------- | ------ | --- | ------ | -------- | ------- | --------- |
| analytix          | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| auditor           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| billy             | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| bouncer           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| core              | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| dealer            | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        |
| flexflow          | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| hero              | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| jamal             | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| pablo             | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| payot             | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| pechkin           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| scrooge           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |
| shiva             | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        |
| tigerdocs         | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        |

Static checks:

| Service / Feature | eslint config | depcheck | unused-exports | type-check | type-coverage | build | separate steps in CI | editorconfig | spell check |
| ----------------- | ------------- | -------- | -------------- | ---------- | ------------- | ----- | -------------------- | ------------ | ----------- |
| analytix          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| auditor           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| billy             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| bouncer           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| core              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| dealer            | 🍏            | 🍏       | 🍏             | 🍏         | 🍅            | 🍏    | 🍏                   | 🍏           | 🍅          |
| flexflow          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| hero              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| jamal             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| pablo             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| payot             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| pechkin           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| scrooge           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| shiva             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| tigerdocs         | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |

Tests:

| Service / Feature | jest | no sinon |
| ----------------- | ---- | -------- |
| analytix          | ❓   | ❓       |
| auditor           | ❓   | ❓       |
| billy             | ❓   | ❓       |
| bouncer           | ❓   | ❓       |
| core              | ❓   | ❓       |
| dealer            | 🍏   | 🍏       |
| flexflow          | ❓   | ❓       |
| hero              | ❓   | ❓       |
| jamal             | ❓   | ❓       |
| pablo             | ❓   | ❓       |
| payot             | ❓   | ❓       |
| pechkin           | ❓   | ❓       |
| scrooge           | ❓   | ❓       |
| shiva             | ❓   | ❓       |
| tigerdocs         | ❓   | ❓       |

Infrastructure:

| Service / Feature | own database instance | LTS Node | TS SLS config | SLS separate handlers | canary |
| ----------------- | --------------------- | -------- | ------------- | --------------------- | ------ |
| analytix          | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| auditor           | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| billy             | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| bouncer           | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| core              | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| dealer            | 🍏                    | 🍏       | 🍏            | 🍏                    | 🍏     |
| flexflow          | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| hero              | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| jamal             | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| pablo             | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| payot             | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| pechkin           | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| scrooge           | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| shiva             | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| tigerdocs         | ❓                    | ❓       | ❓            | ❓                    | ❓     |

Other:

| Service / Feature | no parameter store SDK | standard CODEOWNERS | `main` branch | dependabot with auto-merge |
| ----------------- | ---------------------- | ------------------- | ------------- | -------------------------- |
| analytix          | ❓                     | ❓                  | ❓            | ❓                         |
| auditor           | ❓                     | ❓                  | ❓            | ❓                         |
| billy             | ❓                     | ❓                  | ❓            | ❓                         |
| bouncer           | ❓                     | ❓                  | ❓            | ❓                         |
| core              | ❓                     | ❓                  | ❓            | ❓                         |
| dealer            | 🍏                     | 🍏                  | 🍏            | 🍏                         |
| flexflow          | ❓                     | ❓                  | ❓            | ❓                         |
| hero              | ❓                     | ❓                  | ❓            | ❓                         |
| jamal             | ❓                     | ❓                  | ❓            | ❓                         |
| pablo             | ❓                     | ❓                  | ❓            | ❓                         |
| payot             | ❓                     | ❓                  | ❓            | ❓                         |
| pechkin           | ❓                     | ❓                  | ❓            | ❓                         |
| scrooge           | ❓                     | ❓                  | ❓            | ❓                         |
| shiva             | 🍏                     | 🍏                  | 🍅            | 🍏                         |
| tigerdocs         | ❓                     | ❓                  | ❓            | ❓                         |
