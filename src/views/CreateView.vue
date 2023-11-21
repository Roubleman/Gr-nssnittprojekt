<template>
  <div>
    {{ uiLabels.inputGameId }}:
    <input type="text" v-model="gameId" />
    <button v-on:click="createGame">
      {{ uiLabels.createGame }}
    </button>
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
      question: "",
      answers: ["", ""],
      questionNumber: 0,
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
