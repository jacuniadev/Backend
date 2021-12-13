import "mocha";
import "ts-mocha";
import { expect } from "chai";
import request from "supertest";

import { Server } from "../src/classes/server";
import { createUser } from "../src/services/user.service";
import { UserInput, UserObject } from "../src/types/user";
import { userPayload } from "./user.test";

const { server } = new Server();

after(() => server.close());

function checkUserNotFound(response: request.Response) {
  const body: { message: string } = response.body;
  expect(response.status).to.be.equal(404);
  expect(body.message).to.be.deep.equal("User not found");
}

async function signup(payload: UserInput = userPayload) {
  const { body, status }: { body: { user: UserObject; message: string }; status: number } = await request(server)
    .post("/users/@signup")
    .send(payload);
  return {
    status,
    body,
  };
}

describe("🚀 Test Server Endpoints", () => {
  describe("GET /", () => {
    it("message should be Hello World", async () => {
      const response = await request(server).get("/");
      expect(response.body.message).to.be.equal("Hello World");
    });

    it("should have status 200", async () => {
      const response = await request(server).get("/");
      expect(response.status).to.be.equal(200);
    });
  });

  describe("/users", () => {
    describe("POST /@signup", () => {
      describe("given valid input", () => {
        it("should have status of 201", async () => {
          const { status } = await signup();
          expect(status).to.be.equal(201);
        });
        it("created_at should exist", async () => {
          const { body } = await signup();
          expect(body.user.created_at!).to.exist;
        });
        it("updated_at should exist", async () => {
          const { body } = await signup();
          expect(body.user.updated_at!).to.exist;
        });
        it("username should be equal to the payload", async () => {
          const { body } = await signup();
          expect(body.user.username!).to.be.deep.equal(userPayload.username);
        });
        it("email should be equal to the payload", async () => {
          const { body } = await signup();
          expect(body.user.email!).to.be.deep.equal(userPayload.email);
        });
        it("avatar should be undefined", async () => {
          const { body } = await signup();
          expect(body.user.avatar!).to.be.undefined;
        });
        it("biography should be undefined", async () => {
          const { body } = await signup();
          expect(body.user.biography!).to.be.undefined;
        });
      });

      describe("given invalid email", () => {
        it("should say 'invalid email provided'", async () => {
          const { body } = await signup({ username: "bobby", email: "", password: "bobby" });
          expect(body.message).to.be.equal("invalid email provided");
        });
        it("should have a status of 400", async () => {
          const { status } = await signup({ username: "bobby", email: "", password: "bobby" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given invalid password", () => {
        it("should say 'invalid password provided'", async () => {
          const { body } = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" });
          expect(body.message).to.be.equal("invalid password provided");
        });
        it("should have a status of 400", async () => {
          const { status } = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given invalid username", () => {
        it("should say 'invalid username provided'", async () => {
          const { body } = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" });
          expect(body.message).to.be.equal("invalid username provided");
        });
        it("should have a status of 400", async () => {
          const { status } = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" });
          expect(status).to.be.equal(400);
        });
      });
    });

    describe("GET /@all", () => {
      beforeEach(async () => await createUser(userPayload));

      it("should have status of 200", async () => {
        const response = await request(server).get("/users/@all");
        expect(response.status).to.be.equal(200);
      });

      it("should be an array of users", async () => {
        const response = await request(server).get("/users/@all");
        expect(response.body).to.be.not.empty;
      });
    });

    describe("DELETE /@all", () => {
      beforeEach(async () => await createUser(userPayload));

      it("should return a json message saying success", async () => {
        const response = await request(server).delete("/users/@all");
        expect(response.body).to.be.deep.equal({ message: "success" });
      });

      it("should have a status of 200", async () => {
        const response = await request(server).delete("/users/@all");
        expect(response.status).to.be.equal(200);
      });

      it("shouldnt be any users left", async () => {
        await request(server).delete("/users/@all");
        const response = await request(server).get("/users/@all");
        expect(response.body).to.be.deep.equal([]);
      });
    });

    describe("GET /@search/:by/:query", () => {
      describe("with valid email input", () => {
        it("should return a user if it exists", async () => {
          await createUser(userPayload);
          const response = await request(server).get(`/users/@search/email/${userPayload.email}`);
          const body = response.body as UserObject;
          expect(response.status).to.be.equal(200);
          expect(body.email).to.be.equal(userPayload.email);
        });
      });

      describe("given invalid email input", () => {
        it("should return 404 and message user not found", async () => {
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
        it("should return 404 and message user not found", async () => {
          const response = await request(server).get(`/users/@search/username/wrongUsernameBro224`);
          checkUserNotFound(response);
        });
      });
    });
  });
});
