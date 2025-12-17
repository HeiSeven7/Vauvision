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
      <ul class="articles__list">
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
              vitae aliquam natoque adipiscing. Adipiscing ultricies 
              adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum 
              tellus mauris. Amet mi volutpat nec nam. Blandit facilisis 
              felis cursus dictumst eget facilisis.
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
              vitae aliquam natoque adipiscing. Adipiscing ultricies 
              adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum 
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
              vitae aliquam natoque adipiscing. Adipiscing ultricies 
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
              vitae aliquam natoque adipiscing. Adipiscing ultricies 
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
              vitae aliquam natoque adipiscing. Adipiscing ultricies 
              adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum 
              tellus mauris. Amet mi volutpat nec nam. Blandit facilisis 
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
        <li class="articles__item">
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img src="@/assets/img/personal/articles/default.webp" alt="">
              </div>
            </a>
            <h5 class="articles__head">Lorem ipsum dolor sit amet consectetur</h5>
            <p class="articles__desc text_small">
              Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel 
            </p>
          </div>
          <div class="articles__bottom">
            <p class="articles__date text_very">10.10.2025</p>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
      </ul>
      <button class="articles__load button__primary">
        <span>Загрузить еще</span>
      </button>
    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.articles__list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.articles__item {
  display: flex;
  width: calc(33.333% - 14px);
  padding: 40px;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.articles__image {
  display: flex;
  width: 100%;
  height: 230px;
  margin: 0 0 15px;
}
.articles__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.articles__head {
  padding: 0 0 10px;
}
.articles__desc {
  color: var(--text-gray);
}
.articles__date {
  padding: 0 0 30px;
}
.articles__load {
  margin: 60px auto 0;
}
@media (max-width: 1919px) {
  .articles__item {
    padding: 30px;
    gap: 15px;
  }
  .articles__image {
    height: 180px;
  }
  .articles__load {
    margin: 50px auto 0;
  }
}
@media (max-width: 1439px) {
  .articles__item {
    width: calc(50% - 10px);
    padding: 20px;
    gap: 15px;
  }
  .articles__image {
    height: 200px;
  }
  .articles__head {
    padding: 0 0 5px;
  }
  .articles__load {
    margin: 40px auto 0;
  }
}
@media (max-width: 767px) {
  .articles__item {
    width: 100%;
  }
  .articles__load {
    margin: 40px 0 0;
  }
}
</style>