import { createClient } from "redis";

export const redisClient = createClient();
await redisClient.connect();

process.on("exit", () => {
  void redisClient.quit();
});
