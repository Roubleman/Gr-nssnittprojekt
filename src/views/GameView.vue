<template>
  <header id="header-style">Cards</header>

  <section class="dealer-view" v-if="isDealer">
    <Dealer
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.gameInfo.currentCardIndex"
      v-on:dealerCheck="dealerHasChecked()"
    >
    </Dealer>
  </section>
  <section class="player-view">
    <Player
      v-on:firstGuess="guessFirstCard($event)"
      v-on:secondGuess="guessSecondCard($event)"
      v-bind:isGuesser="this.isGuesser"
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.currentCardIndex"
    >
    </Player>
  </section>
</template>

<script>
import io from "socket.io-client";
import Dealer from "@/components/DealerComponent.vue";
import Player from "@/components/PlayersComponent.vue";
const socket = io("localhost:3000");

export default {
  name: "GameView",
  components: {
    Player,
    Dealer,
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playingCards: [],
      selectedCard: {},
      gameID: "inactive game",
      playerList: [],
      leaderBoard: [],
      gameInfo: {},
      player: {},
      playerIndex: 0,
      isDealer: false,
      isGuesser: false,
      playerName: localStorage.getItem("playerName"),
      dealer: {},
      guesser: {},
    };
  },

  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("joinSocket", this.gameId);

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.gameInfo.errorsRemaining = game.errorsRemaining;
      this.gameInfo.currentCardIndex = game.currentCardIndex;
      this.gameInfo.dealerIndex = game.dealerIndex;
      this.gameInfo.guesserIndex = game.guesserIndex;
      this.playingCards = game.deckOfCards;
      for (let i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name === this.playerName) {
          this.playerIndex = i;
          this.player = this.playerList[playerIndex];
        }
      }
      this.dealer = this.playerList[this.gameInfo.dealerIndex];
      this.guesser = this.playerList[this.gameInfo.guesserIndex];
      if (this.playerIndex === this.gameInfo.dealerIndex) {
        this.isDealer = true;
      } else {
        this.isDealer = false;
      }
      if (this.playerIndex === this.gameInfo.guesserIndex) {
        this.isGuesser = true;
      } else {
        this.isGuesser = false;
      }
    });

    socket.on("gameUpdate", (game) => {
      this.playerList = game.players;
      this.gameInfo.errorsRemaining = game.errorsRemaining;
      this.gameInfo.currentCardIndex = game.currentCardIndex;
      this.gameInfo.dealerIndex = game.dealerIndex;
      this.gameInfo.guesserIndex = game.guesserIndex;
      this.dealer = this.playerList[this.gameInfo.dealerIndex];
      this.guesser = this.playerList[this.gameInfo.guesserIndex];
      this.player = this.playerList[this.playerIndex];
      if (this.playerIndex === this.gameInfo.dealerIndex) {
        this.isDealer = true;
      } else {
        this.isDealer = false;
      }
      if (this.playerIndex === this.gameInfo.guesserIndex) {
        this.isGuesser = true;
      } else {
        this.isGuesser = false;
      }
    });

    socket.on("dealerHasChecked", () => {});

    socket.on("cardGuessed", (guessedCorrectly) => {
      // Om guessedCorrectly => fuckTheDealer med secondGuess = false eller true
      // Om !guessedCorrectly men första gissning => andra gissning
      // om !guessedCorrectly men andra gissning => pointsIncrease och nextRound
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },

  methods: {
    guessFirstCard: function (card) {
      socket.emit("cardGuessed", {
        card: card,
        gameId: this.gameId,
        playerName: this.playerName,
        secondGuess: false,
      });
    },
    guessSecondCard: function (card) {
      socket.emit("cardGuessed", {
        card: card,
        gameId: this.gameId,
        playerName: this.playerName,
        secondGuess: true,
      });
    },
    cardIsSelected: function (event) {
      this.selectedCard = event;
      console.log(this.selectedCard);
    },
    guessCard: function (card) {
      cardPoint = card.points;
      socket.emit("guessCard", {
        cardPoint: cardPoint,
        gameId: this.gameId,
        playerName: this.playerName,
      });
    },
    dealerHasChecked: function () {
      socket.emit("dealerCheck", this.gameId);
    },
  },
};
</script>

<style>
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
  --card-height: 8em;
}

.dealer-view {
  --card-width: 20em;
}
</style>
