"use strict";
const languages = ["en", "se"];
import { readFileSync } from "fs";

// Store data in an object to keep the global namespace clean
function Data() {
  this.games = {};
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.getUILabels = function (lang = "en") {
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
};

Data.prototype.createGame = function (
  gameId,
  lang = "en",
  pointsSetting = "normal",
  guessesNumber = 3,
  hostName = "host",
  deckOfCards,
  hostAvatar
) {
  if (typeof this.games[gameId] === "undefined") {
    let game = {};
    let player = {};
    game.lang = lang;
    if (pointsSetting === "normal") {
      game.pointsMultiplier = 1;
    } else if (pointsSetting === "easy") {
      game.pointsMultiplier = 0.5;
    } else if (pointsSetting === "hard") {
      game.pointsMultiplier = 2;
    }
    game.pointsSetting = pointsSetting;
    game.guessesNumber = guessesNumber;
    game.deckOfCards = deckOfCards;
    game.gameStarted = false;
    player.name = hostName;
    player.isHost = true;
    player.points = 0;
    player.isReady = true;
    player.avatar = hostAvatar;
    game.players = [];
    game.players.push(player);
    this.games[gameId] = game;
    console.log("game created", gameId, game);
  }
  return this.games[gameId];
};

Data.prototype.checkPlayerName = function (gameId, playerName) {
  for (let i = 0; i < this.games[gameId].players.length; i++) {
    if (this.games[gameId].players[i].name === playerName) {
      return false;
    }
  }
  return true;
};

Data.prototype.checkGameId = function (gameId) {
  console.log("checking game id", gameId);
  if (typeof this.games[gameId] === "undefined") {
    return true;
  }
  return false;
};

Data.prototype.isGameStarted = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    return game.gameStarted;
  }
};

Data.prototype.joinGame = function (gameId, playerName, avatar) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    let player = {};
    player.name = playerName;
    player.isHost = false;
    player.points = 0;
    player.isReady = false;
    player.avatar = avatar;
    game.players.push(player);
    console.log("player joined", gameId, player);
  }
};

Data.prototype.getGame = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    return game;
  }
};

Data.prototype.getPlayerList = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    console.log("PlayerList updated");
    return game.players;
  }
};

Data.prototype.updatePlayerList = function (playerList, gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.players = playerList;
  }
  console.log("playerList updated", gameId, playerList);
};

Data.prototype.playerIsReady = function (gameId, playerName) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].name === playerName) {
        game.players[i].isReady = true;
        console.log("player is ready", gameId, playerName);
      }
    }
  }
};

Data.prototype.removePlayer = function (gameId, playerName) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].name === playerName) {
        game.players.splice(i, 1);
        console.log("player removed", gameId, playerName);
      }
    }
  }
};

Data.prototype.removeGame = function (gameId) {
  delete this.games[gameId];
  console.log("game removed", gameId);
};

Data.prototype.initializeGame = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.gameStarted = true;
    game.dealerIndex = 0;
    game.guesserIndex = 1;
    game.errorsRemaining = game.guessesNumber;
    game.currentCardIndex = 0;
    game.players.forEach((player) => {
      delete player.isReady;
      player.isDealer = false;
      player.isGuesser = false;
    });
    game.players[game.dealerIndex].isDealer = true;
    game.players[game.guesserIndex].isGuesser = true;
    this.shuffleDeck(gameId);
    console.log("game initialized", gameId);
  }
};

Data.prototype.nextRound = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    if (game.currentCardIndex < game.deckOfCards.length - 1) {
      this.nextCard(gameId);
    } else {
      return false;
    }
    if (game.errorsRemaining == 0) {
      this.swapDealer(gameId);
    }
    this.swapGuesser(gameId);
    console.log("next round", gameId);
    return true;
  }
};

Data.prototype.nextCard = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.currentCardIndex++;
  }
};

Data.prototype.swapDealer = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.players[game.dealerIndex].isDealer = false;
    game.dealerIndex++;
    if (game.dealerIndex >= game.players.length) {
      game.dealerIndex = 0;
    }
    game.players[game.dealerIndex].isDealer = true;
    game.errorsRemaining = game.guessesNumber;
    console.log("dealer swapped", gameId);
  }
};

Data.prototype.shuffleDeck = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    for (let i = game.deckOfCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [game.deckOfCards[i], game.deckOfCards[j]] = [
        game.deckOfCards[j],
        game.deckOfCards[i],
      ];
    }
    console.log("deck shuffled", gameId);
  }
};

Data.prototype.swapGuesser = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.players[game.guesserIndex].isGuesser = false;
    game.guesserIndex++;
    if (game.guesserIndex >= game.players.length) {
      game.guesserIndex = 0;
    }
    if (game.players[game.guesserIndex].isDealer) {
      game.guesserIndex++;
    }
    if (game.guesserIndex >= game.players.length) {
      game.guesserIndex = 0;
    }
    game.players[game.guesserIndex].isGuesser = true;
    console.log("guesser swapped", gameId);
  }
};

Data.prototype.increasePoints = function (gameId, playerName, cardPoint) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    let pointsIncrease = Math.ceil(
      Math.abs(cardPoint - game.deckOfCards[game.currentCardIndex].points) *
        game.pointsMultiplier
    );
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].name === playerName) {
        game.players[i].points += pointsIncrease;
        console.log("points increased", gameId, playerName, pointsIncrease);
      }
    }
    game.errorsRemaining--;
    console.log("player points increased");
    return pointsIncrease;
  }
};

Data.prototype.fuckTheDealer = function (gameId, secondGuess) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    let pointsIncrease = Math.ceil(
      (secondGuess ? 3 : 5) * game.pointsMultiplier
    );
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].isDealer) {
        game.players[i].points += pointsIncrease;
      }
    }
    game.errorsRemaining = game.guessesNumber;
    console.log("Dealer points increased");
    return pointsIncrease;
  }
};

Data.prototype.createTestGame = function (playingCards) {
  //ta bort sen när vi inte behöver testa
  if (typeof this.games["test"] === "undefined") {
    this.createGame(
      "test",
      "en",
      "normal",
      3,
      "player1",
      playingCards,
      "/img/crownAvatar.png"
    );
    this.joinGame("test", "player2", "/img/Avatars/alienAvatar.png");
    this.joinGame("test", "player3", "/img/Avatars/alienAvatar.png");
    this.initializeGame("test");
  } else {
    this.removeGame("test");
    this.createTestGame(playingCards);
  }
  console.log("test game created");
};

Data.prototype.createTestResult = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    game.players[0].points = 20;
    game.players[1].points = 10;
    game.players[2].points = 5;
    console.log("test result created", gameId);
  }
};

Data.prototype.recreateLobby = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    this.removeGame(gameId);
    game.players.forEach((player) => {
      if (player.isHost) {
        this.createGame(
          gameId,
          game.lang,
          game.pointsSetting,
          game.guessesNumber,
          player.name,
          game.deckOfCards,
          player.avatar
        );
      }
    });
    console.log("lobby recreated", gameId);
  }
};

export { Data };
