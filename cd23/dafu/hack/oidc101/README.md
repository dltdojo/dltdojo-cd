openid-configuration

- google
  - https://developers.google.com/identity/openid-connect/openid-connect
  - https://accounts.google.com/.well-known/openid-configuration
- facebook
  - https://developers.facebook.com/docs/facebook-login/limited-login/token/
  - https://www.facebook.com/.well-known/openid-configuration/
- https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc
- 

[Build Your First Deno App with Authentication | Okta Developer](https://developer.okta.com/blog/2020/09/14/deno-with-auth)

點擊登入時先做出轉址 url 後利用 HTTP CODE 302 通知瀏覽器轉址到登入服務，一般來說設定 IDP 完成都會提供，只是各家設定各式各樣不好找。

- [OpenID Connection Google Authentication - Traefik Hub](https://doc.traefik.io/traefik-hub/access-control-policies/methods/oidc-google/)
- [Facebook SSO Login | Drupal OAuth OIDC Login | Drupal Wiki guide on Drupal.org](https://www.drupal.org/docs/contributed-modules/drupal-oauth-oidc-login/facebook-sso-login)
- [Adding a Client Id and a Client Secret to log in with Facebook | VTEX Help Center](https://help.vtex.com/tutorial/adding-a-client-id-and-a-client-secret-to-log-in-with-facebook--3R7rzXWG1GswWOIkYyy8SO#)


```ts
import { config } from './../deps.ts';

export const ensureAuthenticated = async (req:any, res:any, next:any) => {
  const user = req.app.locals.user;
  if (!user) {
    const reqUrl = req.originalUrl;
    const {issuer, clientId, redirectUrl, state} = config();
    const authUrl = `${issuer}/v1/authorize?client_id=${clientId}&response_type=code&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${state}:${reqUrl}`;
    res.location(authUrl).sendStatus(302);
  }
  next();
}
```

另一個重點是 redirectUrl，必須有承接的 http endpoint 來處理，例如 sigstore 會本機開服務來承接 redirectUrl。

- https://github.com/sigstore/sigstore/blob/f3c233997094a529aeddfdaa0cf640655df13e2c/pkg/oauth/oidc/interactive.go#L56

後端 redirectUrl 收到後，後端須依據拿到的 req.query.code 去 token_endpoint 拿 id_token

```ts
const tokenUrl: string = `${issuer}/v1/token`;
const code: string = req.query.code;

const headers = new Headers();
headers.append('Accept', 'application/json');
headers.append('Authorization', `Basic ${btoa(clientId + ':' + clientSecret)}`);
headers.append('Content-Type', 'application/x-www-form-urlencoded');

const response = await fetch(tokenUrl, {
  method: 'POST',
  headers: headers,
  body: `grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUrl)}&code=${code}`
});

const data = await response.json();
if (!response.ok) {
  res.send(data);
} else {
  const user = parseJwt(data.id_token);
  req.app.locals.user = user;
  req.app.locals.isAuthenticated = true;
  res.location(req.query.state.split(':')[1] || '/').sendStatus(302);
}
```

整理一下，依據 .well-known/openid-configuration 資訊

- 開始後端需要讓前端轉到 IDP authorization_endpoint 並加上需要參數，其中的 redirectUrl 需要轉到可驗證端點，這裡是同一個服務走下去。
- 轉回後換成後端拿這個內容的 code 在編寫部份設定後往 IDP token_endpoint 取得 id_token 鑑別身分無誤。

其它

- https://github.com/search?q=renderToString+OAuth2Client&type=code
- https://github.com/search?l=TypeScript&q=oauth4webapi&type=Code
- https://github.com/dltdojo/dltdojo-cd/blob/main/cd22/web080-auth/d105.tsx
- https://github.com/dltdojo/dltdojo-cd/blob/e955a6fa2f41a4fec837ecd042963d4b044b7603/cd22/web090-passkeys/d104-authn.ts
- [Dashport: A Login Solution for Deno | by Sam Portelance | The Startup | Medium](https://medium.com/swlh/dashport-a-login-solution-for-deno-574df45d9927)
- [oslabs-beta/dashport: Local and OAuth authentication middleware for Deno](https://github.com/oslabs-beta/dashport)
