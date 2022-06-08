const lobbyManager = require("../services/LobbyManager");

module.exports = (io, socket) => {
  const handleDisconnect = () => {
    console.log(socket.id);
    const lobby = lobbyManager.findLobbyByUser(socket.id);
    if (!lobby) return;

    const user = lobby.users.find((user) => user.socketId === socket.id);
    if (user && user.isAdmin) {
      lobbyManager.removeLobby(lobby.id);
      io.to(lobby.id).emit("lobby:admin-left");
      io.in(lobby.id).socketsLeave(lobby.id);
    } else if (user) {
      const updatedLobby = lobbyManager.leaveLobby(user, lobby.id);
      io.to(lobby.id).emit("lobby:update", updatedLobby);
    }
  };
  socket.on("disconnect", handleDisconnect);
};
