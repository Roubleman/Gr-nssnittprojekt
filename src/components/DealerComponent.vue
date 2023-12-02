<template>
    <header id="dealer_header"></header>
    <!-- Got help from mr GPT-3.5 -->
    <div class="scene">
        <vue-flip active-click class="flip-card" :width="cardWidth" :height="cardHeight">
            <!-- This is the back side of the card -->
            <template v-slot:front class="card">
                <img src="../../public/img/cardback.png" alt="Front of the card" class="card-image" />
            </template>
            <!-- This is the front side of the card -->
            <template v-slot:back class="card">
                <OneCard class="card-facing-up" v-bind:card="topCard" v-bind:key="topCard.value" />
            </template>
        </vue-flip>
    </div>
</template>

<script>
import { sockets } from "../../server/sockets";
import deckOfCards from "@/assets/DeckOfCards.json";
import OneCard from "../components/OneCard.vue";
import { VueFlip } from 'vue-flip';

export default {
    components: {
        OneCard,
        'vue-flip': VueFlip
    },

    data() {
        return {
            cards: [],
            topCard: null,
            cardWidth: '13.2em',
            cardHeight: '20em'
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
.scene {
    display: flex;
    justify-content: center;
    align-items: center;
}


.card {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-image {
    border: 0.07em solid black;
    border-radius: 0.4em;
    cursor: pointer;
    height: inherit;
    width: inherit;
}

.grid-container {
    width: 100%;
    height: 100%;
}

#dealer_header {
    background-color: beige;
    margin-bottom: 3em;
}

.flip-card {
    width: inherit;
    height: inherit;
    border: 0.08em solid black;
    border-radius: 0.5em;
    background-image: url("../../public/img/cardback.png");
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 1;
}

.card-facing-up {
    background-color: white;
    z-index: 3;
    transition: none !important;
    transform: none !important;
}

</style>
