<script setup lang="ts">
import HomeSVG from "@/uikit/menu/HomeSVG.vue";
import UploadSVG from "@/uikit/menu/UploadSVG.vue";
import SettingSVG from "@/uikit/menu/SettingSVG.vue";
import PartnerSVG from "@/uikit/menu/PartnerSVG.vue";
import FaqSVG from "@/uikit/menu/FaqSVG.vue";
import ArticlesSVG from "@/uikit/menu/ArticlesSVG.vue";
import Tr from "@/i18n/translation";
</script>

<template>
<div class="menu__back"></div>
<div class="menu__block">
  <ul class="menu__list">
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'personal' })">
        <span><HomeSVG /></span>
        <span>Главная</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'quiz' })">
        <span><UploadSVG /></span>
        <span>Выложить релиз</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'setting' })">
        <span><SettingSVG /></span>
        <span>Настройки</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'partner' })">
        <span><PartnerSVG /></span>
        <span>Стать партнером</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'faq' })">
        <span><FaqSVG /></span>
        <span>FAQ</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'articles' })">
        <span><ArticlesSVG /></span>
        <span>Статьи</span>
      </RouterLink>
    </li>
    <li class="menu__item">
      <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'faq' })">
        <span><FaqSVG /></span>
        <span>Связь с поддержкой</span>
      </RouterLink>
    </li>
  </ul>
</div>
</template>

<style scoped>
.menu__block {
  width: 279px;
  height: 100vh;
  max-height: calc(100vh - 80px);
  padding: 60px 0;
  position: fixed;
  top: 80px;
  left: calc(50% - ((1920px - 160px)/2) + 140px);
  z-index: 2;
  border-right: 1px solid var(--border);
  background-color: var(--bg);
  transform: translateX(-50%);
  overflow-y: scroll;
  overflow-x: hidden;
}
.menu__block::-webkit-scrollbar {
  display: none;
  width: 0px;
}
.menu__block::-webkit-scrollbar-thumb {
  display: none;
  width: 0px;
}
.menu__back {
  content: "";
  width: 1920px;
  height: 100vh;
  position: fixed;
  left: calc(50% - 1920px + 80px);
  top: 0;
  z-index: 1;
  background-color: var(--bg);
  transform: translateX(-50%);
}
.menu__list {
  display: flex;
  flex-direction: column;
}
.menu__link {
  display: flex;
  padding: 14px 30px;
  align-items: center;
  gap: 8px;
  position: relative;
  color: var(--text);
  background-color: var(--bg);
  transition: color 0.15s linear, background-color 0.15s linear;
}
.menu__link::after {
  content: "";
  width: 3px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  background-color: var(--color);
  opacity: 0;
  transition: opacity 0.15s linear;
}
.menu__link.router-link-exact-active,
.menu__link:hover {
  color: var(--text);
  background-color: var(--bg-color);
}
.menu__link.router-link-exact-active::after {
  opacity: 1;
}
.menu__link svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

@media (max-width: 1919px) {
  .menu__block {
    left: 40px;
    transform: none;
  }
}
@media (max-width: 1439px) {
  .menu__block {
    left: 30px;
  }
  .menu__back,
  .menu__block {
    display: none;
  }
}
@media (max-width: 1023px) {
  .menu__block {
    left: 15px;
  }
}
@media (max-width: 767px) {
}
</style>