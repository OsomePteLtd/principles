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

  const companyQuery = useGetCompany(companyId);
  const company = companyQuery.data?.company;

  const userQuery = useGetMe(companyId);
  const user = userQuery.data?.user;

  // prefetch bank accounts
  useGetAcCompanyBankAccounts(companyId);

  if (!company || !user) {
    return <PageSkeleton />;
  }

  const hasAccess = hasUserAccessToCompany(user, company);

  if (!hasAccess) {
    return <Redirect to="/companies" />;
  }

  return (
    <PageLayout>
      <PageTitle>Bank Accounts</PageTitle>
      <CompanyAcBankAccounts companyId={companyId} />
    </PageLayout>
  );
};
