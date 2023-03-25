import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { CallbackManager } from "npm:langchain@0.0.41/callbacks";
import { ChatOpenAI } from "npm:langchain@0.0.41/chat_models";
import { initializeAgentExecutor } from "npm:langchain@0.0.41/agents";
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from "npm:langchain@0.0.41/tools";

import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "https://deno.land/std@0.181.0/yaml/mod.ts";

export const Utils = {
  randomDateStr: () =>
    new Date().toISOString().replace(/[-:]/gm, "").substring(0, 15),
  sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
  yaml: {
    parse: parseYaml,
    stringify: (v: any) => stringifyYaml(v, { lineWidth: -1 }),
  },
  markdown: {
    wrapCode: (raw: string, type: string) => {
      return `\`\`\`\`${type}\n${raw}\n\`\`\`\``;
    },
  },
};

const resultMdArray: string[] = [];

const callbackManager = CallbackManager.fromHandlers({
  handleLLMStart: async (llm, prompts) => {
    resultMdArray.push(`# ChatGPT prompts ${Utils.randomDateStr()}`);
    resultMdArray.push(
      Utils.markdown.wrapCode(Utils.yaml.stringify(prompts), "yaml"),
    );
  },

  handleLLMEnd: async (result) => {
    resultMdArray.push("## result ");
    resultMdArray.push(
      Utils.markdown.wrapCode(Utils.yaml.stringify(result), "yaml"),
    );
  },
});

const chatOpenAI = new ChatOpenAI({
  callbackManager,
  temperature: 0,
});
export const run = async () => {
  const tools = [
    new RequestsGetTool(),
    new RequestsPostTool(),
    await AIPluginTool.fromPluginUrl(
      "https://www.klarna.com/.well-known/ai-plugin.json",
    ),
  ];
  const agent = await initializeAgentExecutor(
    tools,
    chatOpenAI,
    "chat-zero-shot-react-description",
    true,
  );

  const result = await agent.call({
    input: "what t shirts are available in klarna?",
  });

  console.log(Utils.yaml.stringify(result));
};

const writeMd = () =>
  Deno.writeTextFileSync(
    `A103-${Utils.randomDateStr()}.md`,
    resultMdArray.join("\n"),
  );

try {
  await run();
} catch (error) {
  console.log(error);
} finally {
  writeMd();
}
