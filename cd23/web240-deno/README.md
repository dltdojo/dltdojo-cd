# Deno 

# 101

```sh
docker run -i --entrypoint sh docker.io/denoland/deno:1.30.3 <<\EOF
deno run -A --check - <<\EOOF
const printStatusCode = (code: string | number) => {
  console.log(`My status code is ${code}.`)
}
printStatusCode(404);
printStatusCode('404');
printStatusCode({});
EOOF
EOF
```

# 102 dax

- [dsherret/dax: Cross platform shell tools for Deno inspired by zx.](https://github.com/dsherret/dax)

```sh
docker run -i --entrypoint sh docker.io/denoland/deno:1.30.3 <<\EOF
deno run --allow-net=deno.land --allow-env --allow-read=$HOME/.local/share/dax,$PWD - <<\EOOF
import $ from "https://deno.land/x/dax/mod.ts";
await $`echo HelloDaxShellWorld`;
await Promise.all([
  $`sleep 1 ; echo 1`,
  $`sleep 2 ; echo 2`,
  $`sleep 3 ; echo 3`,
]);
EOOF
EOF
```