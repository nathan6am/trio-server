const { newDeck, updateCards, verifySet } = require("./GameLogic");
const options = {
  colors: ["pink", "green", "purple"],
  shapes: ["squiggle", "diamond", "hourglass"],
  fills: ["empty", "diagonalStriped", "solid"],
};

let [initialCards, initialDeck] = newDeck(options);

console.log(initialCards);
