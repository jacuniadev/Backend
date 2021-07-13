const io = require("@/index.js");
const parseReport = require("@/util/parseReport");
const Machine = require("@/models/Machine.js");
const User = require("@/models/User.js");
const Datacenter = require("@/models/Datacenter.js");
const Stats = require("@/models/Stats.js");
const authSocket = require("@/middleware/authSocket.js");
io.use(authSocket);

let latestVersion = "0.0.27";

const SPEEDTEST_BASE_REWARD = 30;
const REPORT_BASE_REWARD = 5;

async function calculateReporterUptimePoints(reporterUptime) {
  return ~~(reporterUptime / 86400);
}
async function calculateSpeedtestPoints() {
  return SPEEDTEST_BASE_REWARD + ~~(Math.random() * SPEEDTEST_BASE_REWARD);
}
async function calculateReportPoints() {
  return REPORT_BASE_REWARD + ~~(Math.random() * REPORT_BASE_REWARD);
}

let machines = new Map();
let machinesPings = new Map();
let machinesStatic = new Map();

// Temp clear out machines every 60seconds to clear
setInterval(() => {
  machines.clear();
}, 60000);

// Log amount of sockets connected every minute
setInterval(() => {
  console.log(`Total Websocket connections: ${io.sockets.sockets.size}`.red);
}, 10000);

// Run every hour
setInterval(() => io.sockets.in("reporter").emit("runSpeedtest"), 3600000 * 8);
// setTimeout(() => io.sockets.in("reporter").emit("runSpeedtest"), 10000);
// setInterval(() => io.sockets.in("reporter").emit("restart"), 10000);

// Temp clear out machines every 60seconds to clear
setInterval(async () => {
  // Emit to all clients
  // emitToClients();
  io.sockets.in("reporter").emit("heartbeat", Date.now());
  io.sockets.in("client").emit("machines", Object.fromEntries(machines));
}, 1000);

io.on("connection", async (socket) => {
  if (!socket.handshake.auth.type) return socket.disconnect();

  console.log(`[WEBSOCKET] ${socket.handshake.auth.type} connected`);

  if (socket.handshake.auth.type === "client") {
    if (!socket.user) return;

    // General room for all clients to emit to if needed
    socket.join("client");

    // Unique client rooms
    socket.join(`client-${socket.user._id}`);

    socketTerminalConnections = 0;

    // Forward terminal input to PTY
    socket.on("newTerminalConnection", machineUUID => {
      socketTerminalConnections++;
      console.log(socketTerminalConnections);
      if (socketTerminalConnections > 1) return;

      // Get the room of the reporter
      const room = io.sockets.adapter.rooms.get(`reporter-${machineUUID}`);

      // If it doesn't exist it means it's offline so return
      if (!room) return;

      // Get the reporter from it's room
      const reporterSocket = io.sockets.sockets.get(Array.from(room)[0]);

      // If the client disconnects disconnect the terminal
      socket.on("disconnect", () => {
        socketTerminalConnections--;
        reporterSocket.emit('terminateTerminal')
      });
      socket.on("terminateTerminal", () => {
        socketTerminalConnections--;
        reporterSocket.emit('terminateTerminal')
      });

      // Log the event
      console.log("New terminal connection");

      // Tell the reporter we wanna start a terminal
      reporterSocket.emit("startTerminal");


      // When the client sends text input forward it to the reporter
      socket.on("input", input => {
        console.log(input);
        reporterSocket.emit("input", input)
      });
    });

    socket.on("getMachines", async () => Object.fromEntries(machines));
    socket.on("getPoints", (username) => {
      userToGetPointsOf = username;
    });
    let userToGetPointsOf = socket.user.username;
    const pointInterval = setInterval(async () => {
      const points = (await User.findOne({ username: userToGetPointsOf }))?.points;
      if (points) socket.emit("points", points);
    }, 1000);

    // This should be moved into the reporters and be secured
    // let pty = new PTYService(socket);
    // socket.on("input", input => {
    //   pty.write(input);
    // });

    socket.on("disconnect", () => clearInterval(pointInterval));
  }
  if (socket.handshake.auth.type === "reporter" && socket.handshake.auth.uuid !== "") {
    await Machine.add(socket.handshake.auth.static);

    // General reporter room for Heartbeat / pings
    socket.join("reporter");

    // Unique reporter room
    socket.join(`reporter-${socket.handshake.auth.uuid}`);

    // Calculate ping and append it to the machine map
    socket.on("heartbeatResponse", (heartbeat) => machinesPings.set(heartbeat.uuid, Math.ceil((Date.now() - heartbeat.epoch) / 2)));


    let pausePoints = false;

    socket.on("speedtest", async (speedtest) => {
      if (!speedtest?.type) return;
      delete speedtest.type;
      const userUUID = socket.handshake.auth.static?.reporter?.linked_account;
      const user = await User.findOne({ _id: userUUID }).exec();
      await user.addPoints(await calculateSpeedtestPoints());
      user.speedtest = speedtest;
      user.save();
    });

    socket.on("processes", async (processes) => {
      console.log(processes.length);
    });

    // Parse reports
    // Report is what is collected from the Reporter
    socket.on("report", async (report) => {
      // Return if the reporter hasn't authenticated
      if (socket.handshake.auth.static?.reporter?.linked_account == null) return;

      // Return if theres some value that is undefined
      if (Object.values(report).some((field) => field == null)) return;

      // Get the user from the database cus im an idiot so we can append the pfp / username to each report
      // & replace the uuid with it
      let user = await User.findOne({ _id: socket.handshake.auth.static.reporter.linked_account }).exec();

      let points = 0;
      points += await calculateReportPoints();
      if (report.reporterUptime) points += await calculateReporterUptimePoints(report.uptime);

      if (points != null && !pausePoints) user.addPoints(points);

      // Assign the linked account from the socket's auth to the report
      // So it goes to the frontend
      report.owner = {
        username: user?.username,
        profileImage: user?.profileImage?.url,
      };

      // Assign datacenter
      // TODO: Make this not query the DB on every report as its inneffienct
      report.datacenter = await Datacenter.findOne({ machines: socket.handshake.auth.uuid }).exec();

      // Add geolocation data
      // So it goes to the frontend
      report.geolocation = socket.handshake.auth.static.geolocation;
      if (report.geolocation) delete report.geolocation.ip;

      // Validate / parse the report
      report = parseReport(report, latestVersion, machinesPings);

      // Assign statics
      machinesStatic.set(report.uuid, socket.handshake.auth);

      // Assign report
      machines.set(report.uuid, report);

      // Add to database
      if (!report.rogue) await Stats.add(report);
    });
  }
});

io.on("disconnection", () => {
  console.log("[WEBSOCKET] Disconnected");
});
