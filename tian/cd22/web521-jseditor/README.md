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

# 104 🎄 import live code js

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
