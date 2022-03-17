"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
require("ts-mocha");
const validators_1 = require("../src/utils/validators");
const utils_1 = require("./utils");
(0, utils_1.describe)("✔ Validators", () => {
    (0, utils_1.describe)("Validators.validateEmail()", () => {
        it("should be true with a valid email", () => (0, chai_1.expect)(validators_1.Validators.validateEmail("testemail@gmail.com")).to.be.true);
        it("should be false with an empty string", () => (0, chai_1.expect)(validators_1.Validators.validateEmail("")).to.be.false);
        it("should be false with an invalid email", () => (0, chai_1.expect)(validators_1.Validators.validateEmail("bullshi9372gufb389@@@@.com")).to.be.false);
    });
    (0, utils_1.describe)("Validators.validatePassword()", () => {
        it("should be true with a valid password", () => (0, chai_1.expect)(validators_1.Validators.validatePassword("asfasfiaownf256!@")).to.be.true);
        it("should be false with an empty string", () => (0, chai_1.expect)(validators_1.Validators.validatePassword("")).to.be.false);
        it("should return false if the password is less than 4 characters long", () => (0, chai_1.expect)(validators_1.Validators.validatePassword("333")).to.be.false);
        it("should return false if the password is longer than 64 characters long", () => (0, chai_1.expect)(validators_1.Validators.validatePassword("1234567890dartfywu4w784f8w4f0w74t4ui4q1234567890dartfywu4w784ruig")).to.be.false);
    });
    (0, utils_1.describe)("Validators.validateUsername()", () => {
        it("should be true with a valid username", () => (0, chai_1.expect)(validators_1.Validators.validateUsername("N1kO23")).to.be.true);
        it("should be false with an empty string", () => (0, chai_1.expect)(validators_1.Validators.validateUsername("")).to.be.false);
        it("should return false if the username consists of non-alphanum characters ", () => (0, chai_1.expect)(validators_1.Validators.validateUsername("!@#$%^&*(YTDERTYUJ")).to.be.false);
    });
    (0, utils_1.describe)("Validators.validateUUID()", () => {
        it("should be true with a valid uuid", () => (0, chai_1.expect)(validators_1.Validators.validateUUID("5852a4ee-6b5e-4d40-8c7b-78bc6c7d65c6")).to.be.true);
        it("should be false with an invalid uuid", () => (0, chai_1.expect)(validators_1.Validators.validateUUID("5852a4ex-6b5e-4d40-8c7b-78xc6c7d65c6")).to.be.false);
        it("should be false with an empty string", () => (0, chai_1.expect)(validators_1.Validators.validateUUID("")).to.be.false);
    });
    (0, utils_1.describe)("Validators.validateHostname()", () => {
        it("should be true with a valid hostname", () => (0, chai_1.expect)(validators_1.Validators.validateHostname("testing-5235.yourmom.com")).to.be.true);
        it("should allow capitalization", () => (0, chai_1.expect)(validators_1.Validators.validateHostname("tEsTiNg-5235.yOuRmOm.cOm")).to.be.true);
        it("should be false if the hostname is longer than 253 characters long", () => (0, chai_1.expect)(validators_1.Validators.validateHostname(`${"testing-5235.".repeat(24)}com`)).to.be.false);
        it("should be false with an invalid hostname", () => (0, chai_1.expect)(validators_1.Validators.validateHostname("&*@D2nd2niq")).to.be.false);
        it("should be false if the hostname starts with a '-'", () => (0, chai_1.expect)(validators_1.Validators.validateHostname("-testing-5235.yourmom.com")).to.be.false);
        it("should be false if the hostname is empty", () => (0, chai_1.expect)(validators_1.Validators.validateHostname("")).to.be.false);
    });
});
