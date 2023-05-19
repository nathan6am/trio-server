const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const registerLobbyHandlers = require("./handlers/LobbyHandler.js");
const registerGameHandlers = require("./handlers/GameHandler.js");
const registerDisconnectHandler = require("./handlers/DisconnectHandler.js");
const port = process.env.PORT || 3000;
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
