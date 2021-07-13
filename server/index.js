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
process.env.BACKEND_URL = process.env.NODE_ENV.trim() === "development" ? "http://localhost:8080" : "https://backend.xornet.cloud";
if (process.env.NODE_ENV.trim() === "development") {
  var server = require("http").createServer(app);
  var io = require("socket.io")(server, { cors: { origin: "*" } });
} else {
  var options = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
  };
  var server = require("https").createServer(options, app);
  var io = require("socket.io")(server, { cors: { origin: "*" } });
}
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
app.use(cors({ allowedHeaders: ["Content-Type", "Authorization"] }));
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

server.listen(port, () => console.log(`Started on port ${port.toString()}`));
