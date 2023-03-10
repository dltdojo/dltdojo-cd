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
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";

const configuration = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
const openai = new OpenAIApi(configuration);

const CONF = {
  ID_PREFIX: "r102",
  DIR: ".",
  get ID() {
    return `${this.ID_PREFIX}-${
      new Date().toISOString().replace(/[-:]/gm, "").substring(0, 15)
    }`;
  },
  get RESULT_PATH() {
    return `${this.DIR}/${this.ID}`;
  },
};

// const mainContent = "Give me 5 Blochain appliction development pain-points and how to Solve Them ?"

const Zchat = {
  message: z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().min(1),
  }),

  systemRole: z.enum(["PROGRAMMING", "ENGLISH"]),

  get EnumSystemRole() {
    return this.systemRole.enum;
  },
  get systemRoleRocord() {
    return z.record(
      this.systemRole,
      this.message,
    );
  },
  promptArgs: z.object({
    prompt: z.string().min(1).optional(),
    promptByRespIndex: z.number().min(0).optional(),
    rewriteExampleByRespIndex: z.number().min(0).optional(),
  }),
};

type TypeRecord = z.infer<typeof Zchat.systemRoleRocord>;
type TypePromptArgs = z.infer<typeof Zchat.promptArgs>;

export const PromptSystemRoles: TypeRecord = {
  PROGRAMMING: {
    role: "system",
    content:
      "You are a helpful assistant that helps developers with coding and programming tasks.",
  },
  ENGLISH: {
    role: "system",
    content:
      "I want you to act as an English translator, spelling corrector and improver.",
  },
};

// Rewrite this text in the passive voice [add text]
// Write 10 example sentences using [tense/grammar form]
// Write an email about [topic]
// Correct my mistakes in the following text
// Can you suggest a better vocabulary to be used in this text?
// Rewrite in a more informal way
// Rewrite this text in a more polite way

const Template = {
  // getRespContent: (respIndex = 0) => {
  //     const content = FooBox.resps[respIndex]?.choices[0].message?.content
  //     return content
  // },

  emailReply: (topic = "positive confirmation of acceptance", email="") => `could you please respnse to the following email with a [topic]?\n${email}`,
  betterVocabulary: () =>
    "Can you suggest a better vocabulary to be used in the corrected sentence?",
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
  prompts: z.infer<typeof Zchat.message>[];
  resps: CreateChatCompletionResponse[];
} = {
  prompts: [],
  resps: [],
};

const mainCommand = async (
  argSystemRoleType: z.infer<typeof Zchat.systemRole>,
  prompts: TypePromptArgs[],
) => {
  const systemRole = Zchat.systemRole.parse(argSystemRoleType);

  const xxx = PromptSystemRoles[systemRole];
  if (xxx !== undefined) {
    KeeperBox.prompts.push(xxx);
  }

  let assistantLastContent = "";

  for (const [index, value] of prompts.entries()) {
    const args = Zchat.promptArgs.parse(value);
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
  Deno.writeTextFileSync(`${CONF.RESULT_PATH}.yaml`, stringify(KeeperBox));
};

const cmdEng = new Command()
  .arguments("<sentence:string>")
  .description("English tool")
  .option("-e, --example", "activates words example prompts.")
  .option("-r, --rewrite", "activates text rewriting prompts.")
  .option("-n, --num <num:integer>", "the suggestion number.")
  .option(
    "-s, --suggest",
    "activates better vocabulary suggestion prompts.",
  )
  .action(async (options, sentence: string) => {
    console.log(options);
    const prompts: TypePromptArgs[] = [];

    if (options.example) {
      prompts.push({ prompt: Template.writeExample(sentence, options.num) });
    } else if (options.rewrite) {
      prompts.push(
        { prompt: Template.rewriteExample(sentence, options.num, true) },
      );
    } else {
      prompts.push({ prompt: Template.correctGrammarAndExplain(sentence) });
      if (options.suggest) {
        prompts.push({ prompt: Template.betterVocabulary() });
      }
    }
    console.log(prompts);
    await mainCommand(Zchat.EnumSystemRole.ENGLISH, prompts);
  });

const cmdCoding = new Command()
  .arguments("[sentence:string]")
  .description("coding tool")
  .option("-a, --app-challenges <area:string>", "dev app challenges")
  .option("-o, --oper-challenges <area:string>", "oper challenges")
  .option(
    "-n, --num <num:integer>",
    "the number of suggestions, rewrites or challenges.",
  )
  .option("-z, --zhtw", "translate to zhTW")
  .action(async (options, ...args) => {
    // console.log(options, args)
    const prompts: TypePromptArgs[] = [];
    const appChallenges = options.appChallenges;
    const operChallenges = options.operChallenges;
    if (appChallenges && appChallenges.length > 2) {
      prompts.push({
        prompt: Template.devAppChallenges(appChallenges, options.num),
      });
    } else if (operChallenges) {
      prompts.push({
        prompt: Template.operObstacles(operChallenges, options.num),
      });
    } else {
      prompts.push({ prompt: args[0] });
    }
    if (options.zhtw) {
      prompts.push({ prompt: Template.translatToZhTW });
    }
    // console.log(prompts)
    await mainCommand(Zchat.EnumSystemRole.PROGRAMMING, prompts);
  });

await new Command()
  .name("chatapp")
  .version("0.1.0")
  .description(
    "By using this OpenAI API command line tool, users can easily find and use the relevant prompts to utilize ChatGPT in English",
  )
  .arguments("<input:string>")
  .action((_options, ...args) => {
    console.log(args);
  })
  .command("eng", cmdEng)
  .command("code", cmdCoding)
  .command("help", new HelpCommand().global())
  .parse(Deno.args);
