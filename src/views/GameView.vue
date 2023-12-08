<template>
  <header id="header-style">{{ uiLabels.gameViewHeadline }}</header>

  <section class="currentDealerGuesser">
    <div v-if="!this.isDealer" class="styled-box">
      {{ uiLabels.currentDealer }} <br />
      <p class="name-display">
        <img
          :src="this.playerList[gameInfo.dealerIndex].avatar"
          class="avatar"
        />
        {{ this.playerList[gameInfo.dealerIndex].name }}
      </p>
    </div>
    <div v-if="!this.isGuesser" class="styled-box">
      {{ uiLabels.currentGuesser }} <br />
      <p class="name-display">
        <img
          :src="this.playerList[gameInfo.guesserIndex].avatar"
          class="avatar"
        />
        {{ this.playerList[gameInfo.guesserIndex].name }}
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
      v-on:guessCorrect="correctGuess()"
      v-bind:isGuesser="this.isGuesser"
      v-bind:playingCards="this.playingCards"
      v-bind:currentCardIndex="this.gameInfo.currentCardIndex"
      v-bind:dealerChecked="this.dealerChecked"
      v-bind:guessedCard="this.cardGuessed"
      v-bind:uiLabels="this.uiLabels"
      v-bind:fancyDeck="this.fancyDeck"
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
</template>

<script>
import io from "socket.io-client";
import Dealer from "@/components/DealerComponent.vue";
import Player from "@/components/PlayersComponent.vue";
import DeckOfCards from "@/assets/DeckOfCards.json";
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
      uiLabels: {},
      playingCards: DeckOfCards, // ta bort sen när vi inte behöver testa
      fancyDeck: [],
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
      this.fancyDeck = this.createFancyDeck(this.playingCards);
      console.log(this.fancyDeck);
    });

    socket.on("gameUpdate", (game) => {
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
    });

    socket.on("dealerHasChecked", () => {
      this.dealerChecked = true;
    });

    socket.on("wrongGuess", (data) => {
      if (data.secondGuess) {
        this.higherLower = true;
        this.secondGuess = false;
      }
      this.cardGuessed = data.card;
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
    createFancyDeck: function (deck) {
      let fancyDeck = [];
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
        let deckObject = {
          value: valueArray[i],
          cards: deck.filter((card) => card.value === valueArray[i]),
        };
        for (let card of deckObject.cards) {
          card.isVisible = false;
        }
        fancyDeck.push(deckObject);
      }
      return fancyDeck;
    },
  },
};
</script>

<style scoped>
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
  margin: 2em auto;
}

.name-display {
  font-weight: bolder;
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
