import { Time } from "../types";
import { v4 as uuidv4 } from "uuid";
import { redisPublisher, redisSubscriber } from "../redis";

/**
 * A manager that creates temporary keys for people to signup their machines with
 */
export class KeyManager extends Map<string, { key: string; timer: NodeJS.Timeout }> {
  public constructor(public expiration: number = Time.Minute) {
    super();
    redisSubscriber.subscribe("keys", (message) => {
      const { userUuid, key } = JSON.parse(message);
      // console.log(`Got key ${key} for user ${userUuid} from redis`);
      // set from other shards
      this.add(userUuid, key);
    });
  }

  public createNewKey(userUuid: string): { key: string; expiration: number } {
    const key = this.generateKey();
    // Pass to redis to all the other servers in the network
    process.env.SHARD_ID ? redisPublisher.publish("keys", JSON.stringify({ userUuid, key })) : this.add(userUuid, key);
    return { key, expiration: Date.now() + Time.Minute };
  }

  public add(userUuid: string, key: string) {
    const timer = setTimeout(() => this.delete(userUuid), this.expiration);
    clearTimeout(this.get(userUuid)?.timer!);
    this.set(userUuid, { key, timer });
  }

  public generateKey() {
    return uuidv4().replace(/-/g, "").toUpperCase();
  }

  public validate(key: string) {
    for (const [userUuid, value] of this.entries()) {
      if (value.key === key) return userUuid;
    }
  }
}
