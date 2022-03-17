"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const chai_1 = require("chai");
require("mocha");
const supertest_1 = __importDefault(require("supertest"));
require("ts-mocha");
const backend_class_1 = require("../src/classes/backend.class");
const machine_service_1 = require("../src/services/machine.service");
const user_service_1 = require("../src/services/user.service");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
let backend;
before(async () => (backend = await backend_class_1.Backend.create({ secure: false, port: 3001, verbose: false, mongoUrl: process.env.MONGO_TESTING_URL })));
after(() => backend.server.close());
async function signup(payload = constants_1.userPayload) {
    const { body, status } = await (0, supertest_1.default)(backend.server).post("/users/@signup").send(payload);
    return {
        status,
        body,
    };
}
async function login(payload = constants_1.userPayload) {
    const { body, status } = await (0, supertest_1.default)(backend.server).post("/users/@login").send(payload);
    return {
        status,
        body,
    };
}
async function signupMachine(payload) {
    const { body, status } = await (0, supertest_1.default)(backend.server)
        .post("/machines/@signup")
        .send(Object.assign(Object.assign({}, constants_1.machinePayload), { payload }));
    return {
        status,
        body,
    };
}
(0, utils_1.describe)("🚀 Test Server Endpoints", () => {
    (0, utils_1.describe)("GET /", () => {
        let response;
        before(async () => (response = await (0, supertest_1.default)(backend.server).get("/")));
        it("message should be Hello World", () => (0, chai_1.expect)(response.body.message).to.be.equal("Hello World"));
        it("should have status 200", () => (0, chai_1.expect)(response.status).to.be.equal(200));
    });
    (0, utils_1.describe)("/users", () => {
        (0, utils_1.describe)("POST /@signup", () => {
            let response;
            (0, utils_1.describe)("given valid input", () => {
                before(async () => (response = await signup()));
                it("status code 201", () => (0, chai_1.expect)(response.status).to.be.equal(201));
                it("token should exist", () => (0, chai_1.expect)(response.body.token).to.exist);
                it("created_at should exist", () => (0, chai_1.expect)(response.body.user.created_at).to.exist);
                it("updated_at should exist", () => (0, chai_1.expect)(response.body.user.updated_at).to.exist);
                it("username should be equal to the payload", () => (0, chai_1.expect)(response.body.user.username).to.be.deep.equal(constants_1.userPayload.username));
                it("email should be equal to the payload", () => (0, chai_1.expect)(response.body.user.email).to.be.deep.equal(constants_1.userPayload.email));
                it("avatar should be undefined", () => (0, chai_1.expect)(response.body.user.avatar).to.be.undefined);
                it("biography should be undefined", () => (0, chai_1.expect)(response.body.user.biography).to.be.undefined);
            });
            (0, utils_1.describe)("if the username already exists", () => {
                before(async () => (response = await signup(Object.assign(Object.assign({}, constants_1.userPayload), { username: "test" }))));
                before(async () => (response = await signup(Object.assign(Object.assign({}, constants_1.userPayload), { username: "test" }))));
                it("should send an error saying 'a user with this username already exists'", () => {
                    (0, chai_1.expect)(response.body.error).to.be.equal("a user with this username already exists");
                });
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("if the email already exists", () => {
                before(async () => (response = await signup(Object.assign(Object.assign({}, constants_1.userPayload), { email: "test@test.com" }))));
                before(async () => (response = await signup(Object.assign(Object.assign({}, constants_1.userPayload), { username: "other", email: "test@test.com" }))));
                it("should send an error saying 'a user with this email already exists'", () => (0, chai_1.expect)(response.body.error).to.be.equal("a user with this email already exists"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given invalid email", () => {
                before(async () => (response = await signup({ username: "bobby", email: "", password: "bobby" })));
                it("should say 'email doesn't meet complexity requirements'", () => (0, chai_1.expect)(response.body.error).to.be.equal("email doesn't meet complexity requirements"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given invalid password", () => {
                before(async () => (response = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" })));
                it("should say 'password doesn't meet complexity requirements'", () => (0, chai_1.expect)(response.body.error).to.be.equal("password doesn't meet complexity requirements"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given invalid username", () => {
                before(async () => (response = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" })));
                it("should say 'username doesn't meet complexity requirements'", () => (0, chai_1.expect)(response.body.error).to.be.equal("username doesn't meet complexity requirements"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
        });
        (0, utils_1.describe)("POST /@login", () => {
            let response;
            before(async () => {
                await signup();
                response = await login();
            });
            (0, utils_1.describe)("given valid input", () => {
                it("status code 200", () => (0, chai_1.expect)(response.status).to.be.equal(200));
                it("user object should exist", () => (0, chai_1.expect)(response.body.user).to.exist);
                it("token should exist", () => (0, chai_1.expect)(response.body.token).to.exist);
            });
            (0, utils_1.describe)("given invalid password", () => {
                before(async () => (response = await login({ username: "bobby", password: "" })));
                it("should say 'password doesn't meet complexity requirements'", () => (0, chai_1.expect)(response.body.error).to.be.equal("password doesn't meet complexity requirements"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given invalid username", () => {
                before(async () => (response = await login({ username: "", password: "bobby" })));
                it("should say 'username doesn't meet complexity requirements'", () => (0, chai_1.expect)(response.body.error).to.be.equal("username doesn't meet complexity requirements"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given a username that doesn't exist", () => {
                before(async () => (response = await login({ username: "bobbyjohn", password: "bobby92835H" })));
                it("should say 'user not found'", () => (0, chai_1.expect)(response.body.error).to.be.equal("user not found"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
            (0, utils_1.describe)("given a valid username but wrong password", () => {
                before(async () => (response = await login({ username: constants_1.userPayload.username, password: "bobby92835H" })));
                it("should say 'user not found'", () => (0, chai_1.expect)(response.body.error).to.be.equal("user not found"));
                it("status code 400", () => (0, chai_1.expect)(response.status).to.be.equal(400));
            });
        });
        (0, utils_1.describe)("GET /@me", () => {
            beforeEach(async () => await (0, user_service_1.createUser)(constants_1.userPayload));
            it("should return a user object", async () => {
                const { body } = await login();
                const response = await (0, supertest_1.default)(backend.server).get("/users/@me").set("Authorization", body.token);
                (0, chai_1.expect)(response.body).to.be.not.empty;
            });
            it("status code 200", async () => {
                const { body } = await login();
                const response = await (0, supertest_1.default)(backend.server).get("/users/@me").set("Authorization", body.token);
                (0, chai_1.expect)(response.status).to.be.equal(200);
            });
        });
        (0, utils_1.describe)("GET /@all", () => {
            beforeEach(async () => await (0, user_service_1.createUser)(constants_1.userPayload));
            it("should have status of 200", async () => {
                const response = await (0, supertest_1.default)(backend.server).get("/users/@all");
                (0, chai_1.expect)(response.status).to.be.equal(200);
            });
            it("should be an array of users", async () => {
                const response = await (0, supertest_1.default)(backend.server).get("/users/@all");
                (0, chai_1.expect)(response.body).to.be.not.empty;
            });
        });
        (0, utils_1.describe)("DELETE /@all", () => {
            beforeEach(async () => await (0, user_service_1.createUser)(constants_1.userPayload));
            it("should return a json message saying success", async () => {
                const response = await (0, supertest_1.default)(backend.server).delete("/users/@all");
                (0, chai_1.expect)(response.body).to.be.deep.equal({ message: "success" });
            });
            it("status code 200", async () => {
                const response = await (0, supertest_1.default)(backend.server).delete("/users/@all");
                (0, chai_1.expect)(response.status).to.be.equal(200);
            });
            it("shouldnt be any users left", async () => {
                await (0, supertest_1.default)(backend.server).delete("/users/@all");
                const response = await (0, supertest_1.default)(backend.server).get("/users/@all");
                (0, chai_1.expect)(response.body).to.be.deep.equal([]);
            });
        });
    });
    (0, utils_1.describe)("/machines", () => {
        let two_factor_key;
        let response;
        (0, utils_1.describe)("GET /@newkey", () => {
            it("should return an access_token", async () => {
                await (0, user_service_1.createUser)(constants_1.userPayload);
                const { body } = await login();
                const response = await (0, supertest_1.default)(backend.server).get("/machines/@newkey").set("Authorization", body.token);
                (0, chai_1.expect)(response.body.key).to.exist;
            });
        });
        (0, utils_1.describe)("GET /@signup", () => {
            beforeEach(async () => {
                await (0, user_service_1.createUser)(constants_1.userPayload);
                await (0, machine_service_1.deleteAllMachines)();
                const { body } = await login();
                two_factor_key = (await (0, supertest_1.default)(backend.server).get("/machines/@newkey").set("Authorization", body.token)).body.key;
            });
            (0, utils_1.describe)("with valid data", () => {
                it("should return an access_token", async () => {
                    const response = await (0, supertest_1.default)(backend.server)
                        .post("/machines/@signup")
                        .send(Object.assign(Object.assign({}, constants_1.machinePayload), { two_factor_key }));
                    (0, chai_1.expect)(response.body.access_token).to.exist;
                });
            });
            (0, utils_1.describe)("if the machine already exists", () => {
                it("should return a message saying 'this machine is already registered in the database'", async () => {
                    for (let i = 0; i < 2; i++) {
                        response = await (0, supertest_1.default)(backend.server)
                            .post("/machines/@signup")
                            .send(Object.assign(Object.assign({}, constants_1.machinePayload), { two_factor_key }));
                    }
                    (0, chai_1.expect)(response.body.error).to.be.equal("this machine is already registered in the database");
                });
            });
            (0, utils_1.describe)("given an invalid 'two_factor_key'", () => {
                it("should return an error saying 'two_factor_key is invalid'", async () => {
                    signupMachine({
                        two_factor_key: "",
                    }).catch((error) => {
                        (0, chai_1.expect)(error).to.be.equal("two_factor_key is invalid");
                    });
                });
            });
            (0, utils_1.describe)("given an invalid 'hardware_uuid'", () => {
                it("should return an error saying 'hardware_uuid is invalid'", async () => {
                    signupMachine({
                        two_factor_key,
                        hardware_uuid: "",
                    }).catch((error) => (0, chai_1.expect)(error).to.be.equal("hardware_uuid is invalid"));
                });
            });
            (0, utils_1.describe)("given an invalid 'hostname'", () => {
                it("should return an error saying 'hostname is invalid'", async () => {
                    signupMachine({
                        two_factor_key,
                        hostname: "",
                    }).catch((error) => (0, chai_1.expect)(error).to.be.equal("hostname is invalid"));
                });
            });
        });
    });
});
