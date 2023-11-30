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
    game.guessesNumber = guessesNumber;
    game.deckOfCards = deckOfCards;
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

Data.prototype.checkGameValues = function (gameId, playerName) {
  console.log("checking game values", gameId, playerName);
  if (typeof this.games[gameId] === "undefined") {
    return false;
  }
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
    game.dealerIndex = 0;
    game.guesserIndex = 1;
    game.errorsRemaining = game.guessesNumber;
    game.currentCardIndex = 0;
    game.players.forEach((player) => {
      delete player.isReady;
      delete player.isHost;
      player.isDealer = false;
      player.isGuesser = false;
    });
    game.players[game.dealerIndex].isDealer = true;
    game.players[game.guesserIndex].isGuesser = true;
  }
};

Data.prototype.guessCard = function (gameId, playerName, cardPoint) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    if (game.deckOfCards[game.currentCardIndex].points === cardPoint) {
      return true;
    } else {
      return false;
    }
    console.log("card guessed", gameId, playerName, card);
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
  }
};

Data.prototype.increasePoints = function (gameId, playerName, cardPoint) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    pointsIncrease =
      Math.abs(cardPoint - game.deckOfCards[game.currentCardIndex].points) *
      game.pointsMultiplier;
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].name === playerName) {
        game.players[i].points += pointsIncrease;
        console.log("points increased", gameId, playerName, pointsIncrease);
      }
    }
  }
};

Data.prototype.getLeaderboard = function (gameId) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    let leaderboard = [...game.players]; // coPilot code
    leaderboard.sort((a, b) => a.points - b.points);
    return leaderboard;
  }
};
export { Data };
