import { expect } from "chai";
import "mocha";
import "ts-mocha";
import { isValidEmail, isValidHostname, isValidPassword, isValidUsername, isValidUUID } from "../src/utils/validators";
import { describe } from "./utils";

describe("✔ Validators", () => {
  describe("isValidEmail()", () => {
    it("should be true with a valid email", () => expect(isValidEmail("testemail@gmail.com")).to.be.true);
    it("should be false with an empty string", () => expect(isValidEmail("")).to.be.false);
    it("should be false with an invalid email", () => expect(isValidEmail("bullshi9372gufb389@@@@.com")).to.be.false);
  });
  describe("isValidPassword()", () => {
    it("should be true with a valid password", () => expect(isValidPassword("asfasfiaownf256!@")).to.be.true);
    it("should be false with an empty string", () => expect(isValidPassword("")).to.be.false);
    it("should return false if the password is less than 4 characters long", () => expect(isValidPassword("333")).to.be.false);
    it("should return false if the password is longer than 64 characters long", () =>
      expect(isValidPassword("1234567890dartfywu4w784f8w4f0w74t4ui4q1234567890dartfywu4w784ruig")).to.be.false);
  });
  describe("isValidUsername()", () => {
    it("should be true with a valid username", () => expect(isValidUsername("N1kO23")).to.be.true);
    it("should be false with an empty string", () => expect(isValidUsername("")).to.be.false);
    it("should return false if the username consists of non-alphanum characters ", () =>
      expect(isValidUsername("!@#$%^&*(YTDERTYUJ")).to.be.false);
  });
  describe("isValidUUID()", () => {
    it("should be true with a valid uuid", () => expect(isValidUUID("5852a4ee-6b5e-4d40-8c7b-78bc6c7d65c6")).to.be.true);
    it("should be false with an invalid uuid", () => expect(isValidUUID("5852a4ex-6b5e-4d40-8c7b-78xc6c7d65c6")).to.be.false);
    it("should be false with an empty string", () => expect(isValidUUID("")).to.be.false);
  });
  describe("isValidHostname()", () => {
    it("should be true with a valid hostname", () => expect(isValidHostname("testing-5235.yourmom.com")).to.be.true);
    it("should allow capitalization", () => expect(isValidHostname("tEsTiNg-5235.yOuRmOm.cOm")).to.be.true);
    it("should be false if the hostname is longer than 253 characters long", () =>
      expect(isValidHostname(`${"testing-5235.".repeat(24)}com`)).to.be.false);
    it("should be false with an invalid hostname", () => expect(isValidHostname("&*@D2nd2niq")).to.be.false);
    it("should be false if the hostname starts with a '-'", () =>
      expect(isValidHostname("-testing-5235.yourmom.com")).to.be.false);
    it("should be false if the hostname is empty", () => expect(isValidHostname("")).to.be.false);
  });
});
