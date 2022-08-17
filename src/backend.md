# Backend Development Principles

## Database

1. Use foreign key constraints for foreign keys.

1. Use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) for timestamps.

1. Name of a timestamp column should end with `At` (example – `resolvedAt`).

1. Use `DATE` (not TIMESTAMP!) for dates.

1. Name of a date column should end with `Date` (example – `incorporationDate`).

1. Avoid JSON columns with a few exceptions:

   - We are saving raw data from an external service (for example, a Xero Invoice)
   - We are saving raw data from another internal service (for example, core.company can have a column company.complianceData to save raw data from Sherlock)
   - We are saving data with unpredictable nesting (for example, something like a form builder)

1. Prefer enums and avoid booleans

   ```sql
   -- bad
   -- highly likely, we will need a suspended status shortly,
   -- and we will decide to go with the enum solution
   ALTER TABLE subscriptions ADD COLUMN "isActive" BOOLEAN;

   -- disaster
   -- day 1
   ALTER TABLE subscriptions ADD COLUMN "isActive" BOOLEAN;
   -- day 2. Now, we consistently need to check for isActive && isSuspended
   -- instead of simply status == 'active'. Both in the database and the code.
   ALTER TABLE subscriptions ADD COLUMN "isSuspended" BOOLEAN;

   -- good
   -- we add just two options but prepare ourselves for the future, and it costs us nothing
   -- also, it's better in terms of type checks even there are only two options
   -- The database / programming language will protect us from using wrong values by mistake,
   -- which will not happen if we use generic true/false
   CREATE TYPE "subscriptionStatus" AS ENUM (
    'active',
    'pending'
   );
   ALTER TABLE "contacts" ADD COLUMN "status" "subscriptionStatus";

   -- also good
   -- here we're pretty sure it'll never be extended to more than two values
   -- we don't have type checks here, but avoiding boolean at all is not practical
   ALTER TABLE subscriptions ADD COLUMN "isRenewable" BOOLEAN;
   ```

   Read more:

   https://stackoverflow.com/questions/4337942/using-enum-vs-boolean

   https://betterprogramming.pub/dont-use-boolean-arguments-use-enums-c7cd7ab1876a

   http://codeclimber.net.nz/archive/2012/11/19/why-you-should-never-use-a-boolean-field-use-an/

## Migrations

1. Add `SET lock_timeout TO '2s';` to each migration:

   Migrations usually obtain exclusive lock on the table, and when applied alongside already running transactions, can drive whole database into deadlock.

1. If you want to drop a column:

   1. Make a PR with removing column usage from your code
   1. Release to Production
   1. Make a PR with a migration that renames your column `myColumn` => `myColumn_dropme`
   1. Release to Production
   1. Wait a couple weeks
   1. Make a PR with completely dropping of the column

   Otherwise, if you will drop or rename a column in a single release with removing usage of it, Production will fail, because there is a time gap (about 30 minutes for Core and about 3 minutes for microservices) between a DB migration and deploying a new version of code.

1. If you want to update more than 1M of records:

   - Make a migration with a commented out body
   - Run the query manually from an SQL client
   - Consider using `CONCURRENTLY` keyword

   You should do it because all migrations are running in a single DB transaction. Your huge update will lock many DB objects. And Production will be down for the entire duration of the migration.
   Postgres supports some operations with `CONCURRENTLY` keyword, for example creating indexes. In this case a long migration will not affect production.
   However these operations do not work inside transactions.

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

## Data migration

As the project you are working on develops, aside from migrating your DB schema you have to migrate your data as well.

Example: migrate the data that was previously saved to jsonb field and should be saved in the dedicated column now.

Depending on the complexity of migration there are several ways to perform it:

1. The same method is used for [schema migrations](#migrations)(sequelize migrations). This method is suitable for simple migrations when migration flow is the same for all table rows (there are no complex condition statements etc.)

1. Migration with SQS message trigger

1. Lambda function

Methods 2, 3 are pretty much the same and are used when you need to perform some complex migrations with a bunch of logic and conditions. Your migration functions must be covered with tests covering all possible scenarios.

For the method 2 you have to create a Job following the same rules in [Job](#jobs) section, implement your migration in the job, write tests. You start the migration process by triggering the corresponding SQS message.

Method 3 is the same except you implement your migration in lambda function and start the migration process by executing the function.

For serverless projects - method 3 is preferred, but not always. When you have a huge dataset and it is impossible to perform migration within one serverless function invocation because of timeout (15 minutes usually), method 2 is the only option since it allows you to split your migration by batches via multiple SQS messages.

## Models

1. Do not use models from other models (except for associations). For example, you should not create a method in the `Ticket` model that will do `User.findAll()`. For such case you should create a service function that will use 2 models.

1. Do not use services from models.

1. Do not define enums in models, use enums from SDK.

1. Use `separate: true` include option for inner lists. Otherwise Sequelize will generate an inefficient SQL with JOINS and then reduce it on the Node.js part. Also it is impossible to have different `order` options for different entities without `separate: true`.

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

1. Use the [Lambda Controller Sample](https://github.com/OsomePteLtd/principles/blob/main/src/samples/lambda/controllers/bankAccount.controller.ts) to create a CRUDL scaffolding controller.

1. Use 1 file per 1 resource.

1. Exceptions should be handled universally in a middleware (for Koa / Express) or in a wrapper function (for microservices).

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

   - entity name in plural (for example `companyUsers`) - for entities
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

## Event Bus

1. Use the Event Bus for asynchronous communication between services.

1. Bear in mind that you could receive an outdated message. So you can safely use only immutable data (such `id`) from a message. Always fetch actual data before using it.

1. There is one exception - you can use `snapshot` and `previousVersion` to make a decision about fast exit from an event handler (before fetching actual data, e.g. you may need only RAF documents and should ignore other types of documents).

1. Don't use as a `snapshot` a full entity model (e.g. `Document`), use a special snapshot-model only with fields that are necessary for event filtering (e.g. `DocumentSnapshot`).

   SDK:

   ```
   // bad

   SnsDocumentUpdated !{
     document: Document,
   }

   // good

   SnsDocumentUpdated !{
     document: !{
       id: i,
     },
   }

   // also good

   SnsDocumentUpdated !{
     document: !{
       id: i,
       snapshot: DocumentSnapshot,
       previousVersion: DocumentSnapshot,
     },
   }
   ```

   Service:

   ```typescript
   // bad

   async function handleDocumentUpdated(event: SnsDocumentUpdated): Promise<void> {
     if (!isRaf(event.document.snapshot)) {
       // it is OK to use snapshot to make a decision
       return;
     }
     await updateRafDocument(event.document.snapshot); // using snapshot for updating is not safe
   }

   // good

   async function handleDocumentUpdated(event: SnsDocumentUpdated): Promise<void> {
     if (!isRaf(event.document.snapshot)) {
       return;
     }
     const document = await getCoreDocument(event.document.id); // fetching actual data
     await updateRafDocument(document); // using actual data
   }
   ```

1. Use the [Lambda Event Sample](samples/lambda/events/ticket.event.ts) as a sample of the proper event handler.

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

1. Don't check completed nocks manually, rely on the global check for pending nocks instead.

   ```typescript
   // bad
   // src/jobs/autochargeNotification/autochargeNotificationPeriods.job.test.ts

   expect(nockCreateTicket.isDone()).toEqual(true);

   // good
   // src/tests/setupTests.ts

   afterEach(() => {
     // eslint-disable-next-line jest/no-standalone-expect
     expect(nock.pendingMocks()).toEqual([]);
   });
   ```

1. Don't setup a nock if you expect it to be uncompleted, rely on disabled network for tests instead.

   ```typescript
   // bad
   // src/jobs/subscription/subscriptionWithRenewalTickets.job.test.ts

   expect(companyUsersNock.isDone()).toEqual(false);

   // good
   // src/tests/setupTests.ts

   beforeEach(() => {
     nock.disableNetConnect();
   });
   ```

1. Don't forget to restore mocked function implementations before each test.

   ```typescript
   // bad

   beforeEach(() => {
     jest.resetAllMocks(); // Does NOT restore original implementations
   });

   // good

   beforeEach(() => {
     jest.restoreAllMocks();
   });
   ```

1. If test file for controller becomes large (for example more then 1500 rows) it can be splitted into separate files by `describe` blocks and placed into tests folder

```
- controllers
  - bankAccount
    - bankAccount.controller.ts
    - tests
      - getBankAccounts.controller.test.ts
      - getBankAccount.controller.test.ts
      - createBankAccount.controller.test.ts
      - updateBankAccount.controller.test.ts
```

## Microservices

1. Treat [Pablo](https://github.com/OsomePteLtd/pablo) as a canonical microservice.

1. Don't post messages to other service SQS queues. Consider using 1) SNS event if the current service does not want to know about what happens with the event and who in fact uses it, 2) direct Lambda invocation if the service wants to know what happens and what is the result, 3) async Lambda invocation if the service knows what happens, but does not want to know the result, or can not afford waiting for the result.

   By the moment, there are usages like this, but they are deprecated.

### Timeouts

- For API Gateway:

  - do not specify `timeout` by default (it will be `6 seconds`);
  - specify `timeout: 30` for slow endpoints (i.g. reports), 30 seconds is maximum for API Gateway;

- SQS, SNS, CRON, etc:

  - specify `timeout: 900`, it is maximum for AWS Lambda;

- Other values:

  - if you need some other value of timeout please add a comment why you need it.

### Data Replication

1. Every entity should be owned by a single service. The owner is the one who generates the `id`.

1. A service can store copies of foreign entities in the own database. The table should have the following structure:

   ```
   "id" INTEGER PRIMARY KEY,
   "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   "rawData" JSONB NOT NULL
   ```

   - The table name should be equal to the original table name (for example, `companies`, not `coCompanies`).

   - `id` should be equal to the original entity ID.

   - `createdAt` and `updatedAt` timestamps should be own.

   - `rawData` should contain serialized original data (with a type from SDK, for example `Company`).

1. A service can extend the original entity with some fields, for example:

   ```
   "id" INTEGER PRIMARY KEY,
   "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   "rawData" JSONB NOT NULL,
   "rafStatus" VARCHAR,
   "rafAnswers" JSONB,
   "rafDocument" JSONB,
   "riskLevel" VARCHAR,
   "kycStatus" BOOLEAN
   ```

1. The owner service can back-replicate extended entities by other services, for example:

   ```
   "id" SERIAL PRIMARY KEY,
   "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   -- ... original fields ...
   "corpsecData" JSONB,
   "robertoData" JSONB,
   ```

   `serviceprefixData` should contain serialized foreign data (with a type from SDK, for example `CoCompany` and `AxCompany`). Such column names should have the following form – `serviceprefixData`, for example `corpsecData` and `robertoData`.

1. Data replication should be implemented via the [service bus](#event-bus).

## Best Practices Checklist

### Main

| Service / Feature | Owner                | TS 4.4 | relative imports | typed models |
| ----------------- | -------------------- | ------ | ---------------- | ------------ |
| alfred            | partner-solutions    | 🍏     | 🍏               | 🍏           |
| analytix          | platform             | 🍅     | 🍏               | 🍅           |
| auditor           | platform             | 🍅     | 🍏               | 🍅           |
| billy             | retention            | 🍏     | 🍏               | 🍏           |
| bouncer           | platform             | 🍅     | 🍏               | ❓           |
| core              | platform             | 🍅     | 🍅               | 🍅           |
| dealer            | agent-x-sales        | 🍏     | 🍏               | 🍏           |
| enrique           | documents-processing | 🍅     | 🍏               | ❓           |
| flexflow          | platform             | 🍅     | 🍅               | ❓           |
| hermes            | platform             | ❓     | ❓               | ❓           |
| hero              | accounting           | 🍏     | 🍏               | ❓           |
| invoker           | invoice-n-payments   | 🍏     | 🍏               | 🍏           |
| jamal             | documents-processing | 🍅     | 🍏               | 🍏           |
| pablo             | factory              | 🍏     | 🍏               | 🍏           |
| payot             | retention            | 🍏     | 🍏               | 🍏           |
| pechkin           | platform             | 🍅     | 🍏               | ❓           |
| scrooge           | accounting           | 🍅     | 🍏               | ❓           |
| shiva             | e-commerce           | 🍏     | 🍏               | 🍏           |
| skyler            | reporting            | 🍏     | 🍏               | 🍏           |
| tigerdocs         | agent-x              | 🍅     | 🍅               | ❓           |

### Toolkit

| Service / Feature | wrappers | logger | ACL | lambda | eventBus | migrate | retry DLQ | sentry |
| ----------------- | -------- | ------ | --- | ------ | -------- | ------- | --------- | ------ |
| alfred            | ❓       | 🍏     | 🍏  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     |
| analytix          | ❓       | ❓     | ❓  | ❓     | ❓       | 🍅      | ❓        | ❓     |
| auditor           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     |
| billy             | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     |
| bouncer           | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     |
| core              | 🍅       | ❓     | ❓  | ❓     | 🍏       | ❓      | ❓        | ❓     |
| dealer            | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        | 🍅     |
| enrique           | ❓       | ❓     | 🍏  | 🍏     | 🍏       | 🍏      | 🍅        | ❓     |
| flexflow          | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     |
| hermes            | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     |
| hero              | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     |
| invoker           | 🍏       | 🍏     | 🍏  | 🍏     | ❓       | ❓      | ❓        | ❓     |
| jamal             | 🍅       | 🍏     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     |
| pablo             | 🍏       | 🍏     | 🍅  | 🍅     | 🍏       | 🍏      | 🍏        | 🍏     |
| payot             | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     |
| pechkin           | 🍅       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        | 🍅     |
| scrooge           | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     |
| shiva             | 🍏       | 🍏     | 🍏  | 🍏     | 🍏       | 🍏      | 🍏        | ❓     |
| skyler            | 🍏       | 🍏     | 🍏  | 🍏     | 🍏       | ❓      | 🍏        | 🍏     |
| tigerdocs         | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     |

### Static checks

| Service / Feature | eslint config | depcheck | unused-exports | type-check | type-coverage | build | separate steps in CI | editorconfig | spell check |
| ----------------- | ------------- | -------- | -------------- | ---------- | ------------- | ----- | -------------------- | ------------ | ----------- |
| alfred            | 🍏            | 🍏       | 🍏             | 🍏         | ❓            | ❓    | 🍏                   | 🍏           | 🍏          |
| analytix          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| auditor           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| billy             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| bouncer           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| core              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | 🍏                   | 🍏           | ❓          |
| dealer            | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| enrique           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| flexflow          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| hermes            | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| hero              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| invoker           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| jamal             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| pablo             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| payot             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| pechkin           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| scrooge           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| shiva             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| skyler            | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| tigerdocs         | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |

### Tests

| Service / Feature | jest | no sinon | global check for pending nocks | disabled network | anti flaky |
| ----------------- | ---- | -------- | ------------------------------ | ---------------- | ---------- |
| alfred            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| analytix          | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| auditor           | 🍏   | ❓       | ❓                             | ❓               | 🍅         |
| billy             | 🍏   | 🍅       | 🍏                             | 🍏               | 🍅         |
| bouncer           | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| core              | 🍅   | 🍅       | ❓                             | ❓               | 🍅         |
| dealer            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| enrique           | 🍏   | 🍏       | ❓                             | ❓               | 🍅         |
| flexflow          | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| hermes            | ❓   | ❓       | ❓                             | ❓               | ❓         |
| hero              | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| invoker           | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| jamal             | 🍏   | 🍅       | 🍅                             | 🍏               | 🍅         |
| pablo             | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| payot             | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| pechkin           | 🍏   | 🍅       | 🍅                             | 🍏               | 🍏         |
| scrooge           | 🍏   | ❓       | ❓                             | ❓               | 🍅         |
| shiva             | 🍏   | 🍏       | ❓                             | ❓               | 🍅         |
| skyler            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| tigerdocs         | 🍅   | ❓       | ❓                             | ❓               | 🍅         |

### Infrastructure

| Service / Feature | own database instance | LTS Node | TS SLS config | SLS separate handlers | canary |
| ----------------- | --------------------- | -------- | ------------- | --------------------- | ------ |
| alfred            | 🍏                    | 🍅       | 🍏            | ❓                    | 🍏     |
| analytix          | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| auditor           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| billy             | 🍏                    | 🍅       | 🍏            | ❓                    | 🍏     |
| bouncer           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| core              | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |
| dealer            | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| enrique           | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| flexflow          | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |
| hermes            | ❓                    | 🍅       | ❓            | ❓                    | ❓     |
| hero              | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| invoker           | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| jamal             | 🍏                    | 🍅       | 🍏            | 🍅                    | 🍏     |
| pablo             | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| payot             | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| pechkin           | 🍏                    | 🍅       | 🍏            | 🍅                    | 🍏     |
| scrooge           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| shiva             | 🍏                    | 🍏       | 🍏            | 🍏                    | 🍏     |
| skyler            | 🍅                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| tigerdocs         | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |

### Other

| Service / Feature | no parameter store SDK | standard CODEOWNERS | dependabot with auto-merge | migration check | diff check |
| ----------------- | ---------------------- | ------------------- | -------------------------- | --------------- | ---------- |
| alfred            | 🍏                     | 🍏                  | 🍏                         | ❓              | 🍏         |
| analytix          | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| auditor           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| billy             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| bouncer           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| core              | ❓                     | 🍅                  | 🍅                         | ❓              | ❓         |
| dealer            | 🍏                     | 🍏                  | 🍏                         | ❓              | 🍏         |
| enrique           | 🍏                     | 🍏                  | 🍏                         | ❓              | ❓         |
| flexflow          | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| hermes            | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| hero              | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| invoker           | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| jamal             | 🍏                     | ❓                  | ❓                         | ❓              | ❓         |
| pablo             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| payot             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| pechkin           | 🍏                     | 🍏                  | 🍅                         | 🍅              | 🍅         |
| scrooge           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| shiva             | 🍏                     | 🍏                  | 🍏                         | 🍏              | ❓         |
| skyler            | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| tigerdocs         | ❓                     | ❓                  | ❓                         | ❓              | ❓         |

### Environments

| Service / Feature | Production | Stage | T1  | T2  | T3  | T4  | T5  | T6  | T7  | T8  | T9  |
| ----------------- | ---------- | ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| alfred            | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | ❓  | ❓  | ❓  |
| analytix          | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| auditor           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| billy             | 🍏         | 🍏    | 🍏  | 🍏  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  |
| bouncer           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| core              | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| dealer            | 🍏         | 🍏    | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  |
| enrique           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| flexflow          | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| hermes            | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| hero              | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| invoker           | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| jamal             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| pablo             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| payot             | 🍏         | 🍏    | 🍏  | 🍏  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| pechkin           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| scrooge           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| shiva             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| skyler            | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| tigerdocs         | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |

## Idempotency

1. Idempotency key template is `fullModelName-${id}-actionName`, e.g. `biContract-123-paymentDeclined`.
