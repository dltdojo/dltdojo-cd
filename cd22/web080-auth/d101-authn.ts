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
<form action="/api/register" method="post">
  <label for="username">username:</label>
  <input type="text" name="username"><br><br>
  <label for="password">password:</label>
  <input type="text" name="password"><br><br>
  <input type="submit" value="Register">
</form>
<form action="/api/login" method="post">
  <label for="username">username:</label>
  <input type="text" name="username"><br><br>
  <label for="password">password:</label>
  <input type="text" name="password"><br><br>
  <input type="submit" value="Login">
</form>
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
        ctx.response.body = "OnlyAuthContent";
    } else {
        ctx.response.body = "403 Forbidden";
        ctx.response.status = 403;
    }
});

router.post("/api/register", async (ctx) => {
    const requestBody: URLSearchParams = await ctx.request.body().value;
    console.log(requestBody);
    const username = requestBody.get("username");
    const password = requestBody.get("password");
    const user: IUser = db123.find(entry => entry.username == username && entry.password == password);
    if (user === undefined) {
        db123.push({
            username,
            password
        });
        console.log(db123);
        ctx.response.redirect("/");
    } else {
        ctx.response.body = "Register error";
        ctx.response.status = 500;
    }
});

router.post("/api/login", async (ctx) => {
    const requestBody: URLSearchParams = await ctx.request.body().value;
    console.log(requestBody);
    const username = requestBody.get("username");
    const password = requestBody.get("password");
    const user: IUser = db123.find(entry => entry.username == username && entry.password == password);
    if (user !== undefined) {
        await ctx.state.session.set("loggedIn", true);
        ctx.response.redirect("/onlyauth");
    } else {
        await ctx.state.session.set("loggedIn", false);
        ctx.response.body = "Login error";
        ctx.response.status = 500;
    }
});

app.addEventListener('error', (e) => console.log(e.error));
app.addEventListener("listen", (e) => console.log("Listening on http://localhost:3000"));
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 3000 });

