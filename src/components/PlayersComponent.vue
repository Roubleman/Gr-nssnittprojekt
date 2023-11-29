<template>
    <h1>It's your turn! Guess a Card</h1>
    <section id="cardSelection">
        <div class="card-grid">
            <div v-for="(group, value) in cardGroups" :key="value">
                <OneCard v-for="(card, index) in group" :card="card" :key="card.suit"
                    :style="{ transform: `translateY(${index * -155}px)` }" v-on:selectedCard="cardIsSelected($event)"
                    width="8em" height="8em" class="no-selection">
                </OneCard>
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
        cardIsSelected(card) {
            return this.selectedCard.some(c => c.value === card.value && c.suit === card.suit);

        },
        toggleCardSelection(card) {
            const index = this.selectedCard.findIndex(c => c.value === card.value && c.suit === card.suit);
            if (index !== -1) {
                this.selectedCard.splice(index, 1);
            } else {
                this.selectedCard.push(card);
            }
        }
    },
    computed: {


    },
}

</script>
<style>
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

card.selected {
    background-color: grey;
}
</style>
