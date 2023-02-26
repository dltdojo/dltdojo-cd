import { CliTypeScriptTemp } from "./utils_cli.ts";
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import $ from "https://deno.land/x/dax@0.28.0/mod.ts";

/**
 * @deprecated since version 0.1.4
 */
Deno.test("basecli", async () => {
  const modTs = $.path("mod.ts").resolve();
  const tempCli = await new CliTypeScriptTemp().writeFile(`
  import { BaseCliCommander } from "${modTs}";
  new BaseCliCommander().parse()
`);
  const result = await tempCli.run();

  // console.log(result.stderr);
  assertEquals(result.stdout, "");
  assertStringIncludes(result.stderr, "-h, --help");
  tempCli.cleanup();
});
