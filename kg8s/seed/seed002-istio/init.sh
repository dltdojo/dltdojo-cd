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

CreateTempCert(){
    echo
    echo "Create temp certs and keys"
    echo
    pushd layer0/temp-cert
    openssl req -new -x509 -nodes -newkey ec:<(openssl ecparam -name secp256r1) -subj '/O=LOCALDEV/CN=CA.TESTONLY.LOCAL' -keyout ca.key -out ca.crt -days 3650
    openssl req -out nip.io.csr -newkey ec:<(openssl ecparam -name secp256r1) -nodes -keyout nip.io.key -subj "/CN=*.nip.io/O=LOCALDEV"
    # 
    # [Certificate contains the same serial number as another certificate | Firefox Help](https://support.mozilla.org/en-US/kb/Certificate-contains-the-same-serial-number-as-another-certificate)
    # [解決Firefox抱怨sec_error_reused_issuer_and_serial的問題 · Issue #70 · alibaba/anyproxy](https://github.com/alibaba/anyproxy/issues/70)
    # 
    openssl x509 -req -days 3650 -CA ca.crt -CAkey ca.key -set_serial 0x$(openssl rand -hex 8) -in nip.io.csr -out nip.io.crt
    popd
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
    echo "Init examples git-curl"
    echo
    kubectl apply -k examples/git-curl
    kubectl rollout status deployment/git-curl --timeout=300s
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
    kubectl apply -k examples/nginx
    kubectl rollout status deployment/my-nginx --timeout=180s
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
    kubectl apply -k istio-metrics
    # kubectl rollout status deployment/kiali -n istio-system --timeout=180s
    # kubectl rollout status deployment/grafana -n istio-system --timeout=180s
    # kubectl rollout status deployment/prometheus -n istio-system --timeout=180s
    kubectl wait -n istio-system deployment --all --for=condition=available --timeout=300s
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
    kubectl wait -n istio-system deployment --all --for=condition=available --timeout=300s
    kubectl label namespace default istio-injection=enabled
    kubectl create -n istio-system secret tls temp-nip-io-credential --key=layer0/temp-cert/nip.io.key --cert=layer0/temp-cert/nip.io.crt
    kubectl apply -n default -f layer0/istio-gateway-vs.yaml
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
    kubectl apply -f layer0/storage-retain-local-path.yaml
    kubectl get storageclass
}

############################################################
# Process the input options. Add options as needed.        #
############################################################
# Get the options
while getopts ":hn:" option; do
   case $option in
      h) # display Help
         Help
         exit;;
      n) # Enter a name
         CLUSTER_NAME=$OPTARG
         CheckCmdExist
         Initk3d
         sleep 3
         InitExamplesPv
         sleep 3
         TestsPv
         sleep 3
         CreateTempCert
         sleep 3
         InitIstio
         sleep 3
         InitExamplesNginx
         sleep 3
         TestsNginx
         sleep 3
         InitIstioMetrics
         sleep 3
         TestsIstioMetrics
         exit;;
     \?) # Invalid option
         echo "Error: Invalid option"
         exit;;
   esac
done