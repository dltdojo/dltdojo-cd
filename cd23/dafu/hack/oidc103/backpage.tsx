/** @jsx h */
import { Utils, ZodSchema, z, h, renderToString } from "./deps.ts";

export const Page = {
  LoginInfo: (props: any) => {
    const x: z.infer<typeof ZodSchema.pageHome> = props;
    if(x.sigstoreLoginUrl && x.vaultLoginUrl){
      return (
        <div>
         <h3><a href={x.vaultLoginUrl}>Vault LoginUrl</a></h3>
         <h3><a href={x.sigstoreLoginUrl}>Sigstore LoginUrl</a></h3>
        </div>
      );
    } else{
      return <span/>;
    }
  },
  
  ServerSideGenPage: (props: any) => {
    return (
      <div>
        <h2>OIDC Login (Backend TSX)</h2>
        <Page.LoginInfo {...props} />
        <h3>
          <a href="/api/logout">Logout</a>
        </h3>
        <h3>
          The CSS border: thick double sets the JSX-ServerSideGen-Area border.
        </h3>
      </div>
    );
  },

  htmlPage: (x: z.infer<typeof ZodSchema.pageHome>) => {
    const props = ZodSchema.pageHome.parse(x)
    const ssg: string = renderToString(
      <Page.ServerSideGenPage {...props} />,
    );
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>cd23/dafu/hack/oidc</title>
  </head>
  <body >
  <h1>${x.body}</h1>
  <div style="border: thick double #32a1ce; padding: 10px;">${ssg}</div>
  </body>
  </html>`;
  },
};
