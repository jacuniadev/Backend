import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../src/services/user.service";
import { UserDocument } from "../src/types/user";
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
export const userPayload = {
  username: "foobar",
  password: "FooBar2000",
  email: "foobar@foobar.com",
};

describe("📔 User Database Functions & Methods", () => {
  describe("create user", () => {
    describe("given valid input", () => {
      it("should create a new user", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.password).to.have.lengthOf(60);
        expect(user.username).to.be.equals(userPayload.username);
        expect(user.email).to.be.equals(userPayload.email);
        expect(user.created_at).to.be.exist;
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
    describe("check updated at field", () => {
      it("it should update when an update happens", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldUpdatedAt = user.updated_at;
        await user.updatePassword("yeet");
        expect(user.updated_at).to.not.be.equal(oldUpdatedAt);
      });
    });

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

    describe("change biography", () => {
      it("should be different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldBiography = user.biography;
        await user.updateBiography("hello my name is john xina");
        expect(user.biography).to.not.be.equal(oldBiography);
      });
    });
  });
});
