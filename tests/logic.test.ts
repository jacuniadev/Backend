import { describe, it } from "mocha";
import { expect } from "chai";
import { Validators } from "../src/validators";
import { randomHexColor } from "../src/logic";

describe("Logic functions", () => {
  describe("randomHexColor()", () => {
    it("can generate a valid hex color", () => {
      const color = randomHexColor();
      expect(color).to.be.a("string");
      expect(Validators.validate_hex_color(color)).to.be.true;
    });
  });
});
