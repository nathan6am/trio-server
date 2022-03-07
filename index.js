const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const port = 8000;
const io = socket(server);


const lobbies = {};

server.listen(port, () => console.log(`server is listening on port ${port}`));

