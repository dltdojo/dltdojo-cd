//
// [Contracts Wizard - OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/4.x/wizard)
//
import "https://deno.land/std@0.179.0/dotenv/load.ts";
import { Configuration, OpenAIApi } from "npm:openai@3.2.1";
import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.179.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
//
// yaml parser
//
import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "https://deno.land/std@0.179.0/encoding/yaml.ts";
//
// markdown parser
//
import * as marked from "npm:marked";

class SchemaPromptInput {
  static readonly Enum = {
    LargeLanguageModelsChatProider: z.enum(["openai", "llm404", "taichung"]),
    RequestModel: z.enum([
      "gpt-3.5-turbo-0301",
      "gpt-3.5-turbo",
      "gpt-4",
      "code-davinci-002",
      "gpt-404",
    ]),
  };
  static readonly promptArg = z.object({
    provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.optional()
      .default("openai"),
    model: SchemaPromptInput.Enum.RequestModel.optional().default(
      "gpt-3.5-turbo",
    ),
    message: z.string().min(10).max(100).includes("NFT").includes(" named "),
    yamlContext: z.string().min(5),
  });
  static readonly example = z.object({
    task: z.string(),
    context: z.string(),
    output: z.string().startsWith("pragma solidity").optional(),
  });
  // deno-lint-ignore no-explicit-any
  static readonly isPrompt = (v: any): v is SchemaPromptInput.TypePromptArg =>
    SchemaPromptInput.promptArg.safeParse(v).success;
  // deno-lint-ignore no-explicit-any
  static readonly isExample = (v: any): v is SchemaPromptInput.TypeExample =>
    SchemaPromptInput.example.safeParse(v).success;
}

// deno-lint-ignore no-namespace
namespace SchemaPromptInput {
  export type TypePromptArg = z.infer<typeof SchemaPromptInput.promptArg>;
  export type TypeExample = z.infer<typeof SchemaPromptInput.example>;
}

const MdFrontMatterExamples: string[] = [
  Deno.readTextFileSync("example103-1.md"),
  Deno.readTextFileSync("example103-2.md"),
  Deno.readTextFileSync("example103-3.md"),
];

const parseMdFrontMatter = (raw: string): SchemaPromptInput.TypeExample => {
  const mdTokens = marked.lexer(raw);
  // console.log(mdTokens);
  // console.log(stringifyYaml())
  if (mdTokens[1].text) {
    const heading: any = parseYaml(mdTokens[1].text);
    const result = {
      task: heading.metadata.name,
      context: stringifyYaml(heading.spec),
    };
    if (mdTokens[2]?.text) {
      return { ...result, output: mdTokens[2].text };
    } else {
      return result;
    }
  } else {
    console.log(mdTokens);
    throw new Error("md parse error");
  }
};

const AllExampleContents = MdFrontMatterExamples.map((mdStr, index) => {
  const v = parseMdFrontMatter(mdStr);
  const x = SchemaPromptInput.example.parse(v);
  return `Example ${index + 1}:
Task: ${x.task}
Contet:
\`\`\`yaml
${x.context}
\`\`\`
Output:
\`\`\`solidity
${x.output}
\`\`\`
`;
});

const createPrompt = (arg: SchemaPromptInput.TypePromptArg) => {
  if (SchemaPromptInput.isPrompt(arg)) {
    return `You are a thoughtful assistant that helps the developer do tasks on smart contract. 
Answer as concisely as possible for each response (e.g. don't be verbose). When it makes sense, 
use markdown syntax to output code, links, tables, etc. If outputting code, include the programming language. 
Use the examples below as a guide.

${AllExampleContents.join("\n")}

Begin.
Task: ${arg.message}
Context:
\`\`\`yaml
${arg.yamlContext}
\`\`\`
Output:

`;
  } else {
    throw new Error(
      'Prompt error. sample: Create a NFT contract named "MyCollectible" with the token symbol "MC0"',
    );
  }
};

const chatGpt = async (arg: SchemaPromptInput.TypePromptArg) => {
  if (SchemaPromptInput.isPrompt(arg) && arg.provider === "openai") {
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get("OPENAI_API_KEY"),
      }),
    );
    const content = createPrompt(arg);
    const resp = await openai.createChatCompletion({
      model: arg.model,
      messages: [{ role: "assistant", content }],
    });
    return resp;
  } else {
    throw new Error("Parse Error");
  }
};

Deno.test("markdown parse", () => {
  const v = parseMdFrontMatter(MdFrontMatterExamples[0]);
  assertEquals(SchemaPromptInput.isExample(v), true);
});

const promptBase = {
  provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.enum.openai,
  model: SchemaPromptInput.Enum.RequestModel.enum["gpt-3.5-turbo"],
};

//
// When the LLM model lacks new knowledge to respond, it can cause the following test case to fail. In order to establish
// new knowledge from the question and pass the test, it is necessary to add examples related to `burnable` and `mintable`.
// However, due to the current OpenAI API service token limit, the number of added examples will also be restricted.
//
Deno.test("prompt mintable and burnable test", async () => {
  const message = "Create a NFT contract named TaichungWow";
  const yamlContext = `symbol: TCW
type: 
  - mintable
  - burnable
`;
  const prompt101 = {
    message,
    yamlContext,
    ...promptBase,
  };
  console.log(createPrompt(prompt101));
  const resp = await chatGpt(prompt101);
  const content = resp.data.choices[0].message?.content;
  console.log(content);
  if (content) {
    // console.log(JSON.stringify(resp.data, null, 2))
    // remove markdown code tail ```
    const script = content.replace("```solidity", "").replace("```", "").trim();
    assertStringIncludes(
      script,
      "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol",
    );
    assertStringIncludes(script, "@openzeppelin/contracts/access/Ownable.sol");
    assertStringIncludes(script, "TCW");
    assertStringIncludes(script, "TaichungWow");
    assertStringIncludes(script, "ERC721Burnable");
    assertStringIncludes(script, "Ownable");
    assertStringIncludes(script, "_safeMint");
  }
});
//
// When the number of examples of prompting is too low, such as in this test where there are only three examples,
// the impact of attribute order will increase. If we could increase the number of examples, we estimate that we
// could reduce the sensitivity of the output results to the input attribute order, but this may lead to input
// length exceeding limits and prevent us from obtaining a response of OpenAI API.
//
// The arrangement of the Examples is crucial. In this case, the order of attributes for `mintable` and `burnable`
// were switched, may resulting in `import "@openzeppelin/contracts/access/Ownable.sol";` being omitted from the output code.
// 
Deno.test("attributes order matter", async () => {
  const message = "Create a NFT contract named TaichungWow";
  // change burnable first
  const yamlContext = `symbol: TCW
type: 
  - burnable
  - mintable
`;
  const prompt101 = {
    message,
    yamlContext,
    ...promptBase,
  };

  const resp = await chatGpt(prompt101);
  const content = resp.data.choices[0].message?.content;
  if (content) {
    const script = content.replace("```solidity", "").replace("```", "").trim();

    assertEquals(
      script.includes("@openzeppelin/contracts/access/Ownable.sol"),
      true,
    );
    assertEquals(
      script.includes(
        "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol",
      ),
      true,
    );
  }
});

Deno.test("prompt without pausable example", async () => {
  const message = "Create a NFT contract named TaichungWow";
  // change burnable first
  const yamlContext = `symbol: TCW
type:
  - burnable
  - mintable
  - pausable
`;
  const prompt101 = {
    message,
    yamlContext,
    ...promptBase,
  };
  console.log(createPrompt(prompt101));
  const resp = await chatGpt(prompt101);
  const content = resp.data.choices[0].message?.content;
  console.log(content);
  if (content) {
    const script = content.replace("```solidity", "").replace("```", "").trim();
    assertStringIncludes(script, "@openzeppelin/contracts/access/Ownable.sol");
    //
    // If there is no new pausable contract knowledge offered in the form of test examples within the promting,
    // from which LLM(chatgpt) can learn, it will rely on existing knowledge and output the most probable answer.
    // This may result in issues such as using "/extensions/" instead of "/security/" in the URI. The correct URI
    // should be "@openzeppelin/contracts/security/Pausable.sol". Therefore, the following test will almost certainly
    // pass, unless the machine has already been trained (prompt or finetune) with new pausable contract knowledge.
    //
    assertEquals(
      script.includes("@openzeppelin/contracts/security/Pausable.sol"),
      false,
    );
    assertStringIncludes(
      script,
      "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol",
    );
  }
});

/**
 * Please execute the following docker command to test and try to run the given openai example.
 * $ docker run --env OPENAI_API_KEY=blahblah --rm denoland/deno:alpine \
 *     test --allow-env=OPENAI_API_KEY --allow-net=api.openai.com \
 *     https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/cd23/dafu/hack/chatgpt104/nft103.test.ts
 *
------- output -------
You are a thoughtful assistant that helps the developer do tasks on smart contract.
Answer as concisely as possible for each response (e.g. don't be verbose). When it makes sense,
use markdown syntax to output code, links, tables, etc. If outputting code, include the programming language.
Use the examples below as a guide.

Example 1:
Task: Create a NFT token contract named MyCollectible
Contet:
```yaml
symbol: MC0

```
Output:
```solidity
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract MyCollectible is ERC721 {
    constructor() ERC721("MyCollectible", "MCO") {
    }
}
```

Example 2:
Task: Create a NFT contract named MyFoo101
Contet:
```yaml
symbol: FAR
type:
  - mintable

```
Output:
```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract MyFoo101 is ERC721, Ownable {
    constructor() ERC721("MyFoo101", "FAR") {}
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
```

Example 3:
Task: give me a NFT token contract named MyBar201
Contet:
```yaml
symbol: MBR
type:
  - burnable

```
Output:
```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
contract MyBar201 is ERC721, ERC721Burnable {
    constructor() ERC721("MyBar201", "MBR") {}
}
```


Begin.
Task: Create a NFT contract named TaichungWow
Context:
```yaml
symbol: TCW
type:
  - mintable
  - burnable

```
Output:


```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract TaichungWow is ERC721, ERC721Burnable, Ownable {
    constructor() ERC721("TaichungWow", "TCW") {}
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
```
----- output end -----
 */
