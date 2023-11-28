<template>
    <h1>Your turn!</h1>
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
            isPlayerTurn: true,
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
    display: flex;
    flex-direction: row;
    justify-content: center;
    --card-width: 8em;
}
</style>

#cardSelection {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}