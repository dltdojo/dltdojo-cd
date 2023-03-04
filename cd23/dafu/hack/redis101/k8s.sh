#
# kind create cluster
#
kubectl create deployment redis101 --image=redis:7-alpine
kubectl expose deployment redis101 --port=6379 --target-port=6379

echo "===> redis-cli"
kubectl run -i --rm debug-1000 --image='redis:7-alpine' -- sh <<'EOF'
sleep 10
redis-cli -h redis101.default.svc.cluster.local SET mykey "Hello World"
redis-cli -h redis101.default.svc.cluster.local GET mykey
EOF

echo "===> deno npm:redis@4.6.5"
kubectl run -i --rm debug-1001 --image='denoland/deno:1.31.1' -- run -A - <<'EOF'
import { createClient } from "npm:redis@4.6.5";
// make a connection to the local instance of redis
const client = createClient({
    url: "redis://redis101.default.svc.cluster.local:6379",
});
await client.connect();
await client.set('foo101', 'hello world foo101');
const cached_foo101 = await client.get('foo101');
console.log(cached_foo101)
client.disconnect()
EOF

echo "===> deno redis"
kubectl run -i --rm debug-1002 --image='denoland/deno:1.31.1' -- run -A - <<'EOF'
import { connect } from "https://deno.land/x/redis/mod.ts";
const redis = await connect({
  hostname: "redis101.default.svc.cluster.local",
  port: 6379,
});
const ok = await redis.set("foo201", "hello world foo201");
const foo201 = await redis.get("foo201");
console.log(foo201)
EOF

sleep 5
kubectl delete deployment redis101
kubectl delete service redis101