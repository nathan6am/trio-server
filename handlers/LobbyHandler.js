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
      io.to(lobbyId).emit("lobby:update", lobby);
      socket.join(lobbyId);
      console.log(socket.rooms);
      callback(lobby);
    } catch (e) {
      callback(null);
      console.error(e.message);
    }
  };

  const leaveLobby = ({ user, lobbyId }, callback) => {
    try {
      const lobby = lobbyManager.getLobby(lobbyId);
      const currentUser = lobby.users.find(
        (el) => el.socketId === user.socketId
      );

      const userIsAdmin = currentUser?.isAdmin;

      if (userIsAdmin) {
        // Destroy the lobby is the admin leaves, emit "admin-left" and remove all connections from the room
        lobbyManager.removeLobby(lobbyId);
        callback(true);
        const rooms = Array.from(socket.rooms);
        if (rooms && rooms.length) {
          rooms.forEach((room) => {
            if (room !== socket.id) {
              socket.leave(room);
            }
          });
        }
        io.to(lobbyId).emit("lobby:admin-left");
        io.in(lobbyId).socketsLeave(lobbyId);
      } else {
        const updatedLobby = lobbyManager.leaveLobby(user, lobbyId);
        const rooms = Array.from(socket.rooms);
        if (rooms && rooms.length) {
          rooms.forEach((room) => {
            if (room !== socket.id) {
              socket.leave(room);
            }
          });
        }
        io.to(lobbyId).emit("lobby:update", updatedLobby);
        callback(true);
      }
    } catch (e) {
      callback(false);
      console.error(e.message);
    }
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
      const updatedLobby = lobbyManager.setUserReady(
        lobbyId,
        socket.id,
        readyState
      );
      if (updatedLobby) {
        io.to(lobbyId).emit("lobby:update", updatedLobby);
        callback(true);
      } else {
        callback(false);
      }
    } catch (e) {
      console.error(e.message);
      callback(false);
    }
  };

  socket.on("lobby:leave", leaveLobby);
  socket.on("lobby:set-game-options", setGameOptions);
  socket.on("lobby:create", createLobby);
  socket.on("lobby:join", joinLobby);
  socket.on("lobby:set-ready", setReady);
};
