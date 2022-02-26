# seed003-ctl

注意：這版無權限控制只能用於內部練習，不可改為對外服務。

- https://my-nginx.127.0.0.1.nip.io:9443
- istio addon metrics
  - https://kiali-istio-system.127.0.0.1.nip.io:9443
  - https://grafana-istio-system.127.0.0.1.nip.io:9443
  - https://prometheus-istio-system.127.0.0.1.nip.io:9443
  - https://tracing-istio-system.127.0.0.1.nip.io:9443


```sh
$ bash init.sh -n foo2021
```

cleanup

```sh
$ k3d cluster delete foo2021
$ sudo rm -rf $HOME/k3dvol/foo2021
```