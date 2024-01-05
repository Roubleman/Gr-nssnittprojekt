<template>
  <section id="background">
    <header id="header-style" v-bind:hidden="this.isDone">{{ uiLabels.bus }}</header>
    <div class="card-grid">
      <section class="gameInfo" v-bind:hidden="this.isDone">
        <li>{{ uiLabels.numberOfPoints }}: {{ this.gameScore }}</li>
        <li>{{ uiLabels.busInfo1 }}{{ this.selectedCard.length }}</li>
        <li>{{ uiLabels.busInfo2 }}{{ this.noShuffles }}</li>
      </section>
      <section class="rules" v-bind:hidden="this.isDone">
        <li>{{ uiLabels.rule1 }}</li>
        <li>{{ uiLabels.rule2 }}</li>
        <li>{{ uiLabels.rule3 }}</li>
      </section>
      <section id="cardSelection">
        <vue-flip
          v-model="flipped1"
          class="flip-card"
          :width="cardWidth"
          :height="cardHeight"
          v-on:click="addToSelected(topCard1), (flipped1 = true)"
          v-bind:hidden="this.isDone"
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
          v-bind:hidden="this.isDone"
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
          v-bind:hidden="this.isDone"
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
          v-bind:hidden="this.isDone"
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
      <section class="gameDone" v-bind:hidden="!this.isDone">
        <div id="back_button_div">
          <h1>
            {{ uiLabels.busGameDone }} {{ this.gameScore }}
            {{ uiLabels.numberOfPoints }}
          </h1>
          <button class="back-button back-button2" @click="this.refreshPage()">
            {{ uiLabels.playAgain }}
          </button>
          <div id="back_button_div">
            <button
              class="back-button back-button2"
              @click="this.$router.push({ path: '/' })"
            >
              {{ uiLabels.backToHomepage }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import io from "socket.io-client";
import deckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "@/components/OneCard.vue";
import { VueFlip } from "vue-flip";

const socket = io(sessionStorage.getItem("dataServer"));
export default {
  name: "BusView",
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
      playingCards: [],
      gameScore: 0,
      noShuffles: 0,
      flipped1: false,
      flipped2: false,
      flipped3: false,
      flipped4: false,
      nextStation: null,
      mindTheGap: null,
      randStation: null,
    };
  },
  created: function () {
    this.nextStation = new Audio("/mp3/nasta.mp3");
    this.mindTheGap = new Audio("/mp3/partyMusic.mp3");
    this.isDone = false;
    this.distributeDeck();
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundColor = "rgb(7,96,50)";
    document.body.style.background =
      "linear-gradient(90deg, rgba(7,96,50,1) 0%, rgba(105,187,126,1) 50%, rgba(7,96,50,1) 100%)";
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
    refreshPage: function () {
      location.reload();
    },
    flipBackCards: function () {
      this.flipped1 = false;
      this.flipped2 = false;
      this.flipped3 = false;
      this.flipped4 = false;
    },
    distributeDeck: function () {
      const path =
        "/stations/" +
        Math.floor(Math.random() * (14 - 0 + 1) + 0) +
        ".mp3";
      this.randStation = new Audio(path);
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
      if (!this.selectedCard.includes(card)) {
        this.selectedCard.push(card);
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
    delay: function (milliseconds) {
      return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
      });
    },
    compare: function (selectedCard) {
      this.cardSuit.push(this.selectedCard[this.selectedCard.length - 1].suit);
      if (this.cardSuit.length == 4 && this.checkBlack(this.cardSuit)) {
        setTimeout(async () => {
          this.mindTheGap.play();
          await this.delay(3000);
          this.isDone = true;
        });
      } else if (this.cardSuit.length == 4 && !this.checkBlack(this.cardSuit)) {
        setTimeout(async () => {
          this.flipBackCards();
          await this.delay(500);
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          this.selectedCard = [];
          this.cardSuit = [];
          this.nextStation.play();
          await this.delay(1500);
          this.randStation.play();
        }, 1000);
      } else if (selectedCard.length === 1 && !this.checkRed(this.cardSuit)) {
        setTimeout(async () => {
          this.flipBackCards();
          await this.delay(500);
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          this.selectedCard = [];
          this.cardSuit = [];
          this.nextStation.play();
          await this.delay(1500);
          this.randStation.play();
        }, 1000);
      } else if (selectedCard.length === 2 && !this.checkBlack(this.cardSuit)) {
        setTimeout(async () => {
          this.flipBackCards();
          await this.delay(500);
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          this.selectedCard = [];
          this.cardSuit = [];
          this.nextStation.play();
          await this.delay(1500);
          this.randStation.play();
        }, 1000);
      } else if (selectedCard.length === 3 && !this.checkRed(this.cardSuit)) {
        setTimeout(async () => {
          this.flipBackCards();
          await this.delay(500);
          this.distributeDeck();
          this.noShuffles += 1;
          this.gameScore += selectedCard.length * 2;
          this.selectedCard = [];
          this.cardSuit = [];
          this.nextStation.play();
          await this.delay(1500);
          this.randStation.play();
        }, 1000);
      } else {
        console.log("good job");
      }
    },
  },
};
</script>

<style>
#cardSelection {
  display: flex;
  grid-template-columns: repeat(4, 1fr);
  gap: 1em;
  margin-top: 6em;
  justify-content: center;
}

li {
  list-style: none;
  margin-left: 5px;
}

.flip-card {
  size: 100%, 100%;
  border-radius: 1em;
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

.card-grid {
  margin: auto;
  display: contents;
}
.card-facing-up {
  background-color: white;
  z-index: 3;
  transition: none !important;
  transform: none !important;
}
.gameInfo {
  text-align: start;
  color: white;
  width: 15em;
  border-style: inset;
  border-radius: 10px;
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
  text-align: start;
  color: white;
  width: 15em;
  border-style: inset;
  border-radius: 10px;
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
  font-size: 2rem;
  font-weight: bolder;
  padding-top: 2em;
  padding-bottom: 1em;
  width: 100%;
  justify-content: center;
}
.back-button {
  width: 40%;
  color: black;
  margin-bottom: 1%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
  padding: 0.5em 1em;
  z-index: 1;
  background-color: #009e60;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
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
  border: 1px solid rgb(255, 255, 255);
  box-shadow: 0 5px 5px silver, 0 0 5px silver inset;
}
.back-button:active {
  top: 2px;
}

@media (max-width: 850px) {
  .back-button {
    width: 80%;
    height: 60%;
  }

  #cardSelection {
    display: grid;
    grid-template-columns: auto;
    width: 60%;
    margin: auto;
  }

  .rules {
    align-self: left;
    text-align: start;
    color: white;
    width: 80%;
    border-style: inset;
    border-radius: 10px;
    position: static;
    z-index: 100;
  }
  .gameInfo {
    align-self: left;
    text-align: start;
    color: white;
    width: 80%;
    border-style: inset;
    border-radius: 10px;
    position: sticky;
    z-index: 100;
  }
  .card-grid {
    size: auto, auto;
    display: contents;
  }
}
@media (max-width: 450px) {
  #cardSelection {
    display: grid;
    width: 50%;
    margin: auto;
  }

  .rules {
    align-self: left;
    text-align: start;
    text-align: justify left;
    margin: auto;
    color: white;
    width: 80%;
    position: static;
    z-index: 100;
  }
  .gameInfo {
    align-self: right;
    text-align: start;
    margin: auto;
    width: 80%;
    position: sticky;
    z-index: 100;
  }

  .card-grid {
    width: auto;
    display: contents;
  }

  .back-button {
    height: 70%;
  }
}
</style>
