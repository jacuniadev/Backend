require("dotenv").config();
import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../src/services/user.service";
import mongoose from "mongoose";
import { describe } from "./utils";
import { userPayload } from "./constants";
import { UserLoginResult } from "../src/types/user";

before(async () => mongoose.connect(process.env.MONGO_TESTING_URL!, { appName: "Xornet Backend Test Suite" }));

after(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

afterEach(async () => await deleteAllUsers());

describe("User Database Functions & Methods", () => {
  describe("Statics", () => {
    describe("createUser()", () => {
      let response: UserLoginResult;
      describe("given valid input", () => {
        before(async () => (response = await createUser(userPayload)));
        it("should have a hash password of length 60", () => expect(response.user.password).to.have.lengthOf(60));
        it("username should match the payload username", () =>
          expect(response.user.username).to.be.equals(userPayload.username));
        it("email should match the payload email", () => expect(response.user.email).to.be.equals(userPayload.email));
        it("should have a filled created_at field", () => expect(response.user.created_at).to.be.exist);
        it("should have a filled updated_at field", () => expect(response.user.updated_at).to.be.exist);
        it("should not init with an avatar", () => expect(response.user.avatar).to.be.undefined);
        it("should not init with a biography", () => expect(response.user.biography).to.be.undefined);
      });
      describe("given an invalid password", () =>
        it("should return a message saying 'password doesn't meet complexity requirements'", async () => {
          createUser({ username: userPayload.username, email: userPayload.email, password: "a" }).catch((reason) => {
            expect(reason).to.be.equal("password doesn't meet complexity requirements");
          });
        }));
      describe("given an invalid email", () =>
        it("should return a message saying 'email doesn't meet complexity requirements'", async () => {
          createUser({ username: userPayload.username, email: "ass", password: "nicepassaword124" }).catch((reason) => {
            expect(reason).to.be.equal("email doesn't meet complexity requirements");
          });
        }));

      describe("given an invalid username", () =>
        it("should return a message saying 'username doesn't meet complexity requirements'", async () => {
          createUser({ username: "t", email: "ass@gmail.com", password: "nicepassaword124" }).catch((reason) => {
            expect(reason).to.be.equal("username doesn't meet complexity requirements");
          });
        }));
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
      describe("given a valid password", () => {
        it("should return the user", async () => {
          const body = await loginUser({ username: userPayload.username, password: userPayload.password });
          expect(body.user).to.exist;
        });
        it("should have a token", async () => {
          const body = await loginUser({ username: userPayload.username, password: userPayload.password });
          expect(body.token).to.exist;
        });
      });

      describe("given an invalid password", () =>
        it("should return a message saying 'password doesn't meet complexity requirements'", async () => {
          loginUser({ username: userPayload.username, password: "wrong" }).catch((reason) => {
            expect(reason).to.be.equal("password doesn't meet complexity requirements");
          });
        }));

      describe("given an invalid username", () =>
        it("should return a message saying 'username doesn't meet complexity requirements'", async () => {
          loginUser({ username: "e", password: userPayload.password }).catch((reason) => {
            expect(reason).to.be.equal("username doesn't meet complexity requirements");
          });
        }));

      describe("given a non-existent username", () =>
        it("should return a message saying 'user doesn't exist'", async () => {
          loginUser({ username: "random bullshit", password: "wrong" }).catch((reason) => {
            expect(reason).to.be.equal("user doesn't exist");
          });
        }));
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
    describe("user.comparePassword()", () => {
      it("should return true if the password is correct", async () => {
        const { user } = await createUser(userPayload);
        expect(await user.comparePassword(userPayload.password)).to.be.true;
      });
      it("should return false if the password is not correct", async () => {
        const { user } = await createUser(userPayload);
        expect(await user.comparePassword("incorrectPassword")).to.be.false;
      });
    });

    describe("user.updatePassword()", () => {
      it("should get rehashed & different", async () => {
        const { user } = await createUser(userPayload);
        const oldPasswordHash = user.password;
        await user.updatePassword("newCoolPassword241");
        expect(user.password).to.not.be.equal(oldPasswordHash);
        expect(user.password).to.have.lengthOf(60);
      });
    });

    for (const method of ["updateEmail", "updateAvatar", "updateUsername", "updateBiography"]) {
      describe(`user.${method}()`, () => {
        it("should be different", async () => {
          const { user } = await createUser(userPayload);
          const oldValue = user[method.toLowerCase().substring(6)];
          await user[method]("coolnewValue");
          expect(user[method.toLowerCase().substring(6)]).to.not.be.equal(oldValue);
        });
      });
    }
  });
});
