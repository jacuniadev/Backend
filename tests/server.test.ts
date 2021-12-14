import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import { Server } from "../src/classes/server";

describe("🔰 Test Server Class", () => {
  describe("constructor()", () => {
    let server: Server;
    afterEach(() => server.server.close());
    it("setting the port to 3007 should run it on 3007", () => {
      server = new Server(3007);
      expect(server.PORT).to.equal(3007);
    });

    it("should default to port 8081 when no port is given", () => {
      server = new Server();
      expect(server.PORT).to.equal(8081);
    });
  });
});
