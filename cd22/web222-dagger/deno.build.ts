// import Client, { connect } from "npm:@dagger.io/dagger";
// 221118 ubuntu 20.04 deno 1.28.1
// [NodeJS SDK: Execute dagger sdk from within a container: spawn Unknown system error -8 · Issue #3857 · dagger/dagger](https://github.com/dagger/dagger/issues/3857)
import Client, { connect } from "https://esm.sh/@dagger.io/dagger";
// initialize Dagger client
connect(async (client: Client) => {
  // get Node image
  // get Node version
  const node = await client.container().from("busybox:1.35.0").exec(["env"])

  // execute
  const version = await node.stdout().contents()

  // print output
  console.log("Hello from Dagger and Node " + version.contents)
})

