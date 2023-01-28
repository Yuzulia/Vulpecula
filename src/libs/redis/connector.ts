import { createClient } from "redis";

export const redisClient = createClient({
  url: import.meta.env.REDIS_URL,
});
await redisClient.connect();

process.on("exit", () => {
  void redisClient.quit();
});
