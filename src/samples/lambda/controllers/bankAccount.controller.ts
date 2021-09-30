import {
  AcBankAccountCreateRequest,
  AcBankAccountDeleteRequest,
  AcBankAccountGetRequest,
  AcBankAccountIndexRequest,
  AcBankAccountListResponse,
  AcBankAccountRequest,
  AcBankAccountResponse,
  AcBankAccountUpdateRequest,
  schemas,
} from '@osome/sdk';
import {
  authorizeModel,
  authorizeRead,
  authorizeWrite,
  throwNotFound,
} from '@osome/server-toolkit';
import { APIGatewayEvent } from 'aws-lambda';
import { WhereAttributeHash } from 'sequelize';

import { api, apiNoContent } from '../../lib/app';
import { BankAccount } from '../../models';
import {
  createBankAccount,
  deleteBankAccount,
  updateBankAccount,
} from '../../services/bankAccount.service';

export const index = api<AcBankAccountIndexRequest, AcBankAccountListResponse>(
  schemas.AcBankAccountIndexRequest,
  schemas.AcBankAccountListResponse,
  async ({ request, event }) => {
    const bankAccounts = await findBankAccounts(event, request);
    return {
      body: { bankAccounts },
    };
  },
);

export const show = api<AcBankAccountGetRequest, AcBankAccountResponse>(
  schemas.AcBankAccountGetRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    const bankAccount = await findBankAccount(request);
    await authorizeRead(event, bankAccount);
    return {
      body: { bankAccount },
    };
  },
);

export const create = api<AcBankAccountCreateRequest, AcBankAccountResponse>(
  schemas.AcBankAccountCreateRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    await authorizeWrite(event, BankAccount.build(request.body.bankAccount));
    const bankAccount = await createBankAccount(request.body.bankAccount);
    return {
      statusCode: 201,
      body: { bankAccount },
    };
  },
);

export const update = api<AcBankAccountUpdateRequest, AcBankAccountResponse>(
  schemas.AcBankAccountUpdateRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    const bankAccount = await findBankAccount(request);
    await authorizeWrite(event, bankAccount);
    await updateBankAccount(bankAccount, request.body.bankAccount);
    return {
      body: { bankAccount },
    };
  },
);

export const destroy = apiNoContent<AcBankAccountDeleteRequest>(
  schemas.AcBankAccountDeleteRequest,
  async ({ request, event }) => {
    const bankAccount = await findBankAccount(request);
    await authorizeWrite(event, bankAccount);
    await deleteBankAccount(bankAccount);
  },
);

// private

async function findBankAccounts(
  event: APIGatewayEvent,
  request: AcBankAccountIndexRequest,
): Promise<BankAccount[]> {
  const { companyId } = request.pathParameters;
  const authorizedModel = await authorizeModel(event, BankAccount, companyId);
  const where: WhereAttributeHash<BankAccount> = { companyId };
  return authorizedModel.findAll({
    where,
    order: [['createdAt', 'ASC']],
    include: [BankAccount.company, BankAccount.bankContact],
  });
}

async function findBankAccount(request: AcBankAccountRequest): Promise<BankAccount> {
  return (
    (await BankAccount.findByPk(request.pathParameters.bankAccountId, {
      include: [BankAccount.company, BankAccount.bankContact],
    })) ?? throwNotFound()
  );
}
