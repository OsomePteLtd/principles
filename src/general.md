# General Development Principles

## Pull Requests

1. Make your pull requests focused:

   - A pull request should do 1 thing and have a simple title.

   - Avoid mixing in a single pull request with a product feature something subjective like changing a linter config. A reviewer may agree with the main code, but a dispute about the linter config will start, and as a result, everything drags on. Make minor changes in a separate PR and make the discussion on different parts parallel.

1. Avoid large pull requests:

   - Large pull requests are hard to review, try to split your tasks into small steps.

   - Minimize the diff, avoid reformatting of code that is irrelevant to your pull request.

1. Provide context for reviewers:

   - Choose a good title for your pull request.

   - Provide a link to Jira and a short description of what your pull request should do.

   - Add comments to all lines of code that could potentially raise questions from reviewers (via GitHub comments, not in code).

1. Make your pull request initially good:

   - For example, if you will not add tests, then the first comment will be about tests, avoid unnecessary rounds of reviews.

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

1. Plural for compound names:

   ```
   // bad

   documentsIds, documentsId

   // good

   documentIds
   ```

1. Pattern "Loop + Function". If you have more then 1 line of code inside a loop, it is a sign that you need to extract a function.

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
