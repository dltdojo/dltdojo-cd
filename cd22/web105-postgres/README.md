# PostgreSQL

- https://www.postgresql.org/

# 101 🐘 postgres and http web admin

- [postgres - Official Image | Docker Hub](https://hub.docker.com/_/postgres)
- [Adminer - Database management in a single PHP file](https://www.adminer.org/)
- [adminer - Official Image | Docker Hub](https://hub.docker.com/_/adminer)
- http://localhost:8091/?pgsql=pg101&username=admin&db=test_db&ns=public


```sh
docker compose -f docker-compose.101.yaml up
```

# 102 🏈 javascript client

- [denodrivers/postgres](https://github.com/denodrivers/postgres)
- http://localhost:8091/?pgsql=pg102&username=admin102&db=test_db&ns=public

```sh
docker compose -f docker-compose.102.yaml up
```

# WIP 301 🐐 supabase

[supabase/supabase: The open source Firebase alternative. Follow to stay updated about our public Beta.](https://github.com/supabase/supabase)

supabase 執行起來。

- [Self-hosting with Docker | Supabase](https://supabase.com/docs/guides/resources/self-hosting/docker)
- 內有超1G的巨型鏡像 supabase/studio 
- http://localhost:3000/

```sh
docker compose -f docker-compose.301.yaml --env-file d301.env up
```
