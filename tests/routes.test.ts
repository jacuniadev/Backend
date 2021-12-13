import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import request from "supertest";

import { Server } from "../src/classes/server";
import { createUser } from "../src/services/user.service";
import { UserSignupInput, UserObject, UserLoginInput } from "../src/types/user";
import { userPayload } from "./constants";

const { server } = new Server(3001);

after(() => server.close());

async function signup(payload: UserSignupInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: { body: { user: UserObject; token: string; message: string }; status: number } = await request(server)
    .post("/users/@signup")
    .send(payload);
  return {
    status,
    body,
  };
}

async function login(payload: UserLoginInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: { body: { user: UserObject; token: string; message: string }; status: number } = await request(server)
    .post("/users/@login")
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
        it("status code 201", async () => {
          const { status } = await signup();
          expect(status).to.be.equal(201);
        });
        it("token should exist", async () => {
          const { body } = await signup();
          expect(body.token).to.exist;
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
        it("should say 'email doesn't meet complexity requirements'", async () => {
          const { body } = await signup({ username: "bobby", email: "", password: "bobby" });
          expect(body.message).to.be.equal("email doesn't meet complexity requirements");
        });
        it("status code 400", async () => {
          const { status } = await signup({ username: "bobby", email: "", password: "bobby" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given invalid password", () => {
        it("should say 'password doesn't meet complexity requirements'", async () => {
          const { body } = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" });
          expect(body.message).to.be.equal("password doesn't meet complexity requirements");
        });
        it("status code 400", async () => {
          const { status } = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given invalid username", () => {
        it("should say 'username doesn't meet complexity requirements'", async () => {
          const { body } = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" });
          expect(body.message).to.be.equal("username doesn't meet complexity requirements");
        });
        it("status code 400", async () => {
          const { status } = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" });
          expect(status).to.be.equal(400);
        });
      });
    });

    describe("POST /@login", () => {
      beforeEach(async () => await signup());
      describe("given valid input", () => {
        it("status code 200", async () => {
          const { status } = await login();
          expect(status).to.be.equal(200);
        });
        it("user object should exist", async () => {
          const { body } = await login();
          expect(body.user).to.exist;
        });
        it("token should exist", async () => {
          const { body } = await login();
          expect(body.token).to.exist;
        });
      });

      describe("given invalid password", () => {
        it("should say 'password doesn't meet complexity requirements'", async () => {
          const { body } = await login({ username: "bobby", password: "" });
          expect(body.message).to.be.equal("password doesn't meet complexity requirements");
        });
        it("status code 400", async () => {
          const { status } = await login({ username: "bobby", password: "" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given invalid username", () => {
        it("should say 'username doesn't meet complexity requirements'", async () => {
          const { body } = await login({ username: "", password: "bobby" });
          expect(body.message).to.be.equal("username doesn't meet complexity requirements");
        });
        it("status code 400", async () => {
          const { status } = await login({ username: "", password: "bobby" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given a username that doesn't exist", () => {
        it("should say 'invalid credentials'", async () => {
          const { body } = await login({ username: "bobbyjohn", password: "bobby92835H" });
          expect(body.message).to.be.equal("invalid credentials");
        });
        it("status code 400", async () => {
          const { status } = await login({ username: "bobbyjohn", password: "bobby92835H" });
          expect(status).to.be.equal(400);
        });
      });

      describe("given a valid username but wrong password", () => {
        it("should say 'invalid credentials'", async () => {
          const { body } = await login({ username: userPayload.username, password: "bobby92835H" });
          expect(body.message).to.be.equal("invalid credentials");
        });
        it("status code 400", async () => {
          const { status } = await login({ username: userPayload.username, password: "bobby92835H" });
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

      it("status code 200", async () => {
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
      describe("with valid inputs", () => {
        beforeEach(async () => await createUser(userPayload));

        for (const entry of ["email", "username"]) {
          it(`searching by ${entry} status code 200`, async () => {
            const response = await request(server).get(`/users/@search/${entry}/${userPayload[entry]}`);
            expect(response.status).to.be.equal(200);
          });

          it(`searching by ${entry} should be the same user that signed up`, async () => {
            const response = await request(server).get(`/users/@search/${entry}/${userPayload[entry]}`);
            const body = response.body as UserObject;
            expect(body[entry]).to.be.equal(userPayload[entry]);
          });
        }
      });

      describe("with invalid inputs", () => {
        for (const entry of ["email", "username"]) {
          it(`searching by ${entry} status code 404`, async () => {
            const response = await request(server).get(`/users/@search/${entry}/wrongvalue891351@@`);
            expect(response.status).to.be.equal(404);
          });

          it(`searching by ${entry} should return a message saying 'user not found'`, async () => {
            const response = await request(server).get(`/users/@search/${entry}/wrongvalue891351@@`);
            const body: { message: string } = response.body;
            expect(body.message).to.be.deep.equal("user not found");
          });
        }
      });
    });
  });

  // We are starting to enter the weeds of complexity here
  describe("/me", () => {
    beforeEach(async () => await createUser(userPayload));

    describe("GET /", () => {
      it("should return a user object", async () => {
        const { body } = await login();
        const response = await request(server).get("/@me").set("Authorization", body.token);
        expect(response.body).to.be.not.empty;
      });
      it("status code 200", async () => {
        const { body } = await login();
        const response = await request(server).get("/@me").set("Authorization", body.token);
        expect(response.status).to.be.equal(200);
      });
    });
  });
});
