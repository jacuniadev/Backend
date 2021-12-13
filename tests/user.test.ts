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
  describe("createUser()", () => {
    describe("given valid input", () => {
      it("should have a hash password of length 60", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.password).to.have.lengthOf(60);
      });
      it("username should match the payload username", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.username).to.be.equals(userPayload.username);
      });
      it("email should match the payload email", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.email).to.be.equals(userPayload.email);
      });
      it("should have a filled created_at field", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.created_at).to.be.exist;
      });
      it("should have a filled updated_at field", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.updated_at).to.be.exist;
      });
      it("should not init with an avatar", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.avatar).to.be.undefined;
      });
      it("should not init with a biography", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(user.biography).to.be.undefined;
      });
    });
  });

  describe("getUser()", () => {
    describe("given valid input", () => {
      beforeEach(async () => await createUser(userPayload));
      it("should find a user by username", async () => expect(await getUser({ username: userPayload.username })).to.exist);
      it("should find a user by email", async () => expect(await getUser({ username: userPayload.username })).to.exist);
    });
  });

  describe("loginUser()", () => {
    beforeEach(async () => await createUser(userPayload));
    describe("given a valid password", () =>
      it("should return true", async () =>
        expect(await loginUser({ email: userPayload.email, password: userPayload.password })).to.be.true));

    describe("given an invalid password", () =>
      it("should return false", async () =>
        expect(await loginUser({ email: userPayload.email, password: "wrong" })).to.be.false));
  });

  describe("deleteAllUsers()", () => {
    it("should leave the database empty", async () => {
      await createUser(userPayload);
      await deleteAllUsers();
      const users = await getUsers();
      expect(users).to.be.empty;
    });
  });

  describe("update user", () => {
    describe("updatePassword()", () => {
      it("should get rehashed & different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldPasswordHash = user.password;
        await user.updatePassword("newCoolPassword241");
        expect(user.password).to.not.be.equal(oldPasswordHash);
        expect(user.password).to.have.lengthOf(60);
      });
    });

    describe("updateEmail()", () => {
      it("should be different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldEmail = user.email;
        await user.updateEmail("newemail@gmail.com");
        expect(user.email).to.not.be.equal(oldEmail);
      });
    });

    describe("updateUsername()", () => {
      it("should be different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldUsername = user.username;
        await user.updateUsername("NewUsername673");
        expect(user.username).to.not.be.equal(oldUsername);
      });
    });

    describe("updateBiography()", () => {
      it("should be different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldBiography = user.biography;
        await user.updateBiography("hello my name is john xina");
        expect(user.biography).to.not.be.equal(oldBiography);
      });
    });
  });
});
