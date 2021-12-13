import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../src/services/user.service";
import { UserDocument } from "../src/types/user";
import mongoose from "mongoose";
import { UserInput } from "../src/types/user";
import { describe } from "./utils";

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
export const userPayload: UserInput = {
  username: "foobar",
  password: "FooBar2000",
  email: "foobar@foobar.com",
};

describe("User Database Functions & Methods", () => {
  describe("Statics", () => {
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

      describe("given a non-existent email", () => {
        it("should return an error saying 'User doesn't exist'", async () =>
          loginUser({ email: "random bullshit", password: "wrong" }).catch((error) =>
            expect(error.message).to.be.equal("User doesn't exist")
          ));
      });
    });

    describe("deleteAllUsers()", () => {
      it("should leave the database empty", async () => {
        await createUser(userPayload);
        await deleteAllUsers();
        const users = await getUsers();
        expect(users).to.be.empty;
      });
    });
  });

  describe("Methods", () => {
    describe("user.comarePassword()", () => {
      it("should return true if the password is correct", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(await user.comparePassword(userPayload.password)).to.be.true;
      });
      it("should return false if the password is not correct", async () => {
        const user: UserDocument = await createUser(userPayload);
        expect(await user.comparePassword("incorrectPassword")).to.be.false;
      });
    });

    describe("user.updtePassword()", () => {
      it("should get rehashed & different", async () => {
        const user: UserDocument = await createUser(userPayload);
        const oldPasswordHash = user.password;
        await user.updatePassword("newCoolPassword241");
        expect(user.password).to.not.be.equal(oldPasswordHash);
        expect(user.password).to.have.lengthOf(60);
      });
    });

    for (const method of ["updateEmail", "updateAvatar", "updateUsername", "updateBiography"]) {
      describe(`user.${method}()`, () => {
        it("should be different", async () => {
          const user: UserDocument = await createUser(userPayload);
          const oldValue = user[method.toLowerCase().substring(6)];
          await user[method]("coolnewValue");
          expect(user[method.toLowerCase().substring(6)]).to.not.be.equal(oldValue);
        });
      });
    }
  });
});
