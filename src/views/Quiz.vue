<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import { ref, computed } from 'vue';
import { ElInputNumber } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

// Состояния для переключения
const showForm = ref(false);
const currentStep = ref(1);

// Состояния для счетчиков
const singleCount = ref(0);
const albumCount = ref(0);
const clipCount = ref(0);
const cardCount = ref(0);

// Цены для каждого типа
const prices = {
  single: 2590,
  album: 2590,
  clip: 2590,
  card: 2590
};

// Вычисляемая общая сумма
const totalSum = computed(() => {
  return (
    singleCount.value * prices.single +
    albumCount.value * prices.album +
    clipCount.value * prices.clip +
    cardCount.value * prices.card
  );
});

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
        <p class="quiz__desc">Пожалуйста, заполните все пункты максимально подробно – это позволит нам сделать нашу работу качественно.</p>
      </div>
      <div class="quiz__flex">
        <div class="quiz__content">
          <div class="quiz__preview" v-if="!showForm">
            <h4 class="quiz__preview_heading">Форма размещения треков Vauvision</h4>
            <p class="quiz__preview_description">Пожалуйста, заполните все пункты максимально подробно – это позволит нам сделать нашу работу качественно.</p>
            <p class="quiz__preview_attention">Внимание!</p>
            <ul class="quiz__preview_list">
              <li class="quiz__preview_item">
                <p class="quiz__preview_desc">Рекомендуется закладывать минимум 3 рабочих дня на загрузку релиза.</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Треки выходят на площадках в 00:00 выбранной даты (по Москве).</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования размера обложек используйте сайт pixlr.com</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования формата треков используйте конвертер online-audio-converter.com</p>
              </li>
              <li>
                <p class="quiz__preview_desc">После заполнения этой формы, пожалуйста, напишите сообщение в формате "Ваш псевдоним - Название релиза - ДИСТРИБУЦИЯ" в сообщения паблика vk.com/vauvisionlabel, либо телеграмм.</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Перед загрузкой клипа прочтите инструкцию.</p>
              </li>
            </ul>
            <div class="quiz__preview_buttons">
              <button class="quiz__preview_button button__black button" @click="showQuizForm"><span>Продолжить</span></button>
            </div>
          </div>

          <div class="quiz__forms" v-if="showForm">
            <div class="quiz__menu">
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 1 }" 
                @click="goToStep(1)"
              >
                <span>Шаг 1. Оформление заказа</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 2 }" 
                @click="goToStep(2)"
              >
                <span>Шаг 2. Загрузить трек</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 3 }" 
                @click="goToStep(3)"
              >
                <span>Шаг 3. Информация о треке</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 4 }" 
                @click="goToStep(4)"
              >
                <span>Шаг 4. Данные паспорта</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 5 }" 
                @click="goToStep(5)"
              >
                <span>Шаг 5. Жанр и текст</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 6 }" 
                @click="goToStep(6)"
              >
                <span>Шаг 6. Дополнительная информация</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 7 }" 
                @click="goToStep(7)"
              >
                <span>Шаг 7. Договор</span>
              </button>
              <button 
                class="quiz__menu_button button" 
                :class="{ active: currentStep === 8 }" 
                @click="goToStep(8)"
              >
                <span>Шаг 8. Финал</span>
              </button>
            </div>
            
            <!-- Шаг 1 -->
            <div class="quiz__form quiz__form_one" v-if="currentStep === 1">
              <div class="quiz__form_top">
                <h4 class="quiz__form_head">Что вы хотите загрузить?</h4>
                <button class="quiz__additional button__second button"><span>Дополнительная информация</span></button>
              </div>
              <ul class="quiz__form_one_list">
                <li class="quiz__form_one_item">
                  <h6 class="quiz__form_one_head">Сингл</h6>
                  <div class="quiz__form_one_right">
                    <p class="quiz__form_one_price">2590 ₽</p>
                    <div class="quiz__form_one_count">
                      <el-input-number 
                        v-model="singleCount" 
                        :min="0" 
                        :max="99" 
                        :controls="true"
                        :show-input="false"
                      />
                    </div>
                  </div>
                </li>
                <li class="quiz__form_one_item">
                  <h6 class="quiz__form_one_head">Альбом</h6>
                  <div class="quiz__form_one_right">
                    <p class="quiz__form_one_price">2590 ₽</p>
                    <div class="quiz__form_one_count">
                      <el-input-number 
                        v-model="albumCount" 
                        :min="0" 
                        :max="99" 
                        :controls="true"
                        :show-input="false"
                      />
                    </div>
                  </div>
                </li>
                <li class="quiz__form_one_item">
                  <h6 class="quiz__form_one_head">Клип</h6>
                  <div class="quiz__form_one_right">
                    <p class="quiz__form_one_price">2590 ₽</p>
                    <div class="quiz__form_one_count">
                      <el-input-number 
                        v-model="clipCount" 
                        :min="0" 
                        :max="99" 
                        :controls="true"
                        :show-input="false"
                      />
                    </div>
                  </div>
                </li>
                <li class="quiz__form_one_item">
                  <h6 class="quiz__form_one_head">оформление карточки</h6>
                  <div class="quiz__form_one_right">
                    <p class="quiz__form_one_price">2590 ₽</p>
                    <div class="quiz__form_one_count">
                      <el-input-number 
                        v-model="cardCount" 
                        :min="0" 
                        :max="99" 
                        :controls="true"
                        :show-input="false"
                      />
                    </div>
                  </div>
                </li>
              </ul>
              <div class="quiz__form_bottom">
                <div class="quiz__form_buttons">
                  <button 
                    class="form__back button__second button" 
                  >
                    <span><BackSVG /></span>
                    <span>Назад</span>
                  </button>
                  <button class="quiz__form_button button__black button"> <span>Продолжить</span></button>
                </div>
                <div class="quiz__form_sum">
                  <p class="quiz__form_sum_text">Итого к оплате:</p>
                  <h4 class="quiz__form_total"><span>{{ totalSum }}</span> ₽</h4>
                </div>
              </div>
            </div>
            
            <!-- Шаг 2 -->
            <div class="quiz__form quiz__form_two" v-if="currentStep === 2">
              <h4>Шаг 2. Загрузить трек</h4>
              <p>Здесь будет форма для шага 2</p>
            </div>
            
            <!-- Шаг 3 -->
            <div class="quiz__form quiz__form_three" v-if="currentStep === 3">
              <h4>Шаг 3. Информация о треке</h4>
              <p>Здесь будет форма для шага 3</p>
            </div>
            
            <!-- Шаг 4 -->
            <div class="quiz__form quiz__form_four" v-if="currentStep === 4">
              <h4>Шаг 4. Данные паспорта</h4>
              <p>Здесь будет форма для шага 4</p>
            </div>
            
            <!-- Шаг 5 -->
            <div class="quiz__form quiz__form_five" v-if="currentStep === 5">
              <h4>Шаг 5. Жанр и текст</h4>
              <p>Здесь будет форма для шага 5</p>
            </div>
            
            <!-- Шаг 6 -->
            <div class="quiz__form quiz__form_six" v-if="currentStep === 6">
              <h4>Шаг 6. Дополнительная информация</h4>
              <p>Здесь будет форма для шага 6</p>
            </div>
            
            <!-- Шаг 7 -->
            <div class="quiz__form quiz__form_seven" v-if="currentStep === 7">
              <h4>Шаг 7. Договор</h4>
              <p>Здесь будет форма для шага 7</p>
            </div>
            
            <!-- Шаг 8 -->
            <div class="quiz__form quiz__form_eight" v-if="currentStep === 8">
              <h4>Шаг 8. Финал</h4>
              <p>Здесь будет форма для шага 8</p>
            </div>
          </div>
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
}
.quiz__preview_list {
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

.quiz__forms {
  display: flex;
  width: 100%;
  padding: 50px 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.quiz__menu {
  display: flex;
  width: 330px;
  flex: 0 0 auto;
  flex-direction: column;
  border-right: 1px solid var(--border);
}
.quiz__menu_button {
  display: flex;
  padding: 14px 30px;
  align-items: center;
  gap: 8px;
  position: relative;
  color: var(--text-gray);
  background-color: var(--bg);
  transition: color 0.15s linear, background-color 0.15s linear;
  border: none;
  cursor: pointer;
}
.quiz__menu_button::after {
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
.quiz__menu_button.active,
.quiz__menu_button:hover {
  color: var(--text);
  background-color: var(--bg-color);
}
.quiz__menu_button.active::after {
  opacity: 1;
}
.quiz__form {
  width: calc(100% - 330px);
  padding: 0 40px 0 60px;
}
.quiz__form_top {
  display: flex;
  width: 100%;
  padding: 0 0 40px;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}
.quiz__additional {
  text-transform: uppercase;
}
.quiz__form_one_list {
  padding: 30px;
  border: 1px solid var(--border);
}
.quiz__form_one_item {
  display: flex;
  padding: 20px 0;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.quiz__form_one_item:not(:last-child) {
  border-bottom: 1px solid var(--border);
}
.quiz__form_one_head {
  text-transform: uppercase;
}
.quiz__form_one_right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 65px;
}
.quiz__form_bottom {
  display: flex;
  padding: 60px 0 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.quiz__form_buttons {
  display: flex;
  align-items: center;
  gap: 30px;
}
.quiz__form_sum {
  display: flex;
  align-items: center;
  gap: 15px;
}
.quiz__form_total {
  color: var(--color);
  transform: translateY(-2.5px);
}
.quiz__form_one_price {
  flex: 0 0 auto;
}
@media (max-width: 1919px) {
  .quiz__forms {
    padding: 40px 20px;
  }
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
  .quiz__form_one {
    padding: 30px;
  }
  .quiz__forms {
    flex-direction: column;
    gap: 40px;
  }
  .quiz__menu,
  .quiz__form {
    width: 100%;
  }
  .quiz__menu {
    padding: 0;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  .quiz__menu::-webkit-scrollbar {
    display: none;
    width: 0px;
  }
  .quiz__menu::-webkit-scrollbar-thumb {
    display: none;
    width: 0px;
  }
  .quiz__form_one {
    padding: 0;
  }
  .quiz__form_one_list {
    padding: 30px;
  }
  .quiz__menu_button {
    padding: 10px 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
    border: 1px solid var(--border);
    border-radius: 30px;
  }
  .quiz__menu_button::after {
    display: none;
  }
  .quiz__menu_button span {
    flex: 0 0 auto;
    white-space: nowrap;
    word-break: keep-all;
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
  .quiz__menu_button {
    padding: 12px 15px;
  }
  .quiz__form_one {
    padding: 15px;
  }
  .quiz__form_one_right {
    gap: 20px;
  }
  .quiz__form_bottom {
    padding: 40px 0 0;
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 40px;
  }
  .quiz__forms,
  .quiz__form_one_list {
    border: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .quiz__form_one_list {
    padding: 0;
  }
  .quiz__form {
    padding: 0;
  }
}
</style>