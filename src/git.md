# Git Conventions

Notion doc: https://www.notion.so/osome/Git-Conventions-29394fd5a8ec80bcb367d7253e6d8851

This document defines our conventions for **commits**, **comments**, **branch names**, and **pull requests (PRs)**.

The goal is to keep our repositories **consistent, searchable, and traceable** to corresponding **Jira tickets**.

---

<aside>
💡

> _(This document was drafted with the help of AI, but the convention and format come from human ingenuity.)_

</aside>

## 🧱 Commit Message Format

We follow a modified [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/#summary) style that includes one or more **Jira Ticket IDs**.

### ✅ Format

```
<type>(scope): <short description>

[optional body]

[optional footer(s)]

```

### 💡 Examples

```
fix(invoice): invoice URLs with companyId
feat(integrations): add webhook validation for Airwallex integration
chore: update dependencies and lint rules

```

### 🧩 Types

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

### Scope

1. A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., `fix(parser):`

### ⚙️ Notes

- Multiple Jira IDs can be comma-separated (no space after commas).
- The description should be **short**, **imperative**, and **lowercase**.
- Avoid ending the line with a period.

---

## 🌿 Branch Naming Convention

We use the following pattern for branches (based on Jira fields):

```
<issue-type>/<issue-number>/<short-description>

```

### 💡 Examples

```
fix/PAY-99/airwallex-transactions-showing-null
feat/APP-226/invoice-creation-endpoint
chore/CORE-10/update-readme

```

### ⚙️ Rules

- **issue-type** must match one of: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`,`task`.
- **issue-number** should be the Jira ticket ID.
- **short-description** should use **kebab-case** (lowercase, dash-separated).
- Keep it under **60 characters** if possible.
- forward slash to separate the different parts of the branch name and make it more readable

---

## 🔀 Pull Request Naming Convention

<aside>
💡

PR titles should include relevant Jira IDs.
Make sure to also set the Default commit message for squash merging in your repository to **“Pull request title and description”**

</aside>

### ✅ Format

```
[<JIRA-ID>,...] <type>(scope): <short description>

```

### 💡 Examples

```
[PAY-99] fix(integrations): Airwallex transactions showing null
[APP-226,PAY-67] feat: support companyId in invoice URLs
[CORE-10] chore: update documentation and dependencies

```

### ⚙️ Guidelines

- Use the PR description to:
  - Summarize the change
  - Reference related Jira tickets
  - Add screenshots or API samples if applicable

## Github PR review comments standard:

Read https://conventionalcomments.org/

---

## 🧾 Summary Cheat Sheet

| Context                | Format                                                                                             | Example                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Commit**             | `<type>(scope[,scope...]): <desc>`<br /><br />`<[optional body]`<br /><br />`[optional footer(s)]` | `fix(integrations): Airwallex transactions showing null`                                                                                                                    |
| **Branch**             | `<type>/<JIRA-ID>/<desc>`                                                                          | `fix/PAY-99/airwallex-transactions-showing-null`                                                                                                                            |
| **PR Title**           | `[<JIRA-ID>,...] <type>(scope[,scope...]): <desc>`                                                 | `[PAY-99] fix: Airwallex transactions showing null`                                                                                                                         |
| **PR review comments** | `<label> [decorations]: <subject> [discussion]`                                                    | **suggestion:** Let’s avoid using this specific function…If we reference much of a function marked “Deprecated”, it is almost certain to disagree with us, sooner or later. |

---

## 🔍 Why This Matters

Following these conventions helps us:

- **Trace changes** back to Jira issues easily
- **Automate changelog generation** and release notes
- **Keep branches organized** and searchable
- **Ensure clear PR history** for reviews and audits

---
