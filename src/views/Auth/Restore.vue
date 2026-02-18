<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { sendRequest } from '@/utils/api';
import { ElMessage } from 'element-plus';

// Состояние отправки формы
const isSubmitted = ref(false)

// Реактивные данные формы
const formData = reactive({
  email: ''
})

// Состояния ошибок
const errors = reactive({
  email: ''
})

// Состояние загрузки
const isLoading = ref(false)

// Валидация формы
const validateForm = () => {
  let isValid = true
  
  // Очистка предыдущих ошибок
  errors.email = ''

  // Валидация email
  if (!formData.email.trim()) {
    errors.email = 'Email обязателен для заполнения'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Введите корректный email адрес'
    isValid = false
  }

  return isValid
}

// Обработчик отправки формы
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  // Формируем данные для отправки в соответствии с API
  const forgotData = {
    EMAIL: formData.email.trim()
  }

  try {
    const response = await sendRequest(
      "post",
      '/ajax/auth/forgot.php',
      forgotData
    )
    
    console.log('Запрос на восстановление пароля отправлен:', response.data)
    
    // Успешная отправка - показываем описание
    isSubmitted.value = true
    
    ElMessage({
      message: 'Ссылка для восстановления пароля отправлена на ваш email!',
      type: 'success',
    });
    
    // Сброс формы
    formData.email = ''
    
  } catch (error: any) {
    console.error('Ошибка при отправке запроса на восстановление пароля:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      // Обработка ошибок валидации
      if (errorData.EMAIL) {
        errors.email = Array.isArray(errorData.EMAIL) 
          ? errorData.EMAIL[0] 
          : errorData.EMAIL
      }
      
      // Обработка ошибки, если email не найден
      if (errorData.email_not_found) {
        ElMessage({
          message: errorData.email_not_found,
          type: 'error',
        });
      }
      
      // Общая ошибка
      if (errorData.detail) {
        ElMessage({
          message: errorData.detail,
          type: 'error',
        });
      } else if (errorData.non_field_errors) {
        ElMessage({
          message: Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors,
          type: 'error',
        });
      } else if (errorData.error) {
        ElMessage({
          message: errorData.error,
          type: 'error',
        });
      }
    } else {
      ElMessage({
        message: 'Произошла ошибка при отправке запроса. Попробуйте еще раз.',
        type: 'error',
      });
    }
  } finally {
    isLoading.value = false
  }
}
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
          <div class="auth__form">
            <div class="form__heading">
              <h1 class="form__head title_two">Восстановление пароля</h1>
              <p class="form__desc title_small">Введите e-mail, на который будет отправлена ссылка с восстановлением пароля.</p>
            </div>
            <div class="form__flex">
              <!-- Поле email -->
              <div class="form__group">
                <label for="email" class="form__label button">E-mail</label>
                <el-input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  :class="{ 'error': errors.email }"
                  placeholder="Введите ваш e-mail"
                  :disabled="isLoading || isSubmitted"
                  @blur="validateForm"
                  @input="errors.email = ''"
                  size="large"
                />
                <div v-if="errors.email" class="error text_very">
                  {{ errors.email }}
                </div>
                <p v-if="isSubmitted" class="form__description text_very success-message">
                  Если у вас есть учётная запись Vauvision, 
                  соответствующая этому адресу электронной почты, 
                  вы получите ссылку для сброса пароля в течение 
                  следующих 10 минут. Если вы её не видите, 
                  проверьте папку со спамом.
                </p>
              </div>
            </div>
            <div class="form__buttons">
              <RouterLink 
                class="auth__back button__second button" 
                :to="Tr.i18nRoute({ name: 'login' })"
                :disabled="isLoading"
              >
                <span><BackSVG /></span>
                <span>Назад</span>
              </RouterLink>
              <!-- Кнопка отправки -->
              <button 
                class="form__send button__black button" 
                @click="handleSubmit"
                :disabled="isLoading || isSubmitted"
              >
                <span v-if="!isLoading">Отправить</span>
                <span v-else>Загрузка...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.error {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 4px;
}

.form__group :deep(.el-input.error .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

.success-message {
  color: var(--el-color-success);
  margin-top: 10px;
  padding: 10px;
  background-color: var(--el-color-success-light-9);
  border-radius: 4px;
}
</style>