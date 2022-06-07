const lobbyManager = require("../services/LobbyManager");
const { updateGame } = require("../services/GameManager");

module.exports = (io, socket) => {
  const startGame = (lobbyId, callback) => {
    let updatedLobby = lobbyManager.startCurrentGame(lobbyId, socket.id);
    const game = updatedLobby.game;
    if (!updatedLobby) {
      callback(false);
    } else {
      callback(true);
      io.to(lobbyId).emit("lobby:update", updatedLobby);
      if (game.options.timeLimit) {
        setTimeout(() => {
          let gameState = lobbyManager.getLobbyGameState(lobbyId);
          gameState.isOver = true;
          io.to(lobbyId).emit("game:time-limit-reached", gameState);
        }, (game.options.timeLimit + 5) * 1000);
      }
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
