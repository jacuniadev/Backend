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

function checkUserNotFound(response: request.Response) {
  const body: { message: string } = response.body;
  expect(response.status).to.be.equal(404);
  expect(body.message).to.be.deep.equal("User not found");
}

describe("🚀 Test Server Endpoints", () => {
  describe("/", () => {
    it("GET / => message should be 'Hello World'", async () => {
      const response = await request(server).get("/");
      expect(response.status).to.be.equal(200);
      expect(response.body.message).to.be.equal("Hello World");
    });
  });

  describe("/users", () => {
    it("POST /@signup => should return the new user", async () => {
      const response = await request(server).post("/users/@signup").send(userPayload);
      const body = response.body as UserObject;
      expect(response.status).to.be.equal(201);
      expect(body.created_at).to.exist;
      expect(body.updated_at).to.exist;
      expect(body.username).to.be.deep.equal(userPayload.username);
      expect(body.email).to.be.deep.equal(userPayload.email);
    });

    it("GET /@all => should contain an array of users", async () => {
      const user: UserObject = (await createUser(userPayload)).toObject();
      const response = await request(server).get("/users/@all");
      const body = response.body[0] as UserObject;
      expect(response.status).to.be.equal(200);
      validateUser(body, user);
    });

    it("DELETE /@all => should return a json message saying 'success' and there shouldn't be any users left", async () => {
      await createUser(userPayload);
      const response = await request(server).delete("/users/@all");
      expect(response.status).to.be.equal(200);
      expect(response.body).to.be.deep.equal({ message: "success" });

      const response1 = await request(server).get("/users/@all");
      expect(response1.status).to.be.equal(200);
      expect(response1.body).to.be.deep.equal([]);
    });

    describe("GET /@search/:by/:query =>", () => {
      describe("given valid email input", () => {
        it("should return a user if it exists", async () => {
          await createUser(userPayload);
          const response = await request(server).get(`/users/@search/email/${userPayload.email}`);
          const body = response.body as UserObject;
          expect(response.status).to.be.equal(200);
          expect(body.email).to.be.equal(userPayload.email);
        });
      });

      describe("given invalid email input", () => {
        it("should return 404 and message 'user not found'", async () => {
          const response = await request(server).get(`/users/@search/email/wrong@email.com`);
          checkUserNotFound(response);
        });
      });

      describe("given valid username input", () => {
        it("should return a user if it exists", async () => {
          await createUser(userPayload);
          const response = await request(server).get(`/users/@search/username/${userPayload.username}`);
          const body = response.body as UserObject;
          expect(response.status).to.be.equal(200);
          expect(body.username).to.be.equal(userPayload.username);
        });
      });

      describe("given invalid username input", () => {
        it("should return 404 and message 'user not found'", async () => {
          const response = await request(server).get(`/users/@search/username/wrongUsernameBro224`);
          checkUserNotFound(response);
        });
      });
    });
  });
});
