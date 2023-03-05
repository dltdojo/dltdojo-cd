export const Dockerfiles = {
  BusyboxHello: `# busybox
FROM busybox:1.36
RUN date > /hello`,
  DenoAlpineGitCurl: `# docker file
FROM denoland/deno:alpine-1.31.1
RUN apk add --no-cache git openssl sed curl jq busybox-extras`
}

export const ConfigureFile = {
  RedisNoProtect101: `# Redis configuration file
bind 0.0.0.0
protected-mode no
maxmemory 2mb
maxmemory-policy allkeys-lru`,

}

export const ShellScripts = {
  VaultDevServerOnly:`#!/bin/sh
# https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider
env
/usr/local/bin/docker-entrypoint.sh vault server -dev
`,
  VaultDev:`#!/bin/sh
# https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider
env
apk add jq
/usr/local/bin/docker-entrypoint.sh vault server -dev &
sleep 15
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=myroot
env
id
vault auth enable userpass
vault write auth/userpass/users/end-user \
  password="password" \
  token_ttl="1h"
vault write identity/entity \
  name="end-user" \
  metadata="email=vault@hashicorp.com" \
  metadata="phone_number=123-456-7890" \
  disabled=false
#
ENTITY_ID=$(vault read -field=id identity/entity/name/end-user)
#
vault write identity/group \
    name="engineering" \
    member_entity_ids="$ENTITY_ID"
#
GROUP_ID=$(vault read -field=id identity/group/name/engineering)
#
USERPASS_ACCESSOR=$(vault auth list -detailed -format json | jq -r '.["userpass/"].accessor')
#
vault write identity/entity-alias \
    name="end-user" \
    canonical_id="$ENTITY_ID" \
    mount_accessor="$USERPASS_ACCESSOR"
# create an assignment
vault write identity/oidc/assignment/my-assignment \
    entity_ids="$ENTITY_ID" \
    group_ids="$GROUP_ID"
# create a oidc key
vault write identity/oidc/key/my-key \
    allowed_client_ids="*" \
    verification_ttl="2h" \
    rotation_period="1h" \
    algorithm="RS256"
# create oidc client foo101
vault write identity/oidc/client/foo101 \
    redirect_uris="http://localhost:8000/callback" \
    assignments="my-assignment" \
    key="my-key" \
    id_token_ttl="30m" \
    access_token_ttl="1h"
#
CLIENT_ID=$(vault read -field=client_id identity/oidc/client/foo101)
# Create a Vault OIDC provider
USER_SCOPE_TEMPLATE='{
  "username": {{identity.entity.name}},
  "contact": {
      "email": {{identity.entity.metadata.email}},
      "phone_number": {{identity.entity.metadata.phone_number}}
  }
}'
#
vault write identity/oidc/scope/user \
  description="The user scope provides claims using Vault identity entity metadata" \
  template="$(echo $USER_SCOPE_TEMPLATE | base64 -)"
#
GROUPS_SCOPE_TEMPLATE='{
  "groups": {{identity.entity.groups.names}}
}'
#
vault write identity/oidc/scope/groups \
  description="The groups scope provides the groups claim using Vault group membership" \
  template="$(echo $GROUPS_SCOPE_TEMPLATE | base64 -)"
#
vault write identity/oidc/provider/my-provider \
  allowed_client_ids="$CLIENT_ID" \
  scopes_supported="groups,user"

# Block on vault
wait
`,
  BusyboxHello: `#!/bin/sh
id
env
date
busybox | head -1
echo "hello world"`,

  BusyboxHttpd: `#!/bin/sh
id
env
date
busybox | head -1
mkdir /www
echo "<html><head><title>HELLO WORLD</title></head><body><h1>HELLO WORLD</h1></body></html>" > /www/index.html
busybox httpd -fv -h /www -p 3000`,


  DenoAlpineGitCurl: `#!/bin/sh
id
env
busybox
mkdir web
echo "===> httpd start...."
httpd -fv -p 3000 -h web &
echo Busybox Httpd : Hello World : $(date) > web/hello.txt
sleep 3
echo "===> check curl"
curl --version
curl -sv http://localhost:3000/hello.txt
sleep 1
echo "===> check deno"
deno --version
deno run https://deno.land/std@0.177.0/examples/welcome.ts
`
}
