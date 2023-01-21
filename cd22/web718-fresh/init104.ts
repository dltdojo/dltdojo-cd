// https://github.com/denoland/fresh/blob/1.1.2/init.ts
import { freshImports, twindImports } from "https://deno.land/x/fresh@1.1.2/src/dev/imports.ts";
import { join, resolve } from "https://deno.land/std@0.170.0/path/mod.ts";
import { collect, ensureMinDenoVersion, generate } from "https://deno.land/x/fresh@1.1.2/src/dev/mod.ts";
import {ROUTES_INDEX_TSX, COMPONENTS_BUTTON_TSX, ISLANDS_COUNTER_TSX, DOCKER_COMPOSE, DOCKERFILE } from "./init-tpl-104.ts";

const importMap = { imports: {} as Record<string, string> };
freshImports(importMap.imports);
twindImports(importMap.imports);

const unresolvedDirectory = Deno.args[0];
const resolvedDirectory = resolve(unresolvedDirectory);

const IMPORT_MAP_JSON = JSON.stringify(importMap, null, 2) + "\n";
await Deno.writeTextFile( join(resolvedDirectory, "import_map.json"),IMPORT_MAP_JSON,);

await Deno.mkdir(join(resolvedDirectory, "routes"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "islands"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "static"), { recursive: true });
await Deno.mkdir(join(resolvedDirectory, "components"), { recursive: true });

await Deno.writeTextFile(
    join(resolvedDirectory, "routes", "index.tsx"),
    ROUTES_INDEX_TSX,
);

await Deno.writeTextFile(
    join(resolvedDirectory, "components", "Button.tsx"),
    COMPONENTS_BUTTON_TSX,
);

await Deno.writeTextFile(
    join(resolvedDirectory, "islands", "Counter.tsx"),
    ISLANDS_COUNTER_TSX,
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

let MAIN_TS = `/// <reference no-default-lib="true" />
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

await Deno.writeTextFile( join(resolvedDirectory, "docker-compose.yaml"),DOCKER_COMPOSE,);
await Deno.writeTextFile( join(resolvedDirectory, "Dockerfile"),DOCKERFILE,);