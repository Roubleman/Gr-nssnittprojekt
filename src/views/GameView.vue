<template>
  <header id="header-style">Cards</header>

  <section class="card-flex">
    <OneCard
      v-for="card in this.playingCards"
      v-bind:card="card"
      v-bind:key="card.value"
      v-on:selectedCard="cardIsSelected($event)"
      width="8em"
      height="8em"
      class="no-selection"
    >
    </OneCard>
  </section>
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import testCards from "@/assets/testCards.json";

export default {
  name: "GameView",
  components: {
    OneCard,
  },

  data: function () {
    return {
      playingCards: testCards,
      selectedCard: {},
    };
  },

  methods: {
    cardIsSelected: function (event) {
      this.selectedCard = event;
      console.log(this.selectedCard);
    },
  },
};
</script>

<style>
#header-style {
  font-size: 1.5rem;
  font-weight: bolder;
  padding-top: 2em;
  padding-bottom: 1em;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.no-selection {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

.card-flex {
  display: flex;
  width: 100%;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 1em 0.7em;
  padding: 1em;
}

.card-flex {
  --card-width: 8em;
}
</style>
