import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { readAll } from "https://deno.land/std@0.177.0/streams/read_all.ts";
import { DemoCiliumIngressNodePort } from "./k8s.ts";

const logLevelType = new EnumType(["debug", "info", "warn", "error"]);

const demo101 = new Command()
  .description("cilium ingress controller example")
  .option("-f, --foo", "Foo option.")
  .action(() => {
    console.log(new DemoCiliumIngressNodePort('dafu101').yaml())
  });

const foo = new Command()
  .description("Foo sub-command.")
  .option("-f, --foo", "Foo option.")
  .option("-i, --interactive", "read the input from the STDIN")
  .arguments("<value:string>")
  .action(async (options, ...args) => {
    console.log(options);
    console.log(args);
    if (options.interactive) {
      const stdinText = new TextDecoder().decode(await readAll(Deno.stdin));
      console.log(stdinText);
    }
    console.log("Foo command called.");
  });

export const CliffyCmd = new Command()
  .name("dafu")
  .version("0.1.0")
  .description("Command line tool for dltdojo-cd/cd23")
  .meta("deno", Deno.version.deno)
  .meta("v8", Deno.version.v8)
  .meta("typescript", Deno.version.typescript)
  .command("help", new HelpCommand().global())
  .type("log-level", logLevelType)
  .env("DEBUG=<enable:boolean>", "Enable debug output.")
  .globalOption("-d, --debug", "Enable debug output.")
  .option("-l, --log-level <level:log-level>", "Set log level.", {
    default: "info" as const,
  })
  .command("demo101",demo101)
  .command("foo", foo)
  // Child command 2.
  .command("bar", "Bar sub-command.")
  .option("-b, --bar", "Bar option.")
  .arguments("<input:string> [output:string]")
  .action((options, ...args) => console.log("Bar command called."))
