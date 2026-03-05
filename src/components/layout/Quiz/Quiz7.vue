<template>
  <div class="quiz__form quiz__form_seven">
    <h4 class="quiz__form_head">Договор</h4>
    <p class="quiz__form_description">Пожалуйста, проверьте договор. Если всё верно, то переходите к следующему шагу и оплате. Если нужно что-то исправить, то вернитесь назад. Для перехода на следующий шаг пролистайте вниз страницы.</p>
    
    <div class="quiz__form_agreement">
      <img src="@/assets/img/quiz/agreement_1.webp" alt="Страница 1 договора" loading="lazy">
      <img src="@/assets/img/quiz/agreement_2.webp" alt="Страница 2 договора" loading="lazy">
      <img src="@/assets/img/quiz/agreement_3.webp" alt="Страница 3 договора" loading="lazy">
      <img src="@/assets/img/quiz/agreement_4.webp" alt="Страница 4 договора" loading="lazy">
    </div>
    
    <div class="quiz__form_checkboxes">
      <div class="form__checkbox_group" :class="{ 'error': errors.acceptTerms }">
        <el-checkbox
          v-model="formData.acceptTerms"
          @change="() => handleCheckboxChange('acceptTerms')"
          size="large"
        >
          <span class="checkbox__text">
            Я принимаю условия <a href="/offer" target="_blank" class="checkbox__link">публичной оферты</a>*
          </span>
        </el-checkbox>
        <div v-if="errors.acceptTerms" class="error text_very">
          {{ errors.acceptTerms }}
        </div>
      </div>
      
      <div class="form__checkbox_group" :class="{ 'error': errors.acceptPrivacy }">
        <el-checkbox
          v-model="formData.acceptPrivacy"
          @change="() => handleCheckboxChange('acceptPrivacy')"
          size="large"
        >
          <span class="checkbox__text">
            Я даю согласие на обработку <a href="/privacy" target="_blank" class="checkbox__link">персональных данных</a>*
          </span>
        </el-checkbox>
        <div v-if="errors.acceptPrivacy" class="error text_very">
          {{ errors.acceptPrivacy }}
        </div>
      </div>
      
      <div class="form__checkbox_group">
        <el-checkbox
          v-model="formData.acceptMarketing"
          @change="() => handleCheckboxChange('acceptMarketing')"
          size="large"
        >
          <span class="checkbox__text">
            Я даю согласие на получение рекламных рассылок и специальных предложений
          </span>
        </el-checkbox>
      </div>
    </div>
    
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
          :disabled="!isReadyForNextStep"
          :class="{ 'button__disabled': !isReadyForNextStep }"
        >
          <span>подписать договор и оплатить</span>
        </button>
      </div>
      
      <div class="quiz__form_hint" v-if="!isReadyForNextStep">
        <p class="text_small">Обязательно дождитесь полной загрузки формы, не закрывайте вкладку! Спасибо, что выбрали нас!</p>
      </div>
    </div>

    <!-- Кастомный попап для подписи -->
    <SignaturePopup
      v-if="showSignaturePopup"
      @close="closeSignaturePopup"
      @submit="handleSignatureSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElCheckbox, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import SignaturePopup from '@/components/layout/Signature.vue';
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [data: any];
}>();

// Ключи для хранения
const STORAGE_KEY = 'quiz7_state';
const DB_NAME = 'quizDB';
const DB_VERSION = 1;

const quizDB = ref<any>(null);
const dataLoaded = ref(false);

// Состояние попапа
const showSignaturePopup = ref(false);

// Таймер для debounce сохранения
let saveTimeout: NodeJS.Timeout | null = null;

// Типы для формы
interface FormData {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

interface FormErrors {
  acceptTerms: string;
  acceptPrivacy: string;
  acceptMarketing: string;
}

// Данные формы
const formData = reactive<FormData>({
  acceptTerms: false,
  acceptPrivacy: false,
  acceptMarketing: false
});

// Ошибки валидации
const errors = reactive<FormErrors>({
  acceptTerms: '',
  acceptPrivacy: '',
  acceptMarketing: ''
});

// Инициализация IndexedDB
const initDB = async () => {
  quizDB.value = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('quizState')) {
        const store = db.createObjectStore('quizState', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  if (!dataLoaded.value) return;
  
  try {
    const stateToSave = {
      id: STORAGE_KEY,
      formData: { ...formData },
      timestamp: Date.now()
    };
    
    await quizDB.value.put('quizState', stateToSave);
    console.log('Quiz7 state saved to IndexedDB');
  } catch (error) {
    console.error('Error saving Quiz7 state to IndexedDB:', error);
  }
};

// Загрузка состояния из IndexedDB
const loadStateFromDB = async () => {
  try {
    const savedState = await quizDB.value.get('quizState', STORAGE_KEY);
    if (savedState) {
      console.log('Loading Quiz7 from IndexedDB:', savedState);
      
      // Восстанавливаем данные формы
      if (savedState.formData) {
        formData.acceptTerms = savedState.formData.acceptTerms || false;
        formData.acceptPrivacy = savedState.formData.acceptPrivacy || false;
        formData.acceptMarketing = savedState.formData.acceptMarketing || false;
      }
    }
  } catch (error) {
    console.error('Error loading Quiz7 state from IndexedDB:', error);
  }
};

// Правила валидации
const validationRules = {
  acceptTerms: (value: boolean) => {
    if (!value) return 'Необходимо принять условия оферты';
    return '';
  },
  acceptPrivacy: (value: boolean) => {
    if (!value) return 'Необходимо дать согласие на обработку персональных данных';
    return '';
  },
  acceptMarketing: (_: boolean) => {
    return ''; // Это поле необязательное
  }
};

// Валидация конкретного поля
const validateField = async (fieldName: keyof FormErrors): Promise<boolean> => {
  const value = formData[fieldName as keyof FormData];
  const validator = validationRules[fieldName as keyof typeof validationRules];
  
  if (validator) {
    errors[fieldName] = validator(value);
    debouncedSave();
    return !errors[fieldName];
  }
  
  return true;
};

// Валидация всей формы
const validateForm = async (): Promise<boolean> => {
  let isValid = true;
  
  const requiredFields: (keyof FormErrors)[] = ['acceptTerms', 'acceptPrivacy'];
  
  for (const field of requiredFields) {
    if (!await validateField(field)) {
      isValid = false;
    }
  }
  
  debouncedSave();
  return isValid;
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  return formData.acceptTerms && formData.acceptPrivacy;
});

// Обработчик изменений чекбоксов
const handleCheckboxChange = async (fieldName: keyof FormData) => {
  await validateField(fieldName as keyof FormErrors);
  
  // Если это обязательное поле и оно стало true, очищаем ошибку
  if (fieldName === 'acceptTerms' && formData.acceptTerms) {
    errors.acceptTerms = '';
  }
  if (fieldName === 'acceptPrivacy' && formData.acceptPrivacy) {
    errors.acceptPrivacy = '';
  }
  if (fieldName === 'acceptMarketing') {
    errors.acceptMarketing = '';
  }
  
  debouncedSave();
};

const goBack = () => {
  emit('go-back');
};

const handleContinue = async () => {
  const formValid = await validateForm();
  
  if (formValid) {
    // Проверяем, что пользователь действительно проскроллил вниз (опционально)
    const agreementSection = document.querySelector('.quiz__form_agreement');
    if (agreementSection) {
      const sectionBottom = agreementSection.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;
      
      if (sectionBottom > viewportHeight + 100) {
        // Если пользователь не проскроллил достаточно далеко, показываем предупреждение
        ElMessage.warning({
          message: 'Пожалуйста, просмотрите договор полностью перед продолжением',
          duration: 3000
        });
        
        // Прокручиваем к договору
        agreementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    // Показываем попап для подписи
    showSignaturePopup.value = true;
    document.documentElement.classList.add('noscroll');
  } else {
    ElMessage.warning({
      message: 'Пожалуйста, примите обязательные условия договора',
      duration: 3000
    });
    
    // Прокручиваем к первому полю с ошибкой
    const firstErrorField = document.querySelector('.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

const closeSignaturePopup = () => {
  showSignaturePopup.value = false;
  document.documentElement.classList.remove('noscroll');
};

const handleSignatureSubmit = async (signatureData: string) => {
  console.log('Подпись получена:', signatureData);
  closeSignaturePopup();
  
  // Собираем данные для отправки
  const dataToSend = {
    acceptTerms: formData.acceptTerms,
    acceptPrivacy: formData.acceptPrivacy,
    acceptMarketing: formData.acceptMarketing,
    signature: signatureData,
    timestamp: new Date().toISOString()
  };
  
  console.log('Данные договора с подписью:', dataToSend);
  
  // ⚠️⚠️⚠️ НЕ ОЧИЩАЕМ СОСТОЯНИЕ ПРИ ПЕРЕХОДЕ!
  // Состояние остается в IndexedDB
  
  emit('go-next', dataToSend);
};

// Debounced save
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    if (dataLoaded.value) {
      saveStateToDB();
    }
  }, 500);
};

// Watchers для чекбоксов
watch(() => formData.acceptTerms, () => {
  if (dataLoaded.value) debouncedSave();
});

watch(() => formData.acceptPrivacy, () => {
  if (dataLoaded.value) debouncedSave();
});

watch(() => formData.acceptMarketing, () => {
  if (dataLoaded.value) debouncedSave();
});

// Функция для прокрутки к чекбоксам (может быть вызвана из родительского компонента)
const scrollToCheckboxes = () => {
  const checkboxesSection = document.querySelector('.quiz__form_checkboxes');
  if (checkboxesSection) {
    checkboxesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Экспортируем функции, если нужно использовать извне
defineExpose({
  validateForm,
  scrollToCheckboxes
});

// Загрузка состояния при монтировании компонента
onMounted(async () => {
  try {
    await initDB();
    await loadStateFromDB();
    dataLoaded.value = true;
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});

// Сохраняем состояние при покидании страницы
const handleBeforeUnload = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveStateToDB();
};

// Сохраняем состояние при изменении видимости вкладки
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveStateToDB();
  }
};

// Добавляем обработчики событий
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// Очистка при размонтировании
onUnmounted(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

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
.quiz__form_agreement {
  display: flex;
  padding: 20px 0 0;
  flex-direction: column;
  gap: 20px;
}
.quiz__form_agreement img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--border);
}
.quiz__form_checkboxes {
  display: flex;
  padding: 20px 0 0;
  flex-direction: column;
  gap: 10px;
}
.quiz__form_description {
  padding: 20px 0 0;
}
.form__checkbox_group .el-checkbox {
  display: flex;
  min-height: auto;
  align-items: center;
  gap: 10px;
  color: var(--text-gray);
}
.form__group .form__checkbox_group .el-checkbox {
  padding: 10px 0 0;
}
.checkbox__link {
  color: var(--color);
  text-decoration: underline;
}
.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
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