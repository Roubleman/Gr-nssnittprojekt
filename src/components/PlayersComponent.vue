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
                :class="{ 'selected': selectedCard === card, 'blur': shouldBlur && card === firstGuessedCard, 'selected-card': cardsOutOfPlay.includes(card) }"
                width="8em" height="8em" class="no-selection">

            </OneCard>




        </div>

    </section>
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
            cardsOutOfPlay: [],
            wrongGuesses: 0,
            popup: {
                isVisible: false,
                message: '',
                type: ''
            },
            gameResult: null,
            firstGuessedCard: null,
            isConfirmed: false,
            shouldBlur: false,
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

    },
    methods: {
        selectCard(card) {
            if (this.wrongGuesses >= 2 || this.gameResult === 'win' || this.gameResult === 'lose') {
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
                    this.showPopup('wrong', 'You selected the wrong card! One more chance');
                    this.isConfirmed = false;
                    this.shouldBlur = true;
                    this.firstGuessedCard = this.selectedCard

                    this.wrongGuesses++;
                    if (this.wrongGuesses >= 2) {
                        this.gameResult = 'lose'
                        this.firstGuessedCard = null;
                        console.log(this.gameResult);
                        this.showPopup('lose', 'You lose!');


                    }
                } else {
                    this.cardsOutOfPlay.push(this.selectedCard);
                    this.showPopup('correct', 'You selected the correct card!');
                    this.gameResult = 'win'
                    this.selectedCard = null;
                    this.firstGuessedCard = null;


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
            return card.value === this.correctvalue;

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

};


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

#confirm-button {
    background-color: #4CAF50;
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

.selected {
    border: 2px solid red;
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
