import "https://deno.land/std@0.178.0/dotenv/load.ts";
import {
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from "npm:openai@3.2.1";
import { stringify } from "https://deno.land/std@0.178.0/encoding/yaml.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

const Zapp0 = {
  env: z.object({
    OPENAI_API_KEY: z.string().min(10),
    ID_PREFIX: z.string().min(3).max(10).optional().default("r101"),
    SAVE_DIR: z.string().min(1).max(36).optional().default("."),
    ID_DATE: z.string().min(4).max(16).optional().default(
      new Date().toISOString().replace(/[-:]/gm, "").substring(0, 15),
    ),
  }),

  chat: {
    message: z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1),
    }),

    systemRole: z.enum(["code", "eng"]),

    engPromptEnum: z.enum(["correct", "rewrite", "example", "suggest"]),

    promptElement: z.object({
      prompt: z.string().min(1).optional(),
      promptByRespIndex: z.number().min(0).optional(),
      rewriteExampleByRespIndex: z.number().min(0).optional(),
    }),
  },
};

const Env0 = Zapp0.env.parse(Deno.env.toObject());

const Conf = {
  PATH_LATEST: `${Env0.SAVE_DIR}/${Env0.ID_PREFIX}-latest`,
  PATH_DATEID: `${Env0.SAVE_DIR}/${Env0.ID_PREFIX}-${Env0.ID_DATE}`,
  newOpenAiApi(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    return new OpenAIApi(configuration);
  },
};

// const mainContent = "Give me 5 Blochain appliction development pain-points and how to Solve Them ?"

const Zchat = {
  promptCmdOpts: z.object({
    saved: z.boolean().optional(),
    sysrole: Zapp0.chat.systemRole,
  }),
  systemRoleRocord: z.record(
    Zapp0.chat.systemRole,
    Zapp0.chat.message,
  ),
};

type TypeRecord = z.infer<typeof Zchat.systemRoleRocord>;
type TypePromptElement = z.infer<typeof Zapp0.chat.promptElement>;

export const PromptSystemRoles: TypeRecord = {
  code: {
    role: "system",
    content:
      "You are a helpful assistant that helps developers with coding and programming tasks.",
  },
  eng: {
    role: "system",
    content:
      "I want you to act as an English translator, spelling corrector and improver.",
  },
};

const Template = {
  emailReply: (topic = "positive confirmation of acceptance", email = "") =>
    `could you please respnse to the following email with a [topic]?\n${email}`,
  betterVocabulary: (v="hello world") =>
    `Can you suggest a better vocabulary to be used in the following text?\n${v}`,
  writeExample: (words = "", num = 5) =>
    `Please write ${num} example sentences include following words:\n${words}`,
  rewriteExample: (sentence = "", num = 3, explain = false) =>
    `Please rewrite ${num} example sentence${
      num === 1 ? "" : "s"
    } using the following text. ${
      explain ? "and" : "do not"
    } write explanations:\n${sentence}`,
  rewriteAndExplain: (v = "") =>
    `Please rewrite the following text. and explain your changes:\n${v}`,
  correctGrammar: (v = "") =>
    `Correct my English grammar in the following text. only reply the correction and nothing else, do not write explanations:\n${v}`,
  correctGrammarAndExplain: (v = "") =>
    `Correct my English grammar in the following text. and write explanations:\n${v}`,
  translatToZhTW: "Translate the result to Taiwan Traditional Chinese",
  explainCorrection: "explain your correction",
  explainChangeIndex: (v = 1) => `explain your change in #${v}`,
  explainIndex: (work = "answer", v = 1) => `explain your ${work} in #${v}`,
  answerIndex: (v = 1) => `give me a answer for #${v}`,
  anotherExampleAngChane: "give ma another example. and explain your changes",
  devAppChallenges: (area = "blockahin technology", num = 3) =>
    `Could you list ${num} of the most common challenges that developers face when creating applications for ${area} and suggest possible solutions for each of them?`,
  operObstacles: (platform = "kubernetes", num = 3) =>
    `Can you give me a list of ${num} key obstacles operators encounter while managing the ${platform}, along with suggested solutions for each of these challenges?`,
};

const KeeperBox: {
  prompts: z.infer<typeof Zapp0.chat.message>[];
  resps: CreateChatCompletionResponse[];
} = {
  prompts: [],
  resps: [],
};

const chatgptPrompt = async (
  openai: OpenAIApi,
  prompts: TypePromptElement[],
  opts: z.infer<typeof Zchat.promptCmdOpts>,
) => {
  const x = Zchat.promptCmdOpts.parse(opts);
  const promptSystemRole = PromptSystemRoles[x.sysrole];
  if (promptSystemRole !== undefined) {
    KeeperBox.prompts.push(promptSystemRole);
  }

  let assistantLastContent = "";

  for (const [index, value] of prompts.entries()) {
    const args = Zapp0.chat.promptElement.parse(value);
    console.log(`===> [${index}] prompt: ${JSON.stringify(args)}`);
    if (assistantLastContent.length > 0) {
      KeeperBox.prompts.push(
        { role: "assistant", content: assistantLastContent },
      );
    }

    const content = args.prompt;

    console.log(`===> [${index}] prompt: ${content}`);

    if (content && content.length > 5) {
      KeeperBox.prompts.push(
        { role: "user", content },
      );
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: KeeperBox.prompts,
      });
      KeeperBox.resps.push(response.data);
      assistantLastContent = response.data.choices[0].message?.content ?? "";
      console.log(assistantLastContent);
    }
  }
  if (x.saved) {
    const yamlContent = stringify(KeeperBox)
    Deno.writeTextFileSync(`${Conf.PATH_DATEID}.yaml`, yamlContent);
    Deno.writeTextFileSync(`${Conf.PATH_LATEST}.yaml`, yamlContent);
  }
};

const systemRole = Zapp0.chat.systemRole;
const engPrompt = Zapp0.chat.engPromptEnum;

const cmdChatgpt = new Command()
  .description("openai chatgpt tool")
  .type("sys-role", new EnumType(systemRole.options))
  .option("-r, --sys-role <role:sys-role>", "prompt system role", {
    default: systemRole.enum.eng,
  })
  .type("eng-type", new EnumType(engPrompt.options))
  .option("-e, --engtype <engtype:eng-type>", "eng prompt type", {
    default: engPrompt.enum.correct,
  })
  .env(
    "OPENAI_API_KEY=<key:string>",
    "openai api key",
  )
  .option(
    "-m, --message <key:string>",
    "message",
    { required: true },
  )
  .option(
    "-k, --openai-api-key [key:string]",
    "openai api key",
  )
  .option(
    "-s, --save-file [bool:boolean]",
    "save file",
    { default: true },
  )
  .option("-n, --num <num:integer>", "the suggestion number.")
  .action(async (options) => {
    console.log(options);
    const openai = Conf.newOpenAiApi(
      options.openaiApiKey ?? Env0.OPENAI_API_KEY,
    );
    const prompts: TypePromptElement[] = [];
    switch (options.sysRole) {
      case systemRole.enum.eng:
        switch (options.engtype) {
          case engPrompt.enum.example:
            prompts.push({
              prompt: Template.writeExample(options.message, options.num),
            });
            break;
          case engPrompt.enum.rewrite:
            prompts.push(
              {
                prompt: Template.rewriteExample(
                  options.message,
                  options.num,
                  true,
                ),
              },
            );
            break;
          case engPrompt.enum.correct:
            prompts.push({
              prompt: Template.correctGrammarAndExplain(options.message),
            });
            break;
          case engPrompt.enum.suggest:
            prompts.push({ prompt: Template.betterVocabulary(options.message) });
            break;
          default:
            break;
        }
        break;
      case systemRole.enum.code:
        prompts.push({ prompt: options.message });
        break;

      default:
        break;
    }
    if (prompts && prompts.length > 0) {
      console.log(prompts);
      await chatgptPrompt(openai, prompts, {
        sysrole: options.sysRole,
        saved: options.saveFile,
      });
    }
  });

await new Command()
  .name("chatapp")
  .version("0.1.0")
  .description(
    "By using this OpenAI API command line tool, users can easily find and use the relevant prompts to utilize ChatGPT in English",
  )
  .command("chatgpt", cmdChatgpt)
  .command("help", new HelpCommand().global())
  .parse(Deno.args);
