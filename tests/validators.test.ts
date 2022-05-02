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
    "ftp://i.imgur.com/1234567890123456789.png",
    "hello world",
  ];

  describe("should return true for valid urls", async () => {
    for (const url of VALID_URLS) {
      it(`should return true for valid avatar_url: ${url}`, async () => {
        expect(Validators.validate_avatar_url(url)).to.be.true;
      });
    }
  });

  describe("should return false for invalid urls", async () => {
    for (const url of INVALID_URLS) {
      it(`should return false for invalid avatar_url: ${url}`, async () => {
        expect(Validators.validate_avatar_url(url)).to.be.false;
      });
    }
  });
});

describe("validate_hostname()", async () => {
  const VALID_HOSTNAMES = ["cdn.discordapp.com", "media.discordapp.net", "i.imgur.com", "783f7f2f32-j3fk.test.com"];
  const INVALID_HOSTNAMES = ["your mom", "@%@%783f7f2f32j3fk", "", " ", "-oaiwndoaiwnd.com"];

  describe(`should return true for valid hostnames`, async () => {
    for (const hostname of VALID_HOSTNAMES) {
      it(`should return true for valid hostname: ${hostname}`, async () => {
        expect(Validators.validate_hostname(hostname)).to.be.true;
      });
    }
  });

  describe(`should return false for invalid hostnames`, async () => {
    for (const hostname of INVALID_HOSTNAMES) {
      it(`should return false for invalid hostname: ${hostname}`, async () => {
        expect(Validators.validate_hostname(hostname)).to.be.false;
      });
    }
  });
});

describe("validate_uuid()", async () => {
  const VALID_UUIDS = ["8bb3cf50-077a-4586-8567-58f596504a0e"];
  const INVALID_UUIDS = ["8bb3cf50-077a-4586-58f596504a0e", "546789098765adbhja2jdnkj2", "", "124124"];

  describe(`should return true for valid uuids`, async () => {
    for (const uuid of VALID_UUIDS) {
      it(`should return true for valid uuid: ${uuid}`, async () => {
        expect(Validators.validate_uuid(uuid)).to.be.true;
      });
    }
  });

  describe(`should return false for invalid uuids`, async () => {
    for (const uuid of INVALID_UUIDS) {
      it(`should return false for invalid uuid: ${uuid}`, async () => {
        expect(Validators.validate_uuid(uuid)).to.be.false;
      });
    }
  });
});
