# General Development Principles

## Pull Requests

1. Make you pull requests focused. Ideally, a pull request should do 1 thing and have a simple name.

2. Avoid large pull requests because they are hard to review. Try to split your tasks into small steps.

## Code Review

TODO

## Branches

Now we are working in different countries (`branch` attribute) and it is important to understand that we have no concept of "default branch" in any scenarios. A branch always and everywhere must be explicitly received, since all countries are equal and there is no fallback, for example, to Singapore, if a person has a company in the UK.

## Clean Code

1. Do not use abbreviations for names (variables, functions, etc). Exceptions are `map` / `reduce`. For such case use 1 letter abbreviations.

   ```
   // bad

   const docs = Document.findAll();

   // good

   const documents = Document.findAll();

   // ok

   const documentIds = documents.map(d => d.id);
   ```

2. Pattern "Loop + Function". If you have more then 1 line of code inside a loop, it is a sign that you need to extract a function.

   ```
   // bad

   for (const plaidAccount of plaidAccounts) {
     if (plaidAccount.balances.iso_currency_code) {
       const existedAccount = await Account.findOne(...);
       // ...
     }
   }

   // good

   for (const plaidAccount of plaidAccounts) {
     await syncAccount(plaidAccount);
   }

   async function syncAccount(plaidAccount) {
     if (!plaidAccount.balances.iso_currency_code) {
       return;
     }
     const existedAccount = await Account.findOne(...);
     // ...
   }
   ```

## Tests

1. Do not use `?` in tests, use `!`.

   ```
   // bad

   expect(journal.journalEntries?.map((je) => je.toJSON())).toMatchObject([
     {
       debitAccountId: templateDebitAccount.id,
       creditAccountId: lineItemAccount.id,
     },
   ]);

   // good

   expect(journal.journalEntries!.map((je) => je.toJSON())).toMatchObject([
     {
       debitAccountId: templateDebitAccount.id,
       creditAccountId: lineItemAccount.id,
     },
   ]);
   ```
