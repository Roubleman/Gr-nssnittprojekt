<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyheader }} {{ gameId }}</h1>
    <br />

    <button id="playGameButton" v-on:click="console.log(playerList)">
      <label for="playGameButton"> {{ uiLabels.playGame }}</label>
    </button>

    <form>
      <li v-for="player in playerList">
        {{ player.name }}
      </li>
    </form>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  components: {
    QuestionComponent,
  },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      data: {},
      uiLabels: {},
      gameId: "inactive game",
      playerList: [],
      gameSettings: {},
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      console.log("Info recieved");
      this.playerList = game.players;
      this.gameSettings.pointsSetting = game.pointsSetting;
      this.gameSettings.guessesNumber = game.guessesNumber;
      console.log(this.playerList);
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {},
};
</script>
<style>
body {
  background-color: rgb(233, 233, 223);
  font-size: 1.3em;
}

.lobbyMenu {
  margin: 25px;
}

#playGameButton {
  width: 10%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: 1.5em;
}

#playGameButton:hover {
  background-color: rgb(62, 172, 28);
  cursor: pointer;
}
</style>
