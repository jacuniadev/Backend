const express = require("express");
const router = express.Router();
const Stats = require("@/models/Stats.js");
const Machine = require("@/models/Machine.js");
const Datacenter = require("@/models/Datacenter.js");
const auth = require("@/middleware/auth.js");
const cleanObject = require("@/util/cleanObject.js");

// Gets the entire xornet's infrustrucutre's daily traffic
router.get("/stats/daily-traffic", async (req, res) => {
  res.status(200).json(await Stats.fetchDailyTraffic(86400000));
});

// Gets the machines last few history network properties for the graphs
router.get("/stats/network/:machine", auth, async (req, res) => {
  res.status(200).json(await Stats.fetchMachineNetwork(req.params.machine));
});

// TODO: Add the user's ID in the machine so we can auth the machines to users
// so random people wont be able to get people's details cus they kinda
// important to keep a secret you know?
router.get("/stats/machine/:machineUUID?", auth, async (req, res) => {
  const machine = await Machine.findOne({ _id: req.params.machineUUID });
  const datacenter = await Datacenter.findOne({ machines: req.params.machineUUID });

  // TODO: turn these into a middleware for future use
  if (!req.user.machines.includes(machine._id) && !datacenter?.members.includes(req.user._id) && !req.user.is_admin) return res.status(403).json({message: "you don't have permission to view this machine"});
  if (!machine) return res.status(404).json({message: "machine not found"});

  // Delete this useless property
  // TODO: probably should make it so these don't exist in the first place
  // and add some sort of validation on the staticData
  delete machine.static.version;
  machine.static.ram = machine.static.memLayout;
  machine.static.disk = machine.static.diskLayout;
  delete machine.static.memLayout;
  delete machine.static.diskLayout;

  res.status(200).json(cleanObject(machine.static));
});

module.exports = router;
