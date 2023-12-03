<template>
  <!-- <header id="header-style">Cards</header>

  <section class="dealer-view">
    <Dealer> </Dealer>
  </section>
  <section class="player_view">
    <Player> </Player>
  </section> -->
</template>

<script>
import OneCard from "@/components/OneCard.vue";
import DeckOfCards from "@/assets/DeckOfCards.json";
import io from "socket.io-client";
import Dealer from "@/components/DealerComponent.vue";
import Player from "@/components/PlayersComponent.vue";
const socket = io("localhost:3000");

export default {
  name: "GameView",
  components: {
    OneCard,
    Player,
    Dealer,
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      playingCards: DeckOfCards,
      selectedCard: {},
      gameID: "inactive game",
      playerList: [],
      gameSettings: {},
      player: {},
      playerName: localStorage.getItem("playerName"),
    };
  },

  created: function () {
    this.gameId = this.$route.params.id;

    socket.emit("joinSocket", this.gameId);

    socket.emit("getGameInfo", this.gameId);

    socket.on("gameInfo", (game) => {
      this.playerList = game.players;
      this.gameSettings.pointsSetting = game.pointsSetting;
      this.gameSettings.guessesNumber = game.guessesNumber;
      for (let i = 0; i < this.playerList.length; i++) {
        if (this.playerList[i].name === this.playerName) {
          this.player = this.playerList[i];
        }
      }
    });

    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
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
  --card-height: 8em;
}

.dealer-view {
  --card-width: 20em;
}
</style>
