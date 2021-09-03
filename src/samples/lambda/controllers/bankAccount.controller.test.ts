import { AcBankAccountCreateRequest, AcBankAccountUpdateRequest, PermissionType } from '@osome/sdk';
import {
  expectForbidden,
  expectNotFound,
  expectValidationError,
  fakeAgentRequestContext,
  testApi,
  testApiError,
  testApiNoContent,
} from '@osome/server-toolkit';
import { format } from 'date-fns';
import * as faker from 'faker';

import { BankAccount } from '../../models';
import { cleanBankAccountNumber } from '../../services/bankAccount.service';
import { WRONG_ID } from '../../tests/helpers';
import { seedBankAccount } from '../../tests/seeds/bankAccount.seed';
import { seedCompany } from '../../tests/seeds/company.seed';
import { seedContact } from '../../tests/seeds/contact.seed';
import { create, destroy, index, show, update } from './bankAccount.controller';

describe(__filename, () => {
  describe('get-bank-accounts', () => {
    it('success', async () => {
      const { company, bankAccount, bankContact } = await seedBankAccountExtended();

      const responseBody = await testApi(index, {
        pathParameters: {
          companyId: company.id,
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
        },
      ]);
    });

    describe('filter', () => {
      it('bankAccountNumber', async () => {
        const bankAccountNumber = faker.finance.iban();
        const { company, bankAccount, bankContact } = await seedBankAccountExtended({
          overrides: {
            bankAccountOverridesAttributes: { bankAccountNumber },
          },
        });
        await seedBankAccount({
          companyId: company.id,
          bankContactId: bankContact.id,
          bankAccountNumber: bankAccountNumber + faker.finance.iban(),
        });

        const responseBody = await testApi(index, {
          pathParameters: {
            companyId: company.id,
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
        const { company, bankAccount, bankContact } = await seedBankAccountExtended({
          overrides: {
            bankAccountOverridesAttributes: { currencyCode: 'SGD' },
          },
        });
        await seedBankAccount({
          companyId: company.id,
          bankContactId: bankContact.id,
          currencyCode: 'USD',
        });

        const responseBody = await testApi(index, {
          pathParameters: {
            companyId: company.id,
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
      it('closeDate and createdAt', async () => {
        const company = await seedCompany();
        const bankContact = await seedContact();
        await seedBankAccount({
          name: 'bankAccountClosed1',
          companyId: company.id,
          bankContactId: bankContact.id,
          closeDate: format(faker.date.past(), 'yyyy-MM-dd'),
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
          closeDate: format(faker.date.past(), 'yyyy-MM-dd'),
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
        const { company } = await seedBankAccountExtended();

        const responseBody = await testApi(index, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
          pathParameters: {
            companyId: company.id,
          },
        });

        expect(responseBody.bankAccounts).toHaveLength(1);
      });

      it('agent - fail w/o permissions', async () => {
        const { company } = await seedBankAccountExtended();

        const response = await testApiError(index, {
          requestContext: fakeAgentRequestContext({ permissions: [] }),
          pathParameters: {
            companyId: company.id,
          },
        });

        expectForbidden(response);
      });
    });
  });

  describe('get-bank-account', () => {
    it('success', async () => {
      const { bankAccount, bankContact, company } = await seedBankAccountExtended();

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
        const { bankAccount } = await seedBankAccountExtended();

        await testApi(show, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
          pathParameters: {
            bankAccountId: bankAccount.id,
          },
        });
      });

      it('agent - fail w/o permissions', async () => {
        const { bankAccount } = await seedBankAccountExtended();

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
            openDate: faker.date.past().toDateString(),
            companyId: company.id,
            bankContactId: bankContact.id,
          },
        },
      };

      const responseBody = await testApi(create, request, { statusCode: 201 });

      expect(responseBody.bankAccount).toMatchSchema({
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

    it('with empty openDate', async () => {
      const company = await seedCompany();
      const bankContact = await seedContact();
      const bankAccountNumber = `${faker.finance.iban()} 111-222 33-3`;

      await testApi(
        create,
        {
          body: {
            bankAccount: {
              name: faker.finance.accountName(),
              bankAccountNumber,
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
      it('datetime order', async () => {
        const company = await seedCompany();
        const bankContact = await seedContact();

        const response = await testApiError(create, {
          body: {
            bankAccount: {
              name: faker.finance.accountName(),
              bankAccountNumber: faker.finance.iban(),
              currencyCode: 'SGD',
              openDate: faker.date.future().toDateString(),
              closeDate: faker.date.past().toDateString(),
              companyId: company.id,
              bankContactId: bankContact.id,
            },
          },
        });

        expectValidationError(response, 'closeDate should be later than openDate');
      });
    });

    describe('ACL', () => {
      it('agent - success', async () => {
        const company = await seedCompany();
        const bankContact = await seedContact();
        const bankAccountNumber = `${faker.finance.iban()} 111-222 33-3`;

        await testApi(
          create,
          {
            requestContext: fakeAgentRequestContext({
              permissions: [PermissionType.companiesWrite],
            }),
            body: {
              bankAccount: {
                name: faker.finance.accountName(),
                bankAccountNumber,
                currencyCode: 'SGD',
                openDate: faker.date.past().toDateString(),
                companyId: company.id,
                bankContactId: bankContact.id,
              },
            },
          },
          { statusCode: 201 },
        );
      });

      it('agent - fail w/o permissions', async () => {
        const company = await seedCompany();
        const bankContact = await seedContact();

        const response = await testApiError(create, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
          body: {
            bankAccount: {
              name: faker.finance.accountName(),
              bankAccountNumber: faker.finance.iban(),
              currencyCode: 'SGD',
              openDate: faker.date.past().toDateString(),
              companyId: company.id,
              bankContactId: bankContact.id,
            },
          },
        });

        expectForbidden(response);
      });
    });
  });

  describe('update-bank-account', () => {
    it('success', async () => {
      const { bankAccount, company } = await seedBankAccountExtended();
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
            companyId: bankAccount.companyId,
            bankContactId: newBankContact.id,
            openDate: new Date().toISOString(),
          },
        },
      };

      const responseBody = await testApi(update, request);

      expect(responseBody.bankAccount).toMatchObject({
        bankAccountNumber: request.body.bankAccount.bankAccountNumber,
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
          id: newBankContact.id,
          name: newBankContact.name,
          registrationNumber: newBankContact.registrationNumber,
          registrationCountryCode: newBankContact.registrationCountryCode,
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
            bankAccount: {
              name: faker.finance.accountName(),
            },
          },
        });

        expectNotFound(response);
      });
    });

    describe('ACL', () => {
      it('agent - success', async () => {
        const { bankAccount } = await seedBankAccountExtended();
        const newBankContact = await seedContact();

        await testApi(update, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesWrite] }),
          pathParameters: {
            bankAccountId: bankAccount.id,
          },
          body: {
            bankAccount: {
              name: faker.finance.accountName(),
            },
          },
        });
      });

      it('agent - fail w/o permissions', async () => {
        const { bankAccount } = await seedBankAccountExtended();

        const response = await testApiError(update, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesRead] }),
          pathParameters: {
            bankAccountId: bankAccount.id,
          },
          body: {
            bankAccount: {
              name: faker.finance.accountName(),
            },
          },
        });

        expectForbidden(response);
      });
    });
  });

  describe('delete-bank-account', () => {
    it('success', async () => {
      const { bankAccount } = await seedBankAccountExtended();

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
        const { bankAccount } = await seedBankAccountExtended();

        await testApiNoContent(destroy, {
          requestContext: fakeAgentRequestContext({ permissions: [PermissionType.companiesWrite] }),
          pathParameters: {
            bankAccountId: bankAccount.id,
          },
        });
      });

      it('agent - fail w/o permissions', async () => {
        const { bankAccount } = await seedBankAccountExtended();

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
});

// private

async function seedBankAccountExtended(
  {
    overrides: { bankAccountOverridesAttributes },
  }: {
    overrides: { bankAccountOverridesAttributes?: Partial<BankAccount> };
  } = {
    overrides: { bankAccountOverridesAttributes: {} },
  },
) {
  const company = await seedCompany();
  const bankContact = await seedContact();
  const bankAccount = await seedBankAccount({
    companyId: company.id,
    bankContactId: bankContact.id,
    ...bankAccountOverridesAttributes,
  });

  return {
    company,
    bankContact,
    bankAccount,
  };
}
