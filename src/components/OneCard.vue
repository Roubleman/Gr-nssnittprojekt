<template>
  <div class="card-border" @click="selectedCardTapped">
    <div class="grid-container" :class="this.isRed() ? 'red' : 'black'">
      <section class="card-corner-left">
        <p style="margin-block: 0em">
          {{ card.value }}
        </p>
        <p style="margin-block: -0.3em">
          <span v-html="'&' + card.suit + ';'"></span>
        </p>
      </section>

      <section class="suit-flex" v-if="card.value >= 2 && card.value <= 10">
        <div v-for="(row, i) in cardSuits" :key="i" class="suit-row">
          <span v-for="(suit, j) in row" :key="j">
            <span
              v-html="'&' + this.card.suit + ';'"
              v-if="suit == true"
            ></span>
          </span>
        </div>
      </section>

      <section v-else>
        <span id="ace" v-html="'&' + card.suit + ';'"></span>
      </section>

      <section class="card-corner-right">
        <p style="margin-block: 0em">
          {{ card.value }}
        </p>
        <p style="margin-block: 0em; margin-top: -0.3em">
          <span v-html="'&' + card.suit + ';'"></span>
        </p>
      </section>
    </div>
  </div>
</template>

<script>
import { sockets } from "../../server/sockets";

export default {
  name: "OneCard",
  props: {
    card: Object,
  },
  data: function () {
    return {};
  },

  computed: {
    cardSuits() {
      if (this.card.value == "2") {
        return [
          [false, true, false],
          [false, false, false],
          [false, true, false],
        ];
      }

      if (this.card.value == "3") {
        return [
          [false, true, false],
          [false, true, false],
          [false, true, false],
        ];
      }

      if (this.card.value == "4") {
        return [
          [true, false, true],
          [false, false, false],
          [true, false, true],
        ];
      }

      if (this.card.value == "5") {
        return [
          [true, false, true],
          [false, true, false],
          [true, false, true],
        ];
      }

      if (this.card.value == "6") {
        return [
          [true, false, true],
          [true, false, true],
          [true, false, true],
        ];
      }

      if (this.card.value == "7") {
        return [
          [true, true, true],
          [true, false, true],
          [true, false, true],
        ];
      }

      if (this.card.value == "8") {
        return [
          [true, true],
          [true, true],
          [true, true],
          [true, true],
        ];
      }

      if (this.card.value == "9") {
        return [
          [true, false, true],
          [true, true, true],
          [true, false, true],
          [true, false, true],
        ];
      }

      if (this.card.value == "10") {
        return [
          [true, false, true],
          [true, true, true],
          [true, true, true],
          [true, false, true],
        ];
      }

      return [];
    },
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
      this.$emit("selectedCard", this.card);
    },
  },
};
</script>

<style scoped>
.card-border {
  height: var(--card-width);
  width: calc(var(--card-width) * 0.66);
  border: 0.07em solid black;
  border-radius: 0.4em;
  cursor: pointer;
  transition: transform 0.6s ease;
}

.card-border:hover {
  transform: scale(1.1);
  box-shadow: 0.1em 0.1em 0.2em 0.1em #888888;
}

.grid-container {
  display: grid;
  grid-template-columns: 0.3em 1fr 0.3em;
}

.card-corner-left {
  margin-left: 0.3em;
  text-align: start;
}

.card-corner-right {
  margin-top: 5.7em;
  margin-right: 0.4em;
  rotate: 180deg;
}

.suit-flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.suit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  width: 50%;
}

.red {
  color: red;
}
.black {
  color: black;
}

#ace {
  font-size: 6.5em;
}
</style>
