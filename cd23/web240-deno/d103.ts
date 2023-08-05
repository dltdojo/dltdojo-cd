// deno run --allow-net --deny-net=api.evil.com d103.ts
const kv = await Deno.openKv();

Deno.serve(async (req: Request) => {
  // Create short links
  if (req.method == "POST") {
    const body = await req.text();
    const { slug, url } = JSON.parse(body);
    const result = await kv.set(["links", slug], url);
    return new Response(JSON.stringify(result));
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
