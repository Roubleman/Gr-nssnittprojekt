<template>
  <header id="header-style">{{ uiLabels.gameViewHeadline }}</header>

  <section class="currentDealerGuesser">
    <div v-if="!this.isDealer" class="styled-box">
      <h4>{{ uiLabels.currentDealer }}</h4>
      <p class="name-display">
        <img
          :src="this.playerList[gameInfo.dealerIndex].avatar"
          class="avatar"
        />
        {{ this.playerList[gameInfo.dealerIndex].name }}
      </p>
    </div>
    <div class="styled-box error-box">
      <h4>
        {{ uiLabels.errorsRemaining }}
      </h4>
      <p id="errors">
        {{ this.gameInfo.errorsRemaining }}
      </p>
    </div>
    <div v-if="!this.isGuesser" class="styled-box">
      <h4>{{ uiLabels.currentGuesser }}</h4>
      <p class="name-display">
        <img
          :src="this.playerList[gameInfo.guesserIndex].avatar"
          class="avatar"
        />
        {{ this.playerList[gameInfo.guesserIndex].name }}
        <p v-if="higherLower && isDealer" class="guessed-card">
        <OneCard
          v-bind:card="cardGuessed"
          class="no-selection"
          :cardHeight="8"
        />
        </p>
      </p>
    </div>
  </section>

  <section class="dealer-view" v-if="this.isDealer">
    <h1 class="h1 name-display">
      <img :src="this.player.avatar" class="avatar" />
      {{ this.playerList[gameInfo.dealerIndex].name }}, <br />
      {{ uiLabels.dealerHeader }}
    </h1>
    <Dealer
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.gameInfo.currentCardIndex"
      v-bind:higherLower="this.higherLower"
      v-bind:uiLabels="this.uiLabels"
      v-bind:guessedCard="this.cardGuessed"
      v-on:dealerCheck="dealerHasChecked()"
    >
    </Dealer>
  </section>
  <section class="player-view" v-else>
    <h1 class="h1 name-display" v-if="this.isGuesser">
      <img :src="this.player.avatar" class="avatar" /> {{ this.playerName }},
      {{ uiLabels.playerHeader }}
    </h1>
    <h1 class="h1 name-display" v-else>
      {{ this.playerName }}, {{ uiLabels.spectatorHeader }}
    </h1>
    <Player
      v-on:wrongGuess="guessCard($event)"
      v-on:correctGuess="correctGuess()"
      v-on:popUpShown="resetDealerChecked()"
      v-bind:isGuesser="this.isGuesser"
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.gameInfo.currentCardIndex"
      v-bind:dealerChecked="this.dealerChecked"
      v-bind:guessedCard="this.cardGuessed"
      v-bind:uiLabels="this.uiLabels"
      v-bind:graphicDeck="this.graphicDeck"
    >
    </Player>
  </section>
  <section class="leaderboard">
    <h1>{{ uiLabels.leaderboardTitle }}</h1>
    <table class="leaderboard-table">
      <tr class="leaderboard-grid">
        <th class="text-center">{{ uiLabels.placement }}</th>
        <th class="text-center">{{ uiLabels.player }}</th>
        <th class="text-center">{{ uiLabels.points }}</th>
      </tr>
      <tr v-for="(player, index) in leaderboard" :key="index">
        <td class="text-center medal-cell">
          <img v-if="index === 0" :src="'/img/goldMedal.png'" class="avatar" />
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
        </td>
        <td class="text-center">{{ player.points }}</td>
      </tr>
    </table>
  </section>
  <div v-if="popup.isVisible" class="popup" :class="popup.type">
    <p>{{ popup.message }}</p>
    <div class="popup-elements">
      <p v-if="popup.points">{{ uiLabels.points }}: {{ popup.points }}</p>
      <OneCard
        v-if="Object.keys(popup.card).length > 0"
        :card="popup.card"
        :cardHeight="5"
        class="no-selection"
      ></OneCard>
    </div>
    <button @click="closePopup" v-if="popup.isClosable">
      {{ uiLabels.close }}
    </button>
  </div>
</template>

<script>
import io from "socket.io-client";
import Dealer from "@/components/DealerComponent.vue";
import Player from "@/components/PlayersComponent.vue";
import DeckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "@/components/OneCard.vue";
const socket = io("localhost:3000");

export default {
  name: "GameView",
  components: {
    Player,
    Dealer,
    OneCard,
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      uiLabels: {},
      playingCards: DeckOfCards, // ta bort sen när vi inte behöver testa
      graphicDeck: [],
      cardGuessed: {},
      gameId: "inactive game",
      playerList: [],
      leaderboard: [],
      gameInfo: {},
      player: {},
      playerIndex: 0,
      isDealer: false,
      isGuesser: false,
      playerName: sessionStorage.getItem("playerName"),
      higherLower: false,
      dealerChecked: false,
      secondGuess: false,
      pointsIncreased: 0,
      popup: {
        isVisible: false,
        isClosable: true,
        message: "",
        card: {},
        type: "",
        points: 0,
      },
    };
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
        socket.emit("createTestGame", this.playingCards);
      }
      this.gameId = "test";
    }

    socket.emit("joinSocket", this.gameId);

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.leaderboard = this.getLeaderboard();
      this.gameInfo.errorsRemaining = game.errorsRemaining;
      this.gameInfo.currentCardIndex = game.currentCardIndex;
      this.gameInfo.dealerIndex = game.dealerIndex;
      this.gameInfo.guesserIndex = game.guesserIndex;
      this.playingCards = game.deckOfCards;
      for (let i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name === this.playerName) {
          this.playerIndex = i;
          this.player = this.playerList[this.playerIndex];
        }
      }
      this.isGuesser = this.player.isGuesser;
      this.isDealer = this.player.isDealer;
      this.graphicDeck = this.createGraphicDeck(this.playingCards);
    });

    socket.on("gameUpdate", (game) => {
      console.log("gameUpdate recieved", game.currentCardIndex);
      setTimeout(() => {
        this.showPopup("newRound", this.uiLabels.newRound, {}, 0, false);
        this.playerList = game.players;
        this.leaderboard = this.getLeaderboard();
        this.gameInfo.errorsRemaining = game.errorsRemaining;
        this.gameInfo.currentCardIndex = game.currentCardIndex;
        this.gameInfo.dealerIndex = game.dealerIndex;
        this.gameInfo.guesserIndex = game.guesserIndex;
        this.player = this.playerList[this.playerIndex];
        this.isGuesser = this.player.isGuesser;
        this.isDealer = this.player.isDealer;
        this.secondGuess = false;
        this.updateGraphicDeck(
          this.playingCards,
          this.gameInfo.currentCardIndex
        );
      }, 10000);
    });

    socket.on("dealerHasChecked", () => {
      this.dealerChecked = true;
      if (!this.isDealer && !this.isGuesser) {
        this.showPopup(
          "wrongGuess",
          this.uiLabels.wrongGuessPopupSpec,
          this.cardGuessed,
          0,
          false
        );
      }
    });

    socket.on("wrongGuess", (data) => {
      console.log("wrongGuess recieved", data.card, data.secondGuess);
      if (!data.secondGuess && this.isDealer) {
        this.higherLower = true;
      }
      this.cardGuessed = data.card;
      console.log(this.cardGuessed);
    });

    socket.on("correctGuess", (points) => {
      console.log("correctGuess recieved", points);
      let message = {};
      if (this.isDealer) {
        message = this.uiLabels.youGotFucked;
      } else if (this.isGuesser) {
        message = this.uiLabels.youGuessedCorrect;
      } else {
        message = this.uiLabels.guesserGuessedCorrect;
      }
      this.showPopup(
        "correctGuess",
        message,
        this.playingCards[this.gameInfo.currentCardIndex],
        points,
        false
      );
    });

    socket.on("guesserPointsIncreased", (points) => {
      console.log("guesserPointsIncreased received", points);
      this.pointsIncreased = points;
      if (this.isGuesser) {
        this.showPopup(
          "pointsIncreased",
          this.uiLabels.wrongGuessPoints,
          this.playingCards[this.gameInfo.currentCardIndex],
          points,
          true
        );
      } else {
        this.showPopup(
          "pointsIncreased",
          this.uiLabels.playerGuessedWrong,
          this.playingCards[this.gameInfo.currentCardIndex],
          points,
          false
        );
      }
    });

    socket.on("gameEnded", () => {
      this.$router.push("/result/" + this.gameId);
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundColor = "green";
  },
  beforeDestroy() {
    document.body.style.backgroundColor = null;
  },
  methods: {
    resetDealerChecked: function () {
      this.dealerChecked = false;
    },
    guessCard: function (card) {
      console.log(card);
      socket.emit("cardGuessed", {
        card: card.card,
        gameId: this.gameId,
        playerName: this.playerName,
        secondGuess: this.secondGuess,
      });
      this.secondGuess = !this.secondGuess;
    },
    correctGuess: function () {
      socket.emit("correctGuess", {
        gameId: this.gameId,
        secondGuess: this.secondGuess,
      });
    },
    cardIsSelected: function (event) {
      this.selectedCard = event;
      console.log(this.selectedCard);
    },
    dealerHasChecked: function () {
      socket.emit("dealerCheck", this.gameId);
      this.higherLower = false;
    },
    getLeaderboard: function () {
      let leaderboard = [...this.playerList]; // coPilot code
      leaderboard.sort((a, b) => a.points - b.points);
      return leaderboard;
    },
    createGraphicDeck: function (deck) {
      let graphicDeck = [];
      let valueArray = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      for (let i = 0; i < valueArray.length; i++) {
        let shadowGhostCards = [
          {
            value: valueArray[i],
            suit: "",
            points: this.shadowGhostCardPointMakerFunction(valueArray[i]),
          },
        ];

        let normalCards = deck.filter((card) => card.value === valueArray[i]);

        let deckObject = {
          value: valueArray[i],
          cards: [].concat(shadowGhostCards, normalCards),
        };

        for (let card of deckObject.cards) {
          if (card.suit === "") {
            card.isVisible = true;
          } else {
            card.isVisible = false;
          }
        }
        graphicDeck.push(deckObject);
      }
      return graphicDeck;
    },
    updateGraphicDeck(deck, cardIndex) {
      let cardToDisplay = deck[cardIndex - 1];
      let valueIndex = cardToDisplay.points -1;
          for (let j = 0; j < this.graphicDeck[valueIndex].cards.length; j++) {
            if (this.graphicDeck[valueIndex].cards[j].suit === cardToDisplay.suit) {
              this.graphicDeck[valueIndex].cards[j].isVisible = true;
              if (this.graphicDeck[valueIndex].cards[0].isVisible) {
                this.graphicDeck[valueIndex].cards[0].isVisible = false;
          }
          break;
        }
      }
    },

    shadowGhostCardPointMakerFunction(value) {
      switch (value) {
        case "A":
          return 1;
        case "J":
          return 11;
        case "Q":
          return 12;
        case "K":
          return 13;
        default:
          return parseInt(value);
      }
    },
    showPopup(type, message, card, points, isClosable) {
      if (this.popup.isVisible) {
        this.closePopup();
      }
      this.popup.isClosable = isClosable;
      this.popup.points = points;
      this.popup.card = card;
      this.popup.type = type;
      this.popup.message = message;
      this.popup.isVisible = true;
      if (!isClosable) {
        setTimeout(() => {
          this.closePopup();
        }, 3000);
      }
    },
    closePopup() {
      this.popup.isVisible = false;
    },
  },
};
</script>

<style scoped>
h4 {
  margin: 0.1em;
}

#header-style {
  font-size: 1.5rem;
  font-weight: bolder;
  padding-top: 2em;
  padding-bottom: 1em;
  width: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgb(73, 114, 73);
}

.h1 {
  font-size: 1.5rem;
  font-weight: bolder;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 10px;
  z-index: 1000;
  text-align: center;
}

.popup-elements {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.no-selection {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

.card-flex {
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 1em 0.7em;
  padding: 1em;
}

.dealer-view {
  --card-width: 20em;
}

.avatar {
  width: 1.3em;
  height: auto;
}

.leaderboard {
  list-style-type: decimal;
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin: 2em auto;
}

.styled-box {
  margin-left: 1em;
  margin-right: 1em;
  list-style-type: decimal;
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 0.5em;
  background-color: rgb(73, 114, 73);
  margin: 1.5em auto;
}

.name-display {
  font-weight: bolder;
  margin:0.5em;
}

.leaderboard li {
  padding: 0.3em;
}

.currentDealerGuesser {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
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

.text-center {
  text-align: center;
}

.guessed-card {
  /* Add some space around the card if needed */
  margin-top: 0.4em; /* Adjust as needed */
  /* Additional styles for the container */
  display: flex;
  align-items: center;
  justify-content: center;
}

th,
td {
  padding: 0.5em;
  text-align: center;
}

th:first-child,
td:first-child {
  text-align: left;
}

th:last-child,
td:last-child {
  text-align: right;
}
</style>
