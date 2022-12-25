# deno and web

# 101 🦕 preact and twind

- 參考 How to Render React SSR with Deno and Deno Deploy https://strapi.io/blog/rendering-react-ssr-with-deno-and-deno-deploy
- 新的輕量版 Server side rendering with JSX : A HTTP server that renders a HTML page on the server with JSX (using Preact).
- Improve async handling · Issue #30 · preactjs/preact-render-to-string https://github.com/preactjs/preact-render-to-string/issues/30
- The Shim | Twind https://twind.dev/handbook/the-shim.html

```sh
# deno run -A d101.tsx
docker compose -f docker-compose.101.yaml up
```

# 102 🐿️ oak

特定框架可以加快開發不用自寫路由，但是有相依或是版本太舊問題，例如 std/http 用的版本可能有差異。

- oakserver/oak: A middleware framework for handling HTTP with Deno https://github.com/oakserver/oak

```sh
deno run -A d102.tsx
```

# 103 sift

另一種簡化版本，可以參考其寫法。

- satyarohith/sift: Sift is a routing and utility library for Deno Deploy. https://github.com/satyarohith/sift
- HTTP Frameworks | Deploy Docs https://deno.com/deploy/docs/resources-frameworks#sift

# 104 router

只有路由其他自理。

- https://crux.land/router@0.0.5

# 105 rutt (fresh router)

fresh 使用的路由。

- denosaurs/rutt: 🛣️ A tiny and fast http request router designed for use with deno and deno deploy https://github.com/denosaurs/rutt
- test code https://github.com/denosaurs/rutt/blob/main/test.ts
- https://github.com/denoland/fresh/blob/08d43803f799232853384311823adcd1a1638559/src/server/deps.ts#L20
- Why rutt? · Issue #909 · denoland/fresh https://github.com/denoland/fresh/issues/909
- delvedor/router-benchmark: Benchmark of the most commonly used http routers https://github.com/delvedor/router-benchmark
