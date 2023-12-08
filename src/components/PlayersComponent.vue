<template>
  <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->

  <!-- The skeleton code of this Onecard is provided by chat gpt 3.5 -->
  <div class="card-flex">
    <OneCard v-for="card in displayableDeck" :card="card" :key="card.suit + card.value" :isClickable="isGuesser"
      v-on:selectedCard="selectCard($event)" :class="{
        selected: selectedCard === card,
        blur: shouldBlur && card === firstGuessedCard,
        'selected-card': cardsOutOfPlay.includes(card),
      }" width="8em" height="8em" class="no-selection">
    </OneCard>


    <!-- HÄR FYLLER VI I HUR MÅNGA KORT KVAR -->
  </div>


  <section>
    <button @click="confirmSelection(card)" id="confirm-button">Confirm</button>
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
  },
  components: {
    OneCard,
  },
  data() {
    return {
      selectedCard: [],
      correctvalue: "2",
      cardsOutOfPlay: [],
      stackIndices: {},
      wrongGuesses: 0,
      popup: {
        isVisible: false,
        message: {},
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
      return this.selectedCard && this.selectedCard.value === this.correctvalue;
    },
    styledPlayingCards() {
      return this.playingCards.map((card) => {
        const randomZIndex = Math.floor(Math.random() * 4) + 1;
        return {
          ...card,
          zIndex: randomZIndex,
        };
      });
    },
  },
  methods: {
    selectCard(card) {
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
          this.showPopup(this.uiLabels.wrongGuessPopup);
          this.isConfirmed = false;
          this.shouldBlur = true;
          this.firstGuessedCard = this.selectedCard;


          this.wrongGuesses++;
          if (this.wrongGuesses >= 2) {
            this.gameResult = "lose";
            this.firstGuessedCard = null;
            console.log(this.gameResult);
            this.showPopup(this.uiLabels.losePopup);
          }
        } else {
          this.cardsOutOfPlay.push(this.selectedCard); //change so that cardsoutofplay is slice of cardindex to current card in deck.
          this.showPopup(this.uiLabels.winPopup);
          this.gameResult = "win";
          this.selectedCard = null;
          this.firstGuessedCard = null;
        }
      } else {
        console.log("No card selected");
      }
    },
    showPopup(message) {
      this.popup.isVisible = true;
      this.popup.message = message;
    },
    closePopup() {
      this.popup.isVisible = false;
    },
    checkCard(card) {
      return card.value === this.correctvalue;
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
  justify-content: flex-start;
  gap: 1em 0.7em;
  padding: 1em;
  --card-height: 8em;
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





.card-border {
  background-color: lightgray;
  border: 2px dotted grey;
}


.OneCard {
  position: absolute;
}
</style>