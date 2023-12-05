<template>
  <div>
    <h1>{{ uiLabels.createHeading }}</h1>
    <section id="global_section">
      <section class="create-setting">
        {{ uiLabels.inputGuesses }}: {{ guessesNumber }}
        <button class="guess-button" v-on:click="this.addGuesses">+</button>
        <button class="guess-button" v-on:click="this.removeGuesses">-</button>
      </section>
      <section class="create-setting">
        {{ uiLabels.pointsSetting }}:
        <select class="input" v-model="pointsSetting">
          <option v-bind:value="'easy'">{{ uiLabels.easyOption }}</option>
          <option v-bind:value="'normal'">{{ uiLabels.normalOption }}</option>
          <option v-bind:value="'hard'">{{ uiLabels.hardcoreOption }}</option>
        </select>
      </section>
      <section class="create-setting">
        {{ uiLabels.inputName }}:
        <input class="input" type="text" v-model="hostName" />
      </section>
      <section class="create-setting">
        {{ uiLabels.inputGameId }}:
        <input
          class="input"
          type="text"
          v-model="gameId"
          v-on:input="checkId()"
        />
      </section>
      <section id="button_section">
        <button
          class="back-button back-button2"
          @click="this.$router.push({ path: '/' })"
        >
          {{ uiLabels.backToHomepage }}
        </button>

        <transition name="fade">
          <button
            class="start-button"
            v-on:click="createGame"
            :class="{ startButtonIsDisabled: !this.checkValues() }"
          >
            {{ uiLabels.startGame }}
          </button>
        </transition>
      </section>
    </section>
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");
import DeckOfCards from "@/assets/DeckOfCards.json";

export default {
  name: "CreateView",
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      gameId: "",
      hostName: "",
      guessesNumber: 3,
      data: {},
      uiLabels: {},
      pointsSetting: "normal",
      gameIdAvailable: false,
      playingCards: DeckOfCards,
      hostAvatar: "/img/crownAvatar.png",
    };
  },
  created: function () {
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
    socket.on("gameIdChecked", (gameIdAvailable) => {
      this.gameIdAvailable = gameIdAvailable;
    });
  },
  methods: {
    checkId: function () {
      if (this.gameId.length > 0) {
        socket.emit("checkGameId", this.gameId);
      }
    },
    checkValues: function () {
      if (this.gameId === "") {
        return false;
      } else if (this.hostName === "") {
        return false;
      } else {
        return true;
      }
    },
    addGuesses: function () {
      if (this.guessesNumber < 5) this.guessesNumber++;
    },
    removeGuesses: function () {
      if (this.guessesNumber > 1) this.guessesNumber--;
    },
    createGame: function () {
      if (!this.gameIdAvailable) {
        alert("Game ID already taken");
        return;
      } else {
        sessionStorage.setItem("playerName", this.hostName);
        this.$router.push("/host/" + this.gameId);
        socket.emit("createGame", {
          gameId: this.gameId,
          lang: this.lang,
          hostName: this.hostName,
          guessesNumber: this.guessesNumber,
          pointsSetting: this.pointsSetting,
          deckOfCards: this.playingCards,
          hostAvatar: this.hostAvatar,
        });
      }
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

h1 {
  font-size: 3em;
  margin: 0.5em;
  margin-bottom: 0.8em;
}

#global_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.create-setting {
  color: white;
  width: 40em;
  height: 4em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  padding-top: 3%;
  background-color: rgb(73, 114, 73);
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.input {
  font-size: 1.2em;
}
#button_section {
  width: 50em;
  height: 7em;
  padding-top: 2%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#start_game_button {
  width: 50%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: 1.5em;
}

#start_game_button:hover {
  background-color: rgb(62, 172, 28);
  cursor: pointer;
}

.start-button {
  width: 40%;
  color: black;
  padding-top: 2%;
  background: rgb(73, 114, 73);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  z-index: 1;
}

.start-button::after {
  content: "";
  position: absolute;
  width: 0;
  height: 100%;
  top: 0;
  right: 0;
  z-index: -1;
  background: rgb(2, 102, 49);
  box-shadow: 0 0 20px rgb(207, 207, 207);
  transition: all 0.3s ease;
}

.start-button:hover {
  color: whitesmoke;
  border: 1px solid rgb(6, 75, 6);
  box-shadow: 0 0 5px rgb(160, 242, 37), 0 0 5px rgb(160, 242, 37) inset;
}

.start-button:hover::after {
  left: 0;
  width: 100%;
}

.start-button:active {
  top: 2px;
}

.startButtonIsDisabled {
  pointer-events: none;
  cursor: default;
  opacity: 0.5;
}

.back-button {
  text-decoration: none;
  padding: 0.5em 1em;
  z-index: 1;
}

.back-button {
  width: 40%;
  color: black;
  padding-top: 2%;
  background: rgb(73, 114, 73);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  z-index: 1;
}

.back-button::after {
  content: "";
  position: absolute;
  width: 0;
  height: 100%;
  top: 0;
  left: 50%;
  z-index: -1;
  background: rgb(2, 102, 49);
  box-shadow: 0 0 20px rgb(207, 207, 207);
  transition: all 0.3s ease;
}

.back-button:hover {
  color: whitesmoke;
  border: 1px solid rgb(6, 75, 6);
  box-shadow: 0 0 5px rgb(160, 242, 37), 0 0 5px rgb(160, 242, 37);
}

.back-button:hover::after {
  left: 0;
  width: 100%;
}

.back-button:active {
  top: 2px;
}

.guess-button {
  font-size: 1.2em;
  width: 1.5em;
}

.guess-button:hover {
  cursor: pointer;
  background-color: rgb(134, 145, 132);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
