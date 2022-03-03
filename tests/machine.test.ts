require("dotenv").config();
import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { createMachine, deleteAllMachines } from "../src/services/machine.service";
import mongoose from "mongoose";
import { describe } from "./utils";
import { userPayload } from "./constants";
import { UserObject } from "../src/types/user";

import { MachineObject } from "../src/types/machine";
import { createUser, loginUser } from "../src/services/user.service";

let user: UserObject;

before(async () => {
  mongoose.connect(process.env.MONGO_TESTING_URL!, { appName: "Xornet Backend Test Suite" });
  await createUser(userPayload);
  const result = await loginUser(userPayload);
  user = result.user;
});

after(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

afterEach(async () => await deleteAllMachines());

describe("Machine Database Functions & Methods", () => {
  describe("Statics", () => {
    describe("createMachine()", () => {
      let response: MachineObject;
      describe("given valid input", () => {
        before(
          async () =>
            (response = await createMachine({
              hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
              owner_uuid: user.uuid,
              hostname: "Ena",
            }))
        );

        it("should have a 'uuid' field", () => expect(response.uuid).to.exist);
        it("'owner_uuid' should be the user's uuid", () => expect(response.owner_uuid).to.be.equal(user.uuid));
        it("should have a 'hardware_uuid' field", () => expect(response.hardware_uuid).to.exist);
        it("should have a 'created_at' field", () => expect(response.created_at).to.exist);
        it("should have a 'updated_at' field", () => expect(response.updated_at).to.exist);
        it("should have a 'name' field", () => expect(response.name).to.exist);
        it("should have a 'status' field", () => expect(response.status).to.exist);
        it("should have a 'static_data' field", () => expect(response.static_data).to.exist);
        it("should have a 'access' field", () => expect(response.access).to.exist);
        it("'description' shouldn't exist yet", () => expect(response.description).to.not.exist);
        it("'icon' shouldn't exist yet", () => expect(response.icon).to.not.exist);
        it("'access' should be an empty array", () => expect(response.access).to.be.empty);
      });

      describe("given an invalid hostname", () => {
        it("should return an error saying 'hostname is invalid'", () =>
          createMachine({
            hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
            owner_uuid: user.uuid,
            hostname: "",
          }).catch((error) => expect(error).to.be.equal("hostname is invalid")));
      });

      describe("given an invalid owner_uuid", () => {
        it("should return an error saying 'owner_uuid' is invalid'", () =>
          createMachine({
            hardware_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
            owner_uuid: "xxx",
            hostname: "Xena",
          }).catch((error) => expect(error).to.be.equal("owner_uuid is invalid")));
      });

      describe("given an invalid hardware_uuid", () => {
        it("should return an error saying 'hardware_uuid' is invalid'", () =>
          createMachine({
            hardware_uuid: "xxx",
            owner_uuid: "5852a4fe-6b5e-4d40-8c4b-78bccc7d65c6",
            hostname: "Xena",
          }).catch((error) => expect(error).to.be.equal("hardware_uuid is invalid")));
      });
    });
  });
});
