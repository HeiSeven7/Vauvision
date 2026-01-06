<template>
  <div class="quiz__form quiz__form_six">
    <h4 class="quiz__form_head">дополнительная информация</h4>
    <div class="form__flex">
      <!-- Откуда узнали -->
      <div class="form__group">
        <label class="form__label button">откуда вы о нас узнали?*</label>
        <el-select
          v-model="formData.platforms"
          multiple
          placeholder="Выберите площадки"
          :class="{ 'error': errors.platforms }"
          size="large"
          @change="validateForm"
        >
          <el-option
            v-for="platform in platformOptions"
            :key="platform.value"
            :label="platform.label"
            :value="platform.value"
          />
        </el-select>
        <div v-if="errors.platforms" class="error text_very">
          {{ errors.platforms }}
        </div>
        <div v-if="formData.platforms.includes('other')" class="form__group_inner">
          <el-input
            v-model="formData.otherPlatform"
            type="text"
            placeholder="Укажите другие площадки"
            :class="{ 'error': errors.otherPlatform }"
            @blur="validateForm"
            @input="errors.otherPlatform = ''"
            size="large"
          />
          <div v-if="errors.otherPlatform" class="error text_very">
            {{ errors.otherPlatform }}
          </div>
        </div>
      </div>

      <!-- Права на инструменты -->
      <div class="form__group">
        <label for="rightsInfo" class="form__label button">Правила на инструменты</label>
        <p class="form__hint text_small">В поле ниже, пожалуйста, укажите в столбик «Название трека – тип прав». Эта информация поможет загрузить релиз на площадки и соблюсти сроки. Если у вас только один трек, то напишите для одного трека. Если у вас несколько треков, то напишите для каждого трека. По желанию, вы можете прикрепить ссылку на сам договор на Яндекс Диске – это не обязательно.</p>
        <el-input
          v-model="formData.rightsInfo"
          type="textarea"
          :rows="6"
          placeholder="1. Название первого трека - исключительная лицензия
2. Название второго трека - wav лицензия
3. Название третьего трека - полное отчуждение прав
4. Название четвертого трека - я автор 100% музыки"
          @input="errors.rightsInfo = ''"
          size="large"
        />
        <div class="form__group_inner">
          <label for="rightsContractLink" class="form__label button text_small">Ссылка на договор в Яндекс Диске (не обязательно)</label>
          <el-input
            v-model="formData.rightsContractLink"
            type="text"
            placeholder="https://disk.yandex.ru/..."
            @blur="validateUrlField('rightsContractLink')"
            @input="errors.rightsContractLink = ''"
            size="large"
          />
          <div v-if="errors.rightsContractLink" class="error text_very">
            {{ errors.rightsContractLink }}
          </div>
        </div>
      </div>

      <!-- Дополнительные комментарии -->
      <div class="form__group">
        <label for="additionalComments" class="form__label button">дополнительные комментарии</label>
        <p class="form__hint text_small">Почти закончили! Напишите все, что считаете важным. Если вы пропустили какую-то информацию, у вас есть особые пожелания - самое время рассказать о них.</p>
        <el-input
          v-model="formData.additionalComments"
          type="textarea"
          :rows="4"
          placeholder="Ваши комментарии и пожелания..."
          @input="errors.additionalComments = ''"
          size="large"
        />
      </div>

      <!-- Промо-план релиза -->
      <div class="form__group">
        <label for="promoPlan" class="form__label button">Промо-план релиза для редакторов площадок</label>
        <p class="form__hint text_small">Добавьте кратко информацию об артисте, готовящемся релизе (1-2 предложения), где и с каким бюджетом будет делаться реклама (если планируется). Эта информация повысит шансы на получение поддержки от площадок.</p>
        <el-input
          v-model="formData.promoPlan"
          type="textarea"
          :rows="4"
          placeholder="Информация об артисте, релизе, планах по рекламе..."
          @input="errors.promoPlan = ''"
          size="large"
        />
      </div>

      <!-- Ссылка на Bandlink -->
      <div class="form__group">
        <label for="bandlinkUrl" class="form__label button">ССЫЛКА НА ВАШ ПРЕДСТОЯЩИЙ РЕЛИЗ В BANDLINK</label>
        <p class="form__hint text_small">Если у вас есть верифицированный профиль Band.link, то зайдите туда, перейдите в раздел «Страницы» и нажмите «Создать Bandlink». Создайте страницу релиза, указав псевдоним и название будущего релиза. Далее нажмите «Превью страницы» и скопируйте получившуюся ссылку. Её и нужно вставить в поле слева. Если у вас нет профиля в Band.link, пропустить это поле.</p>
        <el-input
          v-model="formData.bandlinkUrl"
          type="text"
          :class="{ 'error': errors.bandlinkUrl }"
          placeholder="https://band.link/..."
          @blur="validateUrlField('bandlinkUrl')"
          @input="errors.bandlinkUrl = ''"
          size="large"
        />
        <div v-if="errors.bandlinkUrl" class="error text_very">
          {{ errors.bandlinkUrl }}
        </div>
      </div>

      <!-- Промокод -->
      <div class="form__group">
        <label for="promoCode" class="form__label button">промокод</label>
        <p class="form__hint text_small">vauvision-promo</p>
        <el-input
          v-model="formData.promoCode"
          type="text"
          placeholder="Введите промокод"
          @input="errors.promoCode = ''"
          size="large"
        />
      </div>

      <!-- Бонусы партнера -->
      <div class="form__group">
        <h5 class="form__label">бонусы партнера</h5>
        <div class="form__checkbox_group">
          <el-checkbox
            v-model="formData.usePartnerBonuses"
            @change="errors.usePartnerBonuses = ''"
          >
            Использовать бонусы партнера
          </el-checkbox>
        </div>
      </div>

      <!-- Итого к оплате -->
      <div class="form__group">
        <div class="quiz__form_sum">
          <p class="quiz__form_sum_text">Итого к оплате:</p>
          <h4 class="quiz__form_total"><span>{{ totalAmount }}</span> ₽</h4>
        </div>
      </div>

      <!-- Подтверждение -->
      <div class="form__group">
        <div class="form__checkbox_group">
          <el-checkbox
            v-model="formData.confirmNoRightsViolation"
            :class="{ 'error': errors.confirmNoRightsViolation }"
            @change="validateField('confirmNoRightsViolation')"
          >
            Я подтверждаю, что мои треки не нарушают права других авторов музыки и текста*
          </el-checkbox>
        </div>
        <div v-if="errors.confirmNoRightsViolation" class="error text_very">
          {{ errors.confirmNoRightsViolation }}
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
          @click="handleContinue"
          :disabled="!isReadyForNextStep"
        >
          <span>подписать договор и оплатить</span>
        </button>
      </div>
    </div>

    <!-- Кастомный попап для подписи -->
    <SignaturePopup
      v-if="showSignaturePopup"
      @close="closeSignaturePopup"
      @submit="handleSignatureSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElSelect, ElOption, ElInput, ElCheckbox, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import SignaturePopup from '@/components/layout/Signature.vue';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для localStorage
const STORAGE_KEY = 'quiz6_state';

// Данные формы
const formData = reactive({
  platforms: [] as string[],
  otherPlatform: '',
  rightsInfo: '',
  rightsContractLink: '',
  additionalComments: '',
  promoPlan: '',
  bandlinkUrl: '',
  promoCode: '',
  usePartnerBonuses: false,
  confirmNoRightsViolation: false
});

// Ошибки валидации
const errors = reactive({
  platforms: '',
  otherPlatform: '',
  rightsInfo: '', // Убрали из валидации
  rightsContractLink: '',
  additionalComments: '', // Убрали из валидации
  promoPlan: '', // Убрали из валидации
  bandlinkUrl: '',
  promoCode: '', // Убрали из валидации
  usePartnerBonuses: '', // Убрали из валидации
  confirmNoRightsViolation: ''
});

// Состояние попапа
const showSignaturePopup = ref(false);

// Опции для выбора площадок
const platformOptions = [
  { label: 'Социальные сети (VK, Instagram, Telegram)', value: 'social' },
  { label: 'Рекомендация друзей', value: 'friends' },
  { label: 'Поиск в интернете', value: 'search' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Музыкальные форумы', value: 'forums' },
  { label: 'Ранее пользовались нашими услугами', value: 'previous' },
  { label: 'Другое', value: 'other' }
];

// Сумма к оплате (примерная, можно подключать из store)
const totalAmount = ref(2590);

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  try {
    const stateToSave = {
      formData
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
      
      // Восстанавливаем данные формы
      Object.assign(formData, parsedState.formData);
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Очистка состояния в localStorage
const clearLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Валидация URL
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Пустая строка допустима для необязательных полей
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Валидация конкретного поля (ТОЛЬКО ОБЯЗАТЕЛЬНЫЕ)
const validateField = (fieldName: keyof typeof errors): boolean => {
  let errorMessage = '';
  
  switch (fieldName) {
    case 'platforms':
      if (formData.platforms.length === 0) {
        errorMessage = 'Выберите хотя бы один вариант';
      }
      break;
      
    case 'otherPlatform':
      if (formData.platforms.includes('other') && !formData.otherPlatform.trim()) {
        errorMessage = 'Укажите другие источники';
      } else if (formData.otherPlatform.trim().length > 0 && formData.otherPlatform.trim().length < 2) {
        errorMessage = 'Минимум 2 символа';
      }
      break;
      
    case 'rightsContractLink':
      // Не обязательное поле, проверяем только если есть текст
      if (formData.rightsContractLink.trim() && !isValidUrl(formData.rightsContractLink)) {
        errorMessage = 'Введите корректную ссылку (начинается с https://)';
      }
      break;
      
    case 'bandlinkUrl':
      // Не обязательное поле, проверяем только если есть текст
      if (formData.bandlinkUrl.trim() && !isValidUrl(formData.bandlinkUrl)) {
        errorMessage = 'Введите корректную ссылку на Band.link';
      } else if (formData.bandlinkUrl.trim() && !formData.bandlinkUrl.includes('band.link')) {
        errorMessage = 'Ссылка должна вести на Band.link';
      }
      break;
      
    case 'confirmNoRightsViolation':
      if (!formData.confirmNoRightsViolation) {
        errorMessage = 'Необходимо подтвердить отсутствие нарушений прав';
      }
      break;
      
    // Поля rightsInfo, additionalComments, promoPlan, promoCode, usePartnerBonuses - НЕ ПРОВЕРЯЕМ!
  }
  
  errors[fieldName] = errorMessage;
  
  // Сохраняем состояние после валидации
  saveStateToLocalStorage();
  
  return !errorMessage;
};

// Валидация URL полей
const validateUrlField = (fieldName: keyof typeof errors): boolean => {
  let isValid = true;
  
  if (fieldName === 'rightsContractLink') {
    if (formData.rightsContractLink.trim()) {
      if (!isValidUrl(formData.rightsContractLink)) {
        errors.rightsContractLink = 'Введите корректную ссылку (начинается с https://)';
        isValid = false;
      } else {
        errors.rightsContractLink = '';
        isValid = true;
      }
    } else {
      errors.rightsContractLink = '';
      isValid = true;
    }
  } else if (fieldName === 'bandlinkUrl') {
    if (formData.bandlinkUrl.trim()) {
      if (!isValidUrl(formData.bandlinkUrl)) {
        errors.bandlinkUrl = 'Введите корректную ссылку (начинается с https://)';
        isValid = false;
      } else if (!formData.bandlinkUrl.includes('band.link')) {
        errors.bandlinkUrl = 'Ссылка должна вести на Band.link';
        isValid = false;
      } else {
        errors.bandlinkUrl = '';
        isValid = true;
      }
    } else {
      errors.bandlinkUrl = '';
      isValid = true;
    }
  }
  
  // Сохраняем состояние после валидации
  saveStateToLocalStorage();
  
  return isValid;
};

// Валидация всей формы (ТОЛЬКО ОБЯЗАТЕЛЬНЫЕ ПОЛЯ)
const validateForm = (): boolean => {
  let isValid = true;
  
  // Проверяем только обязательные поля
  const requiredFields: (keyof typeof errors)[] = [
    'platforms',
    'confirmNoRightsViolation'
  ];
  
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // Проверяем otherPlatform если выбрано "other"
  if (formData.platforms.includes('other')) {
    const otherPlatformValid = validateField('otherPlatform');
    if (!otherPlatformValid) {
      isValid = false;
    }
  }
  
  // Проверяем URL поля только если они заполнены (не обязательные)
  if (formData.rightsContractLink.trim()) {
    const rightsContractValid = validateUrlField('rightsContractLink');
    if (!rightsContractValid) {
      isValid = false;
    }
  }
  
  if (formData.bandlinkUrl.trim()) {
    const bandlinkValid = validateUrlField('bandlinkUrl');
    if (!bandlinkValid) {
      isValid = false;
    }
  }
  
  // Сохраняем состояние после валидации
  saveStateToLocalStorage();
  
  return isValid;
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем только обязательные поля
  const requiredFieldsValid = 
    formData.platforms.length > 0 &&
    formData.confirmNoRightsViolation;
  
  // Если выбрано "other", проверяем поле otherPlatform
  let otherPlatformValid = true;
  if (formData.platforms.includes('other')) {
    otherPlatformValid = formData.otherPlatform.trim().length >= 2;
  }
  
  // URL поля - не обязательные, проверяем только если заполнены
  let rightsContractUrlValid = true;
  if (formData.rightsContractLink.trim()) {
    rightsContractUrlValid = isValidUrl(formData.rightsContractLink);
  }
  
  let bandlinkUrlValid = true;
  if (formData.bandlinkUrl.trim()) {
    bandlinkUrlValid = isValidUrl(formData.bandlinkUrl) && formData.bandlinkUrl.includes('band.link');
  }
  
  // ВСЕ ОСТАЛЬНЫЕ ПОЛЯ (rightsInfo, additionalComments, promoPlan, promoCode, usePartnerBonuses) - НЕ ПРОВЕРЯЕМ!
  // Они полностью необязательные
  
  return requiredFieldsValid && 
         otherPlatformValid && 
         rightsContractUrlValid && 
         bandlinkUrlValid;
});

const goBack = () => {
  emit('go-back');
};

const handleContinue = () => {
  const formValid = validateForm();
  if (formValid) {
    // Показываем попап для подписи
    showSignaturePopup.value = true;
    document.documentElement.classList.add('noscroll');
  } else {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля корректно');
  }
};

const closeSignaturePopup = () => {
  showSignaturePopup.value = false;
  document.documentElement.classList.remove('noscroll');
};

const handleSignatureSubmit = (signatureData: string) => {
  // Здесь можно обработать подпись (например, отправить на сервер)
  console.log('Подпись получена:', signatureData);
  closeSignaturePopup();
  
  // Очищаем localStorage после успешного завершения
  clearLocalStorage();
  
  // Сохраняем данные формы и переходим дальше
  console.log('Данные формы сохранены:', formData);
  emit('go-next');
};

// Сохранение состояния при изменении данных формы
watch(() => formData, () => {
  saveStateToLocalStorage();
}, { deep: true });

// Следим за изменением platforms чтобы очистить otherPlatform если нужно
watch(() => formData.platforms, (newPlatforms) => {
  if (!newPlatforms.includes('other')) {
    formData.otherPlatform = '';
    errors.otherPlatform = '';
  }
  saveStateToLocalStorage();
});

// Загрузка состояния при монтировании компонента
onMounted(() => {
  loadStateFromLocalStorage();
});
</script>

<style lang="css" scoped>
.quiz__form {
  width: calc(100% - 330px);
  padding: 0 40px 0 60px;
}
.quiz__form_head {
  margin-bottom: 20px;
}
.quiz__form_description {
  color: var(--text-gray);
  margin-bottom: 40px;
}
.quiz__form_bottom {
  display: flex;
  padding: 60px 0 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.quiz__form_buttons {
  display: flex;
  align-items: center;
  gap: 30px;
}
.form__checkbox_group .el-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-gray);
}
.quiz__form_sum {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}
.quiz__form_total {
  color: var(--color);
  transform: translateY(-2.5px);
}
.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
.form__group_inner {
  margin-top: 15px;
}

@media (max-width: 1439px) {
  .quiz__form {
    width: 100%;
    padding: 0;
  }
}
@media (max-width: 767px) {
  .quiz__form_bottom {
    padding: 40px 0 0;
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 40px;
  }
  .quiz__form {
    padding: 0;
  }
}
</style>