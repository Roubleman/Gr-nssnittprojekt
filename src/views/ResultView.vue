<template>
  <div class="resultMenu">
    <h1>{{ uiLabels.gameResult }}: {{ gameId }}</h1>
  </div>
  <section id="input_wrappers">
    <section class="playerList">
      <li v-for="player in leaderboard">
        {{ player.name }}: {{ uiLabels.numberOfPoints }}
        {{ player.points }}
        <span v-if="player.isDealer">&#x1f68c; &#128640; &#128640;</span>
      </li>
    </section>
    <button v-if="isDealer" v-on:click="startBus" class="bus-button">
      <label> {{ uiLabels.takeTheBus }}</label>
    </button>
    <button v-if="isHost" v-on:click="reStart" class="restart-button">
      <label> {{ uiLabels.restartGame }}</label>
    </button>
    <button
      v-if="!isHost && newGameExists"
      v-on:click="playAgain"
      class="restart-button"
    >
      <label> {{ uiLabels.joinRestart }}</label>
    </button>
  </section>
</template>

<script>
// @ is an alias to /src

import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer"));
import DeckOfCards from "@/assets/DeckOfCards.json";

export default {
  name: "ResultView",
  data: function () {
    return {
      playingCards: DeckOfCards, // ta bort sen när vi inte behöver testa
      lang: localStorage.getItem("lang") || "en",
      playerName: sessionStorage.getItem("playerName"),
      player: {},
      gameId: "inactive game",
      uiLabels: {},
      playerList: [],
      leaderboard: [],
      isDealer: false,
      isHost: false,
      newGameExists: false,
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    if (
      // ta bort sen när vi inte behöver testa
      this.gameId === "test1" ||
      this.gameId === "test2" ||
      this.gameId === "test3"
    ) {
      this.playerName = "player" + this.gameId.slice(-1);
      if (this.gameId === "test1") {
        socket.emit("createTestResult", {
          deck: this.playingCards,
          gameId: "test",
        });
      }
      this.gameId = "test";
    }

    socket.emit("getGameInfo", this.gameId);
    socket.emit("joinSocket", this.gameId);
    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.playerList.forEach((player) => {
        if (player.name === this.playerName) {
          this.player = player;
          this.isDealer = player.isDealer;
          this.isHost = player.isHost;
        }
      });
      this.leaderboard = this.getLeaderboard();
    });
    socket.on("newGameStarted", () => {
      console.log("new game started");
      this.newGameExists = true;
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
    startBus: function () {
      this.$router.push("/bus/");
    },
    backToHomepage: function () {
      this.$router.push("/");
    },
    reStart: function () {
      socket.emit("restart", this.gameId);
      this.$router.push("/host/" + this.gameId);
    },
    playAgain: function () {
      socket.emit("joinGame", {
        gameId: this.gameId,
        playerName: this.player.name,
        avatar: this.player.avatar,
      });
      this.$router.push("/join/" + this.gameId);
    },
    getLeaderboard: function () {
      let leaderboard = [...this.playerList]; // coPilot code
      leaderboard.sort((a, b) => a.points - b.points);
      return leaderboard;
    },
  },
};
</script>

<style scoped>
body {
  background-color: rgb(233, 233, 223);
  font-size: 1.3em;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

#input_wrappers {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.restart-button {
  width: 30%;
  color: black;
  margin-bottom: 1%;
  background: rgb(73, 114, 73);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  z-index: 1;
}

.bus-button {
  color: rgb(246, 255, 0);
  background: rgb(255, 85, 0);
  width: 30%;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0.5em 1em;
}

.playerList {
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.playerList li {
  list-style-type: none;
  margin: 0.5em;
}
.lobbyMenu {
  margin: 25px;
}
</style>
