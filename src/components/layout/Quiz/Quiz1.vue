<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElInputNumber, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

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

const goBack = () => {
  emit('go-back');
};

const handleContinue = () => {
  if (totalSum.value === 0) {
    ElMessage.warning('Выберите хотя бы один тип загрузки');
    return;
  }
  emit('go-next');
};
</script>

<template>
<div class="quiz__form quiz__form_one">
  <div class="quiz__form_top">
    <h4 class="quiz__form_head">Что вы хотите загрузить?</h4>
    <button class="quiz__additional button__second button">
      <span>Дополнительная информация</span>
    </button>
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
        @click="goBack"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleContinue"
      >
        <span>Продолжить</span>
      </button>
    </div>
    <div class="quiz__form_sum">
      <p class="quiz__form_sum_text">Итого к оплате:</p>
      <h4 class="quiz__form_total"><span>{{ totalSum }}</span> ₽</h4>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
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

@media (max-width: 1439px) {
  .quiz__form_one_list {
    padding: 30px;
  }
}
@media (max-width: 767px) {
  .quiz__form_one {
    padding: 15px;
  }
  .quiz__form_one_right {
    gap: 20px;
  }
  .quiz__form_one_list {
    padding: 0;
  }
  .quiz__form_one_list {
    border: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
}
</style>