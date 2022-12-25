# online js editor

直接使用瀏覽器的開發者工具可以執行 javascript 但不夠友善，很難編輯個別 function 再執行，這裡使用類似 JSFiddle 與 CodePen 類工具。單獨執行 javascript 可參考 Math.random() - JavaScript | MDN
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

# 101 🦕 iframe live editor

- http://localhost:8300
- sauravhathi/live-html-editor: Live HTML Editor is a simple HTML editor that allows you to write HTML code and see the result in real time.
https://github.com/sauravhathi/live-html-editor

```sh
# docker run -i --init --rm -p 8300:3000 -v $PWD/d101.html:/app/index.html busybox:1.35.0 sh -c 'cd /app && busybox httpd -fv -p 3000'
docker compose -f docker-compose.101.yaml up
```

# 102 🐐 online live editor

採用一檔佈署到 deno deploy 方式取得 https 的 url 供其他使用者存取利用，不需要都開須安裝與開啟 docker 來使用。

- https://blackpink-cd22-web521-d102.deno.dev/

```sh
# deno run -A --watch d102.ts
docker compose -f docker-compose.102.yaml up
```

# 103 🎄 import html template

改成樣板類型方便置入新的 javascript 區塊。

```sh
# deno run -A --watch d103.ts
docker compose -f docker-compose.103.yaml up
```

# 104 🐿️ import live code js

- 直接將樣板套用與啟動都轉給匯入模組提供。
- CSS 從 Tailwind 換成 Twind https://twind.dev/

```sh
# deno run -A --watch d104.ts
docker compose -f docker-compose.104.yaml up
```

可以改寫成為直接匯入線上模組的版本。

```js
import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d104-mod.ts";
```

# 105 🍟 one docker compose yaml

- 一檔到底沒有本機掛載。
- 不支援 url 下載 [Request: Add docker-compose file for streamlined setup · Issue #31 · vogler/free-games-claimer](https://github.com/vogler/free-games-claimer/issues/31)
- [Use docker compose config from file and stdin - Stack Overflow](https://stackoverflow.com/questions/53695725/use-docker-compose-config-from-file-and-stdin)


```sh
# docker compose -f docker-compose.105.yaml up
curl https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/docker-compose.105.yaml | docker compose -f - up
```

如果不嵌入預設的複雜 HTML 範例可簡化。從 deno 的 stdin 傳入。

```sh
deno run --allow-net - <<EOF
import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d104-mod.ts";
await AppListen('<h1>hello</h1><script>console.log(Date())</script>');
EOF
```

或是不須安裝 deno 直接使用 docker compose，兩層 stdin 輸入，只是這種作法每次都要下載一次花時間，只適合用來作簡易的測試。

```sh
docker compose -f - up <<\EOF
version: "3.8"
services:
  deno104:
    image: denoland/deno:1.29.1
    command:
      - sh
      - -c 
      - |
        deno run --allow-net - <<\EOOF
        import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d104-mod.ts";
        await AppListen('<h1>hello</h1><script>console.log(Date())</script>');
        EOOF
    ports:
      - 8300:3000
EOF
```


# 106 🍳 sha1

- crypto.subtle.digest 範例，同時將編輯區加寬，這編輯器主要做瀏覽器端的 javascript 簡易測試，不是以編輯版面 HTML/CSS 為主要目的。
- SubtleCrypto.digest() - Web APIs | MDN https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
- NIST宣布美國聯邦政府2030年12月31日後停用SHA-1加密演算法 | iThome https://www.ithome.com.tw/news/154769
- 改成多版面型態如 https://blackpink-cd22-web521.deno.dev/d106
- http://localhost:3000/d106

```sh
docker compose -f docker-compose.106.yaml up
```


# 107 🌤️ JWT (X)

- http://localhost:3000/d107
- https://github.com/timonson/djwt
- Loading module from “https://deno.land/x/djwt@v2.8/mod.ts” was blocked because of a disallowed MIME type (“application/typescript”).
- Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://deno.land/x/djwt@v2.8/mod.ts. (Reason: CORS request did not succeed). Status code: (null).
- 測試 jwt 在瀏覽器中，無法直接匯入 typescript 需要轉換類似 fresh 的服務端 bundles are generated with esbuild JIT 作法。
- https://github.com/denoland/fresh/blob/885d71d8239eaa58c5bba8f9b573d141edacdb2c/src/server/bundle.ts#L87


```sh
deno run -A --watch d107.ts
```

