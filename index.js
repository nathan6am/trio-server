const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const registerLobbyHandlers = require("./services/LobbyHandler.js");

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
});

httpServer.listen(8000, () => {
  console.log("listening on port 8000");
});
