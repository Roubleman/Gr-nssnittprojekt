<template>
  <section id="background">
    <header id="header-style">{{ uiLabels.bus }}</header>
    <div class="card-grid">
      <section id="cardSelection" vis>
        <vue-flip
          v-model="flipped1"
          class="flip-card"
          :width="cardWidth"
          :height="cardHeight"
          v-on:click="addToSelected(topCard1), (flipped1 = true)"
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
                :cardHeight="20"
              />
            </div>
          </template>
        </vue-flip>

        <vue-flip
          v-model="flipped2"
          class="flip-card"
          :width="cardWidth"
          :height="cardHeight"
          v-on:click="addToSelected(topCard2), (flipped2 = true)"
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
                :cardHeight="20"
              />
            </div>
          </template>
        </vue-flip>
        <vue-flip
          v-model="flipped3"
          class="flip-card"
          :width="cardWidth"
          :height="cardHeight"
          v-on:click="addToSelected(topCard3), (flipped3 = true)"
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
                :cardHeight="20"
              />
            </div>
          </template>
        </vue-flip>
        <vue-flip
          v-model="flipped4"
          class="flip-card"
          :width="cardWidth"
          :height="cardHeight"
          v-on:click="addToSelected(topCard4), (flipped4 = true)"
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
                :cardHeight="20"
              />
            </div>
          </template>
        </vue-flip>
      </section>
      <section class="gameInfo">
        <li>{{ uiLabels.numberOfPoints }}: {{ this.gameScore }}</li>
        <li>{{ uiLabels.busInfo1 }}{{ this.selectedCard.length }}</li>
        <li>{{ uiLabels.busInfo2 }}{{ this.noShuffles }}</li>
      </section>
      <section class="rules">
        <li>{{ uiLabels.rule1 }}</li>
        <li>{{ uiLabels.rule2 }}</li>
        <li>{{ uiLabels.rule3 }}</li>
      </section>
    </div>
  </section>
</template>

<script>
import io from "socket.io-client";
import deckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "../components/OneCard.vue";
import { VueFlip } from "vue-flip";

const socket = io(sessionStorage.getItem("dataServer"));
export default {
  name: "ResultView",
  components: {
    OneCard,
    "vue-flip": VueFlip,
  },
  data: function () {
    return {
      isDone: null,
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
      cardSuit: [],
      cardWidth: "13.2em",
      cardHeight: "20em",
      lang: localStorage.getItem("lang") || "en",
      uiLabels: {},
      playerScore: {},
      playingCards: [],
      gameScore: 0,
      noShuffles: 0,
      flipped1: false,
      flipped2: false,
      flipped3: false,
      flipped4: false,
    };
  },
  created: function () {
    this.isDone = false;
    this.distributeDeck();
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundColor = "rgb(29,36,0)";
    document.body.style.background =
      "linear-gradient(90deg, rgba(29,36,0,1) 0%, rgba(85,138,47,1) 50%, rgba(29,36,0,1) 100%)";
  },
  beforeDestroy() {
    document.body.style.backgroundColor = null;
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
      this.flipped1 = false;
      this.flipped2 = false;
      this.flipped3 = false;
      this.flipped4 = false;
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
      if (!this.selectedCard.includes(card)) {
        this.selectedCard.push(card);
        console.log(this.selectedCard);
        this.compare(this.selectedCard);
      }
    },
    checkBlack: function (arr) {
      if (arr.length === 4) {
        if (arr[3] === "spades" || arr[3] === "clubs") {
          return true;
        } else {
          return false;
        }
      } else if (arr.length === 2) {
        if (arr[1] === "spades" || arr[1] === "clubs") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    checkRed: function (arr) {
      if (arr.length === 3) {
        if (arr[2] === "hearts" || arr[2] === "diams") {
          return true;
        } else {
          return false;
        }
      } else if (arr.length === 1) {
        if (arr[0] === "hearts" || arr[0] === "diams") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    compare: function (selectedCard) {
      this.cardSuit.push(this.selectedCard[this.selectedCard.length - 1].suit);
      console.log(this.cardSuit);
      if (this.cardSuit.length == 4 && this.checkBlack(this.cardSuit)) {
        this.isDone = true;
        alert("You won");
      } else if (this.cardSuit.length == 4 && !this.checkBlack(this.cardSuit)) {
        setTimeout(() => {
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          console.log(this.gameScore);
          this.selectedCard = [];
          this.cardSuit = [];
        }, 1000);
      } else if (selectedCard.length === 1 && !this.checkRed(this.cardSuit)) {
        console.log(this.checkRed(this.cardSuit));
        setTimeout(() => {
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          console.log(this.gameScore);
          this.selectedCard = [];
          this.cardSuit = [];
        }, 1000);
      } else if (selectedCard.length === 2 && !this.checkBlack(this.cardSuit)) {
        setTimeout(() => {
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          console.log(this.gameScore);
          this.selectedCard = [];
          this.cardSuit = [];
        }, 1000);
      } else if (selectedCard.length === 3 && !this.checkRed(this.cardSuit)) {
        console.log(this.checkRed(this.cardSuit));
        setTimeout(() => {
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          console.log(this.gameScore);
          this.selectedCard = [];
          this.cardSuit = [];
        }, 1000);
      } else {
        console.log("good job");
      }
    },
  },
};
</script>

<style>
body {
  background-color: rgb(233, 233, 223);
  font-size: 1.3em;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
#cardSelection {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1em;
  margin-top: 10em;
  position: relative;
  margin-left: 8em;
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
  background-image: url("/img/cardback.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  z-index: 1;
}
.card-image {
  border: 0.175em solid rgb(95, 95, 95);
  border-radius: 1em;
  cursor: pointer;
  height: inherit;
  width: inherit;
}
.grid-container {
  width: 100%;
  height: 100%;
}

.card-grid {
  margin: 5px;
  display: contents;
}
.card-facing-up {
  background-color: white;
  z-index: 3;
  transition: none !important;
  transform: none !important;
}
.gameInfo {
  text-align: left;
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin-top: 4.4em;
  margin-bottom: 0.5em;
  position: absolute;
  top: 8px;
  right: 0px;
  z-index: 100;
}
.rules {
  text-align: left;
  color: white;
  width: 15em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  background-color: rgb(73, 114, 73);
  margin-top: 4.4em;
  margin-bottom: 0.5em;
  position: absolute;
  top: 8px;
  left: 0px;
  z-index: 100;
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
</style>
