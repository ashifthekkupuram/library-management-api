import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";
import { isProd, env } from "../../env";
import { remember } from "@epic-web/remember";

const createPool = () => {
  return new Pool({ connectionString: env.APP_STAGE });
};

let client;
if (isProd()) {
  client = createPool();
} else {
  client = remember("dbPool", () => createPool());
}

export const db = drizzle({ client, schema });

export default db;
