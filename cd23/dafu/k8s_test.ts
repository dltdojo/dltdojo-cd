import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import {
  parse,
  stringify,
} from "https://deno.land/std@0.178.0/encoding/yaml.ts";
import { jobKanikoBuild, DevHttpServices, InfraServices } from "./k8s.ts";

Deno.test("kind test", () => {
  const { jobMetadataName, jobYaml } = jobKanikoBuild({
    jobTTL: 100,
  });
  const foo: any = parse(jobYaml);
  // console.log(jobYaml);
  assertStringIncludes(jobMetadataName, "c101-job101");
  assertEquals(foo.kind, "Job");
  assertStringIncludes(jobYaml, "ttlSecondsAfterFinished: 100");
});

Deno.test("busybox httpd test", () => {
  const x = DevHttpServices.DeploySvcBusyboxHttp()
  // console.log(x)
  assertStringIncludes(x, '/www/index.html')
});

Deno.test("redis test", () => {
  const x = InfraServices.DeploySvcRedis()
  console.log(x)
  assertStringIncludes(x, 'redis')
});
