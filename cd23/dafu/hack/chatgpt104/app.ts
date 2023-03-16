// 
// TODO: 
// cat xxx.sh|yaml|git diff | app.ts -r code -type explaincode > xxx.md
// git --no-pager diff --no-color app.ts | deno run -A app.ts chatgpt -r code -m 'explain the following git diff:' -i
//
import "https://deno.land/std@0.179.0/dotenv/load.ts";
import * as log from "https://deno.land/std@0.179.0/log/mod.ts";
import {
  Configuration,
  OpenAIApi,
} from "npm:openai@3.2.1";
import { stringify } from "https://deno.land/std@0.179.0/encoding/yaml.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { readAll } from "https://deno.land/std@0.179.0/streams/read_all.ts";
import { match } from "npm:ts-pattern";

//
// Permit type alias declarations inside a class · Issue #7061 · microsoft/TypeScript
// https://github.com/microsoft/TypeScript/issues/7061
//
// deno-lint-ignore no-namespace
export namespace SchemaOpenaiApi {
  export type TypeApiResp = z.TypeOf<typeof SchemaOpenaiApi.ApiChatResp>;
  export type TypeMessage = z.TypeOf<typeof SchemaOpenaiApi.Message>;
}

//
// Schema from TypeScript type · Issue #1917 · colinhacks/zod
// https://github.com/colinhacks/zod/issues/1917
//
// https://github.com/search?q=zod+prompt_tokens+total_tokens+model+choices+usage&type=Code
//
// https://github.com/openai/openai-node
export class SchemaOpenaiApi {
  static Role = z.enum(["system", "user", "assistant"])

  static RespObject = z.enum(["chat.completion", "text_completion"])

  static RequestModel = z.enum(["gpt-3.5-turbo", "gpt-4"])

  static Message = z.object({ role: SchemaOpenaiApi.Role, content: z.string().min(1) })

  static Usage = z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number()
  })

  static Choices = z.object({
    index: z.number().optional(),
    message: SchemaOpenaiApi.Message,
    finish_reason: z.string().optional()
  })

  static ApiChatResp = z.object({
    id: z.string(),
    object: SchemaOpenaiApi.RespObject,
    created: z.number(),
    model: z.string(),
    choices: SchemaOpenaiApi.Choices.array(),
    usage: SchemaOpenaiApi.Usage
  })

  // Type-guards for chatRespon type
  // deno-lint-ignore no-explicit-any
  static isApiChatResp = (v: any): v is SchemaOpenaiApi.TypeApiResp => SchemaOpenaiApi.ApiChatResp.safeParse(v).success
}


// deno-lint-ignore no-namespace
export namespace SchemaApp {
  export type TypeLogLevel = z.TypeOf<typeof SchemaApp.LogLevel>;
  export type TypeRecord = z.TypeOf<typeof SchemaApp.AppRoleRocord>;
  export type TypePromptElement = z.TypeOf<typeof SchemaApp.PromptElement>;
}

export class SchemaApp {
  static LogLevel = z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'])
  static Env = z.object({
    OPENAI_API_KEY: z.string().min(10),
    LOG_LEVEL_CONSOLE: SchemaApp.LogLevel.optional().default("INFO"),
    ID_PREFIX: z.string().min(3).max(10).optional().default("r101"),
    SAVE_DIR: z.string().min(1).max(36).optional().default("."),
    ID_DATE: z.string().min(4).max(16).optional().default(
      new Date().toISOString().replace(/[-:]/gm, "").substring(0, 15),
    ),
  })

  static EnumAppRole = z.enum(["code", "eng"])

  static EnumEngPrompt = z.enum(["correct", "rewrite", "example", "suggest", "foo"])

  static PromptElement = z.object({
    prompt: z.string().min(1).optional(),
    promptByRespIndex: z.number().min(0).optional(),
    rewriteExampleByRespIndex: z.number().min(0).optional(),
  })

  static PromptCmdOpts = z.object({
    saved: z.boolean().optional(),
    sysrole: SchemaApp.EnumAppRole,
  })

  static AppRoleRocord = z.record(
    SchemaApp.EnumAppRole,
    SchemaOpenaiApi.Message,
  )
}

const Env0 = SchemaApp.Env.parse(Deno.env.toObject());



export class App {

  #openai: OpenAIApi

  #keeperBox: {
    prompts: SchemaOpenaiApi.TypeMessage[];
    resps: SchemaOpenaiApi.TypeApiResp[];
  } = {
      prompts: [],
      resps: [],
    };


  constructor(openai: OpenAIApi) {
    this.#openai = openai
  }

  chatCompletion = async (messages: SchemaOpenaiApi.TypeMessage[]) => {
    return await this.#openai.createChatCompletion({
      model: SchemaOpenaiApi.RequestModel.enum["gpt-3.5-turbo"],
      messages
    })
  }

  chatgptPrompt = async (
    prompts: SchemaApp.TypePromptElement[],
    opts: z.TypeOf<typeof SchemaApp.PromptCmdOpts>,
  ) => {
    const x = SchemaApp.PromptCmdOpts.parse(opts);
    const promptSystemRole = PromptSystemRoles[x.sysrole];
    if (promptSystemRole !== undefined) {
      this.#keeperBox.prompts.push(promptSystemRole);
    }

    let assistantLastContent = "";

    for (const [index, value] of prompts.entries()) {
      const args = SchemaApp.PromptElement.parse(value);
      log.debug(`===> [${index}] prompt: ${JSON.stringify(args)}`);
      if (assistantLastContent.length > 0) {
        this.#keeperBox.prompts.push(
          { role: "assistant", content: assistantLastContent },
        );
      }

      const content = args.prompt;

      log.debug(`===> [${index}] prompt: ${content}`);

      if (content && content.length > 5) {
        this.#keeperBox.prompts.push(
          { role: "user", content },
        );

        const response = await this.chatCompletion(this.#keeperBox.prompts);
        const respData = response.data;
        if (SchemaOpenaiApi.isApiChatResp(respData)) {
          this.#keeperBox.resps.push(respData);
          assistantLastContent = respData.choices[0].message?.content ?? "";
          log.debug(assistantLastContent);
          console.log(assistantLastContent);
        } else {
          log.error('resp data format error', JSON.stringify(respData, null, 2))
        }
      }
    }
    if (x.saved) {
      const yamlContent = stringify(this.#keeperBox)
      Deno.writeTextFileSync(`${AppConf.PATH_DATEID}.yaml`, yamlContent);
      Deno.writeTextFileSync(`${AppConf.PATH_LATEST}.yaml`, yamlContent);
    }
  };
}

const AppConf = {
  PATH_LATEST: `${Env0.SAVE_DIR}/${Env0.ID_PREFIX}-latest`,
  PATH_DATEID: `${Env0.SAVE_DIR}/${Env0.ID_PREFIX}-${Env0.ID_DATE}`,

  newOpenAiApi(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    return new OpenAIApi(configuration);
  },

  logSetup: (logLevel: SchemaApp.TypeLogLevel = SchemaApp.LogLevel.enum.INFO) => {
    log.setup({
      handlers: {
        console: new log.handlers.ConsoleHandler("DEBUG"),
      },
      loggers: {
        "default": {
          level: logLevel,
          handlers: ["console"],
        },
      },
    });
  },
};

// const mainContent = "Give me 5 Blochain appliction development pain-points and how to Solve Them ?"

export const PromptSystemRoles: SchemaApp.TypeRecord = {
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
    `could you please respnse to the following email with a ${topic}?\n${email}`,
  betterVocabulary: (v = "hello world") =>
    `Can you suggest a better vocabulary to be used in the following text?\n${v}`,
  writeExample: (words = "", num = 5) =>
    `Please write ${num} example sentences include following words:\n${words}`,
  rewriteExample: (sentence = "", num = 3, explain = false) =>
    `Please rewrite ${num} example sentence${num === 1 ? "" : "s"
    } using the following text. ${explain ? "and" : "do not"
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

const cmdChatgpt = new Command()
  .description("openai chatgpt tool")
  .type("sys-role", new EnumType(SchemaApp.EnumAppRole.options))
  .option("-r, --sys-role <role:sys-role>", "prompt system role", {
    default: SchemaApp.EnumAppRole.enum.eng,
  })
  .type("eng-type", new EnumType(SchemaApp.EnumEngPrompt.options))
  .option("-e, --engtype <engtype:eng-type>", "eng prompt type", {
    default: SchemaApp.EnumEngPrompt.enum.correct,
  })
  .type("log-level", new EnumType(SchemaApp.LogLevel.options))
  .option("-l, --log-level <level:log-level>", "log level", {
    default: SchemaApp.LogLevel.enum.INFO,
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
  .option('-i, --interactive', 'Forces to read the input from the STDIN')
  .option("-n, --num <num:integer>", "the suggestion number.")
  .action(async (options) => {
    AppConf.logSetup(options.logLevel);
    log.debug(options);
    const openai = AppConf.newOpenAiApi(
      options.openaiApiKey ?? Env0.OPENAI_API_KEY,
    );
    const prompts: SchemaApp.TypePromptElement[] = [];
    switch (options.sysRole) {
      case SchemaApp.EnumAppRole.enum.eng: {
        let targetMsg = undefined

        match(options.engtype)
          .with(SchemaApp.EnumEngPrompt.enum.example, () => targetMsg = Template.writeExample(options.message, options.num))
          .with(SchemaApp.EnumEngPrompt.enum.correct, () => targetMsg = Template.correctGrammarAndExplain(options.message))
          .with(SchemaApp.EnumEngPrompt.enum.rewrite, () => targetMsg = Template.rewriteExample(options.message, options.num, true))
          .with(SchemaApp.EnumEngPrompt.enum.suggest, () => targetMsg = Template.betterVocabulary(options.message))
          .with(SchemaApp.EnumEngPrompt.enum.foo, () => { })
          .exhaustive()   // <--- will be a type error if Event type has any other union members
        if (targetMsg) {
          prompts.push({
            prompt: targetMsg,
          })
        }

        break;
      }
      case SchemaApp.EnumAppRole.enum.code:
        {
          let msg = options.message;
          if (options.interactive) {
            const stdinText = new TextDecoder().decode(await readAll(Deno.stdin));
            msg = `${msg}\n${stdinText}`
          }
          prompts.push({ prompt: msg });
          break;
        }
      default:
        break;
    }
    if (prompts && prompts.length > 0) {
      log.debug(prompts)
      await new App(openai).chatgptPrompt(prompts, {
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
  .globalOption("-d, --debug", "output extra debugging")
  .command("chatgpt", cmdChatgpt)
  .command("help", new HelpCommand().global())
  .parse(Deno.args);
