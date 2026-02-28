<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sendRequest } from '@/utils/api';
import { ElMessage } from 'element-plus';
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";

const route = useRoute()

// Состояния для UI
const isLoading = ref(true)
const isSuccess = ref(false)
const errorMessage = ref('')

// Функция для отправки данных на /ajax/auth/regFin.php
const confirmRegistration = async (id: string, confirmCode: string) => {
  try {
    isLoading.value = true
    
    const response = await sendRequest(
      "post",
      '/ajax/auth/regFin.php',
      { 
        id: id,
        confirm_code: confirmCode 
      }
    )
    
    // Если код 200 - успех
    if (response.status === 200 || response.data?.success) {
      isSuccess.value = true
      errorMessage.value = ''
      
      ElMessage({
        message: 'Регистрация успешно подтверждена!',
        type: 'success',
      });
    } else {
      // Если ответ не 200, но и не ошибка
      throw new Error('Неизвестный ответ от сервера')
    }
    
  } catch (error: any) {
    console.error('Ошибка подтверждения регистрации:', error)
    
    isSuccess.value = false
    
    // Получаем сообщение об ошибке из ответа или используем стандартное
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Не удалось подтвердить регистрацию. Возможно, ссылка устарела или данные неверны.'
    }
    
    ElMessage({
      message: errorMessage.value,
      type: 'error',
    });
  } finally {
    isLoading.value = false
  }
}

// При монтировании компонента получаем параметры из URL
onMounted(async () => {
  const id = route.query.id as string
  const confirmCode = route.query.confirm_code as string
  
  if (id && confirmCode) {
    await confirmRegistration(id, confirmCode)
  } else {
    isLoading.value = false
    isSuccess.value = false
    errorMessage.value = 'Отсутствуют параметры подтверждения в ссылке'
    
    ElMessage({
      message: 'Неверная ссылка подтверждения',
      type: 'error',
    });
  }
})
</script>

<template>
<section class="auth">
  <div class="auth__container container">
    <div class="auth__block">
      <div class="auth__flex">
        <div class="auth__left">
          <div class="auth__left_left">
            <div class="auth__logo"><Logo /></div>
            <div class="auth__info">
              <h3 class="auth__heading">Стань известным и популярным в мире музыки</h3>
              <p class="auth__description">Выложи трек на все площадки и продавай свою музыку во всем мире</p>
            </div>
          </div>
          <div class="auth__image">
            <img src="@/assets/img/auth/auth.webp" alt="cover">
          </div>
        </div>
        
        <div class="auth__right">
          <div class="auth__top">
            <p class="auth__acc text_small">Уже есть аккаунт?</p>
            <RouterLink class="auth__login button__second button" :to="Tr.i18nRoute({ name: 'login' })">
              <span>Войти</span>
            </RouterLink>
          </div>
          
          <!-- Состояние загрузки -->
          <div class="auth__form auth__form--centered" v-if="isLoading">
            <div class="loading-spinner">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinner">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="31.4 31.4"/>
              </svg>
            </div>
            <p class="loading-text">Подтверждение регистрации...</p>
          </div>
          
          <!-- Состояние успеха -->
          <div class="auth__form auth__form--centered" v-else-if="isSuccess">
            <div class="form__heading">
              <h1 class="form__head title_two">Почта подтверждена</h1>
            </div>
            
            <!-- Иконка успеха -->
            <div class="success-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="success-message">
              <p class="success-message__text">
                Ваш email успешно подтвержден! Теперь вы можете войти в свой аккаунт и начать пользоваться всеми возможностями платформы.
              </p>
            </div>

            <div class="form__buttons form__buttons--single">
              <RouterLink 
                class="form__send button__black button" 
                :to="Tr.i18nRoute({ name: 'login' })"
              >
                <span>Перейти ко входу</span>
              </RouterLink>
            </div>
          </div>
          
          <!-- Состояние ошибки -->
          <div class="auth__form auth__form--centered" v-else>
            <div class="form__heading">
              <h1 class="form__head title_two">Ошибка подтверждения</h1>
            </div>
            
            <!-- Иконка ошибки -->
            <div class="error-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="error-message">
              <p class="error-message__text">
                {{ errorMessage || 'Не удалось подтвердить регистрацию. Возможно, ссылка устарела или данные неверны.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.auth__form--centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Стили для загрузки */
.loading-spinner {
  margin: 24px 0 16px;
  color: var(--color, #4361ee);
}

.spinner {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: var(--text-gray, #666);
  margin-bottom: 32px;
}

/* Стили для успеха */
.success-icon {
  margin: 24px 0 16px;
  color: #52c41a;
  animation: scaleIn 0.5s ease-out;
}

.success-icon svg {
  width: 80px;
  height: 80px;
}

.success-message {
  max-width: 400px;
  margin: 0 auto 32px;
}

.success-message__text {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

/* Стили для ошибки */
.error-icon {
  margin: 24px 0 16px;
  color: #ff4d4f;
  animation: scaleIn 0.5s ease-out;
}

.error-icon svg {
  width: 80px;
  height: 80px;
}

.error-message {
  max-width: 400px;
  margin: 0 auto 32px;
}

.error-message__text {
  font-size: 16px;
  line-height: 1.6;
  color: #ff4d4f;
}

.form__buttons--single {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.form__buttons--single .form__send {
  width: 100%;
  justify-content: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

/* Анимация появления иконки */
@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .success-icon svg,
  .error-icon svg {
    width: 60px;
    height: 60px;
  }

  .success-message__text,
  .error-message__text {
    font-size: 14px;
  }

  .form__buttons--single {
    max-width: 100%;
  }
}

/* Темная тема (если используется) */
:root {
  --color: #4361ee;
  --text-gray: #6c757d;
}

@media (prefers-color-scheme: dark) {
  .success-message__text {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .loading-text {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>