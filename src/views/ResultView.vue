<template>
  <div class="resultMenu">
    <h1>{{ uiLabels.gameResult }}</h1>
  </div>
  <section id="input_wrappers">
    <section class="playerList">
      <table class="leaderboard-table">
        <tr class="leaderboard-grid">
          <th class="text-center">{{ uiLabels.placement }}</th>
          <th class="text-center">{{ uiLabels.player }}</th>
          <th class="text-center">{{ uiLabels.points }}</th>
        </tr>
        <tr v-for="(player, index) in leaderboard" :key="index">
          <td class="text-center medal-cell">
            <img
              v-if="index === 0"
              :src="'/img/goldMedal.png'"
              class="avatar"
            />
            <img
              v-else-if="index === 1"
              :src="'/img/silverMedal.png'"
              class="avatar"
            />
            <img
              v-else-if="index === 2"
              :src="'/img/bronzeMedal.png'"
              class="avatar"
            />
            <span v-else> {{ index + 1 }}.</span>
          </td>
          <td class="text-center">
            <img :src="player.avatar" class="avatar" /> {{ player.name }}
            <span v-if="player.isDealer">&#x1f68c;</span>
          </td>
          <td class="text-center">{{ player.points }}</td>
        </tr>
      </table>
    </section>
    <button v-if="isDealer" v-on:click="startBus" class="bus-button">
      <label> {{ uiLabels.takeTheBus }}</label>
    </button>
    <button v-if="isHost" v-on:click="reStart" class="restart-button">
      <label> {{ uiLabels.restartGame }}</label>
    </button>
    <button
      v-if="!isHost && newGameExists"
      v-on:click="playAgain"
      class="restart-button"
    >
      <label> {{ uiLabels.joinRestart }}</label>
    </button>
  </section>
  <div>
    <audio id="backgroundAudio" autoplay loop :volume="0.5">
      <source src="/mp3/partyMusic.mp3" type="audio/mp3" />
      Your browser does not support the audio tag.
    </audio>
  </div>
  <div id="muteButton" @click="toggleSoundMute">
    {{ isSoundMuted ? "&#x1F50A;" : "&#x1F507;" }}
  </div>
</template>

<script>
// @ is an alias to /src

import io from "socket.io-client";
const socket = io(sessionStorage.getItem("dataServer"));
import DeckOfCards from "@/assets/DeckOfCards.json";

export default {
  name: "ResultView",
  data: function () {
    return {
      isSoundMuted: false,
      playingCards: DeckOfCards, // ta bort sen när vi inte behöver testa
      lang: localStorage.getItem("lang") || "en",
      playerName: sessionStorage.getItem("playerName"),
      player: {},
      gameId: "inactive game",
      uiLabels: {},
      playerList: [],
      leaderboard: [],
      isDealer: false,
      isHost: false,
      newGameExists: false,
    };
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    // document.body.style.background =
    //   "linear-gradient(90deg, rgba(29,36,0,1) 0%, rgba(85,138,47,1) 50%, rgba(29,36,0,1) 100%)";
    document.body.style.backgroundImage = "/img/resultBackground.svg";
  },
  beforeDestroy() {
    document.body.style.backgroundColor = null;
  },
  created: function () {
    this.gameId = this.$route.params.id;

    if (
      // ta bort sen när vi inte behöver testa
      this.gameId === "test1" ||
      this.gameId === "test2" ||
      this.gameId === "test3"
    ) {
      this.playerName = "player" + this.gameId.slice(-1);
      if (this.gameId === "test1") {
        socket.emit("createTestResult", {
          deck: this.playingCards,
          gameId: "test",
        });
      }
      this.gameId = "test";
    }

    socket.emit("getGameInfo", this.gameId);
    socket.emit("joinSocket", this.gameId);
    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.playerList.forEach((player) => {
        if (player.name === this.playerName) {
          this.player = player;
          this.isDealer = player.isDealer;
          this.isHost = player.isHost;
        }
      });
      this.leaderboard = this.getLeaderboard();
    });
    socket.on("newGameStarted", () => {
      console.log("new game started");
      this.newGameExists = true;
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
    startBus: function () {
      this.$router.push("/bus/");
    },
    backToHomepage: function () {
      this.$router.push("/");
    },
    reStart: function () {
      socket.emit("restart", this.gameId);
      this.$router.push("/host/" + this.gameId);
    },
    playAgain: function () {
      socket.emit("joinGame", {
        gameId: this.gameId,
        playerName: this.player.name,
        avatar: this.player.avatar,
      });
      this.$router.push("/join/" + this.gameId);
    },
    getLeaderboard: function () {
      let leaderboard = [...this.playerList]; // coPilot code
      leaderboard.sort((a, b) => a.points - b.points);
      return leaderboard;
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
.restart-button {
  width: 10em;
  color: white;
  margin-top: 1em;
  margin-bottom: 1em;
  background: rgb(73, 114, 73);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  z-index: 1;
}

.bus-button {
  color: rgb(246, 255, 0);
  background: rgb(255, 85, 0);
  width: 12em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5em;
  padding: 0.5em 1em;
  margin-top: 0.5em;
}

button:hover {
  transform: scale(1.1);
}

label {
  cursor: pointer;
}

.playerList {
  color: white;
  width: 25em;
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
.avatar {
  width: 1.3em;
  height: auto;
}
.text-center {
  text-align: center;
}
.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}
.medal-cell {
  display: flex;
  align-items: center;
  justify-content: center;
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

@media (max-width: 610px) {
  .playerList {
    width: 90%;
  }

  .restart-button {
    width: 65%;
    font-size: 1.2em;
  }
  .bus-button {
    width: 50%;
    font-size: 1.2em;
  }
}

@media (max-width: 450px) {
  .playerList {
    font-size: 75%;
  }
  .restart-button {
    width: 80%;
    font-size: 60%;
  }

  .bus-button {
    width: 70%;
    font-size: 70%;
  }
}
</style>
