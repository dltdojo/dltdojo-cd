// https://github.com/denodrivers/postgres
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
const client = new Client({
  user: "admin102",
  database: "test_db",
  hostname: "pg102",
  password: "pass102",
  port: 5432,
});
await client.connect();

// https://deno-postgres.com/#/?id=executing-queries
const result = await client.queryArray(" CREATE TABLE IF NOT EXISTS todos102 ( id SERIAL PRIMARY KEY, title TEXT NOT NULL)");
console.log(result);

let title = `TitleDate : ${new Date()}`;
const result2 = await client.queryArray("INSERT INTO todos102 (title) VALUES ($1)", [title]);
console.log(result2);
await client.end();