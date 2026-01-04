<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import QuizForm from "@/components/layout/QuizForm.vue";
import { ref } from 'vue';

// Состояния для переключения
const showForm = ref(false);
const currentStep = ref(1);

// Функция для переключения на форму
const showQuizForm = () => {
  showForm.value = true;
};

// Функция для переключения шагов
const goToStep = (step: number) => {
  currentStep.value = step;
};
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="quiz__top">
        <h3 class="quiz__head">Выложить релиз</h3>
        <p class="quiz__desc">Пожалуйста, заполните все пункты максимально подробно – это позволит нам сделать нашу работу качественно.</p>
      </div>
      <div class="quiz__flex">
        <div class="quiz__content">
          <div class="quiz__preview" v-if="!showForm">
            <h4 class="quiz__preview_heading">Форма размещения треков Vauvision</h4>
            <p class="quiz__preview_description">Пожалуйста, заполните все пункты максимально подробно – это позволит нам сделать нашу работу качественно.</p>
            <p class="quiz__preview_attention">Внимание!</p>
            <ul class="quiz__preview_list">
              <li class="quiz__preview_item">
                <p class="quiz__preview_desc">Рекомендуется закладывать минимум 3 рабочих дня на загрузку релиза.</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Треки выходят на площадках в 00:00 выбранной даты (по Москве).</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования размера обложек используйте сайт pixlr.com</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования формата треков используйте конвертер online-audio-converter.com</p>
              </li>
              <li>
                <p class="quiz__preview_desc">После заполнения этой формы, пожалуйста, напишите сообщение в формате "Ваш псевдоним - Название релиза - ДИСТРИБУЦИЯ" в сообщения паблика vk.com/vauvisionlabel, либо телеграмм.</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Перед загрузкой клипа прочтите инструкцию.</p>
              </li>
            </ul>
            <div class="quiz__preview_buttons">
              <button class="quiz__preview_button button__black button" @click="showQuizForm"><span>Продолжить</span></button>
            </div>
          </div>

          <QuizForm 
            v-if="showForm" 
            :current-step="currentStep" 
            @update:current-step="goToStep"
          />
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.quiz__top {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.quiz__preview {
  display: flex;
  padding: 40px;
  flex-direction: column;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.quiz__preview_description,
.quiz__preview_attention {
  padding: 30px 0 0;
}
.quiz__preview_attention {
  color: var(--color);
}
.quiz__preview_list {
  padding: 20px 0 0;
}
.quiz__preview_buttons {
  padding: 60px 0 0;
}
.quiz__preview_list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  counter-reset: quiz-counter;
  list-style: none;
  padding-left: 0;
}
.quiz__preview_list li {
  position: relative;
  padding-left: 30px;
  counter-increment: quiz-counter;
}
.quiz__preview_list li::before {
  content: counter(quiz-counter) ".";
  position: absolute;
  left: 0;
  top: 2.3px;
}

@media (max-width: 1439px) {
  .personal__container {
    padding: 0;
  }
  .quiz__top {
    padding: 0 30px;
  }
  .quiz__preview {
    padding: 30px;
  }
  .quiz__preview_description {
    padding: 15px 0 0;
  }
  .quiz__preview_buttons {
    padding: 50px 0 0;
  }
}
@media (max-width: 1023px) {
  .quiz__top {
    padding: 0 20px;
  }
  .quiz__preview {
    padding: 30px 20px;
  }
}
@media (max-width: 767px) {
  .quiz__top {
    padding: 0 15px;
  }
  .quiz__preview {
    padding: 30px 15px;
  }
  .quiz__preview_buttons {
    padding: 30px 0 0;
  }
}
</style>