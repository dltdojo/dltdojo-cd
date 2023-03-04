import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import {
  parse,
  stringify,
} from "https://deno.land/std@0.178.0/encoding/yaml.ts";
import { KindYaml } from "./kind.ts";

Deno.test("kind test", () => {
  const kindYaml = new KindYaml({});
  assertEquals(kindYaml.body.name, "kind");
  assertEquals(
    new KindYaml({
      kindName: "kfoo1234",
    }).body.name,
    "kfoo1234",
  );
});

Deno.test("kind name test", () => {
  assertThrows(() => {
    new KindYaml({ kindName: "foo1234" });
  });
});

Deno.test("registry test", () => {
  const kindYaml = new KindYaml({});
  kindYaml.addLocalRegistryPatch({
    registryHost: "registry.local.abc",
    registryPort: "5901",
  });
  assertEquals(kindYaml.body.containerdConfigPatches.length, 1);
  assertEquals(
    kindYaml.body.containerdConfigPatches[0],
    '[plugins."io.containerd.grpc.v1.cri".registry.mirrors."registry.local.abc:5901"]\n  endpoint = ["http://registry.local.abc:5901"]',
  );
});
