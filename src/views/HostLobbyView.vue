<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyHeader }} {{ gameId }}</h1>
    <br />
  </div>

  <section id="input_wrappers">
    <h2>{{ uiLabels.formTitle }}</h2>
    <button id="scramble_button" v-on:click="scramblePlayerOrder">
      {{ uiLabels.scramblePlayerOrder }}
    </button>
    <draggable
      v-model="playerList"
      class="player-list"
      @end="updatePlayerListOrder"
    >
      <li v-for="(player, index) in playerList" :key="index">
        {{ index + 1 + ". " }}{{ player.name }}
        <!-- <span v-if="player.isHost">&#x1F451;</span> -->
        <img :src="player.avatar" class="avatar" />
        <span v-if="player.isReady && !player.isHost">&check;</span>
        <span id="hamburger_icon">&#9776;</span>
        <hr v-if="index !== playerList.length - 1" />
      </li>
    </draggable>
  </section>

  <button
    id="play_game_button"
    v-on:click="playGame"
    v-bind:disabled="!allPlayersReady()"
  >
    {{ uiLabels.playGame }}
  </button>
</template>

<script>
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
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("getGameInfo", this.gameId);

    socket.emit("joinSocket", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
    });

    socket.on("playerList", (players) => {
      this.playerList = players;
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
    window.addEventListener("beforeunload", () => {
      this.hostLeaving();
    });
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.hostLeaving());
  },
  methods: {
    hostLeaving: function () {
      socket.emit("hostLeft", this.gameId);
    },
    updatePlayerListOrder: function () {
      socket.emit("updatePlayerListOrder", {
        playerList: this.playerList,
        gameId: this.gameId,
      });
    },
    playGame: function () {
      socket.emit("startGame", this.gameId);
      this.$router.push("/game/" + this.gameId);
    },
    scramblePlayerOrder: function () {
      for (let i = this.playerList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.playerList[i], this.playerList[j]] = [
          this.playerList[j],
          this.playerList[i],
        ];
      }
      this.updatePlayerListOrder();
    },
    allPlayersReady: function () {
      if (this.playerList.length < 2) {
        return false;
      }
      for (let player of this.playerList) {
        if (!player.isHost) {
          if (!player.isReady) {
            return false;
          }
        }
      }
      return true;
    },
  },
};
</script>
<style>
#hamburger_icon {
  cursor: pointer;
  margin-left: 1em;
}

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

#scramble_button {
  width: 20%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: 1.5em;
}

#play_game_button {
  width: 10%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: 1.5em;
}

#play_game_button:hover,
#scramble_button:hover {
  background-color: rgb(62, 172, 28);
  cursor: pointer;
}

.avatar {
  width: 1.5em;
  height: auto;
}
</style>
