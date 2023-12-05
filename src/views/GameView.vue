<template>
  <header id="header-style">Cards</header>

  <section class="dealer-view" v-if="isDealer">
    <Dealer
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.gameInfo.currentCardIndex"
      v-bind:higherLower="this.higherLower"
      v-on:dealerCheck="dealerHasChecked()"
    >
    </Dealer>
  </section>
  <section class="player-view" v-if="!isDealer">
    <Player
      v-on:wrongGuess="guessCard($event)"
      v-on:guessCorrect="correctGuess()"
      v-bind:isGuesser="this.isGuesser"
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.currentCardIndex"
      v-bind:dealerChecked="this.dealerChecked"
      v-bind:guessedCard="this.cardGuessed"
    >
    </Player>
  </section>
  <section class="leaderboard">
    {{ this.leaderboard }}
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
      cardGuessed: {},
      gameId: "inactive game",
      playerList: [],
      leaderboard: [],
      gameInfo: {},
      player: {},
      playerIndex: 0,
      isDealer: false,
      isGuesser: false,
      playerName: localStorage.getItem("playerName"),
      higherLower: false,
      dealerChecked: false,
      secondGuess: false,
    };
  },

  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("joinSocket", this.gameId);

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      console.log(game);
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
          this.player = this.playerList[playerIndex];
        }
      }
      this.isGuesser = this.player.isGuesser;
      this.isDealer = this.player.isDealer;
    });

    socket.on("gameUpdate", (game) => {
      this.playerList = game.players;
      this.leaderboard = this.getLeaderboard();
      this.gameInfo.errorsRemaining = game.errorsRemaining;
      this.gameInfo.currentCardIndex = game.currentCardIndex;
      this.gameInfo.dealerIndex = game.dealerIndex;
      this.gameInfo.guesserIndex = game.guesserIndex;
      this.dealer = this.playerList[this.gameInfo.dealerIndex];
      this.guesser = this.playerList[this.gameInfo.guesserIndex];
      this.player = this.playerList[this.playerIndex];
      this.isGuesser = this.player.isGuesser;
      this.isDealer = this.player.isDealer;
      this.secondGuess = false;
    });

    socket.on("dealerHasChecked", () => {
      this.dealerChecked = true;
    });

    socket.on("wrongGuess", (card) => {
      this.higherLower = true;
      this.cardGuessed = card;
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },

  methods: {
    guessCard: function (card) {
      socket.emit("cardGuessed", {
        card: card,
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
    },
    getLeaderboard: function () {
      let leaderboard = [...this.playerList]; // coPilot code
      leaderboard.sort((a, b) => a.points - b.points);
      return leaderboard;
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
