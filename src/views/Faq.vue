<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import ArrowSVG from "@/uikit/icon/ArrowSVG.vue";
import { ref } from 'vue';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

const faqItems = ref<FAQItem[]>([
  {
    id: 1,
    question: "Как подписать договор?",
    answer: "После успешного заполнения формы и оплаты вы увидите название своего релиза в разделе 'РЕЛИЗЫ' личного кабинета. Вам нужно скачать договор на данный релиз по кнопке 'Скачать договор'. Подписать его можно двумя способами:\n1) Полученный PDF файл нужно либо распечатать, подписать везде, где есть ваши инициалы и место для подписи, отсканировать (или аккуратно сфотографировать) все страницы, соединить в единый PDF файл и загрузить в личный кабинет по кнопке 'Загрузить договор'.\n2) Зайти на сайт https://smallpdf.com/ru/sign-pdf (или аналогичный), загрузить туда ваш договор, поставить подписи, скачать подписанный PDF документ и загрузить его в личном кабинете по кнопке 'Загрузить договор'.\nГотово!",
    isOpen: false
  },
  {
    id: 2,
    question: "Сколько времени занимает публикация релиза?",
    answer: "Обычно публикация релиза занимает от 7 до 14 рабочих дней. Время может варьироваться в зависимости от загруженности платформ.",
    isOpen: false
  },
  {
    id: 3,
    question: "Могу ли я изменить информацию о релизе после публикации?",
    answer: "Да, вы можете внести изменения в информацию о релизе, но это может потребовать дополнительного времени на модерацию.",
    isOpen: false
  },
  {
    id: 4,
    question: "Как отслеживать статистику прослушиваний?",
    answer: "Статистика доступна в вашем личном кабинете в разделе 'Аналитика'. Данные обновляются ежедневно.",
    isOpen: false
  },
  {
    id: 5,
    question: "Какие форматы файлов поддерживаются?",
    answer: "Мы поддерживаем следующие форматы: WAV (24-bit или 16-bit, 44.1 кГц или выше), FLAC, AIFF. MP3 не рекомендуется для дистрибуции.",
    isOpen: false
  }
]);

const activeItemId = ref<number | null>(null);
const contentRefs = ref<HTMLElement[]>([]);

const toggleAccordion = (id: number) => {
  if (activeItemId.value === id) {
    // Закрываем текущий элемент
    activeItemId.value = null;
    faqItems.value = faqItems.value.map(item => ({
      ...item,
      isOpen: item.id === id ? false : item.isOpen
    }));
  } else {
    // Закрываем предыдущий и открываем новый
    const prevActive = activeItemId.value;
    activeItemId.value = id;
    
    faqItems.value = faqItems.value.map(item => ({
      ...item,
      isOpen: item.id === id ? true : false
    }));

    // Анимация закрытия предыдущего элемента
    if (prevActive !== null) {
      const prevIndex = faqItems.value.findIndex(item => item.id === prevActive);
      if (prevIndex !== -1 && contentRefs.value[prevIndex]) {
        closeAccordion(contentRefs.value[prevIndex]);
      }
    }

    // Анимация открытия нового элемента
    const currentIndex = faqItems.value.findIndex(item => item.id === id);
    if (currentIndex !== -1 && contentRefs.value[currentIndex]) {
      openAccordion(contentRefs.value[currentIndex]);
    }
  }
};

const openAccordion = (element: HTMLElement) => {
  element.style.maxHeight = element.scrollHeight + 'px';
  element.style.opacity = '1';
};

const closeAccordion = (element: HTMLElement) => {
  element.style.maxHeight = '0px';
  element.style.opacity = '0';
};

const setContentRef = (el: HTMLElement, index: number) => {
  contentRefs.value[index] = el;
  
  // Инициализация состояний
  if (el) {
    const item = faqItems.value[index];
    if (item.isOpen) {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.opacity = '1';
    } else {
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
    }
  }
};
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="faq__content">
        <div class="faq__top">
          <h3 class="faq__head">ответы на ваши вопросы</h3>
          <p class="faq__desc">Не нашли ответ на вопрос? Написать в поддержку.</p>
        </div>
        <ul class="faq__list">
          <li 
            v-for="(item, index) in faqItems" 
            :key="item.id" 
            class="faq__item"
            :class="{ 'active': item.isOpen }"
          >
            <button 
              class="faq__button"
              @click="toggleAccordion(item.id)"
              :aria-expanded="item.isOpen"
              :aria-controls="`faq-content-${item.id}`"
            >
              <h5 class="faq__heading">{{ item.question }}</h5>
              <div class="faq__arrow" :class="{ 'active': item.isOpen }">
                <ArrowSVG />
              </div>
            </button>
            <div 
              :id="`faq-content-${item.id}`"
              class="faq__info"
              :ref="(el) => setContentRef(el as HTMLElement, index)"
              role="region"
              :aria-labelledby="`faq-heading-${item.id}`"
            >
              <p class="faq__description">
                {{ item.answer }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.faq__content {
  display: flex;
  width: calc(100% - 440px);
  flex-direction: column;
  gap: 20px;
}
.faq__top {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.faq__head {
  text-transform: uppercase;
}
.faq__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.faq__item {
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.faq__button {
  display: flex;
  width: 100%;
  padding: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  text-align: left;
  transition: padding 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.faq__item.active .faq__button {
  padding: 40px 40px 20px;
}
.faq__arrow {
  display: flex;
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}
.faq__arrow svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.faq__arrow.active {
  transform: rotate(180deg);
}
.faq__info {
  max-height: 0;
  opacity: 0;
  transition: 
    max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease 0.1s;
  overflow: hidden;
}
.faq__description {
  max-width: 780px;
  padding: 0 40px 40px;
}
@media (max-width: 1919px) {
  .faq__flex {
    gap: 20px;
  }
  .faq__content {
    width: calc(100% - 340px);
    gap: 30px;
  }
  .faq__button {
    padding: 30px;
  }
  .faq__item.active .faq__button {
    padding: 30px 30px 15px;
  }
  .faq__description {
    padding: 0 30px 30px;
  }
}
@media (max-width: 1439px) {
  .faq__content {
    width: 100%;
  }
  .faq__top {
    gap: 15px;
  }
}
@media (max-width: 767px) {
  .faq__content {
    gap: 15px;
  }
  .faq__button {
    padding: 20px;
  }
  .faq__item.active .faq__button {
    padding: 20px 20px 15px;
  }
  .faq__description {
    padding: 0 20px 20px;
  }
}
</style>