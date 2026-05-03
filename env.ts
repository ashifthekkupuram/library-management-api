import { env as loadEnv } from "custom-env";
import { z, ZodError } from "zod";

process.env.APP_STAGE = process.env.APP_STAGE || "dev";

const isDevelopment = process.env.APP_STAGE === "dev";
const isTesting = process.env.APP_STAGE === "test";
const isProduction = process.env.APP_STAGE === "production";

if (isDevelopment) {
  loadEnv();
} else if (isTesting) {
  loadEnv("test");
}

const envSchema = z.object({
  APP_STAGE: z.enum(["dev", "test", "production"]).default("dev"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().positive().default(8000),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  SALT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
  JWT_SECRET: z.string().min(32, "Must be 32 Characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CUSTOMERS_PAGE_LIMIT: z.coerce.number().default(8),
  BOOK_METADATA_PAGE_LIMIT: z.coerce.number().default(8),
});

export type ENV = z.infer<typeof envSchema>;

export let env: ENV;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof ZodError) {
    console.log("Invalid Env Variables");
    e.issues.forEach((err) => {
      const path = err.path.join(".");
      console.log(`${path} : ${err.message}`);
    });
    process.exit(1);
  }
  throw e;
}

export const isDev = () => env.NODE_ENV === "development";
export const isTest = () => env.NODE_ENV === "test";
export const isProd = () => env.NODE_ENV === "production";
