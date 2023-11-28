function sockets(io, socket, data) {
  socket.emit("init", data.getUILabels());

  socket.on("pageLoaded", function (lang) {
    socket.emit("init", data.getUILabels(lang));
  });

  socket.on("switchLanguage", function (lang) {
    socket.emit("init", data.getUILabels(lang));
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
    socket.join(d.gameId);
  });

  socket.on("lobbyJoined", function (gameId) {
    console.log("lobbyJoined recieved");
    io.to(gameId).emit("playerList", data.getPlayerList(gameId));
  });

  socket.on("playerIsReady", function (d) {
    data.playerIsReady(d.gameId, d.player);
    io.to(d.gameId).emit("playerList", data.getPlayerList(d.gameId));
  });

  socket.on("startGame", function (gameId) {
    io.to(gameId).emit("gameStarted");
  });

  socket.on("runQuestion", function (d) {
    io.to(d.gameId).emit(
      "newQuestion",
      data.getQuestion(d.gameId, d.questionNumber)
    );
    io.to(d.gameId).emit("dataUpdate", data.getAnswers(d.gameId));
  });

  socket.on("submitAnswer", function (d) {
    data.submitAnswer(d.gameId, d.answer);
    io.to(d.gameId).emit("dataUpdate", data.getAnswers(d.gameId));
  });

  socket.on("resetAll", () => {
    data = new Data();
    data.initializeData();
  });
}

export { sockets };
