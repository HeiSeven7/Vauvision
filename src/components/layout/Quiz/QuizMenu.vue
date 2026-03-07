<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { openDB } from 'idb';

const props = defineProps<{
  currentStep: number;
}>();

const emit = defineEmits<{
  'go-to-step': [step: number];
}>();

// Константы для IndexedDB
const DB_NAME = 'quizDB';
const DB_VERSION = 2; // Должна совпадать с версией в Quiz2
const STORE_NAME = 'quizState';

// Состояние доступности шагов
const availableSteps = ref<boolean[]>([true, false, false, false, false, false, false, false]);
const isLoading = ref(false);
const dbInitialized = ref(false);
const quizDB = ref<any>(null);

// Инициализация IndexedDB
const initDB = async (): Promise<void> => {
  try {
    console.log('QuizMenu: Initializing IndexedDB...');
    
    quizDB.value = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`QuizMenu: Upgrading DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          console.log('QuizMenu: Created quizState store');
        }
      },
    });
    
    dbInitialized.value = true;
    console.log('QuizMenu: IndexedDB initialized successfully');
    
  } catch (error) {
    console.error('QuizMenu: Error initializing IndexedDB:', error);
    dbInitialized.value = false;
  }
};

// Безопасное выполнение операций с БД
const safeDBOperation = async <T>(
  operation: () => Promise<T>, 
  fallback: T
): Promise<T> => {
  if (!dbInitialized.value || !quizDB.value) {
    console.log('QuizMenu: DB not initialized');
    return fallback;
  }
  
  try {
    // Проверяем существование хранилища
    if (!quizDB.value.objectStoreNames || !quizDB.value.objectStoreNames.contains(STORE_NAME)) {
      console.log(`QuizMenu: Store ${STORE_NAME} not found. Available stores:`, 
                  quizDB.value.objectStoreNames ? Array.from(quizDB.value.objectStoreNames) : []);
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    console.error('QuizMenu: Error in DB operation:', error);
    return fallback;
  }
};

// Функция для проверки, заполнен ли шаг
const isStepCompleted = async (step: number): Promise<boolean> => {
  return safeDBOperation(
    async () => {
      console.log(`QuizMenu: Checking step ${step} completion...`);
      
      switch (step) {
        case 1: {
          // Шаг 1: нужно хотя бы одно поле > 0
          const quiz1State = await quizDB.value.get(STORE_NAME, 'quiz1_state');
          if (!quiz1State) return false;
          const hasSelection = (quiz1State.singleCount || 0) > 0 || (quiz1State.albumCount || 0) > 0;
          console.log(`QuizMenu: Step 1 completed: ${hasSelection}`);
          return hasSelection;
        }
        
        case 2: {
          // Шаг 2: проверяем заполненность синглов и альбомов
          const quiz2State = await quizDB.value.get(STORE_NAME, 'quiz2_state');
          if (!quiz2State) return false;
          
          // Получаем количество из шага 1 для проверки
          const quiz1ForCount = await quizDB.value.get(STORE_NAME, 'quiz1_state');
          
          // Проверяем синглы
          let singlesComplete = true;
          if (quiz1ForCount?.singleCount > 0) {
            if (!quiz2State.singleTracks || quiz2State.singleTracks.length === 0) {
              singlesComplete = false;
            } else {
              singlesComplete = quiz2State.singleTracks.every((track: any) => 
                track.trackName?.trim() && 
                track.performerName?.trim() && 
                track.musicAuthor?.trim() && 
                track.textAuthor?.trim() && 
                (track.uploaded || track.hasAudioUploaded)
              );
            }
          }
          
          // Проверяем альбомы
          let albumsComplete = true;
          if (quiz1ForCount?.albumCount > 0) {
            if (!quiz2State.albums || quiz2State.albums.length === 0) {
              albumsComplete = false;
            } else {
              albumsComplete = quiz2State.albums.every((album: any) => {
                if (!album.albumName?.trim()) return false;
                if (!album.tracks || album.tracks.length === 0) return false;
                
                return album.tracks.every((track: any) => 
                  track.trackName?.trim() && 
                  track.performerName?.trim() && 
                  track.musicAuthor?.trim() && 
                  track.textAuthor?.trim() && 
                  track.uploaded
                );
              });
            }
          }
          
          const result = singlesComplete && albumsComplete;
          console.log(`QuizMenu: Step 2 completed: ${result}`);
          return result;
        }
        
        case 3: {
          // Шаг 3: проверяем все обязательные поля
          const quiz3State = await quizDB.value.get(STORE_NAME, 'quiz3_state');
          if (!quiz3State) return false;
          
          const formData3 = quiz3State.formData || {};
          const result = !!(
            formData3.performerName?.trim() &&
            formData3.releaseName?.trim() &&
            formData3.email?.trim() &&
            formData3.platforms?.length > 0 &&
            formData3.releaseDate &&
            formData3.hasProfanity !== undefined &&
            formData3.vkLink?.trim() &&
            quiz3State.coverFileInfo?.name
          );
          
          console.log(`QuizMenu: Step 3 completed: ${result}`);
          return result;
        }
        
        case 4: {
          // Шаг 4: проверяем обязательные поля
          const quiz4State = await quizDB.value.get(STORE_NAME, 'quiz4_state');
          if (!quiz4State) return false;
          
          const passportData = quiz4State.formData || {};
          
          // Общие поля для всех
          const hasCommonFields = !!(
            passportData.lastName?.trim() &&
            passportData.firstName?.trim() &&
            passportData.middleName?.trim() &&
            passportData.passportNumber?.trim() &&
            passportData.passportIssuedBy?.trim() &&
            passportData.passportIssueDate &&
            passportData.registrationAddress?.trim() &&
            passportData.citizenship
          );
          
          // Проверка гражданства
          const citizenshipValid = passportData.citizenship !== 'other' || 
                                  (passportData.citizenship === 'other' && passportData.otherCitizenship?.trim());
          
          // Если ИП, проверяем дополнительные поля
          if (passportData.userType === 'entrepreneur') {
            const result = hasCommonFields && citizenshipValid && !!(
              passportData.legalAddress?.trim() &&
              passportData.inn?.trim() &&
              passportData.ogrn?.trim() &&
              passportData.accountNumber?.trim() &&
              passportData.bankName?.trim() &&
              passportData.bankBik?.trim() &&
              passportData.correspondentAccount?.trim()
            );
            console.log(`QuizMenu: Step 4 (entrepreneur) completed: ${result}`);
            return result;
          }
          
          const result = hasCommonFields && citizenshipValid;
          console.log(`QuizMenu: Step 4 completed: ${result}`);
          return result;
        }
        
        case 5: {
          // Шаг 5: проверяем обязательные поля
          const quiz5State = await quizDB.value.get(STORE_NAME, 'quiz5_state');
          if (!quiz5State) return false;
          
          const quiz5FormData = quiz5State.formData || {};
          
          // Проверка полей
          const hasRequired = !!(
            quiz5FormData.genre?.trim() &&
            quiz5FormData.hasDrugsMention !== undefined &&
            quiz5FormData.socialLinks?.trim()
          );
          
          // Если есть упоминание наркотиков, проверяем номера треков
          if (quiz5FormData.hasDrugsMention === 'yes') {
            const result = hasRequired && !!quiz5FormData.drugsTracks?.trim();
            console.log(`QuizMenu: Step 5 (with drugs) completed: ${result}`);
            return result;
          }
          
          console.log(`QuizMenu: Step 5 completed: ${hasRequired}`);
          return hasRequired;
        }
        
        case 6: {
          // Шаг 6: проверяем обязательные поля
          const quiz6State = await quizDB.value.get(STORE_NAME, 'quiz6_state');
          if (!quiz6State) return false;
          
          const quiz6FormData = quiz6State.formData || {};
          
          // Проверка платформ
          const platformsValid = quiz6FormData.platforms?.length > 0;
          const otherPlatformValid = !quiz6FormData.platforms?.includes('other') || 
                                     quiz6FormData.otherPlatform?.trim();
          
          // Проверка бонусов
          const bonusesValid = quiz6FormData.usedBonuses >= 0 && 
                              (quiz6FormData.usedBonuses || 0) <= (quiz6State.userBonuses || 0);
          
          const result = platformsValid && 
                         otherPlatformValid && 
                         bonusesValid &&
                         quiz6FormData.confirmNoRightsViolation === true;
          
          console.log(`QuizMenu: Step 6 completed: ${result}`);
          return result;
        }
        
        case 7: {
          // Шаг 7: проверяем чекбоксы
          const quiz7State = await quizDB.value.get(STORE_NAME, 'quiz7_state');
          if (!quiz7State) return false;
          
          const quiz7FormData = quiz7State.formData || {};
          const result = quiz7FormData.acceptTerms === true && quiz7FormData.acceptPrivacy === true;
          
          console.log(`QuizMenu: Step 7 completed: ${result}`);
          return result;
        }
        
        case 8: {
          // Шаг 8: просто проверяем наличие состояния
          const quiz8State = await quizDB.value.get(STORE_NAME, 'quiz8_state');
          const result = !!quiz8State;
          console.log(`QuizMenu: Step 8 completed: ${result}`);
          return result;
        }
        
        default:
          return false;
      }
    },
    false
  );
};

// Загружаем состояние всех шагов
const loadStepsAvailability = async () => {
  if (!dbInitialized.value) {
    console.log('QuizMenu: DB not initialized yet, skipping availability check');
    return;
  }
  
  isLoading.value = true;
  try {
    console.log('QuizMenu: Loading steps availability...');
    
    const newAvailableSteps = [true, false, false, false, false, false, false, false];
    
    // Шаг 1 всегда доступен
    newAvailableSteps[0] = true;
    
    // Проверяем шаг 2
    const step1Completed = await isStepCompleted(1);
    
    if (step1Completed) {
      newAvailableSteps[1] = true;
      
      // Проверяем шаг 3
      const step2Completed = await isStepCompleted(2);
      if (step2Completed) {
        newAvailableSteps[2] = true;
        
        // Проверяем шаг 4
        const step3Completed = await isStepCompleted(3);
        if (step3Completed) {
          newAvailableSteps[3] = true;
          
          // Проверяем шаг 5
          const step4Completed = await isStepCompleted(4);
          if (step4Completed) {
            newAvailableSteps[4] = true;
            
            // Проверяем шаг 6
            const step5Completed = await isStepCompleted(5);
            if (step5Completed) {
              newAvailableSteps[5] = true;
              
              // Проверяем шаг 7
              const step6Completed = await isStepCompleted(6);
              if (step6Completed) {
                newAvailableSteps[6] = true;
                
                // Проверяем шаг 8
                const step7Completed = await isStepCompleted(7);
                if (step7Completed) {
                  newAvailableSteps[7] = true;
                }
              }
            }
          }
        }
      }
    }
    
    availableSteps.value = newAvailableSteps;
    console.log('QuizMenu: Steps availability updated:', newAvailableSteps);
    
  } catch (error) {
    console.error('QuizMenu: Error loading steps availability:', error);
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

// Функция для получения заголовка шага
const getStepTitle = (step: number): string => {
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
};

// Обработчик обновления данных
const handleDataUpdate = () => {
  console.log('QuizMenu: Data update event received');
  loadStepsAvailability();
};

// Загружаем при монтировании
onMounted(async () => {
  console.log('QuizMenu: Component mounted');
  isLoading.value = true;
  
  // Сначала инициализируем БД
  await initDB();
  
  // Затем загружаем доступность шагов
  await loadStepsAvailability();
  
  isLoading.value = false;
  
  // Слушаем события обновления данных
  window.addEventListener('quiz-data-updated', handleDataUpdate);
});

// Следим за изменением currentStep
watch(() => props.currentStep, () => {
  console.log(`QuizMenu: Current step changed to ${props.currentStep}`);
  // При смене шага перепроверяем доступность
  loadStepsAvailability();
});

// Очищаем слушатель при размонтировании
onUnmounted(() => {
  window.removeEventListener('quiz-data-updated', handleDataUpdate);
});
</script>

<template>
<div class="quiz__menu">
  <div v-if="isLoading" class="quiz__menu_loading">
    <span>Загрузка...</span>
  </div>
  <button 
    v-else
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

<style lang="css" scoped>
.quiz__menu {
  display: flex;
  width: 330px;
  flex: 0 0 auto;
  flex-direction: column;
  border-right: 1px solid var(--border);
}
.quiz__menu_loading {
  padding: 20px;
  text-align: center;
  color: var(--text-gray);
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
  pointer-events: none;
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