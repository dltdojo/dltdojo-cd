import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { readAll } from "https://deno.land/std@0.177.0/streams/read_all.ts";
import { DemoCiliumIngressNodePort } from "./k8s.ts";
import $ from "https://deno.land/x/dax@0.28.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";

const logLevelType = new EnumType(["debug", "info", "warn", "error"]);

enum ConfRunLevel {
  dryrun = "dryrun",
  write = "write",
  apply = "apply",
  delete = "delete",
}

const confRunLevelType = new EnumType(ConfRunLevel);

const fnArgRunHandle = z.object({
  confContent: z.string().min(1),
  filename: z.string().min(5),
  dir: z.string().min(1),
});

type FnArgRunHandle = z.infer<typeof fnArgRunHandle>;

const handleRunLevel = async (
  lv: ConfRunLevel,
  fnarg: FnArgRunHandle,
) => {
  fnArgRunHandle.parse(fnarg)
  const confDir = $.path(fnarg.dir)
  const confFile = confDir.join(fnarg.filename)
  switch (lv) {
    case ConfRunLevel.dryrun:
      console.log(fnarg.confContent);
      break;
    case ConfRunLevel.write:
      console.log(`write conf to ${fnarg.filename}`);
      if(!confDir.isDir()){
        confDir.mkdirSync();
      }
      confFile.writeTextSync(fnarg.confContent)
      break;
    case ConfRunLevel.apply:
      console.log(`apply -f ${confFile}`);
      await $`kubectl apply -f ${confFile}`;
      break;
    case ConfRunLevel.delete:
      console.log(`delete -f {confFile}`);
      await $`kubectl delete -f ${confFile}`;
      break;
    default:
      console.log(fnarg.confContent);
      break;
  }
};
const ing101 = new Command()
  .description("cilium ingress controller example")
  .option("-f, --foo", "Foo option.")
  .type("run-type", confRunLevelType)
  .option(
    "-r, --run-type <rtype:run-type>",
    "Set run level of the declarative conf file about k8s objects",
    {
      default: ConfRunLevel.dryrun as const,
    },
  )
  .action(async (options, ...args) => {
    const appId = "ing101";
    const confContent = new DemoCiliumIngressNodePort(appId).yaml();
    const filename = "cilium-ingress-nodeport-demo.yaml";
    await handleRunLevel(options.runType, {
      confContent,
      filename,
      dir: appId,
    });
  });

const foo = new Command()
  .description("Foo sub-command.")
  .option("-f, --file <file:string>", "read from file ...")
  .option("-i, --stdin [stdin:boolean]", "read from stdin ...", {
    conflicts: ["file"],
  })
  .arguments("<value:string>")
  .action(async (options, ...args) => {
    console.log(options);
    console.log(args);
    if (options.stdin) {
      const stdinText = new TextDecoder().decode(await readAll(Deno.stdin));
      console.log(stdinText);
    }
    console.log("Foo command called.");
  });

const bar = new Command()
  .description("Bar sub-command.")
  .option("-b, --bar", "Bar option.")
  .arguments("<input:string> [output:string]")
  .action((options, ...args) => {
    console.log("Bar command called.");
    console.log(options);
    console.log(args);
  });

export const CliffyCmd = new Command()
  .name("dafu")
  .version("0.1.0")
  .description("Command line tool for dltdojo-cd/cd23")
  .meta("deno", Deno.version.deno)
  .meta("v8", Deno.version.v8)
  .meta("typescript", Deno.version.typescript)
  .type("log-level", logLevelType)
  .env("DEBUG=<enable:boolean>", "Enable debug output.")
  .globalOption("-d, --debug", "Enable debug output.")
  .option("-l, --log-level <level:log-level>", "Set log level.", {
    default: "info" as const,
  })
  .command("ing101", ing101)
  .command("foo", foo)
  // Child command 2.
  .command("bar", bar)
  .command("help", new HelpCommand().global());
