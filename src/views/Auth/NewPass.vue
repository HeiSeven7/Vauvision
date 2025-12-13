<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import Logo from "@/uikit/Logo.vue";

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

  isLoading.value = true

  try {
    console.log('Данные формы:', {
      password: formData.password,
      confirm: formData.confirm
    })

    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Пароль успешно изменен!')
    
    // Сброс формы
    formData.password = ''
    formData.confirm = ''
    
  } catch (error) {
    console.error('Ошибка при восстановлении пароля:', error)
    alert('Произошла ошибка при восстановлении пароля. Попробуйте еще раз.')
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
          <div class="auth__logo"><Logo /></div>
          <div class="auth__image">
            <img src="@/assets/img/auth/auth.webp" alt="cover">
          </div>
          <div class="auth__info">
            <h3 class="auth__heading">Стань известным и популярным в мире музыки</h3>
            <p class="auth__description">Выложи трек на все площадки и продавай свою музыку во всем мире</p>
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
                :disabled="isLoading"
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
</style>