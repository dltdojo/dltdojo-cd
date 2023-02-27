import { ApiObject, App, Chart, JsonPatch } from "npm:cdk8s";
import { Deployment, Ingress, IngressBackend } from "npm:cdk8s-plus-25";

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

const addCd23Labels = (...metadatas) => {
  metadatas.forEach((v) => v.addLabel("dltdojo.org/cd23", "dafu"));
};

export const getWhoamiDeplyAndSvc = (chart: Chart) => {
  const deploy = new Deployment(chart, "whoami", {
    replicas: 2,
    containers: [{
      image: "traefik/whoami",
      portNumber: 80,
      securityContext: {
        ensureNonRoot: false,
      },
    }],
  });
  const svc = deploy.exposeViaService({
    ports: [
      {
        port: 80,
      },
    ],
  });

  addCd23Labels(deploy.metadata, deploy.podMetadata, svc.metadata)
  return svc;
};

export const getNginxDeplyAndSvc = (chart: Chart) => {
  const deploy = new Deployment(chart, "nginx", {
    replicas: 2,
    containers: [{
      image: "nginx",
      portNumber: 80,
      securityContext: {
        ensureNonRoot: false,
        readOnlyRootFilesystem: false,
      },
    }],
  })
  const svc = deploy.exposeViaService({
    ports: [
      {
        port: 80,
      },
    ],
  });
  addCd23Labels(deploy.metadata, deploy.podMetadata, svc.metadata)
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

  addCd23Labels(ingress.metadata)

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
    const svcWhoami = getWhoamiDeplyAndSvc(this.kapp.chart);
    const svcNginx = getNginxDeplyAndSvc(this.kapp.chart);
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
