import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";

import { isEmailValid, isPasswordValid, isUsernameValid } from "../src/services/validators.service";

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
});
