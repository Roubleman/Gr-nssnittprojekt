<template>
  <!-- <header id="header-style">Cards</header>

  <section class="dealer-view">
    <Dealer> </Dealer>
  </section>
  <section class="player_view">
    <Player> </Player>
  </section> -->
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import DeckOfCards from "@/assets/DeckOfCards.json";
import io from "socket.io-client";
import Dealer from "@/components/DealerComponent.vue";
import Player from "@/components/PlayersComponent.vue";
import { SocketAddress } from "net";
const socket = io("localhost:3000");

export default {
  name: "GameView",
  components: {
    OneCard,
    Player,
    Dealer,
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playingCards: DeckOfCards,
      selectedCard: {},
      gameID: "inactive game",
      playerList: [],
      leaderBoard: [],
      gameInfo: {},
      player: {},
      isDealer: false,
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
      for (let i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name === this.playerName) {
          this.player = this.playerList[i];
        }
      }
      this.dealer = this.playerList[this.gameInfo.dealerIndex];
      this.guesser = this.playerList[this.gameInfo.guesserIndex];
    });

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
    cardIsSelected: function (event) {
      this.selectedCard = event;
      console.log(this.selectedCard);
    },
    guessCard: function (cardPoint) {
      socket.emit("guessCard", {
        cardPoint: cardPoint,
        gameId: this.gameId,
        playerName: this.playerName,
      });
    },
    }
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
