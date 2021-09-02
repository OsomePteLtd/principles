import type { Functions } from 'serverless/aws';

export const bankAccount: Functions = {
  'create-bank-account': {
    handler: 'src/controllers/bankAccount/handlers.create',
    events: [
      {
        http: {
          path: 'api/v2/accounting/companies/{companyId}/bank_accounts',
          method: 'post',
          authorizer: '${self:custom.authorizer}' as any,
          cors: true,
        },
      },
    ],
  },
  'get-bank-accounts': {
    handler: 'src/controllers/bankAccount/handlers.index',
    events: [
      {
        http: {
          path: 'api/v2/accounting/companies/{companyId}/bank_accounts',
          method: 'get',
          authorizer: '${self:custom.authorizer}' as any,
          cors: true,
        },
      },
    ],
  },
  'get-bank-account': {
    handler: 'src/controllers/bankAccount/handlers.show',
    events: [
      {
        http: {
          path: 'api/v2/accounting/bank_accounts/{bankAccountId}',
          method: 'get',
          authorizer: '${self:custom.authorizer}' as any,
          cors: true,
        },
      },
    ],
  },
  'update-bank-account': {
    handler: 'src/controllers/bankAccount/handlers.update',
    events: [
      {
        http: {
          path: 'api/v2/accounting/bank_accounts/{bankAccountId}',
          method: 'patch',
          authorizer: '${self:custom.authorizer}' as any,
          cors: true,
        },
      },
    ],
  },
  'delete-bank-account': {
    handler: 'src/controllers/bankAccount/handlers.destroy',
    events: [
      {
        http: {
          path: 'api/v2/accounting/bank_accounts/{bankAccountId}',
          method: 'delete',
          authorizer: '${self:custom.authorizer}' as any,
          cors: true,
        },
      },
    ],
  },
};
