const jwt = require("jsonwebtoken");
const User = require("@/models/User.js");

let auth = (req, res, next) => {
  const token = req.get("Authorization").substring(7);

  jwt.verify(token, process.env.SECRET, async (error, payload) => {
    if (error) {
      res.status(401).json({ message: "You must be logged in to view your user info idiot 🖕🖕🖕", error });
      return;
    }
    req.user = await User.findOne({ _id: payload.uuid }).exec();
    next();
  });
};

module.exports = auth;
