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
            <p class="setting__password_desc">Для изменения пароля мы отправим ссылку на вашу электронную почту.</p>
            <div class="setting__password_buttons">
              <button 
                class="setting__password_button button__primary" 
                @click="openPasswordModal"
                :disabled="isLoading"
              >
                <span>изменить пароль</span>
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
                @click="openDeleteModal"
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

<!-- Модальное окно паспортных данных (оригинальное, без изменений) -->
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
                :disabled="isLoading"
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
                :disabled="isLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Фамилия</label>
              <el-input
                v-model="passportForm.fam"
                placeholder="Фамилия"
                :disabled="isLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Имя</label>
              <el-input
                v-model="passportForm.imya"
                placeholder="Имя"
                :disabled="isLoading"
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
                :disabled="isLoading"
                size="large"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Серия и номер паспорта</label>
              <el-input
                v-model="passportForm.number"
                placeholder="0000 000000"
                :disabled="isLoading"
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
                :disabled="isLoading"
                size="large"
                class="passport-datepicker"
              />
            </div>

            <div class="form__group">
              <label class="form__label button">Адрес регистрации</label>
              <el-input
                v-model="passportForm.adress"
                placeholder="Адрес регистрации"
                :disabled="isLoading"
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
          :disabled="isLoading"
        >
          очистить
        </button>
        <button 
          class="passport-modal__button passport-modal__button--save"
          @click="savePassportData"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">сохранить изменения</span>
          <span v-else>Сохранение...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Модальное окно смены пароля (новое) -->
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
          :disabled="isLoading"
        >
          отмена
        </button>
        <button 
          class="modal__button modal__button--save"
          @click="submitPasswordChange"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">отправить ссылку</span>
          <span v-else>Отправка...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Модальное окно удаления аккаунта (новое) -->
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
            :disabled="isLoading"
            size="large"
          />
        </div>
      </div>

      <div class="modal__footer">
        <button 
          class="modal__button modal__button--clear"
          @click="closeDeleteModal"
          :disabled="isLoading"
        >
          отмена
        </button>
        <button 
          class="modal__button modal__button--delete"
          @click="confirmDeleteAccount"
          :disabled="isLoading || deleteConfirmText !== 'УДАЛИТЬ'"
        >
          <span v-if="!isLoading">удалить аккаунт</span>
          <span v-else>Удаление...</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { sendRequest, FileRequest } from '@/utils/api';
import { useRouter } from 'vue-router';
import Tr from "@/i18n/translation";

import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import PhotoSVG from "@/uikit/icon/PhotoSVG.vue";
import UploadSVG from "@/uikit/icon/UploadSVG.vue";

const router = useRouter();

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

// Загрузка данных паспорта (пример)
const loadPassportData = () => {
  // Здесь должен быть запрос к API для получения текущих данных
  // Пример заполнения:
  passportForm.citizenship = 'Россия'
  passportForm.issuedBy = 'УФМС России по г. Москва'
  passportForm.fam = 'Иванов'
  passportForm.imya = 'Иван'
  passportForm.otch = 'Иванович'
  passportForm.number = '1234 567890'
  passportForm.date = '15.05.2015'
  passportForm.adress = 'г. Москва, ул. Примерная, д. 1, кв. 1'
}

// Сохранение паспортных данных
const savePassportData = async () => {
  if (!passportForm.fam || !passportForm.imya || !passportForm.number) {
    ElMessage.error('Заполните обязательные поля (фамилия, имя, серия и номер)')
    return
  }
  
  isLoading.value = true
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
      '/ajax/profile/updatePassport.php',
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
    isLoading.value = false
  }
}

// Отправка запроса на смену пароля
const submitPasswordChange = async () => {
  if (!formData.email) {
    ElMessage.error('Email не указан. Пожалуйста, заполните email в общих данных')
    closePasswordModal()
    return
  }
  
  isLoading.value = true
  try {
    const response = await sendRequest(
      "post",
      '/ajax/auth/mailPass.php',
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
    isLoading.value = false
  }
}

// Подтверждение удаления аккаунта
const confirmDeleteAccount = async () => {
  if (deleteConfirmText.value !== 'УДАЛИТЬ') {
    ElMessage.error('Введите "УДАЛИТЬ" для подтверждения')
    return
  }
  
  isLoading.value = true
  try {
    const response = await sendRequest(
      "post",
      '/ajax/profile/deleteProfile.php',
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
    isLoading.value = false
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
  
  isLoading.value = true
  try {
    const nameData = {
      'alias-profile-name': formData.firstName.trim(),
      'profile-sec-name': formData.lastName.trim()
    }
    
    const response = await sendRequest(
      "post",
      '/ajax/profile/updateName.php',
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
      '/ajax/profile/avatar.php',
      formData
    )
    
    console.log('Фото загружено:', response.data)
    
    if (response.data && response.data.url) {
      profileImage.value = response.data.url
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        profileImage.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    
    ElMessage.success('Фото профиля загружено успешно')
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
  }).catch(() => {})
}

// Инициализация данных
const initializeData = () => {
  formData.firstName = 'Иван'
  formData.lastName = 'Иванов'
  formData.nickname = 'artist123'
  formData.email = 'user@example.com'
  formData.country = 'Россия'
}

initializeData()
</script>

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

/* Стили для оригинального модального окна паспорта (без изменений) */
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

/* Стили для новых модальных окон (смена пароля и удаление) */
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