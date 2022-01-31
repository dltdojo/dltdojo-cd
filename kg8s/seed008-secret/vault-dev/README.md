vault operator

```
vault operator init
vault operator unseal
vault login
```

- [Injecting Secrets into Kubernetes Pods via Vault Agent Containers | Vault - HashiCorp Learn](https://learn.hashicorp.com/tutorials/vault/kubernetes-sidecar?in=vault/kubernetes)
- [vault-k8s and istio service mesh don't work together · Issue #41 · hashicorp/vault-k8s](https://github.com/hashicorp/vault-k8s/issues/41)

奇怪的事情是出現 example/kctl init PUT 403 問題無法登入，重新刷一次 vault write auth/kubernetes/config 就正常？如果 k8s 新增 token 或是 vault 重新啟動或是改版啟動 token_reviewer_jwt 會變動需要更新 vault write auth/kubernetes/config 否則會出現上述 403 問題。

關於 keycloak 的 admin user 設定後不能修改密碼，必須改名與密碼一起後重起，因為 keycloak-admin 已新增過留在 keycloak 資料庫，所以即使新密碼被注入環境變數並啟動，新密碼也無法登入 keycloak 會出現 KC-SERVICES0104: Not creating user keycloak-admin. It already exists，只能用舊密碼登入，所以要更新管理員密碼需要連管理員名稱一起更新。

關於 gitea 行為不同，可以改密碼但不能改名，這是因為目前 ```gitea-admin101``` 配置 email 的會導致重複而且無法用 env 修改，除非改 configure_gitea.sh 來接受 env 新的 email。

另外更新 vault.hashicorp.com/agent-inject-template-xxx 有時？無法改版來重起更新，必須刪掉 deployment/statefulset 自動重起才有效。

