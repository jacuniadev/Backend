const express = require("express");
const router = express.Router();
const Machine = require("@/models/Machine.js");
const Datacenter = require("@/models/Datacenter.js");
const auth = require("@/middleware/auth.js");
const io = require("..");

router.use(auth);

// Shutdown or reboot machines
router.post("/machine/:machineUUID/:method", auth, async (req, res) => {
  return res.status(200).json(
    await new Promise(async (resolve) => {
      if (req.params.method !== "shutdown" && req.params.method !== "restart") return res.status(404).json({ message: "method must be either 'shutdown' or 'restart'" });
      const machine = await Machine.findOne({ _id: req.params.machineUUID });
      const datacenter = await Datacenter.findOne({ machines: req.params.machineUUID });

      // TODO: turn these into a middleware for future use
      if (!req.user.machines.includes(machine._id) && !datacenter?.members.includes(req.user._id)) return res.status(403).json({ message: "you don't have permission to view this machine" });
      if (!machine) return res.status(404).json({ message: "machine not found" });

      // Send a event to get the processes to this specific reporter
      io.sockets.in(`reporter-${req.params.machineUUID}`).emit(req.params.method);

      // Respond
      res.status(200).json({ message: `${req.params.method} sent to machine` });
    })
  );
});

module.exports = router;
