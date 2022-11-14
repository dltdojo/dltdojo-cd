//
// REF php example
// https://github.com/mariofont/PHP-Login/blob/cea95cb22721f3af0f4720f0cb0a82ba8118ef10/login.php#L44
// https://github.com/mhnavid/Login-Panel/blob/66f353421c52ff04156b426e38ecdc22f00ca259/userverify.php#L11
//
import { serve, setCookie } from "./deps.ts";
const ROUTE101 = new URLPattern({ pathname: "/page/:id" });
const RespHtmlOpt = {
  status: 200,
  headers: {
    "content-type": "text/html",
  },
};
const PageIndex = `<html>
<head><title>Page Index</title></head>
<body><h1><a href="/page/foo">foo page</a></h1></body>    
</html> `;
const PageFoo = `<html>
<head><title>Page Foo</title></head>
<body><form action="/page/bar" method="post">
    <label>Username : </label>
    <input type="text" placeholder="Enter Username" name="username" required>  
    <label>Password : </label>
    <input type="password" placeholder="Enter Password" name="password" required>  
    <button type="submit">Login</button> 
</form></body>    
</html>`;
const handlerFoo = (_req: Request): Response => {
  return new Response(PageFoo, RespHtmlOpt);
};
const authUeser = (_username: string, _password: string) => {
  return { authn: true, token: "blahblah"}
};

const handlerBar = async (req: Request): Promise<Response> => {
  console.log(req);
  const form = await req.formData();
  const username = form.get("username")?.toString();
  const password = form.get("password")?.toString();
  console.log({ username, password });
  const result = authUeser(username, password);
  if (result.authn) {
    const headers = new Headers();
    setCookie(headers, {
      name: "X-APP238-TOKEN",
      value: result.token,
      path: "/",
    });
    return new Response("BAR and setCookie", { headers });
  } else {
    return new Response("BAR without cookie");
  }
};
const handler = async (req: Request): Promise<Response> => {
  const match = ROUTE101.exec(req.url);
  let r = new Response(PageIndex, RespHtmlOpt);
  if (match) {
    const id = match.pathname.groups.id;
    switch (id) {
      case "foo":
        r = handlerFoo(req);
        break;
      case "bar":
        r = await handlerBar(req);
        break;
      default:
        break;
    }
  }
  return r;
};
serve(handler);
