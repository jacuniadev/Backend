const assert = require("chai").assert;
const axios = require("axios");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
process.env.TESTING = "true";
const url = "http://localhost:8080";

function randomString() {
  return Math.random().toString(36).substring(7);
}

const fakeUsername = randomString();
const fakeUsername2 = randomString();
const fakeEmail = `${randomString()}@test.com`;
const fakeEmail2 = `${randomString()}@test.com`;
const fakeDatacenterName = randomString();

let fakeUser = {
  username: fakeUsername,
  password: "test",
  repeatPassword: "test",
  email: fakeEmail,
  geolocation: {
    location: "Canada",
    countryCode: "CA",
  },
};

let fakeUser2 = {
  username: fakeUsername2,
  password: "test",
  repeatPassword: "test",
  email: fakeEmail2,
  geolocation: {
    location: "Russia",
    countryCode: "RU",
  },
};

const fakeMachineUuid = uuidv4();
const fakeMachineSpecs = require("./fakeMachine.json");

let fakeHeaders = {
  headers: {
    Cookie: "",
  },
};
let fakeSocials = [
  {
    name: "twitch",
    url: "https://twitch.tv/geoxor",
  },
];
let fakeFormData = new FormData();
fakeFormData.append("json", JSON.stringify({ fakeSocials }));
const { username, password } = fakeUser;

describe("Integration", () => {
  axios.post(`${url}/signup`, fakeUser2); // Prepare a second user

  it("POST /signup          - can detect if body is invalid", async () => {
    const response = await axios.post(`${url}/signup`, {}).catch((err) => {
      assert.strictEqual(err.response.status, 400);
    });
  });
  it("POST /signup          - can signup", async () => {
    const response = await axios.post(`${url}/signup`, fakeUser);
    assert.strictEqual(response.status, 201);
    assert.strictEqual(
      response.data.message,
      `User '${fakeUser.username}' added to the database!`
    );
  });
  it("POST /signup          - can detect if another user with the same username exists", async () => {
    const response = await axios
      .post(`${url}/signup`, fakeUser)
      .catch((err) => {
        assert.strictEqual(err.response.status, 400);
        assert.strictEqual(
          err.response.data.message,
          `User '${fakeUser.username}' is already in the database!`
        );
      });
  });
  it("POST /login           - can detect if body is invalid", async () => {
    const response = await axios.post(`${url}/login`, {}).catch((err) => {
      assert.strictEqual(err.response.status, 400);
    });
  });
  it("POST /login           - can login", async () => {
    const response = await axios.post(`${url}/login`, { username, password });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.message, "Logged in");
    assert.isNotEmpty(response.data.me);
    assert.isNotEmpty(response.data.token);
    fakeHeaders.headers.Cookie = `token=${response.data.token}`;
  });
  it("GET /profile          - can get a user's profile", async () => {
    const response = await axios.get(
      `${url}/profile/${fakeUser.username}`,
      fakeHeaders
    );
    assert.strictEqual(response.status, 200);
    assert.isNotEmpty(response.data);
    fakeUser2.uuid = response.data._id;
  });
  it("POST /datacenter/new  - can create new datacenter", async () => {
    const response = await axios.post(
      `${url}/datacenter/new`,
      { name: fakeDatacenterName },
      fakeHeaders
    );
    assert.strictEqual(response.status, 201);
    assert.isNotEmpty(response.data);
  });
  it("GET /datacenter       - can respond with unauthorized for datacenters you don't have access to", async () => {
    const response = await axios
      .get(`${url}/datacenter/bro`, fakeHeaders)
      .catch((err) => {
        assert.strictEqual(err.response.status, 401);
        assert.strictEqual(
          err.response.data.message,
          "You don't have access to view this datacenter"
        );
      });
  });
  it("GET /datacenter/all   - can get all datacenters you have access to", async () => {
    const response = await axios.get(`${url}/datacenter/all`, fakeHeaders);
    assert.strictEqual(response.status, 200);
    assert.isNotEmpty(response.data);
    assert.isArray(response.data);
  });
  it("PUT /datacenter       - can respond with unauthorized for datacenter a you don't have access to", async () => {
    const response = await axios
      .put(
        `${url}/datacenter/${fakeDatacenterName}/machine/${fakeMachineUuid}`,
        undefined,
        fakeHeaders
      )
      .catch((err) => {
        assert.strictEqual(err.response.status, 403);
        assert.strictEqual(
          err.response.data.message,
          "That machine doesn't belong to you"
        );
      });
  });
  it("PUT /datacenter       - can add a user to a datacenter you're in", async () => {
    const response = await axios.put(
      `${url}/datacenter/${fakeDatacenterName}/user/${fakeUser2.uuid}`,
      undefined,
      fakeHeaders
    );
    assert.strictEqual(response.status, 201);
  });
});
