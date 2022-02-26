[Quick Start - Argo Workflows - The workflow engine for Kubernetes](https://argoproj.github.io/argo-workflows/quick-start/)

```
kubectl create ns argo
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/quick-start-postgres.yaml
kubectl -n argo port-forward deployment/argo-server 2746:2746
```

This will serve the user interface on https://localhost:2746

一開始先下載配置工具並存放到 s3，後續使用工具時不需要反覆下載花時間。不過執行檔是否可以轉掛使用與當時編譯狀態有關，很多安裝型程式與動態連結有關無法搬移，另外還有基本憑證需要配置的問題。

使用 [GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless) 的 ```gcr.io/distroless/static-debian11:debug``` 有帶 shell 可作下載安裝使用。

樣板工作流可以擴大應用到下載各種版本的 kubectl，一次性的 artifacts-tools-s3 無法重複使用

實做一個下載樣板 wft-save-s3 內有各種下載樣板，可以用來單獨實現如 s3-kubectl-v1.23.0.yaml，也可組合成 s3-kubectl-curl.yaml 來組合成類似 artifacts-tools-s3.yaml 功能。

參考資料

[雲原生流水線 Argo Workflow 的安裝、使用以及個人體驗 | IT人](https://iter01.com/583436.html)
