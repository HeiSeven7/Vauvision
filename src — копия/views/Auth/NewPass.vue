<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import Logo from "@/uikit/Logo.vue";
import { sendRequest } from '@/utils/api';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // Убрали useRoute
import Tr from "@/i18n/translation";

// Получаем роутер
const router = useRouter() // Убрали route

// Реактивные данные формы
const formData = reactive({
  password: '',
  confirm: ''
})

// Состояния ошибок
const errors = reactive({
  password: '',
  confirm: ''
})

// Состояния видимости паролей
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

// Состояние загрузки
const isLoading = ref(false)

// Извлечение id и confirm_code из URL
const getParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    id: urlParams.get('id') || '',
    confirm_code: urlParams.get('confirm_code') || ''
  }
}

const { id, confirm_code } = getParamsFromUrl()

// Валидация формы
const validateForm = () => {
  let isValid = true
  
  // Очистка предыдущих ошибок
  errors.password = ''
  errors.confirm = ''

  // Валидация пароля
  if (!formData.password) {
    errors.password = 'Пароль обязателен для заполнения'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  } else {
    // Проверка сложности пароля
    const hasUpperCase = /[A-Z]/.test(formData.password)
    const hasLowerCase = /[a-z]/.test(formData.password)
    const hasNumbers = /\d/.test(formData.password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      errors.password = 'Пароль должен содержать заглавные и строчные буквы, цифры и специальные символы'
      isValid = false
    }
  }

  // Валидация подтверждения пароля
  if (!formData.confirm) {
    errors.confirm = 'Подтверждение пароля обязательно'
    isValid = false
  } else if (formData.password !== formData.confirm) {
    errors.confirm = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

// Обработчик отправки формы
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  // Проверка наличия id и confirm_code
  if (!id || !confirm_code) {
    ElMessage({
      message: 'Отсутствуют параметры для восстановления пароля',
      type: 'error',
    });
    return
  }

  isLoading.value = true

  // Формируем данные для отправки в соответствии с API
  const resetData = {
    id: id,
    confirm_code: confirm_code,
    password: formData.password,
    'password-confirm': formData.confirm
  }

  try {
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/auth/changepass.php',
      resetData
    )
    
    console.log('Пароль успешно изменен:', response.data)
    
    ElMessage({
      message: 'Пароль успешно изменен!',
      type: 'success',
    });
    
    // Сброс формы
    formData.password = ''
    formData.confirm = ''
    
    // Редирект на страницу входа
    setTimeout(() => {
      router.push(Tr.i18nRoute({ name: 'login' }))
    }, 1500)
    
  } catch (error: any) {
    console.error('Ошибка при восстановлении пароля:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      // Обработка ошибок валидации
      if (errorData.password) {
        errors.password = Array.isArray(errorData.password) 
          ? errorData.password[0] 
          : errorData.password
      }
      
      if (errorData['password-confirm']) {
        errors.confirm = Array.isArray(errorData['password-confirm']) 
          ? errorData['password-confirm'][0] 
          : errorData['password-confirm']
      }
      
      if (errorData.id) {
        ElMessage({
          message: Array.isArray(errorData.id) 
            ? errorData.id[0] 
            : errorData.id,
          type: 'error',
        });
      }
      
      if (errorData.confirm_code) {
        ElMessage({
          message: Array.isArray(errorData.confirm_code) 
            ? errorData.confirm_code[0] 
            : errorData.confirm_code,
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
      }
    } else {
      ElMessage({
        message: 'Произошла ошибка при восстановлении пароля. Попробуйте еще раз.',
        type: 'error',
      });
    }
  } finally {
    isLoading.value = false
  }
}

// Проверка наличия параметров при загрузке компонента
if (!id || !confirm_code) {
  ElMessage({
    message: 'Недействительная ссылка для восстановления пароля',
    type: 'warning',
  });
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
            </div>
            <div class="form__flex">

              <!-- Поле нового пароля -->
              <div class="form__group">
                <label for="password" class="form__label button">Новый пароль</label>
                <el-input
                  id="password"
                  v-model="formData.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  :class="{ 'error': errors.password }"
                  placeholder="Введите новый пароль"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.password = ''"
                  size="large"
                >
                  <template #suffix>
                    <el-icon 
                      @click="passwordVisible = !passwordVisible"
                      style="color: var(--el-text-color-placeholder); cursor: pointer;"
                    >
                      <View v-if="passwordVisible" />
                      <Hide v-else />
                    </el-icon>
                  </template>
                </el-input>
                <div v-if="errors.password" class="error text_very">
                  {{ errors.password }}
                </div>
              </div>

              <!-- Поле подтверждения пароля -->
              <div class="form__group">
                <label for="confirmPassword" class="form__label button">Повторите пароль</label>
                <el-input
                  id="confirmPassword"
                  v-model="formData.confirm"
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  :class="{ 'error': errors.confirm }"
                  placeholder="Повторите новый пароль"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.confirm = ''"
                  size="large"
                >
                  <template #suffix>
                    <el-icon 
                      @click="confirmPasswordVisible = !confirmPasswordVisible"
                      style="color: var(--el-text-color-placeholder); cursor: pointer;"
                    >
                      <View v-if="confirmPasswordVisible" />
                      <Hide v-else />
                    </el-icon>
                  </template>
                </el-input>
                <div v-if="errors.confirm" class="error text_very">
                  {{ errors.confirm }}
                </div>
              </div>
            </div>
            <div class="form__buttons">
              <!-- Кнопка отправки -->
              <button 
                class="form__send button__black button" 
                @click="handleSubmit"
                :disabled="isLoading || !id || !confirm_code"
              >
                <span v-if="!isLoading">восстановить пароль</span>
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
</style>