#!/bin/bash
TEMP_YAML="$(mktemp)"
cat <<'EOF' > $TEMP_YAML
version: "3.8"
services:
  mysql404:
    image: 'mysql:5.7'
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: root_pass
      MYSQL_DATABASE: test_db
    command: ['--character-set-server=utf8']
  deno404:
    image: denoland/deno:alpine-1.31.2
    command:
      - /bin/sh
      - -c
      - |
        env
        sleep 10
        deno run -A - <<EOOF
        import { createPool } from "npm:mysql2";
        import { Generated, Kysely, MysqlDialect } from "npm:kysely";
        import { assertEquals } from "https://deno.land/std@0.179.0/testing/asserts.ts";
        const mysqlDialect = new MysqlDialect({
          pool: createPool({
            database: "test_db",
            host: "mysql404",
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

        await db.insertInto("person").values({first_name: 'Foo404', last_name: 'Bar'}).execute()
        const result = await db.selectFrom("person").select('first_name').execute()
        console.log("RESULT===>",result)
        assertEquals(result[0], { first_name: "Foo404"})
        EOOF
EOF

function chatgpt_comment()
{
  README=../deno-mysql.md
  SCRIPT=../deno-mysql.sh
  pushd chatgpt230313
  echo -e "\n# $(date)\n" >> $README
  echo -e "\n## explain docker compose yaml\n" >> $README
  echo -e "\`\`\`yaml\n" >> $README
  cat $TEMP_YAML >> $README
  echo -e "\n\`\`\`\n" >> $README
  cat $TEMP_YAML | deno run -A app.ts chatgpt -r code -m 'explain the following docker compose yaml file:' -i >> $README
  echo -e "\n## explain script\n" >> $README
  echo -e "\`\`\`sh\n" >> $README
  cat $SCRIPT >> $README
  echo -e "\n\`\`\`\n" >> $README
  cat $SCRIPT | deno run -A app.ts chatgpt -r code -m 'explain the following shell script:' -i >> $README
  popd
}

function handler() 
{
  echo "remove containers and exit"
  chatgpt_comment
  docker compose -f $TEMP_YAML rm -sf
  rm $TEMP_YAML
  exit 1
}

trap 'handler' SIGINT
docker compose -f $TEMP_YAML up