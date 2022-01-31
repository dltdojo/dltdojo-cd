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