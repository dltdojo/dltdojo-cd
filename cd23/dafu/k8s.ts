import { ApiObject, App, Chart, Duration, JsonPatch, Size } from "npm:cdk8s";
import {
  ConfigMap,
  Cpu,
  Deployment,
  EnvValue,
  Ingress,
  IngressBackend,
  Job,
  Service,
  Volume,
} from "npm:cdk8s-plus-25";
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
import { ConfigureFile, Dockerfiles, ShellScripts } from "./shellscript.ts";
import { CONF, K8S_SERVICE } from "./appconf.ts";

export class Kapp {
  app: App;
  chart: Chart;
  constructor(chartId = "c101") {
    this.app = new App();
    this.chart = new Chart(this.app, chartId);
  }
  get yaml(): string {
    return this.app.synthYaml();
  }
}

const ArgDevDeploy = z.object({
  img: z.string().min(5),
  portNumber: z.number().gte(80),
  svcDnsId: z.string().min(3),
  replicas: z.number().optional().default(1),
});

export const addDevDeplyAndSvc = (
  chart: Chart,
  farg: z.input<typeof ArgDevDeploy>,
  envs?: {
    [name: string]: EnvValue;
  },
) => {
  const x = ArgDevDeploy.parse(farg);
  const deploy = new Deployment(chart, x.img, {
    replicas: x.replicas,
    containers: [{
      image: x.img,
      portNumber: x.portNumber,
      envVariables: envs,
      securityContext: {
        ensureNonRoot: false,
        readOnlyRootFilesystem: false,
      },
      resources: {
        cpu: {
          limit: Cpu.millis(100),
          request: Cpu.millis(50),
        },
        memory: {
          limit: Size.mebibytes(64),
          request: Size.mebibytes(32),
        },
      },
    }],
  });

  const svc = new Service(chart, x.svcDnsId, {
    metadata: {
      name: x.svcDnsId,
    },
    selector: deploy,
    ports: [
      {
        port: x.portNumber,
      },
    ],
  });
  return { deploy, svc };
};

export const getNodePortIngress = (chart: Chart) => {
  const ingress = new Ingress(chart, "ing", {
    metadata: {
      annotations: {
        "io.cilium.ingress/service-type": "NodePort",
        "io.cilium.ingress/insecure-node-port": "32080",
        // "io.cilium.ingress/secure-node-port": "32443",
        "io.cilium.ingress/loadbalancer-mode": "dedicated",
      },
    },
  });
  // IngressClassName only in cdk8splus26/k8s/IngressSpec.go
  // https://github.com/search?q=org%3Acdk8s-team+ingressClassName&type=code
  // https://cdk8s.io/docs/latest/basics/escape-hatches/#patching-api-objects-directly
  //
  const kubeIngress = ApiObject.of(ingress);
  kubeIngress.addJsonPatch(JsonPatch.add("/spec/ingressClassName", "cilium"));
  return ingress;
};

const SupportTools = {
  addContainerSh: (deploy: Deployment, index: number, sh: string) => {
    const kubeDeploy = ApiObject.of(deploy);
    kubeDeploy.addJsonPatch(
      JsonPatch.add(`/spec/template/spec/containers/${index}/args`, [
        "sh",
        "-c",
        sh,
      ]),
    );
  },

  addContainerCmd: (deploy: Deployment, index: number, cmds: string[]) => {
    const kubeDeploy = ApiObject.of(deploy);
    kubeDeploy.addJsonPatch(
      JsonPatch.add(`/spec/template/spec/containers/${index}/command`, cmds),
    );
  },

  addContainerEnv: (deploy: Deployment, index: number, env: any) => {
    const kubeDeploy = ApiObject.of(deploy);
    kubeDeploy.addJsonPatch(
      JsonPatch.add(`/spec/template/spec/containers/${index}/env/`, env),
    );
  },
};

export const InfraServices = {
  DeploySvcRedis: () => {
    // https://hub.docker.com/_/redis/tags
    // 7.0.9-alpine3.17

    const kapp = new Kapp();

    // https://kubernetes.io/docs/tutorials/configuration/configure-redis-using-configmap/
    const cm101 = new ConfigMap(kapp.chart, "cm101");
    cm101.addData("redis-config", ConfigureFile.RedisNoProtect101);

    const containerMountDir = "/redis-master";
    const containerMountFileName = "redis.conf";

    const volRedisConfFile = Volume.fromConfigMap(kapp.chart, "vol101", cm101, {
      items: {
        "redis-config": { path: containerMountFileName, mode: 444 },
      },
    });

    const envVariable = {
      "MASTER": EnvValue.fromValue("true"),
    };

    const { deploy, svc } = addDevDeplyAndSvc(kapp.chart, {
      replicas: 1,
      img: K8S_SERVICE.REDIS_IMG,
      portNumber: 6379,
      svcDnsId: K8S_SERVICE.REDIS_SRV_ID,
    }, envVariable);

    const c1 = deploy.containers.at(0);
    if (c1) {
      c1.mount(containerMountDir, volRedisConfFile);
    }

    SupportTools.addContainerCmd(deploy, 0, [
      "redis-server",
      `${containerMountDir}/${containerMountFileName}`,
    ]);
    // SupportTools.addContainerEnv(deploy, 0, { name: 'STER', value: 'true' })
    return kapp.yaml;
  },
};

export const DevHttpServices = {
  DeploySvcWhoAmi: () => {
    const kapp = new Kapp();
    addDevDeplyAndSvc(kapp.chart, {
      replicas: 2,
      img: "traefik/whoami:v1.8.7",
      portNumber: 80,
      svcDnsId: "dev101",
    });
    return kapp.yaml;
  },

  DeploySvcBusyboxHttp: () => {
    const kapp = new Kapp();
    const { deploy, svc } = addDevDeplyAndSvc(kapp.chart, {
      replicas: 1,
      img: "busybox:1.36",
      portNumber: 3000,
      svcDnsId: "bhttpd136",
    });
    SupportTools.addContainerSh(deploy, 0, ShellScripts.BusyboxHttpd);
    return kapp.yaml;
  },

  DeployCiliumIngressNodePort: () => {
    const kapp = new Kapp();

    const whoami = addDevDeplyAndSvc(kapp.chart, {
      replicas: 2,
      img: "traefik/whoami:v1.8.7",
      portNumber: 80,
      svcDnsId: "dev101",
    });
    const busybox = addDevDeplyAndSvc(kapp.chart, {
      replicas: 1,
      img: "busybox:1.36",
      portNumber: 3000,
      svcDnsId: "bhttpd136",
    });
    //
    // https://docs.cilium.io/en/stable/network/servicemesh/ingress/
    // https://docs.cilium.io/en/stable/network/servicemesh/http/
    // [ingress: Support NodePort for dedicated Ingress by sayboras · Pull Request #22974 · cilium/cilium](https://github.com/cilium/cilium/pull/22974)
    //
    const ingress = getNodePortIngress(kapp.chart);

    ingress.addHostRule(
      "dev101.default.svc",
      "/",
      IngressBackend.fromService(whoami.svc),
    );
    ingress.addHostRule(
      "dev201.default.svc",
      "/",
      IngressBackend.fromService(busybox.svc),
    );
    ingress.addDefaultBackend(IngressBackend.fromService(whoami.svc));
    return kapp.yaml;
  },
};

const getDockerFileContent = (text?: string) => {
  return `#!/bin/sh
id
env
date
pwd
cat <<EOF > /workspace/Dockerfile
${text ?? Dockerfiles.BusyboxHello}
EOF
`;
};

const ArgJobReq = z.object({
  name: z.string().min(5).optional().default("job101"),
  // destination: z.string().min(5).default('registry.local:5001/hellok8s:v0.0.1'),
  imgRegistryHostAndPort: z.string().min(5).default(
    CONF.REGISTRY_HOST_PORT_101(),
  ),
  imgRepoName: z.string().min(5).default(CONF.ERGISTRY_REPO_101),
  imgTag: z.string().min(3).default("0.0.1"),
  jobTTL: z.number().min(60).default(300),
  jobDeadline: z.number().min(60).default(300),
  dockerFileText: z.string().min(10).optional(),
});

export type TJobReq = z.input<typeof ArgJobReq>;

const ArgJobResp = z.object({
  jobMetadataName: z.string().min(5),
  jobYaml: z.string().min(5),
});

export const jobKanikoBuild = (
  farg: z.input<typeof ArgJobReq>,
): z.infer<typeof ArgJobResp> => {
  const x = ArgJobReq.parse(farg);
  const destination =
    `${x.imgRegistryHostAndPort}/${x.imgRepoName}:${x.imgTag}`;
  const kapp = new Kapp();
  const vol = Volume.fromEmptyDir(kapp.chart, "vol100", "workspace");

  const job = new Job(kapp.chart, x.name, {
    metadata: {
      labels: {
        "kaniko.build/repo": x.imgRepoName,
        "kaniko.build/tag": x.imgTag,
      },
    },
    ttlAfterFinished: Duration.seconds(x.jobTTL),
    activeDeadline: Duration.seconds(x.jobDeadline),
    initContainers: [
      {
        image: "busybox:1.36",
        command: [
          "sh",
          "-c",
          getDockerFileContent(x.dockerFileText),
        ],
        securityContext: {
          ensureNonRoot: false,
        },
        volumeMounts: [
          {
            volume: vol,
            path: "/workspace",
          },
        ],
      },
    ],
    containers: [
      {
        image: "gcr.io/kaniko-project/executor:latest",
        args: [
          "--dockerfile=Dockerfile",
          `--destination=${destination}`,
          "--context=/worksapce",
          "--insecure",
          "--cache=true",
          "--verbosity=debug",
          "--reproducible",
        ],
        securityContext: {
          ensureNonRoot: false,
          readOnlyRootFilesystem: false,
        },
        volumeMounts: [
          {
            volume: vol,
            path: "/workspace",
          },
        ],
      },
    ],
  });

  return {
    jobMetadataName: job.metadata.name || "job101",
    jobYaml: kapp.yaml,
  };
};
