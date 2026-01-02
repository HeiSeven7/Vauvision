<script lang="ts" setup>
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  emit('go-next');
};
</script>

<template>
<div class="quiz__form quiz__form_seven">
  <h4 class="quiz__form_head">Шаг 7. Договор</h4>
  <p class="quiz__form_description">Здесь будет форма для шага 7</p>
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="goNext"
      >
        <span>Продолжить</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form {
  width: calc(100% - 330px);
  padding: 0 40px 0 60px;
}
.quiz__form_head {
  margin-bottom: 20px;
}
.quiz__form_description {
  color: var(--text-gray);
  margin-bottom: 40px;
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

@media (max-width: 1439px) {
  .quiz__form {
    width: 100%;
    padding: 0;
  }
}
@media (max-width: 767px) {
  .quiz__form_bottom {
    padding: 40px 0 0;
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 40px;
  }
  .quiz__form {
    padding: 0;
  }
}
</style>