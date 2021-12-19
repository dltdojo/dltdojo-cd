# seed001-pv

[K3s Features in k3d - k3d](https://k3d.io/v5.2.2/usage/k3s/)

> In k3d, the local paths that the local-path-provisioner uses (default is /var/lib/rancher/k3s/storage) lies inside the container’s filesystem, meaning that by default it’s not mapped somewhere e.g. in your user home directory for you to use. You’d need to map some local directory to that path to easily use the files inside this path: add --volume $HOME/some/directory:/var/lib/rancher/k3s/storage@all to your k3d cluster create command.


```sh
$ bash init.sh -n foo2021
```

cleanup

```sh
$ k3d cluster delete foo2021
$ sudo rm -rf $HOME/k3dvol/foo2021
```