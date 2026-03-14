<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { sendRequest, FileRequest } from '@/utils/api';
import { useRouter } from 'vue-router';
import Tr from "@/i18n/translation";

const loading = ref<boolean>(true); // Изначально true, пока грузятся все данные
const loadingSvg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

// Счетчик загруженных данных и общее количество запросов
const loadedCount = ref(0);

import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import PhotoSVG from "@/uikit/icon/PhotoSVG.vue";
import UploadSVG from "@/uikit/icon/UploadSVG.vue";

const router = useRouter();

// Тип банковских данных
const bankDetailsType = ref<'individual' | 'entrepreneur'>('individual');

// Основная форма данных
const formData = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
  email: '',
  country: '',
  passport: {
    series: '',
    number: '',
    issuedBy: '',
    issueDate: '',
    birthDate: '',
    registrationAddress: ''
  }
})

// Банковские данные
const bankDetails = reactive({
  individual: {
    fullName: '',
    account: '',
    bik: ''
  },
  entrepreneur: {
    fullName: '',
    ogrnip: '',
    address: '',
    inn: '',
    account: '',
    bik: '',
    correspondentAccount: '',
    email: ''
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
  bankDetails: {
    individual: {} as Record<string, string>,
    entrepreneur: {} as Record<string, string>
  }
})

// Загрузочное состояние для операций
const isOperationLoading = ref(false)

// Состояние для загрузки фото
const profileImage = ref<string | null>(null)
const isUploadingImage = ref(false)

// Состояние для модальных окон
const showPassportModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)

// Данные формы паспорта
const passportForm = reactive({
  citizenship: '',
  issuedBy: '',
  fam: '',
  imya: '',
  otch: '',
  number: '',
  date: '',
  adress: ''
})

// Текст подтверждения удаления
const deleteConfirmText = ref('')

// Валидация email
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
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
}

// Валидация банковских данных
const validateBankDetails = () => {
  // Очищаем ошибки
  errors.bankDetails.individual = {}
  errors.bankDetails.entrepreneur = {}
  
  if (bankDetailsType.value === 'individual') {
    const indErrors: Record<string, string> = {}
    
    if (!bankDetails.individual.fullName) indErrors.fullName = 'ФИО обязательно'
    if (!bankDetails.individual.account) indErrors.account = 'Расчетный счет обязателен'
    if (!bankDetails.individual.bik) indErrors.bik = 'БИК обязателен'
    
    errors.bankDetails.individual = indErrors
    return Object.keys(indErrors).length === 0
  } else {
    const entErrors: Record<string, string> = {}
    
    if (!bankDetails.entrepreneur.fullName) entErrors.fullName = 'ФИО обязательно'
    if (!bankDetails.entrepreneur.ogrnip) entErrors.ogrnip = 'ОГРНИП обязателен'
    if (!bankDetails.entrepreneur.address) entErrors.address = 'Адрес обязателен'
    if (!bankDetails.entrepreneur.inn) entErrors.inn = 'ИНН обязателен'
    if (!bankDetails.entrepreneur.account) entErrors.account = 'Расчетный счет обязателен'
    if (!bankDetails.entrepreneur.bik) entErrors.bik = 'БИК обязателен'
    if (!bankDetails.entrepreneur.correspondentAccount) entErrors.correspondentAccount = 'Корреспондентский счет обязателен'
    if (!bankDetails.entrepreneur.email) {
      entErrors.email = 'Email обязателен'
    } else if (!validateEmail(bankDetails.entrepreneur.email)) {
      entErrors.email = 'Введите корректный email'
    }
    
    errors.bankDetails.entrepreneur = entErrors
    return Object.keys(entErrors).length === 0
  }
}

// Проверка, есть ли ошибки в основной форме
const hasFormErrors = computed(() => {
  return Object.values(errors).some(error => 
    typeof error === 'string' ? error.length > 0 : false
  )
})

// Переключение типа банковских данных
const switchBankDetailsType = () => {
  // Очищаем ошибки при переключении
  validateBankDetails()
}

// Открытие модальных окон
const openPassportModal = () => {
  loadPassportData()
  showPassportModal.value = true
  document.documentElement.classList.add('noscroll')
}

const openPasswordModal = () => {
  showPasswordModal.value = true
  document.documentElement.classList.add('noscroll')
}

const openDeleteModal = () => {
  deleteConfirmText.value = ''
  showDeleteModal.value = true
  document.documentElement.classList.add('noscroll')
}

// Закрытие модальных окон
const closePassportModal = () => {
  showPassportModal.value = false
  document.documentElement.classList.remove('noscroll')
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  document.documentElement.classList.remove('noscroll')
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteConfirmText.value = ''
  document.documentElement.classList.remove('noscroll')
}

// Очистка формы паспорта
const clearPassportForm = () => {
  passportForm.citizenship = ''
  passportForm.issuedBy = ''
  passportForm.fam = ''
  passportForm.imya = ''
  passportForm.otch = ''
  passportForm.number = ''
  passportForm.date = ''
  passportForm.adress = ''
  ElMessage.success('Форма очищена')
}

// Загрузка данных паспорта
const loadPassportData = () => {
  // Здесь должен быть запрос к API для получения текущих данных
}

// Сохранение паспортных данных
const savePassportData = async () => {
  if (!passportForm.fam || !passportForm.imya || !passportForm.number) {
    ElMessage.error('Заполните обязательные поля (фамилия, имя, серия и номер)')
    return
  }
  
  loading.value = true;
  isOperationLoading.value = true
  try {
    const passportData = {
      'citysenship-profile-others': passportForm.citizenship,
      'issued-profile': passportForm.issuedBy,
      'fam': passportForm.fam,
      'number-profile': passportForm.number,
      'imya': passportForm.imya,
      'date-profile': passportForm.date,
      'otch': passportForm.otch,
      'adress-profile': passportForm.adress
    }
    
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/profile/updatePassport.php',
      passportData
    )
    
    console.log('Паспортные данные сохранены:', response.data)
    ElMessage.success('Паспортные данные сохранены успешно')
    closePassportModal()
    
  } catch (error: any) {
    console.error('Ошибка при сохранении паспортных данных:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при сохранении данных')
      }
    } else {
      ElMessage.error('Ошибка при сохранении данных')
    }
  } finally {
    isOperationLoading.value = false
    loading.value = false;
  }
}

// Отправка запроса на смену пароля
const submitPasswordChange = async () => {
  if (!formData.email) {
    ElMessage.error('Email не указан. Пожалуйста, заполните email в общих данных')
    closePasswordModal()
    return
  }
  
  isOperationLoading.value = true
  try {
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/auth/mailPass.php',
      {
        email: formData.email
      }
    )
    
    console.log('Запрос на смену пароля отправлен:', response.data)
    ElMessage.success('Ссылка для изменения пароля отправлена на вашу почту')
    closePasswordModal()
    
  } catch (error: any) {
    console.error('Ошибка при запросе смены пароля:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при отправке запроса')
      }
    } else {
      ElMessage.error('Ошибка при отправке запроса')
    }
  } finally {
    isOperationLoading.value = false
  }
}

// Подтверждение удаления аккаунта
const confirmDeleteAccount = async () => {
  if (deleteConfirmText.value !== 'УДАЛИТЬ') {
    ElMessage.error('Введите "УДАЛИТЬ" для подтверждения')
    return
  }
  
  isOperationLoading.value = true
  try {
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/profile/deleteProfile.php',
      {
        confirmation: deleteConfirmText.value
      }
    )
    
    console.log('Аккаунт удален:', response.data)
    ElMessage.success('Аккаунт успешно удален')
    
    // Очищаем localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user-locale")
    
    // Перенаправляем на страницу регистрации
    setTimeout(() => {
      router.push(Tr.i18nRoute({ name: 'register' }))
    }, 1500)
    
  } catch (error: any) {
    console.error('Ошибка при удалении аккаунта:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при удалении аккаунта')
      }
    } else {
      ElMessage.error('Ошибка при удалении аккаунта')
    }
  } finally {
    isOperationLoading.value = false
    closeDeleteModal()
  }
}

// Отправка личных данных
const submitPersonalData = async () => {
  validateForm('firstName')
  validateForm('lastName')
  
  if (errors.firstName || errors.lastName) {
    ElMessage.error('Исправьте ошибки в форме')
    return
  }
  
  isOperationLoading.value = true
  try {
    const nameData = {
      'alias-profile-name': formData.firstName.trim(),
      'profile-sec-name': formData.lastName.trim()
    }
    
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/profile/updateName.php',
      nameData
    )
    
    console.log('Имя и фамилия сохранены:', response.data)
    ElMessage.success('Личные данные сохранены успешно')
  } catch (error: any) {
    console.error('Ошибка при сохранении данных:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData['alias-profile-name']) {
        errors.firstName = Array.isArray(errorData['alias-profile-name']) 
          ? errorData['alias-profile-name'][0] 
          : errorData['alias-profile-name']
      }
      
      if (errorData['profile-sec-name']) {
        errors.lastName = Array.isArray(errorData['profile-sec-name']) 
          ? errorData['profile-sec-name'][0] 
          : errorData['profile-sec-name']
      }
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else if (errorData.detail) {
        ElMessage.error(errorData.detail)
      }
    } else {
      ElMessage.error('Ошибка при сохранении данных')
    }
  } finally {
    isOperationLoading.value = false
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
  
  isOperationLoading.value = true
  try {
    // Здесь будет API запрос
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Общие данные сохранены успешно')
  } catch (error) {
    ElMessage.error('Ошибка при сохранении данных')
  } finally {
    isOperationLoading.value = false
  }
}

// Сохранение банковских данных физического лица
const submitIndividualBankDetails = async () => {
  if (!validateBankDetails()) {
    ElMessage.error('Исправьте ошибки в банковских данных')
    return
  }
  
  isOperationLoading.value = true
  try {
    const individualData = {
      'sp-profile': bankDetails.individual.fullName,
      'rs-sp-profile': bankDetails.individual.account,
      'b-sp-profile': bankDetails.individual.bik
    }
    
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/profile/updateRek1.php',
      individualData
    )
    
    console.log('Банковские данные физлица сохранены:', response.data)
    ElMessage.success('Банковские данные сохранены успешно')
    
  } catch (error: any) {
    console.error('Ошибка при сохранении банковских данных:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при сохранении банковских данных')
      }
    } else {
      ElMessage.error('Ошибка при сохранении банковских данных')
    }
  } finally {
    isOperationLoading.value = false
  }
}

// Сохранение банковских данных ИП
const submitEntrepreneurBankDetails = async () => {
  if (!validateBankDetails()) {
    ElMessage.error('Исправьте ошибки в банковских данных')
    return
  }
  
  isOperationLoading.value = true
  try {
    const entrepreneurData = {
      'sp-profile': bankDetails.entrepreneur.fullName,
      'num-ogr-profile': bankDetails.entrepreneur.ogrnip,
      'addr-sp-profile': bankDetails.entrepreneur.address,
      'in-sp-profile': bankDetails.entrepreneur.inn,
      'rs-sp-profile': bankDetails.entrepreneur.account,
      'b-sp-profile': bankDetails.entrepreneur.bik,
      'ks-sp-profile': bankDetails.entrepreneur.correspondentAccount,
      'email-sp-profile': bankDetails.entrepreneur.email
    }
    
    const response = await sendRequest(
      "post",
      '/ajax_vue/ajax/profile/updateRek2.php',
      entrepreneurData
    )
    
    console.log('Банковские данные ИП сохранены:', response.data)
    ElMessage.success('Банковские данные сохранены успешно')
    
  } catch (error: any) {
    console.error('Ошибка при сохранении банковских данных:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при сохранении банковских данных')
      }
    } else {
      ElMessage.error('Ошибка при сохранении банковских данных')
    }
  } finally {
    isOperationLoading.value = false
  }
}

// Загрузка фото профиля
const uploadProfileImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    ElMessage.error('Пожалуйста, выберите изображение')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('Размер файла не должен превышать 5MB')
    return
  }
  
  isUploadingImage.value = true
  try {
    const formData = new FormData()
    formData.append('personal-photo', file)
    
    const response = await FileRequest(
      "post",
      '/ajax_vue/ajax/profile/avatar.php',
      formData
    )
    
    console.log('Фото загружено:', response.data)
    
    ElMessage.success('Фото профиля загружено успешно')
    
    // Обновляем данные с сервера, чтобы получить новое фото
    await refreshUserData()
    
  } catch (error: any) {
    console.error('Ошибка при загрузке фото:', error)
    
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      if (errorData.error) {
        ElMessage.error(errorData.error)
      } else if (errorData.message) {
        ElMessage.error(errorData.message)
      } else {
        ElMessage.error('Ошибка при загрузке фото')
      }
    } else {
      ElMessage.error('Ошибка при загрузке фото')
    }
  } finally {
    isUploadingImage.value = false
    input.value = ''
  }
}

// Функция для обновления данных с сервера
const refreshUserData = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    console.log('Данные обновлены с сервера:', response.data);
    
    if (response.data && response.data.user) {
      // Обновляем фото профиля из ответа API
      if (response.data.user.personalPhoto) {
        profileImage.value = response.data.user.personalPhoto;
      }
      
      // Обновляем остальные данные пользователя
      formData.firstName = response.data.user.name || '';
      formData.lastName = response.data.user.lastName || '';
      formData.nickname = response.data.user.login || '';
      formData.email = response.data.user.email || '';
      
      // Обновляем страну из профиля если есть
      if (response.data.profile && response.data.profile.region) {
        formData.country = response.data.profile.region;
      }
      
      // Загружаем банковские данные
      if (response.data.settings && response.data.settings.requisites) {
        const requisites = response.data.settings.requisites;
        
        // Данные физлица
        if (requisites.individual) {
          bankDetails.individual.fullName = requisites.individual.fullName || '';
          bankDetails.individual.account = requisites.individual.account || '';
          bankDetails.individual.bik = requisites.individual.bik || '';
        }
        
        // Данные ИП
        if (requisites.entrepreneur) {
          bankDetails.entrepreneur.fullName = requisites.entrepreneur.fullName || '';
          bankDetails.entrepreneur.ogrnip = requisites.entrepreneur.ogrnip || '';
          bankDetails.entrepreneur.address = requisites.entrepreneur.address || '';
          bankDetails.entrepreneur.inn = requisites.entrepreneur.inn || '';
          bankDetails.entrepreneur.account = requisites.entrepreneur.account || '';
          bankDetails.entrepreneur.bik = requisites.entrepreneur.bik || '';
          bankDetails.entrepreneur.correspondentAccount = requisites.entrepreneur.correspondentAccount || '';
          bankDetails.entrepreneur.email = requisites.entrepreneur.email || '';
        }
        
        // Определяем, какой тип данных заполнен
        if (requisites.entrepreneur?.fullName || requisites.entrepreneur?.ogrnip) {
          bankDetailsType.value = 'entrepreneur';
        } else {
          bankDetailsType.value = 'individual';
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error);
    throw error;
  }
};

// Функция для загрузки всех данных
const loadAllData = async () => {
  loading.value = true;
  loadedCount.value = 0;
  
  try {
    await refreshUserData().finally(() => loadedCount.value++);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
};

// Загрузка начальных данных при монтировании компонента
onMounted(() => {
  loadAllData();
});
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div v-if="loading" class="personal__block">
      <div class="loading__container">
        <div 
          v-loading="loading" 
          :element-loading-svg="loadingSvg" 
          class="loading__svg" 
          element-loading-svg-view-box="-10, -10, 50, 50"
        ></div>
      </div>
    </div>
    <div v-else class="personal__block">
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
                <label class="setting__photo_upload button__primary" :class="{ 'button__disabled': isUploadingImage }">
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
                  :disabled="isOperationLoading"
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
                  :disabled="isOperationLoading"
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
                :disabled="isOperationLoading || hasFormErrors"
              >
                <span v-if="!isOperationLoading">сохранить изменения</span>
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
                  :disabled="isOperationLoading"
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
                  :disabled="isOperationLoading"
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
                  :disabled="isOperationLoading"
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
                :disabled="isOperationLoading"
              >
                <span v-if="!isOperationLoading">сохранить изменения</span>
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
                :disabled="isOperationLoading"
              >
                <span>изменить</span>
              </button>
            </div>
          </div>
          <div class="setting__password">
            <h5 class="setting__password_heading">Смена пароля</h5>
            <p class="setting__password_desc">Для изменения пароля мы отправим ссылку на вашу электронную почту.</p>
            <div class="setting__password_buttons">
              <button 
                class="setting__password_button button__primary" 
                @click="openPasswordModal"
                :disabled="isOperationLoading"
              >
                <span>изменить пароль</span>
              </button>
            </div>
          </div>
          
          <!-- Банковские данные - Физическое лицо -->
          <div class="setting__details" v-if="bankDetailsType === 'individual'">
            <h5 class="setting__details_heading">Банковские данные (Физ. лицо)</h5>
            <p class="setting__details_description">Заполните реквизиты для выплат на карту физического лица.</p>
            <div class="setting__details_flex">
              <div class="form__labels">
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="bankDetailsType" 
                    value="individual"
                    class="form__label_input"
                    :disabled="isOperationLoading"
                    @change="switchBankDetailsType"
                  >
                  <span class="form__label_text">Физическое лицо</span>
                </label>
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="bankDetailsType" 
                    value="entrepreneur"
                    class="form__label_input"
                    :disabled="isOperationLoading"
                    @change="switchBankDetailsType"
                  >
                  <span class="form__label_text">Индивидуальный предприниматель</span>
                </label>
              </div>
              <div class="form__groups">
                <div class="form__group">
                  <label for="individualFullName" class="form__label button">ФИО</label>
                  <el-input
                    id="individualFullName"
                    v-model="bankDetails.individual.fullName"
                    :class="{ 'error': errors.bankDetails.individual?.fullName }"
                    placeholder="Иванов Иван Иванович"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.individual?.fullName" class="error text_very">
                    {{ errors.bankDetails.individual?.fullName }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="individualAccount" class="form__label button">Расчетный счет</label>
                  <el-input
                    id="individualAccount"
                    v-model="bankDetails.individual.account"
                    :class="{ 'error': errors.bankDetails.individual?.account }"
                    placeholder="408028102544110556789"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.individual?.account" class="error text_very">
                    {{ errors.bankDetails.individual?.account }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="individualBik" class="form__label button">БИК банка</label>
                  <el-input
                    id="individualBik"
                    v-model="bankDetails.individual.bik"
                    :class="{ 'error': errors.bankDetails.individual?.bik }"
                    placeholder="044513655"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.individual?.bik" class="error text_very">
                    {{ errors.bankDetails.individual?.bik }}
                  </div>
                </div>
              </div>
            </div>
            <div class="setting__details_buttons">
              <button 
                class="setting__details_button button__primary" 
                @click="submitIndividualBankDetails"
                :disabled="isOperationLoading"
              >
                <span v-if="!isOperationLoading">сохранить изменения</span>
                <span v-else>Сохранение...</span>
              </button>
            </div>
          </div>

          <!-- Банковские данные - Индивидуальный предприниматель -->
          <div class="setting__details" v-if="bankDetailsType === 'entrepreneur'">
            <h5 class="setting__details_heading">Банковские данные (ИП)</h5>
            <p class="setting__details_description">Заполните реквизиты для выплат на расчетный счет ИП.</p>
            <div class="setting__details_flex">
              <div class="form__labels">
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="bankDetailsType" 
                    value="individual"
                    class="form__label_input"
                    :disabled="isOperationLoading"
                    @change="switchBankDetailsType"
                  >
                  <span class="form__label_text">Физическое лицо</span>
                </label>
                <label class="form__label">
                  <input 
                    type="radio" 
                    v-model="bankDetailsType" 
                    value="entrepreneur"
                    class="form__label_input"
                    :disabled="isOperationLoading"
                    @change="switchBankDetailsType"
                  >
                  <span class="form__label_text">Индивидуальный предприниматель</span>
                </label>
              </div>
              <div class="form__groups">
                <div class="form__group">
                  <label for="entrepreneurFullName" class="form__label button">ФИО Предпринимателя</label>
                  <el-input
                    id="entrepreneurFullName"
                    v-model="bankDetails.entrepreneur.fullName"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.fullName }"
                    placeholder="Иванов Иван Иванович"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.fullName" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.fullName }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurOgrnip" class="form__label button">ОГРНИП</label>
                  <el-input
                    id="entrepreneurOgrnip"
                    v-model="bankDetails.entrepreneur.ogrnip"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.ogrnip }"
                    placeholder="318000000100730"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.ogrnip" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.ogrnip }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurAddress" class="form__label button">Адрес</label>
                  <el-input
                    id="entrepreneurAddress"
                    v-model="bankDetails.entrepreneur.address"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.address }"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.address" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.address }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurInn" class="form__label button">ИНН</label>
                  <el-input
                    id="entrepreneurInn"
                    v-model="bankDetails.entrepreneur.inn"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.inn }"
                    placeholder="840000001004"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.inn" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.inn }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurAccount" class="form__label button">Расчетный счет ИП</label>
                  <el-input
                    id="entrepreneurAccount"
                    v-model="bankDetails.entrepreneur.account"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.account }"
                    placeholder="408028102544110556789"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.account" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.account }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurBik" class="form__label button">БИК</label>
                  <el-input
                    id="entrepreneurBik"
                    v-model="bankDetails.entrepreneur.bik"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.bik }"
                    placeholder="123456789"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.bik" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.bik }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurKs" class="form__label button">Корреспондентский счет</label>
                  <el-input
                    id="entrepreneurKs"
                    v-model="bankDetails.entrepreneur.correspondentAccount"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.correspondentAccount }"
                    placeholder="30101810640004000068"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.correspondentAccount" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.correspondentAccount }}
                  </div>
                </div>
                <div class="form__group">
                  <label for="entrepreneurEmail" class="form__label button">E-mail</label>
                  <el-input
                    id="entrepreneurEmail"
                    v-model="bankDetails.entrepreneur.email"
                    :class="{ 'error': errors.bankDetails.entrepreneur?.email }"
                    placeholder="test@test.ru"
                    :disabled="isOperationLoading"
                    @blur="validateBankDetails"
                    size="large"
                  />
                  <div v-if="errors.bankDetails.entrepreneur?.email" class="error text_very">
                    {{ errors.bankDetails.entrepreneur?.email }}
                  </div>
                </div>
              </div>
            </div>
            <div class="setting__details_buttons">
              <button 
                class="setting__details_button button__primary" 
                @click="submitEntrepreneurBankDetails"
                :disabled="isOperationLoading"
              >
                <span v-if="!isOperationLoading">сохранить изменения</span>
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
                @click="openDeleteModal"
                :disabled="isOperationLoading"
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

<!-- Модальное окно паспортных данных -->
<Teleport to="body">
  <div v-if="showPassportModal" class="passport-modal-overlay" @click.self="closePassportModal">
    <div class="passport-modal">
      <div class="passport-modal__header">
        <h3 class="passport-modal__title">Паспортные данные</h3>
        <button class="passport-modal__close" @click="closePassportModal">×</button>
      </div>
      
      <div class="passport-modal__content">
        <div class="passport-modal__grid">
          <!-- Левая колонка -->
          <div class="passport-modal__column">
            <div class="form__group">
              <label class="form__label button">Гражданство</label>
              <el-select
                v-model="passportForm.citizenship"
                placeholder="Выберите гражданство"
                :disabled="isOperationLoading"
                size="large"
                class="passport-select"
                clearable
              >
                <el-option label="Россия" value="Россия" />
                <el-option label="Беларусь" value="Беларусь" />
                <el-option label="Казахстан" value="Казахстан" />
                <el-option label="Армения" value="Армения" />
                <el-option label="Кыргызстан" value="Кыргызстан" />
                <el-option label="Другое" value="Другое" />
              </el-select>
            </div>

            <div class="form__group">
              <label class="form__label button">Кем выдан</label>
              <el-input
                v-model="passportForm.issuedBy"
                placeholder="Кем выдан паспорт"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Фамилия</label>
              <el-input
                v-model="passportForm.fam"
                placeholder="Фамилия"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Имя</label>
              <el-input
                v-model="passportForm.imya"
                placeholder="Имя"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>
          </div>

          <!-- Правая колонка -->
          <div class="passport-modal__column">
            <div class="form__group">
              <label class="form__label button">Отчество</label>
              <el-input
                v-model="passportForm.otch"
                placeholder="Отчество"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Серия и номер паспорта</label>
              <el-input
                v-model="passportForm.number"
                placeholder="0000 000000"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Дата выдачи</label>
              <el-date-picker
                v-model="passportForm.date"
                type="date"
                placeholder="Выберите дату"
                format="DD.MM.YYYY"
                value-format="DD.MM.YYYY"
                :disabled="isOperationLoading"
                size="large"
                class="passport-datepicker"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Адрес регистрации</label>
              <el-input
                v-model="passportForm.adress"
                placeholder="Адрес регистрации"
                :disabled="isOperationLoading"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="passport-modal__footer">
        <button 
          class="passport-modal__button passport-modal__button--clear"
          @click="clearPassportForm"
          :disabled="isOperationLoading"
        >
          очистить
        </button>
        <button 
          class="passport-modal__button passport-modal__button--save"
          @click="savePassportData"
          :disabled="isOperationLoading"
        >
          <span v-if="!isOperationLoading">сохранить изменения</span>
          <span v-else>Сохранение...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Модальное окно смены пароля -->
<Teleport to="body">
  <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
    <div class="modal modal--small">
      <div class="modal__header">
        <h3 class="modal__title">Смена пароля</h3>
        <button class="modal__close" @click="closePasswordModal">×</button>
      </div>
      
      <div class="modal__content">
        <div class="modal__info">
          <p>Ссылка для изменения пароля будет отправлена на вашу электронную почту:</p>
          <p class="modal__email">{{ formData.email || 'не указан' }}</p>
          <p class="modal__hint">Письмо придет в течение нескольких минут. Проверьте папку "Спам", если не видите письмо во входящих.</p>
        </div>
      </div>

      <div class="modal__footer">
        <button 
          class="modal__button modal__button--clear"
          @click="closePasswordModal"
          :disabled="isOperationLoading"
        >
          отмена
        </button>
        <button 
          class="modal__button modal__button--save"
          @click="submitPasswordChange"
          :disabled="isOperationLoading"
        >
          <span v-if="!isOperationLoading">отправить ссылку</span>
          <span v-else>Отправка...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Модальное окно удаления аккаунта -->
<Teleport to="body">
  <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
    <div class="modal modal--small">
      <div class="modal__header">
        <h3 class="modal__title">Удаление аккаунта</h3>
        <button class="modal__close" @click="closeDeleteModal">×</button>
      </div>
      
      <div class="modal__content">
        <div class="modal__warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#f56c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8V12" stroke="#f56c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16H12.01" stroke="#f56c6c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="modal__warning-text">
            <h4>Внимание! Это действие нельзя отменить</h4>
            <p>Все ваши данные будут удалены без возможности восстановления.</p>
          </div>
        </div>
        
        <div class="form__group">
          <label class="form__label button">Подтверждение</label>
          <el-input
            v-model="deleteConfirmText"
            placeholder="Введите 'УДАЛИТЬ' для подтверждения"
            :disabled="isOperationLoading"
            size="large"
          />
        </div>
      </div>

      <div class="modal__footer">
        <button 
          class="modal__button modal__button--clear"
          @click="closeDeleteModal"
          :disabled="isOperationLoading"
        >
          отмена
        </button>
        <button 
          class="modal__button modal__button--delete"
          @click="confirmDeleteAccount"
          :disabled="isOperationLoading || deleteConfirmText !== 'УДАЛИТЬ'"
        >
          <span v-if="!isOperationLoading">удалить аккаунт</span>
          <span v-else>Удаление...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<style lang="css" scoped>
.loading__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.loading__svg {
  width: 100px;
  height: 100px;
}

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

/* Стили для модального окна паспорта */
.passport-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.passport-modal {
  background-color: var(--bg);
  border: 1px solid var(--border);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.passport-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  border-bottom: 1px solid var(--border);
}

.passport-modal__title {
  text-transform: uppercase;
}

.passport-modal__close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: var(--text);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.passport-modal__close:hover {
  opacity: 0.7;
}

.passport-modal__content {
  padding: 40px;
}

.passport-modal__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.passport-modal__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.passport-modal__footer {
  display: flex;
  gap: 20px;
  padding: 30px 40px;
  border-top: 1px solid var(--border);
}

.passport-modal__button {
  padding: 12px 30px;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.passport-modal__button--clear {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.passport-modal__button--clear:hover {
  background-color: var(--border);
}

.passport-modal__button--save {
  background-color: var(--text);
  color: var(--bg);
}

.passport-modal__button--save:hover {
  opacity: 0.9;
}

.passport-modal__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стили для модальных окон */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background-color: var(--bg);
  border: 1px solid var(--border);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease;
}

.modal--small {
  max-width: 450px;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid var(--border);
}

.modal__title {
  text-transform: uppercase;
  font-size: 18px;
}

.modal__close {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: var(--text);
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.modal__close:hover {
  opacity: 0.7;
}

.modal__content {
  padding: 30px;
}

.modal__footer {
  display: flex;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid var(--border);
}

.modal__button {
  padding: 10px 25px;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.modal__button--clear {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.modal__button--clear:hover {
  background-color: var(--border);
}

.modal__button--save {
  background-color: var(--text);
  color: var(--bg);
}

.modal__button--save:hover {
  opacity: 0.9;
}

.modal__button--delete {
  background-color: #f56c6c;
  color: white;
}

.modal__button--delete:hover {
  opacity: 0.9;
}

.modal__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal__info {
  text-align: center;
}

.modal__info p {
  margin-bottom: 10px;
  color: var(--text-gray);
  font-size: 14px;
}

.modal__email {
  font-weight: bold;
  color: var(--text) !important;
  font-size: 16px !important;
  margin: 15px 0;
}

.modal__hint {
  font-size: 12px !important;
  color: #909399 !important;
  margin-top: 15px;
}

.modal__warning {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(245, 108, 108, 0.05);
}

.modal__warning svg {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.modal__warning-text h4 {
  color: #f56c6c;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: 500;
}

.modal__warning-text p {
  color: var(--text-gray);
  font-size: 14px;
}

/* Стили для Element Plus компонентов */
:deep(.passport-select) {
  width: 100%;
}

:deep(.passport-datepicker) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background-color: var(--bg);
  border: 1px solid var(--border);
  box-shadow: none !important;
  border-radius: 0;
  padding: 0 15px;
  width: 100%;
  height: 40px;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--text);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--text);
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: var(--text);
  font-size: 14px;
  height: 40px;
}

:deep(.el-select__caret) {
  color: var(--text);
  font-size: 14px;
}

:deep(.el-picker-popper) {
  background-color: var(--bg);
  border: 1px solid var(--border);
}

:deep(.el-picker-panel) {
  background-color: var(--bg);
  border: none;
}

:deep(.el-date-table td.today .el-date-table-cell) {
  color: var(--text);
  font-weight: bold;
}

:deep(.el-date-table td.current:not(.disabled) .el-date-table-cell) {
  background-color: var(--text);
  color: var(--bg);
}

:deep(.el-date-table td .el-date-table-cell:hover) {
  background-color: var(--border);
}

:deep(.el-select-dropdown) {
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0;
}

:deep(.el-select-dropdown__item) {
  color: var(--text);
  font-size: 14px;
  height: 36px;
  line-height: 36px;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: var(--border);
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--text);
  color: var(--bg);
  font-weight: normal;
}

.button__disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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
  
  .passport-modal__grid {
    grid-template-columns: 1fr;
  }
  
  .passport-modal__header,
  .passport-modal__content,
  .passport-modal__footer {
    padding: 20px;
  }
  
  .passport-modal__footer {
    flex-direction: column;
  }
  
  .passport-modal__button {
    width: 100%;
  }
  
  .modal__header,
  .modal__content,
  .modal__footer {
    padding: 20px;
  }
  
  .modal__footer {
    flex-direction: column;
  }
  
  .modal__button {
    width: 100%;
  }
  
  .modal__warning {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>