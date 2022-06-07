const { newDeck, updateCards, verifySet } = require("./GameLogic");

exports.newGame = (gameOptions, deckOptions) => {
  const { cardsInPlay, initialDeck } = newDeck(deckOptions);
  const game = {
    options: gameOptions,
    cardsInPlay: cardsInPlay,
    deck: initialDeck,
    isOver: false,
    scores: [],
  };
  return game;
};

exports.updateGame = (game, setToScore, user) => {
  const cardsInPlay = game.cardsInPlay;
  const deck = game.deck;
  const mode = game.options.mode;

  if (!verifySet(setToScore)) throw new Error("Invalid set");
  if (setToScore.every((card) => cardsInPlay.some((el) => el.id === card.id))) {
    const returnSetToDeck = mode !== "standard";
    console.log(game.scores);
    const updatedScores = game.scores.map((entry) => {
      if (entry.user.socketId === user.socketId) {
        return {
          ...entry,
          score: entry.score + 1,
        };
      } else {
        return entry;
      }
    });
    console.log(updatedScores);
    const [updatedCardsInPlay, updatedDeck, isGameOver] = updateCards(
      cardsInPlay,
      deck,
      setToScore,
      returnSetToDeck
    );

    return {
      ...game,
      cardsInPlay: updatedCardsInPlay,
      deck: updatedDeck,
      isOver: isGameOver,
      scores: updatedScores,
    };
  } else {
    throw new Error("Not all cards in this set remain in play");
  }
};
