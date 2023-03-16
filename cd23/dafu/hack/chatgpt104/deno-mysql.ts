import { createPool } from "npm:mysql2";
import { Generated, Kysely, MysqlDialect } from "npm:kysely";
import { assertEquals } from "https://deno.land/std@0.179.0/testing/asserts.ts";
const mysqlDialect = new MysqlDialect({
  pool: createPool({
    database: "test_db",
    host: "localhost",
    password: "root_pass",
    user: "root",
  }),
});

type Person = {
  id: Generated<number>;
  first_name: string;
  last_name: string;
};

type Database = {
  person: Person;
};

const db = new Kysely<Database>({
  dialect: mysqlDialect,
});

await db.schema.createTable("person")
  .addColumn("id", "integer", (col) => col.autoIncrement().primaryKey())
  .addColumn("first_name", "varchar(50)", (col) => col.notNull())
  .addColumn("last_name", "varchar(50)").execute();

await db.insertInto("person").values({ first_name: "Foo404", last_name: "Bar" })
  .execute();
const result = await db.selectFrom("person").select("first_name").execute();
console.log("RESULT===>", result);
assertEquals(result[0], { first_name: "Foo404" });
