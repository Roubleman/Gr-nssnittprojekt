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
    <button v-if="isDealer" v-on:click="startBus">
      <label> {{ uiLabels.startGame }}</label>
    </button>
    <button v-if="isHost" v-on:click="reStart">
      <label> {{ uiLabels.startGame }}</label>
    </button>
    <button v-else v-on:click="playAgain">
      <label> {{ uiLabels.startGame }}</label>
    </button>
  </section>
</template>

<script>
// @ is an alias to /src

import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "ResultView",
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playerName: sessionStorage.getItem("playerName"),
      player: {},
      gameId: "inactive game",
      uiLabels: {},
      playerList: [],
      leaderboard: [],
      isDealer: false,
      isHost: false,
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;
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
      this.$router.push("/lobby/" + this.gameId);
    },
    playAgain: function () {
      socket.emit("joinGame", {
        gameId: this.gameId,
        playerName: this.player.name,
        avatar: this.player.avatar,
      });
      this.$router.push("/lobby/" + this.gameId);
    },
    getLeaderboard: function () {
      let leaderboard = [...this.playerList]; // coPilot code
      leaderboard.sort((a, b) => a.points - b.points);
      return leaderboard;
    },
  },
};
</script>

<style>
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
