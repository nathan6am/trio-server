// Generate a unique Lobby code
const { newGame } = require("./GameManager");

const lobbies = [];
const generateLobbyId = (activeLobbies) => {
  let lobbyId;

  do {
    lobbyId = Math.floor(100000 + Math.random() * 900000).toString(10);
  } while (lobbies.includes((lobby) => (lobby.id = lobbyId)));

  return lobbyId;
};

exports.createLobby = (user, options) => {
  const newLobby = {
    id: generateLobbyId(),
    users: [{ ...user, isAdmin: true }],
    game: newGame(options.gameOptions, options.deckOptions),
  };
  lobbies.push(newLobby);
  return newLobby;
};

exports.joinLobby = (user, lobbyId) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  let updatedLobby = lobbies[lobbyIndex];

  //Verify user does not already belong to lobby

  if (
    updatedLobby.users.some(
      (existingUser) => user.socketId === existingUser.socketId
    )
  )
    throw new Error(`user with id ${user.socketId} is already in this lobby`);

  //TODO: Find and return all other lobbies user may belong to to force remove upon join

  //Add user and return new lobby object
  updatedLobby.users.push({ ...user, ready: false });
  lobbies[lobbyIndex] = updatedLobby;
  return lobbies[lobbyIndex];
};

exports.leaveLobby = (user, lobbyId) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  //Verify user belongs to lobby
  let updatedLobby = lobbies[lobbyIndex];
  if (
    !updatedLobby.users.some(
      (existingUser) => user.socketId === existingUser.socketId
    )
  )
    throw new Error(`user with id ${user.socketId} is not in this lobby`);

  //Remove user and return new lobby object
  const updatedUsers = updatedLobby.users.fiter(
    (existingUser) => user.socketId !== existingUser.socketId
  );
  updatedLobby.users = updatedUsers;
  lobbies[lobbyIndex] = updatedLobby;
  return lobbies[lobbyIndex];
};

exports.setUserReady = (lobbyId, user, readyState) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  //Verify user belongs to lobby
  let updatedLobby = lobbies[lobbyIndex];

  const userIndex = updatedLobby.users.findIndex(
    (entry) => entry.socketId === user.socketId
  );
  if (userIndex === -1)
    throw new Error(`user with id ${user.socketId} is not in this lobby`);

  updatedLobby.users[userIndex] = {
    ...updatedLobby.users[userIndex],
    ready: readyState,
  };
  return updatedLobby;
};
exports.getLobbyGameState = (lobbyId) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  return lobbies[lobbyIndex].game;
};

exports.setLobbyGameState = (lobbyId, game) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  lobbies[lobbyIndex].game = game;
  return game;
};

exports.startCurrentGame = (lobbyId) => {
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);

  //Verify if lobby exists
  if (lobbyIndex === -1)
    throw new Error(`lobby with id ${lobbyId} does not exist`);

  let updatedLobby = lobbies[lobbyIndex];
  updatedLobby["gameActive"] = true;
  return updatedLobby;
};
