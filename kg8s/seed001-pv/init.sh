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

CheckCmdExist(){
    echo
    echo "Check cmds exist"
    echo
    command -v docker >/dev/null 2>&1 || { echo "docker is not installed.  aborting." >&2; exit 1; }
    command -v k3d >/dev/null 2>&1 || { echo "k3d is not installed.  aborting." >&2; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo "kubectl is not installed.  aborting." >&2; exit 1; }
}

InitExamplesPv(){
    echo
    echo "Init examples"
    echo
    kubectl apply -k examples/git-curl
    kubectl rollout status deployment/git-curl --timeout=120s
}

TestsPv(){
    echo
    echo "print files in the mounted volume of host"
    echo
    find $HOME/k3dvol/$CLUSTER_NAME -type f -exec bash -c 'echo {} ; cat {}; echo ;' \;
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
      --volume $HOME/k3dvol/$CLUSTER_NAME:/var/lib/rancher/k3s/storage@all
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
         sleep 5
         InitExamplesPv
         sleep 5
         TestsPv
         exit;;
     \?) # Invalid option
         echo "Error: Invalid option"
         exit;;
   esac
done