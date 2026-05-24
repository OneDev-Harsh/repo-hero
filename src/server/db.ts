import { env } from "~/env";
import { createClient } from "@insforge/sdk";

const createInsForgeClient = () => {
  return createClient({
    baseUrl: process.env.API_BASE_URL || 'https://ejfmzxt7.ap-southeast.insforge.app',
    anonKey: process.env.API_KEY || 'ik_2788f9ebdeb1180e7f751452a76ad7bb'
  });
};

const globalForInsforge = globalThis as unknown as {
  insforge: ReturnType<typeof createInsForgeClient> | undefined;
};

export const db = globalForInsforge.insforge ?? createInsForgeClient();

if (env.NODE_ENV !== "production") globalForInsforge.insforge = db;
