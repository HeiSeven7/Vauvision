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

    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.personal__block {
  display: flex;
  width: 100%;
  padding: 40px 0 80px;
  flex-direction: column;
  gap: 30px;
}
</style>