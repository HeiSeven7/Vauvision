<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import Menu from "@/components/layout/Menu.vue";
// import { useRouter } from "vue-router";

// const router = useRouter();
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="partner__flex">
        <div class="partner__content">
          <div class="partner__top">
            <h3 class="partner__head">ЧТО ТАКОЕ ПАРТНЁРСКАЯ ПРОГРАММА VAUVISION?</h3>
            <p class="partner__desc">Не нашли ответ на вопрос? Написать в поддержку.</p>
          </div>
          <div class="partner__empty">
            <h5 class="partner__heading">Партнеры, зарегистрировавшиеся по вашей ссылке</h5>
            <p class="partner__description button">у вас Пока нет партнеров</p>
          </div>
          <ul class="partner__list">
            <li class="partner__item">
              
            </li>
          </ul>
        </div>
        <div class="partner__right">
          <div class="partner__partner">
            <div class="partner__partner_info">
              <h5 class="partner__articles_head">условия участия</h5>
              <p class="partner__articles_desc">Детали начисления за повторные релизы и приглашенных друзей указаны ниже в разделе «Условия участия».</p>
            </div>
            <button class="partner__partner_button button__red"><span>стать партнером</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.partner__flex {
  display: flex;
  gap: 40px;
}
.partner__content {
  display: flex;
  width: calc(100% - 440px);
  flex: 0 0 auto;
  flex-direction: column;
  gap: 40px;
}
.partner__top,
.partner__empty {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.partner__empty {
  padding: 40px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.partner__head,
.partner__heading,
.partner__description,
.partner__articles_head {
  text-transform: uppercase;
}
.partner__right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.partner__partner {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 30px;
  position: relative;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.partner__partner_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.partner__articles_desc {
  color: var(--text-gray);
}
</style>