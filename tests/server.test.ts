require("dotenv").config();
import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import { Backend } from "../src/classes/backend.class";

describe("🔰 Test Server Class", () => {
  describe("create()", () => {
    let backend: Backend;
    afterEach(() => backend.server.close());
    it("setting the port to 3007 should run it on 3007", async () => {
      backend = await Backend.create({
        port: 3007,
        secure: false,
        verbose: false,
        mongoUrl: process.env.MONGO_TESTING_URL || "mongodb://127.0.0.1/xornet-testing",
      });
      expect(backend.port).to.equal(3007);
    });
  });
});
