import { createClient } from "redis";

const url = process.env.REDIS_URL;
const client = url ? createClient({ url }) : null;
if (client) {
  client.connect().catch(() => {});
}

export async function cacheGet(key: string): Promise<string | null> {
  if (!client) return null;
  return client.get(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!client) return;
  await client.set(key, value, { EX: ttlSeconds });
}

