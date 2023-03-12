import { assertEquals } from "https://deno.land/std@0.179.0/testing/asserts.ts";
import * as marked  from 'npm:marked';
import {
  parse,
  stringify,
} from "https://deno.land/std@0.178.0/encoding/yaml.ts";

const testdata101: any = parse(Deno.readTextFileSync("./testdata101.yaml"));
const repsText101 = testdata101.resps[0].choices[0].message.content
const testdata102: any = parse(Deno.readTextFileSync("./testdata102.yaml"));
const repsText102 = testdata102.resps[0].choices[0].message.content

Deno.test("url test", () => {
  console.log(repsText102)
  const tokens102 = marked.lexer(repsText102);
  // Deno.writeTextFileSync('marked-lexer-tokens-102.json', JSON.stringify(tokens102, null, 2))
  console.log(tokens102)
  const url = new URL("./foo.js", "https://deno.land/");
  assertEquals(url.href, "https://deno.land/foo.js");
});
