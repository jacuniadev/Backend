require("colors");
require("dotenv").config();
require("module-alias/register");
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.BACKEND_PORT || 8080;
const app = express();
const cors = require("cors");
const options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
};
const https = require("https").createServer(options, app);
const io = require("socket.io")(https, { cors: { origin: "*" } });
module.exports = io;
require("@/services/sockets");

const Stats = require("@/models/Stats.js");
const Logs = require("@/models/Logs.js");

const pty = require("node-pty-prebuilt-multiarch");
const PTYService = require("@/services/PTYService");
const multer = require("multer");
const upload = multer({ dest: "./temp/" });

app.use(express.static("uploads"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(upload.any());
app.use(morgan("dev")); // Enable HTTPs code logs
app.use(cors({allowedHeaders: ['Content-Type', 'Authorization']}));
app.use(require("@/routes/login"));
app.use(require("@/routes/signup"));
app.use(require("@/routes/profile"));
app.use(require("@/routes/stats"));
app.use(require("@/routes/reporter"));
app.use(require("@/routes/search"));
app.use(require("@/routes/logs"));
app.use(require("@/routes/datacenter"));
app.use(require("@/routes/machines"));

process.on("uncaughtException", async (err, origin) => {
  await Logs.add("API", err);
  console.log(err);
});

https.listen(port, () => console.log(`Started on port ${port.toString()}`));
