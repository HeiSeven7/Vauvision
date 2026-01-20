<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { View, Hide } from '@element-plus/icons-vue'
import Tr from "@/i18n/translation";
import Logo from "@/uikit/Logo.vue";
import BackSVG from "@/uikit/icon/BackSVG.vue";

// Текущий шаг формы (1 - первая форма, 2 - вторая форма, 3 - третья форма)
const currentStep = ref(1)

// Реактивные данные первой формы
const formData = reactive({
  firstName: '',
  lastName: '',
  referralCode: ''
})

// Реактивные данные второй формы
const secondFormData = reactive({
  userType: 'executor', // По умолчанию выбран "Исполнитель"
  executorName: '',
  labelName: ''
})

// Реактивные данные третьей формы
const thirdFormData = reactive({
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  personalData: false,
  marketing: false
})

// Состояния ошибок
const errors = reactive({
  firstName: '',
  lastName: '',
  referralCode: ''
})

// Ошибки для второй формы
const secondFormErrors = reactive({
  userType: '',
  executorName: '',
  labelName: ''
})

// Ошибки для третьей формы
const thirdFormErrors = reactive({
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  personalData: ''
})

// Состояние видимости пароля
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

// Состояние загрузки
const isLoading = ref(false)

// Валидация первой формы
const validateForm = () => {
  let isValid = true
  
  // Очистка предыдущих ошибок
  errors.firstName = ''
  errors.lastName = ''
  errors.referralCode = ''

  // Валидация имени
  if (!formData.firstName.trim()) {
    errors.firstName = 'Имя обязательно для заполнения'
    isValid = false
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'Имя должно содержать минимум 2 символа'
    isValid = false
  } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(formData.firstName.trim())) {
    errors.firstName = 'Имя может содержать только буквы, пробелы и дефисы'
    isValid = false
  }

  // Валидация фамилии (необязательное поле, но если заполнено - проверяем)
  if (formData.lastName.trim() && formData.lastName.trim().length < 2) {
    errors.lastName = 'Фамилия должна содержать минимум 2 символа'
    isValid = false
  } else if (formData.lastName.trim() && !/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(formData.lastName.trim())) {
    errors.lastName = 'Фамилия может содержать только буквы, пробелы и дефисы'
    isValid = false
  }

  // Валидация реферального кода (необязательное поле)
  if (formData.referralCode.trim() && formData.referralCode.trim().length < 3) {
    errors.referralCode = 'Реферальный код должен содержать минимум 3 символа'
    isValid = false
  }

  return isValid
}

// Валидация второй формы
const validateSecondForm = () => {
  let isValid = true
  
  secondFormErrors.userType = ''
  secondFormErrors.executorName = ''
  secondFormErrors.labelName = ''

  if (!secondFormData.userType) {
    secondFormErrors.userType = 'Выберите тип пользователя'
    isValid = false
  }

  if (secondFormData.userType === 'executor' && !secondFormData.executorName.trim()) {
    secondFormErrors.executorName = 'Имя исполнителя обязательно'
    isValid = false
  }

  if (secondFormData.userType === 'label' && !secondFormData.labelName.trim()) {
    secondFormErrors.labelName = 'Название лейбла обязательно'
    isValid = false
  }

  return isValid
}

// Валидация третьей формы
const validateThirdForm = () => {
  let isValid = true
  
  thirdFormErrors.email = ''
  thirdFormErrors.phone = ''
  thirdFormErrors.password = ''
  thirdFormErrors.confirmPassword = ''
  thirdFormErrors.personalData = ''

  // Валидация email
  if (!thirdFormData.email.trim()) {
    thirdFormErrors.email = 'Email обязателен для заполнения'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(thirdFormData.email.trim())) {
    thirdFormErrors.email = 'Введите корректный email адрес'
    isValid = false
  }

  // Валидация телефона
  if (!thirdFormData.phone.trim()) {
    thirdFormErrors.phone = 'Номер телефона обязателен'
    isValid = false
  } else if (!/^[\d\s\-\+\(\)]+$/.test(thirdFormData.phone.trim())) {
    thirdFormErrors.phone = 'Введите корректный номер телефона'
    isValid = false
  }

  // Валидация пароля
  if (!thirdFormData.password) {
    thirdFormErrors.password = 'Пароль обязателен'
    isValid = false
  } else if (thirdFormData.password.length < 6) {
    thirdFormErrors.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  } else {
    // Проверка сложности пароля
    const hasUpperCase = /[A-Z]/.test(thirdFormData.password)
    const hasLowerCase = /[a-z]/.test(thirdFormData.password)
    const hasNumbers = /\d/.test(thirdFormData.password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(thirdFormData.password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      thirdFormErrors.password = 'Пароль должен содержать заглавные и строчные буквы, цифры и специальные символы'
      isValid = false
    }
  }

  // Валидация подтверждения пароля
  if (!thirdFormData.confirmPassword) {
    thirdFormErrors.confirmPassword = 'Подтверждение пароля обязательно'
    isValid = false
  } else if (thirdFormData.password !== thirdFormData.confirmPassword) {
    thirdFormErrors.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  // Валидация согласия на обработку данных
  if (!thirdFormData.personalData) {
    thirdFormErrors.personalData = 'Необходимо согласие на обработку персональных данных'
    isValid = false
  }

  return isValid
}

// Переход ко второй форме
const goToSecondStep = () => {
  if (!validateForm()) {
    return
  }
  currentStep.value = 2
}

// Переход к третьей форме
const goToThirdStep = () => {
  if (!validateSecondForm()) {
    return
  }
  currentStep.value = 3
}

// Возврат к первой форме
const goToFirstStep = () => {
  currentStep.value = 1
}

// Возврат ко второй форме
const goBackToSecondStep = () => {
  currentStep.value = 2
}

// Отправка всей формы
const handleFinalSubmit = async () => {
  if (!validateThirdForm()) {
    return
  }

  isLoading.value = true

  try {
    console.log('Все данные формы:', {
      ...formData,
      ...secondFormData,
      ...thirdFormData
    })

    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Регистрация успешно завершена!')
    
    // Сброс всех данных
    Object.assign(formData, {
      firstName: '',
      lastName: '',
      referralCode: ''
    })
    Object.assign(secondFormData, {
      userType: 'executor',
      executorName: '',
      labelName: ''
    })
    Object.assign(thirdFormData, {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      personalData: false,
      marketing: false
    })
    currentStep.value = 1
    
  } catch (error) {
    console.error('Ошибка при регистрации:', error)
    alert('Произошла ошибка при регистрации. Попробуйте еще раз.')
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
          <div class="auth__top">
            <p class="auth__acc text_small">У вас уже есть аккаунт?</p>
            <RouterLink class="auth__login button__second button" :to="Tr.i18nRoute({ name: 'login' })">
              <span>Войти</span>
            </RouterLink>
          </div>

          <!-- Первая форма -->
          <div v-if="currentStep === 1" class="auth__form">
            <div class="form__heading">
              <h1 class="form__head title_two">Регистрация</h1>
            </div>
            <div class="form__flex">
              <!-- Поле имени -->
              <div class="form__group">
                <label for="firstName" class="form__label button">Ваше имя<span>*</span></label>
                <el-input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  :class="{ 'error': errors.firstName }"
                  placeholder="Введите ваше имя"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.firstName = ''"
                  size="large"
                />
                <div v-if="errors.firstName" class="error text_very">
                  {{ errors.firstName }}
                </div>
              </div>

              <!-- Поле фамилии -->
              <div class="form__group">
                <label for="lastName" class="form__label button">Ваша фамилия</label>
                <el-input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  :class="{ 'error': errors.lastName }"
                  placeholder="Введите вашу фамилию"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.lastName = ''"
                  size="large"
                />
                <div v-if="errors.lastName" class="error text_very">
                  {{ errors.lastName }}
                </div>
              </div>

              <!-- Поле реферального кода -->
              <div class="form__group">
                <label for="referralCode" class="form__label button">Реферальный код</label>
                <div class="form__hint text_small">
                  Если у вас нет кода или почты партнёра, оставьте это поле пустым.
                </div>
                <el-input
                  id="referralCode"
                  v-model="formData.referralCode"
                  type="text"
                  :class="{ 'error': errors.referralCode }"
                  placeholder="Введите код"
                  :disabled="isLoading"
                  @blur="validateForm"
                  @input="errors.referralCode = ''"
                  size="large"
                />
                <div v-if="errors.referralCode" class="error text_very">
                  {{ errors.referralCode }}
                </div>
              </div>
            </div>
            <div class="form__buttons">
              <button 
                class="form__send button__black button" 
                @click="goToSecondStep"
                :disabled="isLoading"
              >
                <span>Продолжить</span>
              </button>
            </div>
          </div>

          <!-- Вторая форма -->
          <div v-else-if="currentStep === 2" class="auth__form">
            <div class="form__heading">
              <h1 class="form__head title_two">Выберите тип аккаунта</h1>
            </div>
            
            <div class="form__flex">
              <!-- Чекбоксы выбора типа -->
              <div class="form__group">
                <label class="form__label button">Тип учетной записи<span>*</span></label>
                <p class="form__desc text_small">
                  Выбирайте «Исполнитель», если вы один артист с одним псевдонимом. 
                  Выбирайте «Лейбл», если собираетесь загружать много релизов от разных артистов.
                </p>
                <div class="form__labels">
                  <label class="form__label">
                    <input 
                      type="radio" 
                      v-model="secondFormData.userType" 
                      value="executor"
                      class="form__label_input"
                    >
                    <span class="form__label_text">Исполнитель</span>
                  </label>
                  <label class="form__label">
                    <input 
                      type="radio" 
                      v-model="secondFormData.userType" 
                      value="label"
                      class="form__label_input"
                    >
                    <span class="form__label_text">Лейбл</span>
                  </label>
                </div>
                <div v-if="secondFormErrors.userType" class="error text_very">
                  {{ secondFormErrors.userType }}
                </div>
                <p class="form__description text_very">
                  Пожалуйста, впишите именно ПСЕВДОНИМ АРТИСТА, 
                  под которым будут выкладываться релизы. 
                  Если вы планируете публиковать релизы от 
                  разных псевдонимов, то сделайте несколько 
                  профилей из расчёта «1 профиль = 1 псевдоним», 
                  либо аккаунт лейбла.
                </p>
              </div>

              <!-- Поле для исполнителя -->
              <div v-if="secondFormData.userType === 'executor'" class="form__group">
                <label class="form__label button">Имя исполнителя<span>*</span></label>
                <el-input
                  v-model="secondFormData.executorName"
                  type="text"
                  :class="{ 'error': secondFormErrors.executorName }"
                  placeholder="Введите имя исполнителя"
                  :disabled="isLoading"
                  @blur="validateSecondForm"
                  @input="secondFormErrors.executorName = ''"
                  size="large"
                />
                <div v-if="secondFormErrors.executorName" class="error text_very">
                  {{ secondFormErrors.executorName }}
                </div>
              </div>

              <!-- Поле для лейбла -->
              <div v-if="secondFormData.userType === 'label'" class="form__group">
                <label class="form__label button">Имя лейбла<span>*</span></label>
                <el-input
                  v-model="secondFormData.labelName"
                  type="text"
                  :class="{ 'error': secondFormErrors.labelName }"
                  placeholder="Введите название лейбла"
                  :disabled="isLoading"
                  @blur="validateSecondForm"
                  @input="secondFormErrors.labelName = ''"
                  size="large"
                />
                <div v-if="secondFormErrors.labelName" class="error text_very">
                  {{ secondFormErrors.labelName }}
                </div>
              </div>
            </div>

            <div class="form__buttons">
              <button 
                class="form__back button__second button" 
                @click="goToFirstStep"
                :disabled="isLoading"
              >
                <span><BackSVG /></span>
                <span>Назад</span>
              </button>
              <button 
                class="form__send button__black button" 
                @click="goToThirdStep"
                :disabled="isLoading"
              >
                <span>Продолжить</span>
              </button>
            </div>
          </div>

          <!-- Третья форма -->
          <div v-else class="auth__form">
            <div class="form__heading">
              <h1 class="form__head title_two">Контактные данные</h1>
            </div>
            
            <div class="form__flex">
              <!-- Поле email -->
              <div class="form__group">
                <label for="email" class="form__label button">Электронная почта<span>*</span></label>
                <el-input
                  id="email"
                  v-model="thirdFormData.email"
                  type="email"
                  :class="{ 'error': thirdFormErrors.email }"
                  placeholder="Введите ваш e-mail"
                  :disabled="isLoading"
                  @blur="validateThirdForm"
                  @input="thirdFormErrors.email = ''"
                  size="large"
                />
                <div v-if="thirdFormErrors.email" class="error text_very">
                  {{ thirdFormErrors.email }}
                </div>
              </div>

              <!-- Поле телефона -->
              <div class="form__group">
                <label for="phone" class="form__label button">Номер телефона<span>*</span></label>
                <el-input
                  id="phone"
                  v-model="thirdFormData.phone"
                  type="tel"
                  :class="{ 'error': thirdFormErrors.phone }"
                  placeholder="Введите номер телефона"
                  :disabled="isLoading"
                  @blur="validateThirdForm"
                  @input="thirdFormErrors.phone = ''"
                  size="large"
                />
                <div v-if="thirdFormErrors.phone" class="error text_very">
                  {{ thirdFormErrors.phone }}
                </div>
              </div>

              <!-- Поле пароля с глазком -->
              <div class="form__group">
                <label for="password" class="form__label button">Пароль<span>*</span></label>
                <el-input
                  id="password"
                  v-model="thirdFormData.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  :class="{ 'error': thirdFormErrors.password }"
                  placeholder="Введите пароль"
                  :disabled="isLoading"
                  @blur="validateThirdForm"
                  @input="thirdFormErrors.password = ''"
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
                <div v-if="thirdFormErrors.password" class="error text_very">
                  {{ thirdFormErrors.password }}
                </div>
              </div>

              <!-- Поле подтверждения пароля с глазком -->
              <div class="form__group">
                <label for="confirmPassword" class="form__label button">Повторите пароль<span>*</span></label>
                <el-input
                  id="confirmPassword"
                  v-model="thirdFormData.confirmPassword"
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  :class="{ 'error': thirdFormErrors.confirmPassword }"
                  placeholder="Повторите пароль"
                  :disabled="isLoading"
                  @blur="validateThirdForm"
                  @input="thirdFormErrors.confirmPassword = ''"
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
                <div v-if="thirdFormErrors.confirmPassword" class="error text_very">
                  {{ thirdFormErrors.confirmPassword }}
                </div>
              </div>

              <!-- Чекбоксы согласия -->
              <div class="form__group">
                <div class="form__checkboxes">
                  <el-checkbox 
                    v-model="thirdFormData.personalData" 
                    :disabled="isLoading"
                    :class="{ 'error': thirdFormErrors.personalData }"
                    size="large"
                  >
                    Я даю согласие на обработку своих персональных данных
                  </el-checkbox>
                  <el-checkbox 
                    v-model="thirdFormData.marketing" 
                    :disabled="isLoading"
                    size="large"
                  >
                    Я даю согласие на рекламную рассылку
                  </el-checkbox>
                </div>
                <div v-if="thirdFormErrors.personalData" class="error text_very">
                  {{ thirdFormErrors.personalData }}
                </div>
              </div>
            </div>

            <div class="form__buttons">
              <button 
                class="form__back button__second button" 
                @click="goBackToSecondStep"
                :disabled="isLoading"
              >
                <span><BackSVG /></span>
                <span>Назад</span>
              </button>
              <button 
                class="form__send button__black button" 
                @click="handleFinalSubmit"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">Зарегистрироваться</span>
                <span v-else>Загрузка...</span>
              </button>
            </div>
          </div>

          <div class="form__step">
            <span :class="{ active: currentStep >= 1 }"></span>
            <span :class="{ active: currentStep >= 2 }"></span>
            <span :class="{ active: currentStep >= 3 }"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
</style>