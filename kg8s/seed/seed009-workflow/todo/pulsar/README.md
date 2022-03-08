- [Set up a standalone Pulsar in Docker · Apache Pulsar](https://pulsar.apache.org/docs/en/standalone-docker/)
- [apache/pulsar-manager: Apache Pulsar Manager](https://github.com/apache/pulsar-manager)
- http://127.0.0.1:9527/

```
git clone https://github.com/apache/pulsar-manager.git
cd pulsar-manager
docker-compose up
CSRF_TOKEN=$(curl http://localhost:7750/pulsar-manager/csrf-token)
curl \
    -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
    -H "Cookie: XSRF-TOKEN=$CSRF_TOKEN;" \
    -H 'Content-Type: application/json' \
    -X PUT http://localhost:7750/pulsar-manager/users/superuser \
    -d '{"name": "admin", "password": "apachepulsar", "description": "test", "email": "username@test.org"}'
```