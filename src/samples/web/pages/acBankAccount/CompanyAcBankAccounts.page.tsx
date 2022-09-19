import { PageLayout, PageTitle, PageSkeleton } from '@osome/ui-kit';
import React from 'react';
import { Redirect } from 'react-router-dom';

import { CompanyAcBankAccounts } from '../../components/acBankAccount/CompanyAcBankAccounts';
import { useGetAcCompanyBankAccounts } from '../../queries/acBankAccount.query';
import { useGetCompany } from '../../queries/company.service';
import { useGetMe } from '../../queries/user.service';
import { hasUserAccessToCompany } from '../../services/company.service';

interface CompanyAcBankAccountsPageProps {
  companyId: number;
}

export const CompanyAcBankAccountsPage = (props: CompanyAcBankAccountsPageProps) => {
  const { companyId } = props;

  const { data: companyData } = useGetCompany(companyId);
  const company = companyData?.company;

  const { data: userData } = useGetMe();
  const user = userData?.user;

  // prefetch bank accounts
  const { error } = useGetAcCompanyBankAccounts(companyId);

  if (!company || !user) {
    return <PageSkeleton />;
  }

  const hasAccess = hasUserAccessToCompany(user, company);

  if (!hasAccess || error?.code === 403) {
    return <Redirect to="/companies" />;
  }

  return (
    <PageLayout>
      <PageTitle>Bank Accounts</PageTitle>
      <CompanyAcBankAccounts companyId={companyId} />
    </PageLayout>
  );
};
