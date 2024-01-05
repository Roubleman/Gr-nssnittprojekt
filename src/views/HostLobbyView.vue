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
  <section id="settings_wrapper">
    <h2>{{ uiLabels.currentGameSettings }}</h2>
    <section class="gameSettings">
      <p>
        {{ uiLabels.pointsSetting }}: <br />
        {{ this.difficulty }}
      </p>
      <p>
        {{ uiLabels.inputGuesses }}: <br />{{ this.gameInfo.guessesNumber }}
      </p>
    </section>
  </section>

  <section id="input_wrappers">
    <!-- <h2>{{ uiLabels.formTitle }}</h2> -->
    <button id="scramble_button" v-on:click="scramblePlayerOrder">
      {{ uiLabels.scramblePlayerOrder }}
    </button>
    <draggable
      v-model="playerList"
      class="player-list box"
      @end="updatePlayerListOrder"
    >
      <li v-for="(player, index) in playerList" :key="index">
        <span class="info" v-if="index == 0">{{ uiLabels.dealer }}:</span>
        <span class="info" v-if="index == 1">{{ uiLabels.guesser }}:</span>
        {{ index + 1 + ". " }}{{ player.name }}
        <img :src="player.avatar" class="avatar" />
        <span v-if="player.isReady && !player.isHost">&check;</span>
        <span id="hamburger_icon">&#9776;</span>
        <hr v-if="index !== playerList.length - 1" />
      </li>
    </draggable>
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
  <div>
    <p id="waiting_for_ready" v-if="!allPlayersReady()">
      {{ uiLabels.waitingForReady }}
    </p>
    <button
      id="play_game_button"
      v-on:click="playGame"
      v-if="allPlayersReady()"
    >
      {{ uiLabels.playGame }}
    </button>
  </div>
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

    socket.emit("joinSocket", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
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

    socket.on("playerList", (players) => {
      this.playerList = players;
    });

    this.hostLeaving = this.hostLeaving.bind(this);
    window.addEventListener("beforeunload", this.hostLeaving);
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundImage = "url(/img/rainbow-vortex.svg)";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundSize = "cover";
  },
  beforeDestroy() {
    document.body.style.backgroundImage = null;
    document.body.style.backgroundSize = null;
    document.body.style.backgroundAttachment = null;
    document.body.style.backgroundPosition = null;
    window.removeEventListener("beforeunload", this.hostLeaving);
  },
  beforeRouteLeave(to, from, next) {
    window.removeEventListener("beforeunload", this.hostLeaving);
    next();
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
#hamburger_icon {
  margin-left: 1em;
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

.info {
  font-size: 0.7em;
}

#settings_wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#input_wrappers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-list {
  width: 15em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border-color: #000000b6;
  border-width: 0.25em;
}

.player-list li {
  list-style-type: none;
  margin: 0.5em;
  cursor: grabbing;
}

#waiting_for_ready {
  color: white;
  font-size: 1.2em;
  text-align: center;
}

/* h1,
h2 {
  color: white;
  text-shadow: 0 0 10px #000000, 0 0 20px #000000, 0 0 30px #000000,
    0 0 40px #000000;
} */

#scramble_button {
  width: 15%;
  height: 50%;
  font-size: 1.3em;
}

#play_game_button {
  width: 17%;
  height: 50%;
  font-size: 1.5em;
}

#play_game_button:hover,
#scramble_button:hover {
  background-color: rgb(62, 172, 28);
  transform: scale(1.1);
  cursor: pointer;
}

.avatar {
  width: 1.5em;
  height: auto;
}

@media screen and (max-width: 60em) {
  .gameSettings {
    width: 80%;
    gap: 2em;
  }
  #play_game_button {
    width: 20%;
    min-width: 100px;
  }
  #scramble_button {
    width: 40%;
    min-width: 100px;
  }
  .popup {
    max-height: 90%;
    font-size: 15px;
    max-width: 85%;
    overflow: auto;
  }
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
</style>
