import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import request from "supertest";

import { Backend } from "../src/classes/backend";
import { createUser } from "../src/services/user.service";
import { UserSignupInput, UserObject, UserLoginInput } from "../src/types/user";
import { userPayload } from "./constants";

let backend: Backend;
before(async () => (backend = await Backend.create({ port: 3001, verbose: false })));
after(() => backend.server.close());

type BasicResponse = { status: number; body: { error: string; message: string } };
type SignupLoginResponse = { status: number; body: { user: UserObject; token: string; error: string; message: string } };

async function signup(payload: UserSignupInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: SignupLoginResponse = await request(backend.server).post("/users/@signup").send(payload);
  return {
    status,
    body,
  };
}

async function login(payload: UserLoginInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: SignupLoginResponse = await request(backend.server).post("/users/@login").send(payload);
  return {
    status,
    body,
  };
}

describe("🚀 Test Server Endpoints", () => {
  let response: BasicResponse;
  describe("GET /", () => {
    before(async () => (response = await request(backend.server).get("/")));
    it("message should be Hello World", () => expect(response.body.message).to.be.equal("Hello World"));
    it("should have status 200", () => expect(response.status).to.be.equal(200));
  });

  describe("/users", () => {
    describe("POST /@signup", () => {
      let response: SignupLoginResponse;
      describe("given valid input", () => {
        before(async () => (response = await signup()));
        it("status code 201", () => expect(response.status).to.be.equal(201));
        it("token should exist", () => expect(response.body.token).to.exist);
        it("created_at should exist", () => expect(response.body.user.created_at!).to.exist);
        it("updated_at should exist", () => expect(response.body.user.updated_at!).to.exist);
        it("username should be equal to the payload", () =>
          expect(response.body.user.username!).to.be.deep.equal(userPayload.username));
        it("email should be equal to the payload", () => expect(response.body.user.email!).to.be.deep.equal(userPayload.email));
        it("avatar should be undefined", () => expect(response.body.user.avatar!).to.be.undefined);
        it("biography should be undefined", () => expect(response.body.user.biography!).to.be.undefined);
      });

      describe("if the username already exists", () => {
        before(async () => (response = await signup({ ...userPayload, username: "test" })));
        before(async () => (response = await signup({ ...userPayload, username: "test" })));
        it("should send an error saying 'a user with this username already exists'", () => {
          expect(response.body.error).to.be.equal("a user with this username already exists");
        });
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("if the email already exists", () => {
        before(async () => (response = await signup({ ...userPayload, email: "test@test.com" })));
        before(async () => (response = await signup({ ...userPayload, username: "other", email: "test@test.com" })));
        it("should send an error saying 'a user with this email already exists'", () =>
          expect(response.body.error).to.be.equal("a user with this email already exists"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given invalid email", () => {
        before(async () => (response = await signup({ username: "bobby", email: "", password: "bobby" })));

        it("should say 'email doesn't meet complexity requirements'", () =>
          expect(response.body.error).to.be.equal("email doesn't meet complexity requirements"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given invalid password", () => {
        before(async () => (response = await signup({ username: "bobby", email: "bobby@gmail.com", password: "" })));

        it("should say 'password doesn't meet complexity requirements'", () =>
          expect(response.body.error).to.be.equal("password doesn't meet complexity requirements"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given invalid username", () => {
        before(async () => (response = await signup({ username: "", email: "bobby@gmail.com", password: "bobby" })));

        it("should say 'username doesn't meet complexity requirements'", () =>
          expect(response.body.error).to.be.equal("username doesn't meet complexity requirements"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });
    });

    describe("POST /@login", () => {
      let response: SignupLoginResponse;
      before(async () => {
        await signup();
        response = await login();
      });

      describe("given valid input", () => {
        it("status code 200", () => expect(response.status).to.be.equal(200));
        it("user object should exist", () => expect(response.body.user).to.exist);
        it("token should exist", () => expect(response.body.token).to.exist);
      });

      describe("given invalid password", () => {
        before(async () => (response = await login({ username: "bobby", password: "" })));
        it("should say 'password doesn't meet complexity requirements'", () =>
          expect(response.body.error).to.be.equal("password doesn't meet complexity requirements"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given invalid username", () => {
        before(async () => (response = await login({ username: "", password: "bobby" })));
        it("should say 'username doesn't meet complexity requirements'", () =>
          expect(response.body.error).to.be.equal("username doesn't meet complexity requirements"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given a username that doesn't exist", () => {
        before(async () => (response = await login({ username: "bobbyjohn", password: "bobby92835H" })));
        it("should say 'invalid credentials'", () => expect(response.body.error).to.be.equal("invalid credentials"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given a valid username but wrong password", () => {
        before(async () => (response = await login({ username: userPayload.username, password: "bobby92835H" })));
        it("should say 'invalid credentials'", () => expect(response.body.error).to.be.equal("invalid credentials"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });
    });

    describe("GET /@me", () => {
      beforeEach(async () => await createUser(userPayload));

      it("should return a user object", async () => {
        const { body } = await login();
        const response = await request(backend.server).get("/users/@me").set("Authorization", body.token);
        expect(response.body).to.be.not.empty;
      });
      it("status code 200", async () => {
        const { body } = await login();
        const response = await request(backend.server).get("/users/@me").set("Authorization", body.token);
        expect(response.status).to.be.equal(200);
      });
    });

    describe("GET /@all", () => {
      beforeEach(async () => await createUser(userPayload));

      it("should have status of 200", async () => {
        const response = await request(backend.server).get("/users/@all");
        expect(response.status).to.be.equal(200);
      });

      it("should be an array of users", async () => {
        const response = await request(backend.server).get("/users/@all");
        expect(response.body).to.be.not.empty;
      });
    });

    describe("DELETE /@all", () => {
      beforeEach(async () => await createUser(userPayload));

      it("should return a json message saying success", async () => {
        const response = await request(backend.server).delete("/users/@all");
        expect(response.body).to.be.deep.equal({ message: "success" });
      });

      it("status code 200", async () => {
        const response = await request(backend.server).delete("/users/@all");
        expect(response.status).to.be.equal(200);
      });

      it("shouldnt be any users left", async () => {
        await request(backend.server).delete("/users/@all");
        const response = await request(backend.server).get("/users/@all");
        expect(response.body).to.be.deep.equal([]);
      });
    });

    describe("GET /@search/:by/:query", () => {
      describe("with valid inputs", () => {
        beforeEach(async () => await createUser(userPayload));

        for (const entry of ["email", "username"]) {
          it(`searching by ${entry} status code 200`, async () => {
            const response = await request(backend.server).get(`/users/@search/${entry}/${userPayload[entry]}`);
            expect(response.status).to.be.equal(200);
          });

          it(`searching by ${entry} should be the same user that signed up`, async () => {
            const response = await request(backend.server).get(`/users/@search/${entry}/${userPayload[entry]}`);
            const body = response.body as UserObject;
            expect(body[entry]).to.be.equal(userPayload[entry]);
          });
        }
      });

      let response: request.Response;

      describe("with invalid inputs", () => {
        for (const entry of ["email", "username"]) {
          before(async () => (response = await request(backend.server).get(`/users/@search/${entry}/wrongvalue891351@@`)));
          it(`searching by ${entry} status code 404`, async () => {
            expect(response.status).to.be.equal(404);
          });

          it(`searching by ${entry} should return an error saying 'user not found'`, async () => {
            const body: { error: string } = response.body;
            expect(body.error).to.be.deep.equal("user not found");
          });
        }
      });
    });
  });
});
