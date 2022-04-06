require("dotenv").config();
import { DatabaseManager } from "../src/database/DatabaseManager";
import { describe, it } from "mocha";
import { expect } from "chai";

describe("Database Tests", () => {
  it("should be able to create a new database", async () => {
    const db = await DatabaseManager.new();
    expect(db).to.not.be.undefined;
  });
});
