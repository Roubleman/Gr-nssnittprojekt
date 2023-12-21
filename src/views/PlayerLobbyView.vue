<template>
  <div class="lobbyMenu">
    <h1>{{ uiLabels.lobbyHeader }} {{ gameId }}</h1>
    <br />
  </div>

  <section class="gameSettings">
    <p>{{ uiLabels.pointsSetting }}: {{ this.gameInfo.pointsSetting }}</p>
    <p>{{ uiLabels.inputGuesses }}: {{ this.gameInfo.guessesNumber }}</p>
  </section>

  <section id="input_wrappers">
    <h2>{{ uiLabels.formTitle }}</h2>
    <section class="player-list">
      <li v-for="(player, index) in playerList" :key="index">
        {{ index + 1 + ". " }}{{ player.name }}
        <img :src="player.avatar" class="avatar" />
        <span v-if="player.isReady && !player.isHost">&check;</span>
        <hr v-if="index !== playerList.length - 1" />
      </li>
    </section>
  </section>
  <div>
    <audio id="backgroundAudio" autoplay loop :volume="0.5">
      <source src="/mp3/elevatorMusic.mp3" type="audio/mp3" />
      Your browser does not support the audio tag.
    </audio>
  </div>
  <div id="muteButton" @click="toggleSoundMute">
    {{ isSoundMuted ? "&#x1F50A;" : "&#x1F507;" }}
  </div>
  <button> </button>
  <button v-if="!player.isReady" id="ready_button" v-on:click="playerIsReady">
    {{ uiLabels.ready }}
  </button>
</template>

<script>
import { VueDraggableNext } from "vue-draggable-next";
import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer"));

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
      gameInfo: {},
      isSoundMuted: false,
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.player = this.playerList[this.playerList.length - 1];
      this.playerName = this.player.name;
      this.gameInfo.pointsSetting = game.pointsSetting;
      this.gameInfo.guessesNumber = game.guessesNumber;
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
    window.removeEventListener("beforeunload", this.playerLeaving);
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
    toggleSoundMute: function () {
      const audioElement = document.getElementById("backgroundAudio");

      if (audioElement) {
        this.isSoundMuted = !this.isSoundMuted;
        audioElement.muted = this.isSoundMuted;
      }
    },
  },
};
</script>
<style scoped>
#input_wrappers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gameSettings {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: auto;
  width: 40%;
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
#muteButton {
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  border-radius: 5px;
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

@media screen and (max-width: 60em) {
  #ready_button {
    width: 13%;
    min-width: 130px;
    margin-top: 1em;
  }
  .gameSettings {
    width: 80%;
    gap: 2em;
  }
}
</style>
