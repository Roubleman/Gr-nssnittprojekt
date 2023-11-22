<template>
  <div>
    <h1>{{ uiLabels.createHeading }}</h1>
    <section>
      <section type="create-setting">
        {{ uiLabels.inputGuesses }}:
        <input
          id="guesses_input"
          type="number"
          min="1"
          max="5"
          v-model="guessesNumber"
        />
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
        <button id="start_game_button" v-on:click="createGame">
          {{ uiLabels.startGame }}
        </button>
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
      question: "",
      answers: ["", ""],
      guessesNumber: 3,
      data: {},
      uiLabels: {},
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
    createGame: function () {},
    createPoll: function () {
      socket.emit("createPoll", { gameId: this.gameId, lang: this.lang });
    },
    addQuestion: function () {
      socket.emit("addQuestion", {
        gameId: this.gameId,
        q: this.question,
        a: this.answers,
      });
    },
    addAnswer: function () {
      this.answers.push("");
    },
    runQuestion: function () {
      socket.emit("runQuestion", {
        gameId: this.gameId,
        questionNumber: this.questionNumber,
      });
    },
  },
};
</script>

<style>
.create-setting {
  height: 5em;
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
</style>
