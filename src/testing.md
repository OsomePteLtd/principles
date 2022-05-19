# General Testing Principles

Related articles:

- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Static vs Unit vs Integration vs E2E Testing for Frontend Apps](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)
- [Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)
- [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-testing-mistakes)
- [UI Testing Myths](https://kentcdodds.com/blog/ui-testing-myths)
- [The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)
- [Why you've been bad about testing](https://kentcdodds.com/blog/why-youve-been-bad-about-testing)

## Strategy

Our testing approach is not a ▲ "testing pyramid" but a 🏆 "testing trophy". That means:

1.  integration tests must be the majority
1.  unit tests can be used if needed only for the corner cases of the scenarios covered by integration tests
1.  E2E tests are considered as smoke tests
1.  Static programming language helps to avoid too many tests for every corner case

![The Testing Trophy](https://pbs.twimg.com/media/DVUoM94VQAAzuws?format=jpg&name=900x900)

Examples of good E2E test candidates:

- sign up / log in
- payment
- core features like "create ticket", "send messages"
- micro frontends smoke tests

## Process

1. E2E tests can be added after the feature has been released
1. Anybody can skip a failing in the `main` branch test because it's very important that the tests make life easier, not harder.

## Set Up and Tear Down

1. There is no need to implement tear-down blocks or delete anywhere entities created in the tests.

## UI testing

1. The Page Object pattern should be avoided due to loss of simplicity. There are some goals to use them, but they can be achieved easier:

   - DRY very common steps like "log in". The signed-in state can be saved using the built-in features of the testing tool. For example, playwrite supports [storageState](https://playwright.dev/docs/test-auth#reuse-signed-in-state).
   - DRY common steps for some pages. It can be a sign of too many small tests instead of [fewer longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests).
   - hide complex selectors from the tests. Often, page objects extract nested selectors with css classes because they are too complex to repeat them. But, it's better to use selectors as a user sees them, e.g. select by text, input label, or placeholder. This makes the tests more [resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change). Read more in the _Playwright selectors_ chapter.

   See also: [Kent C. Dodds's Q&A session script](https://frontendmasters.com/courses/testing-practices-principles/additional-resources-and-q-a/)

## Playwright selectors

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
