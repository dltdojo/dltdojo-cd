#
# kind create cluster
# 
DEPLOYMENTID=deployment/c101-vault1.12.3-c846916d
kubectl create -f vault-app.yaml
kubectl rollout status $DEPLOYMENTID --timeout=2m
sleep 5
kubectl port-forward service/vault101 8200 &
sleep 10
curl -s http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider/.well-known/openid-configuration | tee  openid-configuration-vault.json | jq .
#
CLIENT_ID=$(kubectl exec $DEPLOYMENTID -- cat /tmp/client-id)
CLIENT_SECRET=$(kubectl exec $DEPLOYMENTID -- cat /tmp/client-secret)
#
sed -i "s/VAULT_OIDC_CLIENT_ID=.*/VAULT_OIDC_CLIENT_ID=$CLIENT_ID/g" .env
sed -i "s/VAULT_OIDC_CLIENT_SECRET=.*/VAULT_OIDC_CLIENT_SECRET=$CLIENT_SECRET/g" .env
wait