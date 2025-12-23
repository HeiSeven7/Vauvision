<script lang="ts" setup>
import { ref, computed } from "vue";
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import ButtonSVG from "@/uikit/icon/ButtonSVG.vue";

// Интерфейс для статьи
interface Article {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  category?: string;
  readTime?: string;
}

// Объект для списка статей
const articlesData = ref<Article[]>([
  {
    id: 1,
    title: "Продвижение артиста. Абсурдный прием, который работает.",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel vitae aliquam natoque adipiscing. Adipiscing ultricies adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum tellus mauris. Amet mi volutpat nec nam. Blandit facilisis felis cursus dictumst eget facilisis.",
    date: "10.10.2025",
    image: "articles_6.webp",
    category: "Маркетинг",
    readTime: "5 мин"
  },
  {
    id: 2,
    title: "Стоит ли выкладывать треки в пятницу.",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel vitae aliquam natoque adipiscing. Adipiscing ultricies adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum",
    date: "09.10.2025",
    image: "articles_1.webp",
    category: "Стратегия",
    readTime: "3 мин"
  },
  {
    id: 3,
    title: "Топ-чарты. Как туда попасть? Что получает артист?",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel vitae aliquam natoque adipiscing. Adipiscing ultricies",
    date: "08.10.2025",
    image: "articles_2.webp",
    category: "Музыка",
    readTime: "7 мин"
  },
  {
    id: 4,
    title: "Как создать успешный музыкальный бренд",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel vitae aliquam natoque adipiscing. Adipiscing ultricies",
    date: "07.10.2025",
    image: "articles_3.webp",
    category: "Брендинг",
    readTime: "8 мин"
  },
  {
    id: 5,
    title: "Монетизация музыки в 2025 году",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel vitae aliquam natoque adipiscing. Adipiscing ultricies adipiscing hendrerit ut tempor. Et volutpat sagittis rutrum tellus mauris. Amet mi volutpat nec nam. Blandit facilisis",
    date: "06.10.2025",
    image: "articles_4.webp",
    category: "Финансы",
    readTime: "6 мин"
  },
  {
    id: 6,
    title: "Основы звукозаписи для начинающих",
    description: "Lorem ipsum dolor sit amet consectetur. Ultricies nunc vel",
    date: "05.10.2025",
    image: "articles_5.webp",
    category: "Обучение",
    readTime: "10 мин"
  },
  {
    id: 7,
    title: "Как организовать успешный концерт",
    description: "Практические советы по организации музыкальных мероприятий. От поиска площадки до продажи билетов.",
    date: "04.10.2025",
    image: "articles_6.webp",
    category: "События",
    readTime: "12 мин"
  },
  {
    id: 8,
    title: "Социальные сети для музыкантов",
    description: "Как эффективно использовать соцсети для продвижения музыки и взаимодействия с аудиторией.",
    date: "03.10.2025",
    image: "articles_1.webp",
    category: "Соцсети",
    readTime: "9 мин"
  },
  {
    id: 9,
    title: "Работа с лейблами: что нужно знать",
    description: "Разбираемся в контрактах, роялти и условиях сотрудничества с музыкальными лейблами.",
    date: "02.10.2025",
    image: "articles_2.webp",
    category: "Индустрия",
    readTime: "15 мин"
  },
  {
    id: 10,
    title: "Создание музыкального видео",
    description: "От идеи до реализации: как создать качественное музыкальное видео с ограниченным бюджетом.",
    date: "01.10.2025",
    image: "articles_3.webp",
    category: "Видео",
    readTime: "11 мин"
  },
  {
    id: 11,
    title: "Продюсирование треков: основные ошибки",
    description: "Какие ошибки чаще всего допускают начинающие продюсеры и как их избежать.",
    date: "30.09.2025",
    image: "articles_4.webp",
    category: "Продюсирование",
    readTime: "8 мин"
  },
  {
    id: 12,
    title: "Музыкальные фестивали 2025",
    description: "Обзор самых ожидаемых музыкальных фестивалей в 2025 году и как туда попасть.",
    date: "29.09.2025",
    image: "articles_5.webp",
    category: "Фестивали",
    readTime: "6 мин"
  },
  {
    id: 13,
    title: "Коллаборации в музыке",
    description: "Как найти подходящего артиста для коллаборации и сделать совместный проект успешным.",
    date: "28.09.2025",
    image: "articles_6.webp",
    category: "Сотрудничество",
    readTime: "7 мин"
  },
  {
    id: 14,
    title: "Авторское право для музыкантов",
    description: "Основы авторского права: как защитить свою музыку и избежать нарушений.",
    date: "27.09.2025",
    image: "articles_1.webp",
    category: "Право",
    readTime: "14 мин"
  },
  {
    id: 15,
    title: "Современные тренды в музыке",
    description: "Какие музыкальные направления будут популярны в ближайшие годы и как им следовать.",
    date: "26.09.2025",
    image: "articles_2.webp",
    category: "Тренды",
    readTime: "9 мин"
  },
  {
    id: 16,
    title: "Оборудование для домашней студии",
    description: "Какое оборудование необходимо для создания качественной музыки дома.",
    date: "25.09.2025",
    image: "articles_3.webp",
    category: "Оборудование",
    readTime: "13 мин"
  },
  {
    id: 17,
    title: "Психология творчества",
    description: "Как преодолеть творческий кризис и сохранять мотивацию для создания музыки.",
    date: "24.09.2025",
    image: "articles_4.webp",
    category: "Психология",
    readTime: "10 мин"
  },
  {
    id: 18,
    title: "Музыка и технологии",
    description: "Как новые технологии изменяют музыкальную индустрию и творческий процесс.",
    date: "23.09.2025",
    image: "articles_5.webp",
    category: "Технологии",
    readTime: "11 мин"
  }
]);

// Пагинация для статей
const articlesPerPage = ref<number>(6);
const currentArticlesPage = ref<number>(1);

// Вычисляемые свойства для статей
const totalArticlesPages = computed(() => {
  return Math.ceil(articlesData.value.length / articlesPerPage.value);
});

const paginatedArticles = computed(() => {
  const start = (currentArticlesPage.value - 1) * articlesPerPage.value;
  const end = start + articlesPerPage.value;
  return articlesData.value.slice(start, end);
});

const showArticlesPagination = computed(() => {
  return articlesData.value.length > articlesPerPage.value;
});

// Методы для пагинации статей
const nextArticlesPage = () => {
  if (currentArticlesPage.value < totalArticlesPages.value) {
    currentArticlesPage.value++;
  }
};

const prevArticlesPage = () => {
  if (currentArticlesPage.value > 1) {
    currentArticlesPage.value--;
  }
};
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <ul class="articles__list">
        <li 
          class="articles__item" 
          v-for="article in paginatedArticles" 
          :key="article.id"
        >
          <div class="articles__top">
            <a href="" class="articles__link">
              <div class="articles__image">
                <img :src="`/src/assets/img/personal/articles/${article.image}`" alt="article.title">
              </div>
            </a>
            <h5 class="articles__head">{{ article.title }}</h5>
            <p class="articles__desc text_small">
              {{ article.description }}
            </p>
          </div>
          <div class="articles__bottom">
            <div class="articles__meta">
              <p class="articles__date text_very">{{ article.date }}</p>
              <div class="articles__info" v-if="article.category || article.readTime">
                <span class="articles__category text_very" v-if="article.category">{{ article.category }}</span>
                <span class="articles__readtime text_very" v-if="article.readTime">• {{ article.readTime }}</span>
              </div>
            </div>
            <button class="articles__button button__black"><span>Подробнее</span></button>
          </div>
        </li>
      </ul>
      
      <!-- Пагинация -->
      <div class="pagination__buttons" v-if="showArticlesPagination">
        <button 
          class="pagination__buttons_button button button__pagination button__pagination_prev"
          @click="prevArticlesPage"
          :disabled="currentArticlesPage === 1"
        >
          <span><ButtonSVG /></span>
          <span>{{ $t('button.prev') }}</span>
        </button>
        
        <div class="pagination__buttons_info">
          {{ currentArticlesPage }}/{{ totalArticlesPages }}
        </div>
        
        <button 
          class="pagination__buttons_button button button__pagination button__pagination_next"
          @click="nextArticlesPage"
          :disabled="currentArticlesPage === totalArticlesPages"
        >
          <span>{{ $t('button.next') }}</span>
          <span><ButtonSVG /></span>
        </button>
      </div>
      
      <!-- Альтернатива: кнопка "Загрузить еще" -->
      <!--
      <button 
        class="articles__load button__primary"
        @click="loadMoreArticles"
        v-if="articlesPerPage < articlesData.length"
      >
        <span>Загрузить еще</span>
      </button>
      -->
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
.articles__bottom {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.articles__meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.articles__date {
  color: var(--text-gray);
}
.articles__info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-gray);
  font-size: 12px;
}
.articles__category {
  color: var(--color);
}
.articles__readtime {
  color: var(--text-gray);
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