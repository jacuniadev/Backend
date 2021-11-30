const express = require("express");
const router = express.Router();
const Logs = require("@/models/Logs.js");
const auth = require("@/middleware/auth.js");

// This accepts either a username or a user's UUID
router.get("/logs/:machineuuid?", auth, async (req, res) => {
  const logs = await Logs.find().sort("-timestamp").limit(100);
  if (req.user.is_admin) return res.status(200).json(logs);
  return res.status(200).json(logs.filter((log) => log.user === req.user._id));
});

module.exports = router;
