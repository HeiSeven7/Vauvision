<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import PhotoSVG from "@/uikit/icon/PhotoSVG.vue";
import UploadSVG from "@/uikit/icon/UploadSVG.vue";

// Состояние видимости паролей
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

// Основная форма данных
const formData = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  country: '',
  password: '',
  confirmPassword: '',
  passport: {
    series: '',
    number: '',
    issuedBy: '',
    issueDate: '',
    birthDate: '',
    registrationAddress: ''
  },
  bankDetails: {
    userType: 'executor',
    fullName: '',
    accountNumber: '',
    bik: '',
    inn: '',
    kpp: '',
    bankName: '',
    correspondentAccount: ''
  }
})

// Состояние для ошибок валидации
const errors = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  country: '',
  password: '',
  confirmPassword: '',
  passport: {} as Record<string, string>,
  bankDetails: {} as Record<string, string>
})

// Загрузочное состояние
const isLoading = ref(false)

// Состояние для загрузки фото
const profileImage = ref<string | null>(null)
const isUploadingImage = ref(false)

// Валидация email
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Валидация пароля
const validatePassword = (password: string): string => {
  if (password.length < 8) return 'Пароль должен содержать минимум 8 символов'
  if (!/[A-Z]/.test(password)) return 'Пароль должен содержать заглавную букву'
  if (!/[a-z]/.test(password)) return 'Пароль должен содержать строчную букву'
  if (!/\d/.test(password)) return 'Пароль должен содержать цифру'
  return ''
}

// Основная валидация формы
const validateForm = (field?: string) => {
  if (!field || field === 'firstName') {
    errors.firstName = formData.firstName ? '' : 'Имя обязательно для заполнения'
  }
  
  if (!field || field === 'lastName') {
    errors.lastName = formData.lastName ? '' : 'Фамилия обязательна для заполнения'
  }
  
  if (!field || field === 'nickname') {
    errors.nickname = formData.nickname ? '' : 'Псевдоним обязателен для заполнения'
  }
  
  if (!field || field === 'email') {
    if (!formData.email) {
      errors.email = 'Email обязателен для заполнения'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Введите корректный email'
    } else {
      errors.email = ''
    }
  }
  
  if (!field || field === 'country') {
    errors.country = formData.country ? '' : 'Страна обязательна для заполнения'
  }
  
  if (!field || field === 'password') {
    if (formData.password) {
      errors.password = validatePassword(formData.password)
    } else {
      errors.password = ''
    }
  }
  
  if (!field || field === 'confirmPassword') {
    if (formData.confirmPassword) {
      errors.confirmPassword = formData.password === formData.confirmPassword ? '' : 'Пароли не совпадают'
    } else {
      errors.confirmPassword = ''
    }
  }
}

// Валидация паспортных данных
// const validatePassport = () => {
//   const passportErrors: Record<string, string> = {}
  
//   if (!formData.passport.series) passportErrors.series = 'Серия паспорта обязательна'
//   if (!formData.passport.number) passportErrors.number = 'Номер паспорта обязателен'
//   if (!formData.passport.issuedBy) passportErrors.issuedBy = 'Кем выдан обязательно'
//   if (!formData.passport.issueDate) passportErrors.issueDate = 'Дата выдачи обязательна'
//   if (!formData.passport.birthDate) passportErrors.birthDate = 'Дата рождения обязательна'
//   if (!formData.passport.registrationAddress) passportErrors.registrationAddress = 'Адрес регистрации обязателен'
  
//   errors.passport = passportErrors
//   return Object.keys(passportErrors).length === 0
// }

// Валидация банковских данных
const validateBankDetails = () => {
  const bankErrors: Record<string, string> = {}
  
  if (!formData.bankDetails.fullName) bankErrors.fullName = 'ФИО обязательно'
  if (!formData.bankDetails.accountNumber) bankErrors.accountNumber = 'Расчетный счет обязателен'
  if (!formData.bankDetails.bik) bankErrors.bik = 'БИК банка обязателен'
  
  if (formData.bankDetails.userType === 'label') {
    if (!formData.bankDetails.inn) bankErrors.inn = 'ИНН обязательно для ИП'
    if (!formData.bankDetails.kpp) bankErrors.kpp = 'КПП обязательно для ИП'
    if (!formData.bankDetails.bankName) bankErrors.bankName = 'Название банка обязательно'
  }
  
  errors.bankDetails = bankErrors
  return Object.keys(bankErrors).length === 0
}

// Проверка, есть ли ошибки в основной форме
const hasFormErrors = computed(() => {
  return Object.values(errors).some(error => 
    typeof error === 'string' ? error.length > 0 : false
  )
})

// Отправка личных данных
const submitPersonalData = async () => {
  validateForm()
  
  if (errors.firstName || errors.lastName || errors.email) {
    ElMessage.error('Исправьте ошибки в форме')
    return
  }
  
  isLoading.value = true
  try {
    // Здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Личные данные сохранены успешно')
  } catch (error) {
    ElMessage.error('Ошибка при сохранении данных')
  } finally {
    isLoading.value = false
  }
}

// Отправка общих данных
const submitGeneralData = async () => {
  validateForm('nickname')
  validateForm('email')
  validateForm('country')
  
  if (errors.nickname || errors.email || errors.country) {
    ElMessage.error('Исправьте ошибки в форме')
    return
  }
  
  isLoading.value = true
  try {
    // Здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Общие данные сохранены успешно')
  } catch (error) {
    ElMessage.error('Ошибка при сохранении данных')
  } finally {
    isLoading.value = false
  }
}

// Смена пароля
const changePassword = async () => {
  validateForm('password')
  validateForm('confirmPassword')
  
  if (errors.password || errors.confirmPassword) {
    ElMessage.error('Исправьте ошибки в форме пароля')
    return
  }
  
  if (!formData.password) {
    ElMessage.error('Введите новый пароль')
    return
  }
  
  isLoading.value = true
  try {
    // Здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Пароль успешно изменен')
    formData.password = ''
    formData.confirmPassword = ''
  } catch (error) {
    ElMessage.error('Ошибка при смене пароля')
  } finally {
    isLoading.value = false
  }
}

// Сохранение банковских данных
const submitBankDetails = async () => {
  if (!validateBankDetails()) {
    ElMessage.error('Исправьте ошибки в банковских данных')
    return
  }
  
  isLoading.value = true
  try {
    // Здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Банковские данные сохранены успешно')
  } catch (error) {
    ElMessage.error('Ошибка при сохранении банковских данных')
  } finally {
    isLoading.value = false
  }
}

// Загрузка фото профиля
const uploadProfileImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    ElMessage.error('Пожалуйста, выберите изображение')
    return
  }
  
  // Проверка размера файла (максимум 5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('Размер файла не должен превышать 5MB')
    return
  }
  
  isUploadingImage.value = true
  try {
    // Здесь будет API запрос для загрузки файла
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Временное решение для отображения preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    
    ElMessage.success('Фото профиля загружено успешно')
  } catch (error) {
    ElMessage.error('Ошибка при загрузке фото')
  } finally {
    isUploadingImage.value = false
    input.value = '' // Сброс input
  }
}

// Удаление фото профиля
const deleteProfileImage = () => {
  ElMessageBox.confirm(
    'Вы уверены, что хотите удалить фото профиля?',
    'Удаление фото',
    {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
    }
  ).then(() => {
    profileImage.value = null
    ElMessage.success('Фото профиля удалено')
  }).catch(() => {
    // Отмена удаления
  })
}

// Открытие модального окна для паспортных данных
const openPassportModal = () => {
  ElMessageBox.prompt('', 'Введите данные паспорта', {
    confirmButtonText: 'Сохранить',
    cancelButtonText: 'Отмена',
    title: 'Паспортные данные',
    inputType: 'textarea',
    inputPlaceholder: 'Введите серию, номер и другие данные паспорта...',
    beforeClose: async (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue
        if (value && value.trim()) {
          try {
            // Здесь будет API запрос для сохранения паспортных данных
            await new Promise(resolve => setTimeout(resolve, 500))
            ElMessage.success('Паспортные данные сохранены')
            done()
          } catch (error) {
            ElMessage.error('Ошибка при сохранении')
          }
        } else {
          ElMessage.error('Введите данные')
          return
        }
      } else {
        done()
      }
    }
  }).catch(() => {
    // Отмена
  })
}

// Удаление аккаунта
const deleteAccount = () => {
  ElMessageBox.confirm(
    'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить. Все ваши данные будут удалены.',
    'Удаление аккаунта',
    {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'error',
      confirmButtonClass: 'el-button--danger',
      dangerouslyUseHTMLString: true,
      message: `
        <div style="margin-bottom: 10px;">
          <strong>Внимание!</strong> Это действие нельзя отменить.
        </div>
        <div style="color: #f56c6c; margin-bottom: 10px;">
          Все ваши данные будут удалены без возможности восстановления.
        </div>
        <div style="color: #909399;">
          Для восстановления аккаунта напишите нам в поддержку.
        </div>
      `,
    }
  ).then(() => {
    isLoading.value = true
    // Здесь будет API запрос для удаления аккаунта
    setTimeout(() => {
      ElMessage.success('Аккаунт удален')
      // Перенаправление на главную страницу
      // router.push('/')
      isLoading.value = false
    }, 1000)
  }).catch(() => {
    // Отмена удаления
  })
}

// Инициализация данных (в реальном приложении - загрузка с сервера)
const initializeData = () => {
  // Здесь будет загрузка данных пользователя с сервера
  formData.firstName = 'Иван'
  formData.lastName = 'Иванов'
  formData.nickname = 'artist123'
  formData.email = 'user@example.com'
  formData.country = 'Россия'
}

// Инициализируем данные при загрузке компонента
initializeData()
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="setting__top">
        <h3 class="setting__head">настройки профиля</h3>
        <p class="setting__desc">Измените данные или настройки профиля.</p>
      </div>
      <div class="setting__flex">
        <div class="setting__content">
          <div class="setting__photo">
            <h5 class="setting__photo_heading">Фото профиля</h5>
            <div class="setting__photo_flex">
              <div class="setting__photo_image">
                <img 
                  v-if="profileImage" 
                  :src="profileImage" 
                  class="setting__photo_img"
                  alt="Profile"
                />
                <div 
                  class="setting__photo_img"
                  v-else
                >
                  <span style="color: #909399;">No photo</span>
                </div>
                <div class="setting__photo_svg">
                  <PhotoSVG/>
                </div>
              </div>
              <div class="setting__photo_info">
                <label class="setting__photo_upload button__primary" :disabled="isUploadingImage">
                  <span v-if="!isUploadingImage"><UploadSVG/>Загрузить фото</span>
                  <span v-else>Загрузка...</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="uploadProfileImage"
                    style="display: none;"
                    :disabled="isUploadingImage"
                  />
                </label>
                <button 
                  class="setting__photo_delete" 
                  @click="deleteProfileImage"
                  :disabled="!profileImage || isUploadingImage"
                >
                  Удалить фото
                </button>
              </div>
            </div>
          </div>
          <div class="setting__personal">
            <h5 class="setting__personal_heading">Личные данные</h5>
            <div class="setting__personal_flex">
              <div class="form__group">
                <label for="firstName" class="form__label button">Имя</label>
                <el-input
                  id="firstName"
                  v-model="formData.firstName"
                  :class="{ 'error': errors.firstName }"
                  placeholder="Имя"
                  :disabled="isLoading"
                  @blur="validateForm('firstName')"
                  @input="errors.firstName = ''"
                  size="large"
                />
                <div v-if="errors.firstName" class="error text_very">
                  {{ errors.firstName }}
                </div>
              </div>
              <div class="form__group">
                <label for="lastName" class="form__label button">Фамилия</label>
                <el-input
                  id="lastName"
                  v-model="formData.lastName"
                  :class="{ 'error': errors.lastName }"
                  placeholder="Фамилия"
                  :disabled="isLoading"
                  @blur="validateForm('lastName')"
                  @input="errors.lastName = ''"
                  size="large"
                />
                <div v-if="errors.lastName" class="error text_very">
                  {{ errors.lastName }}
                </div>
              </div>
            </div>
            <div class="setting__personal_buttons">
              <button 
                class="setting__personal_button button__primary" 
                @click="submitPersonalData"
                :disabled="isLoading || hasFormErrors"
              >
                <span v-if="!isLoading">сохранить изменения</span>
                <span v-else>Сохранение...</span>
              </button>
            </div>
          </div>
          <div class="setting__general">
            <h5 class="setting__general_heading">Общие данные</h5>
            <div class="setting__general_flex">
              <div class="form__group">
                <label for="nickname" class="form__label button">Псевдоним</label>
                <el-input
                  id="nickname"
                  v-model="formData.nickname"
                  :class="{ 'error': errors.nickname }"
                  placeholder="Псевдоним"
                  :disabled="isLoading"
                  @blur="validateForm('nickname')"
                  @input="errors.nickname = ''"
                  size="large"
                />
                <div v-if="errors.nickname" class="error text_very">
                  {{ errors.nickname }}
                </div>
              </div>
              <div class="form__group">
                <label for="email" class="form__label button">E-mail</label>
                <el-input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  :class="{ 'error': errors.email }"
                  placeholder="e-mail"
                  :disabled="isLoading"
                  @blur="validateForm('email')"
                  @input="errors.email = ''"
                  size="large"
                />
                <div v-if="errors.email" class="error text_very">
                  {{ errors.email }}
                </div>
              </div>
              <div class="form__group">
                <label for="country" class="form__label button">Страна</label>
                <el-input
                  id="country"
                  v-model="formData.country"
                  :class="{ 'error': errors.country }"
                  placeholder="страна"
                  :disabled="isLoading"
                  @blur="validateForm('country')"
                  @input="errors.country = ''"
                  size="large"
                />
                <div v-if="errors.country" class="error text_very">
                  {{ errors.country }}
                </div>
              </div>
            </div>
            <div class="setting__general_buttons">
              <button 
                class="setting__general_button button__primary" 
                @click="submitGeneralData"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">сохранить изменения</span>
                <span v-else>Сохранение...</span>
              </button>
            </div>
          </div>
          <div class="setting__passport">
            <h5 class="setting__passport_heading">данные паспорта</h5>
            <p class="setting__passport_desc">Введите данные для отображения в вашем договоре при выкладке релиза. Данные вашего паспорта скрыты для просмотра, но вы можете обновить их в любое время по кнопке «Изменить».</p>
            <div class="setting__passport_buttons">
              <button 
                class="setting__passport_button button__primary" 
                @click="openPassportModal"
                :disabled="isLoading"
              >
                <span>изменить</span>
              </button>
            </div>
          </div>
          <div class="setting__password">
            <h5 class="setting__password_heading">Смена пароля</h5>
            <div class="setting__password_flex">
              <div class="form__group">
                <label for="password" class="form__label button">Новый пароль</label>
                <el-input
                  id="password"
                  v-model="formData.password"
                  :type="passwordVisible ? 'text' : 'password'"
                  :class="{ 'error': errors.password }"
                  placeholder="Введите новый пароль"
                  :disabled="isLoading"
                  @blur="validateForm('password')"
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
              <div class="form__group">
                <label for="confirmPassword" class="form__label button">Повторите пароль</label>
                <el-input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  :type="confirmPasswordVisible ? 'text' : 'password'"
                  :class="{ 'error': errors.confirmPassword }"
                  placeholder="Повторите новый пароль"
                  :disabled="isLoading"
                  @blur="validateForm('confirmPassword')"
                  @input="errors.confirmPassword = ''"
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
                <div v-if="errors.confirmPassword" class="error text_very">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>
            <div class="setting__password_buttons">
              <button 
                class="setting__password_button button__primary" 
                @click="changePassword"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">сохранить изменения</span>
                <span v-else>Сохранение...</span>
              </button>
            </div>
          </div>
          <div class="setting__details">
            <h5 class="setting__details_heading">Банковские данные</h5>
            <p class="setting__details_description">Вы можете заполнить только раздел Физ. лица или Индивидуального предпринимателя. При заполнении одного раздела информация в другом будет удалена.</p>
            <div class="setting__details_flex">
              <div class="form__labels">
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="formData.bankDetails.userType" 
                    value="executor"
                    class="form__label_input"
                    :disabled="isLoading"
                  >
                  <span class="form__label_text">Физическое лицо</span>
                </label>
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="formData.bankDetails.userType" 
                    value="label"
                    class="form__label_input"
                    :disabled="isLoading"
                  >
                  <span class="form__label_text">Индивидуальный предприниматель</span>
                </label>
              </div>
              <div class="form__groups">
                <div class="form__group">
                  <label for="fullName" class="form__label button">ФИО</label>
                  <el-input
                    id="fullName"
                    v-model="formData.bankDetails.fullName"
                    :class="{ 'error': errors.bankDetails.fullName }"
                    placeholder="ФИО"
                    :disabled="isLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.fullName" class="error text_very">
                    {{ errors.bankDetails.fullName }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="accountNumber" class="form__label button">Расчетный счет</label>
                  <el-input
                    id="accountNumber"
                    v-model="formData.bankDetails.accountNumber"
                    :class="{ 'error': errors.bankDetails.accountNumber }"
                    placeholder="Расчетный счет"
                    :disabled="isLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.accountNumber" class="error text_very">
                    {{ errors.bankDetails.accountNumber }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="bik" class="form__label button">БИК банка</label>
                  <el-input
                    id="bik"
                    v-model="formData.bankDetails.bik"
                    :class="{ 'error': errors.bankDetails.bik }"
                    placeholder="БИК банка"
                    :disabled="isLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.bik" class="error text_very">
                    {{ errors.bankDetails.bik }}
                  </div>
                </div>
                <div v-if="formData.bankDetails.userType === 'label'" class="form__group">
                  <label for="inn" class="form__label button">ИНН</label>
                  <el-input
                    id="inn"
                    v-model="formData.bankDetails.inn"
                    :class="{ 'error': errors.bankDetails.inn }"
                    placeholder="ИНН"
                    :disabled="isLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.inn" class="error text_very">
                    {{ errors.bankDetails.inn }}
                  </div>
                </div>
                <div v-if="formData.bankDetails.userType === 'label'" class="form__group">
                  <label for="kpp" class="form__label button">КПП</label>
                  <el-input
                    id="kpp"
                    v-model="formData.bankDetails.kpp"
                    :class="{ 'error': errors.bankDetails.kpp }"
                    placeholder="КПП"
                    :disabled="isLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.kpp" class="error text_very">
                    {{ errors.bankDetails.kpp }}
                  </div>
                </div>
              </div>
            </div>
            <div class="setting__details_buttons">
              <button 
                class="setting__details_button button__primary" 
                @click="submitBankDetails"
                :disabled="isLoading"
              >
                <span v-if="!isLoading">сохранить изменения</span>
                <span v-else>Сохранение...</span>
              </button>
            </div>
          </div>
          <div class="setting__delete">
            <h5 class="setting__delete_heading">удаление аккаунта</h5>
            <p class="setting__delete_desc">Если захочешь восстановить аккаунт, можешь написать нам в группу VK или Телеграмм.</p>
            <div class="setting__delete_buttons">
              <button 
                class="setting__delete_button button__primary" 
                @click="deleteAccount"
                :disabled="isLoading"
                style="background-color: #f56c6c; border-color: #f56c6c;"
              >
                <span>удалить</span>
              </button>
            </div>
          </div>
        </div>
        <div class="setting__right">
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.setting__flex {
  display: flex;
  gap: 40px;
}
.setting__content,
.setting__top {
  display: flex;
  width: calc(100% - 440px);
  flex: 0 0 auto;
  flex-direction: column;
  gap: 20px;
}
.setting__top {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.setting__head {
  text-transform: uppercase;
}

.setting__photo {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__photo_flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 40px;
}
.setting__photo_image {
  display: flex;
  width: 100px;
  height: 100px;
  position: relative;
}
.setting__photo_img {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  object-fit: contain;
  background-color: var(--border);
  border-radius: 50%;
  overflow: hidden;
}
.setting__photo_svg {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  color: var(--bg);
  background-color: var(--text);
  border-radius: 50%;
  overflow: hidden;
}
.setting__photo_svg svg {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.setting__photo_info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.setting__personal {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__personal_flex {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.setting__personal_flex .form__group {
  width: calc(50% - 10px);
}
.setting__personal_buttons {
  padding: 10px 0 0;
}

.setting__general {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__general_flex {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.setting__general_flex .form__group {
  width: calc(50% - 10px);
}
.setting__general_buttons {
  padding: 10px 0 0;
}

.setting__passport {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__passport_desc {
  color: var(--text-gray);
}

.setting__details {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__details_flex {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.setting__details_description {
  color: var(--text-gray);
}
.setting__details .form__labels {
  width: 100%;
  flex-wrap: nowrap;
  overflow-y: hidden;
  overflow-x: scroll;
}
.setting__details .form__label {
  flex: 0 0 auto;
}
.setting__details .form__labels::-webkit-scrollbar {
  display: none;
  width: 0px;
}
.setting__details .form__labels::-webkit-scrollbar-thumb {
  display: none;
  width: 0px;
}
.setting__details .form__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.setting__details .form__group {
  width: calc(50% - 10px);
}
.setting__details_buttons {
  padding: 10px 0 0;
}

.setting__password {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__password_flex {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.setting__password_flex .form__group {
  width: calc(50% - 10px);
}
.setting__password_buttons {
  padding: 10px 0 0;
}

.setting__delete {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  border: 1px solid var(--border);
  background-color: var(--bg);
}
.setting__delete_desc {
  color: var(--text-gray);
}
@media (max-width: 1919px) {
  .setting__flex {
    gap: 20px;
  }
  .setting__content,
  .setting__top {
    width: calc(100% - 340px);
  }
}
@media (max-width: 1439px) {
  .setting__content,
  .setting__top {
    width: 100%;
  }
  .setting__flex {
    flex-direction: column;
  }
  .setting__right {
    flex-direction: row;
  }
  .setting__photo,
  .setting__personal,
  .setting__general,
  .setting__passport,
  .setting__password,
  .setting__details,
  .setting__delete {
    padding: 30px;
  }
}
@media (max-width: 1023px) {
}
@media (max-width: 767px) {
  .personal__container {
    padding: 0;
  }
  .setting__personal_flex .form__group,
  .setting__general_flex .form__group,
  .setting__details .form__group,
  .setting__password_flex .form__group {
    width: 100%;
  }
  .setting__photo_info {
    flex-direction: column;
    gap: 15px;
  }
  .setting__photo,
  .setting__personal,
  .setting__general,
  .setting__passport,
  .setting__password,
  .setting__details,
  .setting__delete {
    padding: 30px 15px;
  }
  .setting__top {
    padding: 0 15px;
  }
}
</style>