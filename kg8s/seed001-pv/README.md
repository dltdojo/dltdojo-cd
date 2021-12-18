
- https://my-nginx-127-0-0-1.nip.io:9443


```sh
# 1. init k3d
# 2. init istio
$ bash init.sh -n foo2021
```

cleanup

```sh
$ k3d cluster delete foo2021
$ sudo rm -rf $HOME/k3dvol/foo2021
```