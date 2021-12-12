import "mocha";
import "ts-mocha";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../src/services/user.service";
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

describe("find user", () => {
  describe("given valid input", () => {
    it("should find a user by username", async () => {
      await createUser(userPayload);
      const user = await getUser({ username: userPayload.username });
      expect(user).to.exist;
    });

    it("should find a user by email", async () => {
      await createUser(userPayload);
      const user = await getUser({ email: userPayload.email });
      expect(user).to.exist;
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

describe("delete all users", () => {
  it("should leave the database empty", async () => {
    await createUser(userPayload);
    await deleteAllUsers();
    const users = await getUsers();
    expect(users).to.be.empty;
  });
});

describe("update user", () => {
  describe("change password", () => {
    it("should get rehashed & different", async () => {
      const user: UserDocument = await createUser(userPayload);
      const oldPasswordHash = user.password;
      await user.updatePassword("newCoolPassword241");
      expect(user.password).to.not.be.equal(oldPasswordHash);
      expect(user.password).to.have.lengthOf(60);
    });
  });

  describe("change email", () => {
    it("should be different", async () => {
      const user: UserDocument = await createUser(userPayload);
      const oldEmail = user.email;
      await user.updateEmail("newemail@gmail.com");
      expect(user.email).to.not.be.equal(oldEmail);
    });
  });

  describe("change username", () => {
    it("should be different", async () => {
      const user: UserDocument = await createUser(userPayload);
      const oldUsername = user.username;
      await user.updateUsername("NewUsername673");
      expect(user.username).to.not.be.equal(oldUsername);
    });
  });
});
