<template>
  <header class="header">
    <div
      v-bind:class="['navigation-menu', { close: !hideNav }]"
      v-on:click="toggleNav"
    ></div>
    <div class="logo">
      <span id="clubs"> &clubs; </span>
      Card Guessr
      <span id="hearts"> &hearts; </span>
    </div>
  </header>
  <ResponsiveNav class="on-top" v-bind:hideNav="hideNav">
    <button v-on:click="switchLanguage">
      <img
        class="language-flag"
        :src="uiLabels.changeLanguageFlag"
        :alt="uiLabels.changeLanguage"
      />
    </button>
    <router-link to="/create/"> {{ uiLabels.createHeading }}</router-link>
    <a class="hover-link" href="#" @click.prevent="openAbout">{{
      uiLabels.about
    }}</a>
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
  <div class="overlay" id="about_popup">
    <div class="popup">
      <span class="close_popup" @click="closeAbout">&times;</span>
      <h1>{{ uiLabels.about }}:</h1>
      <p v-for="text in uiLabels.aboutText">{{ text }}</p>
    </div>
  </div>
  <div id="join_info">
    <p>
      {{ uiLabels.joinInfo }}
    </p>
  </div>
  <section id="input_wrappers">
    <section class="input-boxes">
      <label>
        {{ uiLabels.inputName }}:
        <input class="input" type="text" v-model="name" />
        <p class="explanation">{{ uiLabels.nameExplanation }}</p>
      </label>
    </section>
    <section class="input-boxes">
      <label>
        {{ uiLabels.inputGameId }}:
        <input class="input" type="text" v-model="id" />
        <p class="explanation">{{ uiLabels.inputGameIdExplanation }}</p>
      </label>
    </section>
    <section class="input-boxes">
      <p id="avatar_select">{{ uiLabels.selectAvatar }}</p>
      <section class="avatars">
        <img
          class="avatar-picture"
          v-for="(avatar, index) in avatars"
          :key="index"
          :src="avatar"
          @click="selectAvatar(index)"
          :class="this.selectedAvatar === index ? 'high-light-selected' : ''"
        />
      </section>
    </section>
  </section>
  <section style="padding-top: 1em; margin-bottom: 10em">
    <button
      class="join-button join-button2"
      v-on:click="tryToJoin"
      :class="{
        joinButtonIsDisabled: !this.inputChecker(),
        popupRemoveButton: this.removeButton,
      }"
    >
      {{ uiLabels.joinGame }}
    </button>
    <!-- <router-link
      class="join-button join-button2"
      v-bind:to="'/join/' + this.id"
      v-bind:class="[
        join - button,
        join - button2,
        { joinButtonIsDisabled: this.inputChecker() },
        { popupRemoveButton: this.removeButton },
      ]"
      @click="this.sendPlayerInfo()"
      >{{ uiLabels.joinGame }}</router-link
    > -->
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
      valuesAccepted: false,
      avatars: [
        "/img/Avatars/alienAvatar.png",
        "/img/Avatars/clownAvatar.png",
        "/img/Avatars/cowAvatar.png",
        "/img/Avatars/devilAvatar.png",
        "/img/Avatars/nerdAvatar.png",
        "/img/Avatars/octopusAvatar.png",
        "/img/Avatars/penguinAvatar.png",
        "/img/Avatars/robotAvatar.png",
        "/img/Avatars/santaAvatar.png",
        "/img/Avatars/sunglassesAvatar.png",
      ],
      selectedAvatar: 0,
      avatar: "/img/Avatars/alienAvatar.png",
    };
  },
  created: function () {
    socket.emit("pageLoaded", this.lang);
    socket.on("init", (labels) => {
      this.uiLabels = labels;
    });
    socket.on("gameValuesChecked", (checkBool) => {
      console.log("game values accepted");
      this.valuesAccepted = checkBool;
      this.sendPlayerInfo();
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
    selectAvatar(index) {
      this.selectedAvatar = index;
      this.avatar = this.avatars[this.selectedAvatar];
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
    openAbout: function () {
      const aboutPopup = document.getElementById("about_popup");
      aboutPopup.style.display = "flex";
      this.removeButton = true;

      aboutPopup.addEventListener("click", this.closeAboutOutside);
    },
    closeAbout: function () {
      const aboutPopup = document.getElementById("about_popup");
      aboutPopup.style.display = "none";

      aboutPopup.removeEventListener("click", this.closeAboutOutside);
      this.removeButton = false;
    },
    closeAboutOutside: function (event) {
      const aboutPopup = document.getElementById("about_popup");
      if (event.target === aboutPopup) {
        this.closeAbout(); // Call your existing closeRules function
      }
    },
    inputChecker: function () {
      if (this.name.length < 1) {
        return false;
      }
      if (this.id.length < 1) {
        return false;
      }
      return true;
    },

    tryToJoin: function () {
      socket.emit("checkGameValues", {
        gameId: this.id,
        playerName: this.name,
      });
    },

    sendPlayerInfo: function () {
      if (!this.valuesAccepted) {
        alert(this.uiLabels.inputError);
      } else {
        sessionStorage.setItem("playerName", this.name);
        socket.emit("joinGame", {
          gameId: this.id,
          playerName: this.name,
          avatar: this.avatar,
        });
        this.$router.push("/join/" + this.id);
      }
    },
  },
};
</script>
<style scoped>
.header {
  background-color: rgb(73, 114, 73);
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

.explanation {
  font-size: 0.7em;
  color: lightgreen;
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
  z-index: 100;
}

.switch-language-button {
  width: 80%;
  object-fit: cover;
}

.language-flag {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.avatar-picture {
  width: 2em;
  height: auto;
  margin-left: 0.2em;
  margin-right: 0.2em;
  cursor: pointer;
  transition: ease-in-out 0.2s;
}

.avatar-picture:hover {
  transform: scale(1.1);
}

#avatar_select {
  margin-top: -1em;
}
.join-button {
  color: rgb(73, 114, 73);
  width: 9em;
  height: 3em;
  padding: 0.75em 1em;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  font-size: 1.5em;
}

.join-button2 {
  text-decoration: none;
  padding: 0.5em 1em;
  border: 1px solid rgba(252, 16, 48, 0.707);
  box-shadow: 0 0 5px rgba(252, 16, 48, 0.707),
    0 0 5px rgba(252, 16, 48, 0.707) inset;
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
  background: rgb(73, 114, 73);
  box-shadow: 0 0 20px rgb(73, 114, 73);
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
  top: 2%;
  right: 3.5%;
}

.avatars {
  height: 100%;
  width: 100%;
}

#input_wrappers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.input-boxes {
  color: white;
  width: 40em;
  height: 4em;
  border-style: inset;
  border-color: rgba(252, 16, 48, 0.707);
  border-width: 1em;
  padding-top: 3%;
  background-color: rgb(73, 114, 73);
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.input {
  font-size: 1.2em;
}

.high-light-selected {
  scale: calc(1.8);
  margin-left: 1em;
  margin-right: 1em;
}

.language-flag {
  height: 100%;
  width: auto;
  object-fit: contain;
  transition: ease-in 0.2s;
  cursor: pointer;
}

.switch-language-button {
  height: 90%;
  border: none;
  background-color: transparent;
}

.on-top {
  z-index: 100;
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
