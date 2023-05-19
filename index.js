const express = require("express");
const { createServer } = require("http");
const https = require("https");
const { Server } = require("socket.io");
const fs = require("fs");
require("dotenv").config();

const environment = process.env.NODE_ENV || "development";
const credentials =
  environment === "development"
    ? null
    : {
        key: fs.readFileSync(process.env.KEY_PATH, "utf-8"),
        cert: fs.readFileSync(process.env.CERT_PATH, "utf-8"),
      };
console.log(credentials);
const app = express();
const httpServer = environment === "development" ? createServer(app) : https.createServer(credentials, app);
const registerLobbyHandlers = require("./handlers/LobbyHandler.js");
const registerGameHandlers = require("./handlers/GameHandler.js");
const registerDisconnectHandler = require("./handlers/DisconnectHandler.js");
const port = environment === "development" ? process.env.DEV_PORT || 8000 : process.env.PROD_PORT || 443;
app.get("/ping", (req, res) => {
  res.send("pong");
});
const io = new Server(httpServer, {
  cors: {
    origin: "*", //your website origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("new connection");
  socket.on("user:setDisplayName", (displayName) => {
    console.log(displayName);
  });

  registerLobbyHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerDisconnectHandler(io, socket);
});

httpServer.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
