# Frontend Development Principles

- [Frontend Development Principles](#frontend-development-principles)
  - [Project structure](#project-structure)
  - [Module federation](#module-federation)
  - [Typescript](#typescript)
  - [SDK](#sdk)
  - [Unit tests](#unit-tests)
  - [Styles](#styles)
  - [UI-kit](#ui-kit)
  - [TanStack Query](#tanstack-query)
  - [Miscellaneous](#miscellaneous)

## Project structure

Project structure should follow next principles:

1. Not needed to move files without changing their purpose.

1. It's easy to identify a single place where a new file should be located.

1. It's easy to understand where to look files/functionality up.

```
src/
  components/ (can be dumb and smart)
    [All components should be placed in some entity directory or shared directory]
    bankAccount/ (entity, module, .etc)
      BankAccountTable/
        [no nested directories]
        [avoid index.ts]
        [other files, but component files .tsx, styled.tsx, stories.tsx, local ui hooks, .test.ts, spec.ts, local static files should be placed in queries or services]
        BankAccountTable.ts
        BankAccountTable.styled.ts
        useBankAccountTable.ts (ui hook used only in the current component)
        BankAccountTable.stories.tsx
        BankAccountTable.test.ts (unit tests)
        BankAccountTable.spec.ts (integration tests)
        BankAccountTableBadge.ts (child component)
        useBankAccountTableBadge.ts (ui hook used only in the current component)
        icon.svg|png|jpeg... (the icon or any static file used only in the current component)
    shared/
      SomeNonEntityComponent/
      media/ (shared static files)
        [no nested directories]
        icon.svg|png|jpeg...
  entryPoints/
    [exposed MF modules]
    [no nested directories]
  pages/
    bankAccount/
      BankAccountList/
        [no nested directories]
        [other files should be placed in queries or services]
        [components for the page should be placed in components directory]
        BankAccountList.page.ts
        BankAccountList.page.styled.tsx
        BankAccountList.page.spec.ts (integration tests)
  queries/
    [hooks use react-query, sdk, include mutations, some data normalisation, .etc]
    bankAccount.query.ts
  services/
    [can be splitted into several files]
    bankAccount/ (utils, helpers, all the things that should not be put in the components directory)
      [no nested directories]
      bankAccount.service.ts
      bankAccountJournal.service.ts
      useBankAccount.service.ts (hooks used only in bankAccount, don't make requests directly)
    [or single file]
    auditLog.service.ts
    useEventOnReady.service.ts (common hooks not bound to a specific component, used in more than one component, don't make requests directly)
```

Notes:

- **avoid adding additional top-level directories to the project**;
- component ui hook [example](https://github.com/OsomePteLtd/agent-factory-tickets/blob/7ca56a50993592d1dbfc62a272559423e0b16303/src/components/reconciliation/shared/Basket/Basket.tsx);
- query hook [example](https://github.com/OsomePteLtd/agent/blob/main/src/queries/auditLog.query.ts);
- entity hook [example](https://github.com/OsomePteLtd/websome/blob/main/src/hooks/ticket/useTicketNavigation.ts);
- common hook [example](https://github.com/OsomePteLtd/websome-accounting/blob/2e48a950f2694145211dd3f3c3183c23b43e3158/src/hooks/useEventOnReady.ts);
- service [example](https://github.com/OsomePteLtd/websome/blob/main/src/services/company.service.ts)

## Module federation

1. Use `entryPoints` directory to expose components of your microfrontend

1. Make microfrontends working without copying `.example.env` to `.env`. Provide defaults in your sandbox code. `.env` file is not forbidden but shouldn't obligatory for sandbox. It helps to use microfrontend for developers from other teams and QA who write integration tests.

   ```typescript
   // sandbox code
   // good
   const companyId = process.env.companyId || 12345;
   ```

1. If microfrontend has several sandboxes, microfrontend should have main page with list of links to sandboxes. It provides ability to test different sandboxes during CI and improves experience for developers and QA.

## Typescript

1. Tend to write sound typings. It means you should never get into a state when your data mismatches your typings.

   ```typescript
   // bad, you don't have loaded document for any possible document id
   type DocumentsById = Record<Document['id'], Document>;

   // good
   type DocumentsById = Partial<Record<Document['id'], Document>>;
   ```

1. Prefer specific types instead of common ones. It allows us to prevent more errors or development stage.

   ```typescript
   // bad
   function doSomething(entity: object, options?: object);

   // good
   enum DoSomethingHow = {
     quickly = 'quickly',
     slowly = 'slowly',
   };
   type DoSomethingOptions = {
     how: DoSomethingHow;
     times: number;
   };
   type SomeEntity = {
     id: number;
     title: string;
   }
   function doSomething(entity: SomeEntity, options?: DoSomethingOptions);
   ```

1. Tend to increase typescript coverage, avoid `any` and implicit `any`.

1. When you touch `.js` file, convert it to `.ts`. But if you really need a hotfix or your PR already includes refactoring and additional refactoring can make your PR too swollen, you can add label `hotfix` to your PR, but don't abuse this label.

1. Don't use FC to define react component types. if you need to define children, then use `PropsWithChildren` or define manually

   ```ts
   // Bad
   type SelectProps = { value: string };

   export const Select: FC<SelectProps> = (props) => {
     // ...
   };

   // Good: manually
   interface SelectProps {
     value: string;
     children?: ReactNode;
   }

   export const Select = (props: SelectProps) => {
     // ...
   };

   // Good: with PropsWithChildren
   type SelectProps = PropsWithChildren<{ value: string }>;

   export const Select = (props: SelectProps) => {
     // ...
   };
   ```

## SDK

1. Avoid `as` keyword for importing types from sdk

good ✅

```typescript
import { Ticket } from '@osome/client-sdk';
import * as sdk from '@osome/client-sdk';
```

bad ❌

```typescript
import { Ticket as SomeRandomName } from '@osome/client-sdk';
import { Ticket as KekSdk } from '@osome/client-sdk';
import { Ticket as TicketSdk } from '@osome/client-sdk';
```

## Unit tests

1. If you need to test complicated scenario, prefer e2e over unit tests.

1. Mocks filename on frontend is `x.fake.ts`

bad ❌

```typescript
// seeds/ticket.seed.ts

export function seedTicket() {}
```

good ✅

```typescript
// fakes/ticket.fake.ts

export function fakeTicket() {}
```

## Styles

1. Avoid using nested tags or ids for styling. However, you can use nested tags for svg styles or external libraries components.

   ```typescript
   // bad
   const ParentBlock = styled.div`
     color: red;
     div {
       color: black;
     }
   `;

   // good
   const ParentBlock = styled.div`
     color: red;
   `;
   const ChildBlock = styled.div`
     color: black;
   `;

   // ok
   const ParentBlock = styled.svg`
     path {
       stroke: red;
     }
   `;
   ```

1. If some color is repeated several times in code, extract it to theme.

## UI-kit

1. Design components API for common usage rather than for specific one.

1. If component handles too many specific cases or dramatically changes its appearance on prop changes, consider having several components instead.

   ```typescript
   // bad
   export const Button = ({ type, title, ...props }) => {
     if (type === 'primary') {
       return (
         <PrimaryStyledButton {...props}>
           {title}
         </PrimaryStyledButton>
       );
     }

     if (type === 'go-back') {
       return (
         <StyledGoBackButton {...props}>
           <GoBackIcon />
           {title}
         </StyledGoBackButton>
       );
     }

     // ...
   };

   // good
   export const Button = props => {...};
   export const GoBackButton = props => {...};
   ```

1. Do not hurry to extract components to UI-kit if you have only one. Try to collect more usages of this component. It helps create better component API for common usage.

1. When extracting complicated components to UI-kit, consider exporting component parts instead of single component with complicated API. Complicated APIs are too hard to extend without breaking backward compatibility.

   ```JSX
   // bad
   <MyFancySelect
     options=[
       { value: 'a', type: 'with-counter', counter: 5, title: 'Foo' },
       { type: 'divider' },
       { value: 'b, type: 'simple', title: 'Bar' },
     ]
   />
   ```

   ```JSX
   // good
   <MyFancySelect>
     <OptionWithCounter value='a' counter={5}>Foo</OptionWithCounter>
     <Divider />
     <Option value='a'>Bar</Option>
   </MyFancySelect>
   ```

## TanStack Query

1. Default settings.

   - Overriding `staleTime`.

     We should find suitable value for `staleTime` to avoid cache issues and not to make additional requests.

     ```typescript
     // most likely we will get cache issues
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 60 * 60 * 1000,
         },
       },
     });

     // probably good for most our cases (f.e prefetching data for MFEs)
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 30 * 1000,
         },
       },
     });
     ```

   - Prefer `refetchOnWindowFocus: false`.

     `refetchOnWindowFocus: true` may cause some unwanted refetch, for example, when you open and close system dialog. Read more [here](https://reallyosome.atlassian.net/browse/NEWBORN-1277).

     ```typescript
     // bad,
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           refetchOnWindowFocus: true,
         },
       },
     });

     // bad, because refetchOnWindowFocus is true by default
     const queryClient = new QueryClient();

     // good
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           refetchOnWindowFocus: false,
         },
       },
     });
     ```

   - Prefer not to override other default settings.

     It prevents some cache issues are usually difficult to troubleshoot and resolve. Read more about defaults [here](https://tanstack.com/query/v4/docs/react/guides/important-defaults)

     ```typescript
     // bad
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           refetchOnMount: false,
           cacheTime: 0,
         },
       },
     });

     // good example based on above
     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 30 * 1000,
           refetchOnWindowFocus: false,
         },
       },
     });
     ```

2. Change staleTime and cacheTime for certain query when you totally sure it can not lead to unexpected cache issues.

   > Read more about staleTime and cacheTime [here](https://www.notion.so/osome/Differences-and-Features-of-cacheTime-and-staleTime-parameters-f1f622beb2144b05a4e532e0324334dd)

   ```typescript
   // good
   useQuery(['poa', 'supported_countries'], () => apiSdk.corpsec.poa.supported_countries.get(), {
     // this request doesn't change too often, so we can cache it for a long time
     cacheTime: 60 * 60 * 1000,
     staleTime: 60 * 60 * 1000,
   });
   ```

3. Return the full response from a request

   > Why? It prevents redundant network requests.

   ```typescript
   // bad
   // get user data in one place
   // 1st network request
   const {
     data: { user },
   } = useQuery('currentUser', () =>
     api.getCurrentUser().then((response) => {
       return response.user;
     }),
   );
   // then get user posts in another place using the same API endpoint
   // 2nd network request just to get the same data
   const {
     data: { posts },
   } = useQuery('currentUserPosts', () =>
     api.getCurrentUser().then((response) => {
       return response.posts;
     }),
   );

   // good
   const {
     data: { user },
   } = useQuery('currentUser', () => api.getCurrentUser());
   // 1st network request
   // then later on the same page
   const {
     data: { posts },
   } = useQuery('currentUser', () => api.getCurrentUser());
   // no additional network request needed, use the first one
   ```

4. Add query filters and path params to query keys. Every variable that is used inside the queryFn should be added to the query key.

   > Why? It prevents unexpected cache collisions. [See also](https://tanstack.com/query/v4/docs/react/guides/query-keys).

   ```typescript
   // bad
   // 1st request
   const ticketsQuery = useQuery(['tickets'], () =>
     api.company.id(companyId).tickets.get({
       processDefinitionKeys: [ProcessDefinitionKey.obQualification, ProcessDefinitionKey.obKyc],
     }),
   );
   // 2nd request
   const ticketsQuery = useQuery(['tickets'], () =>
     api.company.id(companyId).tickets.get({
       processDefinitionKeys: [ProcessDefinitionKey.csCorpPass, ProcessDefinitionKey.csFollowUp],
     }),
   );

   // good
   const ticketsQuery = useQuery(
     [
       'tickets',
       {
         companyId,
         processDefinitionKeys: [ProcessDefinitionKey.obQualification, ProcessDefinitionKey.obKyc],
       },
     ],
     () =>
       api.company.id(companyId).tickets.get({
         processDefinitionKeys: [ProcessDefinitionKey.obQualification, ProcessDefinitionKey.obKyc],
       }),
   );
   // 2nd request
   const ticketsQuery = useQuery(
     [
       'tickets',
       {
         companyId,
         processDefinitionKeys: [ProcessDefinitionKey.csCorpPass, ProcessDefinitionKey.csFollowUp],
       },
     ],
     () =>
       api.company.id(companyId).tickets.get({
         processDefinitionKeys: [ProcessDefinitionKey.csCorpPass, ProcessDefinitionKey.csFollowUp],
       }),
   );

   // also good
   const ticketsQuery = useQuery(['tickets', ticketId], () => api.tickets.id(ticketId).get());
   ```

5. Keep all calls to API in `queries` folder.

   > Why? It prevents spreading API code through the whole application code and helps seeing the whole protocol of dealing whit API in one place,
   > which makes query cache management easier.

   ```typescript
   // MyComponent.tsx
   // bad, cache key management is located in component file, hard to control it
   const ticketQuery = useQuery(['ticket', ticketId], () => sdk.tickets.id(ticketId).get());
   // also bad
   const handleSubmitForm = useCallback(
     async (formFields) => {
       const document = sdk.documents.id(documentId).patch({ formFields });
       queryClient.setQueryData(['document', documentId], { document });
     },
     [documentId],
   );

   // good, sdk call is not exposed from .query file, cacheKey is not exposed
   import { useGetTicket } from '../../queries/ticket.query';
   import { usePatchDocument } from '../../queries/document.query';
   ...
   const ticketQuery = useGetTicket(ticketId);
   const documentMutation = usePatchDocument(documentId);
   ```

## I18n

### Translation keys

1. Use `snake_case` for translation keys.

   ```typescript
   // bad
   t('home.helloWorld');

   // good
   t('home.hello_world');
   ```

1. Do not split phrases into several translation keys. Sometimes it's impossible to translate splitted phrase to another language.

   ```typescript
   // bad
   const greeting = t('home.hello') + userName + '!';

   // good
   // in translation file: "hello_user": "Hello, {{userName}}!",
   const greeting = t('home.hello_user', { userName });
   ```

1. Use clear and meaningful key names that succinctly describe their purpose and the value they hold. This is similar to how variables are named in code.

   ```typescript
   // bad
   t('home.button');

   // good
   t('home.create_ticket_button');
   ```

1. Avoid being overly specific and refrain from using translation key values as names.

   ```typescript
   // bad
   t('home.you_have_not_created_any_ticket_yet');

   // good
   t('home.blank_state_text');
   ```

1. Do not nest translation keys too deeply, keep 2-3 levels of nesting. First level should be used for section of the application (module, entry points, page or domain). Second level should be used for grouping similar keys, for example form errors. But don't overthink here.

   ```typescript
   // bad
   t('invoices.payable.list.header.title');

   // good, "invoices_payable" identifies page
   t('invoices_payable.title_invoices_to_pay');

   // good, "grouped" form errors
   t('invoices_payable.create_invoice_form_error.empty_name');
   t('invoices_payable.create_invoice_form_error.empty_number');
   ```

1. Avoid changing translation keys without changing their content. Changing keys forces our translators to handle translations one more time.

1. Do not use dynamic translation keys. We use static tool that prepares translation files for us, and it cannot run code.

   ```typescript
   // bad, should be caught by our custom eslint rule
   const key = isNight ? 'home.good_night' : 'home.good_day';
   const greeting = t(key);

   // good
   const greeting = isNight ? t('home.good_night') : t('home.good_day');
   ```

1. Use `<Trans />` when you need to interpolate components ot html tags (including <br />). Use `t()` in all other cases.

1. Don't use numeric tags in strings handled by `<Trans />`. Use named tag components instead. Also don't pass children to `Trans` because they may mislead developers since only translation string matters. It's needed because formatting or refactoring may change numbers of components which may cause translation to be broken.

   ```typescript
   // bad
   // "key": "<0>go to {{invoicesCount}} invoices<1 /></0> or <2>go to expenses<3 /></2>"
   <Trans i18nKey="key">
     <Link to="/invoices">
       go to {invoicesCount} invoices
       <InvoicesIcon />
     </Link>{' '}
     or{' '}
     <Link to="expenses">
       go to expenses
       <ExpensesIcon />
     </Link>
   </Trans>;

   // good
   // "key": "<linkToInvoices>go to {{invoicesCount}} invoices<invoicesIcon /></linkToInvoices> or <linkToExpenses>go to expenses<expensesIcon /></linkToExpenses>"
   <Trans
     i18nKey="key"
     components={{
       // pay attention: no need to pass children to these components because they will be re-declared based on translation string
       linkToInvoices: <Link to="/invoices" />,
       invoicesIcon: <InvoicesIcon />,
       linkToExpenses: <Link to="/expenses" />,
       expensesIcon: <ExpensesIcon />,
     }}
     values={{
       invoicesCount,
     }}
   />;
   ```

### Namespaces

1. Use namespace in translation keys if it's used not in host app. We use shared single i18n instance through host app and microfrontend, and host app is bound to default namespace.

   ```typescript
   // bad, should be caught by our custom eslint rule (if not host app)
   t('home.hello_world');
   // bad
   t('home.hello_world', { ns: 'invoices' });

   // good
   t('invoices:home.hello_world');
   ```

1. Use only one namespace per repository. It helps us to work with the TMS (Translation Management System).

1. Name of namespace should be unique through all repositories in system. It helps us to avoid translation keys conflict.

## Miscellaneous

1. Prefer UX over DX.

1. Prefer relative imports.

   ```typescript
   // bad
   import { DocumentPreview } from 'components/documents/DocumentPreview';
   ```

   ```typescript
   // good
   import { DocumentPreview } from '../../components/documents/DocumentPreview';
   import { MyBlock } from './MyComponent.styled.ts';
   ```

   Absolute imports allowed for cases:

   1. when we import from `legacy` directory,
   2. when we work inside `legacy` directory.

   ```typescript
   // ok
   // src/legacy/some/path/components/Foo.tsx
   import { Bar } from 'src/components/Bar';

   // ok
   // src/components/Bar.tsx
   import { Baz } from 'src/legacy/some/path/components/Baz';
   ```

1. Report unexpected errors to bugsnag. Pay attention to your try/catch blocks:

   ```typescript
   // good
   try {
     const { documents } = await requestDocuments();
     setSucceed();
     setDocuments(documents);
   } catch (err) {
     reportIfNotRequestError(err);
     setFailed();
   }
   ```

1. Do not use default exports. Prefer named exports over default

   ```typescript
   // good
   export const variable = 10;
   export function Component() {}

   class Component extends React.Component<Props, State> {}
   export { Component };

   // bad
   export default function () {
     return <div>...</div>;
   }

   export default class extends Component {}
   ```
