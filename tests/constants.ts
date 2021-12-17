import { MachineSignupInput } from "../src/types/machine";
import { UserSignupInput } from "../src/types/user";

export const userPayload: UserSignupInput = {
  username: "foobar",
  password: "FooBar2000",
  email: "foobar@foobar.com",
};

export const machinePayload: MachineSignupInput = {
  two_factor_key: "DE6C5215B96440FABB2EB27C425A0240",
  hardware_uuid: "5852a4ee-6b5e-4d40-8c7b-78bccc7d65c6",
  hostname: "Ena",
};
