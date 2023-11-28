<template>
    <h1>It's your turn! Guess a Card</h1>
    <section id="cardSelection">


        <OneCard v-for="card in everyFourthCard" v-bind:card="card" v-bind:key="card.value"
            v-on:selectedCard="cardIsSelected($event)" width="8em" height="8em" class="no-selection">
        </OneCard>
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

            deckOfCards // Two rows of cards
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
            this.$emit("selectedCard", card);
            console.log(card);
        },
    },
    computed: {
        everyFourthCard() {
            return this.deckOfCards.filter((card, index) => index % 4 === 0);
        },
    }
}
</script>
<style>
#cardSelection {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
    grid-auto-rows: var(--card-width);
    gap: 1em;
    justify-content: center;
    --card-width: 8em;
    margin-left: 2em;

}
</style>
