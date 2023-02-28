import {
  ApiObject,
  ApiObjectMetadataDefinition,
  App,
  Chart,
  JsonPatch,
} from "npm:cdk8s";
import {
  Deployment,
  Ingress,
  IngressBackend,
  Service,
} from "npm:cdk8s-plus-25";
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";

export class Kapp {
  app: App;
  chart: Chart;
  constructor(chartId = "c101") {
    this.app = new App();
    this.chart = new Chart(this.app, chartId);
  }
  get yaml() {
    return this.app.synthYaml();
  }
}

const fnArgLabel = z.object({
  key: z.string().min(5),
  value: z.string().min(3),
});

const LabelCd23: z.infer<typeof fnArgLabel> = {
  key: "dltdojo.org/cd23",
  value: "dafu101",
};

const addCd23Labels = (
  label: z.infer<typeof fnArgLabel>,
  ...metadatas: ApiObjectMetadataDefinition[]
) => {
  fnArgLabel.parse(label);
  metadatas.forEach((v) => v.addLabel(label.key, label.value));
};

const fnArgDevDeploy = z.object({
  img: z.string().min(5),
  portNumber: z.number().gte(80),
  svcDnsId: z.string().min(3),
});

export const getDevDeplyAndSvc = (chart: Chart, fnarg: z.infer<typeof fnArgDevDeploy>) => {
  fnArgDevDeploy.parse(fnarg);
  const deploy = new Deployment(chart, fnarg.img, {
    replicas: 2,
    containers: [{
      image: fnarg.img,
      portNumber: fnarg.portNumber,
      securityContext: {
        ensureNonRoot: false,
        readOnlyRootFilesystem: false,
      },
    }],
  });
  const svc = new Service(chart, fnarg.svcDnsId, {
    metadata: {
      name: fnarg.svcDnsId,
    },
    selector: deploy,
    ports: [
      {
        port: fnarg.portNumber,
      },
    ],
  });

  addCd23Labels(LabelCd23, deploy.metadata, deploy.podMetadata, svc.metadata);
  return svc;
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

  addCd23Labels(LabelCd23, ingress.metadata);

  // IngressClassName only in cdk8splus26/k8s/IngressSpec.go
  // https://github.com/search?q=org%3Acdk8s-team+ingressClassName&type=code
  // https://cdk8s.io/docs/latest/basics/escape-hatches/#patching-api-objects-directly
  //
  const kubeIngress = ApiObject.of(ingress);
  kubeIngress.addJsonPatch(JsonPatch.add("/spec/ingressClassName", "cilium"));
  return ingress;
};

export class DemoCiliumIngressNodePort {
  appName: string;
  kapp: Kapp;

  constructor(name: string) {
    this.appName = name || "k101";
    this.kapp = new Kapp(this.appName);
    const svcWhoami = getDevDeplyAndSvc(this.kapp.chart, {
      img: "traefik/whoami:v1.8.7",
      portNumber: 80,
      svcDnsId: "dev101",
    });
    const svcNginx = getDevDeplyAndSvc(this.kapp.chart, {
      img: "nginx:stable-alpine",
      portNumber: 80,
      svcDnsId: "dev201",
    });
    //
    // https://docs.cilium.io/en/stable/network/servicemesh/ingress/
    // https://docs.cilium.io/en/stable/network/servicemesh/http/
    // [ingress: Support NodePort for dedicated Ingress by sayboras · Pull Request #22974 · cilium/cilium](https://github.com/cilium/cilium/pull/22974)
    //
    const ingress = getNodePortIngress(this.kapp.chart);

    ingress.addHostRule(
      "dev101.default.svc",
      "/",
      IngressBackend.fromService(svcWhoami),
    );
    ingress.addHostRule(
      "dev201.default.svc",
      "/",
      IngressBackend.fromService(svcNginx),
    );
    ingress.addDefaultBackend(IngressBackend.fromService(svcWhoami));
  }

  yaml() {
    return this.kapp.yaml;
  }
}
