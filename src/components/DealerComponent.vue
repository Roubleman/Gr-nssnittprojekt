<template>
  <header id="dealer_header"></header>

  <div class="deck-container">

    <div class="top-card backside-border" v-if="!cardIsUp" @click="flipCard">
      <img src="../../public/img/cardback.png" alt="card back" id="card_back" />
    </div>

        <OneCard 
        v-if="topCard && cardIsUp"
        v-bind:card="topCard"
        v-bind:key="topCard.value"
        @click="flipCard"
        class="top-card">
        </OneCard>
    </div>
</template>

<script>
import { sockets } from "../../server/sockets";
import deckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "../components/OneCard.vue";

export default {
  components: {
    OneCard,
  },

    data() {
        return {
            cards: [],
            topCard: null,
            cardIsUp: false,
        };
    },
    created() {
        this.cards = this.shuffleCards(deckOfCards);
        this.topCard = this.cards[0];
    },
    methods: {
        flipCard: function() {
            this.cardIsUp = !this.cardIsUp;
            
        },
        shuffleCards: function (deck) {
            const shuffledDeck = [...deck];
            for (let i = shuffledDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
            }
            return shuffledDeck;
        }
    }
}
</script>

<style>
.backside-border {
  border: 0.07em solid black;
  border-radius: 0.4em;
}

.deck-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.top-card {
width: 13.2em;
height: 20em;
}

#card_back {
    background-color: aquamarine;
    color:black;
    text-align: center;
    cursor:pointer;
    height: inherit;
    width: inherit;
}

.dealer-stack{
    width: 20em;
    color: white;
}

.grid-container {
    width: 100%;
    height: 100%;
}

#dealer_header {
    background-color: beige;
    margin-bottom: 3em;
}
</style>
