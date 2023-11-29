import { createRouter, createWebHistory } from "vue-router";
import StartView from "../views/StartView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Start",
      component: StartView,
    },
    {
      path: "/game/:id",
      name: "GameView",
      component: () => import("../views/GameView.vue"),
    },
    {
      path: "/host/:id",
      name: "HostLobbyView",
      component: () => import("../views/HostLobbyView.vue"),
    },
    {
      path: "/join/:id",
      name: "PlayerLobbyView",
      component: () => import("../views/PlayerLobbyView.vue"),
    },
    {
      path: "/create/",
      name: "CreateView",
      component: () => import("../views/CreateView.vue"),
    },
    {
      path: "/result/:id",
      name: "ResultView",
      component: () => import("../views/ResultView.vue"),
    },
    {
      path: "/bus/:id",
      name: "BusView",
      component: () => import("../views/BusView.vue")
    },
  ],
});

export default router;
