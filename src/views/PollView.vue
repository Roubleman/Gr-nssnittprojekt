<template>
  <div>
    {{ gameId }}
    <QuestionComponent
      v-bind:question="question"
      v-on:answer="submitAnswer($event)"
    />

    <span>{{ submittedAnswers }}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from "@/components/QuestionComponent.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "PollView",
  components: {
    QuestionComponent,
  },
  data: function () {
    return {
      question: {
        q: "",
        a: [],
      },
      gameId: "inactive poll",
      submittedAnswers: {},
    };
  },
  created: function () {
    this.gameId = this.$route.params.id;
    socket.emit("joinPoll", this.gameId);
    socket.on("newQuestion", (q) => (this.question = q));
    socket.on("dataUpdate", (answers) => (this.submittedAnswers = answers));
  },
  methods: {
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", { gameId: this.gameId, answer: answer });
    },
  },
};
</script>
