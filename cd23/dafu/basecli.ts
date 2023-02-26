import { Command } from "npm:commander";
import { readAll } from "https://deno.land/std@0.177.0/streams/read_all.ts";
import { DemoCiliumIngressNodePort } from "./k8s.ts";

export class BaseCliCommander {
  program = new Command();

  constructor() {
    this.program
      .name("foo-cli")
      .description("foo cli")
      .version("0.0.1")
      .option("-d, --debug", "output extra debugging")
      .option("-i, --interactive", "Forces to read the input from the STDIN");
    this.program
      .command("foostdin")
      .description("foo action")
      .action(async () => {
        if (this.program.opts().interactive) {
          const stdinText = new TextDecoder().decode(await readAll(Deno.stdin));
          console.log(stdinText);
        } else {
          console.log("NO STDIN");
        }
      });
      this.program
      .command("demo101").description('cilium ingress controller example')
      .action(() => {
        console.log(new DemoCiliumIngressNodePort('dafu101').yaml())
      });
  }

  parse() {
    this.program
      .parse();
  }
}
