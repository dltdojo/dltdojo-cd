//
// 直接匯入線上版本
// import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d106-mod.ts";
// import { PAGELIST, JS_106 } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d106-mod.ts";
// await AppListen(PAGELIST);
// 
import { AppListen, PAGELIST, JS_106 } from "./d106-mod.ts";

export const JS_107 = `<!DOCTYPE html>
<html><body><h2> D106ABC Date Example</h2>
<button type="button" onclick="foo()">Click</button>
<p id="demo"></p>
<script type="module">
import * as djwt  from "https://deno.land/x/djwt@v2.8/mod.ts";
globalThis.djwt = djwt;
</script>
<script>
async function foo(){
    const key = await crypto.subtle.generateKey(
        { name: "HMAC", hash: "SHA-256" },
        true,
        ["sign", "verify"],
    );
    const jwt = await djwt.create({ alg: "HS512", typ: "JWT" }, { foo: "bar" }, key);
    let dstr = Date();
    document.getElementById('demo').innerHTML = 
    \`Date is \${dstr} and jwt is \${jwt}\`;
}
</script>
</body>
</html>`;
PAGELIST.push({id:"d106", tpl: JS_106});
PAGELIST.push({id:"d107", tpl: JS_107});
await AppListen(PAGELIST);