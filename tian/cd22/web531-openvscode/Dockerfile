# syntax=docker/dockerfile:1.3-labs
FROM gitpod/openvscode-server:1.73.1 AS openvscode102
USER openvscode-server
RUN <<EOF 
/home/.openvscode-server/bin/openvscode-server --install-extension=redhat.vscode-yaml
EOF

FROM openvscode102 AS openvscode201
USER root
# Install docker cli
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce-cli containerd.io docker-compose-plugin
rm -rf /var/lib/apt/lists/*
EOF
USER openvscode-server
RUN <<EOF
/home/.openvscode-server/bin/openvscode-server --install-extension=ms-azuretools.vscode-docker
EOF

FROM openvscode201 AS openvscode301
USER root
# Install kubectl 
RUN <<EOF
cd /tmp
curl -sL https://dl.k8s.io/release/v1.25.4/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl
chmod +x /usr/local/bin/kubectl
curl -sSL https://get.helm.sh/helm-v3.10.2-linux-amd64.tar.gz | tar xz
mv linux-amd64/helm /usr/local/bin/helm
rm -rf linux-amd64
EOF
USER openvscode-server
RUN <<EOF
/home/.openvscode-server/bin/openvscode-server --install-extension=ms-kubernetes-tools.vscode-kubernetes-tools
EOF