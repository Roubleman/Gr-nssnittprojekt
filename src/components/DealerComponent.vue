<template>
  <header id="dealer_header"> </header>

  <div class="scene">
    <div> 
      <OneCard
      v-for="card in guessedCardTestList"
      class="card-facing-up"
      :key="card.suit + card.value"
      style="cursor: default;"
      />
    </div>
    <button class="dealer-button" @click="emitHigherLower" v-if="higherLower">
      {{ uiLabels.lower }}
    </button>
    <!-- Got help from mr GPT-3.5 -->
    <vue-flip
      active-click
      class="flip-card"
      :width="cardWidth"
      :height="cardHeight"
    >
      <!-- This is the back side of the card -->
      <template v-slot:front class="card">
        <img
          src="/img/cardback.png"
          alt="Front of the card"
          class="card-image"
        />
      </template>
      <!-- This is the front side of the card -->
      <template v-slot:back class="card">
        <OneCard
          class="card-facing-up"
          v-bind:card="playingCards[currentCardIndex]"
        />
      </template>
    </vue-flip>
    <button class="dealer-button" @click="emitHigherLower" v-if="higherLower">
      {{ uiLabels.higher }}
    </button>
  </div>
</template>

<script>
import { sockets } from "../../server/sockets";
import OneCard from "../components/OneCard.vue";
import { VueFlip } from "vue-flip";

export default {
  props: {
    playingCards: Array,
    currentCardIndex: Number,
    higherLower: Boolean,
    uiLabels: Object,
    guessedCard: Object,
  },
  components: {
    OneCard,
    "vue-flip": VueFlip,
  },
  data () {
    return {
      guessedCardTestList: [{
        "value": "2",
        "suit": "hearts",
        "points": 2
      }],
    }
  },

  methods: {
    emitHigherLower() {
      this.$emit("dealerCheck");
    },
  },

  data() {
    return {
      cards: [],
      topCard: null,
      cardWidth: "13.2em",
      cardHeight: "20em",
    };
  },
};
</script>

<style scoped>
.scene {
  display: flex;
  justify-content: center;
  align-items: center;
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

.dealer-button {
  height: 4em;
  width: 10em;
  margin-left: 5em;
  margin-right: 5em;
  border-radius: 1.2em;
  border-color: rgb(193, 220, 224);
  cursor: pointer;
  background-color: rgb(73, 114, 73);
}

.card-image {
  border: 0.08em solid black;
  border-radius: 0.5em;
  cursor: pointer;
  height: inherit;
  width: inherit;
}

.grid-container {
  width: 100%;
  height: 100%;
}

#dealer_header {
  font-size: inherit;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 3em;
}

.flip-card {
  width: 100%;
  height: 100%;
  border: 0.08em solid black;
  border-radius: 0.5em;
  background-image: url("../../public/img/cardback.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  z-index: 1;
}

.card-facing-up {
  cursor: pointer;
  background-color: white;
  z-index: 3;
  transition: none !important;
  transform: none !important;
  height: 100% !important;
  width: 100% !important;
}
</style>
