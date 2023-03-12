#!/usr/bin/env -S deno run -A

import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

await new Command()
  .env(
    "ABC_INSTALL_ROOT=<path:string>",
    "Set install root.",
    { prefix: "ABC_" },
  )
  .option(
    "--install-root <path:string>",
    "Set install root.",
  )
  .action((options) => {
      console.log("===>env\n",Deno.env.toObject())
      console.log("===>options\n",options);
  })
  .parse();
