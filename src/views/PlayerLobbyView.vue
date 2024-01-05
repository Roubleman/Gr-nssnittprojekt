<template>
  <div class="lobbyMenu">
    <h1 class="highlight">
      {{ uiLabels.lobbyHeader }} <br />
      {{ gameId }}
    </h1>
    <button class="hover-link rules-button" @click.prevent="openRules">
      {{ uiLabels.rules }}
    </button>
  </div>
  <h2>{{ uiLabels.currentGameSettings }}</h2>
  <section class="gameSettings">
    <p>
      {{ uiLabels.pointsSetting }}: <br />
      {{ this.difficulty }}
    </p>
    <p>{{ uiLabels.inputGuesses }}: <br />{{ this.gameInfo.guessesNumber }}</p>
  </section>

  <section id="input_wrappers">
    <section class="player-list box">
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
    {{ !isSoundMuted ? "&#x1F50A;" : "&#x1F507;" }}
  </div>
  <button v-if="!player.isReady" id="ready_button" v-on:click="playerIsReady">
    {{ uiLabels.ready }}
  </button>
  <div class="overlay" id="rules_popup">
    <div class="popup">
      <span class="close_popup" @click="closeRules">&times;</span>
      <h1>{{ uiLabels.rules }}</h1>
      <p v-for="text in uiLabels.rulesText">{{ text }}</p>
    </div>
  </div>
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
      difficulty: "",
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.player = this.playerList[this.playerList.length - 1];
      this.playerName = this.player.name;
      this.gameInfo.pointsSetting = game.pointsSetting;
      this.gameInfo.guessesNumber = game.guessesNumber;
      switch (this.gameInfo.pointsSetting) {
        case "easy":
          this.difficulty = this.uiLabels.easyOption;
          break;
        case "normal":
          this.difficulty = this.uiLabels.normalOption;
          break;
        case "hard":
          this.difficulty = this.uiLabels.hardcoreOption;
          break;
      }
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

    this.playerLeaving = this.playerLeaving.bind(this);

    window.addEventListener("beforeunload", this.playerLeaving);
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundImage = "url(/img/rainbow-vortex.svg)";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundSize = "cover";
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.playerLeaving);
    document.body.style.backgroundImage = null;
    document.body.style.backgroundSize = null;
    document.body.style.backgroundAttachment = null;
    document.body.style.backgroundPosition = null;
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener("beforeunload", this.playerLeaving);
    next();
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
    openRules: function () {
      this.hideNav = true;
      const rulesPopup = document.getElementById("rules_popup");
      rulesPopup.style.display = "flex";
      this.removeButton = true;

      rulesPopup.addEventListener("click", this.closeRulesOutside);
    },
    closeRules: function () {
      const rulesPopup = document.getElementById("rules_popup");
      rulesPopup.style.display = "none";

      rulesPopup.removeEventListener("click", this.closeRulesOutside);
      this.removeButton = false;
    },
    closeRulesOutside: function (event) {
      const rulesPopup = document.getElementById("rules_popup");
      if (event.target === rulesPopup) {
        this.closeRules(); // Call your existing closeRules function
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
  color: rgb(255, 255, 255);
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  border: solid 1px rgba(255, 255, 255, 0.634);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: auto;
  width: 40%;
  margin-bottom: 1em;
}

/* h1,
h2 {
  color: white;
  text-shadow: 0 0 10px #000000, 0 0 20px #000000, 0 0 30px #000000,
    0 0 40px #000000;
} */
.popup {
  position: relative;
  z-index: 1000;
  background: #fff;
  padding: 1em;
  border-radius: 0.5em;
  box-shadow: 0 0 0.7em rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 60%;
}

.close_popup {
  cursor: pointer;
  position: absolute;
  top: 2%;
  right: 3.5%;
}
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
}

.rules-button {
  height: 2em;
  width: 7em;
}

.player-list {
  width: 15em;
  border-width: 0.25em;
  border-color: #000000b6;
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
    min-width: 155px;
    margin-top: 1em;
  }
  .gameSettings {
    width: 80%;
    gap: 2em;
  }
  .popup {
    max-height: 90%;
    font-size: 15px;
    max-width: 85%;
    overflow: auto;
  }
}
</style>
