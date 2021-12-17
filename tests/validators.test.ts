import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";

import { isEmailValid, isHostnameValid, isPasswordValid, isUsernameValid, isUUIDValid } from "../src/utils/validators";

describe("✔ Validators", () => {
  describe("isEmailValid()", () => {
    it("should be true with a valid email", () => expect(isEmailValid("testemail@gmail.com")).to.be.true);
    it("should be false with an empty string", () => expect(isEmailValid("")).to.be.false);
    it("should be false with an invalid email", () => expect(isEmailValid("bullshi9372gufb389@@@@.com")).to.be.false);
  });
  describe("isPasswordValid()", () => {
    it("should be true with a valid password", () => expect(isPasswordValid("asfasfiaownf256!@")).to.be.true);
    it("should be false with an empty string", () => expect(isPasswordValid("")).to.be.false);
    it("should return false if the password is less than 4 characters long", () => expect(isPasswordValid("333")).to.be.false);
    it("should return false if the password is longer than 64 characters long", () =>
      expect(isPasswordValid("1234567890dartfywu4w784f8w4f0w74t4ui4q1234567890dartfywu4w784ruig")).to.be.false);
  });
  describe("isUsernameValid()", () => {
    it("should be true with a valid username", () => expect(isUsernameValid("N1kO23")).to.be.true);
    it("should be false with an empty string", () => expect(isUsernameValid("")).to.be.false);
    it("should return false if the username consists of non-alphanum characters ", () =>
      expect(isUsernameValid("!@#$%^&*(YTDERTYUJ")).to.be.false);
  });
  describe("isUUIDValid()", () => {
    it("should be true with a valid uuid", () => expect(isUUIDValid("5852a4ee-6b5e-4d40-8c7b-78bc6c7d65c6")).to.be.true);
    it("should be false with an invalid uuid", () => expect(isUUIDValid("5852a4ex-6b5e-4d40-8c7b-78xc6c7d65c6")).to.be.false);
    it("should be false with an empty string", () => expect(isUUIDValid("")).to.be.false);
  });
  describe("isHostnameValid()", () => {
    it("should be true with a valid hostname", () => expect(isHostnameValid("testing-5235.yourmom.com")).to.be.true);
    it("should allow capitalization", () => expect(isHostnameValid("tEsTiNg-5235.yOuRmOm.cOm")).to.be.true);
    it("should be false if the hostname is longer than 253 characters long", () =>
      expect(
        isHostnameValid(
          "testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.testing-5235.yourmom.com"
        )
      ).to.be.false);
    it("should be false with an invalid hostname", () => expect(isHostnameValid("&*@D2nd2niq")).to.be.false);
    it("should be false if the hostname starts with a '-'", () =>
      expect(isHostnameValid("-testing-5235.yourmom.com")).to.be.false);
    it("should be false if the hostname is empty", () => expect(isHostnameValid("")).to.be.false);
  });
});
