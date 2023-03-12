import "https://deno.land/std@0.178.0/dotenv/load.ts";
import {
  Command,
  EnumType,
  HelpCommand,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { fetchRequestHandler } from "npm:@trpc/server/adapters/fetch";
import { initTRPC } from "npm:@trpc/server";
import {
  createTRPCProxyClient,
  httpBatchLink,
  loggerLink,
} from "npm:@trpc/client";

const Zapp0 = {
  roleFoo: z.enum(["system", "user", "assistant"]),
  env: z.object({
    FOOAPP_PORT: z.coerce.number().min(80).optional().default(8000),
  }),
};

const Env0 = Zapp0.env.parse(Deno.env.toObject());

const _Zapp = {
  messageFoo: z.object({
    role: Zapp0.roleFoo,
    content: z.string().min(1),
  }),
  messageRecordFoo: z.record(
    Zapp0.roleFoo,
    z.string(),
  ),
  EnumRoleFoo: Zapp0.roleFoo.enum,
};

const TempDb = {
  id: 1,
  db: {
    posts: [
      {
        id: 1,
        title: "hello",
      },
    ],
  },
};

const sleep = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const TrpcClient = {
  async run(url: string) {
    // const url = `http://127.0.0.1:${EnvDa.FOOAPP_PORT}/trpc`;

    const proxy = createTRPCProxyClient<AppRouter>({
      links: [loggerLink(), httpBatchLink({ url })],
    });

    await sleep();

    // parallel queries
    await Promise.all([
      //
      proxy.hello.query(),
      proxy.hello.query("client"),
    ]);
    await sleep();

    const postCreate = await proxy.post.createPost.mutate({
      title: "hello client",
    });
    console.log("created post", postCreate.title);
    await sleep();

    const postList = await proxy.post.listPosts.query();
    console.log("has posts", postList, "first:", postList[0].title);
    await sleep();

    console.log("👌 should be a clean exit if everything is working right");
  },
};

const Trpc0 = {
  trpc: initTRPC.create(),
  zPostInput: z.object({title: z.string().min(3)}),
  zHelloInput: z.string().nullish()
};

const TrpcRouter = {
  post: Trpc0.trpc.router({
    createPost: Trpc0.trpc.procedure
      .input(Trpc0.zPostInput)
      .mutation(({ input }) => {
        const post = {
          id: ++TempDb.id,
          ...input,
        };
        TempDb.db.posts.push(post);
        return post;
      }),
    listPosts: Trpc0.trpc.procedure.query(() => TempDb.db.posts),
  }),
  hello: Trpc0.trpc.procedure.input(Trpc0.zHelloInput).query(
    ({ input }) => {
      return `hello ${input ?? "world"}`;
    },
  ),
};

const TrpcAppRouter = {
  appRouter: Trpc0.trpc.router({
    post: TrpcRouter.post,
    hello: TrpcRouter.hello,
  }),
};

export type AppRouter = typeof TrpcAppRouter.appRouter;

const TrpcServer = {
  serve(port: number) {
    serve(this.handler, {
      port,
    });
  },

  handler(request: Request) {
    // Only used for start-server-and-test package that
    // expects a 200 OK to start testing the server
    if (request.method === "HEAD") {
      return new Response();
    }

    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: TrpcAppRouter.appRouter,
      createContext: () => ({}),
    });
  },
};

const CliffyCli = {
  enumRole: new EnumType(Zapp0.roleFoo.options),
};

const cmdFoo = new Command()
  .description("coding tool")
  .type("foo-level", CliffyCli.enumRole)
  .option("-t, --type <val:foo-level>", "some foo type")
  .option(
    "-n, --num <num:integer>",
    "the number of suggestions, rewrites or challenges.",
  )
  .option("-z, --zhtw", "translate to zhTW")
  .action((options, ...args) => {
    console.log(options, args);
    console.log(Env0);
  });

const cmdServer = new Command()
  .description("server")
  .option(
    "-p, --port <port:integer>",
    "set the server's port or env FOOAPP_PORT",
    { default: Env0.FOOAPP_PORT },
  )
  .action((options) => {
    TrpcServer.serve(options.port);
  });

const cmdClient = new Command()
  .description("client")
  .option(
    "-u, --url <url:string>",
    "trpc service url",
  )
  .action((options) => {
    const trpcUrl = options.url ?? `http://127.0.0.1:${Env0.FOOAPP_PORT}/trpc`;
    TrpcClient.run(trpcUrl);
  });

await new Command()
  .name("trpc")
  .version("0.1.0")
  .description(
    "tRPC tryrun",
  )
  .action((_options, ...args) => {
    console.log(args);
  })
  .command("server", cmdServer)
  .command(
    "client",
    cmdClient,
  )
  .command("foo", cmdFoo)
  .command("help", new HelpCommand().global())
  .parse(Deno.args);
