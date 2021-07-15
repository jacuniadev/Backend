const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
const uuidRegex = /([a-f0-9]{32})|([a-f0-9]{16})/;

const schema = new Schema(
  {
    _id: String, // String is shorthand for {type: String}
    static: { type: Object, default: null },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  }
);

/**
 * Attempts to create a machine and save them to the database
 * @param {String} [machineUUID] The machine's uuid
 * @param {Object} [staticData] contains the staticData data of the machine
 */
schema.statics.add = async function (machineUUID, staticData) {
  machineUUID = machineUUID.replace(/-/g, "");
  if (!uuidRegex.test(machineUUID)) return;
  const machine = await this.findOne({ _id: machineUUID }).exec();
  if (machine) {
    console.warn(`[MANGOLIA]: Machine with uuid '${machine._id}' is already in the database!`);
    machine.static = staticData;
    await machine.save();
    return;
  }
  await new this({ _id: machineUUID, static: staticData }).save();
};

schema.statics.delete = async function (machineUUID) {
  return await this.findOneAndRemove({_id: machineUUID});
};

module.exports = mongoose.model("Machine", schema);
