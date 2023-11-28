<template>
    <header id="player_header"> Your turn!</header>
    <div class="player">
        <OneCard :card="currentCard" width="8em" height="8em" />
        <button @click="guess('higher')">Higher</button>
        <button @click="guess('lower')">Lower</button>
    </div>
</template>
  
<script>
import OneCard from "@/components/OneCard.vue";

export default {
    name: "Player",
    components: {
        OneCard,
    },
    props: {
        currentCard: {
            type: Object,
            required: true,
        },
    },
    methods: {
        guess(direction) {
            this.$emit('guess', direction);
        },
    },
};
</script>
<style>
#player_header {
    background-color: beige;
    margin-bottom: 3em;
}
</style>