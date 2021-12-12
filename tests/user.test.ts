import "mocha";
import "ts-mocha";
import { createUser, deleteAllUsers, loginUser } from "../src/services/user.service";
import { UserDocument } from "../src/types/user";
import { expect } from "chai";
import mongoose from "mongoose";

before(async () => {
  const MONGO_URI: string = "mongodb://localhost/xornet-testing";
  mongoose.connect(MONGO_URI, { appName: "Xornet Backend Test Suite" });
});

after(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

afterEach(async () => await deleteAllUsers());

// Create the most beautiful classes you can
const userPayload = {
  username: "foobar",
  password: "FooBar2000",
  email: "foobar@foobar.com",
};

describe("create user", () => {
  describe("given valid input", () => {
    it("should create a new user", async () => {
      const user: UserDocument = await createUser(userPayload);
      expect(user.password).to.have.lengthOf(60);
      expect(user.username).to.be.equals(userPayload.username);
      expect(user.email).to.be.equals(userPayload.email);
    });
  });
});

describe("login user", () => {
  describe("given a valid password", () => {
    it("should return true", async () => {
      await createUser(userPayload);
      const isValid = await loginUser({ email: userPayload.email, password: userPayload.password });
      expect(isValid).to.be.true;
    });
  });

  describe("given an invalid password", () => {
    it("should return false", async () => {
      await createUser(userPayload);
      const isValid = await loginUser({ email: userPayload.email, password: "wrong" });
      expect(isValid).to.be.false;
    });
  });
});
