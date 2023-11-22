<template>
  <header>
    <div
      v-bind:class="['hamburger', { close: !hideNav }]"
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
    <a href="">{{ uiLabels.rules }}</a>
  </ResponsiveNav>
  <h1>{{ uiLabels.salesPitch }}</h1>
  <h2>{{ uiLabels.subHeading }}</h2>
  <label>
    {{ uiLabels.inputGameId }}
    <input type="text" v-model="id" />
  </label>
  <section>
    <router-link id="join_button" v-bind:to="'/game/' + id">{{
      uiLabels.joinGame
    }}</router-link>
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
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,
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
.hamburger {
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

#join_button {
  text-decoration: none;
  color: rgb(14, 221, 86);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  padding: 0.5em 1em;
  border: 1px solid rgb(14, 221, 86);
  box-shadow: 0 0 5px rgb(14, 221, 86), 0 0 5px rgb(14, 221, 86) inset;
  z-index: 1;
}



@media screen and (max-width: 50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
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
