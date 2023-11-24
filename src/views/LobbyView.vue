<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyHeader }} {{ gameId }}</h1>
    <br />
  </div>
  <section id="input_wrappers">
    <form id="playerListForm">
      <h2>{{ uiLabels.formTitle }}</h2>
      <li v-for="player in playerList">
        {{ player.name }}
        <span v-if="player.isHost">&#x1F451;</span>
      </li>
    </form>
  </section>

  <button id="playGameButton" v-on:click="console.log(playerList)">
    <label for="playGameButton"> {{ uiLabels.playGame }}</label>
  </button>
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
      this.playerList = game.players;
      this.gameSettings.pointsSetting = game.pointsSetting;
      this.gameSettings.guessesNumber = game.guessesNumber;
      console.log(this.playerList);
    });

    socket.on("gameJoined", (players) => {
      this.playerList = players;
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
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

#input_wrappers {
  display: flex;
  flex-direction: column;
  align-items: center;
}



#playerListForm {
  color: white;
  width: 10em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin-top: 0.5em;
  margin-bottom: 0.5em;

}

#playerListForm li {
  list-style-type: none;
  margin: 0.5em;
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
