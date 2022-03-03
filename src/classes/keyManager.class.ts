import { Time } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * A manager that creates temporary keys for people to signup their machines with
 */
export class KeyManager extends Map<string, { key: string; timer: NodeJS.Timeout }> {
  public constructor(public expiration: number = Time.Minute) {
    super();
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
