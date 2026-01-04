<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import SuccessSVG from "@/uikit/icon/SuccessSVG.vue";
import ErrorSVG from "@/uikit/icon/ErrorSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

const goBack = () => {
  emit('go-back');
};

const handleFinish = () => {
  ElMessage.success('Форма успешно завершена!');
  emit('finish');
};
</script>

<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Финал</h4>
  <p class="quiz__form_description"><SuccessSVG /> Оплата прошла. Финансовые транзакции отражены на главной странице личного кабинета.</p>
  <p class="quiz__form_description"><ErrorSVG /> Оплата не прошла. Повторите платёж через полчаса или попробуйте оплатить другим способом.</p>
  <p class="quiz__form_description">Напишите нам, если проблему не удалось решить.</p>
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
        @click="handleFinish"
      >
        <span>Завершить</span>
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