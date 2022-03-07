//--------- Deck Functions and Settings ----------//

//Deck options not yet implemented
const defaultDeckOptions = {
  colors: ["pink", "blue", "green"],
  shapes: ["diamond", "squiggle", "oval"],
  fills: ["empty", "solid", "striped"],
};

// returns an initial card setup for a game, 12 cards with at least one set and the remainining deck as [cardsInPlay, initialDeck]
exports.newDeck = (customDeckOptions = {}) => {
  const shuffle = (array) => {
    var copy = [],
      n = array.length,
      i;
    while (n) {
      i = Math.floor(Math.random() * array.length);
      if (i in array) {
        copy.push(array[i]);
        delete array[i];
        n--;
      }
    }
    return copy;
  };
  const deckOptions = { ...defaultDeckOptions, ...customDeckOptions };
  const colors = deckOptions.colors;
  const shapes = deckOptions.shapes;
  const fills = deckOptions.fills;
  const deck = [];
  deck.splice(0);
  [1, 2, 3].forEach(function (count) {
    colors.forEach(function (color) {
      shapes.forEach(function (shape) {
        fills.forEach(function (fill) {
          deck.push({
            count: count,
            shape: shape,
            color: color,
            fill: fill,
            id: `${count}${fill}${color}${shape}`,
          });
        });
      });
    });
  });
  let cardsInPlay = [];
  let shuffledDeck = shuffle(deck);
  const initialSet = findSet(shuffledDeck);
  const initialDeck = shuffledDeck.filter((card) => !initialSet.includes(card));
  cardsInPlay = shuffle([...initialDeck.splice(0, 9), ...initialSet]);
  return [cardsInPlay, initialDeck];
};

//Removes the set to score from the cards in play and deals cards, returns an array [updatedCardsInPlay, updatedDeck, isGameOver]
exports.updateCards = (cardsInPlay, deck, set) => {
  let setRemoved = removeSet(cardsInPlay, set);
  let isGameOver = checkForSets(setRemoved);
  const removeSet = (cardsInPlay, set) => {
    if (checkSet(set)) {
      return cardsInPlay.filter((card) => !set.includes(card));
    } else {
      throw new Error("Invalid set");
    }
  }
  if (deck.length === 0) {
    return [setRemoved, deck, isGameOver];
  } else {
    return dealCards(setRemoved, deck);
  }
};



function dealCards(cardsInPlay, deck) {
  
  let updatedCards = [];
  let isGameOver = false;
  let updatedDeck = [];

  const trySingleDeal = (cardsInPlay, potentialCards) => {
    const combos = combinations(potentialCards, 3);
    return combos.find((combo) => {
      return checkForSets([...cardsInPlay, ...combo]);
    });
  }

  if (deck.length <= 3) {
    updatedCards = [...cardsInPlay, ...deck];
    isGameOver = !checkForSets(updatedCards);
  } else if (checkForSets(cardsInPlay)) {
    updatedDeck = deck;
    updatedCards = [...cardsInPlay, ...updatedDeck.splice(0, 3)];
  } else {
    const potentialCards = deck.slice(0, 12);
    let cardsToAdd = trySingleDeal(cardsInPlay, potentialCards);
    if (cardsToAdd) {
      console.log(cardsToAdd);
      updatedCards = [...cardsInPlay, ...cardsToAdd];
      updatedDeck = deck.filter((card) => !cardsToAdd.includes(card));
      isGameOver = !checkForSets(updatedCards);
    } else {
      updatedCards = [...cardsInPlay, ...potentialCards];
      updatedDeck = [];
      isGameOver = !checkForSets(updatedCards);
    }
  }

  return [updatedCards, updatedDeck, isGameOver];
}



//--------- Game Logic ----------//

//Returns true if array of 3 cards submitted is a valid set
function checkSet(cards) {
  const a = cards[0];
  const b = cards[1];
  const c = cards[2];
  return (
    ((a.color === b.color && b.color === c.color) ||
      (a.color !== b.color && a.color !== c.color && b.color !== c.color)) &&
    ((a.count === b.count && b.count === c.count) ||
      (a.count !== b.count && a.count !== c.count && b.count !== c.count)) &&
    ((a.shape === b.shape && b.shape === c.shape) ||
      (a.shape !== b.shape && a.shape !== c.shape && b.shape !== c.shape)) &&
    ((a.fill === b.fill && b.fill === c.fill) ||
      (a.fill !== b.fill && a.fill !== c.fill && b.fill !== c.fill))
  );
}

exports.verifySet = (cards) => {
  checkSet(cards)
}

//Returns true if array of cards submitted contains at least one set
function checkForSets(cards) {
  const combos = combinations(cards, 3);
  return combos.some((combo) => checkSet(combo));
}

function findSet(cards) {
  if (cards.length > 21) {
    const newCards = cards.slice(0, 21);
    const combos = combinations(newCards, 3);
    return combos.find((combo) => checkSet(combo));
  } else {
    const combos = combinations(cards, 3);
    return combos.find((combo) => checkSet(combo));
  }
}

//Returns all combinations with r elements in array arr
function combinations(arr, r) {
  let index = [];
  let n = arr.length;

  for (let j = 0; j < r; j++) index[j] = j;
  index[r] = n;

  let ok = true;
  let result = [];

  while (ok) {
    let comb = [];
    for (let j = 0; j < r; j++) comb[j] = arr[index[j]];
    result.push(comb);

    ok = false;

    for (let j = r; j > 0; j--) {
      if (index[j - 1] < index[j] - 1) {
        index[j - 1]++;
        for (let k = j; k < r; k++) index[k] = index[k - 1] + 1;
        ok = true;
        break;
      }
    }
  }

  return result;
}
