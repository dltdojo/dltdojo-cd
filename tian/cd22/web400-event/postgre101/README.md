# TODOs

- Event Sourcing with Examples in Node.js - RisingStack Engineering https://blog.risingstack.com/event-sourcing-with-examples-node-js-at-scale/
- Implementing event sourcing using a relational database https://softwaremill.com/implementing-event-sourcing-using-a-relational-database/
- Event Sourcing Pattern | Microsoft Learn https://learn.microsoft.com/en-us/previous-versions/msp-n-p/dn589792(v=pandp.10)
- Command and Query Responsibility Segregation (CQRS) Pattern | Microsoft Learn https://learn.microsoft.com/en-us/previous-versions/msp-n-p/dn568103(v=pandp.10)
- tobyhede/postgresql-event-sourcing: postgresql event sourcing https://github.com/tobyhede/postgresql-event-sourcing
- message-db/message-db: Microservice native message and event store for Postgres https://github.com/message-db/message-db


```sh
docker compose -f - up --force-recreate --remove-orphans <<\EOF
version: "3.8"
services:
  pg101:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: root
      POSTGRES_DB: test_db
    ports:
      - "5432:5432"
  adminer:
    depends_on:
      - pg101
    image: adminer:4.8.1
    restart: always
    ports:
      - 8091:8080
EOF
```