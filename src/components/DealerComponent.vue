<template>
    <header id="dealer_header"></header>
    <div class="scene">
        <!-- 1 -->
        <div class="deck-container">
            <!-- 2 -->

            <div class="card card-back" v-if="!cardIsUp" :style="{ transform: cardIsUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }" @click="flipCard">
                <!-- 3 -->
                <img src="../../public/img/cardback.png" alt="card back" class="card-image" />
            </div>

            <OneCard v-if="topCard && cardIsUp" v-bind:card="topCard" v-bind:key="topCard.value" @click="flipCard"
                class="card card-front">
            </OneCard>
        </div>
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
            cardIsUp: false,
        };
    },
    created() {
        this.cards = this.shuffleCards(deckOfCards);
        this.topCard = this.cards[0];
    },
    methods: {
        flipCard: function () {
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
.scene {
    width: 13.2em;
    height: 20em;
    perspective: 600px; /*fix this*/
    display: flex;
    justify-content: center;
    align-items: center;
}

.deck-container {
    width: 100%;
    height: 100%;
    position:relative;
    transform-style: preserve-3d;
    transition: transform 1s;
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
</style>
