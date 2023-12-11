<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->
  <h1>Your turn</h1>
  <div class="card-flex">
    <section v-for="value in graphicDeck" :key="value.value">
      <template v-for="card in value.cards" :key="card.suit + card.value">
        <OneCard v-if="card.isVisible" :card="card" :isClickable="isGuesser" v-on:selectedCard="selectCard($event)"
          :class="{
            selected: selectedCard === card,
            blur: shouldBlur && card === wrongGuessedCard,
            'selected-card': cardsOutOfPlay.includes(card),
          }" width="--card-height" height="--card-height" class="no-selection OneCard">
        </OneCard>
      </template>
    </section>
  </div>

  <section>
    <button v-if="isGuesser" @click="confirmSelection(card)" id="confirm-button">
      Confirm
    </button>
  </section>
  <div v-if="popup.isVisible" class="popup" :class="popup.type">
    <p>{{ popup.message }}</p>
    <button @click="closePopup">Close</button>
  </div>
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import displayableDeck from "@/assets/playerComponentDeck.json";


export default {
  name: "Player",
  props: {
    isGuesser: Boolean,
    playingCards: Array,
    currentCardIndex: Number,
    uiLabels: Object,
    guessedCard: Object,
    graphicDeck: Array,
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
    };
  },


  computed: {
    isCorrect() {
      return this.selectedCard && this.selectedCard.points === this.playingCards[this.currentCardIndex].points;


    },
  },
  methods: {
    selectCard(card) {
      console.log("Current cardIndex is", this.playingCards[this.currentCardIndex].points);
      console.log("points of cardinex is", card.points);
      if (

        this.wrongGuesses >= 2 ||
        this.gameResult === "win" ||
        this.gameResult === "lose"
      ) {
        console.log("Selection already confirmed");
        return;
      }
      if (!this.firstGuessedCard && !this.isCorrect) {
        this.firstGuessedCard = card;
      }
      this.selectedCard = card;
    },


    confirmSelection() {
      if (this.selectedCard) {
        this.isConfirmed = true;
        console.log("Confirmed selection:", this.selectedCard);


        if (!this.isCorrect) {

          this.gameResult = "wrongGuess";
          this.isConfirmed = false;
          this.shouldBlur = true;
          this.wrongGuessedCard = removeSuits(this.selectedCard);
          this.handleGameResult({ result: 'wrongGuess', wrongGuessedCard: this.selectedCard });



          // this.wrongGuesses++;
          // if (this.wrongGuesses >= 2) {
          //   this.gameResult = "lose";
          //   this.wrongGuessedCard = null;
          //   console.log(this.gameResult);
          //   this.showPopup("lose", "You lose!");

        } else {
          this.cardsOutOfPlay = this.graphicDeck.slice(0, this.currentCardIndex + 1); //change so that cardsoutofplay is slice of cardindex to current card in deck.
          console.log("Cards out of play:", this.cardsOutOfPlay);

          this.gameResult = "correctguess";
          this.selectedCard = null;
          this.wrongGuessedCard = null;
          this.handleGameResult({ result: 'correctGuess' });

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
    },
    checkCard(card) {
      return card.points === this.currentCardIndex.points;

    },
    removeSuits(card) {
      return {
        value: card.value,
        points: card.points
      };
    },

    handleGameResult(data) {
      if (data.result === 'wrongGuess') {
        this.$emit("wrongGuess", { card: data.wrongGuessedCard }); //send shadow instead of real card.
        this.showPopup(this.uiLabels.wrongGuessPopup);

      } else if (data.result === 'correctGuess') {
        this.$emit('correctGuess');
        this.showPopup(this.uiLabels.winPopup);
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
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
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
  border: 2px solid red;
}

.blur {
  filter: blur(2px);
}

.correct {
  filter: none;
  background-color: white;
  border: 0.07em solid rgb(95, 95, 95);
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
