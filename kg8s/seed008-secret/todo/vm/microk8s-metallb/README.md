# microk8s metallb ingress

[Is it possible to install microk8s on ubuntu core? · Issue #2053 · ubuntu/microk8s](https://github.com/ubuntu/microk8s/issues/2053)

```
$ EXT_IP=192.168.17.23
$ sudo snap install microk8s --channel=1.22/stable --classic
$ microk8s enable metallb:${EXT_IP}-${EXT_IP}
$ microk8s enable ingress
$ microk8s kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: ingress
  namespace: ingress
spec:
  selector:
    name: nginx-ingress-microk8s
  type: LoadBalancer
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 80
EOF

$ microk8s kubectl describe cm config -n metallb-system
Name:         config
Namespace:    metallb-system
Labels:       <none>
Annotations:  <none>

Data
====
config:
----
address-pools:
- name: default
  protocol: layer2
  addresses:
  - 192.168.17.23-192.168.17.23


BinaryData
====

Events:  <none>

joyelin:microk8s-metallb$ microk8s kubectl get service -A
NAMESPACE   NAME         TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)        AGE
default     kubernetes   ClusterIP      10.152.183.1    <none>            443/TCP        68s
ingress     ingress      LoadBalancer   10.152.183.66   192.168.17.23   80:32417/TCP   19s

joyelin:microk8s-metallb$ microk8s kubectl get pods -A
NAMESPACE        NAME                                       READY   STATUS    RESTARTS   AGE
kube-system      calico-node-c8b6x                          1/1     Running   0          114s
metallb-system   speaker-fbdcb                              1/1     Running   0          90s
ingress          nginx-ingress-microk8s-controller-slk9q    1/1     Running   0          80s
metallb-system   controller-76cdd74b97-8k5ft                1/1     Running   0          90s
kube-system      calico-kube-controllers-57d8f6f6b4-gfr7b   1/1     Running   0          114s

$ curl -v http://${EXT_IP}

*   Trying 192.168.17.23:80...
* Connected to 192.168.17.23 (192.168.17.23) port 80 (#0)
> GET / HTTP/1.1
> Host: 192.168.17.23
> User-Agent: curl/7.80.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Date: Wed, 26 Jan 2022 00:45:40 GMT
< Content-Type: text/html
< Content-Length: 146
< Connection: keep-alive
< 
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

# microk8s metallb istio gateway

```sh
$ EXT_IP=192.168.17.23
$ sudo snap install microk8s --channel=1.22/stable --classic
$ microk8s enable dns
$ microk8s config > ~/.kube/config
$ istioctl install -y
$ microk8s enable metallb:${EXT_IP}-${EXT_IP}
$ microk8s kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: bookinfo-gateway
spec:
  selector:
    istio: ingressgateway # use istio default controller
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: bookinfo
spec:
  hosts:
  - "*"
  gateways:
  - bookinfo-gateway
  http:
  - route:
    - destination:
        host: productpage
        port:
          number: 9080
EOF

$ microk8s kubectl get services -A
NAMESPACE      NAME                   TYPE           CLUSTER-IP       EXTERNAL-IP       PORT(S)                                      AGE
default        kubernetes             ClusterIP      10.152.183.1     <none>            443/TCP                                      5m10s
kube-system    kube-dns               ClusterIP      10.152.183.10    <none>            53/UDP,53/TCP,9153/TCP                       4m46s
istio-system   istiod                 ClusterIP      10.152.183.193   <none>            15010/TCP,15012/TCP,443/TCP,15014/TCP        4m13s
istio-system   istio-ingressgateway   LoadBalancer   10.152.183.183   192.168.17.23   15021:32099/TCP,80:30305/TCP,443:32052/TCP   3m14s

$ microk8s kubectl get pods -A
NAMESPACE        NAME                                       READY   STATUS    RESTARTS   AGE
kube-system      calico-node-mzpl8                          1/1     Running   0          5m41s
kube-system      calico-kube-controllers-7b96cc9cb8-zn666   1/1     Running   0          5m40s
kube-system      coredns-7f94f9b5f6-w8hmz                   1/1     Running   0          5m22s
istio-system     istiod-576d9f454-v9r8q                     1/1     Running   0          4m8s
istio-system     istio-ingressgateway-88cc46fd6-ncg5q       1/1     Running   0          3m51s
metallb-system   speaker-ggl4l                              1/1     Running   0          3m2s
metallb-system   controller-76cdd74b97-hbpb8                1/1     Running   0          3m2s

$ curl -v http://${EXT_IP}

*   Trying 192.168.17.23:80...
* Connected to 192.168.17.23 (192.168.17.23) port 80 (#0)
> GET / HTTP/1.1
> Host: 192.168.17.23
> User-Agent: curl/7.80.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 503 Service Unavailable
< date: Wed, 26 Jan 2022 02:10:54 GMT
< server: istio-envoy
< content-length: 0
< 
* Connection #0 to host 192.168.17.23 left intact

```