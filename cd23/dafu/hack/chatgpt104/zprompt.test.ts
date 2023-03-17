// 
// fabien0102/ts-to-zod: Generate zod schemas from typescript types/interfaces https://github.com/fabien0102/ts-to-zod
//
// Schema from TypeScript type · Issue #1917 · colinhacks/zod https://github.com/colinhacks/zod/issues/1917
//
import "https://deno.land/std@0.179.0/dotenv/load.ts";
import { Configuration, OpenAIApi, } from "npm:openai@3.2.1";
import { assertEquals, assertStringIncludes, assertThrows } from "https://deno.land/std@0.179.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
class SchemaPromptInput {
  static readonly Enum = {
    LargeLanguageModelsChatProider: z.enum(["openai", "microsoft-azure", "google-cloud", "llm404", "taichung"]),
    RequestModel: z.enum(["gpt-3.5-turbo-0301", "gpt-3.5-turbo", "gpt-4", "code-davinci-002", "gpt-404"])
  }
  static readonly promptArg = z.object({
    provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.optional().default("openai"),
    model: SchemaPromptInput.Enum.RequestModel.optional().default("gpt-3.5-turbo"),
    message: z.string().min(20).max(100).includes('schema').includes(" named "),
    tstype: z.string().includes('type'),
  })
  // deno-lint-ignore no-explicit-any
  static readonly isPrompt = (v: any): v is SchemaPromptInput.TypePromptArg => SchemaPromptInput.promptArg.safeParse(v).success
}

// deno-lint-ignore no-namespace
namespace SchemaPromptInput {
  export type TypePromptArg = z.infer<typeof SchemaPromptInput.promptArg>
}

// z.prompt({}) ?
const zPrompt = (arg: SchemaPromptInput.TypePromptArg) => {
  if (SchemaPromptInput.isPrompt(arg)) {
    return `You are a thoughtful assistant that helps the developer do tasks on Typescript. 
Answer as concisely as possible for each response (e.g. don't be verbose). When it makes sense, 
use markdown syntax to output code. If outputting code, include the programming language. 
Use the examples below as a guide.
  
Example 1:
Task: use the type from third-party typescript packages in my schema named "SchemaPromptInput"
Context:
export type prompt = {
  message: string
}
Output:
\`\`\`ts
export class SchemaPromptInput {
  static readonly prompt = z.object({
    message: z.string().min(20).max(100).includes('schema'),
  })
  static readonly isPrompt = (v: any): v is SchemaPromptInput.TypePrompt => SchemaPromptInput.prompt.safeParse(v).success
}
export namespace SchemaPromptInput {
  export type TypePrompt = z.infer<typeof SchemaPromptInput.prompt>
}
\`\`\`


Example 2:
Task: use the type in my schema named "SchemaOpenAiMessage"
Context:
export type Role = "system" | "assistant" | "user";
export type Message {
  role: Role;
  content: string;
}

Output:
\`\`\`ts
export class SchemaOpenAiMessage {
  static readonly Enum = {
    Role: z.enum(["system", "user", "assistant"]),
  }
  static readonly openAiMessage = z.object({
    role: SchemaOpenAiMessage.Enum.Role,
    content: z.string().min(2).max(1000),
  })
  static readonly isOpenAiMessage = (v: any): v is SchemaOpenAiMessage.TypeOpenAiMessage => SchemaOpenAiMessage.openAiMessage.safeParse(v).success
}
export namespace SchemaOpenAiMessage {
  export type TypeOpenAiMessage = z.infer<typeof SchemaOpenAiMessage.openAiMessage>
}
\`\`\`

Example 3:
Task: use the type in my schema named "SchemaHero"
Context:
export type Hero = {
  id: string;
  name: string;
  age: number;
}

Output:
\`\`\`ts
export class SchemaHero {
  static readonly hero = z.object({
    id: z.string().min(2).max(10).includes('FOO'),
    name: z.string().min(2).max(30),
    age: z.number().min(1).max(1000)
  })
  static readonly isHero = (v: any): v is SchemaHero.TypeHero => SchemaHero.hero.safeParse(v).success
}
export namespace SchemaHero {
  export type TypeHero = z.infer<typeof SchemaHero.hero>
}
\`\`\`
  
Begin.
Task: ${arg.message}
Context:
${arg.tstype}
Output:
\`\`\`ts
`
  } else {
    throw new Error('Prompt error. sample: use the type in my schema named "SchemaBar"')
  }
}

const prompt101: SchemaPromptInput.TypePromptArg = {
  provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.enum.openai,
  model: SchemaPromptInput.Enum.RequestModel.enum["gpt-3.5-turbo"],
  message: 'use the type in my schema named "SchemaFoo"',
  tstype: `
export type Role = "admin" | "user" | "403" ;
export type Group = "Develop" | "Dreamer" | "404";
export type Message = {
    group: Group
    content: string
}
export type User = {
  usename: string,
  password: string,
  amount: number,
  role: Role,
  message: Message
}
`}

const chatGpt = async (arg: SchemaPromptInput.TypePromptArg) => {
  if (SchemaPromptInput.isPrompt(arg) && arg.provider === "openai") {
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    }))
    const content = zPrompt(arg)
    const resp = await openai.createChatCompletion({
      model: arg.model,
      messages: [{ role: "assistant", content }]
    });
    return resp;
  } else {
    throw new Error("Parse Error")
  }
}

Deno.test("error prompt test", () => {
  assertThrows(
    () => {
      const _errorPrompt = zPrompt({
        provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.enum.taichung,
        model: SchemaPromptInput.Enum.RequestModel.enum["gpt-404"],
        message: 'crete a zod schema for me',
        tstype: `type blah`
      })
    },
    Error,
    'Prompt error. sample: use the type in my schema named "SchemaBar"'
  )
  assertStringIncludes(prompt101.message, "SchemaFoo")
})

const tseval = (code: string) => {
  const denoImport = `import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";\n${code}`
  return import("data:application/typescript," + encodeURIComponent(denoImport));
};

Deno.test("ts to zod", async () => {
  const resp = await chatGpt(prompt101)
  const content = resp.data.choices[0].message?.content
  if (content) {
    // console.log(JSON.stringify(resp.data, null, 2))
    // remove markdown code tail ```
    const script = content.replace("```", "").trim();
    console.log(script)
    assertStringIncludes(script, "class SchemaFoo")
    const mod = await tseval(script);
    assertEquals(mod.SchemaFoo.isUser({}), false);
    assertEquals(mod.SchemaFoo.isUser({
      username: 'alice',
      password: '**********',
      amount: 10,
      role: "admin",
      message: {
        group: "Develop",
        content: "blahblah"
      }
    }), true);
  }
})

/**
 * Please execute the following docker command to test and try to run the given openai example.
 * $ docker run --env OPENAI_API_KEY=blahblah --rm denoland/deno:alpine \
 *     test --allow-read=.env --allow-env=OPENAI_API_KEY --allow-net=api.openai.com \
 *     https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/cd23/dafu/hack/chatgpt104/zprompt.test.ts
 * 
------- output -------
export class SchemaFoo {
  static readonly Enum = {
    Role: z.enum(["admin", "user", "403"]),
    Group: z.enum(["Develop", "Dreamer", "404"]),
  }
  static readonly message = z.object({
    group: SchemaFoo.Enum.Group,
    content: z.string().max(200),
  })
  static readonly user = z.object({
    username: z.string().min(2).max(30),
    password: z.string().min(6).max(20),
    amount: z.number().min(0),
    role: SchemaFoo.Enum.Role,
    message: SchemaFoo.message,
  })
  static readonly isUser = (v: any): v is SchemaFoo.TypeUser => SchemaFoo.user.safeParse(v).success
}
export namespace SchemaFoo {
  export type TypeUser = z.infer<typeof SchemaFoo.user>
  export type TypeMessage = z.infer<typeof SchemaFoo.message>
  export type TypeRole = z.infer<typeof SchemaFoo.Enum.Role>
  export type TypeGroup = z.infer<typeof SchemaFoo.Enum.Group>
}
Check data:application/typescript,import%20%7B%20z%20%7D%20from%20%22https%3A%2F%2Fdeno.land%2Fx%2Fzod%40v3.21.4%2Fmod.ts%22%...
----- output end -----
ts to zod ... ok (16s)

ok | 2 passed | 0 failed (16s)
 */