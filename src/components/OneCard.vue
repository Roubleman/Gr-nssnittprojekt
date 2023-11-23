<template>
  
  <div class="card-border" @click="selectedCardTapped">
    <div class="grid-container"></div>
    <p :class="this.isRed() ? 'red': 'black'">
      {{ card.value }}
      <span v-html="'&' + card.suit + ';'" ></span>
    </p>
  </div>
</template>

<script>
import { sockets } from '../../server/sockets';

export default {
  name: "OneCard",
  props: {
    card: Object,
  },
  data: function () {
    return {};
  },

  methods: {
    isRed: function () {
      if (this.card.suit == "hearts" || this.card.suit == "diams") {
        return true;
      } else {
        return false;
      }
    },
    selectedCardTapped: function () {
      this.$emit("selectedCard", this.card)
    },
  },
};
</script>

<style>
.card-border {
  height: var(--card-width);
  width: calc(var(--card-width)*0.66);
  border: 0.17em solid black;
  border-radius: 0.625em;
  cursor: pointer;
}

.grid-container { 
  display: grid;
}

.red {
  color: red;
}
.black {
  color: black;
}
</style>
