<template>
  <div>
    <div id="back_button_div">
      <button
        class="back-button back-button2"
        @click="this.$router.push({ path: '/' })"
      >
        {{ uiLabels.backToHomepage }}
      </button>
    </div>
    <h1 class="heading">{{ uiLabels.createHeading }}</h1>

    <section id="global_section">
      <section class="create-setting box">
        {{ uiLabels.inputGuesses }}: {{ guessesNumber }}
        <button class="guess-button" v-on:click="this.addGuesses">+</button>
        <button class="guess-button" v-on:click="this.removeGuesses">-</button>
        <p class="explanation">
          {{ uiLabels.guessesExplanation }}
        </p>
      </section>
      <section class="create-setting box">
        {{ uiLabels.pointsSetting }}:
        <select class="input" v-model="pointsSetting">
          <option v-bind:value="'easy'">{{ uiLabels.easyOption }}</option>
          <option v-bind:value="'normal'">{{ uiLabels.normalOption }}</option>
          <option v-bind:value="'hard'">{{ uiLabels.hardcoreOption }}</option>
        </select>
        <p class="explanation">
          {{ uiLabels.pointsSettingExplanation }}
        </p>
      </section>
      <section class="create-setting box">
        {{ uiLabels.inputName }}:
        <input class="input" type="text" v-model="hostName" />
        <p class="explanation">
          {{ uiLabels.nameExplanation }}
        </p>
      </section>
      <section class="create-setting box">
        {{ uiLabels.inputGameId }}:
        <input
          class="input"
          type="text"
          v-model="gameId"
          v-on:input="
            gameId = gameId.replace(/\s/g, '');
            checkId();
          "
        />
        <p id="lobby_code_taken" v-if="!gameIdAvailable">
          {{ uiLabels.lobbyCodeTaken }}
        </p>
        <p class="explanation" v-else>
          {{ uiLabels.lobbyCodeExplanation }}
        </p>
      </section>
      <section id="button_section">
        <transition name="fade">
          <button
            class="start-button"
            v-on:click="createGame"
            :class="{
              startButtonIsDisabled: !this.checkValues() || !gameIdAvailable,
            }"
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
const socket = io(sessionStorage.getItem("dataServer"));
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
      gameIdAvailable: true,
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
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundImage = "url(/img/createBackground.svg)";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundSize = "cover";
  },
  beforeDestroy() {
    document.body.style.backgroundImage = null;
    document.body.style.backgroundSize = null;
    document.body.style.backgroundAttachment = null;
    document.body.style.backgroundPosition = null;
  },
  methods: {
    checkId: function () {
      if (this.gameId.length > 3) {
        socket.emit("checkGameId", this.gameId);
      }
    },
    checkValues: function () {
      if (this.gameId.length < 4) {
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
        alert(this.uiLabels.lobbyCodeTaken);
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

<style scoped>
.heading {
  font-size: 3em;
  margin: 0.5em;
  align-self: center;
}

#global_section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

#back_button_div {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3em;
  width: 60em;
  position: relative;
}

.create-setting {
  width: 40em;
  height: 4em;
  padding-top: 3%;
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
  justify-content: center;
}

#lobby_code_taken {
  color: red;
  font-size: 0.8em;
}
.start-button {
  width: 40%;
  color: black;
  margin-bottom: 1%;
  /* background: rgb(73, 114, 73); */
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
  width: 20%;
  color: black;
  padding-top: 2%;
  background: rgb(73, 114, 73);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  margin-left: 1em;
  margin-top: 1em;
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

.explanation {
  font-size: 0.7em;
  color: rgb(0, 0, 0);
}

.guess-button {
  font-size: 1.2em;
  width: 1.5em;
  border-radius: 10px;
  margin-right: 0.1em;
}

.guess-button:hover {
  cursor: pointer;
  background-color: rgb(134, 145, 132);
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 850px) {
  .heading {
    font-size: 2em;
  }
  .create-setting {
    width: 90%;
    font-size: 0.8em;
  }
  .input {
    font-size: 1em;
  }
  #button_section {
    width: 90%;
  }
  .start-button {
    width: 800%;
    height: 60%;
  }
  .back-button {
    display: none;
    margin: 0;
    padding: 0;
    border: none;
    box-sizing: border-box;
  }
  #back_button_div {
    height: 0;
  }
  .guess-button {
    font-size: 1em;
    width: 1.5em;
  }
}

@media (max-width: 450px) {
  .explanation {
    display: none;
  }
  .create-setting {
    width: 85%;
    font-size: 0.85em;
  }

  .start-button {
    width: 70%;
  }
}
</style>
