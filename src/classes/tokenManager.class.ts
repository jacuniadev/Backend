import { Time } from "../types";

export class TokenManager extends Map<string, { token: number; timer: NodeJS.Timeout }> {
  public constructor(public expiration: number = 5 * Time.Minute) {
    super();
  }

  public add(userUuid: string, token: number) {
    const timer = setTimeout(() => this.delete(userUuid), this.expiration);
    clearTimeout(this.get(userUuid)?.timer!);
    this.set(userUuid, { token, timer });
  }

  // TODO: user something more secure than just 6 random numbers
  public static generateToken() {
    return ~~(100000 + Math.random() * 900000);
  }

  public validate(token: number) {
    for (const [userUuid, value] of this.entries()) {
      if (value.token === token) return userUuid;
    }
  }
}
