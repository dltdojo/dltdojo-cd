# testing

```sh
$ docker compose build
$ docker compose up -d
$ docker compose logs
# http://localhost:8300/app.html
$ docker compose exec mytest bash

# Exposing a local webserver via a public domain name, with automatic HTTPS
# No installation, no signup
# ssh -R 80:localhost:3000 serveo.net
# 
# https://xxxxxxxxxxxxxxx.serveo.net/app.html
# 
```