# Backend Development Principles

## Best Practices Checklist

### Main

| Service / Feature | TS 4.4 | relative imports | typed models |
| ----------------- | ------ | ---------------- | ------------ |
| alfred            | 🍏     | 🍏               | 🍏           |
| analytix          | 🍅     | 🍏               | 🍅           |
| auditor           | 🍅     | 🍏               | 🍅           |
| billy             | 🍏     | 🍏               | 🍏           |
| bouncer           | 🍅     | 🍏               | ❓           |
| core              | 🍅     | 🍅               | 🍅           |
| dealer            | 🍏     | 🍏               | 🍏           |
| enrique           | 🍅     | 🍏               | ❓           |
| flexflow          | 🍅     | 🍅               | ❓           |
| hermes            | ❓     | ❓               | ❓           |
| hero              | 🍏     | 🍏               | ❓           |
| invoker           | 🍏     | 🍏               | 🍏           |
| jamal             | 🍅     | 🍏               | 🍏           |
| lilith            | 🐍     | 🐍               | 🐍           |
| nano              | ❓     | ❓               | ❓           |
| pablo             | 🍏     | 🍏               | 🍏           |
| payot             | 🍏     | 🍏               | 🍏           |
| pechkin           | 🍅     | 🍏               | ❓           |
| roberto           | ❓     | ❓               | ❓           |
| scrooge           | 🍅     | 🍏               | ❓           |
| shiva             | 🍏     | 🍏               | 🍏           |
| skyler            | 🍏     | 🍏               | 🍏           |
| tigerdocs         | 🍅     | 🍅               | ❓           |

### Toolkit

| Service / Feature | wrappers | logger | ACL | lambda | eventBus | migrate | retry DLQ | sentry | telemetry | ssmWrapper | sns-via-sqs |
| ----------------- | -------- | ------ | --- | ------ | -------- | ------- | --------- | ------ | --------- | ---------- | ----------- |
| alfred            | 🍏       | 🍏     | 🍏  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     | 🍏        | 🍏         | 🍅          |
| analytix          | ❓       | ❓     | ❓  | ❓     | ❓       | 🍅      | ❓        | ❓     | ❓        | 🍏         | ❓          |
| auditor           | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     | ❓        | 🍏         | ❓          |
| billy             | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     | ❓        | 🍏         | 🍅          |
| bouncer           | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     | ❓        | 🍏         | ❓          |
| core              | 🍅       | ❓     | ❓  | ❓     | 🍏       | ❓      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| dealer            | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        | 🍅     | ❓        | 🍏         | 🍅          |
| enrique           | ❓       | ❓     | 🍏  | 🍏     | 🍏       | 🍏      | 🍅        | ❓     | 🍏        | 🍏         | 🍅          |
| flexflow          | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     | ❓        | 🍅         | ❓          |
| hermes            | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     | ❓        | 🍏         | 🍏          |
| hero              | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| invoker           | 🍏       | 🍏     | 🍏  | 🍏     | ❓       | ❓      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| jamal             | 🍅       | 🍏     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| nano              | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | 🍅        | ❓     | ❓        | 🍏         | ❓          |
| pablo             | 🍏       | 🍏     | 🍅  | 🍅     | 🍏       | 🍏      | 🍏        | 🍏     | 🍏        | 🍏         | 🍅          |
| payot             | 🍏       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍏        | 🍏     | ❓        | 🍏         | 🍅          |
| pechkin           | 🍅       | 🍏     | 🍅  | 🍏     | 🍏       | 🍏      | 🍅        | 🍅     | 🍏        | 🍏         | ❓          |
| roberto           | 🍅       | ❓     | ❓  | ❓     | 🍏       | ❓      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| scrooge           | ❓       | ❓     | ❓  | ❓     | ❓       | 🍏      | ❓        | ❓     | ❓        | 🍏         | 🍅          |
| shiva             | 🍏       | 🍏     | 🍏  | 🍏     | 🍏       | 🍏      | 🍏        | ❓     | ❓        | 🍏         | 🍅          |
| skyler            | 🍏       | 🍏     | 🍏  | 🍏     | 🍏       | ❓      | 🍏        | 🍏     | ❓        | 🍏         | ❓          |
| tigerdocs         | ❓       | ❓     | ❓  | ❓     | ❓       | ❓      | ❓        | ❓     | ❓        | 🍅         | ❓          |

[ssmWrapper](https://www.notion.so/osome/SSM-Wrapper-56823b69e1104d608a1ed876b94bbdfd)

### Static checks

| Service / Feature | eslint config | depcheck | unused-exports | type-check | type-coverage | build | separate steps in CI | editorconfig | spell check |
| ----------------- | ------------- | -------- | -------------- | ---------- | ------------- | ----- | -------------------- | ------------ | ----------- |
| alfred            | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| analytix          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| auditor           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| billy             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| bouncer           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| core              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | 🍏                   | 🍏           | ❓          |
| dealer            | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| enrique           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| flexflow          | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| hermes            | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | ❓           | ❓          |
| hero              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| invoker           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| jamal             | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| nano              | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| pablo             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| payot             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| pechkin           | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| roberto           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | 🍏                   | 🍏           | ❓          |
| scrooge           | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |
| shiva             | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| skyler            | 🍏            | 🍏       | 🍏             | 🍏         | 🍏            | 🍏    | 🍏                   | 🍏           | 🍏          |
| tigerdocs         | ❓            | ❓       | ❓             | ❓         | ❓            | ❓    | ❓                   | 🍏           | ❓          |

### Tests

| Service / Feature | jest | no sinon | global check for pending nocks | disabled network | anti flaky |
| ----------------- | ---- | -------- | ------------------------------ | ---------------- | ---------- |
| alfred            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| analytix          | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| auditor           | 🍏   | ❓       | ❓                             | ❓               | 🍅         |
| billy             | 🍏   | 🍅       | 🍏                             | 🍏               | 🍅         |
| bouncer           | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| core              | 🍅   | 🍅       | ❓                             | ❓               | 🍅         |
| dealer            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| enrique           | 🍏   | 🍏       | ❓                             | ❓               | 🍅         |
| flexflow          | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| hermes            | ❓   | ❓       | ❓                             | ❓               | ❓         |
| hero              | 🍅   | ❓       | ❓                             | ❓               | 🍅         |
| invoker           | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| jamal             | 🍏   | 🍅       | 🍅                             | 🍏               | 🍅         |
| nano              | ❓   | ❓       | ❓                             | ❓               | ❓         |
| pablo             | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| payot             | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| pechkin           | 🍏   | 🍅       | 🍅                             | 🍏               | 🍏         |
| roberto           | 🍅   | 🍅       | ❓                             | ❓               | 🍅         |
| scrooge           | 🍏   | ❓       | ❓                             | ❓               | 🍅         |
| shiva             | 🍏   | 🍏       | ❓                             | ❓               | 🍅         |
| skyler            | 🍏   | 🍏       | 🍏                             | 🍏               | 🍅         |
| tigerdocs         | 🍅   | ❓       | ❓                             | ❓               | 🍅         |

### Infrastructure

| Service / Feature | own database instance | LTS Node | TS SLS config | SLS separate handlers | canary |
| ----------------- | --------------------- | -------- | ------------- | --------------------- | ------ |
| alfred            | 🍏                    | 🍏       | 🍏            | 🍏                    | 🍏     |
| analytix          | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| auditor           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| billy             | 🍏                    | 🍅       | 🍏            | ❓                    | 🍏     |
| bouncer           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| core              | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |
| dealer            | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| enrique           | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| flexflow          | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |
| hermes            | ❓                    | 🍅       | ❓            | ❓                    | ❓     |
| hero              | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| invoker           | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| jamal             | 🍏                    | 🍅       | 🍏            | 🍅                    | 🍏     |
| nano              | ❓                    | ❓       | ❓            | ❓                    | ❓     |
| pablo             | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| payot             | 🍏                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| pechkin           | 🍏                    | 🍅       | 🍏            | 🍅                    | 🍏     |
| roberto           | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |
| scrooge           | ❓                    | 🍅       | 🍏            | ❓                    | 🍏     |
| shiva             | 🍏                    | 🍏       | 🍏            | 🍏                    | 🍏     |
| skyler            | 🍅                    | 🍅       | 🍏            | 🍏                    | 🍏     |
| tigerdocs         | ❓                    | 🍅       | ❓            | ❓                    | 🍅     |

### Other

| Service / Feature | no parameter store SDK | standard CODEOWNERS | dependabot with auto-merge | migration check | diff check |
| ----------------- | ---------------------- | ------------------- | -------------------------- | --------------- | ---------- |
| alfred            | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| analytix          | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| auditor           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| billy             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| bouncer           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| core              | ❓                     | 🍅                  | 🍅                         | ❓              | ❓         |
| dealer            | 🍏                     | 🍏                  | 🍏                         | ❓              | 🍏         |
| enrique           | 🍏                     | 🍏                  | 🍏                         | ❓              | ❓         |
| flexflow          | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| hermes            | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| hero              | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| invoker           | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| jamal             | 🍏                     | ❓                  | ❓                         | ❓              | ❓         |
| nano              | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| pablo             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| payot             | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| pechkin           | 🍏                     | 🍏                  | 🍅                         | 🍅              | 🍅         |
| roberto           | ❓                     | 🍅                  | 🍅                         | ❓              | ❓         |
| scrooge           | ❓                     | ❓                  | ❓                         | ❓              | ❓         |
| shiva             | 🍏                     | 🍏                  | 🍏                         | 🍏              | ❓         |
| skyler            | 🍏                     | 🍏                  | 🍏                         | 🍏              | 🍏         |
| tigerdocs         | ❓                     | ❓                  | ❓                         | ❓              | ❓         |

### Environments

| Service / Feature | Production | Stage | T1  | T2  | T3  | T4  | T5  | T6  | T7  | T8  | T9  |
| ----------------- | ---------- | ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| alfred            | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | ❓  | ❓  | ❓  |
| analytix          | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| auditor           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| billy             | 🍏         | 🍏    | 🍏  | 🍏  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  |
| bouncer           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| core              | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| dealer            | 🍏         | 🍏    | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  | 🍅  |
| enrique           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| flexflow          | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| hermes            | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| hero              | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| invoker           | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| jamal             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| nano              | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| pablo             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| payot             | 🍏         | 🍏    | 🍏  | 🍏  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| pechkin           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| roberto           | 🍏         | ❓    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| scrooge           | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| shiva             | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
| skyler            | 🍏         | 🍏    | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  | 🍏  |
| tigerdocs         | 🍏         | 🍏    | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  | ❓  |
