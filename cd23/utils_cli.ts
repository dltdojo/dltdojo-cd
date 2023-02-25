import $ from "https://deno.land/x/dax@0.28.0/mod.ts";

export class CliTypeScriptTemp {
  tempCliTsPath = "";
  async writeFile(tsCode = 'console.log("hello")') {
    this.tempCliTsPath = await Deno.makeTempFile({
      prefix: "denocli_",
      suffix: ".ts",
    });
    // console.log("Temp deno cli path:", tempCliTsPath);
    await Deno.writeTextFile(
      this.tempCliTsPath,
      tsCode,
    );
    return this;
  }
  async run() {
    return await $`deno run -A ${this.tempCliTsPath}`.stdout("piped").stderr(
      "piped",
    ).noThrow();
  }

  async cleanup() {
    await $`rm ${this.tempCliTsPath}`;
  }
}
