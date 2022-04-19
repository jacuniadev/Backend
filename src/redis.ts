import { createClient } from "redis";
import { Logger } from "./utils/logger";

const url = `redis://${process.env.REDIS_HOST || "xornet-redis"}:${process.env.REDIS_PORT || 6379}`;

export const redisSubscriber = createClient({ url });
export const redisPublisher = createClient({ url });

redisSubscriber.connect().then(() => Logger.info("Redis Subscriber connected "));
redisPublisher.connect().then(() => Logger.info("Redis Publisher connected "));
