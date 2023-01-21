import { prepareVirtualFile } from "https://deno.land/x/mock_file@v1.0.1/mod.ts";
import { freshImports, twindImports } from "https://deno.land/x/fresh@1.1.2/src/dev/imports.ts";
import { collect, generate } from "https://deno.land/x/fresh@1.1.2/src/dev/mod.ts";

async function writevf(vfpath: string, textContent: string) {
    const content = new TextEncoder().encode(textContent);
    prepareVirtualFile(vfpath, content);
}

const importMap = { imports: {} as Record<string, string> };
freshImports(importMap.imports);
twindImports(importMap.imports);
await writevf("./no/such/import_map.json", JSON.stringify(importMap, null, 2));

const ROUTES_INDEX_TSX = `import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <p class="my-6">
        hello
        </p>
        <Counter start={3} />
      </div>
    </>
  );
}
`;

await writevf("./no/such/routes/index.tsx", ROUTES_INDEX_TSX);

export const COMPONENTS_BUTTON_TSX = `import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";
export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class="px-2 py-1 border(gray-100 2) hover:bg-gray-200"/>);
}
`;

await writevf("./no/such/components/Button.tsx", COMPONENTS_BUTTON_TSX);

export const ISLANDS_COUNTER_TSX = `import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
interface CounterProps {
  start: number;
}
export default function Counter(props: CounterProps) {
  const [count, setCount] = useState(props.start);
  return (
    <div class="flex gap-2 w-full">
      <p class="flex-grow-1 font-bold text-xl">{count}</p>
      <Button onClick={() => setCount(count - 1)}>-1</Button>
      <Button onClick={() => setCount(count + 1)}>+1</Button>
    </div>
  );
}
`;

await writevf("./no/such/islands/Counter.tsx", ISLANDS_COUNTER_TSX);

const TWIND_CONFIG_TS = `import { Options } from "$fresh/plugins/twind.ts";
export default {
  selfURL: import.meta.url,
} as Options;
`;

await writevf("./no/such/twind.config.ts", TWIND_CONFIG_TS);

const MAIN_TS = `/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";
await start(manifest, { plugins: [twindPlugin(twindConfig)] });
`;

await writevf("./no/such/main.ts", MAIN_TS);
const config = {
    importMap: "./import_map.json",
    compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "preact",
    },
};
const DENO_CONFIG = JSON.stringify(config, null, 2) + "\n";
await writevf("./no/such/deno.json",  JSON.stringify(config, null, 2) );

const FRESH_GEN_TS =`
import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/index.tsx";
import * as $$0 from "./islands/Counter.tsx";

const manifest = {
  routes: {
    "./routes/index.tsx": $0,
  },
  islands: {
    "./islands/Counter.tsx": $$0,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
`;

await writevf("./no/such/fresh.gen.ts",  FRESH_GEN_TS);

import twindConfig from "./no/such/twind.config.ts";