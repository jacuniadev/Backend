require("dotenv").config();
import { DatabaseManager } from "../src/database/DatabaseManager";
import { describe, it } from "mocha";
import { expect } from "chai";
import { Validators } from "../src/validators";

describe("validate_avatar_url()", () => {
  const VALID_URLS = [
    "https://cdn.discordapp.com/avatars/1234567890123456789/1234567890123456789.png",
    "https://i.imgur.com/1234567890123456789.png",
  ];

  const INVALID_URLS = [
    "https://cdn.discordapp.company/1234567890123456789.gif",
    "http://i.imgur.com/1234567890123456789.png",
    "https://cdn.discordapp.com/1234567890123456789.mp3",
    "http://i.imgur.com/1234567890123456789.mp3",
    "https://imgur.com/1234567890123456789.png",
  ];

  it("should return true for valid urls", async () => {
    for (const url of VALID_URLS) {
      expect(Validators.validate_avatar_url(url)).to.be.true;
    }
  });

  it("should return false for invalid urls", async () => {
    for (const url of INVALID_URLS) {
      expect(Validators.validate_avatar_url(url)).to.be.false;
    }
  });
});
