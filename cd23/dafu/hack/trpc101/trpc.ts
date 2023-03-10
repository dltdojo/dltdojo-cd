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
  async run() {
    const url = "http://127.0.0.1:8000/trpc";

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

const TrpcInit = {
  trpc: initTRPC.create()
}

const TrpcRouter = {
  postRouter: TrpcInit.trpc.router({
    createPost: TrpcInit.trpc.procedure
      .input(z.object({ title: z.string() }))
      .mutation(({ input }) => {
        const post = {
          id: ++TempDb.id,
          ...input,
        };
        TempDb.db.posts.push(post);
        return post;
      }),
    listPosts: TrpcInit.trpc.procedure.query(() => TempDb.db.posts),
  }),
}

const TrpcAppRouter = {
  appRouter: TrpcInit.trpc.router({
      post: TrpcRouter.postRouter,
      hello: TrpcInit.trpc.procedure.input(z.string().nullish()).query(
        ({ input }) => {
          return `hello ${input ?? "world"}`;
        },
      ),
    }),
}

export type AppRouter = typeof TrpcAppRouter.appRouter;

const TrpcServer = {
  serve() {
    serve(this.handler);
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

const Zapp = {
  role: z.enum(["system", "user", "assistant"]),
  get message() {
    return z.object({
      role: this.role,
      content: z.string().min(1),
    });
  },

  get messageRecord() {
    return z.record(
      this.role,
      z.string(),
    );
  },

  get EnumRole() {
    return this.role.enum;
  },
};

const CliffyCli = {
  enumRole: new EnumType(Zapp.role.options),
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
  });

const cmdServer = new Command()
  .description("server")
  .action(() => {
    TrpcServer.serve();
  });

const cmdClient = new Command()
  .description("client")
  .action(() => {
    TrpcClient.run();
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
