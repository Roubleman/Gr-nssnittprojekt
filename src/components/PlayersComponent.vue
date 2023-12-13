<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->

  <div>
    <div v-if="this.dealerChecked && this.isGuesser">
      <p>{{ guessComparison }}</p>
    </div>
  </div>

  <div class="card-flex">
    <section
      v-for="value in graphicDeck"
      :key="value.value"
      style="position: relative"
    >
      <template v-for="card in value.cards" :key="card.suit + card.value">
        <OneCard
          v-if="card.isVisible"
          :card="card"
          :isClickable="isGuesser && canSelectCard"
          :cardHeight="8"
          v-on:selectedCard="selectCard($event)"
          :class="{
            selected: isGuesser && selectedCard === card,
            blur:
              shouldBlur && isGuesser && card.value === wrongGuessedCard?.value,
            'selected-card': cardsOutOfPlay.includes(card),
          }"
          class="no-selection OneCard"
        >
        </OneCard>
      </template>
    </section>
  </div>

  <section>
    <button
      v-if="isGuesser && !isConfirmed && canSelectCard"
      @click="confirmSelection(card)"
      id="confirm-button"
    >
      Confirm
    </button>
  </section>
  <div v-if="popup.isVisible" class="popup" :class="popup.type">
    <p>{{ popup.message }}</p>
    <button @click="closePopup">Close</button>
  </div>
  <div v-if="DisplayPopup.isVisible" class="popup" :class="DisplayPopup.type">
    <p>{{ DisplayPopup.message }}, {{ guessComparison }}</p>
    <button @click="closePopup">Close</button>
  </div>
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import displayableDeck from "@/assets/playerComponentDeck.json";
import { sockets } from "../../server/sockets";

export default {
  name: "Player",
  props: {
    isGuesser: Boolean,
    playingCards: Array,
    currentCardIndex: Number,
    uiLabels: Object,
    guessedCard: Object,
    graphicDeck: Array,
    dealerChecked: Boolean,
  },
  components: {
    OneCard,
  },
  data() {
    return {
      selectedCard: [],
      cardsOutOfPlay: [],
      stackIndices: {},
      popup: {
        isVisible: false,
        message: "",
        type: "",
      },
      gameResult: null,
      firstGuessedCard: null,
      isConfirmed: false,
      shouldBlur: false,
      displayableDeck: displayableDeck,
      canSelectCard: true,
      wrongGuessedCard: 0,
    };
  },

  computed: {
    isCorrect() {
      return (
        this.selectedCard &&
        this.selectedCard.points ===
          this.playingCards[this.currentCardIndex].points
      );
    },
    DisplayPopup() {
      if (this.dealerChecked && this.isGuesser) {
        const popupData = {
          isVisible: true,
          type: "wrongGuess",
          message: this.uiLabels.wrongGuessPopup,
        };
        this.showPopup(popupData.type, popupData.message);
        this.$emit("popupShown");
        return popupData;
      } else {
        return {
          isVisible: false,
          type: "",
          message: "",
        };
      }
    },
    guessComparison() {
      const currentCardPoints = this.playingCards[this.currentCardIndex].points;
      const selectedCardPoints = this.wrongGuessedCard
        ? this.wrongGuessedCard.points
        : 0;

      if (selectedCardPoints > currentCardPoints) {
        return this.uiLabels.guessLower;
      } else if (selectedCardPoints < currentCardPoints) {
        return this.uiLabels.guessHigher;
      } else if (selectedCardPoints === currentCardPoints) {
        return this.uiLabels.guessWasCorrect;
      }
    },
  },

  methods: {
    selectCard(card) {
      console.log(
        "Current cardIndex is",
        this.playingCards[this.currentCardIndex].points
      );
      console.log("points of cardinex is", card.points);
      this.selectedCard = card;
    },

    removeSuits(card) {
      return {
        suit: "",
        value: card.value,
        points: card.points,
      };
    },
    confirmSelection() {
      if (this.selectedCard) {
        this.isConfirmed = true;
        console.log("Confirmed selection:", this.selectedCard);

        if (!this.isCorrect) {
          this.gameResult = "wrongGuess";
          this.shouldBlur = true;
          this.wrongGuessedCard = this.removeSuits(this.selectedCard);
          this.handleGameResult({
            result: "wrongGuess",
            wrongGuessedCard: this.selectedCard,
          });
          this.canSelectCard = false;
        } else {
          this.cardsOutOfPlay = this.graphicDeck.slice(
            // Borde det inte vara playingCards istället?? MVH Elias
            0,
            this.currentCardIndex + 1
          ); //change so that cardsoutofplay is slice of cardindex to current card in deck.
          console.log("Cards out of play:", this.cardsOutOfPlay);

          this.gameResult = "correctguess";
          this.selectedCard = null;
          this.wrongGuessedCard = null;
          this.handleGameResult({ result: "correctGuess" });
          this.selectedCard = [];
          this.canSelectCard = true;
        }
      } else {
        console.log("No card selected");
      }
    },
    showPopup(type, message) {
      this.popup.isVisible = true;
      this.popup.type = type;
      this.popup.message = message;
    },
    closePopup() {
      this.popup.isVisible = false;
      this.DisplayPopup.isVisible = false;
      this.canSelectCard = true;
      this.isGuesser = true;
    },
    checkCard(card) {
      return card.points === this.currentCardIndex.points;
    },
    newRoundReceived() {
      //
      this.$emit("newRoundReceived");
    },

    handleGameResult(data) {
      if (data.result === "wrongGuess") {
        this.$emit("wrongGuess", { card: data.wrongGuessedCard });
        this.shouldBlur = true;
        this.isConfirmed = false;
        this.selectedCard = [];
      } else if (data.result === "correctGuess") {
        this.$emit("correctGuess");
        this.isConfirmed = false;
        this.selectedCard = null;
        this.wrongGuessedCard = null;
        this.canSelectCard = true;
      }
    },
  },
};
</script>
<style scoped>
.selected-card {
  background-color: white;
  border: 0.07em solid rgb(95, 95, 95);
  border-radius: 0.4em;
  cursor: pointer;
  transition: transform 0.6s ease;
  background-color: white;
  filter: none;
}

#confirm-button {
  background-color: #4caf50;
  border: 2px solid black;
  color: black;
  padding: 0.5em 0.5em;
  text-align: center;
  display: inline-block;
  font-size: 1em;
  margin: 2px;
  cursor: pointer;
  transition-duration: 0.4s;
}

.card-flex {
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  gap: 1em 0.7em;
  padding: 1em;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.selected {
  border: 2px solid red;
}

.blur {
  filter: blur(2px);
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

#cardSelection {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1em;
  position: relative;
  margin-left: 10em;
  width: calc(100% - 20em);
}

.OneCard:hover {
  transform: none;
}
.OneCard:nth-child(1) {
  translate: 0 0;
  z-index: 1;
}

.OneCard:nth-child(2) {
  translate: 0 -6em;
  z-index: 2;
}

.OneCard:nth-child(3) {
  translate: 0 -12em;
  z-index: 3;
}

.OneCard:nth-child(4) {
  translate: 0 -18em;
  z-index: 4;
}
</style>
