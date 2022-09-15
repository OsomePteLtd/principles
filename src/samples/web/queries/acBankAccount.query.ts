import { AcBankAccountNew, AcBankAccountResponse, AcBankAccountUpdate } from '@osome/sdk';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { sdk } from '../services/sdk.service';

const acBankAccountCacheKey = (bankAccountId: number) => ['acBankAccount', bankAccountId];
const companyAcBankAccountsCacheKey = (companyId: number) => ['acCompanyBankAccounts', companyId];

export function useCreateAcBankAccount() {
  const queryClient = useQueryClient();

  return useMutation<AcBankAccountResponse, AxiosError, AcBankAccountNew>(
    (bankAccountNew) =>
      sdk.accounting.companies
        .companyId(bankAccountNew.companyId)
        .bank_accounts.post({ bankAccount: bankAccountNew }),
    {
      onSuccess(responseBody) {
        const { id, companyId } = responseBody.bankAccount;
        queryClient.setQueryData(acBankAccountCacheKey(id), responseBody);
        queryClient.invalidateQueries(companyAcBankAccountsCacheKey(companyId));
      },
    },
  );
}

export function useGetAcBankAccount(bankAccountId: number) {
  return useQuery(acBankAccountCacheKey(bankAccountId), () =>
    sdk.accounting.bank_accounts.id(bankAccountId).get(),
  );
}

export function usePatchAcBankAccount(bankAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation(
    (bankAccountUpdate: AcBankAccountUpdate) =>
      sdk.accounting.bank_accounts.id(bankAccountId).patch({ bankAccount: bankAccountUpdate }),
    {
      onSuccess(responseBody) {
        const { id, companyId } = responseBody.bankAccount;
        queryClient.setQueryData(acBankAccountCacheKey(id), responseBody);
        queryClient.invalidateQueries(companyAcBankAccountsCacheKey(companyId));
      },
    },
  );
}

export function useDeleteAcBankAccount(bankAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation(() => sdk.accounting.bank_accounts.id(bankAccountId).delete(), {
    onSuccess(responseBody) {
      const { id, companyId } = responseBody.bankAccount;
      queryClient.removeQueries(acBankAccountCacheKey(id));
      queryClient.invalidateQueries(companyAcBankAccountsCacheKey(companyId));
    },
  });
}

export function useGetAcCompanyBankAccounts(companyId: number) {
  const queryClient = useQueryClient();

  return useQuery(
    companyAcBankAccountsCacheKey(companyId),
    () => sdk.accounting.companies.companyId(companyId).bank_accounts.get(),
    {
      onSuccess(responseBody) {
        responseBody.bankAccounts.forEach((bankAccount) =>
          queryClient.setQueryData(acBankAccountCacheKey(bankAccount.id), {
            bankAccount,
          }),
        );
      },
    },
  );
}
