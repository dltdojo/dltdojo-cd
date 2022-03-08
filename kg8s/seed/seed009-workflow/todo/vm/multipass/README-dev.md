k3d 模擬多節點的方式與實際配置檔案系統有所差異，採用 vm 配置來對應。


# multipass and microk8s

- [Multipass orchestrates virtual Ubuntu instances](https://multipass.run/)
- [Additional network interfaces | Multipass documentation](https://multipass.run/docs/additional-networks)
- [Using cloud-init with Multipass | Ubuntu](https://ubuntu.com/blog/using-cloud-init-with-multipass)
- [MicroK8s - Alternative installs (MacOS/Windows 10/Multipass)](https://microk8s.io/docs/install-alternatives)
- [Support for static IP address · Issue #567 · canonical/multipass](https://github.com/canonical/multipass/issues/567)
- [Error Unable to connect to the server ... after reboot. · Issue #2821 · ubuntu/microk8s](https://github.com/ubuntu/microk8s/issues/2821)
- [己思 - 使用 Multipass 與 cloud-init 快速建立 MicroK8s 叢集所需的虛擬機器 (VMs)](https://ohmyrss.com/post/1642424439043)
- [利用 Multipass 在區域網路架設一套 MicroK8s 叢集環境 | The Will Will Web](https://blog.miniasp.com/post/2022/01/15/Build-your-own-MicroK8s-with-Multipass-with-Fixed-IP)

對外網路測試，並設定 multipass 使用 LXD 網路做橋接，固定 IP 的設定只要針對需要固定的 kubernetes master node 設定即可，如 LXD 設定上限為 10.177.72.200，那可用的固定 master node address 從 10.177.72.201 開始設定避免衝到。

mpbr0 bridge (Network bridge for Multipass) 專供 multipass 使用？

```sh
$ sudo snap install multipass
$ sudo snap install lxd
$ sudo multipass set local.driver=lxd
$ multipass networks | grep Multipass
mpbr0            bridge    Network bridge for Multipass
$ sudo multipass set local.bridged-network=mpbr0

$ ip -br address | grep mpbr0
mpbr0            UP             10.177.72.1/24 fd42:9a6e:30d:a1a7::1/64 fe80::216:3eff:fe62:aa29/64 

$ sudo lxc network info mpbr0
Name: mpbr0
MAC address: 00:16:3e:62:aa:29
MTU: 1500
State: up

Ips:
  inet	10.177.72.1
  inet6	fd42:9a6e:30d:a1a7::1
  inet6	fe80::216:3eff:fe62:aa29

Network usage:
  Bytes received: 6.59MB
  Bytes sent: 2.04GB
  Packets received: 102667
  Packets sent: 157900

$ sudo lxc network set mpbr0 ipv4.dhcp.ranges 10.177.72.2-10.177.72.200
$ multipass launch core18 --name f101
$ multipass launch core18 --name f102
$ multipass launch core18 --name f103 --bridged
$ multipass list
Name                    State             IPv4             Image
f101                    Running           10.177.72.27     Ubuntu Core 18
f102                    Running           10.177.72.32     Ubuntu Core 18
f103                    Running           10.177.72.28     Ubuntu Core 18
                                          10.177.72.44
$ multipass exec f103 -- ip -br address
lo               UNKNOWN        127.0.0.1/8 ::1/128 
eth0             UP             10.177.72.28/24 fd42:9a6e:30d:a1a7:5054:ff:fe80:2143/64 fe80::5054:ff:fe80:2143/64 
eth1             UP             10.177.72.44/24 fd42:9a6e:30d:a1a7:5054:ff:fe7b:cb9d/64 fe80::5054:ff:fe7b:cb9d/64

$ multipass exec f103 -- cat /etc/netplan/50-cloud-init.yaml
network:
    ethernets:
        default:
            dhcp4: true
            match:
                macaddress: 52:54:00:80:21:43
        extra0:
            dhcp4: true
            dhcp4-overrides:
                route-metric: 200
            match:
                macaddress: 52:54:00:7b:cb:9d
            optional: true
    version: 2

$ multipass shell f103 

sudo tee /etc/netplan/50-cloud-init.yaml <<EOF
network:
    ethernets:
        default:
            dhcp4: true
            match:
                macaddress: 52:54:00:80:21:43
        extra0:
            addresses: [10.177.72.201/24]
            gateway4: 10.177.72.1
            nameservers:
               addresses: [168.95.1.1, 8.8.8.8]
            match:
                macaddress: 52:54:00:7b:cb:9d
    version: 2
EOF

$ multipass restart f103
$ multipass list
Name                    State             IPv4             Image
f101                    Running           10.177.72.27     Ubuntu Core 18
f102                    Running           10.177.72.32     Ubuntu Core 18
f103                    Running           10.177.72.28     Ubuntu Core 18
                                          10.177.72.201
```

TODO

- 採用同一個 mpbr0 的 gateway 出不去 ?
- microk8s 

- [Getting started with MicroK8s on Ubuntu Core | Ubuntu](https://ubuntu.com/tutorials/getting-started-with-microk8s-on-ubuntu-core#3-install-microk8s-on-ubuntu-core)
- [Is it possible to install microk8s on ubuntu core? · Issue #2053 · ubuntu/microk8s](https://github.com/ubuntu/microk8s/issues/2053)


```sh
cat <<EOF > cloud-config.yaml
apt_update: true
apt_upgrade: true
runcmd:
- snap install microk8s --channel=latest/edge/strict
- usermod -a -G microk8s ubuntu
- iptables -P FORWARD ACCEPT
EOF

multipass launch core18 --name k99vm --mem 2G --disk 10G --cloud-init cloud-config.yaml
```

block storage 

- [Additional disk device (/dev/sdb) on Multipass instance · Issue #2303 · canonical/multipass](https://github.com/canonical/multipass/issues/2303)
- [Allow additional disks · Issue #135 · canonical/multipass](https://github.com/canonical/multipass/issues/135)
- [Support adding host devices to instances · Issue #1897 · canonical/multipass](https://github.com/canonical/multipass/issues/1897)


# Vagrant

[Vagrant by HashiCorp](https://www.vagrantup.com/)