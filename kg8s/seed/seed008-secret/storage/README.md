## k3d

k3d 預設提供 [local-path-provisioner](https://k3d.io/v5.2.2/usage/k3s/#local-path-provisioner)，建立時沒有綁定主機端目錄會掛載 docker 內部的檔案系統目錄。

local-path-provisioner 目前支援 ReadWriteOnce(RWO)，還沒有 ReadOnlyMany(ROX)， ReadWriteMany(RWX) 模式，換句話說需綁定在特定 node 上。

> In k3d, the local paths that the local-path-provisioner uses (default is /var/lib/rancher/k3s/storage) lies inside the container’s filesystem, meaning that by default it’s not mapped somewhere e.g. in your user home directory for you to use. You’d need to map some local directory to that path to easily use the files inside this path: add --volume $HOME/some/directory:/var/lib/rancher/k3s/storage@all to your k3d cluster create command.

- [rancher/local-path-provisioner: Dynamically provisioning persistent local storage with Kubernetes](https://github.com/rancher/local-path-provisioner)
- [Search · DEFAULT_LOCAL_STORAGE_PATH](https://github.com/k3s-io/k3s/search?q=DEFAULT_LOCAL_STORAGE_PATH)
- [k3s/local-storage.yaml at a094dee7dd0d7e7f7b2c8d50f90bb6760f9c86bf · k3s-io/k3s](https://github.com/k3s-io/k3s/blob/a094dee7dd0d7e7f7b2c8d50f90bb6760f9c86bf/manifests/local-storage.yaml)
- [Search · ReadWriteMany](https://github.com/rancher/local-path-provisioner/search?q=ReadWriteMany&type=issues)


## rook + cephfs

ReadWriteMany RWX 需要 cephfs 支援，類似 k3s local-path-provisioner 議題。

- [Rook Ceph Provisioning issue - Stack Overflow](https://stackoverflow.com/questions/69322849/rook-ceph-provisioning-issue)
- [[Question] Using rook ceph · Issue #835 · rancher/k3d](https://github.com/rancher/k3d/issues/835)


## NFS

[kubernetes-sigs/sig-storage-lib-external-provisioner](https://github.com/kubernetes-sigs/sig-storage-lib-external-provisioner)