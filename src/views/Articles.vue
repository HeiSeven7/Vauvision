<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import ButtonSVG from "@/uikit/icon/ButtonSVG.vue";
import { sendRequest } from '@/utils/api';

// Интерфейс для статьи из API
interface Article {
  img: string;
  name: string;
  url: string;
}

// Данные из API
const articles = ref<Article[]>([]);
const isLoading = ref(false);

// Пагинация для статей
const articlesPerPage = ref<number>(9); // Показываем по 9 статей на странице
const currentArticlesPage = ref<number>(1);

// Вычисляемые свойства для статей
const totalArticlesPages = computed(() => {
  return Math.ceil(articles.value.length / articlesPerPage.value);
});

const paginatedArticles = computed(() => {
  const start = (currentArticlesPage.value - 1) * articlesPerPage.value;
  const end = start + articlesPerPage.value;
  return articles.value.slice(start, end);
});

const showArticlesPagination = computed(() => {
  return articles.value.length > articlesPerPage.value;
});

// Методы для пагинации статей
const nextArticlesPage = () => {
  if (currentArticlesPage.value < totalArticlesPages.value) {
    currentArticlesPage.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevArticlesPage = () => {
  if (currentArticlesPage.value > 1) {
    currentArticlesPage.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Получаем базовый URL из текущего окна
const API_BASE_URL = window.location.origin;

// Функция для формирования полного URL
const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Загрузка данных
const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await sendRequest('get', '/ajax/getData.php', {});
    console.log('Данные из API:', response.data);
    
    if (response.data && response.data.articles) {
      articles.value = response.data.articles || [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    isLoading.value = false;
  }
};

// Обработка ошибок загрузки изображений
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  // Добавляем плейсхолдер
  const parent = img.parentElement;
  if (parent) {
    const placeholder = document.createElement('div');
    placeholder.className = 'articles__image_placeholder';
    parent.appendChild(placeholder);
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  fetchData();
});
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="articles__top">
        <h3 class="articles__head">Статьи</h3>
        <p class="articles__desc">Полезные статьи о музыке, продвижении и работе с VAUVISION</p>
      </div>
      
      <div class="articles__content">
        <!-- Загрузка -->
        <div v-if="isLoading" class="articles__loading">
          Загрузка статей...
        </div>
        
        <!-- Нет статей -->
        <div v-else-if="articles.length === 0" class="articles__empty">
          Статьи временно недоступны
        </div>
        
        <!-- Список статей -->
        <template v-else>
          <ul class="articles__list">
            <li 
              class="articles__item" 
              v-for="article in paginatedArticles" 
              :key="article.url"
            >
              <a :href="article.url" class="articles__link">
                <div class="articles__image">
                  <img 
                    :src="getFullUrl(article.img)" 
                    :alt="article.name"
                    @error="handleImageError"
                  >
                </div>
                <div class="articles__info">
                  <h5 class="articles__title">{{ article.name }}</h5>
                  <span class="articles__read">Читать статью →</span>
                </div>
              </a>
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
        </template>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}

.articles__top {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 0 30px;
}

.articles__head {
  text-transform: uppercase;
  font-size: 32px;
}

.articles__desc {
  color: var(--text-gray);
  max-width: 600px;
}

.articles__loading,
.articles__empty {
  padding: 60px;
  text-align: center;
  color: var(--text-gray);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.articles__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.articles__item {
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.articles__item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.articles__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.articles__image {
  position: relative;
  width: 100%;
  padding-top: 60%; /* Соотношение сторон 5:3 */
  background-color: var(--border);
  overflow: hidden;
}

.articles__image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.articles__item:hover .articles__image img {
  transform: scale(1.05);
}

.articles__image_placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--border);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18'%3E%3C/rect%3E%3Cline x1='23' y1='19' x2='1' y2='19'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 40px;
}

.articles__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  flex: 1;
}

.articles__title {
  font-size: 16px;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.articles__read {
  color: var(--color);
  font-size: 14px;
  text-transform: uppercase;
  margin-top: auto;
}

.articles__read:hover {
  text-decoration: underline;
}

.pagination__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.pagination__buttons_button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination__buttons_button:hover:not(:disabled) {
  background-color: var(--color);
  color: var(--white);
  border-color: var(--color);
}

.pagination__buttons_button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__buttons_button svg {
  width: 16px;
  height: 16px;
}

.pagination__buttons_info {
  font-size: 16px;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 1439px) {
  .articles__list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1023px) {
  .articles__list {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 767px) {
  .articles__top {
    padding: 0 0 20px;
  }
  
  .articles__head {
    font-size: 24px;
  }
  
  .articles__list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .articles__info {
    padding: 15px;
  }
  
  .articles__title {
    font-size: 14px;
  }
  
  .pagination__buttons {
    gap: 10px;
  }
  
  .pagination__buttons_button {
    padding: 8px 12px;
  }
  
  .pagination__buttons_button span:last-child {
    display: none;
  }
}

@media (max-width: 480px) {
  .articles__top {
    padding: 0 0 15px;
  }
  
  .articles__head {
    font-size: 20px;
  }
  
  .pagination__buttons_info {
    font-size: 14px;
  }
}
</style>