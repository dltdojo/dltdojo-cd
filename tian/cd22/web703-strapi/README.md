# strapi

strapi/documentation: Strapi Documentation mono-repo https://github.com/strapi/documentation

# 101 🍪 static vs dynamic

headless cms 不是很容易理解 strapi 其功用，核心的部份是可在網頁訂製 API 而不須改版。

在 Admin Panel 定義的 model（Content Type）以及欄位都會有相對的 JSON 定義檔產生，這樣的好處是可以讓欄位定義檔本身也被 Git 管理，這也才有辦法讓其他的程式邏輯（如 controller）和 model 一同接受版控的管理。



- 使用 yarn create strapi-app 安裝
- yarn start 為無法新增 API，要可以新增必須使用 yarn develop 啟動。
- Introducing the API Documentation (Swagger) Plugin https://strapi.io/blog/api-documentation-plugin
- http://localhost:1337

```sh
docker compose -f docker-compose.101.yaml up
```

- 新增 student 後除了資料庫異動寫入，還有 src 區檔案被寫入新檔與改寫，注意下面列表的時間差距。
- 主要新增在 /api/student 目錄，其中還有該 api 的 openapi 規格。 
- strapi develop 模式會持續改寫 src 區而 strapi start 模式無新增 API 區只有瀏覽區
- develop 的 src 區非原始佈署版本，須使用 git 來保存新版本，這功能偏向給開發者用
- 如果一直將 develop 模式開著給一般使用者使用，除了持續 git push 新版之外，還有哪些需要考量？


```sh
/app # ls -alh src
total 32K    
drwxr-sr-x    1 root     root        4.0K Dec 21 03:49 .
drwxr-xr-x    1 root     root        4.0K Dec 21 04:18 ..
drwxr-sr-x    2 root     root        4.0K Dec 21 03:49 admin
drwxr-sr-x    1 root     root        4.0K Dec 21 04:18 api
drwxr-sr-x    1 root     root        4.0K Dec 21 04:16 extensions
-rw-r--r--    1 root     root         481 Dec 21 03:49 index.js
/app # ls -alh src/api
total 16K    
drwxr-sr-x    1 root     root        4.0K Dec 21 04:18 .
drwxr-sr-x    1 root     root        4.0K Dec 21 03:49 ..
-rw-r--r--    1 root     root           0 Dec 21 03:49 .gitkeep
drwxr-sr-x    7 root     root        4.0K Dec 21 04:18 student
/app # ls -alh src/api/student
total 28K    
drwxr-sr-x    7 root     root        4.0K Dec 21 04:18 .
drwxr-sr-x    1 root     root        4.0K Dec 21 04:18 ..
drwxr-sr-x    3 root     root        4.0K Dec 21 04:18 content-types
drwxr-sr-x    2 root     root        4.0K Dec 21 04:18 controllers
drwxr-sr-x    3 root     root        4.0K Dec 21 04:18 documentation
drwxr-sr-x    2 root     root        4.0K Dec 21 04:18 routes
drwxr-sr-x    2 root     root        4.0K Dec 21 04:18 services
/app # ls -alh src/api/student/documentation/1.0.0/student.json 
-rw-r--r--    1 root     root       11.8K Dec 21 04:18 src/api/student/documentation/1.0.0/student.json
/app # cat src/api/student/documentation/1.0.0/student.json 
{
  "/students": {
    "get": {
      "responses": {
        "200": {
          "description": "OK",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/StudentListResponse"
              }
            }
          }
        },
...
/app # ls -alh src/extensions
total 28K    
drwxr-sr-x    1 root     root        4.0K Dec 21 04:16 .
drwxr-sr-x    1 root     root        4.0K Dec 21 03:49 ..
-rw-r--r--    1 root     root           0 Dec 21 03:49 .gitkeep
drwxr-sr-x    4 root     root        4.0K Dec 21 04:17 documentation
drwxr-sr-x    3 root     root        4.0K Dec 21 04:16 email
drwxr-sr-x    3 root     root        4.0K Dec 21 04:16 upload
drwxr-sr-x    3 root     root        4.0K Dec 21 04:16 users-permissions
```

# 102 🌸 git and src

- strapi develop 模式新增 api
- 利用 git status --porcelain 監視定期更新被 strapi admin 界面新增或修改的程式碼。
- strapi http://localhost:1337
- gitweb http://localhost:9080
- git instaweb 與 git http-backend 做在同一個容器啟動兩個服務一個庫。
  - port 1234 : git instaweb
  - port 80 : lighttpd
  - git remote add upstream101 http://githttp101:80/git/foo
- strap generate 需要互動

```sh
docker compose -f docker-compose.102.yaml up
```


# 103 📪 traefik proxy

- Traefik StripPrefix Documentation - Traefik https://doc.traefik.io/traefik/middlewares/http/stripprefix/
- strapi http://strapi.localhost:8700/admin/
- gitweb http://gitweb.localhost:8700/

```sh
# cat d103.sh | sh
docker compose -f docker-compose.103.yaml up
```


# TODO

- Hyprtxt/fresh-strapi.deno.dev https://github.com/Hyprtxt/fresh-strapi.deno.dev