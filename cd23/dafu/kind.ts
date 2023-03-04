import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
import {
  parse,
  stringify,
} from "https://deno.land/std@0.177.0/encoding/yaml.ts";

const KindConf = z.object({
  kindName: z.string().startsWith("k").min(4).max(64).default("kind"),
  image: z.string().min(5).default(
    `kindest/node:1.25.3@sha256:f52781bc0d7a19fb6c405c2af83abfeb311f130707a0e219175677e366cc45d1`,
  ),
});

const KindConfRegistry = z.object({
  registryHost: z.string().min(4).default("registry.local"),
  registryPort: z.string().min(4).default("5001"),
});

export class KindYaml {
  #body: any;
  constructor(farg: z.input<typeof KindConf>) {
    const x = KindConf.parse(farg);
    this.#body = parse(`apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
name: ${x.kindName}
nodes:
- role: control-plane
  image: "${x.image}"
- role: worker
  image: "${x.image}"
  `);
  }

  addLocalRegistryPatch(farg: z.input<typeof KindConfRegistry>) {
    const arg = KindConfRegistry.parse(farg);
    const patchArray = [
      `[plugins."io.containerd.grpc.v1.cri".registry.mirrors."${arg.registryHost}:${arg.registryPort}"]\n  endpoint = ["http://${arg.registryHost}:${arg.registryPort}"]`,
    ];
    this.#body.containerdConfigPatches = patchArray;
  }

  get yaml() {
    return stringify(this.#body);
  }
}
