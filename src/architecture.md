# Architecture Principles

## Microservices / frontends

General rules to decide if we need one more microservice/frontend:

_Pros_

1. it will have one and only one team as the owner
1. it has few connections with another service (<10% of the incoming or outgoing communications are external)
1. the existing service can not fit the technical restrictions

_Cons_

1. we split one service into several smaller ones, which will still belong to the same team
1. we don't clearly understand the scope of the service
