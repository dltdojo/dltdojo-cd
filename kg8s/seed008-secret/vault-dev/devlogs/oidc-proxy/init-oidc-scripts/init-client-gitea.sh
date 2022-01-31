GROUP_GITEA=gitea101
ASSIGNMENT_GITEA=gitea201
CLIENT_NAME_GITEA=gitea301
CLIENT_KEY_GITEA=gitea301
GITEA_AUTH_NAME=vault-oidc-101
REDIRECT_URIS="https://gitea.127.0.0.1.nip.io:9443/user/oauth2/${GITEA_AUTH_NAME}/callback"

# oidc client
vault write identity/group name=${GROUP_GITEA}
GROUP_ID_GITEA=$(vault read -field=id identity/group/name/${GROUP_GITEA})
vault write identity/oidc/assignment/${ASSIGNMENT_GITEA} group_ids="${GROUP_ID_GITEA}"

vault write identity/oidc/key/${CLIENT_KEY_GITEA} \
  allowed_client_ids="*" \
  verification_ttl="1h" \
  rotation_period="1h" \
  algorithm="ES256"

vault write identity/oidc/client/${CLIENT_NAME_GITEA} \
  redirect_uris=${REDIRECT_URIS} \
  assignments=${ASSIGNMENT_GITEA} \
  key=${CLIENT_KEY_GITEA} \
  id_token_ttl="30m" \
  access_token_ttl="1h"

vault read identity/oidc/client/${CLIENT_NAME_GITEA}
CLIENT_ID_GITEA=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME_GITEA})