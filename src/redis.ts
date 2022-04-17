import { createClient } from "redis";
import { Logger } from "./utils/logger";

export const redisSubscriber = createClient({
  url: "redis://xornet-redis:6379",
});

export const redisPublisher = createClient({
  url: "redis://xornet-redis:6379",
});

redisSubscriber.connect().then(() => Logger.info("Redis Subscriber connected "));
redisPublisher.connect().then(() => Logger.info("Redis Publisher connected "));
