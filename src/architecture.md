# Architecture Principles

## Microservices / frontends

General rules to decide if we need one more microservice/frontend:

_Pros_

1. it will have one and only one team as the owner
1. it has few connections with another service (<10% of the incoming or outgoing communications are external API calls, the rest is direct function calls inside the service's runtime)
1. the existing service can not fit the technical restrictions (e.g., too many resources in CloudFormation)
1. the current service already has more than 25 models

_Cons_

1. we split one service into several smaller ones, which will still belong to the same team
1. we don't clearly understand the scope of the service
