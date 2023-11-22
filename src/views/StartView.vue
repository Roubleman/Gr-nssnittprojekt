<template>
  <header>
    <div
      v-bind:class="['navigation-menu', { close: !hideNav }]"
      v-on:click="toggleNav"
    ></div>
    <div class="logo">
      <img src="/img/logo.png" />
      Card Guessr
      <img src="../assets/logo.svg" />
    </div>
  </header>
  <ResponsiveNav v-bind:hideNav="hideNav">
    <button v-on:click="switchLanguage">{{ uiLabels.changeLanguage }}</button>
    <router-link to="/create/">{{ uiLabels.createHeading }}</router-link>
    <a href="">{{ uiLabels.about }}</a>
    <a href="#" @click.prevent="openRules">{{ uiLabels.rules }}</a>
  </ResponsiveNav>
  <h1>{{ uiLabels.salesPitch }}</h1>
  <h2>{{ uiLabels.subHeading }}</h2>
  <div class="overlay" id="rules_popup">
    <div class="popup">
      <span class="close_popup" @click="closeRules">&times;</span>
      <h1>{{ uiLabels.rules }}:</h1>
      <p v-for="text in uiLabels.rulesText">{{ text }}</p>
    </div>
  </div>
  <section>
    <label>
      {{ uiLabels.inputName }}
      <input type="text" v-model="name" />
    </label>
  </section>
  <section style="padding-top: 1em">
    <label>
      {{ uiLabels.inputGameId }}
      <input type="text" v-model="id" />
    </label>
  </section>
  <section style="padding-top: 1em">
    <router-link
      class="join-button join-button2"
      v-bind:to="'/lobby/' + this.id"
      v-bind:class="[
        join - button,
        join - button2,
        { joinButtonIsDisabled: this.inputChecker() },
        { popupRemoveButton: this.removeButton},
      ]"
      @click="this.sendPlayerInfo()"
      >{{ uiLabels.joinGame }}</router-link
    >
  </section>
</template>

<script>
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "StartView",
  components: {
    ResponsiveNav,
  },
  data: function () {
    return {
      uiLabels: {},
      id: "",
      name: "",
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,
      removeButton: false,
    };
  },
  created: function () {
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
  },
  methods: {
    switchLanguage: function () {
      if (this.lang === "en") {
        this.lang = "sv";
      } else {
        this.lang = "en";
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("switchLanguage", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
    openRules: function () {
      const rulesPopup = document.getElementById("rules_popup");
      rulesPopup.style.display = "flex";
      this.removeButton = true;

      rulesPopup.addEventListener("click", this.closeRulesOutside);
    },
    closeRules: function () {
      const rulesPopup = document.getElementById("rules_popup");
      rulesPopup.style.display = "none";

      rulesPopup.removeEventListener("click", this.closeRulesOutside);
      this.removeButton = false;
    },
    closeRulesOutside: function (event) {
      const rulesPopup = document.getElementById("rules_popup");
      if (event.target === rulesPopup) {
        this.closeRules(); // Call your existing closeRules function
      }
    },
    inputChecker: function () {
      if (this.name.length < 1) {
        return true;
      }
      if (this.id.length < 1) {
        return true;
      }
      return false;
    },

    sendPlayerInfo: function () {
      socket.emit("joinGame", { gameId: this.id, playerName: this.name });
    },
  },
};
</script>
<style scoped>
header {
  background-color: gray;
  width: 100%;
  display: grid;
  grid-template-columns: 2em auto;
}
.logo {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 2.5rem;
  color: white;
  padding-top: 0.2em;
}
.logo img {
  height: 2.5rem;
  vertical-align: bottom;
  margin-right: 0.5rem;
}
.navigation-menu {
  color: white;
  width: 1em;
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 0.5rem;
  top: 0;
  left: 0;
  height: 2rem;
  cursor: pointer;
  font-size: 1.5rem;
}

.join-button {
  color: rgb(14, 221, 86);
  width: 6em;
  height: 1.5em;
  padding: 0.75em 1em;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
}
.join-button2 {
  text-decoration: none;
  padding: 0.5em 1em;
  border: 1px solid rgb(14, 221, 86);
  box-shadow: 0 0 5px rgb(14, 221, 86), 0 0 5px rgb(14, 221, 86) inset;
  z-index: 1;
}

.join-button::after {
  content: "";
  position: absolute;
  width: 0;
  height: 100%;
  top: 0;
  right: 0;
  z-index: -1;
  background: rgb(14, 221, 86);
  box-shadow: 0 0 20px rgb(14, 221, 86);
  transition: all 0.3s ease;
}

.join-button:hover {
  color: #fff;
}

.join-button:hover::after {
  left: 0;
  width: 100%;
}

.join-button:active {
  top: 2px;
}

.joinButtonIsDisabled {
  pointer-events: none;
  cursor: default;
  opacity: 0.5;
}

.popupRemoveButton {
  opacity: 0;
  transition: none;
}

#clubs {
  color: black;
}

#hearts {
  color: red;
}

.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  align-items: center;
  justify-content: center;
}

.popup {
  z-index: 2;
  background: #fff;
  padding: 1em;
  border-radius: 0.5em;
  box-shadow: 0 0 0.7em rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
}

.close_popup {
  cursor: pointer;
  position: absolute;
  top: 0.5em;
  right: 0.5em;
}

@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .navigation-menu::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left: -12em;
  }
}
</style>
