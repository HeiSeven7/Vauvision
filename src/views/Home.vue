<script lang="ts" setup>
import Tr from "@/i18n/translation";
// import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import ArticlesSVG from "@/uikit/menu/ArticlesSVG.vue";

// const loading = ref<boolean>(false);
// const loadingSvg = `
//   <path class="path" d="
//     M 30 15
//     L 28 17
//     M 25.61 25.61
//     A 15 15, 0, 0, 1, 15 30
//     A 15 15, 0, 1, 1, 27.99 7.5
//     L 15 15
//   " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
// `;

// const getData = async () => {
// };

// onMounted(async () => {
//   getData()
// });
</script>

<template>
<section class="home">
  <div class="home__container container">
    <div class="home__block">
      <ul class="home__list">
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'login' })">
            <span><ArticlesSVG /></span>
            <span>Логин</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'registration' })">
            <span><ArticlesSVG /></span>
            <span>Регистрация</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'restore' })">
            <span><ArticlesSVG /></span>
            <span>Восстановление</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'newpass' })">
            <span><ArticlesSVG /></span>
            <span>Новый пароль</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'personal' })">
            <span><ArticlesSVG /></span>
            <span>Личный кабинет</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'faq' })">
            <span><ArticlesSVG /></span>
            <span>Faq</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'partner' })">
            <span><ArticlesSVG /></span>
            <span>Партнеры</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'quiz' })">
            <span><ArticlesSVG /></span>
            <span>Релиз</span>
          </RouterLink>
        </li>
        <li class="home__item">
          <RouterLink class="home__link" :to="Tr.i18nRoute({ name: 'setting' })">
            <span><ArticlesSVG /></span>
            <span>Настройки</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.home {
  margin: 0 0 auto;
}
.home__block {
  display: flex;
  padding: 60px 0;
  align-items: center;
  justify-content: center;
}
.home__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.home__link {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>