#!/bin/bash
vault auth enable kubernetes

vault write auth/kubernetes/config \
  issuer="https://kubernetes.default.svc.cluster.local" \
  token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

vault secrets enable -version=2 -path=secret101 kv

vault kv put secret101/db2021/v123 username="db-user-name" password="db-secret-password"

vault policy write policy201 - <<EOF
path "secret101/data/db2021/v123" {
    capabilities = ["read"]
}
EOF

vault write auth/kubernetes/role/role301 \
  bound_service_account_names=kctl \
  bound_service_account_namespaces=default \
  policies=policy201 \
  ttl=20m

password=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c24)
vault kv put secret101/keycloak username="keycloak-admin101" password="${password}"

vault policy write policy-keycloak - <<EOF
path "secret101/data/keycloak" {
    capabilities = ["read"]
}
EOF

vault write auth/kubernetes/role/keycloak \
  bound_service_account_names=keycloak \
  bound_service_account_namespaces=keycloak \
  policies=policy-keycloak \
  ttl=20m

password=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c24)
vault kv put secret101/gitea username="gitea-admin101" password="${password}" client_name=client101 client_secret=tochange

vault policy write policy-gitea - <<EOF
path "secret101/data/gitea" {
    capabilities = ["read"]
}
EOF

vault write auth/kubernetes/role/gitea \
  bound_service_account_names=gitea \
  bound_service_account_namespaces=gitea \
  policies=policy-gitea \
  ttl=20m