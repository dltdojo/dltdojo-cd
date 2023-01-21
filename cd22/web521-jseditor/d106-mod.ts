import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

const LIVE_HTML_CODE_TPL = `<!DOCTYPE html>
<html lang="en" hidden>
  <head>
    <!-- https://github.com/sauravhathi/live-html-editor/blob/master/LICENSE -->
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
    <title>Live HTML Editor</title>
  </head>
  <body class="bg-black text-white">
    <div class="flex flex-col lg:h-screen justify-center items-center">
      <div class="flex flex-col items-center justify-center gap-10 my-10">
        <h1 class="text-4xl font-bold">Live HTML Editor</h1>
        <div class="flex flex-col gap-4 lg:flex-row">
          <div class="flex flex-col gap-2">
            <h2 class="text-xl font-bold">HTML</h2>
            <textarea
              class="bg-pink-400 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent drop-shadow-md rounded-md p-2 h-[48rem] w-[40rem] resize-none text-black"
              id="html"
              placeholder="write your html here"
            >__TPL__INIT__JAVASCTIPT__</textarea>
            <button
              class="bg-white hover:bg-blue-500 text-blue-500 font-bold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              id="save"
            >
              Save
            </button>
          </div>
          <div class="flex flex-col gap-2">
            <h2 class="text-xl font-bold">Preview</h2>
            <iframe
              id="result"
              class="bg-white border border-blue-500 rounded-md drop-shadow-md h-[32rem] w-[20rem] p-2 overflow-auto"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </body>
  <script>
    const html = document.getElementById("html");
    const result = document.getElementById("result");
    html.addEventListener("keyup", () => {
      result.contentWindow.document.open();
      result.contentWindow.document.write(html.value);
      result.contentWindow.document.close();
    });
    document.getElementById("save").addEventListener("click", () => {
      const data = html.value;
      const blob = new Blob([data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = "index.html";
      a.href = url;
      a.click();
    });
  </script>
</html>`;

export const JS_106 = `<!DOCTYPE html>
<html><body><h2> D106 SHA-1 Example</h2>
<button type="button" onclick="foo()">Click</button>
<p id="demo"></p>
<script>
async function sha1(message) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    // encode as (utf-8) Uint8Array
    const msgUint8 = new TextEncoder().encode(message);                           
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);           
    // convert buffer to byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     
    // convert bytes to hex string
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); 
    return hashHex;
}
async function foo(){
    let dstr = Date();
    document.getElementById('demo').innerHTML = 
    \`Date is \${dstr} and sha1(date) is \${await sha1(dstr)}\`;
}
</script>
</body>
</html>`;

export const JS_XYZ = `<!DOCTYPE html>
<html><body><h2> D106XYZ Date Example</h2>
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

type PageType = {
  id: string,
  tpl: string
}

export const PAGELIST: PageType[] = [];


export async function AppListen(pagelist: PageType[]) {
  const router = new Router();
  router.get("/:id", (ctx) => {
    const page = pagelist.find(v=> v.id === ctx?.params?.id);
    if(page){
      ctx.response.body = LIVE_HTML_CODE_TPL.replace('__TPL__INIT__JAVASCTIPT__', page.tpl);
    }else{
      ctx.response.status = 404;
    }
  });
  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.addEventListener(
    "listen",
    () => console.log("Listening on http://localhost:3000"),
  );
  await app.listen({ port: 3000 });
}