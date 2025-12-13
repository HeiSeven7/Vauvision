<script setup lang="ts">
import { onMounted, ref } from "vue";
import LogoSVG from "@/uikit/Logo.vue";
import PaySVG from "@/uikit/icon/PaySVG.vue";
import LinkSVG from "@/uikit/icon/LinkSVG.vue";
import FaqSVG from "@/uikit/icon/FaqSVG.vue";
import PersonalSVG from "@/uikit/icon/PersonalSVG.vue";
import Tr from "@/i18n/translation";

const isMenuPopup = ref<boolean>(false);
const isOverlay = ref<boolean>(false);
const menu = ref<boolean>(false);

const getData = async () => {
  // const getversion = await sendRequest (
  //   "get",
  //   '/api/v1/app-versions/last/',
  //   {}
  // )
  // .then((response:any) => {
  //   return response;
  // });
  // versions.value = getversion.data.version_number;
};

onMounted(async () => {getData()});

const clickOverlay = () => {
  isMenuPopup.value = false;
  isOverlay.value = false;
  menu.value = false;
  document.documentElement.classList.remove("noscroll");
};

if (isMenuPopup.value === false) {
  document.addEventListener('keyup', function (evt) {
    if (evt.keyCode === 27) {
      isMenuPopup.value = false;
      isOverlay.value = false;
      menu.value = false;
      document.documentElement.classList.remove("noscroll");
    }
  });
};
</script>

<template>
<div :class="['overlay', { active: isOverlay }]" @click="clickOverlay"></div>
<header class="header">
  <div class="container header__container">
    <div class="header__block">
      <div class="header__flex">
        <RouterLink class="header__logo" :to="Tr.i18nRoute({ name: 'home' })">
          <LogoSVG />
        </RouterLink>
        <div class="header__info">
          <div class="header__balance header__button"><PaySVG /><span>Баланс: 144 000 руб.</span></div>
          <div class="header__invite header__button"><LinkSVG /><span>Пригласи партнера по ссылке</span></div>
        </div>
        <div class="header__right">
          <button class="header__faq"><FaqSVG /></button>
          <button class="header__personal"><PersonalSVG /></button>
        </div>
      </div>
    </div>
  </div>
</header>
<section class="top"></section>
</template>

<style scoped>
.top {
  height: 80px;
  margin: 0;
}
.header {
  width: 100%;
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 202;
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
}
.header__block {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.header__logo {
  display: flex;
  width: 279px;
  height: 100%;
  padding: 0 0 0 30px;
  align-items: center;
  border-right: 1px solid var(--border);
  -webkit-transition: color 0.15s linear;
  transition: color 0.15s linear;
}
.header__logo:hover {
  color: var(--color);
}
.header__logo svg {
  width: 175px;
  height: 32px;
  object-fit: contain;
}
.header__flex {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 120px;
}
.header__info {
  display: flex;
  gap: 20px;
}
.header__button {
  display: flex;
  padding: 14px 25px;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: color 0.15s linear, background-color 0.15s linear, border-color 0.15s linear;
  cursor: pointer;
}
.header__button:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
}
.header__button span {
  flex: 0 0 auto;
}
.header__button svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.header__right {
  display: flex;
  margin: 0 0 0 auto;
  flex: 0 0 auto;
  align-items: center;
  flex-wrap: nowrap;
  gap: 10px;
}
.header__faq,
.header__personal {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  transition: color 0.15s linear, background-color 0.15s linear, border-color 0.15s linear;
}
.header__faq {
  color: var(--text);
  background-color: var(--bg);
}
.header__faq:hover,
.header__personal:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
}
.header__faq svg {
  width: 22.79px;
  height: 22.79px;
  object-fit: contain;
}
.header__personal {
  color: var(--text);
  background-color: var(--bg-gray);
}
.header__personal svg {
  width: 26.71px;
  height: 26.71px;
  object-fit: contain;
  opacity: 0.7;
}
</style>