<template>
  <div>
    <h1>Buss</h1>
  </div>
  <div class="card-grid">
    <section id="cardSelection">
      <vue-flip
        active-click
        class="flip-card"
        :width="cardWidth"
        :height="cardHeight"
      >
        <template v-slot:front class="card">
          <img
            src="/img/cardback.png"
            alt="Front of the card"
            class="card-image"
          />
        </template>

        <template v-slot:back class="card">
          <div class="card-grid">
            <OneCard
              class="card-facing-up"
              v-bind:card="topCard1"
              v-on:click="addToSelected(topCard1)"
            />
          </div>
        </template>
      </vue-flip>

      <vue-flip
        active-click
        class="flip-card"
        :width="cardWidth"
        :height="cardHeight"
      >
        <template v-slot:front class="card">
          <img
            src="/img/cardback.png"
            alt="Front of the card"
            class="card-image"
          />
        </template>

        <template v-slot:back class="card">
          <div class="card-grid">
            <OneCard
              class="card-facing-up"
              v-bind:card="topCard2"
              v-on:click="addToSelected(topCard2)"
            />
          </div>
        </template>
      </vue-flip>
      <vue-flip
        active-click
        class="flip-card"
        :width="cardWidth"
        :height="cardHeight"
      >
        <template v-slot:front class="card">
          <img
            src="/img/cardback.png"
            alt="Front of the card"
            class="card-image"
          />
        </template>

        <template v-slot:back class="card">
          <div class="card-grid">
            <OneCard
              class="card-facing-up"
              v-bind:card="topCard3"
              v-on:click="addToSelected(topCard3)"
            />
          </div>
        </template>
      </vue-flip>
      <vue-flip
        active-click
        class="flip-card"
        :width="cardWidth"
        :height="cardHeight"
      >
        <template v-slot:front class="card">
          <img
            src="/img/cardback.png"
            alt="Front of the card"
            class="card-image"
          />
        </template>

        <template v-slot:back class="card">
          <div class="card-grid">
            <OneCard
              class="card-facing-up"
              v-bind:card="topCard4"
              v-on:click="addToSelected(topCard4)"
            />
          </div>
        </template>
      </vue-flip>
      <button v-on:click="console.log(this.selectedCard)"></button>
    </section>
  </div>
</template>

<script>
import io from "socket.io-client";
import deckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "../components/OneCard.vue";
import { VueFlip } from "vue-flip";

const socket = io("localhost:3000");
export default {
  name: "ResultView",
  components: {
    OneCard,
    "vue-flip": VueFlip,
  },
  data: function () {
    return {
      isDone: false,
      cards: [],
      pile1: [],
      pile2: [],
      pile3: [],
      pile4: [],
      topCard1: null,
      topCard2: null,
      topCard3: null,
      topCard4: null,
      piles: [],
      selectedCard: [],
      cardPoints: [],
      cardWidth: "13.2em",
      cardHeight: "20em",
      lang: localStorage.getItem("lang") || "en",
      gameId: "inactive game",
      uiLabels: {},
      playerScore: {},
      playingCards: [],
      playerList: {},
      gameScore: 0,
    };
  },
  created: function () {
    this.distributeDeck();
    /*
    socket.emit("getGameInfo", this.gameId);
    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
    });*/
  },
  methods: {
    shuffleCards: function (deck) {
      const shuffledDeck = [...deck];
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }

      return shuffledDeck;
    },
    distributeDeck: function () {
      this.cards = this.shuffleCards(deckOfCards);
      this.pile1 = this.cards.slice(0, 13);
      this.pile2 = this.cards.slice(13, 26);
      this.pile3 = this.cards.slice(26, 39);
      this.pile4 = this.cards.slice(39, 52);
      this.piles = [];
      this.piles.push(this.pile1);
      this.piles.push(this.pile2);
      this.piles.push(this.pile3);
      this.piles.push(this.pile4);

      this.topCard1 = this.piles[0][0];
      this.topCard2 = this.piles[1][0];
      this.topCard3 = this.piles[2][0];
      this.topCard4 = this.piles[3][0];
      console.log("Redistributed deck");
      console.log(this.piles);
    },
    addToSelected: function (card) {
      if (this.selectedCard.length == 0) {
        this.selectedCard.push(card);
      } else if (!this.selectedCard.includes(card)) {
        this.selectedCard.push(card);
      }
      console.log(this.selectedCard);
      this.compare(this.selectedCard);
    },
    checkSorted: function (arr, i = 0) {
      if (i === arr.length - 1) {
        return true;
      }
      if (arr[i] > arr[i + 1]) {
        return false;
      }

      return checkSorted(arr, i + 1);
    },
    compare: function (selectedCard) {
      this.cardPoints.push(
        this.selectedCard[this.selectedCard.length - 1].points
      );
      console.log(this.cardPoints);
      if (this.checkSorted(this.cardPoints) && this.cardPoints.length == 4) {
        isDone = true;
        return this.isDone;
      } else if (!this.checkSorted(this.cardPoints)) {
        this.distributeDeck();
        this.gameScore += selectedCard.length * 2;
        console.log(this.gameScore);
        this.selectedCard = [];
        this.cardPoints = [];
      }

      return this.isDone;
    },
  },
};
</script>

<style>
#cardSelection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1em;
  position: relative;
  margin-left: 10em;
  width: calc(100% - 20em);
}
.scene {
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1em;
  position: relative;
  margin-left: 10em;
  width: calc(100% - 20em);
}
.flip-card {
  width: 100%;
  height: 100%;
  border: 0.08em solid black;
  border-radius: 0.5em;
  background-image: url("../../public/img/cardback.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  z-index: 1;
}
.card-image {
  border: 0.08em solid black;
  border-radius: 0.5em;
  cursor: pointer;
  height: inherit;
  width: inherit;
}
.grid-container {
  width: 100%;
  height: 100%;
}

.card-grid {
  display: contents;
}
.card-facing-up {
  background-color: white;
  z-index: 3;
  transition: none !important;
  transform: none !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
