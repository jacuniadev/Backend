import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import { Server } from "../src/classes/server";

describe("🔰 Test Server Class", () => {
  describe("constructor()", () => {
    it("setting the port to 3007 should run it on 3007", () => {
      const server = new Server(3007);
      expect(server.PORT).to.equal(3007);
      server.server.close();
    });

    it("should default to port 8081 when no port is given", () => {
      const server = new Server();
      expect(server.PORT).to.equal(8081);
      server.server.close();
    });
  });
});
