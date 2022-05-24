const lobbyManager = require("../services/LobbyManager");
const { newGame, updateGame } = require("../services/GameManager");
module.exports = (io, socket) => {
  const createLobby = ({ user, options }, callback) => {
    let newLobby = lobbyManager.createLobby(user, options);
    const rooms = Array.from(socket.rooms);
    if (rooms && rooms.length) {
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    }
    socket.join(newLobby.id);
    console.log(socket.rooms);
    callback(newLobby);
  };

  const joinLobby = ({ user, lobbyId }, callback) => {
    try {
      const lobby = lobbyManager.joinLobby(user, lobbyId);
      const rooms = Array.from(socket.rooms);
      if (rooms && rooms.length) {
        rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
      }
      socket.join(lobbyId);
      console.log(socket.rooms);
      callback(lobby);
    } catch (e) {
      console.error(e.message);
    }
  };

  const leaveLobby = ({ user, lobbyId }, callback) => {
    try {
      lobbyManager.leaveLobby(user, lobbyId);
    } catch (e) {
      callback(false);
      console.error(e.message);
    }
    const rooms = Array.from(socket.rooms);
    if (rooms && rooms.length) {
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    }
    callback(true);
  };
  const setGameOptions = ({ options, lobbyId }, callback) => {
    try {
      lobbyManager.setLobbyGameState(
        lobbyId,
        newGame(options.gameOptions, options.deckOptions)
      );
      callback(true);
    } catch {
      callback(false);
    }
  };

  const setReady = ({ user, lobbyId, readyState }, callback) => {
    try {
      const updatedLobby = lobbyManager.setUserReady(lobbyId, user, readyState);
      if (updatedLobby) {
        callback(true);
        io.to(lobbyId).emit("lobby:update", updatedLobby);
      } else {
        callback(false);
      }
    } catch {
      callback(false);
    }
  };

  socket.on("lobby:leave", leaveLobby);
  socket.on("lobby:set-game-options", setGameOptions);
  socket.on("lobby:create", createLobby);
  socket.on("lobby:join", joinLobby);
  socket.on("lobby:set-ready", setReady);
};