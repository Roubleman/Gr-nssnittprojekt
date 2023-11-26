"use strict";
const languages = ["en", "se"];
import { readFileSync } from "fs";

// Store data in an object to keep the global namespace clean
function Data() {
  this.polls = {};
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
  hostName = "host"
) {
  if (typeof this.games[gameId] === "undefined") {
    let game = {};
    let player = {};
    game.lang = lang;
    game.pointsSetting = pointsSetting;
    game.guessesNumber = guessesNumber;
    player.name = hostName;
    player.isHost = true;
    player.points = 0;
    player.isReady = true;
    game.players = [];
    game.players.push(player);
    this.games[gameId] = game;
    console.log("game created", gameId, game);
  }
  return this.games[gameId];
};

Data.prototype.joinGame = function (gameId, playerName) {
  const game = this.games[gameId];
  if (typeof game !== "undefined") {
    let player = {};
    player.name = playerName;
    player.isHost = false;
    player.points = 0;
    player.isReady = false;
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

Data.prototype.playerIsReady = function (gameId, player) {
  const game = this.games[gameId];
  const playerName = player.name;
  if (typeof game !== "undefined") {
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].name === playerName) {
        game.players[i].isReady = true;
        console.log("player is ready", gameId, playerName);
      }
    }
  }
};

Data.prototype.createPoll = function (gameId, lang = "en") {
  if (typeof this.polls[gameId] === "undefined") {
    let poll = {};
    poll.lang = lang;
    poll.questions = [];
    poll.answers = [];
    poll.currentQuestion = 0;
    this.polls[gameId] = poll;
    console.log("poll created", gameId, poll);
  }
  return this.polls[gameId];
};

Data.prototype.addQuestion = function (gameId, q) {
  const poll = this.polls[gameId];
  console.log("question added to", gameId, q);
  if (typeof poll !== "undefined") {
    poll.questions.push(q);
  }
};

Data.prototype.editQuestion = function (gameId, index, newQuestion) {
  const poll = this.polls[gameId];
  if (typeof poll !== "undefined") {
    poll.questions[index] = newQuestion;
  }
};

Data.prototype.getQuestion = function (gameId, qId = null) {
  const poll = this.polls[gameId];
  console.log("question requested for ", gameId, qId);
  if (typeof poll !== "undefined") {
    if (qId !== null) {
      poll.currentQuestion = qId;
    }
    return poll.questions[poll.currentQuestion];
  }
  return [];
};

Data.prototype.submitAnswer = function (gameId, answer) {
  const poll = this.polls[gameId];
  console.log("answer submitted for ", gameId, answer);
  if (typeof poll !== "undefined") {
    let answers = poll.answers[poll.currentQuestion];
    if (typeof answers !== "object") {
      answers = {};
      answers[answer] = 1;
      poll.answers.push(answers);
    } else if (typeof answers[answer] === "undefined") answers[answer] = 1;
    else answers[answer] += 1;
    console.log("answers looks like ", answers, typeof answers);
  }
};

Data.prototype.getAnswers = function (gameId) {
  const poll = this.polls[gameId];
  if (typeof poll !== "undefined") {
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== "undefined") {
      return { q: poll.questions[poll.currentQuestion].q, a: answers };
    }
  }
  return {};
};
export { Data };
