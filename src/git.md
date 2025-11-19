# Git Conventions

This document defines our conventions for **commits**, **comments**, **branch names**, and **pull requests (PRs)**.

The goal is to keep our repositories **consistent, searchable, and traceable** to corresponding **Jira tickets**.

> [!NOTE]
> This document was drafted with the help of AI, but the convention and format come from human ingenuity.

## Issue types

We use these labels to mark branches, commits and PRs:

| Type             | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| **feat/feature** | A new feature                                                                  |
| **fix**          | A bug fix                                                                      |
| **chore**        | Maintenance or non-functional change (e.g., dependencies, build)               |
| **docs**         | Documentation updates                                                          |
| **refactor**     | Code refactor without behavior change                                          |
| **test**         | Adding or updating tests                                                       |
| **perf**         | Performance-related improvement                                                |
| **infra**        | CI/CD configuration or script change                                           |
| **task**         | working on a task (just support to link it with jira tasks - similar to chore) |

## Branches

We use the following pattern for branches (based on Jira fields):

```
<issue-type>/<issue-number>/<short-description>
```

Examples:

```
fix/PAY-99/airwallex-transactions-showing-null
feat/APP-226/invoice-creation-endpoint
chore/CORE-10/update-readme
```

- `issue-type` **must** match one of the above

- `issue-number` **should** be the Jira ticket ID

  - You **may** omit it if you don’t have a ticket yet, but better create one first. It can be just a placeholder (short summary, no body) – you can always change it later.

- `short-description` **should** use `kebab-case` (lowercase, dash-separated)

- Branch name **should** be under 50 characters

  - For frontend repos specifically, **the deployment will fail** if the branch name is longer, as the preview domain is generated from the branch name (any part of the domain [can’t be longer than 63 characters](https://www.rfc-editor.org/rfc/rfc1035#:~:text=length%2E-,Labels,less%2E), and we add suffixes sometimes).

- Use forward slash to separate the different parts of the branch name and make it more readable

## Commit Messages

We follow a modified [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/#summary) style:

```
<type>(<scope>): <short description> [<optional Jira ticket>]

<optional body and footer(s)>
```

Examples:

```
fix(invoice): include companyId in invoice URLs
feat(integrations): add webhook validation for Airwallex integration
chore: update dependencies and lint rules
```

Type is the issue type [defined above](#issue-types).

A scope **may** be provided after the type. Scope **must** consist of a noun describing a section of the codebase surrounded by parenthesis, e.g.: `fix(parser): <description>`

You **may** include a Jira Ticket ID in your commits:

```
feat(integrations): add webhook validation for Airwallex integration [PAY-99]
```

> [!TIP]
> Don’t stress too much about commits – they’ll be squashed when the PR is merged.

### Body and footers

Body can be used if the commit needs more context. Use it sparingly.

### ⚙️ Notes

- Multiple Jira IDs can be comma-separated (no space after commas).
- The description should be **short**, **imperative**, and **lowercase**.
  - **Good:** <code><b>add</b> webhook validation for Airwallex integration</code>
  - **Bad:** <code><b>added</b> webhook validation for Airwallex integration</code>
- Avoid ending the line with a period.

## Pull Requests

PR titles follow the same basic principles as the commit messages, since they will be used as a squashed commit message when merged.

PR titles **must** include relevant Jira IDs:

```
<type>(<scope>): <short description> [<JIRA-ID>,...]
```

Examples:

```
fix(integrations): Airwallex transactions showing null [PAY-99]
feat: support companyId in invoice URLs [APP-226,PAY-67]
chore: update documentation and dependencies [CORE-10]
```

### Description

Use the PR description to:

- Summarize the change
- Reference related Jira tickets
- Add screenshots or API examples if applicable

### Merging PRs

When merging, only leave the PR title as the commit message. If there is any important context, you can copy it over from PR description, but make sure it looks good as plaintext (there’s no Markdown in commit messages).

> [!NOTE]
> In your repo settings, make sure to set the **Default commit message** for squash merging in your repository to **Pull request title only**.

### PR reviews

Read https://conventionalcomments.org/

## Summary cheat sheet

| Context                | Format                                                                                             | Example                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Commit**             | `<type>(scope[,scope...]): <desc>`<br /><br />`<[optional body]`<br /><br />`[optional footer(s)]` | `fix(integrations): Airwallex transactions showing null`                                                                                                                    |
| **Branch**             | `<type>/<JIRA-ID>/<desc>`                                                                          | `fix/PAY-99/airwallex-transactions-showing-null`                                                                                                                            |
| **PR Title**           | `<type>(scope[,scope...]): <desc> [<JIRA-ID>,...]`                                                 | `fix: Airwallex transactions showing null [PAY-99]`                                                                                                                         |
| **PR review comments** | `<label> [decorations]: <subject> [discussion]`                                                    | **suggestion:** Let’s avoid using this specific function…If we reference much of a function marked “Deprecated”, it is almost certain to disagree with us, sooner or later. |

## Why this matters

Following these conventions helps us:

- **Trace changes** back to Jira issues easily
- **Automate changelog generation** and release notes
- **Keep branches organized** and searchable
- **Ensure clear PR history** for reviews and audits
