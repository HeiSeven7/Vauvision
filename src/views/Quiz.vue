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
                <p class="quiz__preview_desc">Для редактирования размера обложек используйте сайт <a href="https://pixlr.com" target="_blank">pixlr.com</a></p>
              </li>
              <li>
                <p class="quiz__preview_desc">Для редактирования формата треков используйте конвертер <a href="https://online-audio-converter.com" target="_blank">online-audio-converter.com</a></p>
              </li>
              <li>
                <p class="quiz__preview_desc">После заполнения этой формы, пожалуйста, напишите сообщение в формате "Ваш псевдоним - Название релиза - ДИСТРИБУЦИЯ" в сообщения паблика <a href="https://vk.com/vauvisionlabel" target="_blank">vk.com/vauvisionlabel</a>, либо <a href="https://t.me/vauvision_bot">телеграмм</a>.</p>
              </li>
              <li>
                <p class="quiz__preview_desc">Перед загрузкой клипа прочтите инструкцию.</p>
              </li>
            </ul>
            <div class="quiz__preview_buttons">
              <button 
                class="quiz__restart_button button__red button" 
                @click="restartFromBeginning"
                :disabled="isRestarting"
              >
                <span>{{ isRestarting ? 'Очистка данных...' : 'Заново' }}</span>
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
import { ref } from 'vue';

// Состояния для переключения
const showForm = ref(false);
const currentStep = ref(1);
const isRestarting = ref(false);
const quizFormRef = ref<InstanceType<typeof QuizForm> | null>(null);

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
};

// Функция для принудительного закрытия всех соединений с IndexedDB
const forceCloseAllConnections = (dbName: string): Promise<void> => {
  return new Promise((resolve) => {
    console.log(`🔄 Принудительное закрытие соединений с ${dbName}...`);
    
    // Пробуем открыть и сразу закрыть соединение несколько раз
    let attempts = 0;
    const maxAttempts = 3;
    
    const tryClose = () => {
      attempts++;
      
      try {
        const request = indexedDB.open(dbName);
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Принудительно закрываем все транзакции
          if (db.close) {
            db.close();
            console.log(`✅ Соединение с ${dbName} закрыто (попытка ${attempts})`);
          }
          
          if (attempts < maxAttempts) {
            // Делаем несколько попыток для гарантии
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
    
    // Устанавливаем таймаут на случай зависания
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
      // Даже при блокировке считаем что удаление прошло
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
    // 1. Скрываем форму
    showForm.value = false;
    
    // 2. Даем время на размонтирование компонента QuizForm
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 3. Очищаем localStorage
    const removedCount = clearLocalStorage();
    console.log(`📦 Очищено ${removedCount} записей из localStorage`);
    
    // 4. Очищаем sessionStorage
    sessionStorage.clear();
    console.log('📦 Очищен sessionStorage');
    
    // 5. Принудительно закрываем соединения с основными БД
    await forceCloseAllConnections('quizDB');
    await forceCloseAllConnections('quiz-database');
    
    // 6. Небольшая пауза после закрытия
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 7. Удаляем базы данных
    const databasesToDelete = [
      'quizDB',
      'quiz-database',
      'form-data',
      'quizFormDB',
      'vauvisionDB'
    ];
    
    // Запускаем удаление всех БД параллельно
    await Promise.allSettled(
      databasesToDelete.map(dbName => deleteDatabase(dbName))
    );
    
    // 8. Дополнительная очистка
    indexedDB.deleteDatabase('quizDB');
    
    // 9. Финальная пауза
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Очистка всех данных завершена');
    
    // 10. Вызываем полный сброс дочерних компонентов через ref
    if (quizFormRef.value) {
      await quizFormRef.value.fullReset();
    }
    
    // 11. Показываем форму с первого шага
    currentStep.value = 1;
    showForm.value = true;
    isRestarting.value = false;
    
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error);
    
    // Даже при ошибке показываем форму
    currentStep.value = 1;
    showForm.value = true;
    isRestarting.value = false;
  }
};
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