import { AppListen } from "./d104-mod.ts";
// 直接匯入線上版本
// import { AppListen } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web521-jseditor/d104-mod.ts";

const JS_HERE = `<!DOCTYPE html>
<html>
<body>
<h2>JavaScript Demo 104</h2>
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
await AppListen(JS_HERE);