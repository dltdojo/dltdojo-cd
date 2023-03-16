import {
  assertEquals,
} from "https://deno.land/std@0.179.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
// 
// markdown parser
//
import * as marked from "npm:marked";
//
// yaml parser
//
import { parse, stringify, } from "https://deno.land/std@0.179.0/encoding/yaml.ts";

Deno.test("yaml markdown parse test", () => {
  // deno-lint-ignore no-explicit-any
  const testdata101: any = parse(Deno.readTextFileSync("./testdata101.yaml"));
  const _repsText101 = testdata101.resps[0].choices[0].message.content;
  // deno-lint-ignore no-explicit-any
  const testdata102: any = parse(Deno.readTextFileSync("./testdata102.yaml"));
  const repsText102 = testdata102.resps[0].choices[0].message.content;
  const tokens102 = marked.lexer(repsText102);
  // Deno.writeTextFileSync('marked-lexer-tokens-102.json', JSON.stringify(tokens102, null, 2))
  // console.log(tokens102);
  assertEquals(tokens102.length, 5);
  assertEquals(tokens102[2].type, "code");
  const yamlCode = tokens102[2].text;
  if (typeof yamlCode === "string") {
    // console.log(yamlCode)
    assertEquals(yamlCode.startsWith("pragma solidity"), true);
  }
});

// builder-pattern
// https://github.com/Vincent-Pang/builder-pattern
import { Builder } from "npm:builder-pattern"
Deno.test("builder pattern", () => {

  const UserSchema = z.object({
    id: z.number(),
    userName: z.string(),
    email: z.string().email()
  })

  interface UserInfo {
    id: number;
    userName: string;
    email: string;
  }

  const userInfo = Builder<z.TypeOf<typeof UserSchema>>()
    .id(1)
    .userName('foo')
    .email('foo@bar.baz')
    .build();

  const userInfo2: z.TypeOf<typeof UserSchema> = {
    id: 10,
    userName: 'haha',
    email: "bar@bar.foo"
  }

  assertEquals(userInfo.userName, 'foo')

})