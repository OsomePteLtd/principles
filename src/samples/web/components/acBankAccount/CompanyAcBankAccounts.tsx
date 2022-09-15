import { AcBankAccount, AcBankAccountNew, AcBankAccountUpdate } from '@osome/sdk';
import { Card, Button, Preloader } from '@osome/ui-kit';
import React, { useCallback, useState } from 'react';

import {
  useCreateAcBankAccount,
  useGetAcCompanyBankAccounts,
  usePatchAcBankAccount,
} from '../../queries/acBankAccount.query';

interface CompanyAcBankAccountsProps {
  companyId: number;
}

type ViewMode = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; acBankAccount: AcBankAccount };

export const CompanyAcBankAccounts = (props: CompanyAcBankAccountsProps) => {
  const { companyId } = props;

  const [view, setView] = useState<ViewMode>({ mode: 'list' });

  const { data: acBankAccounts, isLoading: areBankAccountsLoading } = useGetAcCompanyBankAccounts(
    companyId,
  );

  const handleAddBankAccount = useCallback(
    () =>
      setView({
        mode: 'add',
      }),
    [],
  );

  const {
    mutate: mutateCreateAcBankAccount,
    isLoading: isSubmittingCreateBankAccount,
  } = useCreateAcBankAccount();
  const handleSubmitAddBankAccount = useCallback(
    (acBankAccountNew: AcBankAccountNew) => mutateCreateAcBankAccount(acBankAccountNew),
    [mutateCreateAcBankAccount],
  );

  const {
    mutate: mutateEditAcBankAccount,
    isLoading: isSubmittingEditBankAccount,
  } = usePatchAcBankAccount(view.mode === 'edit' ? view.acBankAccount.id : 0);
  const handleSubmitEditBankAccount = useCallback(
    (acBankAccountUpdate: AcBankAccountUpdate) => mutateEditAcBankAccount(acBankAccountUpdate),
    [mutateEditAcBankAccount],
  );
  const handleEditBankAccount = useCallback(
    (acBankAccount: AcBankAccount) =>
      setView({
        mode: 'edit',
        acBankAccount,
      }),
    [],
  );

  const handleCancelForm = useCallback(
    () =>
      setView({
        mode: 'list',
      }),
    [],
  );

  if (areBankAccountsLoading) {
    return <Preloader />;
  }

  if (!acBankAccounts) {
    return null;
  }

  return (
    <Card>
      {view.mode === 'list' && (
        <>
          <AcBankAccountsTable acBankAccounts={acBankAccounts} onEdit={handleEditBankAccount} />
          <Button onClick={handleAddBankAccount}>Add Bank Account</Button>
        </>
      )}
      {view.mode === 'edit' && (
        <AcBankAccountForm
          initialBankAccount={view.acBankAccount}
          isSubmitting={isSubmittingEditBankAccount}
          onSubmit={() => handleSubmitAddBankAccount}
          onCancel={handleCancelForm}
        />
      )}
      {view.mode === 'add' && (
        <AcBankAccountForm
          initialBankAccount={null}
          isSubmitting={isSubmittingCreateBankAccount}
          onSubmit={handleSubmitEditBankAccount}
          onCancel={handleCancelForm}
        />
      )}
    </Card>
  );
};
