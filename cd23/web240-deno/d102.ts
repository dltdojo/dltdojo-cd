import $ from "https://deno.land/x/dax/mod.ts";
await $`echo HelloDaxShellWorld`;
await Promise.all([
  $`sleep 1 ; echo 1`,
  $`sleep 2 ; echo 2`,
  $`sleep 3 ; echo 3`,
]);