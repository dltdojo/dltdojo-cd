# web authentication and authorization (authnz)

HTTP is stateless, but not sessionless

> HTTP is stateless: there is no link between two requests being successively carried out on the same connection. This immediately has the prospect of being problematic for users attempting to interact with certain pages coherently, for example, using e-commerce shopping baskets. But while the core of HTTP itself is stateless, HTTP cookies allow the use of stateful sessions. Using header extensibility, HTTP Cookies are added to the workflow, allowing session creation on each HTTP request to share the same context, or the same state. 


- An overview of HTTP - HTTP | MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#http_is_stateless_but_not_sessionless
- A typical HTTP session - HTTP | MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Session
- HTTP authentication - HTTP | MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
- Using HTTP cookies - HTTP | MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

# 101 🍒 form

- 前端純 HTML 無 javascript，過程 form action 觸發。
- 後端使用 deno oak 方便後續佈署到 deno deploy。
- 會期內容存在記憶體，使用 cookie 做會期識別但無會期內容。
- 使用者資料存在記憶體。
- http://localhost:8901/

```sh
# deno run -A --watch d101-authn.ts
docker compose -f docker-compose.101.yaml up
```

# 102 🚲 javascript

- 改用 javascript 與標準 webapi fetch() 與後端互動。
- 會期與使用者資料都存在記憶體。
- http://localhost:8901/

```sh
# deno run -A --watch d102-authn.ts
docker compose -f docker-compose.102.yaml up
```

# 103 🎄 renders the HTML page on the server with JSX

oak 版本

```sh
deno run -A --watch d103-authn.tsx
```

# 104 🐿️ deno http router

去除 oak 換成原始版加 rutt，session 放記憶體。

```sh
deno run -A d104.tsx
```

# 105 🦕 jwt session

- timonson/djwt: Create and verify JSON Web Tokens (JWT) with Deno or the browser. https://github.com/timonson/djwt

```sh
# deno run -A --watch d105.tsx
docker compose -f docker-compose.105.yaml up
```

# TODO

- webassembly service the static html and base64url ?