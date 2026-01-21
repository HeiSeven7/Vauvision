<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";
import BackSVG from "@/uikit/icon/BackSVG.vue";

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

  try {
    // Логика отправки email для восстановления пароля
    console.log('Email для восстановления пароля:', {
      email: formData.email.trim()
    })

    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Успешная отправка - показываем описание
    isSubmitted.value = true
    alert('Ссылка для восстановления пароля отправлена на ваш email!')
    
    // Сброс формы
    formData.email = ''
    
  } catch (error) {
    console.error('Ошибка при отправке:', error)
    alert('Произошла ошибка при отправке. Попробуйте еще раз.')
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
              <!-- Поле имени -->
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
                <p v-if="isSubmitted" class="form__description text_very">
                  Если у вас есть учётная запись Vauvision, 
                  соответствующая этому адресу электронной почты, 
                  вы получите ссылку для сброса пароля в течение 
                  следующих 10 минут. Если вы её не видите, 
                  проверьте папку со спамом.
                </p>
              </div>
            </div>
            <div class="form__buttons">
              <RouterLink class="auth__back button__second button" :to="Tr.i18nRoute({ name: 'login' })">
                <span><BackSVG /></span>
                <span>Назад</span>
              </RouterLink>
              <!-- Кнопка отправки -->
              <button 
                class="form__send button__black button" 
                @click="handleSubmit"
                :disabled="isLoading"
                :loading="isLoading"
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
</style>