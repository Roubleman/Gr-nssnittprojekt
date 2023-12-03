<template>
    <header id="dealer_header"></header>
    <!-- Got help from mr GPT-3.5 -->
    <div class="scene">
        <button :on-click="guessLower" class="guess-button">
            {{ uiLabels.lower }}
        </button>
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
        <button :on-click="guessHigher" class="guess-button">
            {{ uiLabels.higher }}
        </button>
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

    data: function () {
        return {
            lang: localStorage.getItem("lang") || "en",
            uiLabels: {},
            cards: [],
            topCard: null,
            cardWidth: '13.2em',
            cardHeight: '20em',
            isHigher: false,
            isLower: false
        };
    },
    created: function () {
        this.cards = this.shuffleCards(deckOfCards);
        this.topCard = this.cards[0];
        socket.emit("pageLoaded", this.lang);
        socket.on("init", (labels) => {
        this.uiLabels = labels;
    });
    },
    
    methods: {
        shuffleCards: function (deck) {
            const shuffledDeck = [...deck];
            for (let i = shuffledDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
            }
            return shuffledDeck;
        },
        guessLower: function (event) {

        },

        guessHigher: function (event) {

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

.guess-button {
    height: 4em;
    width: 10em;
    margin-left: 5em;
    margin-right: 5em;  
}

.card-image {
    border: 0.08em solid black;
    border-radius: 0.5em;
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
    width: 100%;
    height: 100%;
    border: 0.08em solid black;
    border-radius: 0.5em;
    background-image: url("../../public/img/cardback.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    z-index: 1;
}

.card-facing-up {
    background-color: white;
    z-index: 3;
    transition: none !important;
    transform: none !important;
    height: 100% !important;
    width: 100% !important;
}

</style>
