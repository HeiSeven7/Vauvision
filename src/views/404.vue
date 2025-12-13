<script lang="ts" setup>
// import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const clickHome = () => {
  router.push({ name: 'home' });
};
</script>

<template>
<Header></Header>
<section class="errorPage">
  <div class="container errorPage__container">
    <div class="errorPage__block">
      <div class="errorPage__info">
        <h1 class="errorPage__head">{{ $t("errorPage.head") }}</h1>
        <p class="errorPage__desc">{{ $t("errorPage.desc") }}</p>
        <el-button type="primary" class="errorPage__link" @click="clickHome">
          {{ $t("button.tomain") }}
        </el-button>
      </div>
    </div>
  </div>
</section>
<Footer></Footer>
</template>

<style lang="css" scoped>
.errorPage {
  margin: auto 0;
}
.errorPage__block {
  display: flex;
  width: 100%;
  padding: 40px 0 80px;
  flex-direction: column;
  gap: 30px;
}
.errorPage__info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
}
.errorPage__head {
  font-weight: 700;
  text-align: center;
}
.errorPage__desc {
  text-align: center;
}
.errorPage__link {
  max-width: 200px;
}
</style>