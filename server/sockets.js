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

  socket.on("checkGameId", function (gameId) {
    socket.emit("gameIdChecked", data.checkGameId(gameId));
  });

  socket.on("createTestGame", function (playingCards) {
    //ta bort sen när vi inte behöver testa
    data.createTestGame(playingCards);
  });

  socket.on("createGame", function (d) {
    data.createGame(
      d.gameId,
      d.lang,
      d.pointsSetting,
      d.guessesNumber,
      d.hostName,
      d.deckOfCards,
      d.hostAvatar
    );
  });

  socket.on("getGameInfo", function (gameId) {
    socket.emit("gameInfo", data.getGame(gameId));
  });

  socket.on("updatePlayerListOrder", function (d) {
    data.updatePlayerList(d.playerList, d.gameId);
    io.to(d.gameId).emit("playerList", data.getPlayerList(d.gameId));
  });

  socket.on("joinGame", function (d) {
    data.joinGame(d.gameId, d.playerName, d.avatar);
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
    data.initializeGame(gameId);
  });

  socket.on("fuckTheDealer", function (d) {
    data.fuckTheDealer(d.gameId, d.secondGuess);
    io.to(d.gameId).emit("gameInfo", data.getGame(d.gameId));
  });

  socket.on("roundOver", function (gameId) {
    let gameStillGoing = data.nextRound(gameId);
    if (gameStillGoing) {
      io.to(gameId).emit("gameUpdate", data.getGame(gameId));
    } else {
      io.to(gameId).emit("gameEnded");
    }
  });

  socket.on("cardGuessed", function (d) {
    io.to(d.gameId).emit("wrongGuess", {
      card: d.card,
      secondGuess: d.secondGuess,
    });
    if (d.secondGuess) {
      //increase Points
    }
  });

  socket.on("correctGuess", function (d) {
    io.to(d.gameId).emit("correctGuess");
    data.fuckTheDealer(d.gameId, d.secondGuess);
    data.nextRound(d.gameId);
    io.to(d.gameId).emit("gameUpdate", data.getGame(d.gameId));
  });

  socket.on("dealerCheck", (gameId) => {
    io.to(gameId).emit("dealerHasChecked");
  });

  socket.on("resetAll", () => {
    data = new Data();
    data.initializeData();
  });
}

export { sockets };
