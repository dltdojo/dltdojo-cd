import {
  assertArrayIncludes,
  assertEquals,
  assertNotStrictEquals,
  assertObjectMatch,
} from "https://deno.land/std@0.179.0/testing/asserts.ts";
import * as marked from "npm:marked";
import {
  parse,
  stringify,
} from "https://deno.land/std@0.178.0/encoding/yaml.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Server } from "https://deno.land/std@0.166.0/http/server.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts";
import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";

const testdata101: any = parse(Deno.readTextFileSync("./testdata101.yaml"));
const repsText101 = testdata101.resps[0].choices[0].message.content;
const testdata102: any = parse(Deno.readTextFileSync("./testdata102.yaml"));
const repsText102 = testdata102.resps[0].choices[0].message.content;

Deno.test("url test", () => {
  const tokens102 = marked.lexer(repsText102);
  // Deno.writeTextFileSync('marked-lexer-tokens-102.json', JSON.stringify(tokens102, null, 2))
  // console.log(tokens102);
  assertEquals(tokens102.length, 5);
  assertEquals(tokens102[2].type, "code");
  const yamlCode = tokens102[2].text;
  if (typeof yamlCode === "string") {
    // console.log(yamlCode)
    assertEquals(yamlCode.startsWith("pragma solidity"), true);
  }
});

Deno.test("db test", () => {
  const db = new DB();
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
    console.log(name);
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
      hello: () => `Hello, World!`,
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
  }, 2000);

  await server.listenAndServe();
});

Deno.test("graphql sqlite3 test", async () => {

  const db = new DB();
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

  const allDinosaurs = () => {
    return db.query("SELECT name, description FROM dinosaurs");
  };

  const oneDinosaur = (args: any) => {
    return db.query("SELECT name, description FROM dinosaurs WHERE name = ?", [args.name]);
  };

  const addDinosaur = (args: any) => {
    const result = db.query('INSERT INTO dinosaurs(name, description) VALUES( ? , ? ) RETURNING name, description',[args.name,args.description])
    return result[0];
  };

  const resolvers = {
    Query: {
      allDinosaurs: () => allDinosaurs(),
      oneDinosaur: (_: any, args: any) => oneDinosaur(args),
    },
    Mutation: {
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

  const bodyQueryHello = JSON.stringify({
    query: "{ hello }",
  });

  setTimeout(async () => {
    console.log("test here");
    const resp = await fetch("http://localhost:3000/graphql", {
      method: "POST",
      body: bodyQueryHello,
    });
    const respJson = await resp.json();
    console.log(respJson)
    assertEquals(resp.status, 200);
    assertEquals(respJson.errors.length, 1);
    server.close();
  }, 2000);

  await server.listenAndServe();
});
