import { expect } from "chai";
import "mocha";
import "ts-mocha";
import { Validators } from "../src/utils/validators";
import { describe } from "./utils";

describe("✔ Validators", () => {
  describe("Validators.validateEmail()", () => {
    it("should be true with a valid email", () => expect(Validators.validateEmail("testemail@gmail.com")).to.be.true);
    it("should be false with an empty string", () => expect(Validators.validateEmail("")).to.be.false);
    it("should be false with an invalid email", () =>
      expect(Validators.validateEmail("bullshi9372gufb389@@@@.com")).to.be.false);
  });
  describe("Validators.validatePassword()", () => {
    it("should be true with a valid password", () => expect(Validators.validatePassword("asfasfiaownf256!@")).to.be.true);
    it("should be false with an empty string", () => expect(Validators.validatePassword("")).to.be.false);
    it("should return false if the password is less than 4 characters long", () =>
      expect(Validators.validatePassword("333")).to.be.false);
    it("should return false if the password is longer than 64 characters long", () =>
      expect(Validators.validatePassword("1234567890dartfywu4w784f8w4f0w74t4ui4q1234567890dartfywu4w784ruig")).to.be.false);
  });
  describe("Validators.validateUsername()", () => {
    it("should be true with a valid username", () => expect(Validators.validateUsername("N1kO23")).to.be.true);
    it("should be false with an empty string", () => expect(Validators.validateUsername("")).to.be.false);
    it("should return false if the username consists of non-alphanum characters ", () =>
      expect(Validators.validateUsername("!@#$%^&*(YTDERTYUJ")).to.be.false);
  });
  describe("Validators.validateUUID()", () => {
    it("should be true with a valid uuid", () =>
      expect(Validators.validateUUID("5852a4ee-6b5e-4d40-8c7b-78bc6c7d65c6")).to.be.true);
    it("should be false with an invalid uuid", () =>
      expect(Validators.validateUUID("5852a4ex-6b5e-4d40-8c7b-78xc6c7d65c6")).to.be.false);
    it("should be false with an empty string", () => expect(Validators.validateUUID("")).to.be.false);
  });
  describe("Validators.validateHostname()", () => {
    it("should be true with a valid hostname", () =>
      expect(Validators.validateHostname("testing-5235.yourmom.com")).to.be.true);
    it("should allow capitalization", () => expect(Validators.validateHostname("tEsTiNg-5235.yOuRmOm.cOm")).to.be.true);
    it("should be false if the hostname is longer than 253 characters long", () =>
      expect(Validators.validateHostname(`${"testing-5235.".repeat(24)}com`)).to.be.false);
    it("should be false with an invalid hostname", () => expect(Validators.validateHostname("&*@D2nd2niq")).to.be.false);
    it("should be false if the hostname starts with a '-'", () =>
      expect(Validators.validateHostname("-testing-5235.yourmom.com")).to.be.false);
    it("should be false if the hostname is empty", () => expect(Validators.validateHostname("")).to.be.false);
  });
});
