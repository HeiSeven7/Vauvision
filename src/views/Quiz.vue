<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
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
                <p class="quiz__preview_desc">Для редактирования размера обложек (формат JPEG, от 1500x1500 пикселей) <a href="https://pixlr.com" target="_blank">используйте сайт</a></p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования формата треков (.wav, 16 bit, 44.1 Khz) <a href="https://online-audio-converter.com" target="_blank">используйте конвертер</a></p>
              </li>
              <li>
                <p>После заполнения этой формы, пожалуйста, напишите сообщение в формате <strong>"Ваш псевдоним - Название релиза - ДИСТРИБУЦИЯ"</strong> в сообщения паблика 
                  <a href="https://vk.com/vauvisionlabel" target="_blank" rel="noopener noreferrer">vk.com/vauvisionlabel</a>, либо <a href="https://vk.com/vauvisionlabel" target="_blank" rel="noopener noreferrer">телеграмм</a>.
                </p>
              </li>
              <li>
                <p>Перед загрузкой клипа прочтите 
                  <RouterLink :to="Tr.i18nRoute({ name: 'faq' })">
                    <span>инструкцию</span>
                  </RouterLink>.
                </p>
              </li>
            </ul>
            <div class="quiz__preview_buttons">
              <button 
                v-if="hasSavedData"
                class="quiz__restart_button button__red button" 
                @click="restartFromBeginning"
                :disabled="isRestarting"
              >
                <span>{{ isRestarting ? 'Очистка данных...' : 'Сбросить' }}</span>
              </button>
              <button class="quiz__preview_button button__black button" @click="showQuizForm"><span>Продолжить</span></button>
            </div>
          </div>

          <QuizForm 
            v-if="showForm" 
            :current-step="currentStep" 
            @update:current-step="goToStep"
            @go-back="handleGoBack"
            ref="quizFormRef"
          />
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import QuizForm from "@/components/layout/QuizForm.vue";
import { ref, onMounted } from 'vue';
import Tr from "@/i18n/translation";

// Состояния для переключения
const showForm = ref(false);
const currentStep = ref(1);
const isRestarting = ref(false);
const hasSavedData = ref(true);

// Проверка наличия сохранений в IndexedDB
const checkSavedData = async () => {
  try {
    // Проверяем существует ли база данных
    const databases = await indexedDB.databases();
    const quizDBExists = databases.some(db => db.name === 'quizDB');
    
    if (!quizDBExists) {
      console.log('База данных quizDB не существует');
      hasSavedData.value = false;
      return;
    }
    
    // Открываем базу данных
    const request = indexedDB.open('quizDB', 2);
    
    request.onerror = () => {
      console.log('Ошибка открытия базы данных');
      hasSavedData.value = false;
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Проверяем существует ли хранилище
      if (!db.objectStoreNames.contains('quizState')) {
        console.log('Хранилище quizState не существует');
        hasSavedData.value = false;
        db.close();
        return;
      }
      
      // Проверяем есть ли данные
      const transaction = db.transaction(['quizState'], 'readonly');
      const store = transaction.objectStore('quizState');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const hasData = getAllRequest.result.length > 0;
        hasSavedData.value = hasData;
        console.log('Проверка сохранений:', hasData, 'записей:', getAllRequest.result.length);
        db.close();
      };
      
      getAllRequest.onerror = () => {
        hasSavedData.value = false;
        db.close();
      };
    };
    
  } catch (error) {
    console.error('Ошибка проверки сохранений:', error);
    hasSavedData.value = false;
  }
};

// Функция для переключения на форму
const showQuizForm = () => {
  showForm.value = true;
};

// Функция для переключения шагов
const goToStep = (step: number) => {
  currentStep.value = step;
};

// Функция для возврата к превью
const handleGoBack = () => {
  showForm.value = false;
  currentStep.value = 1;
  // При возврате проверяем наличие сохранений
  checkSavedData();
};

// Функция для принудительного закрытия всех соединений с IndexedDB
const forceCloseAllConnections = (dbName: string): Promise<void> => {
  return new Promise((resolve) => {
    console.log(`🔄 Принудительное закрытие соединений с ${dbName}...`);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    const tryClose = () => {
      attempts++;
      
      try {
        const request = indexedDB.open(dbName);
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (db.close) {
            db.close();
            console.log(`✅ Соединение с ${dbName} закрыто (попытка ${attempts})`);
          }
          
          if (attempts < maxAttempts) {
            setTimeout(tryClose, 100);
          } else {
            resolve();
          }
        };
        
        request.onerror = () => {
          console.log(`⚠️ Не удалось открыть ${dbName} для закрытия`);
          if (attempts < maxAttempts) {
            setTimeout(tryClose, 100);
          } else {
            resolve();
          }
        };
        
        request.onblocked = () => {
          console.log(`⚠️ Открытие ${dbName} заблокировано`);
          if (attempts < maxAttempts) {
            setTimeout(tryClose, 200);
          } else {
            resolve();
          }
        };
      } catch (error) {
        console.error(`❌ Ошибка при закрытии ${dbName}:`, error);
        resolve();
      }
    };
    
    tryClose();
  });
};

// Функция для удаления базы данных с таймаутом
const deleteDatabase = (dbName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`🗑️ Попытка удаления ${dbName}...`);
    
    const request = indexedDB.deleteDatabase(dbName);
    
    const timeoutId = window.setTimeout(() => {
      console.log(`⏱️ Таймаут удаления ${dbName}, считаем успешным`);
      resolve(true);
    }, 2000);
    
    request.onsuccess = () => {
      window.clearTimeout(timeoutId);
      console.log(`✅ База данных ${dbName} успешно удалена`);
      resolve(true);
    };
    
    request.onerror = () => {
      window.clearTimeout(timeoutId);
      console.error(`❌ Ошибка при удалении ${dbName}:`, request.error);
      resolve(false);
    };
    
    request.onblocked = () => {
      window.clearTimeout(timeoutId);
      console.warn(`⚠️ Удаление ${dbName} заблокировано, но продолжаем...`);
      resolve(true);
    };
  });
};

// Функция для очистки localStorage
const clearLocalStorage = () => {
  console.log('🔄 Очистка localStorage...');
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('quiz') || key.includes('form') || key.includes('draft') || key.includes('state'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Удален ключ localStorage: ${key}`);
  });
  
  return keysToRemove.length;
};

// Основная функция очистки
const restartFromBeginning = async () => {
  if (isRestarting.value) return;
  
  isRestarting.value = true;
  console.log('🔄 Начало очистки всех данных...');
  
  try {
    // 1. Очищаем localStorage
    const removedCount = clearLocalStorage();
    console.log(`📦 Очищено ${removedCount} записей из localStorage`);
    
    // 2. Очищаем sessionStorage
    sessionStorage.clear();
    console.log('📦 Очищен sessionStorage');
    
    // 3. Принудительно закрываем соединения с основными БД
    await forceCloseAllConnections('quizDB');
    await forceCloseAllConnections('quiz-database');
    await forceCloseAllConnections('audioDB');
    await forceCloseAllConnections('filesDB');
    
    // 4. Небольшая пауза после закрытия
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 5. Удаляем базы данных
    const databasesToDelete = [
      'quizDB',
      'quiz-database',
      'form-data',
      'quizFormDB',
      'vauvisionDB',
      'audioDB',
      'filesDB'
    ];
    
    await Promise.allSettled(
      databasesToDelete.map(dbName => deleteDatabase(dbName))
    );
    
    // 6. Финальная пауза
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Очистка всех данных завершена');
    
    // 7. Обновляем состояние кнопки
    hasSavedData.value = false;
    
    // 8. Перезагружаем страницу для полного обновления
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error);
    // В случае ошибки все равно перезагружаем
    window.location.reload();
  } finally {
    isRestarting.value = false;
  }
};

// При монтировании просто устанавливаем hasSavedData в true
onMounted(() => {
  hasSavedData.value = true;
});
</script>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
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
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
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
.quiz__preview_heading,
.quiz__preview_description,
.quiz__preview_attention,
.quiz__preview_list,
.quiz__preview_buttons {
  max-width: 860px;
}

.quiz__restart_button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 1439px) {
  .personal__container {
    padding: 0;
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
  .quiz__preview {
    padding: 30px 20px;
  }
  .quiz__preview_buttons {
    gap: 15px;
  }
}
@media (max-width: 767px) {
  .quiz__preview {
    padding: 30px 15px;
  }
  .quiz__preview_buttons {
    padding: 30px 0 0;
    flex-direction: column;
  }
  .quiz__preview_button,
  .quiz__restart_button {
    width: 100%;
  }
}
</style>