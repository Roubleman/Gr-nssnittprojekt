<template>
    <!--<div class="yourturn">
        <p>It's your turn!</p>
        <button @click="showPopup = false">Close</button>
    </div>-->
    <h1>Your turn</h1>
    <section id="cardSelection">

        <div class="card-grid">

            <OneCard v-for="card in cards" :card="card" :key="card.suit + card.value"
                :style="{ 'grid-row-start': getRow(card.value), 'grid-column-start': getColumn(card.value), 'z-index': getZIndex(card.suit) }"
                v-on:selectedCard="selectCard($event)"
                :class="{ 'selected-card': isSelected(card), 'blur': isSelected(card) && !isCorrect, 'correct': isSelected(card) && checkCard(card), 'cardsOutOfPlay': cardsOutOfPlay }"
                width="8em" height="8em" class="no-selection"></OneCard>




            <!--
            <div v-for="(group, value) in cardGroups" :key="value">
                <OneCard v-for="(card, index) in group" :card="card" :key="card.suit"
                    :style="{ transform: `translateY(${index * -155}px)` }" v-on:selectedCard="selectCard($event)"
                    :class="{ 'selected-card': isSelected(card) }" width="8em" height="8em" class="no-selection"></OneCard>

            </div>
            -->
        </div>

    </section>
    <div v-if="showPopup" class="popup">
        <p>You selected the correct card!</p>
        <button @click="showPopup = false">Close</button>
    </div>
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
            cardsOutOfPlay: [{ "value": "7", "suit": "spades" }],
            showPopup: false,
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
    computed: {
        isCorrect() {
            return this.selectedCard && this.selectedCard.value === this.correctvalue;
        },

        /*
                cardGroups() {
                    return this.deckOfCards.reduce((groups, card) => {
                        if (!groups[card.value]) {
                            groups[card.value] = [];
                        }
                        groups[card.value].push(card);
                        return groups;
        
                    }, {});
                },*/
    },
    methods: {
        selectCard(card) {

            this.selectedCard = card;
            if (!this.isCorrect) {
                console.log("Wrong Card");
            } else {
                this.cardsOutOfPlay.push(card);
                this.showPopup = true;
                console.log(this.cardsOutOfPlay);
            }


        },
        checkCard(card) {
            return card.value === this.correctvalue;
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
</style>
