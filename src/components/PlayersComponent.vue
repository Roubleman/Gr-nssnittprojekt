<template>
    <h1>It's your turn! Guess a Card</h1>
    <section id="cardSelection">

        <div class="card-grid">

            <OneCard v-for="card in cards" :card="card" :key="card.suit + card.value"
                :style="{ 'grid-row-start': getRow(card.value), 'grid-column-start': getColumn(card.value), 'z-index': getZIndex(card.suit) }"
                v-on:selectedCard="selectCard($event)"
                :class="{ 'selected-card': isSelected(card), 'blur': isSelected(card) && !isCorrect }" width="8em"
                height="8em" class="no-selection"></OneCard>




            <!--
            <div v-for="(group, value) in cardGroups" :key="value">
                <OneCard v-for="(card, index) in group" :card="card" :key="card.suit"
                    :style="{ transform: `translateY(${index * -155}px)` }" v-on:selectedCard="selectCard($event)"
                    :class="{ 'selected-card': isSelected(card) }" width="8em" height="8em" class="no-selection"></OneCard>

            </div>
            -->
        </div>

    </section>
</template>
  
<script>
import OneCard from "@/components/OneCard.vue";
import deckOfCards from '@/assets/DeckOfCards.json'

export default {
    name: "Player",
    components: {
        OneCard,

    },
    data() {
        return {

            selectedCard: [],
            cards: [],
            correctvalue: "4",
            correctCards: [],
        };
    },
    props: {
        isPlayerTurn: {
            type: Boolean,
            required: true,
        },
    },

    created() {
        this.cards = (this.shuffleCards(deckOfCards));
    },
    methods: {
        selectCard(card) {

            this.selectedCard = card;
            if (!this.isCorrect) {
                console.log("Wrong Card");
            } else {
                console.log("Correct Card");
                this.correctCards.push(card);
            }


        },
        isSelected(card) {
            return this.selectedCard && this.selectedCard.value === card.value && this.selectedCard.suit === card.suit;
        },
        getColumn(value) {
            const positions = {
                "2": 1,
                "3": 2,
                "4": 3,
                "5": 4,
                "6": 5,
                "7": 6,
                "8": 7,
                "9": 1,
                "10": 2,
                "J": 3,
                "Q": 4,
                "K": 5,
                "A": 6,
            };
            return positions[value];
        },
        getRow(value) {
            const positions = {
                "2": 1,
                "3": 1,
                "4": 1,
                "5": 1,
                "6": 1,
                "7": 1,
                "8": 1,
                "9": 2,
                "10": 2,
                "J": 2,
                "Q": 2,
                "K": 2,
                "A": 2,
            };
            return positions[value];
        },
        shuffleCards: function (deck) {
            const shuffledDeck = [...deck];
            for (let i = shuffledDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
            }
            return shuffledDeck;
        },
        getZIndex(suit) {
            const suits = {
                "hearts": 1,
                "diamonds": 2,
                "clubs": 3,
                "spades": 4,
            };
            return suits[suit];


        },
    },
    computed: {
        isCorrect() {
            return this.selectedCard && this.selectedCard.value === this.correctvalue;
        },

        cardGroups() {
            return this.deckOfCards.reduce((groups, card) => {
                if (!groups[card.value]) {
                    groups[card.value] = [];
                }
                groups[card.value].push(card);
                return groups;

            }, {});
        },
    },
}

</script>
<style scoped>
#cardSelection {
    display: grid;

    grid-template-columns: repeat(11, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 2em;
    position: relative;
    margin-left: 10em;

}

.card-grid {
    display: contents;
}

.card-border {
    background-color: lightgray;
    border: 2px dotted grey;
}

.selected-card {
    background-color: white;
    border: 0.07em solid rgb(95, 95, 95);
    border-radius: 0.4em;
    cursor: pointer;
    transition: transform 0.6s ease;
    background-color: white;
    filter: none;


}

.OneCard {
    position: absolute;

}

.blur {
    filter: blur(2px);
}
</style>
