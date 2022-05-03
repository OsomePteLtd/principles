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
