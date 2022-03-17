"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("mocha");
require("ts-mocha");
const chai_1 = require("chai");
const user_service_1 = require("../src/services/user.service");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
before(async () => mongoose_1.default.connect(process.env.MONGO_TESTING_URL, { appName: "Xornet Backend Test Suite" }));
after(async () => {
    await mongoose_1.default.disconnect();
    await mongoose_1.default.connection.close();
});
afterEach(async () => await (0, user_service_1.deleteAllUsers)());
(0, utils_1.describe)("User Database Functions & Methods", () => {
    (0, utils_1.describe)("Statics", () => {
        (0, utils_1.describe)("createUser()", () => {
            let response;
            (0, utils_1.describe)("given valid input", () => {
                before(async () => (response = await (0, user_service_1.createUser)(constants_1.userPayload)));
                it("should have a hash password of length 60", () => (0, chai_1.expect)(response.user.password).to.have.lengthOf(60));
                it("username should match the payload username", () => (0, chai_1.expect)(response.user.username).to.be.equals(constants_1.userPayload.username));
                it("email should match the payload email", () => (0, chai_1.expect)(response.user.email).to.be.equals(constants_1.userPayload.email));
                it("should have a filled created_at field", () => (0, chai_1.expect)(response.user.created_at).to.be.exist);
                it("should have a filled updated_at field", () => (0, chai_1.expect)(response.user.updated_at).to.be.exist);
                it("should not init with an avatar", () => (0, chai_1.expect)(response.user.avatar).to.be.undefined);
                it("should not init with a biography", () => (0, chai_1.expect)(response.user.biography).to.be.undefined);
            });
            (0, utils_1.describe)("given an invalid password", () => it("should return a message saying 'password doesn't meet complexity requirements'", async () => {
                (0, user_service_1.createUser)({ username: constants_1.userPayload.username, email: constants_1.userPayload.email, password: "a" }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("password doesn't meet complexity requirements");
                });
            }));
            (0, utils_1.describe)("given an invalid email", () => it("should return a message saying 'email doesn't meet complexity requirements'", async () => {
                (0, user_service_1.createUser)({ username: constants_1.userPayload.username, email: "ass", password: "nicepassaword124" }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("email doesn't meet complexity requirements");
                });
            }));
            (0, utils_1.describe)("given an invalid username", () => it("should return a message saying 'username doesn't meet complexity requirements'", async () => {
                (0, user_service_1.createUser)({ username: "t", email: "ass@gmail.com", password: "nicepassaword124" }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("username doesn't meet complexity requirements");
                });
            }));
        });
        (0, utils_1.describe)("getUser()", () => {
            (0, utils_1.describe)("given valid input", () => {
                beforeEach(async () => await (0, user_service_1.createUser)(constants_1.userPayload));
                it("should find a user by username", async () => (0, chai_1.expect)(await (0, user_service_1.getUser)({ username: constants_1.userPayload.username })).to.exist);
                it("should find a user by email", async () => (0, chai_1.expect)(await (0, user_service_1.getUser)({ username: constants_1.userPayload.username })).to.exist);
            });
        });
        (0, utils_1.describe)("loginUser()", () => {
            beforeEach(async () => await (0, user_service_1.createUser)(constants_1.userPayload));
            (0, utils_1.describe)("given a valid password", () => {
                it("should return the user", async () => {
                    const body = await (0, user_service_1.loginUser)({ username: constants_1.userPayload.username, password: constants_1.userPayload.password });
                    (0, chai_1.expect)(body.user).to.exist;
                });
                it("should have a token", async () => {
                    const body = await (0, user_service_1.loginUser)({ username: constants_1.userPayload.username, password: constants_1.userPayload.password });
                    (0, chai_1.expect)(body.token).to.exist;
                });
            });
            (0, utils_1.describe)("given an invalid password", () => it("should return a message saying 'password doesn't meet complexity requirements'", async () => {
                (0, user_service_1.loginUser)({ username: constants_1.userPayload.username, password: "wrong" }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("password doesn't meet complexity requirements");
                });
            }));
            (0, utils_1.describe)("given an invalid username", () => it("should return a message saying 'username doesn't meet complexity requirements'", async () => {
                (0, user_service_1.loginUser)({ username: "e", password: constants_1.userPayload.password }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("username doesn't meet complexity requirements");
                });
            }));
            (0, utils_1.describe)("given a non-existent username", () => it("should return a message saying 'user doesn't exist'", async () => {
                (0, user_service_1.loginUser)({ username: "random bullshit", password: "wrong" }).catch((reason) => {
                    (0, chai_1.expect)(reason).to.be.equal("user doesn't exist");
                });
            }));
        });
        (0, utils_1.describe)("deleteAllUsers()", () => {
            it("should leave the database empty", async () => {
                await (0, user_service_1.createUser)(constants_1.userPayload);
                await (0, user_service_1.deleteAllUsers)();
                const users = await (0, user_service_1.getUsers)();
                (0, chai_1.expect)(users).to.be.empty;
            });
        });
    });
    (0, utils_1.describe)("Methods", () => {
        (0, utils_1.describe)("user.comparePassword()", () => {
            it("should return true if the password is correct", async () => {
                const { user } = await (0, user_service_1.createUser)(constants_1.userPayload);
                (0, chai_1.expect)(await user.comparePassword(constants_1.userPayload.password)).to.be.true;
            });
            it("should return false if the password is not correct", async () => {
                const { user } = await (0, user_service_1.createUser)(constants_1.userPayload);
                (0, chai_1.expect)(await user.comparePassword("incorrectPassword")).to.be.false;
            });
        });
        (0, utils_1.describe)("user.updatePassword()", () => {
            it("should get rehashed & different", async () => {
                const { user } = await (0, user_service_1.createUser)(constants_1.userPayload);
                const oldPasswordHash = user.password;
                await user.updatePassword("newCoolPassword241");
                (0, chai_1.expect)(user.password).to.not.be.equal(oldPasswordHash);
                (0, chai_1.expect)(user.password).to.have.lengthOf(60);
            });
        });
        for (const method of ["updateEmail", "updateAvatar", "updateUsername", "updateBiography"]) {
            (0, utils_1.describe)(`user.${method}()`, () => {
                it("should be different", async () => {
                    const { user } = await (0, user_service_1.createUser)(constants_1.userPayload);
                    const oldValue = user[method.toLowerCase().substring(6)];
                    await user[method]("coolnewValue");
                    (0, chai_1.expect)(user[method.toLowerCase().substring(6)]).to.not.be.equal(oldValue);
                });
            });
        }
    });
});
