// deno run --allow-net --deny-net=api.evil.com d103.ts
import { create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
const kv = await Deno.openKv();

const key = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const authourized = async (
  req: Request,
): Promise<{ status: number; payload?: any }> => {
  try {
    const headers: Headers = req.headers;
    const authorization = headers.get("Authorization");
    if (!authorization) {
      return { status: 401 };
    }
    const jwt = authorization.split(" ")[1];

    if (!jwt) {
      return { status: 401 };
    }
    const payload = await verify(jwt, key);
    if (!payload) {
      return { status: 401 };
    } else {
      return { status: 200, payload };
    }
  } catch (error) {
    return { staus: 401 };
  }
};

const jwtCreate = async (payload: any) => {
  const jwt = await create({ alg: "HS512", typ: "JWT" }, { payload }, key);
  return jwt;
};


export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type",
};

// TODO sigin ok return jwt
// [How to Build a CRUD API with Oak and Deno KV](https://deno.com/blog/build-crud-api-oak-denokv)
// 自己作 register/login 還要處理 route 太複雜交給 oak 比較方便。
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Create short links
  if (req.method == "POST") {
    const authResult = await authourized(req);
    if (authResult.status != 200) {
      return new Response("unauthenticated", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: authResult.status,
      });
    }
    const { slug, url } = await req.json();
    const result = await kv.set(["links", slug], url);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // Redirect short links
  const slug = req.url.split("/").pop() || "";
  const url = (await kv.get(["links", slug])).value as string;
  if (url) {
    return Response.redirect(url, 301);
  } else {
    const m = !slug ? "please provide a slug." : `slug ${slug} not found`;
    return new Response(m, { status: 404 });
  }
});
