import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
  assertThrows,
} from "https://deno.land/std@0.179.0/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
//
// http service
//
import { Server } from "https://deno.land/std@0.179.0/http/server.ts";
//
// koskimas/kysely: A type-safe typescript SQL query builder https://github.com/koskimas/kysely
// 
import {
  DummyDriver,
  Generated,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'npm:kysely@0.23.5'
//
// sqlite3
// 
import { DB as DenoSqliteDB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
//
// graphql 
//
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts";
import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";
//
// tRPC server
//
import { initTRPC } from 'npm:@trpc/server';
import { fetchRequestHandler } from 'npm:@trpc/server/adapters/fetch';
//
// tRPC client
//
import {
  createTRPCProxyClient,
  httpBatchLink,
  loggerLink,
  TRPCClientError
} from 'npm:@trpc/client';
import { SqliteDriver as WasmSqliteDriver } from './kysely_sqlite.ts'

Deno.test("sqlite test", () => {
  const db = new DenoSqliteDB();
  db.execute(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )
`);

  // Run a simple query
  for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
    db.query("INSERT INTO people (name) VALUES (?)", [name]);
  }

  // Print out data in table
  const result: string[] = [];
  for (const [name] of db.query("SELECT name FROM people")) {
    // console.log(name);
    if (typeof name === "string") {
      result.push(name);
    }
  }

  // Close connection
  db.close();
  assertEquals(result.length, 3);
  assertArrayIncludes(result, ["Peter Parker", "Clark Kent", "Bruce Wayne"]);
});

//
// [How to Build a GraphQL Server with Deno](https://deno.com/blog/build-a-graphql-server-with-deno)
// [denoland/deno-graphql: Example of a GraphQL server with Deno.](https://github.com/denoland/deno-graphql)
//
Deno.test("graphql hello world test", async () => {
  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'Hello, World!',
    },
  };

  const schema = makeExecutableSchema({ resolvers, typeDefs });
  const server = new Server({
    handler: async (req) => {
      const { pathname } = new URL(req.url);
      return pathname === "/graphql"
        ? await GraphQLHTTP<Request>({
          schema,
          graphiql: true,
        })(req)
        : new Response("Not Found", { status: 404 });
    },
    port: 3000,
  });

  const body = JSON.stringify({
    query: "{ hello }",
  });

  setTimeout(async () => {
    console.log("test here");
    const resp = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      body,
    });
    const respJson = await resp.json();
    assertObjectMatch(respJson.data, {
      hello: "Hello, World!",
    });
    server.close();
  }, 1000);

  await server.listenAndServe();
});

export class SchemaTest {
  static readonly person = z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(30).nullable()
  })
  // Type-guards for person type
  // deno-lint-ignore no-explicit-any
  static readonly isPerson = (v: any): v is SchemaTest.TypePerson => SchemaTest.person.safeParse(v).success
  // deno-lint-ignore no-explicit-any
  static readonly isPersionFirstName = (v: any): v is z.TypeOf<typeof SchemaTest.person.shape.firstName> => SchemaTest.person.shape.firstName.safeParse(v).success

  static readonly dinosaur = z.object({
    name: z.string().min(2).max(20),
    description: z.string().min(2).max(200).nullable()
  })

  // deno-lint-ignore no-explicit-any
  static readonly isDinosaur = (v: any): v is SchemaTest.TypeDinosaur => SchemaTest.dinosaur.safeParse(v).success

  static readonly allDinosaurs = (db: DenoSqliteDB) => {
    const rows = db.queryEntries<SchemaTest.TypeDinosaur>("SELECT name, description FROM dinosaurs");
    return rows;
  };

  static readonly oneDinosaur = (db: DenoSqliteDB, args: any) => {
    return db.queryEntries<SchemaTest.TypeDinosaur>("SELECT name, description FROM dinosaurs WHERE name = ?", [args.name]);
  };

  static readonly addDinosaur = (db: DenoSqliteDB, args: any) => {
    const result = db.queryEntries<SchemaTest.TypeDinosaur>('INSERT INTO dinosaurs(name, description) VALUES( ? , ? ) RETURNING name, description', [args.name, args.description])
    return result[0];
  };

  static readonly queryDinosaur = (db: DenoSqliteDB, sql: string, args?: any[]) => {
    return db.queryEntries<SchemaTest.TypeDinosaur>(sql, args);
  };
}

// deno-lint-ignore no-namespace
export namespace SchemaTest {
  export type TypePerson = z.TypeOf<typeof SchemaTest.person>
  export type TypePersonFirstName = z.TypeOf<typeof SchemaTest.person.shape.firstName>
  export type TypePersonLastName = z.TypeOf<typeof SchemaTest.person.shape.lastName>
  export type TypeDinosaur = z.TypeOf<typeof SchemaTest.dinosaur>
}

Deno.test("graphql sqlite3 test", async () => {

  const db = new DenoSqliteDB();
  db.execute(`
  CREATE TABLE IF NOT EXISTS dinosaurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`);


  const typeDefs = gql`
  type Query {
    allDinosaurs: [Dinosaur]
    oneDinosaur(name: String): Dinosaur
  }

  type Dinosaur {
    name: String
    description: String
  }

  type Mutation {
    addDinosaur(name: String, description: String): Dinosaur
  }
`;

  const resolvers = {
    Query: {
      allDinosaurs: () => SchemaTest.allDinosaurs(db),
      oneDinosaur: (_: any, args: any) => SchemaTest.oneDinosaur(db, args),
    },
    Mutation: {
      addDinosaur: (_: any, args: any) => SchemaTest.addDinosaur(db, args),
    },
  };

  const schema = makeExecutableSchema({ resolvers, typeDefs });
  const server = new Server({
    handler: async (req) => {
      const { pathname } = new URL(req.url);
      return pathname === "/graphql"
        ? await GraphQLHTTP<Request>({
          schema,
          graphiql: true,
        })(req)
        : new Response("Not Found", { status: 404 });
    },
    port: 3000,
  });

  const bodyQueryHumanError = JSON.stringify({
    query: "{ hello }",
  });

  const bodyQueryAllDinosaurs = JSON.stringify({
    query: `query {
      allDinosaurs {
        name
        description
      }
    }`,
  });

  setTimeout(async () => {
    const respHumanErrorNotExist = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      body: bodyQueryHumanError,
    });
    const respErrorJson = await respHumanErrorNotExist.json();
    // console.log(respErrorJson)
    assertEquals(respHumanErrorNotExist.status, 200);
    assertEquals(respErrorJson.errors.length, 1);
    const aDinosaur = SchemaTest.addDinosaur(db, {
      name: "Whaatt",
      description: "xxxxx"
    })

    assertEquals(SchemaTest.allDinosaurs(db)[0], {
      name: "Whaatt",
      description: 'xxxxx'
    })
    const respAllDinosaurs = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      body: bodyQueryAllDinosaurs,
    });
    const respAllDinosaursJson = await respAllDinosaurs.json();
    // console.log(respAllDinosaursJson)
    assertEquals(respAllDinosaurs.status, 200);
    assertEquals(respAllDinosaursJson.errors, undefined);
    assertEquals(respAllDinosaursJson.data, {
      allDinosaurs: [
        {
          name: 'Whaatt',
          description: 'xxxxx'
        }
      ]
    })

    server.close();
  }, 1000);

  await server.listenAndServe();
});


Deno.test("tRPC test", async () => {
  let id = 0;

  const db = {
    posts: [
      {
        id: ++id,
        title: 'hello',
        amount: 0
      },
    ],
  };

  const t = initTRPC.create();

  const publicProcedure = t.procedure;
  const router = t.router;


  const postRouter = router({
    createPost: publicProcedure
      .input(z.object({ title: z.string(), amount: z.number().min(100).max(300) }))
      .mutation(({ input }) => {
        const post = {
          id: ++id,
          ...input,
        };
        db.posts.push(post);
        return post;
      }),
    listPosts: publicProcedure.query(() => db.posts),
  });

  const appRouter = router({
    post: postRouter,
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
      return `hello ${input ?? 'world'}`;
    }),
  });

  type AppRouter = typeof appRouter;

  const isTRPCClientError = (
    cause: unknown,
  ): cause is TRPCClientError<AppRouter> => {
    return cause instanceof TRPCClientError;
  }

  const handler = (request: Request) => {
    // Only used for start-server-and-test package that
    // expects a 200 OK to start testing the server
    if (request.method === 'HEAD') {
      return new Response();
    }

    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({}),
    });
  }

  const server = new Server({
    handler,
    port: 3000
  })

  setTimeout(async () => {
    const url = 'http://127.0.0.1:3000/trpc';

    const proxy = createTRPCProxyClient<AppRouter>({
      links: [loggerLink(), httpBatchLink({ url })],
    });

    await sleep();

    const hello = await proxy.hello.query();
    assertEquals(hello, "hello world")

    await sleep();

    const postCreate = await proxy.post.createPost.mutate({
      title: 'hello client',
      amount: 109,
    });

    // console.log('created post', postCreate.title);
    assertEquals(postCreate, {
      id: 2,
      title: 'hello client',
      amount: 109
    });
    await sleep();

    try {
      await proxy.post.createPost.mutate({
        title: 'hello client',
        amount: 109999,
      });
    } catch (error) {
      assertInstanceOf(error, TRPCClientError)
      //
      // https://trpc.io/docs/infer-types#infer-trpclienterrors-based-on-your-router
      //
      if (isTRPCClientError(error)) {
        assertEquals(error.data, { ...error.data, code: "BAD_REQUEST", httpStatus: 400, path: 'post.createPost' })
        assertEquals(JSON.parse(error.message)[0], {
          ...JSON.parse(error.message)[0],
          code: "too_big",
          maximum: 300,
          message: "Number must be less than or equal to 300",
          path: ["amount"]
        })
      }
    }

    //assertThrows(async() =>{
    //})

    const postList = await proxy.post.listPosts.query();
    // console.log('has posts', postList, 'first:', postList[0].title);
    assertEquals(postList.length, 2)
    assertEquals(postList[0], {
      amount: 0,
      id: 1,
      title: "hello",
    })
    assertEquals(postList[1], {
      id: 2,
      title: "hello client",
      amount: 109
    })
    server.close()
  }, 1500)

  await server.listenAndServe()

});

const sleep = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

Deno.test("kysely sql queries builder test", () => {

  type SqlPerson = {
    id: Generated<number>,
    first_name: SchemaTest.TypePersonFirstName,
    last_name: SchemaTest.TypePersonLastName
  }

  type Database = {
    person: SqlPerson
  }

  const kdb = new Kysely<Database>({
    dialect: {
      createAdapter: () => new SqliteAdapter(),
      // You need a driver to be able to execute queries. In this example
      // we use the dummy driver that never does anything.
      createDriver: () => new DummyDriver(),
      createIntrospector: (db: Kysely<unknown>) => new SqliteIntrospector(db),
      createQueryCompiler: () => new SqliteQueryCompiler(),
    },
  })

  //
  // [Feature request] infer table. · Issue #118 · koskimas/kysely
  // https://github.com/koskimas/kysely/issues/118
  //

  const dbSchemaCreate = kdb.schema.createTable('person')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('first_name', "varchar(50)", col => col.notNull())
    .addColumn('last_name', 'varchar(250)').compile().sql
  assertEquals(dbSchemaCreate, 'create table "person" ("id" integer primary key autoincrement, "first_name" varchar(50) not null, "last_name" varchar(250))')
  assertEquals(kdb.schema.createTable('person_foo').compile().sql, 'create table "person_foo" ()')
  const queryPersonById = kdb.selectFrom('person').select('id')
  assertEquals(queryPersonById.compile().sql, 'select "id" from "person"')
  assertEquals(kdb.selectFrom('person').select('first_name').where('id', '==', 100).compile().sql, 'select "first_name" from "person" where "id" == ?')

  const sqlite3Db = new DenoSqliteDB();
  sqlite3Db.execute(dbSchemaCreate);

  // Run a simple query
  for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
    const nameArr = name.split(" ")
    //
    // before insert into database
    //
    const entry = {
      firstName: nameArr[0],
      lastName: nameArr[1]
    }
    if (SchemaTest.isPerson(entry)) {
      sqlite3Db.query(kdb.insertInto("person").values({
        first_name: 'x',
        last_name: 'x'
      }).compile().sql, [entry.firstName, entry.lastName]);

    }
  }

  const result: string[] = [];
  for (const [name] of sqlite3Db.query(kdb.selectFrom("person").select('first_name').compile().sql)) {
    if (SchemaTest.isPersionFirstName(name)) {
      result.push(name);
    }
  }

  sqlite3Db.close();
  assertEquals(result.length, 3);
  assertArrayIncludes(result, ["Peter", "Clark", "Bruce"]);

});



Deno.test('kysely dialect test', async () => {

  type SqlDinosaur = {
    id: Generated<number>,
    name: z.TypeOf<typeof SchemaTest.dinosaur.shape.name>,
    description: z.TypeOf<typeof SchemaTest.dinosaur.shape.description>
  }

  type KyselyDatabaseType = {
    dinosaur: SqlDinosaur
  }

  const kyselyDb = new Kysely<KyselyDatabaseType>({
    dialect: {
      createAdapter: () => new SqliteAdapter(),
      // You need a driver to be able to execute queries. In this example
      // we use the dummy driver that never does anything.
      createDriver: () => new WasmSqliteDriver(''),
      createIntrospector: (db: Kysely<unknown>) => new SqliteIntrospector(db),
      createQueryCompiler: () => new SqliteQueryCompiler(),
    },
  })

  kyselyDb.schema.createTable('dinosaur')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('name', "varchar(50)", col => col.notNull())
    .addColumn('description', 'varchar(250)').execute()

  // sqlite3Db.execute(kdbCreateTable.sql);

  const r101 = await kyselyDb.insertInto("dinosaur").values({
    name: "W104",
    description: "FOO"
  }).returning(["name","description"]).executeTakeFirst()

  if(SchemaTest.isDinosaur(r101)){
    assertEquals(r101, {name: "W104", description:"FOO"})
  }

  const r102 = await kyselyDb.selectFrom("dinosaur").selectAll().execute()
  assertEquals(r102.length, 1);
})


Deno.test("sql-builder-graphql test", async () => {

  type SqlDinosaur = {
    id: Generated<number>,
    name: z.TypeOf<typeof SchemaTest.dinosaur.shape.name>,
    description: z.TypeOf<typeof SchemaTest.dinosaur.shape.description>
  }

  type KyselyDatabaseType = {
    dinosaur: SqlDinosaur
  }

  const kyselyDb = new Kysely<KyselyDatabaseType>({
    dialect: {
      createAdapter: () => new SqliteAdapter(),
      // You need a driver to be able to execute queries. In this example
      // we use the dummy driver that never does anything.
      createDriver: () => new DummyDriver(),
      createIntrospector: (db: Kysely<unknown>) => new SqliteIntrospector(db),
      createQueryCompiler: () => new SqliteQueryCompiler(),
    },
  })

  const kdbCreateTable = kyselyDb.schema.createTable('dinosaur')
    .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
    .addColumn('name', "varchar(50)", col => col.notNull())
    .addColumn('description', 'varchar(250)').compile()

  const sqlite3Db = new DenoSqliteDB();
  sqlite3Db.execute(kdbCreateTable.sql);


  const typeDefs = gql`
  type Query {
    allDinosaurs: [Dinosaur]
    oneDinosaur(name: String): Dinosaur
  }

  type Dinosaur {
    name: String
    description: String
  }

  type Mutation {
    addDinosaur(name: String, description: String): Dinosaur
  }
`;

  const _allDinosaursV0 = () => {
    // "SELECT name, description FROM dinosaurs"
    return sqlite3Db.queryEntries<SchemaTest.TypeDinosaur>(kyselyDb.selectFrom("dinosaur").select('name').select('description').compile().sql);
  };

  const allDinosaurs = () => {
    return SchemaTest.queryDinosaur(sqlite3Db, kyselyDb.selectFrom("dinosaur").select('name').select('description').compile().sql);
  };

  const _oneDinosaurV0 = (args: any) => {
    // "SELECT name, description FROM dinosaurs WHERE name = ?", [args.name]
    return sqlite3Db.queryEntries<SchemaTest.TypeDinosaur>(kyselyDb.selectFrom("dinosaur").select('name').select("description").where("name", "=", "?").compile().sql, [args.name]);
  };

  const oneDinosaur = (args: any) => {
    // "SELECT name, description FROM dinosaurs WHERE name = ?", [args.name]
    return SchemaTest.queryDinosaur(sqlite3Db, kyselyDb.selectFrom("dinosaur").select('name').select("description").where("name", "=", "?").compile().sql, [args.name]);
  };


  const addDinosaurV0 = (args: any) => {
    // 'INSERT INTO dinosaurs(name, description) VALUES( ? , ? ) RETURNING name, description', [args.name, args.description]
    if (SchemaTest.isDinosaur(args)) {
      const insertQuery = kyselyDb.insertInto("dinosaur").values({
        name: '',
        description: ''
      }).returning(['name', 'description']).compile()
      const result = sqlite3Db.queryEntries<SchemaTest.TypeDinosaur>(insertQuery.sql, [args.name, args.description])
      return result[0];
    }
  };

  const addDinosaur = (args: any) => {
    // 'INSERT INTO dinosaurs(name, description) VALUES( ? , ? ) RETURNING name, description', [args.name, args.description]
    if (SchemaTest.isDinosaur(args)) {
      const insertQuery = kyselyDb.insertInto("dinosaur").values({
        name: '',
        description: ''
      }).returning(['name', 'description']).compile()
      const result = SchemaTest.queryDinosaur(sqlite3Db, insertQuery.sql, [args.name, args.description])
      return result[0];
    }
  };

  const resolvers = {
    Query: {
      allDinosaurs: () => allDinosaurs(),
      // deno-lint-ignore no-explicit-any
      oneDinosaur: (_: any, args: any) => oneDinosaur(args),
    },
    Mutation: {
      // deno-lint-ignore no-explicit-any
      addDinosaur: (_: any, args: any) => addDinosaur(args),
    },
  };

  const schema = makeExecutableSchema({ resolvers, typeDefs });
  const server = new Server({
    handler: async (req) => {
      const { pathname } = new URL(req.url);
      return pathname === "/graphql"
        ? await GraphQLHTTP<Request>({
          schema,
          graphiql: true,
        })(req)
        : new Response("Not Found", { status: 404 });
    },
    port: 3000,
  });


  const bodyQueryAllDinosaurs = JSON.stringify({
    query: `
    query {
      allDinosaurs {
        name
        description
      }
    }
`,
  });

  setTimeout(async () => {
    const target = {
      name: "Whaattt",
      description: "xxxxx"
    }
    const _aDinosaur = addDinosaur(target)
    const queryDinosaur = oneDinosaur({ name: "Whaattt" })
    assertEquals(queryDinosaur[0], target)
    assertEquals(allDinosaurs()[0], target)

    const respAllDinosaurs = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      body: bodyQueryAllDinosaurs,
    });

    const respAllDinosaursJson = await respAllDinosaurs.json();
    // console.log(respAllDinosaursJson)
    assertEquals(respAllDinosaurs.status, 200);
    assertEquals(respAllDinosaursJson.errors, undefined);
    assertEquals(respAllDinosaursJson.data, {
      allDinosaurs: [
        {
          name: 'Whaattt',
          description: 'xxxxx'
        }
      ]
    })

    server.close();
  }, 1000);

  await server.listenAndServe();
});