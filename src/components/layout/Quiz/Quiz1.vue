<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElInputNumber, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключ для localStorage
const STORAGE_KEY = 'quiz1_state';

// Локальные состояния
const singleCountLocal = ref(0);
const albumCountLocal = ref(0);
const clipCountLocal = ref(0);
const cardCountLocal = ref(0);

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  try {
    const stateToSave = {
      singleCount: singleCountLocal.value,
      albumCount: albumCountLocal.value,
      clipCount: clipCountLocal.value,
      cardCount: cardCountLocal.value
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

// Загрузка состояния из localStorage
const loadStateFromLocalStorage = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      singleCountLocal.value = parsedState.singleCount || 0;
      albumCountLocal.value = parsedState.albumCount || 0;
      clipCountLocal.value = parsedState.clipCount || 0;
      cardCountLocal.value = parsedState.cardCount || 0;
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Проверка, выбран ли хотя бы один сингл или альбом
const isContinueDisabled = computed(() => {
  return singleCountLocal.value === 0 && albumCountLocal.value === 0;
});

// Общая сумма
const totalSum = computed(() => {
  const prices = {
    single: 2590,
    album: 2590,
    clip: 2590,
    card: 2590
  };
  
  return (
    singleCountLocal.value * prices.single +
    albumCountLocal.value * prices.album +
    clipCountLocal.value * prices.clip +
    cardCountLocal.value * prices.card
  );
});

// При монтировании загружаем состояние из localStorage
onMounted(() => {
  loadStateFromLocalStorage();
});

const goBack = () => {
  emit('go-back');
};

const handleContinue = () => {
  if (isContinueDisabled.value) {
    ElMessage.warning('Для продолжения выберите хотя бы один сингл или альбом');
    return;
  }
  
  // Сохраняем состояние в localStorage
  saveStateToLocalStorage();
  
  emit('go-next');
};

// Сохранение состояния при изменении счетчиков
watch([singleCountLocal, albumCountLocal, clipCountLocal, cardCountLocal], () => {
  saveStateToLocalStorage();
}, { immediate: false });
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
            v-model="singleCountLocal" 
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
            v-model="albumCountLocal" 
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
            v-model="clipCountLocal" 
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
            v-model="cardCountLocal" 
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
        :disabled="isContinueDisabled"
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