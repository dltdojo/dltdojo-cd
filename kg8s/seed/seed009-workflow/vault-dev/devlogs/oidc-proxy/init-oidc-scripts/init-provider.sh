PROVIDER=pro101
CLIENT_NAME_GITEA=gitea301
CLIENT_ID_GITEA=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME_GITEA})
CLIENT_NAME_ARGO=argocd301
CLIENT_ID_ARGO=$(vault read -field=client_id identity/oidc/client/${CLIENT_NAME_ARGO})

# oidc provider

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
    allowed_client_ids="${CLIENT_ID_GITEA},${CLIENT_ID_ARGO}" \
    scopes_supported="groups,user" \
    issuer="http://oidc404.vault.svc.cluster.local"

vault read identity/oidc/provider/${PROVIDER}