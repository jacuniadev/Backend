const express = require("express");
const router = express.Router();
const Logs = require("@/models/Logs.js");
const Machine = require("@/models/Machine.js");
const User = require("@/models/User.js");
const Datacenter = require("@/models/Datacenter.js");
const auth = require("@/middleware/auth.js");
const datacenterAuth = require("@/middleware/datacenterAuth.js");
const FileType = require("file-type");
const saveImage = require("@/util/saveImage.js");
const { route } = require("./profile");
const Joi = require("joi");

router.use(auth);

router.post("/datacenter/new", async (req, res) => {
  if (req.body.name.toLowerCase() === "unassigned" || req.body.name.toLowerCase() === "all") return res.status(403).json({ message: "you can't call your datacenter 'unassigned' or 'all'" });

  // Validate name
  const schema = Joi.object({
    name: Joi.string()
      .regex(/^[a-z\d\-_\s]+$/i)
      .min(2)
      .max(30),
  });
  try {
    req.body = await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).json({ message: error.details[0].message });
  }
  try {
    const datacenter = await Datacenter.add(req.user.id, req.body.name);

    // Create the datacenter on the user's database
    await req.user.addDatacenter(datacenter._id);

    // If this is their first datacenter automatically make it their primary datacenter
    if (!req.user.primaryDatacenter) await req.user.setPrimaryDatacenter(datacenter._id);

    res.status(201).json(datacenter);
  } catch (error) {
    if (error.code == 11000) {
      res.status(403).json({ message: `Datacenter with name of ${req.body.name} is taken!` });
    }
  }
});

router.get("/datacenter/all", async (req, res) => {
  let datacenters = [];
  req.user.is_admin ? (datacenters = await Datacenter.find()) : (datacenters = await Datacenter.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }));

  // Append the owner as a full object because im an iidiot and i don't know how the mongoose connections work
  for (datacenter of datacenters) {
    datacenter.owner == req.user;
    let accumulator = [];
    for (member of datacenter.members) {
      const { username, profileImage, _id } = await User.findOne({ _id: member });
      accumulator.push({ username, profileImage, _id });
    }
    datacenter.members = accumulator;
  }
  res.status(200).json(datacenters);
});

router.delete("/datacenter/:datacenter", datacenterAuth, async (req, res) => {
  // Find the datacenters ID and delete it from the user
  let datacenter = await Datacenter.findOne({ _id: req.params.datacenter });
  await req.user.removeDatacenter(datacenter._id);

  // Delete the datacenter
  await Datacenter.findOneAndDelete({ _id: req.params.datacenter });

  res.status(200).json({ message: "Datacenter deleted" });
});

router.get("/datacenter/:datacenter?", datacenterAuth, async (req, res) => {
  const datacenter = await Datacenter.findOne({ _id: req.params.datacenter });
  datacenter.owner == req.user;
  datacenter.members.map(async (member) => {
    const { username, profileImage, _id } = await User.findOne({ _id: member });
    return { username, profileImage, _id };
  });
  res.status(200).json(datacenter);
});

router.patch("/datacenter/:datacenter?", datacenterAuth, async (req, res) => {
  if (req.files.length == 0) return res.status(403).json({ message: "no images provided" });
  const datacenter = await Datacenter.findOne({ _id: req.params.datacenter });

  try {
    for (file of req.files) {
      // Validate profile integrity
      switch (file.fieldname) {
        case "logo":
          // If the image is a gif then simply save it without resizing
          if (file.mimetype == "image/svg+xml") datacenter.logo = (await saveImage(file)).url;
          else return res.status(400).json({ message: "Invalid filetype, please provide an SVG/XML" });
          break;
        case "banner":
          if (file.mimetype.startsWith("image/")) datacenter.banner = (await saveImage(file)).url;
          else return res.status(400).json({ message: "Invalid filetype, please provide an Image" });
          break;
      }
    }
    await datacenter.save();
    res.status(201).json({ message: "datacenter updated", datacenter });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
});

router.get("/datacenter/:datacenter/machine/count", datacenterAuth, async (req, res) => {
  const datacenter = await Datacenter.findOne({ _id: req.params.datacenter });
  res.status(200).json({ count: datacenter.machines.length || 0 });
});

router.put("/datacenter/:datacenter/machine/:machineUUID", datacenterAuth, async (req, res) => {
  if (req.params.datacenter === "undefined" || req.params.machineUUID === "undefined") {
    return res.status(403).json({ message: "Undefined field" });
  }

  if (!req.user.machines.includes(req.params.machineUUID) && !req.user.is_admin) {
    return res.status(403).json({ message: "That machine doesn't belong to you" });
  }

  const query = await Datacenter.addMachine(req.params.datacenter, req.params.machineUUID);
  const machine = await Machine.findOne({ _id: req.params.machineUUID }).exec();
  machine.datacenter = req.params.datacenter;
  await machine.save();
  res.status(201).json(query);
});

router.delete("/datacenter/:datacenter/machine/:machineUUID", datacenterAuth, async (req, res) => {

  if (!req.user.machines.includes(req.params.machineUUID) && !req.user.is_admin) {
    return res.status(403).json({ message: "That machine doesn't belong to you" });
  }

  const query = await Datacenter.removeMachine(req.params.machineUUID, req.params.user);
  res.status(201).json(query);
});

router.put("/datacenter/:datacenter/user/:userUUID", datacenterAuth, async (req, res) => {
  const user = await User.findOne({ _id: req.params.userUUID });

  if (!user) {
    return res.status(403).json({ message: "That user doesn't exist in the database" });
  }

  const query = await Datacenter.addUser(req.params.datacenter, req.params.userUUID);
  res.status(201).json(query);
});

router.delete("/datacenter/:datacenter/user/:userUUID", datacenterAuth, async (req, res) => {
  if (req.params.datacenter === "undefined" || req.params.userUUID === "undefined") {
    return res.status(403).json({ message: "Undefined field" });
  }

  if (req.params.userUUID === req.user._id) {
    return res.status(403).json({ message: "You can not remove yourself from your own datacenter idiot, you're the owner" });
  }

  const user = await User.findOne({ _id: req.params.userUUID });

  if (!user) {
    return res.status(403).json({ message: "That user doesn't exist in the database" });
  }

  const query = await Datacenter.removeUser(req.params.datacenter, req.params.userUUID);
  res.status(201).json(query);
});

router.patch("/datacenter/primary/:datacenter", datacenterAuth, async (req, res) => {
  // We do this step because if we change the user from
  // Req.user and save it, it fucks up the database and adds
  // The entire datacenter object in the datacenters
  // Array on the user where they are supposed to be strings of UUIDs
  let updatedUser = await User.findOne({ _id: req.user._id });
  updatedUser = await updatedUser.setPrimaryDatacenter(req.params.datacenter);
  delete updatedUser.password;

  res.status(201).json({ message: "Datacenter set as primary", me: updatedUser });
});

module.exports = router;
