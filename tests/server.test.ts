import "mocha";
import "ts-mocha";
import { expect } from "chai";
import request from "supertest";

import { Server } from "../src/classes/server";
import { createUser } from "../src/services/user.service";
import { UserObject } from "../src/types/user";
import { userPayload } from "./user.test";

const { server } = new Server();

after(async () => {
  server.close();
});

function validateUser(body: UserObject, user: UserObject) {
  expect(body.created_at).to.be.deep.equal(user.created_at);
  expect(body.updated_at).to.be.deep.equal(user.updated_at);
  expect(body.username).to.be.deep.equal(user.username);
  expect(body.email).to.be.deep.equal(user.email);
  expect(body.avatar).to.be.undefined;
  expect(body.biography).to.be.undefined;
  // @ts-ignore
  // expect(body.password).to.be.undefined;
}

describe("🚀 Test Server Endpoints", () => {
  describe("/", () => {
    it("GET / => message should be 'Hello World'", async () => {
      const response = await request(server).get("/");
      expect(response.body.message).to.be.equal("Hello World");
      expect(response.status).to.be.equal(200);
    });
  });

  describe("/users", () => {
    // Figure out how to send the body there
    // it("POST /signup => should return the new user", async () => {
    //   const response = await request(server).post("/users/signup");
    //   const body = response.body[0] as UserObject;
    //   // validateUser(body, userPayload);
    //   expect(response.status).to.be.equal(201);
    // });

    it("GET /@all => should contain an array of users", async () => {
      const user: UserObject = (await createUser(userPayload)).toObject();
      const response = await request(server).get("/users/@all");
      const body = response.body[0] as UserObject;
      validateUser(body, user);
      expect(response.status).to.be.equal(200);
    });

    it("DELETE /@all => should return a json message saying 'success' and there shouldn't be any users left", async () => {
      await createUser(userPayload);
      const response = await request(server).delete("/users/@all");
      expect(response.body).to.be.deep.equal({ message: "success" });
      expect(response.status).to.be.equal(200);

      const response1 = await request(server).get("/users/@all");
      expect(response1.body).to.be.deep.equal([]);
      expect(response1.status).to.be.equal(200);
    });
  });
});
