const lobbyManager = require("../services/LobbyManager");
const { updateGame } = require("../services/GameManager");

module.exports = (io, socket) => {
  const startGame = (lobbyId, callback) => {
    try {
      let updatedLobby = lobbyManager.startCurrentGame(lobbyId, socket.id);
      const game = updatedLobby.game;
      if (!updatedLobby) {
        callback(false);
      } else {
        callback(true);
        io.to(lobbyId).emit("lobby:update", updatedLobby);
        if (game.options.timeLimit) {
          setTimeout(() => {
            const lobby = lobbyManager.getLobby(lobbyId);
            lobby.gameActive = false;
            let gameState = lobbyManager.getLobbyGameState(lobbyId);
            gameState.isOver = true;
            lobby.game = gameState;
            const users = lobby.users.map((user) => {
              return { ...user, ready: false };
            });
            lobby.users = users;
            io.to(lobbyId).emit("game:ended", lobby);
          }, (game.options.timeLimit + 10) * 1000);
        }
      }
    } catch (e) {
      console.error(e.message);
      callback(false);
    }
  };

  const scoreGame = ({ lobbyId, user, setToScore }, callback) => {
    try {
      const gameState = lobbyManager.getLobbyGameState(lobbyId);

      const updatedGame = updateGame(gameState, setToScore, user);
      lobbyManager.setLobbyGameState(lobbyId, updatedGame);

      callback(true);
      if (updateGame.isOver) {
        const lobby = lobbyManager.getLobby(lobbyId);
        lobby.gameActive = false;
        lobby.game = game;
        const users = lobby.users.map((user) => {
          return { ...user, ready: false };
        });
        lobby.users = users;
        io.to(lobbyId).emit("game:ended", lobby);
      }
      io.to(lobbyId).emit("game:update", updatedGame);
    } catch (e) {
      console.error(e.message);
      callback(false);
    }
  };
  socket.on("game:start", startGame);
  socket.on("game:score", scoreGame);
};
