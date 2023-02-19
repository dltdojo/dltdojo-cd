# Name Service

# 101 Local dev name service

開發時最佳的形式是內外都一致，以 kubernetes 內網服務名稱作最方便，網域名稱對於許多內部對內外服務都有關，如果是公開的名稱服務還好，開發者與內部服務都是對外一致，如果是內部交互服務，就會出現名稱不一致形式，這種問題在 OAuth 鑑別時因為流程複雜更容易出錯。

最常見需要指定內部服務的範例為資料庫的瀏覽器。

首先是任意指定版本 xxx.dev101

- postgres:
  - host:port at host network : http://localhost:5433
  - (填入 adminer 界面) host:port at docker inside network : http://pg101.dev101:5432
- adminer:
  - (瀏覽入口) url at host network : http://localhost:8091
  - url at docker inside network : http://adminer.dev101:8080

```sh
docker compose -f d101.yaml up
```

再來是與 kubernets 同類版本 xxx.ns101.svc，同時 port 也一致。

- postgres:
  - host:port at host network : http://localhost:5432
  - (填入 adminer 界面) host:port at docker inside network : http://pg101.ns101.svc:5432
- adminer:
  - (瀏覽入口) url at host network : http://localhost:8091
  - url at docker inside network : http://adminer.ns101.svc:8091

```sh
docker compose -f d102.yaml up
```

再來的目標是內外 host:port 一致。這時不是改 docker compose yaml 可以達成，docker 外部宿主的部份需要手動修改 /etc/hosts 來完成。

- postgres:
  - host:port at host network : http://pg101.ns101.svc:5432
  - (填入 adminer 界面) host:port at docker inside network : http://pg101.ns101.svc:5432
- adminer:
  - (瀏覽入口) url at host network : http://adminer.ns101.svc:8091
  - url at docker inside network : http://adminer.ns101.svc:8091

```sh
cat /etc/hosts | grep svc
127.0.0.1 pg101.ns101.svc
127.0.0.1 adminer.ns101.svc
```

這方式比較麻煩需要宿主機修改檔案完成。修改完之後宿主機程式與容器網內程式都會共用同一個 host:port 這樣作可以省去許多複雜服務交互流程設定名稱的困難。特別是 OAuth2/OIDC 這類交互流複雜的應用。

問題是需要每次新服務都設定，服務太多可以考慮使用 dnsmasq 服務。

[unix - In my /etc/hosts/ file on Linux/OSX, how do I do a wildcard subdomain? - Server Fault](https://serverfault.com/questions/118378/in-my-etc-hosts-file-on-linux-osx-how-do-i-do-a-wildcard-subdomain)

一般如果只是對外可以考慮使用如 [Public DNS Pointing to localhost (127.0.0.1)](https://gist.github.com/tinogomes/c425aa2a56d289f16a1f4fcb8a65ea65) 如 nip.io, xip.io 等，只是這類服務將 pg101.127.0.0.1.nip.io 轉成 127.0.0.1 服務對於內部 adminer 來說沒用。
