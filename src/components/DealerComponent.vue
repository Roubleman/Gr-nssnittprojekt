<template>
    <header id="dealer_header"></header>
    <section class="dealer-stack">
        <div class="top-card" id="card_back" v-if="cardIsUp===false" @click="flipCard">
            Fuck you Dealer.
            <br>
            Swap me for a picture :)
        </div>

        <OneCard 
        v-if="topCard && cardIsUp"
        v-bind:card="topCard"
        v-bind:key="topCard.value"
        @click="flipCard"
        class="top-card">
        </OneCard>
    </section>
</template>

<script>
import { sockets } from "../../server/sockets";
import deckOfCards from '@/assets/DeckOfCards.json'
import OneCard from '../components/OneCard.vue'

export default {
    components: {
        OneCard
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
.top-card {
width: 20em;
height: 30em;
}

#card_back {
    background-color: aquamarine;
    color:black;
    text-align: center;
    cursor:pointer;
}

.dealer-stack{
    width: 20em;
    color: white;
}
.dealer-stack .grid-container {
    width: 100%;
    height: 100%;
}

#dealer_header {
    background-color: beige;
    margin-bottom: 3em;
}
</style>