# WIP: YiTian0x Istio

任務

- T1 建立一個 kubernetes cluster 與安裝 istio 並串連兩個服務與發行適合之 https tls 憑證。

# T1 istio secure gateway

完成後測試用連結，與 [Istio / Secure Gateways](https://istio.io/latest/docs/tasks/traffic-management/ingress/secure-ingress/) 差異在於使用 openssl 和 cert-manager 來產生憑證的差異。

針對 istio 服務的觀察與概念理解，建議安裝 prometheus 與 kiali 服務有很大幫助。

- https://httpbin-127-0-0-1.nip.io:9443
- https://nginx-127-0-0-1.nip.io:9443

安裝 istio 與 k3d 以及相關服務

```sh
$ k3d version
k3d version v5.1.0
k3s version v1.21.5-k3s2 (default)

$ k3d cluster create foo2021 --api-port 6550 -p "9443:443@loadbalancer" --agents 2 --k3s-arg '--disable=traefik@server:*'
$ istioctl install --set profile=default -y

$ kubectl label namespace default istio-injection=enabled
$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.12/samples/addons/prometheus.yaml
$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.12/samples/addons/kiali.yaml
$ kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.6.1/cert-manager.yaml
$ istioctl dashboard kiali
```

建立剩下的 k8s 的資源 yaml 檔案，除 k8s 資源之外新增下面兩種 api 各兩種 kind：

- networking.istio.io/v1beta1
  - Gateway
  - VirtualService
- cert-manager.io/v1
  - ClusterIssuer
  - Certificate

資源都安裝在 namespace: default，但 ingressgateway 的憑證安裝在 namespace: istio-system ，所以不只是 credentialName: ingress-cert-foo 要對上 secretName: ingress-cert-foo，還要注意 namespace。

```
$ cat > istio-tls-example.yaml <<\EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: ingress-cert-foo
  namespace: istio-system
spec:
  secretName: ingress-cert-foo # must be the same as credentialName in gateway.yaml
  isCA: false
  privateKey:
    algorithm: ECDSA
    size: 256
  commonName: "*.local"
  subject:
    countries: 
      - TW
    organizations:
      - DEV
      - FOO
    organizationalUnits:
      - K8S
      - ETH
  duration: 2160h0m0s # 90d
  renewBefore: 360h0m0s # 15d
  dnsNames:
    - "*.local"
    - "*.nip.io"
  ipAddresses:
    - 0.0.0.0
    - 127.0.0.1
  issuerRef:
    name: selfsigned-issuer
    kind: ClusterIssuer
---
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: mygateway
spec:
  selector:
    istio: ingressgateway # use istio default ingress gateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        minProtocolVersion: TLSV1_2
        credentialName: ingress-cert-foo # must be the same as secretName in cert.yaml
      hosts:
        - "*.nip.io"
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: httpbin
spec:
  hosts:
    - "httpbin-127-0-0-1.nip.io"
  gateways:
    - mygateway
  http:
    - route:
        - destination:
            port:
              number: 8000
            host: httpbin
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: nginx
spec:
  hosts:
    - "nginx-127-0-0-1.nip.io"
  gateways:
    - mygateway
  http:
    - route:
        - destination:
            port:
              number: 80
            host: nginx
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  ports:
    - name: http-web
      port: 80
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
      version: v1
  template:
    metadata:
      labels:
        app: nginx
        version: v1
    spec:
      containers:
        - image: nginx
          imagePullPolicy: IfNotPresent
          name: nginx
          ports:
            - containerPort: 80
          resources: {}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: httpbin
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
    service: httpbin
spec:
  ports:
    - name: http
      port: 8000
      targetPort: 80
  selector:
    app: httpbin
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
      version: v1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      serviceAccountName: httpbin
      containers:
        - image: docker.io/kennethreitz/httpbin:latest
          imagePullPolicy: IfNotPresent
          name: httpbin
          ports:
            - containerPort: 80
          resources: {}
EOF

$ kubectl apply -f istio-tls-example.yaml
$ curl -kv https://httpbin-127-0-0-1.nip.io:9443/status/418
$ curl -kv --http2 https://nginx-127-0-0-1.nip.io:9443
```

測試完畢可直接 ```k3d cluster delete foo2021``` 或是保留後面練習環境使用。

- [k3d](https://k3d.io/v5.1.0/)
- [Istio / Getting Started](https://istio.io/latest/docs/setup/getting-started/)
