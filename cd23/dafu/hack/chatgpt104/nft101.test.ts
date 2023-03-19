import "https://deno.land/std@0.179.0/dotenv/load.ts";
import { Configuration, OpenAIApi } from "npm:openai@3.2.1";
import { assertStringIncludes } from "https://deno.land/std@0.179.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

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
  });
  static readonly example = z.object({
    task: z.string(),
    context: z.string(),
    output: z.string().startsWith("pragma solidity"),
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

const Examples: SchemaPromptInput.TypeExample[] = [
  {
    task:
      'Create a NFT token contract named "MyCollectible" with the token symbol "MC0"',
    context: "currentDate = Monday, February 20, 2023 at 4:11:25 PM",
    output: `pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// currentDate: Monday, February 20, 2023 at 4:11:25 PM
contract MyCollectible is ERC721 {
    constructor() ERC721("MyCollectible", "MCO") {
    }
}
`,
  },
  {
    task:
      'Create a mintable NFT contract named "MyFoo101" with the token symbol "FAR"',
    context: "currentDate = Monday, February 21, 2023 at 5:11:25 PM",
    output: `pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// currentDate: Monday, February 21, 2023 at 5:11:25 PM
contract MyFoo101 is ERC721, Ownable {
    constructor() ERC721("MyFoo101", "FAR") {}
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
`,
  },
  {
    task:
      'Create a burnable NFT token contract named "MyBar201" with the token symbol "MBR"',
    context: "currentDate = Monday, February 25, 2023 at 6:11:27 PM ",
    output: `pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
// currentDate: Monday, February 25, 2023 at 6:11:27 PM
contract MyBar201 is ERC721, ERC721Burnable {
    constructor() ERC721("MyBar201", "MBR") {}
}
`,
  },
];

const AllExampleContents = Examples.map((v, index) => {
  const x = SchemaPromptInput.example.parse(v);
  return `Example ${index + 1}:
Task: ${x.task}
Contet:
${x.context}
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
${
      new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })
    }
Output:
\`\`\`solidity
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

Deno.test("prompt test", async () => {
  //console.log(AllExampleContents)
  const prompt101 = {
    provider: SchemaPromptInput.Enum.LargeLanguageModelsChatProider.enum.openai,
    model: SchemaPromptInput.Enum.RequestModel.enum["gpt-3.5-turbo"],
    message:
      'Create a mintable and burnable NFT contract named "TaichungWow" with the token symbol "TCW"',
  };
  console.log(createPrompt(prompt101));
  const resp = await chatGpt(prompt101);
  const content = resp.data.choices[0].message?.content;
  if (content) {
    // console.log(JSON.stringify(resp.data, null, 2))
    // remove markdown code tail ```
    const script = content.replace("```", "").trim();
    console.log(script);
    assertStringIncludes(
      script,
      "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol",
    );
    assertStringIncludes(script, "@openzeppelin/contracts/access/Ownable.sol");
    assertStringIncludes(script, 'ERC721("TaichungWow", "TCW")');
    assertStringIncludes(script, "ERC721Burnable");
    assertStringIncludes(script, "Ownable");
    assertStringIncludes(script, "_safeMint");
  }
});

/**
 * Please execute the following docker command to test and try to run the given openai example.
 * $ docker run --env OPENAI_API_KEY=blahblah --rm denoland/deno:alpine \
 *     test --allow-env=OPENAI_API_KEY --allow-net=api.openai.com \
 *     https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/cd23/dafu/hack/chatgpt104/nft101.test.ts
 *
------- output -------
You are a thoughtful assistant that helps the developer do tasks on smart contract.
Answer as concisely as possible for each response (e.g. don't be verbose). When it makes sense,
use markdown syntax to output code, links, tables, etc. If outputting code, include the programming language.
Use the examples below as a guide.

Example 1:
Task: Create a NFT token contract named "MyCollectible" with the token symbol "MC0"
Contet:
currentDate = Monday, February 20, 2023 at 4:11:25 PM
Output:
```solidity
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// currentDate: Monday, February 20, 2023 at 4:11:25 PM
contract MyCollectible is ERC721 {
    constructor() ERC721("MyCollectible", "MCO") {
    }
}
```

Example 2:
Task: Create a mintable NFT contract named "MyFoo101" with the token symbol "FAR"
Contet:
currentDate = Monday, February 21, 2023 at 5:11:25 PM
Output:
```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// currentDate: Monday, February 21, 2023 at 5:11:25 PM
contract MyFoo101 is ERC721, Ownable {
    constructor() ERC721("MyFoo101", "FAR") {}
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
```

Example 3:
Task: Create a burnable NFT token contract named "MyBar201" with the token symbol "MBR"
Contet:
currentDate = Monday, February 25, 2023 at 6:11:27 PM
Output:
```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
// currentDate: Monday, February 25, 2023 at 6:11:27 PM
contract MyBar201 is ERC721, ERC721Burnable {
    constructor() ERC721("MyBar201", "MBR") {}
}
```


Begin.
Task: Create a mintable and burnable NFT contract named "TaichungWow" with the token symbol "TCW"
Context:
Saturday, March 18, 2023 at 8:08:36 PM
Output:
```solidity

pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// currentDate: Saturday, March 18, 2023 at 8:08:36 PM
contract TaichungWow is ERC721, ERC721Burnable, Ownable {
    constructor() ERC721("TaichungWow", "TCW") {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
----- output end -----
prompt test ... ok (7s)

ok | 1 passed | 0 failed (7s)
 */
