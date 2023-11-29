function sockets(io, socket, data) {
  socket.emit("init", data.getUILabels());

  socket.on("pageLoaded", function (lang) {
    socket.emit("init", data.getUILabels(lang));
  });

  socket.on("switchLanguage", function (lang) {
    socket.emit("init", data.getUILabels(lang));
  });

  socket.on("checkGameValues", function (d) {
    socket.emit(
      "gameValuesChecked",
      data.checkGameValues(d.gameId, d.playerName)
    );
  });

  socket.on("createGame", function (d) {
    data.createGame(
      d.gameId,
      d.lang,
      d.pointsSetting,
      d.guessesNumber,
      d.hostName
    );
    socket.join(d.gameId);
  });

  socket.on("getGameInfo", function (gameId) {
    socket.emit("gameInfo", data.getGame(gameId));
  });

  socket.on("updatePlayerListOrder", function (d) {
    data.updatePlayerList(d.playerList, d.gameId);
    io.to(d.gameId).emit("playerList", data.getPlayerList(d.gameId));
  });

  socket.on("joinGame", function (d) {
    data.joinGame(d.gameId, d.playerName);
  });

  socket.on("joinSocket", function (gameId) {
    socket.join(gameId);
  });

  socket.on("lobbyJoined", function (gameId) {
    socket.join(gameId);
    console.log("lobbyJoined recieved");
    io.to(gameId).emit("playerList", data.getPlayerList(gameId));
  });

  socket.on("playerIsReady", function (d) {
    data.playerIsReady(d.gameId, d.playerName);
    io.to(d.gameId).emit("playerList", data.getPlayerList(d.gameId));
  });

  socket.on("playerLeft", function (d) {
    data.removePlayer(d.gameId, d.playerName);
    io.to(d.gameId).emit("playerList", data.getPlayerList(d.gameId));
  });

  socket.on("hostLeft", function (gameId) {
    data.removeGame(gameId);
    io.to(gameId).emit("gameEnded");
  });

  socket.on("startGame", function (gameId) {
    io.to(gameId).emit("gameStarted");
  });

  socket.on("gameStarted", function (gameId) {
    //data.setupGameStart(gameId);
  });

  socket.on("resetAll", () => {
    data = new Data();
    data.initializeData();
  });
}

export { sockets };
