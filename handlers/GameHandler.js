const lobbyManager = require("../services/LobbyManager");
const { updateGame } = require("../services/GameManager");

module.exports = (io, socket) => {
  const startGame = (lobbyId, callback) => {
    const updatedLobby = lobbyManager.startCurrentGame(lobbyId, socket.id);
    if (!updatedLobby) {
      callback(false);
    } else {
      callback(true);
      io.to(lobbyId).emit("lobby:update", updatedLobby);
    }
  };

  const scoreGame = ({ lobbyId, user, setToScore }, callback) => {
    try {
      const gameState = lobbyManager.getLobbyGameState(lobbyId);

      const updatedGame = updateGame(gameState, setToScore, user);
      lobbyManager.setLobbyGameState(lobbyId, updatedGame);
      callback(true);
      io.to(lobbyId).emit("game:update", updatedGame);
    } catch (e) {
      console.log(e.message);
      callback(false);
    }
  };
  socket.on("game:start", startGame);
  socket.on("game:score", scoreGame);
};
