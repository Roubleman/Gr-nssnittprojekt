<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->

  <div v-if="isGuesser && this.displayButtonClosed">
    <p>{{ guessComparison }}</p>
  </div>
  <div class="card-flex" :style="sectionHeight">
    <section
      v-for="value in graphicDeck"
      :key="value.value"
      style="height: var(--card-section-height)"
    >
      <TransitionGroup name="fade-bounce" mode="out-in">
        <div v-for="card in value.cards" :key="card.suit + card.value">
          <OneCard
            :card="card"
            v-if="card.isVisible"
            :isClickable="
              isGuesser &&
              canSelectCard &&
              !this.waitingForDealer &&
              !card.isBlurred
            "
            :cardHeight="this.cardSize"
            v-on:selectedCard="selectCard($event)"
            :class="{
              selected: isGuesser && selectedCard === card,
              blur:
                shouldBlur &&
                isGuesser &&
                card.value === wrongGuessedCard?.value,
              blurComparison: card.isBlurred,
            }"
            class="no-selection OneCard"
          />
        </div>
      </TransitionGroup>
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
  <div v-if="displayPopup.isVisible" class="popup" :class="displayPopup.type">
    <p>{{ displayPopup.message }} {{ guessComparison }}</p>
    <button @click="closePopup">Close</button>
  </div>
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import displayableDeck from "@/assets/playerComponentDeck.json";
import { TransitionGroup } from "vue";

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
    newRound: Boolean,
    cardSectionHeight: Number,
  },
  components: {
    OneCard,
    TransitionGroup,
  },
  data() {
    return {
      selectedCard: [],
      stackIndices: {},
      gameResult: null,
      isConfirmed: false,
      shouldBlur: false,
      displayableDeck: displayableDeck,
      canSelectCard: true,
      wrongGuessedCard: null,
      displayButtonClosed: false,
      waitingForDealer: false,
      cardSize: 8,
    };
  },
  updated() {
    if (this.newRound) {
      this.handleNewRound();
    }
  },
  computed: {
    newRoundReceived() {
      this.resetRound();
      this.$emit("newRoundReceived");
    },

    isCorrect() {
      return (
        this.selectedCard &&
        this.selectedCard.points ===
          this.playingCards[this.currentCardIndex].points
      );
    },
    displayPopup() {
      const popupData = {
        isVisible: false,
        type: "wrongGuess",
        message: this.uiLabels.wrongGuessPopup,
      };
      console.log(
        "dealerChecked, isGuesser: ",
        this.dealerChecked,
        this.isGuesser
      );
      if (this.dealerChecked && this.isGuesser) {
        popupData.isVisible = true;
      } else {
        popupData.isVisible = false;
      }

      return popupData;
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

    sectionHeight() {
      return { "--card-section-height": this.cardSectionHeight + "em" };
    },
  },

  beforeMount: function () {
    window.screen.width < 800 ? (this.cardHeight = 5) : (this.cardHeight = 8);
  },

  methods: {
    selectCard(card) {
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
        this.waitingForDealer = true;

        if (!this.isCorrect) {
          this.gameResult = "wrongGuess";
          this.shouldBlur = true;
          this.wrongGuessedCard = this.removeSuits(this.selectedCard);
          this.handleGameResult({
            result: "wrongGuess",
            wrongGuessedCard: this.selectedCard,
          });
        } else {
          this.gameResult = "correctguess";
          this.selectedCard = null;
          this.wrongGuessedCard = null;
          this.handleGameResult({ result: "correctGuess" });
        }
      } else {
        console.log("No card selected");
      }
    },
    closePopup() {
      this.canSelectCard = true;
      this.displayButtonClosed = true;
      this.blurCardsBasedOnComparison();
      this.waitingForDealer = false;
      this.$emit("popUpShown");
    },
    checkCard(card) {
      return card.points === this.currentCardIndex.points;
    },
    newRoundReceived() {
      this.$emit("newRoundReceived");
    },
    blurCardsBasedOnComparison() {
      const currentCardPoints = this.playingCards[this.currentCardIndex].points;

      // Determine whether to blur higher or lower cards
      const shouldBlurHigher =
        this.guessComparison === this.uiLabels.guessLower;
      const shouldBlurLower =
        this.guessComparison === this.uiLabels.guessHigher;

      // Apply blur to cards based on the comparison
      this.graphicDeck.forEach((value) => {
        value.cards.forEach((card) => {
          if (card.isVisible && card.points !== currentCardPoints) {
            card.isBlurred = false;
            if (
              shouldBlurHigher &&
              card.points >= this.wrongGuessedCard.points
            ) {
              card.isBlurred = true;
            }

            // Blur lower cards
            if (
              shouldBlurLower &&
              card.points <= this.wrongGuessedCard.points
            ) {
              card.isBlurred = true;
            }
          }
        });
      });
    },
    handleGameResult(data) {
      if (data.result === "wrongGuess") {
        this.$emit("wrongGuess", { card: data.wrongGuessedCard });
        this.shouldBlur = true;
        this.isConfirmed = false;
        this.selectedCard = null;
      } else if (data.result === "correctGuess") {
        this.$emit("correctGuess");
        // this.DisplayPopup.isVisible = false;
        this.isConfirmed = false;
        this.selectedCard = null;
        this.wrongGuessedCard = null;
      }
    },
    resetRound() {
      this.gameResult = null;
      this.isConfirmed = false;
      this.shouldBlur = false;
      this.canSelectCard = true;
      this.wrongGuessedCard = null;
      this.displayButtonClosed = false;
      this.waitingForDealer = false;
      this.selectedCard = null;
      //Reset blurcomparison
      this.graphicDeck.forEach((value) => {
        value.cards.forEach((card) => {
          card.isBlurred = false;
        });
      });
    },
    handleNewRound() {
      this.resetRound();
      this.$emit("newRoundReceived");
    },
  },
};
</script>
<style scoped>
#confirm-button {
  background-color: #4caf50;
  border: 2px solid black;
  border-radius: 3px;
  color: black;
  padding: 0.5em 0.5em;
  text-align: center;
  display: inline-block;
  font-size: 1em;
  margin: 2px;
  cursor: pointer;
  transition-duration: 0.4s;
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
}
#confirm-button:hover {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.3);
}

.card-flex {
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  gap: 1em 0.7em;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

.fade-bounce-enter-active {
  animation: fade-bounce 1s ease-in-out;
  position: relative;
}
.fade-bounce-leave-active {
  animation: fade-bounce 1s ease-in-out reverse;
  position: absolute;
}

@keyframes fade-bounce {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.selected {
  border: 2px solid red;
}

.blur {
  filter: blur(2px);
}
.blurComparison {
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

.OneCard:nth-child(1) {
  transform: translate(0, 0);
}

.OneCard:nth-child(2) {
  transform: translate(0, -6em);
}

.OneCard:nth-child(3) {
  transform: translate(0, -12em);
}
.OneCard:nth-child(4) {
  transform: translate(0, -18em);
}
@media screen and (max-width: 50em) {
  /* VILL GÖRA RESPONSIVE NAV(isch) HÄR?? för mer clean interface*/
}
</style>
