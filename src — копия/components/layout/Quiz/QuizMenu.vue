<script lang="ts" setup>
defineProps<{
  currentStep: number;
}>();

const emit = defineEmits<{
  'go-to-step': [step: number];
}>();

const goToStep = (step: number) => {
  emit('go-to-step', step);
};
</script>

<template>
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
</template>

<style lang="css" scoped>
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
  text-transform: none;
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
  background-color: var(--yellow);
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

@media (max-width: 1439px) {
  .quiz__menu {
    padding: 0;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 10px;
    overflow-y: hidden;
    overflow-x: scroll;
    width: 100%;
  }
  .quiz__menu::-webkit-scrollbar {
    display: none;
    width: 0px;
  }
  .quiz__menu::-webkit-scrollbar-thumb {
    display: none;
    width: 0px;
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
@media (max-width: 767px) {
  .quiz__menu_button {
    padding: 12px 15px;
  }
}
</style>