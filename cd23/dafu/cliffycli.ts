import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { readAll } from "https://deno.land/std@0.177.0/streams/read_all.ts";
import {
  DevHttpServices,
  InfraServices,
  jobKanikoBuild,
  TJobReq,
} from "./k8s.ts";
import $ from "https://deno.land/x/dax@0.28.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
import { CONF, K8S_SERVICE } from "./appconf.ts";
import { KindYaml } from "./kind.ts";
import { Dockerfiles, ShellScripts } from "./shellscript.ts";

const logLevelType = new EnumType(["debug", "info", "warn", "error"]);

enum ConfRunLevel {
  dryrun = "dryrun",
  write = "write",
  apply = "apply",
  delete = "delete",
}

const CONF_HANDLE_TYPE = ["save", "apply", "delete", "print"] as const;
const CONF_CLI_TYPE = ["kubectl", "kind", "echo"] as const;
const confHandleType = new EnumType(CONF_HANDLE_TYPE);
const confCliType = new EnumType(CONF_CLI_TYPE);

const ArgRunHandle = z.object({
  id: z.string().min(3).optional().default(
    `id-${Math.random().toString(36).substring(2, 7)}`,
  ),
  type: z.enum(CONF_HANDLE_TYPE).optional().default("print"),
  cli: z.enum(CONF_CLI_TYPE),
  content: z.string().min(1).optional(),
  filename: z.string().min(5),
  dir: z.string().min(1).default(CONF.KCONF_DIR),
});

const confOperate = async (fnarg: z.input<typeof ArgRunHandle>) => {
  const x = ArgRunHandle.parse(fnarg);
  const confDir = $.path(x.dir);
  const confFile = confDir.join(x.filename);
  if (x.type !== "print") console.log(`===> ${x.type} ${confFile}`);
  switch (x.type) {
    case "save":
      if (!confDir.isDir()) {
        confDir.mkdirSync();
      }
      if (x.content) {
        confFile.writeTextSync(x.content);
        console.log(x.content);
      }
      break;
    case "apply":
      // kind create cluster --config kind.yaml
      if (x.cli === "kind") {
        await $`kind create cluster --config ${confFile}`;
      }
      if (x.cli === "kubectl") {
        await $`kubectl apply -f ${confFile}`;
      }
      break;
    case "delete":
      if (x.cli === "kind") {
        await $`kind delete cluster -n ${x.id}`;
      }
      if (x.cli === "kubectl") {
        await $`kubectl delete -f ${confFile}`;
      }
      break;
    case "print":
      console.log(x.content);
      break;
  }
};

const KindTool = {
  CmdSetupKind: new Command()
    .description("Kind sub-command.")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options, ...args) => {
      const kindName = "kind100";
      const aKind = new KindYaml({
        kindName,
      });
      await confOperate({
        cli: "kind",
        type: options.type,
        id: kindName,
        content: aKind.yaml,
        filename: `${kindName}.yaml`,
      });
    }),
  CmdSetupKindRegistry: new Command()
    .description("Kind sub-command.")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options, ...args) => {
      const kindName = "kind200";
      const aKind = new KindYaml({
        kindName,
      });
      aKind.addLocalRegistryPatch({
        registryHost: CONF.REGISTRY_HOST_101,
        registryPort: CONF.REGISTRY_PORT_101,
      });
      await confOperate({
        cli: "kind",
        type: options.type,
        id: kindName,
        content: aKind.yaml,
        filename: `${kindName}.yaml`,
      });
    }),
};

const K8sServices = {
  CmdBhttpWhoAmi: new Command()
    .description("whoami sub-command.")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options, ...args) => {
      await confOperate({
        cli: "kubectl",
        type: options.type,
        content: DevHttpServices.DeploySvcWhoAmi(),
        filename: "dev-whoami.yaml",
      });

      await confOperate({
        cli: "kubectl",
        type: options.type,
        content: DevHttpServices.DeploySvcBusyboxHttp(),
        filename: "dev-bhttpd.yaml",
      });
    }),

  CmdKeda: new Command()
    .description("install keda")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options) => {
      let content = undefined;

      if (options.type === "save") {
        content = await $.request(K8S_SERVICE.KEDA_URL_DEPLOYMENT).text();
      }

      await confOperate({
        cli: "kubectl",
        type: options.type,
        content,
        filename: K8S_SERVICE.KEDA_FILENAME,
      });
    }),

  CmdRedis: new Command()
    .description("install redis")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options) => {
      const content = InfraServices.DeploySvcRedis();

      await confOperate({
        cli: "kubectl",
        type: options.type,
        content,
        filename: K8S_SERVICE.REDIS_FILENAME,
      });
    }),
  CmdVault: new Command()
    .description("install vault dev")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options) => {
      const content = InfraServices.DeploySvcVaultDevOnly();

      await confOperate({
        cli: "kubectl",
        type: options.type,
        content,
        filename: K8S_SERVICE.VAULT_FILENAME,
      });
    }),
};

const DockerTool = {
  CmdSetupRegistry: new Command()
    .description("registry sub-command.")
    .action(async (options, ...args) => {
      try {
        await $`docker run -d --restart=always 
                -p "127.0.0.1:${CONF.REGISTRY_PORT_101}:${CONF.REGISTRY_PORT_101}" 
                --name ${CONF.REGISTRY_HOST_101} -e REGISTRY_HTTP_ADDR="0.0.0.0:${CONF.REGISTRY_PORT_101}" registry:2`;
      } catch (error) {
        console.log(error);
      }

      await $.sleep(1000);

      await $`docker network connect "kind" ${CONF.REGISTRY_HOST_101}`;

      await $.sleep(1000);

      await $`docker network inspect kind`;
    }),
};

const TestTool = {
  CmdDenoRedis: new Command()
    .description("Redis Testing")
    .action(async (options, ...args) => {
      const tsRedisClient = $.path("./redis-client-nodejs.ts");
      await DevTool.DevDenoTs({
        sh: tsRedisClient.textSync(),
        image: K8S_SERVICE.DENO_IMG_101,
      });
    }),

  CmdVaultOidc: new Command()
    .description("Vault/OIDC Testing")
    .action(async () => {
      await DevTool.DevCurl({
        url:
          "http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider/.well-known/openid-configuration",
      });
    }),

  TestBuildImage: async (
    imgRegistryHost: string,
    imgRepoName: string,
    imgTag: string,
    testsh: string,
  ) => {
    //  deno run -A app100.ts dev-curl http://registry.local:5001/v2/hellok8s/manifests/0.1.1
    await DevTool.DevCurl({ url: `http://${imgRegistryHost}/v2/_catalog` });
    await DevTool.DevCurl({
      url: `http://${imgRegistryHost}/v2/${imgRepoName}/manifests/${imgTag}`,
    });
    await DevTool.DevBusyboxSh({
      image: `${imgRegistryHost}/${imgRepoName}:${imgTag}`,
      sh: testsh,
    });
  },
  CmdBhttpWhoAmi: new Command()
    .description("test cmd110")
    .action(async (options, ...args) => {
      await DevTool.DevCurl({ url: "http://dev101.default.svc" });
      await DevTool.DevCurl({ url: "http://bhttpd136.default.svc:3000" });
    }),
  CmdBuildImgBusybox: new Command()
    .action(async (options, ...args) => {
      await TestTool.TestBuildImage(
        CONF.REGISTRY_HOST_PORT_101(),
        CONF.ERGISTRY_REPO_101,
        CONF.DEV_BUSYBOX_TAG_101,
        ShellScripts.BusyboxHello,
      );
    }),

  CmdBuildImgDenoApk: new Command()
    .action(async () => {
      await TestTool.TestBuildImage(
        CONF.REGISTRY_HOST_PORT_101(),
        CONF.ERGISTRY_REPO_101,
        CONF.DEV_DENO_APK_TAG_101,
        ShellScripts.DenoAlpineGitCurl,
      );
    }),
};

const DevToolType = {

  ArgDevCurl: z.object({
    url: z.string().url(),
    image: z.string().min(5).default("curlimages/curl:7.88.1"),
  }),
  
  ArgShellScript: z.object({
    sh: z.string().min(5).default(ShellScripts.BusyboxHello),
    image: z.string().min(5).default("busybox:1.36"),
  }),
};

const DevTool = {
  CmdInfo: new Command()
    .action(async () => {
      await $`kind get clusters`.printCommand();
      await $`kubectl get po,svc,deploy,job -A`.printCommand();
    }),

  DevCurl: async (fnArg: z.input<typeof DevToolType.ArgDevCurl>) => {
    const x = DevToolType.ArgDevCurl.parse(fnArg);
    //
    // [run commands don't return when using kubectl 1.22.x · Issue #1098 · kubernetes/kubectl](https://github.com/kubernetes/kubectl/issues/1098)
    //
    await $`KUBECTL_COMMAND_HEADERS=false kubectl run -it --rm debug-${CONF.GenRanString()} \
      --image=${x.image} \
      --restart=Never \
      --timeout=15s \
      -- sh -c 'date; id; env; curl -v --connect-timeout 10 ${x.url}'`;
  },
  DevBusyboxSh: async (fnArg: z.input<typeof DevToolType.ArgShellScript>) => {
    const x = DevToolType.ArgShellScript.parse(fnArg);
    await $`kubectl run -i --rm debug-${CONF.GenRanString()} --image=${x.image} -- sh`
      .stdinText(x.sh);
  },

  DevDenoTs: async (fnArg: z.input<typeof DevToolType.ArgShellScript>) => {
    const x = DevToolType.ArgShellScript.parse(fnArg);
    await $`kubectl run -i --rm debug-${CONF.GenRanString()} --image=${x.image} -- run -A -`
      .stdinText(x.sh).printCommand();
  },

  CmdCurl: new Command()
    .description("curl in k8s")
    .option("--image <val:string>", "The image for the curl container.")
    .arguments("<url:string>")
    .action(async (options, ...args) => {
      await DevTool.DevCurl({
        url: args[0],
        image: options.image,
      });
    }),

  CmdBusyboxSh: new Command()
    .description("busybox sh in k8s.")
    .option(
      "--image <val:string>",
      "The image for the container to run shell script.",
    )
    .option("-i, --stdin [stdin:boolean]", "Read shell script from stdin.")
    .action(async (options, ...args) => {
      let sh = undefined;
      if (options.stdin) {
        sh = new TextDecoder().decode(await readAll(Deno.stdin));
      }
      await DevTool.DevBusyboxSh({ sh, image: options.image });
    }),
};

const BuildImgTool = {
  CmdImgBusybox: new Command()
    .description("kaniko build sub-command.")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options, ...args) => {
      const jobName = "job220";
      const imgTag = CONF.DEV_BUSYBOX_TAG_101;
      const dockerFileText = Dockerfiles.BusyboxHello;
      await BuildImgTool.HandleScript(
        jobName,
        options.type,
        imgTag,
        dockerFileText,
      );
    }),

  CmdImgApk: new Command()
    .description("kaniko build sub-command.")
    .type("handle-level", confHandleType)
    .option("-t, --type <val:handle-level>", "conf handle type")
    .action(async (options, ...args) => {
      const jobName = "job221";
      const imgTag = CONF.DEV_DENO_APK_TAG_101;
      const dockerFileText = Dockerfiles.DenoAlpineGitCurl;
      await BuildImgTool.HandleScript(
        jobName,
        options.type,
        imgTag,
        dockerFileText,
      );
    }),

  HandleScript: async (
    jobName: string,
    type: any,
    imgTag: string,
    dockerFileText: string,
  ) => {
    const confJob: TJobReq = {
      name: jobName,
      imgRegistryHostAndPort: CONF.REGISTRY_HOST_PORT_101(),
      imgRepoName: "hellok8s",
      imgTag,
      dockerFileText,
    };

    const { jobMetadataName, jobYaml } = jobKanikoBuild(confJob);
    await confOperate({
      cli: "kubectl",
      type,
      content: jobYaml,
      filename: `${jobMetadataName}.yaml`,
    });

    // if (type === "apply") {
    //   await $`kubectl wait --for=condition=complete job/${jobMetadataName} --timeout=300s`;
    //   await handleAfterBuildImage(confJob, testsh);
    // }
  },

  __cmd220BuildImgRaw: new Command()
    .description("kaniko build sub-command.")
    .action(async (options, ...args) => {
      await $`kubectl apply -f kconf100/build100.yaml`;
      await $`kubectl wait --for=condition=ready pod kaniko`;
      await $.sleep(9000);
      await $`kubectl logs kaniko kaniko`;
      await $.sleep(1000);
      await DevTool.DevCurl({ url: "http://registry.local:5001/v2/_catalog" });
      await $.sleep(1000);
      await DevTool.DevCurl({
        url: "http://registry.local:5001/v2/hello101/tags/list",
      });
      await $.sleep(1000);
      await DevTool.DevBusyboxSh({
        image: "registry.local:5001/hello101:v0.1.4",
        sh: `env ; id ; echo "show /hello" ;cat /hello
            `,
      });
      await $.sleep(1000);
      await $`kubectl delete -f kconf100/build100.yaml`;
    }),
};

const confRunLevelType = new EnumType(ConfRunLevel);

const fnArgRunHandle = z.object({
  confContent: z.string().min(1),
  filename: z.string().min(5),
  dir: z.string().min(1),
});

const handleRunLevel = async (
  lv: ConfRunLevel,
  fnarg: z.infer<typeof fnArgRunHandle>,
) => {
  fnArgRunHandle.parse(fnarg);
  const confDir = $.path(fnarg.dir);
  const confFile = confDir.join(fnarg.filename);
  switch (lv) {
    case ConfRunLevel.dryrun:
      console.log(fnarg.confContent);
      break;
    case ConfRunLevel.write:
      console.log(`write conf to ${fnarg.filename}`);
      if (!confDir.isDir()) {
        confDir.mkdirSync();
      }
      confFile.writeTextSync(fnarg.confContent);
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

const argDevCurl = z.object({
  url: z.string().url(),
  image: z.string().min(5).default("curlimages/curl:7.88.1"),
});

export const genRanString = () => {
  return Math.random().toString(36).substring(2, 7);
};

const devCurl = async (fnArg: z.input<typeof argDevCurl>) => {
  const x = argDevCurl.parse(fnArg);
  //
  // [run commands don't return when using kubectl 1.22.x · Issue #1098 · kubernetes/kubectl](https://github.com/kubernetes/kubectl/issues/1098)
  //
  await $`KUBECTL_COMMAND_HEADERS=false kubectl run -it --rm debug-${genRanString()} \
  --image=${x.image} \
  --restart=Never \
  --timeout=10s \
  -- sh -c 'date; id; env; curl -v --connect-timeout 5 ${x.url}'`;
};

const shTesting = `#!/bin/sh
env
echo "==> hello sh world"
id
date
busybox | head -1
`;

const argShellScript = z.object({
  sh: z.string().min(5).default(shTesting),
  image: z.string().min(5).default("busybox:1.36"),
});

const devBusyboxSh = async (fnArg: z.input<typeof argShellScript>) => {
  const x = argShellScript.parse(fnArg);
  // await $`echo ${x.image}`;
  await $`kubectl run -i --rm debug-${genRanString()} --image=${x.image} -- sh`
    .stdinText(x.sh);
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
    const confContent = DevHttpServices.DeployCiliumIngressNodePort();
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

const cmdCurl = new Command()
  .description("curl in k8s")
  .option("--image <val:string>", "The image for the curl container.")
  .arguments("<url:string>")
  .action(async (options, ...args) => {
    await devCurl({
      url: args[0],
      image: options.image,
    });
  });

export const DafuCmd = new Command()
  .name("dafu")
  .version("0.1.1")
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
  .command("info", DevTool.CmdInfo)
  .command("100-kind", KindTool.CmdSetupKind)
  .command("110-bhttp-whoami", K8sServices.CmdBhttpWhoAmi)
  .command("110-bhttp-whoami-test", TestTool.CmdBhttpWhoAmi)
  .command("120-keda", K8sServices.CmdKeda)
  .command("130-redis", K8sServices.CmdRedis)
  .command("130-redis-test", TestTool.CmdDenoRedis)
  .command("140-vault", K8sServices.CmdVault)
  .command("140-vault-test", TestTool.CmdVaultOidc)
  .command("200-kind-registry", KindTool.CmdSetupKindRegistry)
  .command("210-docker-registry", DockerTool.CmdSetupRegistry)
  .command("220-buildimg", BuildImgTool.CmdImgBusybox)
  .command("220-buildimg-test", TestTool.CmdBuildImgBusybox)
  .command("221-buildimg-apk", BuildImgTool.CmdImgApk)
  .command("221-buildimg-apk-test", TestTool.CmdBuildImgDenoApk)
  .command("dev-curl", DevTool.CmdCurl)
  .command("dev-sh", DevTool.CmdBusyboxSh)
  .command("help", new HelpCommand().global());
