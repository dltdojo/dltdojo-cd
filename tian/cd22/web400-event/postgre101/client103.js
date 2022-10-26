// Connecting to Postgres | Deploy Docs https://deno.com/deploy/docs/tutorial-postgres
import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

// Get the connection string from the environment variable "DATABASE_URL"
// postgres://user:secret@localhost:5432/mydatabasename
// const databaseUrl = Deno.env.get("DATABASE_URL")!;
const databaseUrl = "postgres://admin:root@localhost:5432/test_db";

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true);

// Connect to the database
const connection = await pool.connect();

try {
  // Create the table
  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL
    )
  `;

  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS events (
      id        SERIAL PRIMARY KEY,
      stream_id BIGINT NOT NULL,
      version   BIGINT NOT NULL,
      data      JSONB  NOT NULL,
      UNIQUE (stream_id, version)
    )
  `;

  let title = `TODO ITEM : ${new Date()}`;
  await connection.queryObject`
    INSERT INTO todos (title) VALUES (${title})
  `;

  let streamId = Math.floor(Math.random()*200000);
  let data = {
    type: "TodoCreated"
  }
  console.log("streamId", streamId);
  console.log(JSON.stringify(data));
  await connection.queryObject`
    INSERT INTO events (stream_id,version,data) VALUES (${streamId}, 1, ${data})
  `;

} finally {
  // Release the connection back into the pool
  connection.release();
}