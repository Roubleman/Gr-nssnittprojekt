<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyheader }} {{ gameId }}</h1>
    <br />

    <button id="playGameButton" v-on:click="console.log(playerList)">
      <label for="playGameButton"> {{ uiLabels.playGame }}</label>
    </button>

    <form>
      <li v-for="player in playerList">
        {{ player }}
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
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;
    console.log("LobbyView created triggered");
    socket.on("gameCreated", (game) => {
      s;
      console.log("Info recieved");
      if (this.gameId == game.gameId) {
        this.playerList = game.players;
      }
    });
    socket.on("gameJoined", (players) => {
      this.playerList = players;
    });
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
    socket.on("dataUpdate", (data) => (this.data = data));
    socket.on("dataUpdate", (answers) => (this.submittedAnswers = answers));
  },
  methods: {
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", { gameId: this.gameId, answer: answer });
    },
  },
};
</script>
<style>
body {
  background-color: beige;
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
</style>
