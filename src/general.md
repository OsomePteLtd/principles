# General Development Principles

    “I read a study that measured the efficiency of locomotion for various species on the planet.
    The condor used the least energy to move a kilometer. And, humans came in with a rather unimpressive showing,
    about a third of the way down the list. It was not too proud a showing for the crown of creation. So, that
    didn’t look so good. But, then somebody at Scientific American had the insight to test the efficiency of
    locomotion for a man on a bicycle. And, a man on a bicycle, a human on a bicycle, blew the condor away,
    completely off the top of the charts. And that’s what a computer is to me.” - Steve Jobs

We believe it describes very precisely what we’re doing here: we’re creating an accounting / corpsec bicycle 🚲.

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

1. How to use auto-merge:

   ```
   // bad

   Create a pull request, enable auto-merge.

   // good

   Create a pull request, get all required approves.
   ```

   If there is a small change like a typo fix or rename, push a fix and enable auto-merge.

   Why? We have a practice that the reviewer adds minor comments and approves the pull request. In this case, you will not have a chance to fix them before merging.

## Branches

Now we are working in different countries (`branch` attribute) and it is important to understand that we have no concept of "default branch" in any scenarios. A branch always and everywhere must be explicitly received, since all countries are equal and there is no fallback, for example, to Singapore, if a person has a company in the UK.

## English

The primary language for development is American English. We use it because, de facto, it's the standard language in programming.

In the UI, the language should be local. For the UK, Singapore, and HK, it's British English.

## Clean Code

1. Do not use abbreviations for names (variables, functions, etc). Exceptions are `map` / `reduce`. For such case use 1 letter abbreviations.

   ```typescript
   // bad

   const docs = Document.findAll();

   // good

   const documents = Document.findAll();

   // ok

   const documentIds = documents.map((d) => d.id);
   ```

1. Plural for compound names:

   ```
   // bad

   documentsIds, documentsId

   // good

   documentIds
   ```

1. Pattern "Loop + Function". If you have more then 1 line of code inside a loop, it is a sign that you need to extract a function.

   ```typescript
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

1. An anonymous flag in arguments list is unacceptable

   ```typescript
   // bad
   function createUser(attributes, auditLogs: boolean) { ... }
   createUser({ ... }, true) // what is true here?

   // good
   function createUser(attributes, { auditLogs }: { auditLogs: boolean })
   ```

## Tests

1. Do not use `?` in tests, use `!`.

   ```typescript
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

## Comments

1. Use comments to add context or information that is not obvious from the code already. Don't use comments to explain the code itself - code (through proper naming) should be self-explanatory.

1. Use TODO prefix in comments to track and document technical debt - things that are worth doing, but not done yet.

1. It's considered a bad practice to comment out raw code. Commented code causes ["broken windows"](https://blog.codinghorror.com/pragmatic-programming/), increases cognitve load on developers, lacks support (commented code almost always doesn't work) and lacks test coverage. For detailed explanation, see [link 1](https://www.markhneedham.com/blog/2009/01/17/the-danger-of-commenting-out-code/), [link 2](https://kentcdodds.com/blog/please-dont-commit-commented-out-code)
