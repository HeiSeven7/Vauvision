<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";


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

  try {
    console.log('Данные формы:', {
      email: formData.email.trim(),
      password: formData.password,
      rememberMe: formData.rememberMe
    })

    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Вход успешно выполнен!')
    
    // Сброс формы
    formData.email = ''
    formData.password = ''
    formData.rememberMe = false
    
  } catch (error) {
    console.error('Ошибка при входе:', error)
    alert('Произошла ошибка при входе. Попробуйте еще раз.')
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