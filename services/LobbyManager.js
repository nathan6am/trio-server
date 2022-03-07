// Generate a unique Lobby code
const {Game} = require("./Game");

generateLobbyId = (activeLobbies) => {
  let lobbyId;
  
  do {
    lobbyId = Math.floor(100000 + Math.random() * 900000).toString(10);
  } while (activeLobbies.lobbyId);

  return lobbyId;
};

class Lobby {
  constructor(creator, activeLobbies) {
    this.lobbyId = generateLobbyId(activeLobbies)
    this.players = []
  }
  registerPlayer(player) {

  }
  createGame(gameSettings = {}) {

  }
}