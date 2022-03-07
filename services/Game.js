const { newDeck, updateCards, verifySet } = require("./GameLogic");

//Settings not implemented
module.exports = class Game {
  constructor(lobbyId, players, settings = {}) {
    [initialCardsInPlay, initialDeck] = newDeck();

    const initializeScoreBoard = (players) => {
      let scoreBoard = {};
      players.forEach((player) => {
        scoreBoard[player.id] = { displayName: player.displayName, score: 0 };
      });
      return scoreBoard
    };

    this.lobbyId = lobbyId;
    this.cardsInPlay = initialCardsInPlay;
    this.deck = initialDeck;
    this.scoreBoard = initializeScoreBoard(players);
    this.isGameOver = false
  }

  removePlayer(playerId) {
    delete this.scoreBoard[playerId]
  }

  scoreSet(playerId, set) {
    if (set.every(card => this.cardsInPlay.includes(card)) && verifySet(set)) {
      let [updatedCards, updatedDeck, isGameOver] = updateCards(this.cardsInPlay, this.deck, set)
      this.scoreBoard[playerId][score] += 1
      this.cardsInPlay = updatedCards
      this.deck = updatedDeck
      this.isGameOver = isGameOver
    }
  }
  restartGame() {}
}
