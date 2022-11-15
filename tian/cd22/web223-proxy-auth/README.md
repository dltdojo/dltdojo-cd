# 101 Traefik ForwardAuth

使用 javascript 實做鑑別 Auth 服務來覆蓋到無鑑別 Auth 的兩個 http 服務，只鎖定 /foo.html 資源路徑，使用者鑑別無實做無檢查。

- 使用代理轉接並轉發鑑別 Auth 的需求 [Traefik ForwardAuth Documentation - Traefik](https://doc.traefik.io/traefik/middlewares/http/forwardauth/)
- box1 原無 Auth 授權 http 服務
  - 200 OK http://localhost:8700/box1/foo.html
  - 403 http://localhost:8700/box1/
  - http://box1.localhost:8700/
- box2 原無鑑別授權 http 服務 
  - http://localhost:8700/box2/
  - http://box2.localhost:8700/


# 102 Open Policy Agent(OPA) Server Mode

授權決策如果每個服務不易實現一致的規範，可集中一處來管理這些權限的設定，好處是不須一個個服務修改設定。[open-policy-agent/opa: An open source, general-purpose policy engine.](https://github.com/open-policy-agent/opa) 提供這種功能，其政策語言針對輸入的資料物件來確認是否符合政策。

政策範例：

```rego
package test
p {
    input.foo == "bar"
}
```

資料範例：

```json
{
  "input" : { "foo": "bar" }
}
```

local opa eval

```sh
docker run -i --init --rm --entrypoint=sh openpolicyagent/opa:0.46.1-debug <<EOF
cat > policy.rego <<EOOF
package policy101
default hello := false
hello {
    input.foo == "bar"
}
EOOF
cat > data.json <<EOOF
{ "foo": "bar" }
EOOF
echo "=== data.policy101 ==="
opa eval --data policy.rego --input data.json "data.policy101"
opa eval --data policy.rego --input data.json --format raw "data.policy101"
echo "=== data.policy101.hello ==="
opa eval --data policy.rego --input data.json "data.policy101.hello"
opa eval --data policy.rego --input data.json --format raw "data.policy101.hello"
EOF
```

opa eval output

```
=== data.policy101 ===
{
  "result": [
    {
      "expressions": [
        {
          "value": {
            "hello": true
          },
          "text": "data.policy101",
          "location": {
            "row": 1,
            "col": 1
          }
        }
      ]
    }
  ]
}
{"hello":true}
=== data.policy101.hello ===
{
  "result": [
    {
      "expressions": [
        {
          "value": true,
          "text": "data.policy101.hello",
          "location": {
            "row": 1,
            "col": 1
          }
        }
      ]
    }
  ]
}
true
```

OPA 的 HTTP 確認需要提供 POST JSON，只是 Traefik ForwardAuth 這種加在 ```x-forwarded-uri``` 用 GET 的無法直接存取，這代表需要將 http header 再轉接 http body-json，這也是其需要 envoy 的原因。這裡將 GET_HTTP_HEADER_COOKIE to POST_HTTP_BODY_JSON to OPA_HTTP_AUTH 部份還是用簡單 javascript 實現。

OPA 不是專為 HTTP 設計所以沒有辦法應用到 HTTP header 區都是需要進去 HTTP Body 區，所以即使 OPA 的 HTTP REST API 查詢回傳 200 OK 也只是代表查詢的決策執行過程有進行完成，實際的內容如 allow 結果還是要從 Body 解開 ```{ result: { allow: false }, warning: {}``` 去查才知道。

另外新增一個具有 chai 的 assert 測試 http response status 版本，可以用來跟 curl 比較，如果 curl 要測試 http status 相對不易，因為還要解析處理。

經過 deno101 這一轉效率比不上 envoy-grpc-opa 因為 envoy 與 opa 之間可以走 grpc，不過要加上 envoy 相對複雜。

要使用遠端查符合政策需要注意與直接 ```opa eval``` 差異。遠端的endpoint所在位置與寫的rego內的package有關，而且還需要前置版本等，說明的文件位置不是很清楚。再來是回傳的 json 格式與 opa eval 也有點差異，回傳會放在 result 下。另外傳到 /v1/data/xxx/yyy 轉成字串的 JSON 裡面要 key 加上 input，否則格式不對都是查核不過，這個輸入格式部份與使用 opa eval 或是 opa-wasm 有差異。

參考 HTTP POST 查詢合規[格式與過程的python](https://github.com/open-policy-agent/contrib/blob/1ca4e5400e0697f85cab799eaef8db6d87ebd2b7/api_authz/docker/echo_server.py#L20)，改成 js 格式如下。

```js
const input = {
  method: req.method,
  path: url.pathname,
  X_FORWARDED_URI: req.headers.get("x-forwarded-uri"),
};
const body = JSON.stringify({input});
const resp = await fetch("http://opa101:8181/v1/data/httpapi/authz", {
  method: "POST",
  headers: {"Content-Type": "application/json",},
  body,
});
```

# 103 OPA WebAssembly Mode

相較於 102 方式將資料送出去等「遠端」檢查是否可通過查核符合政策，也可以在「本地」執行確認下載政策後本地查核，在 go library、rest service 與 WASM 三種政策檢核模式下，在 javascript 端執行可採用 WASM 模式。參考[npm-opa-wasm/examples/deno at main · open-policy-agent/npm-opa-wasm](https://github.com/open-policy-agent/npm-opa-wasm/tree/main/examples/deno)作法，並改為雙遠端載入模式，一個是 opa 一個是自定義政策都是遠端下載。

# 104 Traefik ForwardAuth and OPA WASM

將標籤打上去從外面確認只有 box1/foo.html 資源可讀取。

- 200 OK http://localhost:8700/box1/foo.html
- 403 Forbidden http://localhost:8700/box1/

內部分成兩種確認方式，一種是直接找檢核的 deno101 看是否有通，另一種找內部的 traefik 來模擬代理行為，只是後面的作法需要加上適當的 Host 來模擬從外面環境存取的瀏覽器發送之 http header。

# 105 TLS

104 將 busybox httpd 的資源管制切分到 traefik 的 forwaredauth 功能結合 opa，這個範例使用代理的外部 https 來轉接進入裡面的 http 服務。 

# TODO

# Valut Auth Token

使用者鑑別採用 Vault token 權杖，提供頁面將登入鑑別權杖寫入到 cookie 內。

# OPA 

OPA 高效但 Rego 難寫難懂難維護。

- [traefik-opa-plugin/deployment/local/opa at main · team-carepay/traefik-opa-plugin](https://github.com/team-carepay/traefik-opa-plugin/tree/main/deployment/local/opa)
- [Open Policy Agent | Documentation](https://www.openpolicyagent.org/docs/latest/)
- [Traefik Enterprise Operations: OPA - Traefik Enterprise](https://doc.traefik.io/traefik-enterprise/operations/opa/opa-guide/)