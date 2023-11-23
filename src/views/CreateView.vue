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
        <input class="input" type="text" v-model="gameId" />
      </section>
      <section id="button_section">
        <transition name="fade">
          <button
            id="start_game_button"
            v-show="checkValues()"
            v-on:click="createGame"
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
    };
  },
  created: function () {
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
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
      this.$router.push("/lobby/" + this.gameId);
      socket.emit("createGame", {
        gameId: this.gameId,
        lang: this.lang,
        hostName: this.hostName,
        guessesNumber: this.guessesNumber,
        pointsSetting: this.pointsSetting,
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
  width: 40em;
  height: 4em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  padding-top: 3%;
  background-color: rgba(11, 116, 20, 0.468);
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
