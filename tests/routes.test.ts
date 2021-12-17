import "mocha";
import "ts-mocha";
import { expect } from "chai";
import { describe } from "./utils";
import request from "supertest";

import { Backend } from "../src/classes/backend.class";
import { createUser, deleteAllUsers } from "../src/services/user.service";
import { UserSignupInput, UserObject, UserLoginInput } from "../src/types/user";
import { machinePayload, userPayload } from "./constants";
import { MONGO_TESTING_URL } from "../src/constants";
import { deleteAllMachines } from "../src/services/machine.service";

let backend: Backend;
before(async () => (backend = await Backend.create({ port: 3001, verbose: false, mongoUrl: MONGO_TESTING_URL })));
after(() => backend.server.close());

type BasicResponse = { status: number; body: { error: string; message: string } };
type UserSignupResponse = { status: number; body: { user: UserObject; token: string; error: string; message: string } };

async function signup(payload: UserSignupInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: UserSignupResponse = await request(backend.server).post("/users/@signup").send(payload);
  return {
    status,
    body,
  };
}

async function login(payload: UserLoginInput = userPayload) {
  // Cheating with the types here for simplicity
  const { body, status }: UserSignupResponse = await request(backend.server).post("/users/@login").send(payload);
  return {
    status,
    body,
  };
}

async function signupMachine(payload: { two_factor_key?: string; hardware_uuid?: string; hostname?: string }) {
  const { body, status } = await request(backend.server)
    .post("/machines/@signup")
    .send({ ...machinePayload, payload });
  return {
    status,
    body,
  };
}

describe("🚀 Test Server Endpoints", () => {
  describe("GET /", () => {
    let response: BasicResponse;
    before(async () => (response = await request(backend.server).get("/")));
    it("message should be Hello World", () => expect(response.body.message).to.be.equal("Hello World"));
    it("should have status 200", () => expect(response.status).to.be.equal(200));
  });

  describe("/users", () => {
    describe("POST /@signup", () => {
      let response: UserSignupResponse;
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
      let response: UserSignupResponse;
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
        it("should say 'user not found'", () => expect(response.body.error).to.be.equal("user not found"));
        it("status code 400", () => expect(response.status).to.be.equal(400));
      });

      describe("given a valid username but wrong password", () => {
        before(async () => (response = await login({ username: userPayload.username, password: "bobby92835H" })));
        it("should say 'user not found'", () => expect(response.body.error).to.be.equal("user not found"));
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

  describe("/machines", () => {
    describe("GET /@newkey", () => {
      it("should return an access_token", async () => {
        await createUser(userPayload);
        const { body } = await login();
        const response = await request(backend.server).get("/machines/@newkey").set("Authorization", body.token);
        expect(response.body.key).to.exist;
      });
    });

    let two_factor_key: string;
    let response: BasicResponse;

    describe("GET /@signup", () => {
      beforeEach(async () => {
        await createUser(userPayload);
        await deleteAllMachines();
        const { body } = await login();
        two_factor_key = (await request(backend.server).get("/machines/@newkey").set("Authorization", body.token)).body.key;
      });

      describe("with valid data", () => {
        it("should return an access_token", async () => {
          const response = await request(backend.server)
            .post("/machines/@signup")
            .send({
              ...machinePayload,
              two_factor_key,
            });

          expect(response.body.access_token).to.exist;
        });
      });
      describe("if the machine already exists", () => {
        it("should return a message saying 'this machine is already registered in the database'", async () => {
          for (let i = 0; i < 2; i++) {
            response = await request(backend.server)
              .post("/machines/@signup")
              .send({
                ...machinePayload,
                two_factor_key,
              });
          }

          expect(response!.body.error).to.be.equal("this machine is already registered in the database");
        });
      });
      describe("given an invalid 'two_factor_key'", () => {
        it("should return an error saying 'two_factor_key is invalid'", async () => {
          signupMachine({
            two_factor_key: "",
          }).catch((error) => {
            expect(error).to.be.equal("two_factor_key is invalid");
          });
        });
      });
      describe("given an invalid 'hardware_uuid'", () => {
        it("should return an error saying 'hardware_uuid is invalid'", async () => {
          signupMachine({
            two_factor_key,
            hardware_uuid: "",
          }).catch((error) => expect(error).to.be.equal("hardware_uuid is invalid"));
        });
      });
      describe("given an invalid 'hostname'", () => {
        it("should return an error saying 'hostname is invalid'", async () => {
          signupMachine({
            two_factor_key,
            hostname: "",
          }).catch((error) => expect(error).to.be.equal("hostname is invalid"));
        });
      });
    });
  });
});
