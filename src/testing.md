# General Testing Principles

Related articles:

- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)
- [The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)

## Strategy

Our testing approach is not a ▲ "testing pyramid" but a 🏆 "testing trophy". That means:

1.  integration tests must be the majority
1.  unit tests can be used if needed only for the corner cases of the scenarios covered by integration tests
1.  E2E tests are considered as smoke tests
1.  Static programming language helps to avoid too many tests for every corner case

![The Testing Trophy](https://pbs.twimg.com/media/DVUoM94VQAAzuws?format=jpg&name=900x900)

Related articles:

- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)

Examples of good E2E test candidates:

- sign up / log in
- payment
- core features like "create ticket", "send messages"
- micro frontends smoke tests

## Process

1. E2E tests can be added after the feature has been released
1. Anybody can skip a failing in the `main` branch test because it's very important that the tests make life easier, not harder.

## General

1. Do not seed common data, set nocks, or perform other business-logic preparations for multiple tests in `beforeEach`, keep you tests isolated. More info from [thoughtbot](https://thoughtbot.com/blog/lets-not) and [kentcdodds](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing).

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

## Set Up and Tear Down

1. There is no need to implement tear-down blocks or delete anywhere entities created in the tests.

## UI testing

1. The Page Object pattern should be avoided due to loss of simplicity. There are some goals to use them, but they can be achieved easier:

   - DRY very common steps like "log in". The signed-in state can be saved using the built-in features of the testing tool. For example, playwright supports [storageState](https://playwright.dev/docs/test-auth#reuse-signed-in-state).
   - DRY common steps for some pages. It can be a sign of too many small tests instead of [fewer longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests).
   - hide complex selectors from the tests. Often, page objects extract nested selectors with css classes because they are too complex to repeat them. But, it's better to use selectors as a user sees them, e.g. select by text, input label, or placeholder. This makes the tests more [resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change). Read more in the _Playwright selectors_ chapter.

   Related articles: [UI Testing Myths](https://kentcdodds.com/blog/ui-testing-myths) and [Kent C. Dodds's Q&A session script](https://frontendmasters.com/courses/testing-practices-principles/additional-resources-and-q-a/)

1. Write fewer, longer tests instead of the anti-pattern approach of "one assertion per test".

   > Think of a test case workflow for a manual tester and try to make each of your test cases include all parts to that workflow. This often results in multiple actions and assertions which is fine.

   > There's the old "Arrange" "Act" "Assert" model for structuring tests. I typically suggest that you have a single "Arrange" per test, and as many "Act" and "Asserts" as necessary for the workflow you're trying to get confidence about.

   Kent C. Dodds, [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)

## E2E

1. Do not run repeatable steps like authentication in every test. Modern tools like playwright support sharing authenticated state, which should be used instead. This way, the tests become faster and less brittle.

   Related articles: [UI Testing Myths](https://kentcdodds.com/blog/ui-testing-myths)

1. Call backend API directly if it's unpractical to set up initial data via UI.

## Playwright selectors

Based on the [best practices](https://playwright.dev/docs/selectors#best-practices) from playwright.

1. Tend to avoid any complex selectors to increase the resilience of tests.

bad ❌

```
await page.locator('#tsf > div:nth-child(2) > div > div.a4bIc > input').click();
await page.locator('//*[@id="tsf"]/div[2]/div[1]/div[1]/div/div[2]/input').click();
```

2. Prefer to use text selectors as much as possible.

good ✅

```
await page.locator('text="Login"').click();
await page.locator('"Login"').click();
await page.locator('h1', { hasText: /Tickets$/ });
await page.locator('h5:text("My tasks")');
```

3. For input prefer to use a placeholder, name, or id attribute.

good ✅

```
await page.locator('[placeholder="Search GitHub"]').fill('query');
await page.fill('input[name="dueAtDate"]', date);
await page.fill('input[id="dueAtDate"]', date);
```

4. Prefer to use `aria` attributes for elements without text, for example, for icon buttons.

good ✅

```
await page.click('[aria-label="clear"]');
```

5. Prefer to use `aria` attributes for text elements if there are several elements on the page with the same text.

good ✅

```
page.locator(`[aria-label="ticket-assignee"]:text("Test")`)
```

1. Avoid using test `data` attributes as much as possible. Use it only if you can not use the selectors described above. But if you have to use `data` attributes, please, use `data-testid` attribute.

bad ❌

```
page.locator(`[data-testid="ticket-name"] :text("Ticket name")`)
```
