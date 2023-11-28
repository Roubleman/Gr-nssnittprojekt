<template>
    <header id="dealer_header"> You are the Dealer!</header>
    <section class="dealer-stack">

        <OneCard 
        v-if="topCard"
        v-bind:card="topCard"
        v-bind:key="topCard.value"
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
        };
    },
    created() {
        this.cards = this.shuffleCards(deckOfCards);
        this.topCard = this.cards[0];
    },
    methods: {
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

.dealer-stack {
    width: 20em;
    color: white;
}

#dealer_header {
    background-color: beige;
    margin-bottom: 3em;
}
</style>