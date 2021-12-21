#!/bin/bash
#
# [Adding arguments and options to your Bash scripts | Enable Sysadmin](https://www.redhat.com/sysadmin/arguments-options-bash-scripts)
#
############################################################
# Help                                                     #
############################################################
Help()
{
   # Display Help
   echo "Add description of the script functions here."
   echo
   echo "Syntax: scriptTemplate [-h|v]"
   echo "options:"
   echo "h     Print this Help."
   echo "v     Verbose mode."
   echo
}

############################################################
############################################################
# Main program                                             #
############################################################
############################################################

# Set variables
CLUSTER_NAME="foo101"
KCTL_IMG="kg8s-local/kctl:v21.12.1"
# TEMP_CERT_PATH=layer0/temp-cert
CONTEXT_NAME="k3d-${CLUSTER_NAME}"

CreateTempCert(){
    # mkdir -p $TEMP_CERT_PATH
    #docker run -i -u $(id -u):$(id -g) -v $PWD/$TEMP_CERT_PATH:/data -w /data \
    docker run -i -w /data -v $PWD/layer0:/layer0:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
openssl req -new -x509 -nodes -newkey ec:<(openssl ecparam -name secp256r1) -subj '/O=LOCALDEV/CN=CA.TESTONLY.LOCAL' -keyout ca.key -out ca.crt -days 3650
openssl req -out nip.io.csr -newkey ec:<(openssl ecparam -name secp256r1) -nodes -keyout nip.io.key -subj "/CN=*.nip.io/O=LOCALDEV"
openssl x509 -req -days 3650 -CA ca.crt -CAkey ca.key -set_serial 0x$(openssl rand -hex 8) -in nip.io.csr -out nip.io.crt
kubectl config set current-context $CONTEXT_NAME
kubectl create -n istio-system secret tls temp-nip-io-credential --key=nip.io.key --cert=nip.io.crt
kubectl label namespace default istio-injection=enabled
kubectl apply -n default -f /layer0/istio-gateway-vs.yaml
EOF
}

CheckCmdExist(){
    echo
    echo "Check cmds exist"
    echo
    command -v docker >/dev/null 2>&1 || { echo "docker is not installed.  aborting." >&2; exit 1; }
    command -v k3d >/dev/null 2>&1 || { echo "k3d is not installed.  aborting." >&2; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo "kubectl is not installed.  aborting." >&2; exit 1; }
    command -v istioctl >/dev/null 2>&1 || { echo "istioctl is not installed.  aborting." >&2; exit 1; }
    command -v curl >/dev/null 2>&1 || { echo "curl is not installed.  aborting." >&2; exit 1; }
    command -v openssl >/dev/null 2>&1 || { echo "openssl is not installed.  aborting." >&2; exit 1; }
}

InitExamplesPv(){
    echo
    echo "Init examples git-curl and kctl"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -k examples/git-curl
kubectl rollout status deployment/git-curl --timeout=300s
kubectl apply -k examples/kctl
kubectl rollout status deployment/kctl --timeout=300s
EOF
}

TestsPv(){
    echo
    echo "Tests: print files in the mounted volume of host"
    echo
    find $HOME/k3dvol/$CLUSTER_NAME -type f -exec bash -c 'echo {} ; cat {}; echo ;' \;
}


InitExamplesNginx(){
    echo
    echo "Init examples nginx"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -k examples/nginx
kubectl rollout status deployment/my-nginx --timeout=180s
EOF
}

TestsNginx(){
    echo
    echo "Tests: Nginx"
    echo
    curl -kv --retry 8 --retry-all-errors https://my-nginx.127.0.0.1.nip.io:9443
}

InitIstioMetrics(){
    echo
    echo "Init istio addon metrics"
    echo
    # kubectl rollout status deployment/kiali -n istio-system --timeout=180s
    # kubectl rollout status deployment/grafana -n istio-system --timeout=180s
    # kubectl rollout status deployment/prometheus -n istio-system --timeout=180s
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -k istio-metrics
kubectl wait -n istio-system deployment --all --for=condition=available --timeout=300s
EOF
}

InitGitea(){
    echo
    echo "Init gitea"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -k gitea
kubectl rollout status statefulset/gitea -n gitea --timeout=300s
EOF
# kubectl wait works for Deployment, but does not for StatefulSet · Issue #79606 · kubernetes/kubernetes
# https://github.com/kubernetes/kubernetes/issues/79606#issuecomment-779779928
}

InitArgocd(){
    echo
    echo "Init argocd"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -k argocd
kubectl wait -n argocd deployment --all --for=condition=available --timeout=300s
EOF
}

InitArgocdApps(){
    echo
    echo "Init argocd apps"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -f argocd/apps/capp-examples.yaml 
kubectl apply -f argocd/apps/capp-gitops.yaml 
EOF
}

PushRepoSysSeed(){
    echo
    echo "Push repo sys-seed"
    echo
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
echo "Init sys-seed repo"
kubectl apply -f  gitea/job-repo-seed/git-repo-push-job.yaml
kubectl wait --for=condition=complete job/git-repo-push --timeout=300s -n gitea
# kubectl delete jobs git-repo-push -n gitea
EOF
}

TestsIstioMetrics(){
    echo
    echo "Tests: Kiali and grafana"
    echo
    curl -kvI --retry 8 --retry-all-errors https://kiali-istio-system.127.0.0.1.nip.io:9443
    echo
    curl -kvI --retry 8 --retry-all-errors https://grafana-istio-system.127.0.0.1.nip.io:9443
}

InitIstio()
{
    echo
    echo "Init istio"
    echo
    istioctl install --set profile=default -y
    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl wait -n istio-system deployment --all --for=condition=available --timeout=300s
EOF
}

#
# [K3d cluster create - k3d](https://k3d.io/v5.2.1/usage/commands/k3d_cluster_create/)
#
Initk3d()
{
    echo
    echo "Init kubernetes cluster ${CLUSTER_NAME}"
    echo
    mkdir -p $HOME/k3dvol/$CLUSTER_NAME
    k3d cluster create $CLUSTER_NAME --api-port 6550 --agents 1 \
      --volume $HOME/k3dvol/$CLUSTER_NAME:/var/lib/rancher/k3s/storage@all \
      -p "9443:443@loadbalancer" --k3s-arg '--disable=traefik@server:*'
    k3d cluster list
    k3d image import $KCTL_IMG -c $CLUSTER_NAME

    docker run -i -w /src -v $PWD:/src:ro \
      --network host  --rm -v ${HOME}/.kube/config:/kube/config:ro $KCTL_IMG <<EOF
kubectl apply -f layer0/storage-retain-local-path.yaml
kubectl apply -f layer0/namespaces.yaml
kubectl get storageclass
EOF
}

BuildDockerImageKctl()
{
    echo
    echo "Build docker image kctl"
    echo
    DOCKER_BUILDKIT=1 docker build -t $KCTL_IMG .
}

############################################################
# Process the input options. Add options as needed.        #
############################################################
# Get the options
while getopts "hbtn:" option; do
   case $option in
      h) # display Help
         Help
         exit;;
      b) # build docker image kctl
         BuildDockerImageKctl
         exit;;
      n) # create a cluster
         CLUSTER_NAME=$OPTARG
         CheckCmdExist
         BuildDockerImageKctl
         Initk3d
         InitExamplesPv
         sleep 3
         TestsPv
         InitIstio
         CreateTempCert
         sleep 3
         InitExamplesNginx
         TestsNginx
         sleep 3
         InitIstioMetrics
         TestsIstioMetrics
         InitGitea
         PushRepoSysSeed
         sleep 3
         InitArgocd
         InitArgocdApps
         exit;;
      t) # test function
         BuildDockerImageKctl
         exit;;
     \?) # Invalid option
         echo "Error: Invalid option"
         exit;;
   esac
done