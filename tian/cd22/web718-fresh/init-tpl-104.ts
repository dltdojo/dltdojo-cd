export const ROUTES_INDEX_TSX = `import { Head } from "$fresh/runtime.ts";
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

export const DOCKER_COMPOSE = `version: "3.8"
services:
  deno101:
    # image: denoland/deno:1.29.1
    build: .
    environment:
      - DENO_DEPLOYMENT_ID=prod101
    command:
      - sh
      - -c 
      - |
        env
        cd /app
        deno run --allow-net=0.0.0.0:8000 \\
        --allow-env=DENO_DEPLOYMENT_ID \\
        --allow-read=/app --allow-write=/root/.cache,/tmp \\
        --allow-run=/bin/deno,/root/.cache/esbuild/bin/esbuild-linux-64@0.14.51 \\
        main.ts &
        sleep 1
        echo "Endpoint = http://localhost:8903"
        wait
    volumes:
      - .:/app:ro
    ports:
      - 8903:8000
`;

export const DOCKERFILE = `# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1
WORKDIR /app
RUN <<EOF
cd /tmp
deno run -A - <<"ENND" > import_map.json
import { freshImports, twindImports } from "https://deno.land/x/fresh@1.1.2/src/dev/imports.ts";
const importMap = { imports: {} as Record<string, string> };
freshImports(importMap.imports);
twindImports(importMap.imports);
console.log(JSON.stringify(importMap, null, 2));
ENND
deno run --import-map=import_map.json -A - <<"ENND"
import "$fresh/server.ts";
import "$fresh/plugins/twind.ts";
import "$fresh/runtime.ts";
import "preact/jsx-runtime";
ENND
EOF
`;