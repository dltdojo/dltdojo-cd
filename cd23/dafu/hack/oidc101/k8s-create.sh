#
# kind create cluster
# 
kubectl create -f vault-app.yaml
kubectl rollout status deployment/c101-vault1.12.3-c846916d --timeout=2m
sleep 5
kubectl port-forward service/vault101 8200 &
sleep 5
curl -s http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider/.well-known/openid-configuration | jq .
wait