# Backend Development Principles

## Database

1. Use foreign key constraints for foreign keys.

2. Use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) for timestamps.

3. Use `DATE` (not TIMESTAMP!) for dates.

4. Avoid JSON columns with a few exceptions:

   - We are saving raw data from an external service (for example, a Xero Invoice).
   - We are saving data with unpredictable nesting (for example, something like a form builder).

## Models

1. Do not use models from other models (except for associations). For example, you should not create a method in the `Ticket` model that will do `User.findAll()`. For such case you should create a service function that will use 2 models.

2. Do not use services from models.

3. Do not define enums in models, use enums from SDK.

## Controllers

TODO

## Services

1. Business logic should be inside services.

2. The right file name for a service will be `services/model.service.ts` or `services/domain.service.ts`.

3. All methods for creating, updating and destroying models should be wrapped into service functions. For example, there should be `createUser` service function instead of using `User.create` from controllers. In this case, for example, a socket call goes to such a service function.

4. Do not add `find*` service functions, use directly ORM `find*` functions from controllers instead. Exception: the finder function is very complex and has very specific domain logic, so it’s guaranteed it will not be used by different parts of the app. E.g., `findAllDocumentsRelatedToDocumentThroughReconciliations`.

## Jobs

1. SQS handlers should be jobs.

2. The right file name for a job will be `jobs/model.job.ts` or `jobs/domain.job.ts`.

   ```
   // bad

   jobs/downloadInvoice.job.ts

   // good

   jobs/invoice.job.ts
   ```

3. A job function should have the `Job` suffix, for example `syncTransactionsJob()`.

4. A job function should be a thin wrapper for a service function.

   ```
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

TODO
