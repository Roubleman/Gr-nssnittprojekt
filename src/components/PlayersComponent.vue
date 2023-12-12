<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->
  <div class="card-flex">
    <section v-for="value in graphicDeck" :key="value.value">
      <template v-for="card in value.cards" :key="card.suit + card.value">
        <OneCard
          v-if="card.isVisible"
          :card="card"
          :isClickable="isGuesser && canSelectCard"
          v-on:selectedCard="selectCard($event)"
          :class="{
            selected: selectedCard === card,
            blur: shouldBlur && card.value === wrongGuessedCard?.value,
            'selected-card': cardsOutOfPlay.includes(card),
          }"
          width="--card-height"
          height="--card-height"
          class="no-selection OneCard"
        >
        </OneCard>
      </template>
    </section>
  </div>

  <section>
    <button
      v-if="isGuesser"
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
    <p>{{ DisplayPopup.message }}</p>
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
      wrongGuesses: 0,
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
          this.wrongGuessedCard = this.removeSuits(this.selectedCard);
          this.handleGameResult({
            result: "wrongGuess",
            wrongGuessedCard: this.selectedCard,
          });
          this.canSelectCard = false;
        } else {
          this.cardsOutOfPlay = this.playingCards.slice(
            0,
            this.currentCardIndex + 1
          ); //Ändra så isVisible är true för dessa kort?
          console.log("Cards out of play:", this.cardsOutOfPlay);
          this.gameResult = "correctguess";
          this.handleGameResult({ result: "correctGuess" });
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
    },
    checkCard(card) {
      return card.points === this.currentCardIndex.points;
    },

    handleGameResult(data) {
      if (data.result === "wrongGuess") {
        this.$emit("wrongGuess", { card: data.wrongGuessedCard });
        this.shouldBlur = true;
        this.isConfirmed = false;
      } else if (data.result === "correctGuess") {
        this.$emit("correctGuess");
        this.selectedCard = null;
        this.wrongGuessedCard = null;
      }
    },
  },
};
</script>
<style scoped>
.selected-card {
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
  --card-height: 8em;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.selected {
  border: 2px solid black;
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

.OneCard:nth-child(1) {
  transform: translateY(0);
}

.OneCard:nth-child(2) {
  transform: translateY(-6em);
}

.OneCard:nth-child(3) {
  transform: translateY(-12em);
}

.OneCard:nth-child(4) {
  transform: translateY(-18em);
}
</style>
