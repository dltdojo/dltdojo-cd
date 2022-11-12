import { serve } from "https://deno.land/std@0.163.0/http/server.ts";
const port = 8080;
const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const input = {
    method: req.method,
    path: url.pathname,
    X_FORWARDED_URI: req.headers.get("x-forwarded-uri"),
  };
  //console.log(input);
  const body = JSON.stringify(input);
  const resp = await fetch("http://opa101:8181/v1/data/httpapi/authz", {
    method: "POST",
    headers: {"Content-Type": "application/json",},
    body,
  });
  if (req.body) {
    const r = await req.json();
    console.log("opa resp= ", r);
    // Resp : { result: { allow: false }, warning: { code: "api_usage_warning", message: "'input' key missing from the request" } }
  }
  return resp;
};
await serve(handler, { port });
