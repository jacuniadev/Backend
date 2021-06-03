const auth = require("@/middleware/auth.js");
const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "./temp/" });
const router = express.Router();
const Joi = require("joi");
const User = require("@/models/User.js");
const FileType = require('file-type');

const jimpMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/tiff",
  "image/bmp",
];

const schema = Joi.object({
  _id: Joi.string(),
  username: Joi.string().alphanum().min(3).max(30),
  profileImage: Joi.object(),
  profileBanner: Joi.object(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9!@#$%^&*()_+$]{3,30}")),
  repeat_password: Joi.ref("password"),
  geolocation: Joi.object(),
  created_at: Joi.number(),
  points: Joi.number(),
  bio: Joi.string(),
  isDev: Joi.string(),
  is_admin: Joi.boolean(),
  socials: Joi.array(),
  badges: Joi.object(),
  email: Joi.string().email({ minDomainSegments: 2 }),
});

async function resizeSaveImage(image) {
  return new Promise(async (resolve, reject) => {
    let date = Date.now();
    const filetype = await FileType.fromFile(`./temp/${image.filename}`);

    console.log(filetype);
    if (jimpMimeTypes.includes(filetype.mime)) {
      try {
        Jimp.read(`./temp/${image.filename}`, async (err, jimpImage) => {
          fs.unlink(`./temp/${image.filename}`, () => {});
          if (err) throw err;
          if (jimpImage.bitmap.width > 256) jimpImage.resize(Jimp.AUTO, 256);
          jimpImage.write(`./uploads/images/${date}-${image.originalname}`);
          resolve({
            url: `https://backend.xornet.cloud/images/${date}-${image.originalname}`.replace(/\s/g, "%20"),
            hasAlpha: jimpImage.hasAlpha(),
          });
        });
      } catch (error) {
        reject(error);
      }
    }
  });
}

async function saveImage(image) {
  return new Promise(async (resolve, reject) => {
    let date = Date.now();
    fs.rename(`./temp/${image.filename}`, `./uploads/images/${date}-${image.originalname}`, (err) => {
      if (err) console.log(err);
      resolve({
        url: `https://backend.xornet.cloud/images/${date}-${image.originalname}`.replace(/\s/g, "%20"),
      });
    });
  });
}

router.use(upload.any());

router.get("/profile/:username", auth, async (req, res) => {
  if (req.params.username == undefined) return res.status(404);
  // If the user is the currently logged in one just send this back
  if (req.params.username == req.user.username) {
    if (req.user.password) req.user.password = undefined;
    if (req.user.machines) req.user.machines = undefined;
    if (req.user.geolocation?.isp) req.user.geolocation.isp = undefined;
    return res.status(200).json(req.user);
  }

  // If they arent logged in then that means they are trying to see
  // another user's profile so we fetch it from the database
  const user = await User.findOne({ username: req.params.username });
  if (user.password) user.password = undefined;
  if (user.machines) user.machines = undefined;
  if (user.geolocation?.isp) user.geolocation.isp = undefined;
  return res.status(200).json(user);
});

router.patch("/profile", auth, async (req, res) => {
  req.body.json = JSON.parse(req.body.json);
  try {
    let profile = req.body.json;
    for (file of req.files) {
      
      // Check for valid mimetype
      const filetype = await FileType.fromFile(`./temp/${file.filename}`);
      if (!filetype.mime.startsWith("image")){
        return res.status(400).json({ error: 'invalid file type' });
      }

      // Validate profile integrity
      switch (file.fieldname) {
        case "image":
          // If the image is a gif then simply save it without resizing
          if(filetype.mime == 'image/gif') profile.profileImage = await saveImage(file);
          else profile.profileImage = await resizeSaveImage(file);
          break;
        case "banner":
          profile.profileBanner = await saveImage(file);
          break;
      }

      // Validate profile integrity
      await schema.validateAsync(profile);
    }
    await User.update(req.user._id, profile);
    res.status(201).json({ message: "Profile updated", profile });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error });
  }
});

const uuidRegex = /[a-f0-9]{32}/;

router.put("/profile/machine", auth, async (req, res) => {
  await User.addMachine(req.user._id, req.body.machine);
  if (!uuidRegex.test(req.body.machine)) return res.status(400).json({ message: "invalid uuid" });
  res.status(201).json({ message: "machine added" });
});

module.exports = router;
