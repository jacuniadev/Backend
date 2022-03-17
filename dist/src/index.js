"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const backend_class_1 = require("./classes/backend.class");
async function main() {
    console.clear();
    process.on("uncaughtException", (err) => console.error("Uncaught Exception: ", err.message));
    const backend = process.env.MODE === "production"
        ? backend_class_1.Backend.create({
            port: 8085,
            secure: true,
            verbose: true,
            mongoUrl: process.env.MONGO_URL,
        })
        : backend_class_1.Backend.create({
            port: 7000,
            secure: false,
            verbose: true,
            mongoUrl: process.env.MONGO_TESTING_URL || "mongodb://127.0.0.1:27017",
        });
    await backend;
}
main();
