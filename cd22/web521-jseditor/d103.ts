import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { LIVE_HTML_CODE_TPL } from "./d103-tpl.ts";

// 直接匯入線上版本
// import { LIVE_HTML_CODE_TPL } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d103-tpl.ts";

// __TPL__INIT__JAVASCTIPT__

const JS_HERE = `<!DOCTYPE html>
<html>
<body>
<h2>JavaScript Demo 103</h2>
<button type="button" onclick="foo()">DateTime&Random</button>
<p id="demo"></p>
<script>
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function foo(){
    let dstr = Date();
    document.getElementById('demo').innerHTML = 
     \`Date is \${dstr} and random is \${getRandomInt(3999)}\`;
}
</script>
</body>
</html>`

const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = LIVE_HTML_CODE_TPL.replace('__TPL__INIT__JAVASCTIPT__',JS_HERE);
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  (e) => console.log("Listening on http://localhost:3000"),
);
await app.listen({ port: 3000 });