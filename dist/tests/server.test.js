"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("mocha");
require("ts-mocha");
const chai_1 = require("chai");
const utils_1 = require("./utils");
const backend_class_1 = require("../src/classes/backend.class");
(0, utils_1.describe)("🔰 Test Server Class", () => {
    (0, utils_1.describe)("create()", () => {
        let backend;
        afterEach(() => backend.server.close());
        it("setting the port to 3007 should run it on 3007", async () => {
            backend = await backend_class_1.Backend.create({
                port: 3007,
                secure: false,
                verbose: false,
                mongoUrl: process.env.MONGO_TESTING_URL || "mongodb://127.0.0.1/xornet-testing",
            });
            (0, chai_1.expect)(backend.port).to.equal(3007);
        });
    });
});
