# Backend Development Principles

## Database

1. Use foreign key constraints for foreign keys.

2. Use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) for timestamps.

3. Use `DATE` (not TIMESTAMP!) for dates.

4. Avoid JSON columns with a few exceptions:

   - We are saving raw data from an external service (for example, a Xero Invoice).
   - We are saving data with unpredictable nesting (for example, something like a form builder).

## Models

TODO

## Controllers

TODO

## Services

1. Business logic should be inside services.

2. The right file name for a service will be `/services/model.service.ts` or `/services/domain.service.ts`.

3. All methods for creating, updating and destroying models should be wrapped into service functions. For example, there should be `createUser` service function instead of using `User.create` from controllers. In this case, for example, a socket call goes to such a service function.

4. Do not add `find*` service functions, use directly ORM `find*` functions from controllers instead.

## Jobs

1. SQS handlers should be jobs.

2. The right file name for a job will be `/jobs/model.job.ts` or `/jobs/domain.job.ts`.

3. A job function should have the `Job` suffix, for example `syncTransactionsJob()`.

4. A job function should be a thin wrapper for a service function.

## Tests

TODO
