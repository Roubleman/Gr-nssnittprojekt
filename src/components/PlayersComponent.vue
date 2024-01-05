<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->

  <section>
    <button
      v-if="isGuesser && !isConfirmed && canSelectCard"
      @click="confirmSelection(card)"
      id="confirm-button"
    >
      Confirm
    </button>
  </section>

  <div v-if="isGuesser && this.displayButtonClosed">
    <p>{{ guessComparison }}</p>
  </div>
  <div class="card-flex" :style="dynamicCSS">
    <section
      v-for="value in visibleCards"
      :key="value.value"
      :style="{
        height: calculatedCardSectionHeight(value.cards),
      }"
    >
      <TransitionGroup name="fade-bounce" mode="out-in">
        <div v-for="(card, index) in value.cards" :key="card.suit + card.value">
          <OneCard
            :card="card"
            :isClickable="
              isGuesser &&
              canSelectCard &&
              !this.waitingForDealer &&
              !card.isBlurred
            "
            :cardHeight="this.cardSize"
            v-on:selectedCard="selectCard($event)"
            :class="[
              {
                selected: isGuesser && selectedCard === card,
                blur:
                  shouldBlur &&
                  isGuesser &&
                  card.value === wrongGuessedCard?.value,
                blurComparison: card.isBlurred,
              },

              OneCardPlacementY(index),
              changeCardSize(),
            ]"
            class="no-selection OneCard"
          />
        </div>
      </TransitionGroup>
    </section>
  </div>

  <div v-if="displayPopup.isVisible" class="popup" :class="displayPopup.type">
    <p>{{ displayPopup.message }} {{ guessComparison }}</p>
    <button @click="closePopup">Close</button>
  </div>
  <div
    v-if="waitingPopup && secondGuess"
    class="popup"
    :class="{ waiting: true }"
  >
    <p>{{ uiLabels.waitingForDealer }}</p>
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
    secondGuess: Boolean,
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
      waitingPopup: false,
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

      if (this.dealerChecked && this.isGuesser) {
        popupData.isVisible = true;
        this.waitingPopup = false;
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

    /*sectionHeight() {
      return { "--card-section-height": this.cardSectionHeight + "em" };
    },*/

    visibleCards() {
      return this.graphicDeck.map((value) => ({
        ...value,
        cards: value.cards.filter((card) => card.isVisible),
      }));
    },

    dynamicCSS() {
      let cardSize = this.cardSize;
      let cardSectionHeight_Multiplier = 1;
      if (cardSize < 8) {
        cardSectionHeight_Multiplier = 0.65;
      }
      return {
        "--first-Y-translation": -1 * this.cardSize * 0.75 + "em",
        "--second-Y-translation": -1 * this.cardSize * 1.5 + "em",
        "--third-Y-translation": -1 * this.cardSize * 2.25 + "em",
        "--card-section-height":
          this.cardSectionHeight * cardSectionHeight_Multiplier + "em",
        "--column-gap": this.cardSize * 0.0875 + "em",
      };
    },
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
        this.waitingPopup = true;
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
      this.waitingPopup = false;
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

    OneCardPlacementY(index) {
      switch (index) {
        case 0:
          return "first-card-OneCard";
        case 1:
          return "second-card-OneCard";
        case 2:
          return "third-card-OneCard";
        case 3:
          return "fourth-card-OneCard";
      }
    },

    changeCardSize() {
      this.cardSize = window.innerWidth < 800 ? 5.5 : 8;
    },

    calculatedCardSectionHeight(cards) {
      let sectionHeightStartValue = this.cardSize + 1;

      if (cards.length === 1) {
        return sectionHeightStartValue + "em";
      }
      if (cards.length === 2) {
        return sectionHeightStartValue + 2 + "em";
      }
      if (cards.length === 3) {
        return sectionHeightStartValue + 4 + "em";
      }
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
  position: sticky;
  margin-bottom: 0.5em;
}
#confirm-button:hover {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.3);
}

.card-flex {
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  column-gap: var(--column-gap);
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
@keyframes fade-bounce-leave {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
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
  outline: 2px solid red;
}

.blur {
  filter: blur(2px) brightness(70%);
  transition: filter 0.3s;
  border: 2px solid red;
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

.waitingPopup {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 10px;
  z-index: 1000;
  text-align: center;
}

.first-card-OneCard {
  transform: translate(0, 0);
}

.second-card-OneCard {
  transform: translate(0, var(--first-Y-translation));
}

.third-card-OneCard {
  transform: translate(0, var(--second-Y-translation));
}

.fourth-card-OneCard {
  transform: translate(0, var(--third-Y-translation));
}
</style>
