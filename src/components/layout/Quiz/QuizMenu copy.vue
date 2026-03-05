// QuizMenu.vue
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { openDB } from 'idb';

const props = defineProps<{
  currentStep: number;
}>();

const emit = defineEmits<{
  'go-to-step': [step: number];
}>();

// Состояние доступности шагов
const availableSteps = ref<boolean[]>([true, false, false, false, false, false, false, false]);
const isLoading = ref(true);

// Функция для проверки, заполнен ли шаг
const isStepCompleted = async (step: number): Promise<boolean> => {
  try {
    const db = await openDB('quizDB', 1);
    
    switch (step) {
      case 1:
        // Шаг 1 считается заполненным, если есть хотя бы один сингл или альбом
        const quiz1State = await db.get('quizState', 'quiz1_state');
        if (!quiz1State) return false;
        return (quiz1State.singleCount || 0) > 0 || (quiz1State.albumCount || 0) > 0;
        
      case 2:
        // Шаг 2 считается заполненным, если есть данные в quiz2_state
        const quiz2State = await db.get('quizState', 'quiz2_state');
        if (!quiz2State) return false;
        
        // Проверяем, что есть хотя бы один загруженный трек с аудио
        const hasSingleTracks = quiz2State.singleTracks && 
          quiz2State.singleTracks.some((track: any) => track.uploaded || track.hasAudioUploaded);
        
        const hasAlbumTracks = quiz2State.albums && 
          quiz2State.albums.some((album: any) => 
            album.tracks && album.tracks.some((track: any) => track.uploaded)
          );
        
        return hasSingleTracks || hasAlbumTracks;
        
      case 3:
        // Шаг 3 считается заполненным, если есть данные в quiz3_state
        const quiz3State = await db.get('quizState', 'quiz3_state');
        if (!quiz3State) return false;
        
        // Проверяем наличие обязательных полей
        const formData = quiz3State.formData || {};
        return !!(
          formData.performerName &&
          formData.releaseName &&
          formData.email &&
          formData.platforms?.length > 0 &&
          formData.releaseDate &&
          formData.hasProfanity &&
          quiz3State.coverFileName
        );
        
      case 4:
        // Шаг 4 считается заполненным, если есть данные в quiz4_state
        const quiz4State = await db.get('quizState', 'quiz4_state');
        if (!quiz4State) return false;
        
        const passportData = quiz4State.formData || {};
        
        // Проверяем обязательные поля для физического лица
        const hasRequiredFields = !!(
          passportData.lastName &&
          passportData.firstName &&
          passportData.middleName &&
          passportData.passportNumber &&
          passportData.passportIssuedBy &&
          passportData.passportIssueDate &&
          passportData.registrationAddress &&
          passportData.citizenship
        );
        
        // Если ИП, проверяем дополнительные поля
        if (passportData.userType === 'entrepreneur') {
          return hasRequiredFields && !!(
            passportData.inn &&
            passportData.ogrn &&
            passportData.accountNumber &&
            passportData.bankName &&
            passportData.bankBik &&
            passportData.correspondentAccount
          );
        }
        
        return hasRequiredFields;
        
      case 5:
        // Шаг 5 считается заполненным, если есть данные в quiz5_state
        const quiz5State = await db.get('quizState', 'quiz5_state');
        if (!quiz5State) return false;
        
        const quiz5FormData = quiz5State.formData || {};
        return !!(
          quiz5FormData.genre &&
          quiz5FormData.hasDrugsMention &&
          quiz5FormData.socialLinks
        );
        
      case 6:
        // Шаг 6 считается заполненным, если есть данные в quiz6_state
        const quiz6State = await db.get('quizState', 'quiz6_state');
        if (!quiz6State) return false;
        
        const quiz6FormData = quiz6State.formData || {};
        return !!(
          quiz6FormData.platforms?.length > 0 &&
          quiz6FormData.confirmNoRightsViolation === true
        );
        
      case 7:
        // Шаг 7 считается заполненным, если есть данные в quiz7_state
        const quiz7State = await db.get('quizState', 'quiz7_state');
        if (!quiz7State) return false;
        
        const quiz7FormData = quiz7State.formData || {};
        return quiz7FormData.acceptTerms === true && quiz7FormData.acceptPrivacy === true;
        
      case 8:
        // Финальный шаг всегда доступен, если предыдущие заполнены
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking step ${step} completion:`, error);
    return false;
  }
};

// Загружаем состояние всех шагов
const loadStepsAvailability = async () => {
  isLoading.value = true;
  try {
    const newAvailableSteps = [true, false, false, false, false, false, false, false];
    
    // Шаг 1 всегда доступен
    newAvailableSteps[0] = true;
    
    // Проверяем каждый последующий шаг
    for (let step = 2; step <= 8; step++) {
      let allPreviousCompleted = true;
      
      // Проверяем все предыдущие шаги
      for (let prevStep = 1; prevStep < step; prevStep++) {
        const completed = await isStepCompleted(prevStep);
        if (!completed) {
          allPreviousCompleted = false;
          break;
        }
      }
      
      newAvailableSteps[step - 1] = allPreviousCompleted;
    }
    
    availableSteps.value = newAvailableSteps;
  } catch (error) {
    console.error('Error loading steps availability:', error);
  } finally {
    isLoading.value = false;
  }
};

// Проверяем, можно ли перейти к указанному шагу
const canGoToStep = (step: number): boolean => {
  if (step === props.currentStep) return true;
  if (step < props.currentStep) return true; // Назад можно всегда
  return availableSteps.value[step - 1];
};

const goToStep = (step: number) => {
  if (canGoToStep(step)) {
    emit('go-to-step', step);
  }
};

// При монтировании загружаем доступность шагов
onMounted(() => {
  loadStepsAvailability();
});

// Обновляем доступность при изменении currentStep
// (например, после заполнения шага и перехода дальше)
onMounted(() => {
  // Слушаем событие обновления данных
  window.addEventListener('quiz-data-updated', loadStepsAvailability);
});

// Очищаем слушатель при размонтировании
onMounted(() => {
  return () => {
    window.removeEventListener('quiz-data-updated', loadStepsAvailability);
  };
});
</script>

<template>
<div class="quiz__menu">
  <button 
    v-for="step in 8" 
    :key="step"
    class="quiz__menu_button button" 
    :class="[
      { active: currentStep === step },
      { available: canGoToStep(step) && step !== currentStep },
      { disabled: !canGoToStep(step) && step !== currentStep }
    ]" 
    @click="goToStep(step)"
    :disabled="!canGoToStep(step) && step !== currentStep"
  >
    <span>{{ getStepTitle(step) }}</span>
  </button>
</div>
</template>

<script lang="ts">
// Отдельный скрипт для функции заголовка (чтобы не загромождать setup)
export default {
  methods: {
    getStepTitle(step: number): string {
      const titles = [
        'Шаг 1. Оформление заказа',
        'Шаг 2. Загрузить трек',
        'Шаг 3. Информация о треке',
        'Шаг 4. Данные паспорта',
        'Шаг 5. Жанр и текст',
        'Шаг 6. Дополнительная информация',
        'Шаг 7. Договор',
        'Шаг 8. Финал'
      ];
      return titles[step - 1];
    }
  }
};
</script>

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

/* Стили для доступных кнопок (не активных) */
.quiz__menu_button.available {
  color: var(--text);
  cursor: pointer;
}

.quiz__menu_button.available:hover {
  color: var(--text);
  background-color: var(--bg-color);
}

/* Стили для заблокированных кнопок */
.quiz__menu_button.disabled {
  color: var(--text-gray);
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none; /* Отключаем все события мыши */
}

.quiz__menu_button.disabled:hover {
  color: var(--text-gray);
  background-color: var(--bg);
  cursor: not-allowed;
}

/* Стили для активной кнопки */
.quiz__menu_button.active {
  color: var(--text);
  background-color: var(--bg-color);
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
  
  /* Адаптивные стили для состояний */
  .quiz__menu_button.available {
    border-color: var(--border);
  }
  
  .quiz__menu_button.disabled {
    border-color: var(--border-light);
  }
  
  .quiz__menu_button.active {
    border-color: var(--yellow);
  }
}

@media (max-width: 767px) {
  .quiz__menu_button {
    padding: 12px 15px;
  }
}
</style>