// https://github.com/denoland/fresh/blob/1.1.2/init.ts
import { freshImports, twindImports } from "https://deno.land/x/fresh@1.1.2/src/dev/imports.ts";
import { join, parse, resolve } from "https://deno.land/x/fresh@1.1.2/src/dev/deps.ts";
import { collect, ensureMinDenoVersion, generate } from "https://deno.land/x/fresh@1.1.2/src/dev/mod.ts";
const importMap = { imports: {} as Record<string, string> };
freshImports(importMap.imports);
twindImports(importMap.imports);

const unresolvedDirectory = Deno.args[0];
const resolvedDirectory = resolve(unresolvedDirectory);

const IMPORT_MAP_JSON = JSON.stringify(importMap, null, 2) + "\n";
await Deno.writeTextFile(
    join(resolvedDirectory, "import_map.json"),
    IMPORT_MAP_JSON,
);

await Deno.mkdir(join(resolvedDirectory, "routes", "api"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "islands"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "static"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "components"), { recursive: true });

const ROUTES_INDEX_TSX = `import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img src="/logo.svg" class="w-32 h-32" width="128" height="128"
          alt="the fresh logo: a sliced lemon dripping with juice"/>
        <p class="my-6">
          Welcome to \`fresh\`. Try updating this message in the ./routes/index.tsx
          file, and refresh.
        </p>
        <Counter start={3} />
      </div>
    </>
  );
}
`;
await Deno.writeTextFile(
    join(resolvedDirectory, "routes", "index.tsx"),
    ROUTES_INDEX_TSX,
);

const COMPONENTS_BUTTON_TSX = `import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";
export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class="px-2 py-1 border(gray-100 2) hover:bg-gray-200"/>);
}
`;
await Deno.writeTextFile(
    join(resolvedDirectory, "components", "Button.tsx"),
    COMPONENTS_BUTTON_TSX,
);

const ISLANDS_COUNTER_TSX = `import { useState } from "preact/hooks";
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
await Deno.writeTextFile(
    join(resolvedDirectory, "islands", "Counter.tsx"),
    ISLANDS_COUNTER_TSX,
);

const ROUTES_GREET_TSX = `import { PageProps } from "$fresh/server.ts";
export default function Greet(props: PageProps) {
  return <div>Hello {props.params.name}</div>;
}
`;
await Deno.writeTextFile(
    join(resolvedDirectory, "routes", "[name].tsx"),
    ROUTES_GREET_TSX,
);

const ROUTES_API_JOKE_TS = `import { HandlerContext } from "$fresh/server.ts";
// Jokes courtesy of https://punsandoneliners.com/randomness/programmer-jokes/
const JOKES = [
  "Why do Java developers often wear glasses? They can't C#.",
  "A SQL query walks into a bar, goes up to two tables and says “can I join you?”",
];
export const handler = (_req: Request, _ctx: HandlerContext): Response => {
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
`;
await Deno.writeTextFile(
    join(resolvedDirectory, "routes", "api", "joke.ts"),
    ROUTES_API_JOKE_TS,
);

const TWIND_CONFIG_TS = `import { Options } from "$fresh/plugins/twind.ts";
export default {
  selfURL: import.meta.url,
} as Options;
`;
await Deno.writeTextFile(
    join(resolvedDirectory, "twind.config.ts"),
    TWIND_CONFIG_TS,);

try {
    const faviconArrayBuffer = await fetch("https://fresh.deno.dev/favicon.ico")
        .then((d) => d.arrayBuffer());
    await Deno.writeFile(
        join(resolvedDirectory, "static", "favicon.ico"),
        new Uint8Array(faviconArrayBuffer),
    );
} catch {
    // Skip this and be silent if there is a nework issue.
}

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
const MAIN_TS_PATH = join(resolvedDirectory, "main.ts");
await Deno.writeTextFile(MAIN_TS_PATH, MAIN_TS);

const config = {
    importMap: "./import_map.json",
    compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "preact",
    },
};
const DENO_CONFIG = JSON.stringify(config, null, 2) + "\n";

await Deno.writeTextFile(join(resolvedDirectory, "deno.json"), DENO_CONFIG);

const manifest = await collect(resolvedDirectory);
await generate(resolvedDirectory, manifest);