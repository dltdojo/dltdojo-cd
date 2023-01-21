export const LIVE_HTML_CODE_TPL = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- https://github.com/sauravhathi/live-html-editor/blob/master/LICENSE -->
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
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
              class="bg-pink-400 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent drop-shadow-md rounded-md p-2 h-[40rem] w-[30rem] resize-none text-black"
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
              class="bg-white border border-blue-500 rounded-md drop-shadow-md h-[36rem] w-[30rem] p-2 overflow-auto"
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
</html>
`