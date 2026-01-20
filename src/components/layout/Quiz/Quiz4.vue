<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElInput, ElMessage, ElSelect, ElOption, ElDatePicker } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import dayjs from 'dayjs';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для localStorage
const STORAGE_KEY = 'quiz4_state';

// Данные формы с инициализацией из localStorage
const formData = reactive({
  userType: 'individual',
  
  // Поля для ИП
  legalAddress: '',
  inn: '',
  ogrn: '',
  accountNumber: '',
  bankName: '',
  bankInn: '',
  bankBik: '',
  correspondentAccount: '',
  bankLegalAddress: '',
  
  // Общие поля
  citizenship: '',
  otherCitizenship: '',
  lastName: '',
  firstName: '',
  middleName: '',
  passportNumber: '',
  passportIssuedBy: '',
  passportIssueDate: '',
  registrationAddress: ''
});

// Ошибки валидации
const errors = reactive({
  userType: '',
  legalAddress: '',
  inn: '',
  ogrn: '',
  accountNumber: '',
  bankName: '',
  bankInn: '',
  bankBik: '',
  correspondentAccount: '',
  bankLegalAddress: '',
  citizenship: '',
  otherCitizenship: '',
  lastName: '',
  firstName: '',
  middleName: '',
  passportNumber: '',
  passportIssuedBy: '',
  passportIssueDate: '',
  registrationAddress: ''
});

// Опции для гражданства
const citizenshipOptions = [
  { label: 'Российская Федерация', value: 'RU' },
  { label: 'Другое', value: 'other' }
];

// Флаг показа поля для другого гражданства
const showOtherCitizenshipInput = ref(false);

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  try {
    const stateToSave = {
      formData,
      showOtherCitizenshipInput: showOtherCitizenshipInput.value
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

// Загрузка состояния из localStorage
const loadStateFromLocalStorage = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Восстанавливаем основные данные формы
      Object.assign(formData, parsedState.formData);
      
      // Восстанавливаем состояние поля для другого гражданства
      showOtherCitizenshipInput.value = parsedState.showOtherCitizenshipInput || false;
      
      // Если гражданство "Другое", убедимся что поле отображается
      if (formData.citizenship === 'other' && !showOtherCitizenshipInput.value) {
        showOtherCitizenshipInput.value = true;
      }
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Очистка состояния в localStorage
const clearLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  const requiredFields = [];
  
  // Обязательные поля для всех типов
  requiredFields.push(
    formData.userType.trim(),
    formData.citizenship.trim(),
    formData.lastName.trim(),
    formData.firstName.trim(),
    formData.passportNumber.trim(),
    formData.passportIssuedBy.trim(),
    formData.passportIssueDate.trim(),
    formData.registrationAddress.trim()
  );
  
  // Если выбрано "Другое", проверяем поле otherCitizenship
  if (formData.citizenship === 'other') {
    requiredFields.push(formData.otherCitizenship.trim());
  }
  
  // Для ИП добавляем дополнительные обязательные поля
  if (formData.userType === 'entrepreneur') {
    requiredFields.push(
      formData.legalAddress.trim(),
      formData.inn.trim(),
      formData.ogrn.trim(),
      formData.accountNumber.trim(),
      formData.bankName.trim(),
      formData.bankInn.trim(),
      formData.bankBik.trim(),
      formData.correspondentAccount.trim(),
      formData.bankLegalAddress.trim()
    );
  }
  
  return requiredFields.every(Boolean);
});

// Валидация ИНН (12 цифр для физлиц/ИП)
const validateINN = (inn: string): boolean => {
  const innRegex = /^\d{12}$/;
  return innRegex.test(inn);
};

// Валидация ОГРН (15 цифр для ИП)
const validateOGRN = (ogrn: string): boolean => {
  const ogrnRegex = /^\d{15}$/;
  return ogrnRegex.test(ogrn);
};

// Валидация БИК (9 цифр)
const validateBIK = (bik: string): boolean => {
  const bikRegex = /^\d{9}$/;
  return bikRegex.test(bik);
};

// Валидация расчетного счета (20 цифр)
const validateAccountNumber = (account: string): boolean => {
  const accountRegex = /^\d{20}$/;
  return accountRegex.test(account);
};

// Валидация серии и номера паспорта
const validatePassportNumber = (passport: string): boolean => {
  // Удаляем все пробелы и проверяем формат
  const cleaned = passport.replace(/\s/g, '');
  const passportRegex = /^\d{10}$/;
  return passportRegex.test(cleaned);
};

// Валидация поля
const validateField = (fieldName: keyof typeof errors) => {
  const value = formData[fieldName as keyof typeof formData] as string;
  
  // Сбрасываем ошибку
  errors[fieldName] = '';
  
  // Проверка на заполненность
  if (!value.trim()) {
    errors[fieldName] = 'Это поле обязательно для заполнения';
    return false;
  }
  
  // Специфичные проверки
  switch (fieldName) {
    case 'inn':
      if (!validateINN(value)) {
        errors.inn = 'ИНН должен состоять из 12 цифр';
        return false;
      }
      break;
      
    case 'ogrn':
      if (!validateOGRN(value)) {
        errors.ogrn = 'ОГРН должен состоять из 15 цифр';
        return false;
      }
      break;
      
    case 'bankBik':
      if (!validateBIK(value)) {
        errors.bankBik = 'БИК должен состоять из 9 цифр';
        return false;
      }
      break;
      
    case 'accountNumber':
      if (!validateAccountNumber(value)) {
        errors.accountNumber = 'Расчетный счет должен состоять из 20 цифр';
        return false;
      }
      break;
      
    case 'correspondentAccount':
      if (!validateAccountNumber(value)) {
        errors.correspondentAccount = 'Корреспондентский счет должен состоять из 20 цифр';
        return false;
      }
      break;
      
    case 'passportNumber':
      if (!validatePassportNumber(value)) {
        errors.passportNumber = 'Серия и номер паспорта должны состоять из 10 цифр (например: 4510123456)';
        return false;
      }
      break;
      
    case 'passportIssueDate':
      const issueDate = dayjs(value);
      const today = dayjs();
      
      if (issueDate.isAfter(today)) {
        errors.passportIssueDate = 'Дата выдачи не может быть в будущем';
        return false;
      }
      break;
      
    case 'lastName':
    case 'firstName':
    case 'otherCitizenship':
      if (value.trim().length < 2) {
        errors[fieldName] = 'Должно содержать минимум 2 символа';
        return false;
      }
      break;
  }
  
  return true;
};

// Валидация всей формы
const validateForm = (): boolean => {
  let isValid = true;
  
  // Проверяем тип лица
  if (!formData.userType) {
    errors.userType = 'Выберите тип лица';
    isValid = false;
  }
  
  // Список полей для валидации
  const fieldsToValidate: (keyof typeof errors)[] = [
    'citizenship',
    'lastName',
    'firstName',
    'passportNumber',
    'passportIssuedBy',
    'passportIssueDate',
    'registrationAddress'
  ];
  
  // Если выбрано "Другое" для гражданства, добавляем поле otherCitizenship
  if (formData.citizenship === 'other') {
    fieldsToValidate.push('otherCitizenship');
  }
  
  // Если ИП, добавляем дополнительные поля
  if (formData.userType === 'entrepreneur') {
    fieldsToValidate.push(
      'legalAddress',
      'inn',
      'ogrn',
      'accountNumber',
      'bankName',
      'bankInn',
      'bankBik',
      'correspondentAccount',
      'bankLegalAddress'
    );
  }
  
  // Валидируем все поля
  fieldsToValidate.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Обработчик изменения типа лица
const handleUserTypeChange = () => {
  // Сбрасываем ошибку типа
  errors.userType = '';
  
  // Если выбран не ИП, очищаем поля ИП
  if (formData.userType !== 'entrepreneur') {
    formData.legalAddress = '';
    formData.inn = '';
    formData.ogrn = '';
    formData.accountNumber = '';
    formData.bankName = '';
    formData.bankInn = '';
    formData.bankBik = '';
    formData.correspondentAccount = '';
    formData.bankLegalAddress = '';
    
    // Сбрасываем ошибки полей ИП
    errors.legalAddress = '';
    errors.inn = '';
    errors.ogrn = '';
    errors.accountNumber = '';
    errors.bankName = '';
    errors.bankInn = '';
    errors.bankBik = '';
    errors.correspondentAccount = '';
    errors.bankLegalAddress = '';
  }
  
  // Сохраняем состояние
  saveStateToLocalStorage();
};

// Обработчик изменения гражданства
const handleCitizenshipChange = () => {
  errors.citizenship = '';
  errors.otherCitizenship = '';
  
  // Показываем или скрываем поле для ввода другого гражданства
  showOtherCitizenshipInput.value = formData.citizenship === 'other';
  
  // Если выбрано не "Другое", очищаем поле otherCitizenship
  if (formData.citizenship !== 'other') {
    formData.otherCitizenship = '';
  }
  
  // Валидируем поля ФИО при изменении гражданства
  validateField('lastName');
  validateField('firstName');
  validateField('middleName');
  
  // Сохраняем состояние
  saveStateToLocalStorage();
};

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  if (validateForm()) {
    // Очищаем localStorage после успешного завершения
    clearLocalStorage();
    emit('go-next');
  } else {
    ElMessage.error('Пожалуйста, заполните все обязательные поля правильно');
  }
};

// Сохранение состояния при изменении данных формы
watch(() => formData, () => {
  saveStateToLocalStorage();
}, { deep: true });

// Следим за изменениями в полях для автоматической валидации
watch(() => formData.userType, () => {
  if (formData.userType === 'entrepreneur') {
    validateField('legalAddress');
    validateField('inn');
    validateField('ogrn');
  }
});

// Наблюдаем за полем с гражданством для проверки ФИО (для разных стран разные требования)
watch(() => formData.citizenship, () => {
  if (formData.citizenship) {
    validateField('lastName');
    validateField('firstName');
    validateField('middleName');
  }
});

// Наблюдаем за полем otherCitizenship для валидации
watch(() => formData.otherCitizenship, (newValue) => {
  if (newValue && formData.citizenship === 'other') {
    validateField('otherCitizenship');
  }
});

// Загрузка состояния при монтировании компонента
onMounted(() => {
  loadStateFromLocalStorage();
});
</script>

<template>
<div class="quiz__form quiz__form_four">
  <h4 class="quiz__form_head">Данные паспорта и реквизиты</h4>
  
  <div class="form__flex">
    <!-- Тип лица -->
    <div class="form__group">
      <label class="form__label button">Выберите тип лица<span>*</span></label>
      <p class="form__hint text_small">Данные паспорта нужны нам для составления договора. Эти данные остаются конфиденциальными и не пересылаются третьим лицам.</p>
      <div class="form__labels">
        <label class="form__label">
          <input 
            type="radio" 
            v-model="formData.userType" 
            value="individual"
            class="form__label_input"
            @change="handleUserTypeChange"
          >
          <span class="form__label_text">Физическое лицо</span>
        </label>
        <label class="form__label">
          <input 
            type="radio" 
            v-model="formData.userType" 
            value="entrepreneur"
            class="form__label_input"
            @change="handleUserTypeChange"
          >
          <span class="form__label_text">Индивидуальный предприниматель</span>
        </label>
      </div>
      <div v-if="errors.userType" class="error text_very">
        {{ errors.userType }}
      </div>
    </div>

    <!-- Поля для ИП -->
    <template v-if="formData.userType === 'entrepreneur'">
      <!-- Юридический адрес организации -->
      <div class="form__group">
        <label for="legalAddress" class="form__label button">Юридический адрес организации<span>*</span></label>
        <el-input
          id="legalAddress"
          v-model="formData.legalAddress"
          type="text"
          :class="{ 'error': errors.legalAddress }"
          placeholder="Введите юридический адрес"
          @blur="validateField('legalAddress')"
          @input="errors.legalAddress = ''"
          size="large"
        />
        <div v-if="errors.legalAddress" class="error text_very">
          {{ errors.legalAddress }}
        </div>
      </div>

      <!-- ИНН -->
      <div class="form__group">
        <label for="inn" class="form__label button">ИНН<span>*</span></label>
        <el-input
          id="inn"
          v-model="formData.inn"
          type="text"
          :class="{ 'error': errors.inn }"
          placeholder="Введите ИНН"
          maxlength="12"
          @blur="validateField('inn')"
          @input="errors.inn = ''"
          size="large"
        />
        <div v-if="errors.inn" class="error text_very">
          {{ errors.inn }}
        </div>
      </div>

      <!-- ОГРН -->
      <div class="form__group">
        <label for="ogrn" class="form__label button">ОГРН<span>*</span></label>
        <el-input
          id="ogrn"
          v-model="formData.ogrn"
          type="text"
          :class="{ 'error': errors.ogrn }"
          placeholder="Введите ОГРН"
          maxlength="15"
          @blur="validateField('ogrn')"
          @input="errors.ogrn = ''"
          size="large"
        />
        <div v-if="errors.ogrn" class="error text_very">
          {{ errors.ogrn }}
        </div>
      </div>

      <!-- Расчетный счет -->
      <div class="form__group">
        <label for="accountNumber" class="form__label button">Расчетный счет<span>*</span></label>
        <el-input
          id="accountNumber"
          v-model="formData.accountNumber"
          type="text"
          :class="{ 'error': errors.accountNumber }"
          placeholder="Введите расчетный счет"
          maxlength="20"
          @blur="validateField('accountNumber')"
          @input="errors.accountNumber = ''"
          size="large"
        />
        <div v-if="errors.accountNumber" class="error text_very">
          {{ errors.accountNumber }}
        </div>
      </div>

      <!-- Банк -->
      <div class="form__group">
        <label for="bankName" class="form__label button">Банк<span>*</span></label>
        <el-input
          id="bankName"
          v-model="formData.bankName"
          type="text"
          :class="{ 'error': errors.bankName }"
          placeholder="Введите полное наименование банка"
          @blur="validateField('bankName')"
          @input="errors.bankName = ''"
          size="large"
        />
        <div v-if="errors.bankName" class="error text_very">
          {{ errors.bankName }}
        </div>
      </div>

      <!-- ИНН банка -->
      <div class="form__group">
        <label for="bankInn" class="form__label button">ИНН банка<span>*</span></label>
        <el-input
          id="bankInn"
          v-model="formData.bankInn"
          type="text"
          :class="{ 'error': errors.bankInn }"
          placeholder="Введите ИНН банка"
          maxlength="10"
          @blur="validateField('bankInn')"
          @input="errors.bankInn = ''"
          size="large"
        />
        <div v-if="errors.bankInn" class="error text_very">
          {{ errors.bankInn }}
        </div>
      </div>

      <!-- БИК банка -->
      <div class="form__group">
        <label for="bankBik" class="form__label button">БИК банка<span>*</span></label>
        <el-input
          id="bankBik"
          v-model="formData.bankBik"
          type="text"
          :class="{ 'error': errors.bankBik }"
          placeholder="Введите БИК банка"
          maxlength="9"
          @blur="validateField('bankBik')"
          @input="errors.bankBik = ''"
          size="large"
        />
        <div v-if="errors.bankBik" class="error text_very">
          {{ errors.bankBik }}
        </div>
      </div>

      <!-- Корреспондентский счет банка -->
      <div class="form__group">
        <label for="correspondentAccount" class="form__label button">Корреспондентский счет банка<span>*</span></label>
        <el-input
          id="correspondentAccount"
          v-model="formData.correspondentAccount"
          type="text"
          :class="{ 'error': errors.correspondentAccount }"
          placeholder="Введите корреспондентский счет"
          maxlength="20"
          @blur="validateField('correspondentAccount')"
          @input="errors.correspondentAccount = ''"
          size="large"
        />
        <div v-if="errors.correspondentAccount" class="error text_very">
          {{ errors.correspondentAccount }}
        </div>
      </div>

      <!-- Юридический адрес банка -->
      <div class="form__group">
        <label for="bankLegalAddress" class="form__label button">Юридический адрес банка<span>*</span></label>
        <el-input
          id="bankLegalAddress"
          v-model="formData.bankLegalAddress"
          type="text"
          :class="{ 'error': errors.bankLegalAddress }"
          placeholder="Введите юридический адрес банка"
          @blur="validateField('bankLegalAddress')"
          @input="errors.bankLegalAddress = ''"
          size="large"
        />
        <div v-if="errors.bankLegalAddress" class="error text_very">
          {{ errors.bankLegalAddress }}
        </div>
      </div>
    </template>

    <!-- Общие поля для всех типов -->
    <!-- Гражданство -->
    <div class="form__group">
      <label for="citizenship" class="form__label button">Гражданство<span>*</span></label>
      <el-select
        id="citizenship"
        v-model="formData.citizenship"
        placeholder="Выберите гражданство"
        :class="{ 'error': errors.citizenship }"
        size="large"
        @change="handleCitizenshipChange"
      >
        <el-option
          v-for="country in citizenshipOptions"
          :key="country.value"
          :label="country.label"
          :value="country.value"
        />
      </el-select>
      <div v-if="errors.citizenship" class="error text_very">
        {{ errors.citizenship }}
      </div>
      
      <!-- Поле для ввода другого гражданства -->
      <div v-if="showOtherCitizenshipInput" class="form__group" style="margin-top: 10px;">
        <label for="otherCitizenship" class="form__label button">Укажите ваше гражданство<span>*</span></label>
        <el-input
          id="otherCitizenship"
          v-model="formData.otherCitizenship"
          type="text"
          :class="{ 'error': errors.otherCitizenship }"
          placeholder="Введите ваше гражданство"
          @blur="validateField('otherCitizenship')"
          @input="errors.otherCitizenship = ''"
          size="large"
        />
        <div v-if="errors.otherCitizenship" class="error text_very">
          {{ errors.otherCitizenship }}
        </div>
      </div>
    </div>

    <!-- Фамилия -->
    <div class="form__group">
      <label for="lastName" class="form__label button">Фамилия<span>*</span></label>
      <el-input
        id="lastName"
        v-model="formData.lastName"
        type="text"
        :class="{ 'error': errors.lastName }"
        placeholder="Введите фамилию"
        @blur="validateField('lastName')"
        @input="errors.lastName = ''"
        size="large"
      />
      <div v-if="errors.lastName" class="error text_very">
        {{ errors.lastName }}
      </div>
    </div>

    <!-- Имя -->
    <div class="form__group">
      <label for="firstName" class="form__label button">Имя<span>*</span></label>
      <el-input
        id="firstName"
        v-model="formData.firstName"
        type="text"
        :class="{ 'error': errors.firstName }"
        placeholder="Введите имя"
        @blur="validateField('firstName')"
        @input="errors.firstName = ''"
        size="large"
      />
      <div v-if="errors.firstName" class="error text_very">
        {{ errors.firstName }}
      </div>
    </div>

    <!-- Отчество -->
    <div class="form__group">
      <label for="middleName" class="form__label button">Отчество<span>*</span></label>
      <el-input
        id="middleName"
        v-model="formData.middleName"
        type="text"
        :class="{ 'error': errors.middleName }"
        placeholder="Введите отчество (при наличии)"
        @blur="validateField('middleName')"
        @input="errors.middleName = ''"
        size="large"
      />
      <div v-if="errors.middleName" class="error text_very">
        {{ errors.middleName }}
      </div>
    </div>

    <!-- Серия и номер паспорта -->
    <div class="form__group">
      <label for="passportNumber" class="form__label button">Серия и номер паспорта (или удостоверения)<span>*</span></label>
      <p class="form__hint text_small">Если у вас биометрический паспорт, посмотрите данные в приложении к паспорту</p>
      <el-input
        id="passportNumber"
        v-model="formData.passportNumber"
        type="text"
        :class="{ 'error': errors.passportNumber }"
        placeholder="Например: 4510 123456"
        @blur="validateField('passportNumber')"
        @input="errors.passportNumber = ''"
        size="large"
      />
      <div v-if="errors.passportNumber" class="error text_very">
        {{ errors.passportNumber }}
      </div>
    </div>

    <!-- Кем выдан -->
    <div class="form__group">
      <label for="passportIssuedBy" class="form__label button">Кем выдан<span>*</span></label>
      <el-input
        id="passportIssuedBy"
        v-model="formData.passportIssuedBy"
        type="text"
        :class="{ 'error': errors.passportIssuedBy }"
        placeholder="Например: ОУФМС России по г. Москве"
        @blur="validateField('passportIssuedBy')"
        @input="errors.passportIssuedBy = ''"
        size="large"
      />
      <div v-if="errors.passportIssuedBy" class="error text_very">
        {{ errors.passportIssuedBy }}
      </div>
    </div>

    <!-- Дата выдачи -->
    <div class="form__group">
      <label for="passportIssueDate" class="form__label button">Дата выдачи<span>*</span></label>
      <el-date-picker
        id="passportIssueDate"
        v-model="formData.passportIssueDate"
        type="date"
        placeholder="Выберите дату"
        format="DD.MM.YYYY"
        value-format="YYYY-MM-DD"
        :class="{ 'error': errors.passportIssueDate }"
        size="large"
        style="width: 100%;"
        @change="errors.passportIssueDate = ''"
      />
      <div v-if="errors.passportIssueDate" class="error text_very">
        {{ errors.passportIssueDate }}
      </div>
    </div>

    <!-- Адрес регистрации -->
    <div class="form__group">
      <label for="registrationAddress" class="form__label button">Адрес регистрации / вашей прописки полностью, как в документе<span>*</span></label>
      <el-input
        id="registrationAddress"
        v-model="formData.registrationAddress"
        type="text"
        :class="{ 'error': errors.registrationAddress }"
        placeholder="Введите полный адрес регистрации"
        @blur="validateField('registrationAddress')"
        @input="errors.registrationAddress = ''"
        size="large"
      />
      <div v-if="errors.registrationAddress" class="error text_very">
        {{ errors.registrationAddress }}
      </div>
    </div>
  </div>
  
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="goNext"
        :disabled="!isReadyForNextStep"
      >
        <span>Продолжить</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.form__flex {
  padding: 20px 0 0;
}

@media (max-width: 767px) {
}
</style>