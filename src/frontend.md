# Frontend Development Principles

## Typescript

1. Tend to write sound typings. It means you should never get into a state when your data mismatches your typings.

   ```
   // bad, you don't have loaded document for any possible document id
   type DocumentsById = Record<Document['id'], Document>;

   // good
   type DocumentsById = Partial<Record<Document['id'], Document>>;
   ```

1. Prefer specific types instead of common ones. It allows us to prevent more errors or development stage.

   ```
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
   function doSomething(entity: Entity, options?: DoSomethingOptions);
   ```

1. Tend to increase typescript coverage, avoid `any` and implicit `any`.

1. When you touch `.js` file, convert it to `.ts`. But if you really need a hotfix or your PR already includes refactoring and additional refactoring can make your PR too swollen, you can add label `hotfix` to your PR, but don't abuse this label.

## Unit tests

1. Unit tests should be really "unit". Tend to extract smaller components, hooks and functions for testing specific logic instead of testing a big one.

1. Use `shallowRender` if you need to test component that includes many nested children. So changes in child components shouldn't affect your unit test.

1. If you need to test complicated scenario, prefer e2e over unit tests.

## Styles

1. Avoid using nested tags or ids for styling. However, you can use nested tags for svg styles or external libraries components.

   ```
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

   ```
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

   ```
   // bad
   <MyFancySelect
     options=[
       { value: 'a', type: 'with-counter', counter: 5, title: 'Foo' },
       { type: 'divider' },
       { value: 'b, type: 'simple', title: 'Bar' },
     ]
   />

   // good
   <MyFancySelect>
     <OptionWithCounter value='a' counter={5}>Foo</OptionWithCounter>
     <Divider />
     <Option value='a'>Bar</Option>
   </MyFancySelect>
   ```

## Redux

1. Group entities by domain, not by components.

   ```
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

   ```
   // bad
   type State = {
     selectedDocument: Document,
     documentsById: DocumentsById,
   };

   // good
   type State = {
     selectedDocumentId: Document['id'],
     documentsById: DocumentsById,
   };
   ```

1. Do not mix different data formats into one store field since it's impossible to say if we have specific entity fields loaded.

   ```
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

   ```
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

1. Prefer absolute imports where it's possible. But it's reasonable to use relative imports for files from current or parent directory, they can be considered as module and imported files aren't imported outside.

   ```
   // good
   import { DocumentPreview } from 'components/documents/DocumentPreview';
   import { MyBlock } from './MyComponent.styled.ts';
   ```

1. Report unexpected errors to bugsnag. Pay attention to your try/catch blocks:

   ```
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
