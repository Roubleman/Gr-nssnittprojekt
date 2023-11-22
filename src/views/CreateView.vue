<template>
  <div>
    <h1>{{ uiLabels.createHeading }}</h1>
    <section>
      <section type="create-setting">
        {{ uiLabels.inputGuesses }}: {{ guessesNumber }}
        <button v-on:click="this.addGuesses">+</button>
        <button v-on:click="this.removeGuesses">-</button>
      </section>
      <section type="create-setting">
        {{ uiLabels.pointsSetting }}:
        <select v-model="pointsSetting">
          <option v-bind:value="'easy'">{{ uiLabels.easyOption }}</option>
          <option v-bind:value="'normal'">{{ uiLabels.normalOption }}</option>
          <option v-bind:value="'hard'">{{ uiLabels.hardcoreOption }}</option>
        </select>
      </section>
      <section class="create-setting">
        {{ uiLabels.inputName }}:
        <input type="text" v-model="hostName" />
      </section>
      <section class="create-setting">
        {{ uiLabels.inputGameId }}:
        <input type="text" v-model="gameId" />
      </section>
      <section class="create-setting">
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
    this.id = this.$route.params.id;
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
    socket.on("dataUpdate", (data) => (this.data = data));
    socket.on("pollCreated", (data) => (this.data = data));
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
      socket.emit("createGame", {
        gameId: this.gameId,
        hostName: this.hostName,
        guessesNumber: this.guessesNumber,
        pointsSetting: this.pointsSetting,
      });
      this.$router.push("/game/" + this.gameId);
    },
  },
};
</script>

<style>
.create-setting {
  height: 5em;
  margin: 2em;
}

#guesses_input {
  width: 2em;
}
#start_game_button {
  width: 20%;
  height: 50%;
  background-color: rgb(160, 242, 37);
  font-size: large;
}

#start_game_button:hover {
  background-color: rgb(62, 172, 28);
  cursor: pointer;
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
