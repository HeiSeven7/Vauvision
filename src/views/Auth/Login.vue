<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import { sendRequest } from '@/utils/api';
import { ElMessage } from 'element-plus';
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";
import router from '@/router'

// Реактивные данные формы
const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Состояния ошибок
const errors = reactive({
  email: '',
  password: ''
})

// Состояние видимости пароля
const passwordVisible = ref(false)

// Состояние загрузки
const isLoading = ref(false)

// Валидация формы
const validateForm = () => {
  let isValid = true
  
  // Очистка предыдущих ошибок
  errors.email = ''
  errors.password = ''

  // Валидация email
  if (!formData.email.trim()) {
    errors.email = 'Email обязателен для заполнения'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Введите корректный email адрес'
    isValid = false
  }

  // Валидация пароля
  if (!formData.password) {
    errors.password = 'Пароль обязателен для заполнения'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов'
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

  // Используем sendRequest для отправки данных (без токена, т.к. это логин)
  await sendRequest(
    "post",
    '/ajax_vue/ajax/auth/login.php',
    {
      LOGIN: formData.email.trim(),
      PASSWORD: formData.password
    }
  )
  .then((response: any) => {
    console.log('Успешный вход:', response.data)
    ElMessage({
      message: 'Вход выполнен успешно!',
      type: 'success',
    });
    
    // Сброс формы
    formData.email = ''
    formData.password = ''
    formData.rememberMe = false
    
    // Редирект на главную или в личный кабинет
    router.push(Tr.i18nRoute({ name: 'personal' }))
  })
  .catch(error => {
    console.error('Ошибка при входе:', error)
    
    // Обработка конкретных ошибок валидации от сервера
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      // Если сервер возвращает ошибки для конкретных полей
      if (errorData.email) {
        errors.email = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email
      }
      if (errorData.password) {
        errors.password = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password
      }
      
      // Общая ошибка, если нет специфичных для полей
      if (!errorData.email && !errorData.password && errorData.detail) {
        ElMessage({
          message: errorData.detail,
          type: 'error',
        });
      } else if (!errorData.email && !errorData.password && errorData.non_field_errors) {
        // Для DRF часто используется non_field_errors
        ElMessage({
          message: Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors,
          type: 'error',
        });
      } else if (!errorData.email && !errorData.password) {
        ElMessage({
          message: 'Ошибка авторизации. Проверьте введенные данные.',
          type: 'error',
        });
      }
    } else if (error.message) {
      ElMessage({
        message: error.message,
        type: 'error',
      });
    } else {
      ElMessage({
        message: 'Произошла ошибка при подключении к серверу',
        type: 'error',
      });
    }
  })
  .finally(() => {
    isLoading.value = false
  })
}

// Функция проверки авторизации
const checkAuth = async () => {
  try {
    // GET запрос, третий аргумент - пустой объект data
    const response = await sendRequest('get', '/ajax_vue/ajax/isAuth.php', {})
    
    // Проверяем по полю error:
    // {error: false} - не авторизован
    // {error: true} - авторизован
    if (response.data?.error === true) {
      console.log('Пользователь авторизован')
      
      ElMessage({
        message: 'Вы уже авторизованы',
        type: 'info',
      });
      
      // Редирект в личный кабинет
      router.push(Tr.i18nRoute({ name: 'personal' }))
    } else {
      console.log('Пользователь не авторизован')
    }
  } catch (error) {
    // Ошибка при проверке - пользователь скорее всего не авторизован
    console.log('Не удалось проверить статус авторизации:', error)
  }
}

// Проверка авторизации при загрузке страницы
onMounted(() => {
  checkAuth()
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
            <p class="auth__acc text_small">У вас нет аккаунта?</p>
            <RouterLink class="auth__login button__second button" :to="Tr.i18nRoute({ name: 'registration' })">
              <span>Зарегистрироваться</span>
            </RouterLink>
          </div>
          <div class="auth__form">
            <div class="form__heading">
              <h1 class="form__head title_two">Вход</h1>
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
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.email = ''"
                  size="large"
                />
                <div v-if="errors.email" class="error text_very">
                  {{ errors.email }}
                </div>
              </div>

              <!-- Поле пароля с глазком -->
              <div class="form__group">
                <label for="password" class="form__label button">Пароль</label>
                <el-input
                  id="password"
                  v-model="formData.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  :class="{ 'error': errors.password }"
                  placeholder="Введите пароль"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.password = ''"
                  size="large"
                >
                  <template #suffix>
                    <el-icon 
                      @click="passwordVisible = !passwordVisible"
                      style="color: var(--el-text-color-placeholder)"
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

              <!-- Чекбокс "Запомнить меня" и ссылка -->
              <div class="form__group form__row">
                <el-checkbox 
                  v-model="formData.rememberMe" 
                  :disabled="isLoading"
                  label="Запомнить меня"
                  size="large"
                />
                <RouterLink class="auth__forgot button__second button" :to="Tr.i18nRoute({ name: 'restore' })">
                  <span>Забыли пароль?</span>
                </RouterLink>
              </div>
            </div>
            <div class="form__buttons">
              <!-- Кнопка отправки -->
              <button 
                class="form__send button__black button" 
                @click="handleSubmit"
                :disabled="isLoading"
                :loading="isLoading"
              >
                <span v-if="!isLoading">Войти</span>
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
</style>