import { AcBankAccountCreateRequest, AcBankAccountUpdateRequest, PermissionType } from '@osome/sdk';
import {
  expectForbidden,
  expectNotFound,
  expectValidationError,
  expectValidationErrors,
  fakeAgentRequestContext,
  testApi,
  testApiError,
  testApiNoContent,
} from '@osome/server-toolkit';
import * as faker from 'faker';

import { cleanBankAccountNumber } from '../../services/bankAccount.service';
import { WRONG_ID } from '../../tests/helpers';
import { seedBankAccount } from '../../tests/seeds/bankAccount.seed';
import { seedCompany } from '../../tests/seeds/company.seed';
import { seedContact } from '../../tests/seeds/contact.seed';
import { create, destroy, index, show, update } from './bankAccount.controller';

describe('get-bank-accounts', () => {
  it('success', async () => {
    const bankAccount = await seedBankAccount();

    const responseBody = await testApi(index, {
      pathParameters: {
        companyId: bankAccount.companyId,
      },
    });

    expect(responseBody.bankAccounts).toMatchObject([
      {
        bankAccountNumber: bankAccount.bankAccountNumber,
        bankContactId: bankAccount.bankContactId,
        companyId: bankAccount.companyId,
        currencyCode: bankAccount.currencyCode,
        id: bankAccount.id,
        name: bankAccount.name,
        company: {
          id: bankAccount.company.id,
          branch: bankAccount.company.branch,
          baseCurrency: bankAccount.company.baseCurrency,
        },
        contact: {
          id: bankAccount.bankContact.id,
          name: bankAccount.bankContact.name,
          registrationNumber: bankAccount.bankContact.registrationNumber,
          registrationCountryCode: bankAccount.bankContact.registrationCountryCode,
        },
      },
    ]);
  });

  describe('filter', () => {
    it('bankAccountNumber', async () => {
      const bankAccountNumber = faker.finance.iban();
      const bankAccount = await seedBankAccount({ bankAccountNumber });
      await seedBankAccount({
        companyId: bankAccount.companyId,
        bankContactId: bankAccount.bankContactId,
        bankAccountNumber: bankAccountNumber + faker.finance.iban(),
      });

      const responseBody = await testApi(index, {
        pathParameters: {
          companyId: bankAccount.companyId,
        },
        queryStringParameters: {
          filter: {
            bankAccountNumber: bankAccount.bankAccountNumber,
          },
        },
      });

      expect(responseBody.bankAccounts.map((bc) => bc.bankAccountNumber)).toEqual([
        bankAccount.bankAccountNumber,
      ]);
    });

    it('currencyCode', async () => {
      const bankAccount = await seedBankAccount({ currencyCode: 'SGD' });
      await seedBankAccount({
        companyId: bankAccount.companyId,
        bankContactId: bankAccount.bankContactId,
        currencyCode: 'USD',
      });

      const responseBody = await testApi(index, {
        pathParameters: {
          companyId: bankAccount.companyId,
        },
        queryStringParameters: {
          filter: { currencyCode: bankAccount.currencyCode },
        },
      });

      expect(responseBody.bankAccounts.map((bc) => bc.currencyCode)).toEqual([
        bankAccount.currencyCode,
      ]);
    });
  });

  describe('sort', () => {
    it('first open by createdAt, then closed by createdAt', async () => {
      const company = await seedCompany();
      const bankContact = await seedContact();
      await seedBankAccount({
        name: 'bankAccountClosed1',
        companyId: company.id,
        bankContactId: bankContact.id,
        openDate: '2000-01-01',
        closeDate: '2000-01-02',
      });
      await seedBankAccount({
        name: 'bankAccountOpen1',
        companyId: company.id,
        bankContactId: bankContact.id,
      });
      await seedBankAccount({
        name: 'bankAccountClosed2',
        companyId: company.id,
        bankContactId: bankContact.id,
        openDate: '2000-01-01',
        closeDate: '2000-01-02',
      });
      await seedBankAccount({
        name: 'bankAccountOpen2',
        companyId: company.id,
        bankContactId: bankContact.id,
      });

      const responseBody = await testApi(index, {
        pathParameters: {
          companyId: company.id,
        },
      });

      expect(responseBody.bankAccounts.map((bc) => bc.name)).toEqual([
        'bankAccountOpen1',
        'bankAccountOpen2',
        'bankAccountClosed1',
        'bankAccountClosed2',
      ]);
    });
  });

  describe('errors', () => {
    it('company not found', async () => {
      const response = await testApiError(index, {
        pathParameters: {
          companyId: WRONG_ID,
        },
      });
      expectNotFound(response);
    });
  });

  describe('ACL', () => {
    it('agent - success', async () => {
      const bankAccount = await seedBankAccount();

      const responseBody = await testApi(index, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
        pathParameters: {
          companyId: bankAccount.companyId,
        },
      });

      expect(responseBody.bankAccounts).toHaveLength(1);
    });

    it('agent - fail w/o permissions', async () => {
      const bankAccount = await seedBankAccount();

      const response = await testApiError(index, {
        requestContext: fakeAgentRequestContext({ permissions: [] }),
        pathParameters: {
          companyId: bankAccount.companyId,
        },
      });

      expectForbidden(response);
    });
  });
});

describe('get-bank-account', () => {
  it('success', async () => {
    const bankAccount = await seedBankAccount();

    const responseBody = await testApi(show, {
      pathParameters: {
        bankAccountId: bankAccount.id,
      },
    });

    expect(responseBody.bankAccount).toMatchObject({
      id: bankAccount.id,
      bankAccountNumber: bankAccount.bankAccountNumber,
      bankContactId: bankAccount.bankContactId,
      companyId: bankAccount.companyId,
      currencyCode: bankAccount.currencyCode,
      name: bankAccount.name,
      company: {
        id: bankAccount.company.id,
        branch: bankAccount.company.branch,
        baseCurrency: bankAccount.company.baseCurrency,
      },
      contact: {
        id: bankAccount.bankContact.id,
        name: bankAccount.bankContact.name,
        registrationNumber: bankAccount.bankContact.registrationNumber,
        registrationCountryCode: bankAccount.bankContact.registrationCountryCode,
      },
    });
  });

  describe('errors', () => {
    it('not found', async () => {
      const response = await testApiError(show, {
        pathParameters: {
          bankAccountId: WRONG_ID,
        },
      });
      expectNotFound(response);
    });
  });

  describe('ACL', () => {
    it('agent - success', async () => {
      const bankAccount = await seedBankAccount();

      await testApi(show, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
      });
    });

    it('agent - fail w/o permissions', async () => {
      const bankAccount = await seedBankAccount();

      const response = await testApiError(show, {
        requestContext: fakeAgentRequestContext({ permissions: [] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
      });

      expectForbidden(response);
    });
  });
});

describe('create-bank-account', () => {
  it('success', async () => {
    const company = await seedCompany();
    const bankContact = await seedContact();
    const bankAccountNumber = `${faker.finance.iban()} 111-222 33-3`;

    const request: AcBankAccountCreateRequest = {
      body: {
        bankAccount: {
          name: faker.finance.accountName(),
          bankAccountNumber,
          currencyCode: 'SGD',
          companyId: company.id,
          bankContactId: bankContact.id,
        },
      },
    };

    const responseBody = await testApi(create, request, { statusCode: 201 });

    expect(responseBody.bankAccount).toMatchObject({
      bankAccountNumber: cleanBankAccountNumber(bankAccountNumber),
      bankContactId: request.body.bankAccount.bankContactId,
      companyId: request.body.bankAccount.companyId,
      currencyCode: request.body.bankAccount.currencyCode,
      name: request.body.bankAccount.name,
      company: {
        id: company.id,
        branch: company.branch,
        baseCurrency: company.baseCurrency,
      },
      contact: {
        id: bankContact.id,
        name: bankContact.name,
        registrationNumber: bankContact.registrationNumber,
        registrationCountryCode: bankContact.registrationCountryCode,
      },
    });
  });

  it('optional attributes', async () => {
    const company = await seedCompany();
    const bankContact = await seedContact();

    const request: AcBankAccountCreateRequest = {
      body: {
        bankAccount: {
          name: faker.finance.accountName(),
          bankAccountNumber: faker.finance.iban(),
          currencyCode: 'SGD',
          bankContactId: bankContact.id,
          companyId: company.id,
          openDate: new Date(2020, 0, 1).toISOString(),
          closeDate: new Date(2021, 11, 31).toISOString(),
        },
      },
    };

    const responseBody = await testApi(create, request, { statusCode: 201 });

    expect(responseBody.bankAccount).toMatchObject({
      name: request.body.bankAccount.name,
      bankAccountNumber: request.body.bankAccount.bankAccountNumber,
      currencyCode: request.body.bankAccount.currencyCode,
      bankContactId: request.body.bankAccount.bankContactId,
      companyId: request.body.bankAccount.companyId,
      openDate: '2020-01-01',
      closeDate: '2021-12-31',
    });
  });

  it('with empty openDate', async () => {
    const company = await seedCompany();
    const bankContact = await seedContact();

    await testApi(
      create,
      {
        body: {
          bankAccount: {
            name: faker.finance.accountName(),
            bankAccountNumber: faker.finance.iban(),
            currencyCode: 'SGD',
            companyId: company.id,
            bankContactId: bankContact.id,
          },
        },
      },
      { statusCode: 201 },
    );
  });

  describe('validation', () => {
    it('basic', async () => {
      const requestBankAccount = await fakeCreate();

      const response = await testApiError(create, {
        body: {
          bankAccount: {
            ...requestBankAccount,
            openDate: '2021-10-111',
            closeDate: '2021-10-222',
          },
        },
      });

      expectValidationErrors(response, {
        message: "Validation errors: 'openDate' must be date, 'closeDate' must be date",
        fields: [
          { name: 'openDate', message: 'must be date' },
          { name: 'closeDate', message: 'must be date' },
        ],
      });
    });

    it('datetime order', async () => {
      const requestBankAccount = await fakeCreate();

      const response = await testApiError(create, {
        body: {
          bankAccount: {
            ...requestBankAccount,
            openDate: faker.date.future().toDateString(),
            closeDate: faker.date.past().toDateString(),
          },
        },
      });

      expectValidationError(
        response,
        "Validation errors: 'closeDateAfterOpen' close date should be later than open date",
      );
    });
  });

  describe('ACL', () => {
    it('agent - success', async () => {
      const requestBankAccount = await fakeCreate();

      await testApi(
        create,
        {
          requestContext: fakeAgentRequestContext({
            permissions: [PermissionType.companiesWrite],
          }),
          body: {
            bankAccount: requestBankAccount,
          },
        },
        { statusCode: 201 },
      );
    });

    it('agent - fail w/o permissions', async () => {
      const requestBankAccount = await fakeCreate();

      const response = await testApiError(create, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
        body: {
          bankAccount: requestBankAccount,
        },
      });

      expectForbidden(response);
    });
  });
});

describe('update-bank-account', () => {
  it('success', async () => {
    const bankAccount = await seedBankAccount();

    const request: AcBankAccountUpdateRequest = {
      pathParameters: {
        bankAccountId: bankAccount.id,
      },
      body: {
        bankAccount: {
          name: faker.finance.accountName(),
        },
      },
    };

    const responseBody = await testApi(update, request);

    expect(responseBody.bankAccount).toMatchObject({
      name: request.body.bankAccount.name,
      bankAccountNumber: bankAccount.bankAccountNumber,
    });
  });

  it('null to undefined for non-nullable fields', async () => {
    const bankAccount = await seedBankAccount();

    const request: AcBankAccountUpdateRequest = {
      pathParameters: {
        bankAccountId: bankAccount.id,
      },
      body: {
        bankAccount: {
          bankAccountNumber: faker.finance.iban(),
          name: null,
          currencyCode: null,
        },
      },
    };

    const responseBody = await testApi(update, request);

    expect(responseBody.bankAccount).toMatchObject({
      bankAccountNumber: request.body.bankAccount.bankAccountNumber,
      name: bankAccount.name,
      currencyCode: bankAccount.currencyCode,
    });
  });

  it('optional attributes', async () => {
    const bankAccount = await seedBankAccount();
    const newBankContact = await seedContact();

    const request: AcBankAccountUpdateRequest = {
      pathParameters: {
        bankAccountId: bankAccount.id,
      },
      body: {
        bankAccount: {
          name: faker.finance.accountName(),
          bankAccountNumber: faker.finance.iban(),
          currencyCode: bankAccount.currencyCode,
          openDate: new Date(2020, 0, 1).toISOString(),
          closeDate: new Date(2021, 11, 31).toISOString(),
          bankContactId: newBankContact.id,
          companyId: bankAccount.companyId,
        },
      },
    };

    const responseBody = await testApi(update, request);

    expect(responseBody.bankAccount).toMatchObject({
      name: request.body.bankAccount.name,
      bankAccountNumber: request.body.bankAccount.bankAccountNumber,
      currencyCode: request.body.bankAccount.currencyCode,
      openDate: '2020-01-01',
      closeDate: '2021-12-31',
      bankContactId: request.body.bankAccount.bankContactId,
      companyId: request.body.bankAccount.companyId,
      company: {
        id: bankAccount.company.id,
      },
      contact: {
        id: newBankContact.id,
      },
    });
  });

  describe('errors', () => {
    it('not found', async () => {
      const response = await testApiError(update, {
        pathParameters: {
          bankAccountId: WRONG_ID,
        },
        body: {
          bankAccount: fakeUpdate(),
        },
      });

      expectNotFound(response);
    });
  });

  describe('ACL', () => {
    it('agent - success', async () => {
      const bankAccount = await seedBankAccount();

      await testApi(update, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesWrite] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
        body: {
          bankAccount: fakeUpdate(),
        },
      });
    });

    it('agent - fail w/o permissions', async () => {
      const bankAccount = await seedBankAccount();

      const response = await testApiError(update, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
        body: {
          bankAccount: fakeUpdate(),
        },
      });

      expectForbidden(response);
    });
  });
});

describe('delete-bank-account', () => {
  it('success', async () => {
    const bankAccount = await seedBankAccount();

    await testApiNoContent(destroy, {
      pathParameters: {
        bankAccountId: bankAccount.id,
      },
    });

    await bankAccount.reload({ paranoid: false });
    expect(bankAccount.isSoftDeleted()).toBeTruthy();
  });

  describe('errors', () => {
    it('not found', async () => {
      const response = await testApiError(destroy, {
        pathParameters: {
          bankAccountId: WRONG_ID,
        },
      });

      expectNotFound(response);
    });
  });

  describe('ACL', () => {
    it('agent - success', async () => {
      const bankAccount = await seedBankAccount();

      await testApiNoContent(destroy, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesWrite] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
      });
    });

    it('agent - fail w/o permissions', async () => {
      const bankAccount = await seedBankAccount();

      const response = await testApiError(destroy, {
        requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
        pathParameters: {
          bankAccountId: bankAccount.id,
        },
      });

      expectForbidden(response);
    });
  });
});

// helpers

async function fakeCreate(): Promise<AcBankAccountCreateRequest['body']['bankAccount']> {
  const company = await seedCompany();
  const bankContact = await seedContact();
  return {
    name: faker.finance.accountName(),
    bankAccountNumber: faker.finance.iban(),
    currencyCode: 'SGD',
    openDate: faker.date.past().toDateString(),
    companyId: company.id,
    bankContactId: bankContact.id,
  };
}

function fakeUpdate(): AcBankAccountUpdateRequest['body']['bankAccount'] {
  return {
    name: faker.finance.accountName(),
  };
}
