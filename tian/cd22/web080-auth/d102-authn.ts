import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.6/mod.ts";
interface IUser {
    username?: string;
    password?: string;
}
const db123: IUser[] = [];
const HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>d101 - web080-auth</title>
</head>
<body>
<h3>web080 auth</h3>
<h3><a href="/onlyauth">ONLY AUTH</a></h3>
<div>
  username:<input type="text" id="username" maxlength="25">
  <br/>
  password:<input type="text" id="password" maxlength="25">
  <br/>
  <button onclick="clickRegister()">Register</button>
  <button onclick="clickLogin()">Login</button>
</div>
<script>
async function clickRegister() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let resp = await fetch("api/register", {
		method: "POST",
		headers: { "Content-Type": "application/json"},
		body: JSON.stringify({username, password})
	})
    let v = await resp.json();
    console.log(v);
}
async function clickLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    let resp = await fetch("api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json"},
		body: JSON.stringify({username, password})
	})
    let v = await resp.json();
    console.log(v);
}
</script>
</body>
</html>
`

type AppState = {
    session: Session
}

const app = new Application<AppState>();
const router = new Router<AppState>();
app.use(Session.initMiddleware())

router.get("/", (ctx) => {
    ctx.response.body = HTML;
});

router.get("/onlyauth", async (ctx) => {
    const loggedIn: bool = await ctx.state.session.get("loggedIn");
    if (loggedIn) {
        ctx.response.body = "OnlyAuth";
    } else {
        ctx.response.body = "403 Forbidden";
        ctx.response.status = 403;
    }
});

router.post("/api/register", async (ctx) => {
    const requestBody = await ctx.request.body().value;
    console.log(requestBody);
    db123.push(requestBody);
    ctx.response.body = { message: 'ok' };
});

router.post("/api/login", async (ctx) => {
    const requestBody = await ctx.request.body().value;
    console.log(requestBody);
    const user: IUser = db123.find(entry => entry.username == requestBody.username && entry.password == requestBody.password);
    if (user === undefined) {
        ctx.response.body = { message: 'username or password error' };
        ctx.response.status = 500;
    } else {
        await ctx.state.session.set("loggedIn", true);
        ctx.response.body = { message: 'ok' };
    }
});

app.addEventListener('error', (e) => console.log(e.error));
app.addEventListener("listen", (e) => console.log("Listening on http://localhost:3000"));
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 3000 });

