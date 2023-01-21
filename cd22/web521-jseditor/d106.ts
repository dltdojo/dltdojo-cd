//
// 直接匯入線上版本
// import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d106-mod.ts";
// import { PAGELIST, JS_106, JS_XYZ } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d106-mod.ts";
// await AppListen(PAGELIST);
// 
import { AppListen, PAGELIST, JS_106, JS_XYZ } from "./d106-mod.ts";

export const D106_ABC = `<!DOCTYPE html>
<html><body><h2> D106ABC Date Example</h2>
<button type="button" onclick="foo()">Click</button>
<p id="demo"></p>
<script>
async function foo(){
    let dstr = Date();
    document.getElementById('demo').innerHTML = 
    \`Date is \${dstr}\`;
}
</script>
</body>
</html>`;
PAGELIST.push({id:"d106", tpl: JS_106});
PAGELIST.push({id:"d106XYZ", tpl: JS_XYZ});
PAGELIST.push({id:"d106ABC", tpl: D106_ABC});
await AppListen(PAGELIST);