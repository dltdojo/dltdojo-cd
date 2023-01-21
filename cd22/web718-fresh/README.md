# Fresh 

- denoland/fresh: The next-gen web framework. https://github.com/denoland/fresh

# 101 🐿️ create a project

- https://fresh.deno.dev redirect to https://deno.land/x/fresh@1.1.2/init.ts
- 雖然第一次需要下載，但是除非在 docker compose rm 不然之前的下載不須重新再下載一次。
- 開發使用 deno task start
- 容器測試開發使用 watchexec -w d101 --restart -- docker compose -f docker-compose.101.yaml restart
- 容器掛載唯讀

```sh
# deno run -A -r https://fresh.deno.dev d101
docker compose -f docker-compose.101.yaml up
```

# 102 🍵 deno cache

- 其 import_map.json 為動態產生需要手動複製到 Dockerfile https://github.com/denoland/fresh/blob/cdf0c11f6555beb32d0df24f0de04383ca061c54/init.ts#L87
- 或是直接於 Dockerfile 內建置一個空的專案當快取。這個方法會出現 deno.lock 問題，因為開發本機與 docker 內有部份檔案會有差距。
  - https://esm.sh/*preact-render-to-string@5.2.4 這個檔案同一版本卻會出現 hash 差異，代表每次下載都會改版。
  - esm 定義為  mark all dependencies as external by adding * prefix before the package name
  - esm 內外必須是同一個 pin v99 版本 https://esm.sh/#use-cli-script
- docker 快取環境需要個別匯入，沒有一個單一檔案可用需要自己刻 deps.ts，一開始依據 import_map.json 部份會發現還是出現沒快取到，導致出現 download 的訊息，這時須再一一添加到 dockerfile 裡面。
- 有些匯入是依據環境狀態動態匯入，例如 DENO_DEPLOYMENT_ID 這個變數 https://github.com/denoland/fresh/blob/cdf0c11f6555beb32d0df24f0de04383ca061c54/src/server/context.ts#L89
  - 如果是開發型就必須再加加上 import "$fresh/src/runtime/main_dev.ts";
- 使用權限部份必須執行才能發現哪裡不通需要個別開啟。例如 /root/.cache/esbuild/bin/esbuild-linux-64@0.14.51 這類的路徑，不建議 --allow-run 直接全部開啟。
- 參考用，後續使用 104 作法

```sh
docker compose -f docker-compose.102.yaml up
```

# 103 🚲 init fresh

- 使用客製 init103.ts 來生成框架檔案

```sh
# mkdir d103
# deno run -A init103.ts d103
# cd d103 ; deno cache main.ts ; cd ..
docker compose -f docker-compose.103.yaml up
```

# 104 🚲 init page and Dockerfile

- 使用客製設定檔 init-tpl-104.ts 來生成框架檔案。
- routes 精簡
- 新增 Dockerfile 與 docker-compose.yaml
- 快取所需 import_map.json 利用 init.ts 來生成 

```sh
mkdir d104
deno run -A init104.ts d104
cd d104
deno cache main.ts
docker compose up
```

# 105 mock-file (X)

- 可以 readfile 但無法 import 無法用在生成 fresh
- deno sqlite error logs Deno.openSync is not function · Issue #136 · denoland/deploy_feedback https://github.com/denoland/deploy_feedback/issues/136
- ayame113/mock-file: Synchronous file system API polyfill for deno deploy. https://github.com/ayame113/mock-file

```sh
deno run --allow-read d105.ts
```