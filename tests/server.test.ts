import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import { Backend } from "../src/classes/backend";

describe("🔰 Test Server Class", () => {
  describe("create()", () => {
    let backend: Backend;
    afterEach(() => backend.server.close());

    it("setting the port to 3007 should run it on 3007", async () => {
      backend = await Backend.create(3007);
      expect(backend.PORT).to.equal(3007);
    });

    it("should default to port 8081 when no port is given", async () => {
      backend = await Backend.create();
      expect(backend.PORT).to.equal(8081);
    });
  });
});
