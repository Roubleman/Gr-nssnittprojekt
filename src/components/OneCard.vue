<template>
  <div class="back-of-card" v-if="card.isFlipped" :style="cssProps">
    <img
      src="/img/cardback.png"
      alt="Front of the card"
      class="card-back-image"
    />
  </div>

  <div
    class="card-border"
    :class="[
      isClickable ? 'cursor: pointer' : '',
      isClickable ? '' : 'card-border[disabled]:hover',
    ]"
    @click="selectedCardTapped"
    :style="cssProps"
    v-else
  >
    <div class="grid-container" :class="this.isRed() ? 'red' : 'black'">
      <section class="card-corner-left">
        <p style="margin-block: 0em; font-size: var(--card-font-size)">
          {{ card.value }}
        </p>
        <p
          style="
            margin-block: var(--margin-block-suit);
            font-size: var(--card-font-size);
          "
        >
          <span
            v-html="'&' + card.suit + ';'"
            v-if="!(card.suit === '')"
          ></span>
        </p>
      </section>

      <section v-if="!(card.suit === '')">
        <section class="suit-flex" v-if="card.value >= 2 && card.value <= 10">
          <div
            v-for="(row, i) in cardSuits"
            :key="i"
            class="suit-row"
            :class="[
              (Number(card.value) == 2 && i == 1) ||
              (Number(card.value) == 3 && i == 2) ||
              (Number(card.value) == 4 && i == 1) ||
              (Number(card.value) <= 6 && i == 2) ||
              (Number(card.value) == 7 && i == 3) ||
              (Number(card.value) >= 8 && i >= 2)
                ? 'rotate-suit'
                : '',

              row.length == 1 ? 'suit-row single-suit' : '',
            ]"
            :style="flexRow"
          >
            <span v-for="(suit, j) in row" :key="j">
              <span
                v-html="'&' + this.card.suit + ';'"
                v-if="suit == true"
                style="font-size: var(--card-font-size)"
              ></span>
            </span>
          </div>
        </section>

        <section
          v-else
          style="
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <span id="ace" v-html="'&' + card.suit + ';'"></span>
        </section>
      </section>

      <section
        class="card-corner-right"
        :class="card.suit === '' ? 'no-suit-right' : ''"
      >
        <p style="margin-block: 0em; font-size: var(--card-font-size)">
          {{ card.value }}
        </p>
        <p
          style="
            margin-block: 0em;
            margin-top: var(--margin-block-suit);
            font-size: var(--card-font-size);
          "
        >
          <span
            v-html="'&' + card.suit + ';'"
            v-if="!(card.suit === '')"
          ></span>
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
    isClickable: Boolean,
    cardHeight: Number,
  },
  data: function () {
    return {};
  },

  computed: {
    cardSuits() {
      if (this.card.value == "2") {
        return [[true], [true]];
      }

      if (this.card.value == "3") {
        return [[true], [true], [true]];
      }

      if (this.card.value == "4") {
        return [
          [true, true],
          [true, true],
        ];
      }

      if (this.card.value == "5") {
        return [[true, true], [true], [true, true]];
      }

      if (this.card.value == "6") {
        return [
          [true, true],
          [true, true],
          [true, true],
        ];
      }

      if (this.card.value == "7") {
        return [[true, true], [true], [true, true], [true, true]];
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
        return [[true, true], [true, true], [true], [true, true], [true, true]];
      }

      if (this.card.value == "10") {
        return [
          [true, true],
          [true, true],
          [true, true],
          [true, true],
          [true, true],
        ];
      }

      return [];
    },

    flexRow() {
      let normal_flex_grow = 1;
      let first_last_child_flex_grow = 1;
      let second_child_flex_grow = 1;

      if (this.card.points == 10 || this.card.points == 9) {
        normal_flex_grow = 1;
        first_last_child_flex_grow = 5;
        second_child_flex_grow = 10;
      }

      return {
        "--suit-row-flex-grow": normal_flex_grow,
        "--suit-row-flex-grow-first-last-child": first_last_child_flex_grow,
        "--suit-row-flex-grow-second-child": second_child_flex_grow,
      };
    },

    cssProps() {
      let font_size_multiplier;
      let card_corner_right_margin_top_multiplier;

      if (
        (this.card.points == 10 || this.card.points == 9) &&
        this.cardHeight <= 5
      ) {
        font_size_multiplier = 0.14;
      } else {
        font_size_multiplier = 0.125;
      }

      return {
        "--card-height": this.cardHeight + "em",
        "--card-width": this.cardHeight * 0.66 + "em",
        "--card-ace-size": this.cardHeight * 0.8125 + "em",
        "--card-corner-left-margin": this.cardHeight * 0.0375 + "em",
        "--card-corner-right-margin-top": this.cardHeight * 0.7125 + "em",
        "--card-corner-right-margin-right": this.cardHeight * 0.05 + "em",
        "--card-font-size": this.cardHeight * font_size_multiplier + "em",
        "--card-border-thickness": this.cardHeight * 0.00875 + "em",
        "--card-border-radius": this.cardHeight * 0.05 + "em",
        "--margin-block-suit": -1 * this.cardHeight * 0.02 + "em",
        "--no-suit-width-minus-100": this.cardHeight * 0.5 + "em",
        "--no-suit-x-translation": -1 * this.cardHeight * 0.50625 + "em",
      };
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
      if (this.isClickable) {
        this.$emit("selectedCard", this.card);
      }
      console.log("Card tapped");
      console.log(this.isClickable);
    },
  },
};
</script>

<style scoped>
.card-border {
  height: var(--card-height);
  width: var(--card-width);
  border: var(--card-border-thickness) solid rgb(95, 95, 95);
  border-radius: var(--card-border-radius);
  transition: transform 0.6s ease;
  background-color: white;
}

/*
.card-border:hover {
  transform: scale(1.1);
  box-shadow: 0.1em 0.1em 0.2em 0.1em #888888;
}*/

.grid-container {
  display: grid;
  grid-template-columns: 0.3em 1fr 0.3em;
  height: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
.card-back-image {
  border: var(--card-border-thickness) solid rgb(95, 95, 95);
  border-radius: var(--card-border-radius);
  height: inherit;
  width: inherit;
}

.back-of-card {
  height: var(--card-height);
  width: var(--card-width);
}

.card-corner-left {
  margin-left: var(--card-corner-left-margin);
  text-align: start;
}

.card-corner-right {
  margin-top: var(--card-corner-right-margin-top);
  margin-right: var(--card-corner-right-margin-right);
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
  flex-grow: var(--suit-row-flex-grow);
  width: 50%;
}

.suit-row:first-child {
  flex-grow: var(--suit-row-flex-grow-first-last-child);
}

.suit-row:nth-child(2) {
  flex-grow: var(--suit-row-flex-grow-second-child);
}
.suit-row:last-child {
  flex-grow: var(--suit-row-flex-grow-first-last-child);
}

.suit-row.single-suit {
  justify-content: center;
}

.rotate-suit {
  rotate: 180deg;
}

.red {
  color: red;
}

.black {
  color: black;
}

.no-suit-right {
  width: calc(100% - var(--no-suit-width-minus-100));
  transform: translateX(var(--no-suit-x-translation));
}

#ace {
  font-size: var(--card-ace-size);
}
</style>
