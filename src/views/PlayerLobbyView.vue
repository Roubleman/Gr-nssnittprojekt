<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyHeader }} {{ gameId }}</h1>
    <br />
  </div>

  <section id="input_wrappers">
    <h2>{{ uiLabels.formTitle }}</h2>
    <section class="player-list">
      <li v-for="(player, index) in playerList" :key="index">
        {{ index + 1 + ". " }}{{ player.name }}
        <img :src="player.avatar" class="avatar" />
        <span v-if="player.isReady && !player.isHost">&check;</span>
      </li>
    </section>
  </section>

  <button v-if="!player.isReady" id="ready_button" v-on:click="playerIsReady">
    {{ uiLabels.ready }}
  </button>
</template>

<script>
// @ is an alias to /src

import { VueDraggableNext } from "vue-draggable-next";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  components: {
    draggable: VueDraggableNext,
  },
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      data: {},
      uiLabels: {},
      gameId: "inactive game",
      playerList: [],
      playerName: "",
      player: {},
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      console.log(sessionStorage.getItem("playerName"));
      this.playerList = game.players;
      this.player = this.playerList[this.playerList.length - 1];
      this.playerName = this.player.name;
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

    socket.on("gameEnded", () => {
      this.gameClosed();
    });

    socket.on("gameStarted", () => {
      this.$router.push("/game/" + this.gameId);
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });

    window.addEventListener("beforeunload", () => {
      this.playerLeaving();
    });
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.playerLeaving());
  },
  methods: {
    gameClosed: function () {
      alert(this.uiLabels.gameClosed);
      this.$router.push("/");
    },
    playerIsReady: function () {
      socket.emit("playerIsReady", {
        gameId: this.gameId,
        playerName: this.playerName,
      });
    },

    playerLeaving: function () {
      socket.emit("playerLeft", {
        gameId: this.gameId,
        playerName: this.playerName,
      });
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

.player-list {
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.player-list li {
  list-style-type: none;
  margin: 0.5em;
}

.lobbyMenu {
  margin: 25px;
}

#ready_button {
  width: 10%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: 1.5em;
}

#ready_button:hover {
  background-color: rgb(62, 172, 28);
  cursor: pointer;
}

.avatar {
  width: 1.5em;
  height: auto;
}
</style>
