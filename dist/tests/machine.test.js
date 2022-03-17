"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("mocha");
require("ts-mocha");
const chai_1 = require("chai");
const machine_service_1 = require("../src/services/machine.service");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const user_service_1 = require("../src/services/user.service");
let user;
before(async () => {
    mongoose_1.default.connect(process.env.MONGO_TESTING_URL, { appName: "Xornet Backend Test Suite" });
    await (0, user_service_1.createUser)(constants_1.userPayload);
    const result = await (0, user_service_1.loginUser)(constants_1.userPayload);
    user = result.user;
});
after(async () => {
    await mongoose_1.default.disconnect();
    await mongoose_1.default.connection.close();
});
afterEach(async () => await (0, machine_service_1.deleteAllMachines)());
(0, utils_1.describe)("Machine Database Functions & Methods", () => {
    (0, utils_1.describe)("Statics", () => {
        (0, utils_1.describe)("createMachine()", () => {
            let response;
            (0, utils_1.describe)("given valid input", () => {
                before(async () => (response = await (0, machine_service_1.createMachine)({
                    hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
                    owner_uuid: user.uuid,
                    hostname: "Ena",
                })));
                it("should have a 'uuid' field", () => (0, chai_1.expect)(response.uuid).to.exist);
                it("'owner_uuid' should be the user's uuid", () => (0, chai_1.expect)(response.owner_uuid).to.be.equal(user.uuid));
                it("should have a 'hardware_uuid' field", () => (0, chai_1.expect)(response.hardware_uuid).to.exist);
                it("should have a 'created_at' field", () => (0, chai_1.expect)(response.created_at).to.exist);
                it("should have a 'updated_at' field", () => (0, chai_1.expect)(response.updated_at).to.exist);
                it("should have a 'name' field", () => (0, chai_1.expect)(response.name).to.exist);
                it("should have a 'status' field", () => (0, chai_1.expect)(response.status).to.exist);
                it("should have a 'static_data' field", () => (0, chai_1.expect)(response.static_data).to.exist);
                it("should have a 'access' field", () => (0, chai_1.expect)(response.access).to.exist);
                it("'description' shouldn't exist yet", () => (0, chai_1.expect)(response.description).to.not.exist);
                it("'icon' shouldn't exist yet", () => (0, chai_1.expect)(response.icon).to.not.exist);
                it("'access' should be an empty array", () => (0, chai_1.expect)(response.access).to.be.empty);
            });
            (0, utils_1.describe)("given an invalid hostname", () => {
                it("should return an error saying 'hostname is invalid'", () => (0, machine_service_1.createMachine)({
                    hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
                    owner_uuid: user.uuid,
                    hostname: "",
                }).catch((error) => (0, chai_1.expect)(error).to.be.equal("hostname is invalid")));
            });
            (0, utils_1.describe)("given an invalid owner_uuid", () => {
                it("should return an error saying 'owner_uuid' is invalid'", () => (0, machine_service_1.createMachine)({
                    hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
                    owner_uuid: "xxx",
                    hostname: "Xena",
                }).catch((error) => (0, chai_1.expect)(error).to.be.equal("owner_uuid is invalid")));
            });
            (0, utils_1.describe)("given an invalid hardware_uuid", () => {
                it("should return an error saying 'hardware_uuid' is invalid'", () => (0, machine_service_1.createMachine)({
                    hardware_uuid: "xxx",
                    owner_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
                    hostname: "Xena",
                }).catch((error) => (0, chai_1.expect)(error).to.be.equal("hardware_uuid is invalid")));
            });
        });
    });
});
