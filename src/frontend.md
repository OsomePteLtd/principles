# Frontend Development Principles

## Project structure

```
src/
  components/ (can be dumb and smart)
    [All components should be placed in some entity folder or shared folder]
    bankAccount/ (entity, module, .etc)
      BankAccountTable/
        [no nested directories]
        [avoid index.ts]
        [other files should be placed in queries or services]
        BankAccountTable.ts
        BankAccountTable.test.ts (unit tests)
        BankAccountTable.spec.ts (integration tests)
        BankAccountTableBadge.ts (child component)
        useBankAccountTableBadge.ts (ui hook used only in the current component)
        BankAccountTable.styled.ts
        useBankAccountTable.ts (ui hook used only in the current component)
        icon.svg|png|jpeg... (the icon or any static file used only in the current component)
    shared/
      SomeNonEntityComponent/
      media/ (shared static files)
        [no nested directories]
        icon.svg|png|jpeg...
  pages/
    bankAccount/
      BankAccountList/
        [no nested directories]
        [other files should be placed in queries or services]
        [components for the page should be placed in components folder]
        BankAccountList.page.ts
        BankAccountList.page.test.ts
  queries/
    [hooks use react-query, sdk, include mutations, some data normalisation, .etc]
    bankAccount.query.ts
  services/
    [can be splitted into several files]
    bankAccount/ (utils, helpers, all the things that should not be put in the components folder)
      [no nested directories]
      bankAccount.service.ts
      bankAccountJournal.service.ts
      useBankAccount.service.ts (hooks used only in bankAccount, don't make requests directly)
    [or single file]
    auditLog.service.ts
    useEventOnReady.service.ts (common hooks not bound to a specific component, used in more than one component, don't make requests directly)
```

Notes:

- **avoid adding additional folders to the project**;
- component ui hook [example](https://github.com/OsomePteLtd/agent-factory-tickets/blob/7ca56a50993592d1dbfc62a272559423e0b16303/src/components/reconciliation/shared/Basket/Basket.tsx);
- query hook [example](https://github.com/OsomePteLtd/agent/blob/main/src/queries/auditLog.query.ts);
- entity hook [example](https://github.com/OsomePteLtd/websome/blob/main/src/hooks/ticket/useTicketNavigation.ts);
- common hook [example](https://github.com/OsomePteLtd/websome-accounting/blob/2e48a950f2694145211dd3f3c3183c23b43e3158/src/hooks/useEventOnReady.ts);
- service [example](https://github.com/OsomePteLtd/websome/blob/main/src/services/company.service.ts)

## Module federation project structure (for services which exports Components)

Same as above but with some new folders:

```
src/
  entryPoints/

```

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

1. Unit tests should be really "unit". Tend to extract smaller components, hooks and functions for testing specific logic instead of testing a big one.

1. Use `shallowRender` if you need to test component that includes many nested children. So changes in child components shouldn't affect your unit test.

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

## Redux

1. Group entities by domain, not by usage.

   ```typescript
   // bad
   type State = {
     documentView: {
       document: Document | null,
     },
     documentsTable: {
       documents: Document[],
     },
   };

   // good
   type State = {
     documents: {
       documentsById: DocumentsById,
       allDocumentIds: Document['id][],
     }
   };
   ```

1. Avoid state duplication.

   ```typescript
   // bad
   type State = {
     selectedDocument: Document;
     documentsById: DocumentsById;
   };

   // good
   type State = {
     selectedDocumentId: Document['id'];
     documentsById: DocumentsById;
   };
   ```

1. Do not mix different data formats into one store field since it's impossible to say if we have specific entity fields loaded.

   ```typescript
   // bad
   type Ticket = {...};
   type SingleTicket = Ticket & {...};
   type State = {
     ticketsById: TicketsById,
   };
   ticketsReducer.on(loadTickets.success, (state, { tickets }) => addTicketsToStore(tickets));
   ticketsReducer.on(loadSingleTicket.success, (state, { ticket }) => addTicketsToStore([ticket]));

   // good
   type Ticket = {...};
   type SingleTicket = Ticket & {...};
   type State = {
     ticketsById: TicketsById,
     singleTicketsById: SingleTicketsById,
   };
   ticketsReducer.on(loadTickets.success, (state, { tickets }) => addTicketsToStore(tickets));
   ticketsReducer.on(loadSingleTicket.success, (state, { ticket }) => addSingleTicketToStore(ticket));
   ```

1. Avoid navigation in middleware, prefer having it in components.

   ```typescript
   // bad
   // saga.ts
   const nextTicketId = yield select(getNextTicketId, { ticketId });
   yield call(resolveTicket, { ticketId });
   if (nextTicketId) {
     // if request takes too long, user may go from ticket's page to document page,
     // so redirect may be unexpected
     push(createTicketLink(nextTicketId));
   }

   // good
   // Component.tsx
   useEffect(() => {
     if (ticket.resolved && !prevTicket.current.resolved) {
       setRedirectToNextTicketId();
     }
   }, [ticket]);

   // you can also call push() from component, but declarative Redirect is preferrable
   return shouldRedirectToNextTicketId ? <Redirect to={createTicketLink(nextTicketId)} /> : null;
   ```

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

   1. when we import from `legacy` folder,
   2. when we work inside `legacy` folder.

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

## Module federation

1. Use `entryPoints` folder to expose components of your microfrontend

1. Make microfrontends working without copying `.example.env` to `.env`. Provide defaults in your sandbox code. `.env` file is not forbidden but shouldn't obligatory for sandbox. It helps to use microfrontend for developers from other teams and QA who write integration tests.

   ```typescript
   // sandbox code
   // good
   const companyId = process.env.companyId || 12345;
   ```

1. If microfrontend has several sandboxes, microfrontend should have main page with list of links to sandboxes. It provides ability to test different sandboxes during CI and improves experience for developers and QA.
