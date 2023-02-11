# cdk8s

# 101

- Add support to Deno · Issue #481 · cdk8s-team/cdk8s-core https://github.com/cdk8s-team/cdk8s-core/issues/481


```sh
# deno run -A - <<'EOF' | kubectl apply -f -
docker run -i --entrypoint sh docker.io/denoland/deno:1.30.3 <<\EOF
deno run -A - <<\EOOF
import * as kplus from 'npm:cdk8s-plus-25'
import * as cdk8s from 'npm:cdk8s'
const app = new cdk8s.App()
const chart = new cdk8s.Chart(app, 'ch101')
const deploy203 = new kplus.Deployment(chart, 'd203', {
    replicas: 2,
    containers: [
        { 
            image: 'nginx', 
            securityContext: { ensureNonRoot: false, readOnlyRootFilesystem: false}
        }
    ],
})
new kplus.Service(chart, 'srv987', {
        selector: deploy203, 
        ports: [ { port: 80, targetPort: 8080}]
    });
console.log(app.synthYaml())
EOOF
EOF
```