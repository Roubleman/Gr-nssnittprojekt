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
    <router-link to="/create/" class="hover-link">
      {{ uiLabels.createHeading }}</router-link
    >
    <a class="hover-link" href="#" @click.prevent="openAbout">{{
      uiLabels.about
    }}</a>
    <a class="hover-link" href="#" @click.prevent="openRules">{{
      uiLabels.rules
    }}</a>
    <button v-on:click="switchLanguage" id="switch_language" class="hover-link">
      <img
        class="language-flag"
        :src="uiLabels.changeLanguageFlag"
        :alt="uiLabels.changeLanguage"
      />
    </button>
  </ResponsiveNav>
  <h1 class="highlight">{{ uiLabels.salesPitch }}</h1>
  <h2 class="highlight">{{ uiLabels.subHeading }}</h2>

  <div id="join_info">
    <p>
      {{ uiLabels.joinInfo }}
    </p>
  </div>
  <section id="input_wrappers">
    <section class="input-boxes box">
      <label>
        {{ uiLabels.inputName }}:
        <input
          class="input"
          type="text"
          v-model="name"
          v-on:input="checkName()"
        />
        <p class="input-error" v-if="!nameAvailable">
          {{ uiLabels.nameUnavailable }}
        </p>
        <p class="explanation" v-else>{{ uiLabels.nameExplanation }}</p>
      </label>
    </section>
    <section class="input-boxes box">
      <label>
        {{ uiLabels.inputGameId }}:
        <input
          class="input"
          type="text"
          v-model="id"
          v-on:input="
            id = id.replace(/\s/g, '');
            checkGameId();
          "
        />
        <p class="input-error" v-if="!gameIdExists && this.id.length > 3">
          {{ uiLabels.gameIdNotFound }}
        </p>
        <p class="explanation" v-else>{{ uiLabels.inputGameIdExplanation }}</p>
      </label>
    </section>
    <section class="input-boxes box" id="avatar_box">
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
    <div class="overlay" id="rules_popup">
      <div class="popup">
        <span class="close_popup" @click="closeRules">&times;</span>
        <h1>{{ uiLabels.rules }}</h1>
        <p v-for="text in uiLabels.rulesText">{{ text }}</p>
      </div>
    </div>
    <div class="overlay" id="about_popup">
      <div class="popup">
        <span class="close_popup" @click="closeAbout">&times;</span>
        <h1>{{ uiLabels.about }}</h1>
        <p v-for="text in uiLabels.aboutText">{{ text }}</p>
      </div>
    </div>
  </section>
  <section style="padding-top: 1em; margin-bottom: 10em">
    <button
      class="join-game"
      v-on:click="sendPlayerInfo()"
      :class="{
        joinButtonIsDisabled: !this.inputChecker(),
        popupRemoveButton: this.removeButton,
      }"
    >
      {{ uiLabels.joinGame }}
    </button>
  </section>
</template>

<script>
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
// sessionStorage.setItem("dataServer", "localhost:3000");
sessionStorage.setItem("dataServer", "192.168.1.195:3000"); /*OBS, Pontus Ip*/
/*Ta bort kommentaren
 och gör den ovan till en kommentar för att tillåta andra att connecta
 måste även skriva npm run host för att kunna tillåta andra att connecta*/
const socket = io(sessionStorage.getItem("dataServer"));

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
      nameAvailable: true,
      gameIdExists: true,
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
    socket.on("nameChecked", (checkBool) => {
      this.nameAvailable = checkBool;
    });
    socket.on("gameIdChecked", (checkBool) => {
      this.gameIdExists = !checkBool;
      if (this.gameIdExists) {
        socket.emit("isGameStarted", this.id);
      }
    });
    socket.on("gameStarted", (checkBool) => {
      if (!checkBool) {
        this.checkName();
      }
    });
  },
  mounted() {
    //coPilot code so that we have body background with style scoped
    document.body.style.backgroundImage = "url(/img/subtle-prism.svg)";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundSize = "cover";
  },
  beforeDestroy() {
    document.body.style.backgroundImage = null;
    document.body.style.backgroundSize = null;
    document.body.style.backgroundAttachment = null;
    document.body.style.backgroundPosition = null;
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
      this.hideNav = true;
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
      this.hideNav = true;
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
      if (
        this.name.length < 1 ||
        this.id.length < 4 ||
        !this.nameAvailable ||
        !this.gameIdExists
      ) {
        return false;
      } else {
        return true;
      }
    },
    checkName: function () {
      socket.emit("checkName", { gameId: this.id, playerName: this.name });
    },
    checkGameId: function () {
      if (this.id.length > 3) {
        socket.emit("checkGameId", this.id);
      }
    },

    sendPlayerInfo: function () {
      sessionStorage.setItem("playerName", this.name);
      socket.emit("joinGame", {
        gameId: this.id,
        playerName: this.name,
        avatar: this.avatar,
      });
      this.$router.push("/join/" + this.id);
    },
  },
};
</script>
<style scoped>
.header {
  background-color: #076032;
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

.explanation {
  font-size: 0.7em;
  color: black;
}

.navigation-menu {
  overflow: hidden;
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
  border: none;
  border-radius: 0px;
  box-shadow: 0px 0px 0px;
}
.switch-language-button:hover {
  transform: scale(1);
}

.language-flag {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.input-error {
  color: red;
  font-size: 0.8em;
  font-weight: bold;
  margin-top: 1.5%;
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

.join-game {
  border: 1px solid black;
  color: black;
  padding: 24px 60px 24px 60px;
  border-radius: 60px;
  background-color: #009e60;
  font-weight: bolder;
  font-size: 40px;
  box-shadow: 0px 0px 1px;
  transform: all 2s ease;
  transition-duration: 0.3s;
  cursor: pointer;
}

.join-game:active {
  transform: translateY(15px);
  box-shadow: 0px 0px 1px rgb(0, 0, 0);
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
  position: relative;
  z-index: 1000;
  background: #fff;
  padding: 1em;
  border-radius: 0.5em;
  box-shadow: 0 0 0.7em rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 60%;
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
  position: relative;
  width: 40em;
  height: 4em;
  padding-top: 3%;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.input {
  font-size: 1.2em;
}

.high-light-selected {
  scale: calc(1.6);
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
  background-color: inherit;
  color: black;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.on-top button {
  background-color: inherit;
  border: none;
}

.hover-link {
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: transform 0.3s ease;
  font-weight: bold;
  font-size: 0.8em;
  height: 3em;
}

.hover-link:hover {
  color: whitesmoke;
  transform: scale(1.2);
}

#switch_language {
  transform: none;
  transition: transform 0.3s ease;
  border-width: 0px;
  box-shadow: none;
}

.language-flag:hover {
  transform: scale(1.04);
}

@media (min-width: 60em) {
  .join-game:hover {
    transform: translateY(-15px);
    box-shadow: 0px 10px 1px rgb(0, 0, 0);
    border: 1px solid black;
  }
}

@media (min-width: 50em) and (max-width: 60em) {
  .input-boxes {
    width: 80%;
  }
  .join-game:hover {
    transform: translateY(-15px);
    box-shadow: 0px 10px 1px rgb(0, 0, 0);
    border: 1px solid black;
  }
}

@media screen and (max-width: 50em) {
  .hover-link:hover {
    color: black;
  }
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

  .input-boxes {
    width: 85%;
    font-size: 0.85em;
    padding: 0.5em;
  }

  #avatar_select {
    font-size: 0.85em;
    padding: 0.5em;
  }

  #avatar_box {
    height: 7em;
  }

  .on-top {
    height: 95%;
    z-index: 100;
    background-color: rgb(73, 114, 73);
    top: inherit;
    border: none;
    flex-direction: column;
  }

  .on-top button {
    background-color: rgb(73, 114, 73);
    border: none;
  }

  .hover-link {
    color: white;
    font-size: 0.7em;
  }
  .popup {
    max-width: 80%;
  }
  .input-error {
    color: red;
    font-size: 0.65em;
    font-weight: bold;
    margin-top: 1.5%;
  }
}

@media (max-width: 35.2em) {
  .avatars {
    display: grid;
    grid-template-columns: repeat(5, 3em);
    justify-items: center;
    align-items: center;
    width: 265px;
  }
  #avatar_select {
    padding-bottom: 0;
    margin-top: -0.9em;
  }
  #avatar_box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .explanation {
    margin: 0.2em;
  }

  .join-game {
    transform: translateY(-15px);
    box-shadow: 0px 10px 1px rgb(0, 0, 0);
  }
  .join-game:active {
    transform: translateY(15px);
    box-shadow: 0px 0px 1px rgb(0, 0, 0);
  }
}
</style>
