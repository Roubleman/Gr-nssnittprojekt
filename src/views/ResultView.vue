<template>
  <div>
    <h1>{{ uiLabels.gameResult }}: {{ gameId }}</h1>
  </div>
  <section>
    <li v-for="player in playerList">{{ player.name }} {{ player.points }}</li>
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

    socket.emit("joinGame", this.gameId);
    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.gameSettings.pointsSetting = game.pointsSetting;
      this.player = this.playerList[this.playerList.length - 1];
      this.playerName = this.player.name;
      console.log(this.playerList);
    });

    socket.emit("lobbyJoined", this.gameId);

    socket.on("playerList", (players) => {
      this.playerList = players;
      for (let i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name === this.playerName) {
          this.player = this.playerList[i];
        }
      }
    });
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
    sortByPoints: function () {},
  },
};
</script>
