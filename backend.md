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

4. Use `separate: true` include option for inner lists. Otherwise Sequelize will generate an inefficient SQL with JOINS and then reduce it on the Node.js part. Also it is imposible to have different `order` options for different entities without `separate: true`.

   ```
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

1. Use 1 file per 1 resource.

2. Exceptions should be handled universally in a middlware (for Koa / Express) or in a wrapper function (for microservices).

   ```
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

3. Validate requests by schemas.

   ```
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

4. Serialize responses by schemas.

   ```
   // bad

   return {
     body: { bankAccounts },
   };

   // good

   return {
     body: serialize({ bankAccounts }, schemas.AcBankAccountListResponse),
   };
   ```

5. Use service functions for creating, updating and deleting entities and use directly ORM `find*` functions for querying entities. More info in [Services](#services).

6. Use the following query parameters for list requests:

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

7. Use the following fields for list responses:

   - entiry name in a plural form, for example `companyUsers` - for entities
   - `page` - for a page number, starts from 1
   - `perPage` - for a page size
   - `totalCount` - for a total count of entities found by a query

   Example:

   ```
   {
      companyUsers: [...],
      page: 1,
      perPage: 25,
      totalCount: 31
   }
   ```

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
