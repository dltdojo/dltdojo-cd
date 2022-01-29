
endpoints

- https://vault-dev.127.0.0.1.nip.io:9443
- https://http-conf-vault.127.0.0.1.nip.io:9443
- https://gitea.127.0.0.1.nip.io:9443
- https://argocd.127.0.0.1.nip.io:9443
  

vault 安裝後需要 ```vault operator init``` 先初始化取得五隻 unseal key 記下來，這時開啟網頁會出現輸入 unseal key 頁面供輸入至少三隻來啟用。

- [Seal/Unseal | Vault by HashiCorp](https://www.vaultproject.io/docs/concepts/seal)
- [persistent dev mode · Issue #12004 · hashicorp/vault](https://github.com/hashicorp/vault/issues/12004)

vault 的 OIDC 設定以 identity/entity 為主，每個 identity/entity 可以新增 entity alias 來綁定不同的 auth_backend 帳號。所以一開始設定 identity/oidc/x 如 identity/oidc/client 與 identity/oidc/provider 等時不需要先有 auth_backend 綁定，可等後面測試時候再來新增 userpass 做測試。

先以 gitea 登入情境來設定 vault，首先在 vault 需設定一個群組 gitea101，後面需要這個 GROUP_ID 來設定 identity/oidc/assignment，一般說明會加上設定 ENTITY_ID，不過實際用處不大，因為設定 ENTITY_ID 變成每次有新 ENTITY_ID 加入都需要改寫一次 identity/oidc/assignment，如果不想每次改 assignment 就要將新 ENTITY_ID 加入 GROUP_ID 就可以。

- [Vault as an OIDC Identity Provider | Vault - HashiCorp Learn](https://learn.hashicorp.com/tutorials/vault/oidc-identity-provider)
- [OIDC Identity Provider | Vault by HashiCorp](https://www.vaultproject.io/docs/secrets/identity/oidc-provider)
- [Using Vault as an OpenID Connect Identity Provider | by Brian Candler | Dec, 2021 | Medium](https://brian-candler.medium.com/using-vault-as-an-openid-connect-identity-provider-ee0aaef2bba2)
- [Setting up Gitea authentication against Azure AD – rakhesh.com](https://rakhesh.com/azure/setting-up-gitea-authentication-against-azure-ad/)
- [Add groups scope/claim to OIDC/OAuth2 Provider by thetechnick · Pull Request #17367 · go-gitea/gitea](https://github.com/go-gitea/gitea/pull/17367)
- [Add Option to synchronize Admin & Restricted states from OIDC/OAuth2 along with Setting Scopes by zeripath · Pull Request #16766 · go-gitea/gitea](https://github.com/go-gitea/gitea/pull/16766)

gitea oidc client and provider

```sh
vault login
GROUP=gitea101
ASSIGNMENT=gitea201
CLIENT_NAME=gitea301
CLIENT_KEY=gitea301
GITEA_AUTH_NAME=vault-oidc-101
REDIRECT_URIS="https://gitea.127.0.0.1.nip.io:9443/user/oauth2/${GITEA_AUTH_NAME}/callback"

# oidc client
vault write identity/group name=${GROUP}
GROUP_ID=$(vault read -field=id identity/group/name/${GROUP})
vault write identity/oidc/assignment/${ASSIGNMENT} group_ids="${GROUP_ID}"

vault write identity/oidc/key/${CLIENT_KEY} \
  allowed_client_ids="*" \
  verification_ttl="1h" \
  rotation_period="1h" \
  algorithm="ES256"

vault write identity/oidc/client/${CLIENT_NAME} \
  redirect_uris=${REDIRECT_URIS} \
  assignments=${ASSIGNMENT} \
  key=${CLIENT_KEY} \
  id_token_ttl="30m" \
  access_token_ttl="1h"

vault read identity/oidc/client/${CLIENT_NAME}
CLIENT_ID=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME})

# oidc provider

PROVIDER=pro101
USER_SCOPE_TEMPLATE=$(cat << EOF
{    
    "username": {{identity.entity.name}},
    "contact": {
        "email": {{identity.entity.metadata.email}}
    }
}
EOF
)

vault write identity/oidc/scope/user \
    description="The user scope provides claims using Vault identity entity metadata" \
    template="$(echo ${USER_SCOPE_TEMPLATE} | base64 -)"


GROUPS_SCOPE_TEMPLATE=$(cat << EOF
{
    "groups": {{identity.entity.groups.names}}
}
EOF
)

vault write identity/oidc/scope/groups \
    description="The groups scope provides the groups claim using Vault group membership" \
    template="$(echo ${GROUPS_SCOPE_TEMPLATE} | base64 -)"


vault write identity/oidc/provider/${PROVIDER} \
    allowed_client_ids="${CLIENT_ID}" \
    scopes_supported="groups,user" \
    issuer="http://oidc404.vault.svc.cluster.local"

vault read identity/oidc/provider/${PROVIDER}
```

關於 scope 客製 groups 設定部份目前 getea 1.15 未支援，預計 1.16 可以支援會類似 ArgoCD 的模式。 

- [Overview - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#existing-oidc-provider)
- [Add Option to synchronize Admin & Restricted states from OIDC/OAuth2 along with Setting Scopes by zeripath · Pull Request #16766 · go-gitea/gitea](https://github.com/go-gitea/gitea/pull/16766)
- [argo-cd/keycloak.md at 20313adbe284bcfca7e1f3e4400629db94a4b476 · argoproj/argo-cd](https://github.com/argoproj/argo-cd/blob/20313adbe284bcfca7e1f3e4400629db94a4b476/docs/operator-manual/user-management/keycloak.md)
- [argo-cd/rbac.md at 20313adbe284bcfca7e1f3e4400629db94a4b476 · argoproj/argo-cd](https://github.com/argoproj/argo-cd/blob/20313adbe284bcfca7e1f3e4400629db94a4b476/docs/operator-manual/rbac.md)


# gitea

設定完成回到 gitea 設定授權來源需要下面資料配合一致。

- GITEA_AUTH_NAME=vault-oidc-101
- client_id and client_secret from ```vault read identity/oidc/client/${CLIENT_NAME}```
- url of well-known/openid-configuration http://oidc404.vault.svc.cluster.local/v1/identity/oidc/provider/pro101/.well-known/openid-configuration

要設定完成 [OIDC Authentication using the Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html) 問題出在 openid-configuration 內容，這個流程內 EndUser 需要 authorization_endpoint 可通 OP，而 RP 需要除 authorization_endpoint 之外的可通，但是 RP 與 OP 因為在 k8s 內網，使用 private-ip.x.x.nip.io 解析的會不通。

用 vault 產生的 well-known/openid-configuration 一開始不會過因為它會走  authorization_endpoint 為 http://10.42.0.16:8200/ui/vault/identity/oidc/provider/pro101/authorize 導致瀏覽器找不到。

OIDC 設定的難處在於 RP oidc-client (gitea/argocd..) 與 OP oidc-provider (vault) 在同一個內網可通，但是 authorization_endpoint 這個位置需要 End-User 登入的瀏覽器發起，使用內網址如 http://vault.namespace.svc.cluster.local:8200 網址，須改用對外的 https://vault-dev.127.0.0.1.nip.io:9443 ，其餘保持內網網址讓 RP 找到 OP。

目前 vault 輸出的 well-known/openid-configuration 只能設定 issuer 然後全部都同一個前綴網址，無法單改 authorization_endpoint，這時需要另外提供改寫過的 well-known/openid-configuration 供 gitea 設定時使用。

使用 nginx reverse proxy 改寫放置 well-known/openid-configuration 為 http://oidc404.vault.svc.cluster.local/v1/identity/oidc/provider/pro101/.well-known/openid-configuration

gitea 設定完成後即可將 vault 的某 entity 加入 GROUP=gitea101 即可，只有 entity 不會觸發登入行為，需要在 entity 頁面 Add alias 綁定某一種 Auth Backend 才可以，下面利用 UI 新增 alice /與 userpass auth backend 來測試，一個 entity 可以同時綁定不同的 auth backend，例如 entity alice 可綁 /userpass/alice987 與 /github/alice101 等等。因為 entity != entity alias 所以兩個都要新增。

- 新增 Entity alice
- 新增 /userpass auth method
- /userpass create user alice
- entity alice add alias /userpass/alice
- group gitea101 add member entity alice

取消 entity alice 登入 gitea 權限只要移出 group gitea101 即可。

登出問題

如果要 gitea 切換身份需要登出，目前還沒有登出 vault 的作法，所以必須使用者去 vault 做登出動作才算完成登出。

- [Logging out of OpenID Connect provider · Issue #14270 · go-gitea/gitea](https://github.com/go-gitea/gitea/issues/14270)
- [Add OAuth2 Sign out URL · Issue #16869 · go-gitea/gitea](https://github.com/go-gitea/gitea/issues/16869)

重啟升級 gitea

會出現 oauth2_session 過期問題，需要登入重新在認證來源點擊「更新認證來源」來更新。

# argocd

- [argo-cd/docs/operator-manual/user-management at master · argoproj/argo-cd](https://github.com/argoproj/argo-cd/tree/master/docs/operator-manual/user-management)
- 只支援 RS256
- 如 redirect url 為 https://argocd.127.0.0.1.nip.io:9443/auth/callback ， argocd-cm/data/url 必須填 https://argocd.127.0.0.1.nip.io:9443 一致


設定 argocd 的流程與 gitea 類似，只是 argocd callback (redirect_urls) 與 gitea 有不同的 callback url。

> The callback address should be the /auth/callback endpoint of your Argo CD URL (e.g. https://argocd.example.com/auth/callback).

另外與 gitea 共用同一個 identity/oidc/provider/pro101 不須改寫 well-known/openid-configuration

```
vault login
GROUP_ARGO=argocd101
ASSIGNMENT_ARGO=argocd201
CLIENT_NAME_ARGO=argocd301
CLIENT_KEY_ARGO=argocd301
REDIRECT_URIS_ARGO="https://argocd.127.0.0.1.nip.io:9443/auth/callback"

# oidc client
vault write identity/group name=${GROUP_ARGO}
GROUP_ID_ARGO=$(vault read -field=id identity/group/name/${GROUP_ARGO})
vault write identity/oidc/assignment/${ASSIGNMENT_ARGO} group_ids="${GROUP_ID_ARGO}"

vault write identity/oidc/key/${CLIENT_KEY_ARGO} \
  allowed_client_ids="*" \
  verification_ttl="1h" \
  rotation_period="1h" \
  algorithm="RS256"

vault write identity/oidc/client/${CLIENT_NAME_ARGO} \
  redirect_uris=${REDIRECT_URIS_ARGO} \
  assignments=${ASSIGNMENT_ARGO} \
  key=${CLIENT_KEY_ARGO} \
  id_token_ttl="30m" \
  access_token_ttl="1h"

vault read identity/oidc/client/${CLIENT_NAME_ARGO}
CLIENT_ID_ARGO=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME_ARGO})

# same provider pro101

PROVIDER=pro101
CLIENT_NAME_GITEA=gitea301
CLIENT_ID_GITEA=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME_GITEA})

vault write identity/oidc/provider/${PROVIDER} \
    allowed_client_ids="${CLIENT_ID_GITEA},${CLIENT_ID_ARGO}" \
    scopes_supported="groups,user" \
    issuer="http://oidc404.vault.svc.cluster.local"

vault read identity/oidc/provider/${PROVIDER}
```

argocd 設定與 gitea 類似需要改寫取得 openid-configuration 位置正確將 authorization_endpoint 改為 End-User 可以存取的 URL。

> The issuer URL should be where Dex talks to the OIDC provider. There would normally be a .well-known/openid-configuration under this URL which has information about what the provider supports. e.g. https://accounts.google.com/.well-known/openid-configuration

arogcd 的 oidc.config 內 issuer 需用之前建置的 http://oidc404.vault.svc.cluster.local/v1/identity/oidc/provider/pro101 來取代 http://vault.vault.svc.cluster.local:8200/v1/identity/oidc/provider/pro101。

[SSO Overview - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd-docs.readthedocs.io/en/latest/operator-manual/sso/#existing-oidc-provider)