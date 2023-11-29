<template>
    <h1>It's your turn! Guess a Card</h1>
    <section id="cardSelection">




        <div class="card-grid">
            <div v-for="(group, value) in cardGroups" :key="value">
                <OneCard v-for="(card, index) in group" :card="card" :key="card.suit"
                    :style="{ transform: `translateY(${index * -155}px)` }" v-on:selectedCard="selectCard($event)"
                    :class="{ 'selected-card': isSelected(card) }" width="8em" height="8em" class="no-selection"></OneCard>

            </div>
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

            deckOfCards, // Two rows of cards
            selectedCard: [],
        };
    },
    props: {
        isPlayerTurn: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        selectCard(card) {
            this.selectedCard.push(card);
            console.log(this.selectedCard);



        },
        isSelected(card) {
            return this.selectedCard.some(c => c.value === card.value && c.suit === card.suit);
        },

    }
    ,
    computed: {
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
    grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
    gap: 1em;
    justify-content: center;
    --card-width: 8em;
    margin-left: 2em;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1em;
    row-gap: -10em;
}

.card-grid>* {
    position: relative;


}

.selected-card {
    background-color: grey;
}
</style>
