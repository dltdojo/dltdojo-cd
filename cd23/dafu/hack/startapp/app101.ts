import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const Zapp = {
  role: z.enum(["system", "user", "assistant"]),
  get message() {
    return z.object({
      role: this.role,
      content: z.string().min(1),
    });
  },

  get messageRecord() {
    return z.record(
      this.role,
      z.string(),
    );
  },

  get EnumRole() {
    return this.role.enum;
  },
};

const CliffyCli = {
  enumRole: new EnumType(Zapp.role.options),
}

const cmdFoo = new Command()
  .description("coding tool")
  .type("foo-level", CliffyCli.enumRole)
  .option("-t, --type <val:foo-level>", "some foo type")
  .option(
    "-n, --num <num:integer>",
    "the number of suggestions, rewrites or challenges.",
  )
  .option("-z, --zhtw", "translate to zhTW")
  .action((options, ...args) => {
    console.log(options, args);
  });

await new Command()
  .name("startapp")
  .version("0.1.0")
  .description(
    "startapp tryrun",
  )
  .action((_options, ...args) => {
    console.log(args);
  })
  .command("foo", cmdFoo)
  .command("help", new HelpCommand().global())
  .parse(Deno.args);
