function sockets(io, socket, data) {
  socket.emit("init", data.getUILabels());

  socket.on("pageLoaded", function (lang) {
    socket.emit("init", data.getUILabels(lang));
  });

  socket.on("switchLanguage", function (lang) {
    socket.emit("init", data.getUILabels(lang));
  });

  socket.on("checkName", function (d) {
    if (!data.checkGameId(d.gameId)) {
      socket.emit("nameChecked", data.checkPlayerName(d.gameId, d.playerName));
    }
  });

  socket.on("checkGameId", function (gameId) {
    socket.emit("gameIdChecked", data.checkGameId(gameId));
  });

  socket.on("isGameStarted", function (gameId) {
    socket.emit("gameStarted", data.isGameStarted(gameId));
  });

  socket.on("createTestGame", function (playingCards) {
    //ta bort sen när vi inte behöver testa
    data.createTestGame(playingCards);
  });

  socket.on("createTestResult", function (d) {
    data.createTestGame(d.deck);
    data.createTestResult(d.gameId);
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
    io.to(gameId).emit("playerList", data.getPlayerList(gameId));
  });

  socket.on("playerIsReady", function (d) {
    data.playerIsReady(d.gameId, d.playerName);
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

  socket.on("leaveGame", function (d) {
    data.playerLeavingInGame(d.gameId, d.playerName);
    io.to(d.gameId).emit("playerLeft", {
      game: data.getGame(d.gameId),
      playerName: d.playerName,
    });
  });

  socket.on("cardGuessed", function (d) {
    io.to(d.gameId).emit("wrongGuess", {
      card: d.card,
      secondGuess: d.secondGuess,
    });
    if (d.secondGuess) {
      io.to(d.gameId).emit(
        "guesserPointsIncreased",
        data.increasePoints(d.gameId, d.playerName, d.card.points)
      );
      let gameStillGoing = data.nextRound(d.gameId);
      if (gameStillGoing) {
        io.to(d.gameId).emit("gameUpdate", data.getGame(d.gameId));
      } else {
        io.to(d.gameId).emit("gameEnded");
      }
    }
  });

  socket.on("correctGuess", function (d) {
    io.to(d.gameId).emit(
      "correctGuess",
      data.fuckTheDealer(d.gameId, d.secondGuess)
    );
    let gameStillGoing = data.nextRound(d.gameId); // delay?
    if (gameStillGoing) {
      io.to(d.gameId).emit("gameUpdate", data.getGame(d.gameId));
    } else {
      io.to(d.gameId).emit("gameEnded");
    }
  });

  socket.on("dealerCheck", (gameId) => {
    io.to(gameId).emit("dealerHasChecked");
  });

  socket.on("restart", (gameId) => {
    io.to(gameId).emit("newGameStarted");
    data.recreateLobby(gameId);
  });

  socket.on("resetAll", () => {
    data = new Data();
    data.initializeData();
  });
}

export { sockets };
