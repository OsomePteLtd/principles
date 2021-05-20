import {
  AcBankAccountCreateRequest,
  AcBankAccountDeleteRequest,
  AcBankAccountGetRequest,
  AcBankAccountIndexRequest,
  AcBankAccountListResponse,
  AcBankAccountRequest,
  AcBankAccountResponse,
  AcBankAccountUpdateRequest,
  PermissionType,
  schemas,
} from '@osome/sdk';
import { APIGatewayEvent } from 'aws-lambda';
import { WhereAttributeHash } from 'sequelize';

import { authorize } from '../../lib/acl';
import { api2, apiNoContent } from '../../lib/app';
import { BankAccount } from '../../models';
import {
  createBankAccount,
  deleteBankAccount,
  updateBankAccount,
} from '../../services/bankAccount.service';

export const index = api2<AcBankAccountIndexRequest, AcBankAccountListResponse>(
  schemas.AcBankAccountIndexRequest,
  schemas.AcBankAccountListResponse,
  async ({ request, event }) => {
    await authoriseRead(event);
    const bankAccounts = await findBankAccounts(request);
    return {
      body: { bankAccounts },
    };
  },
);

export const show = api2<AcBankAccountGetRequest, AcBankAccountResponse>(
  schemas.AcBankAccountGetRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    await authoriseRead(event);
    const bankAccount = await findBankAccount(request);
    return {
      body: { bankAccount },
    };
  },
);

export const create = api2<AcBankAccountCreateRequest, AcBankAccountResponse>(
  schemas.AcBankAccountCreateRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    await authoriseWrite(event);
    const bankAccount = await createBankAccount(request.body.bankAccount);
    return {
      statusCode: 201,
      body: { bankAccount },
    };
  },
);

export const update = api2<AcBankAccountUpdateRequest, AcBankAccountResponse>(
  schemas.AcBankAccountUpdateRequest,
  schemas.AcBankAccountResponse,
  async ({ request, event }) => {
    await authoriseWrite(event);
    const bankAccount = await findBankAccount(request);
    await updateBankAccount(bankAccount, request.body.bankAccount);
    return {
      body: { bankAccount },
    };
  },
);

export const destroy = apiNoContent<AcBankAccountDeleteRequest>(
  schemas.AcBankAccountDeleteRequest,
  async ({ request, event }) => {
    await authoriseWrite(event);
    const bankAccount = await findBankAccount(request);
    await deleteBankAccount(bankAccount);
  },
);

// private

function authoriseRead(event: APIGatewayEvent) {
  return authorize(event, {
    agent: { permissionType: PermissionType.companiesRead },
  });
}

function authoriseWrite(event: APIGatewayEvent) {
  return authorize(event, {
    agent: { permissionType: PermissionType.companiesWrite },
  });
}

function findBankAccounts(request: AcBankAccountIndexRequest): Promise<BankAccount[]> {
  const where: WhereAttributeHash<BankAccount> = {
    companyId: request.pathParameters.companyId,
  };
  return BankAccount.findAll({
    where,
    order: [['createdAt', 'ASC']],
    include: [BankAccount.company, BankAccount.bankContact],
  });
}

function findBankAccount(request: AcBankAccountRequest): Promise<BankAccount> {
  return BankAccount.findByPk(request.pathParameters.bankAccountId, {
    rejectOnEmpty: true,
    include: [BankAccount.company, BankAccount.bankContact],
  });
}
