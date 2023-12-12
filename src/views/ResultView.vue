<template>
  <div class="resultMenu">
    <h1>{{ uiLabels.gameResult }}: {{ gameId }}</h1>
  </div>
  <section id="input_wrappers">
    <section class="playerList">
      <li v-for="player in playerList">
        {{ player.name }}: {{ uiLabels.numberOfPoints }}
        {{ player.points }}
        <span v-if="player.isGuesser">&#x1f68c; &#128640; &#128640;</span>
      </li>
    </section>
    <button v-on:click="startBus">
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
      gameId: "inactive game",
      uiLabels: {},
      playerList: {},
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;
    socket.emit("getGameInfo", this.gameId);
    console.log("result playerlist");
    socket.emit("joinGame", this.gameId);
    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.gameSettings.pointsSetting = game.pointsSetting;
      this.player = this.playerList[this.playerList.length - 1];
      this.playerName = this.player.name;
      console.log(this.playerList);
    });

    socket.emit("lobbyJoined", this.gameId);

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
    startBus: function () {
      this.$router.push("/bus/");
      for (player in this.playerList) {
        if (player.isGuesser) {
          this.$router.push("/bus/" + this.gameId);
        }
      }
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
