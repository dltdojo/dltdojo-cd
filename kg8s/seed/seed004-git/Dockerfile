# syntax=docker/dockerfile:1.3-labs
FROM public.ecr.aws/docker/library/debian:bullseye-slim
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssl curl jq git tree && apt-get clean
RUN <<\EOOF
KUBECTL_VERSION=v1.21.8
curl -sL https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl -o /bin/kubectl && \
  chmod +x /bin/kubectl

KUSTOMIZE_VERSION=v4.4.0
curl -sL https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64.tar.gz \
  | tar xz -C /tmp && mv /tmp/kustomize /bin/

HELM_V3=v3.7.0
curl -sSL https://get.helm.sh/helm-${HELM_V3}-linux-amd64.tar.gz | tar xz && \
  mv linux-amd64/helm /bin/helm && rm -rf linux-amd64

K9S_VERSION=v0.24.15
curl -sSL https://github.com/derailed/k9s/releases/download/${K9S_VERSION}/k9s_Linux_x86_64.tar.gz | tar xz && mv k9s /bin/k9s 
EOOF

RUN <<\EOOF
SKAFFOLD_VERSION=v1.32.0
curl -sLo skaffold https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64 && \
  chmod +x skaffold && mv skaffold /bin/

K3D_VERSION=5.0.0
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | TAG=v$K3D_VERSION bash

curl -sLo yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 \
  && chmod +x yq && mv yq /bin/
EOOF
ENV KUBECONFIG /kube/config
RUN mkdir -p /kube && chmod a+w /kube
COPY . /sys-seed