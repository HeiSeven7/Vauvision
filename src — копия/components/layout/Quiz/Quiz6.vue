<template>
  <div class="quiz__form quiz__form_six">
    <h4 class="quiz__form_head">дополнительная информация</h4>
    <div class="form__flex">
      <!-- Откуда узнали -->
      <div class="form__group">
        <label class="form__label button">откуда вы о нас узнали?<span>*</span></label>
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
        <p class="form__hint text_small">В поле ниже, пожалуйста, укажите в столбик «Название трека – тип прав». Эта информация поможет загрузить релиз на площадки и соблюсти сроки. Если у вас только один трек, то напишите для одного трека. Если у вас несколько треков, то напишите для каждого трека. По желанию, вы можете прикрепить ссылку на сам договор на <a href="https://360.yandex.ru/disk/">Яндекс Диске</a> – это не обязательно.</p>
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
          <label for="rightsContractLink" class="form__label button text_small">Ссылка на договор в <a href="https://360.yandex.ru/disk/">Яндекс Диске</a> (не обязательно)</label>
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
        <p class="form__hint text_small">Если у вас есть верифицированный профиль <a href="https://Band.link" target="_blank">Band.link</a>, то зайдите туда, перейдите в раздел «Страницы» и нажмите «Создать Bandlink». Создайте страницу релиз, указав псевдоним и название будущего релиза. Далее нажмите «Превью страницы» и скопируйте получившуюся ссылку. Её и нужно вставить в поле слева. Если у вас нет профиля в Band.link, пропустить это поле.</p>
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
        <div class="form__promo_input">
          <el-input
            v-model="formData.promoCode"
            type="text"
            placeholder="Введите промокод"
            :disabled="promoApplied"
            @input="handlePromoInput"
            size="large"
            style="flex: 1;"
          />
          <el-button 
            v-if="promoApplied"
            type="info" 
            @click="removePromoCode"
            size="default"
          >
            Отменить
          </el-button>
          <span v-if="promoLoading" class="promo_loading">Проверка...</span>
        </div>
        <div v-if="promoMessage" :class="promoMessageType === 'success' ? 'success' : 'error'" class="text_very">
          {{ promoMessage }}
        </div>
        <div v-if="promoDiscount > 0" class="promo_discount_info">
          Применена скидка {{ promoDiscount }}%
        </div>
      </div>

      <!-- Бонусы -->
      <div class="form__group">
        <label for="bonuses" class="form__label button">Бонусы</label>
        <p class="form__hint text_small">У вас доступно {{ userBonuses }} бонусов. 1 бонус = 1 {{ currencySymbol }}. Максимум можно использовать {{ maxBonuses }} бонусов.</p>
        <div class="form__bonus_input">
          <el-input-number
            v-model="formData.usedBonuses"
            :min="0"
            :max="maxBonuses"
            :step="1"
            :precision="0"
            placeholder="Введите количество бонусов"
            @change="handleBonusesChange"
            @input="validateField('usedBonuses')"
            size="large"
            style="width: 200px;"
          />
          <span class="form__bonus_hint">доступно: {{ userBonuses }}</span>
        </div>
        <div v-if="errors.usedBonuses" class="error text_very">
          {{ errors.usedBonuses }}
        </div>
        <div v-if="finalAmount < 1 && formData.usedBonuses > 0" class="warning text_very">
          ⚠️ Минимальная сумма к оплате — 1 {{ currencySymbol }}. Бонусы будут скорректированы.
        </div>
      </div>

      <!-- Итого к оплате -->
      <div class="form__group">
        <div class="quiz__form_sum">
          <p class="quiz__form_sum_text">Итого к оплате:</p>
          <div class="quiz__form_total_wrapper">
            <div class="quiz__form_price_container">
              <h4 class="quiz__form_total"><span>{{ formatPrice(finalAmount) }}</span> {{ currencySymbol }}</h4>
              <span v-if="hasDiscount" class="quiz__form_original_price_strikethrough">{{ formatPrice(originalTotalAmount) }} {{ currencySymbol }}</span>
            </div>
            <div v-if="promoDiscount > 0" class="quiz__form_discount_info">
              Скидка по промокоду: {{ promoDiscount }}%
            </div>
            <p v-if="finalAmount < 1" class="quiz__form_error_price">
              Сумма не может быть меньше 1 {{ currencySymbol }}
            </p>
          </div>
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
          :disabled="isLoading"
        >
          <span><BackSVG /></span>
          <span>Назад</span>
        </button>
        <button 
          class="quiz__form_button button__black button"
          @click="handleContinue"
          :disabled="!isReadyForNextStep || isLoading || finalAmount < 1"
        >
          <span>{{ isLoading ? 'Загрузка...' : 'Далее: Договор' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElSelect, ElOption, ElInput, ElCheckbox, ElInputNumber, ElMessage, ElButton } from 'element-plus';
import { sendRequest } from '@/utils/api';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для localStorage
const STORAGE_KEY = 'quiz6_state';

// Состояние загрузки
const isLoading = ref(true);
const promoLoading = ref(false);
const promoApplied = ref(false);
const promoDiscount = ref(0);
const promoMessage = ref('');
const promoMessageType = ref<'success' | 'error'>('success');

// Таймер для debounce
let promoDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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
  usedBonuses: 0,
  confirmNoRightsViolation: false
});

// Ошибки валидации
const errors = reactive({
  platforms: '',
  otherPlatform: '',
  rightsInfo: '',
  rightsContractLink: '',
  additionalComments: '',
  promoPlan: '',
  bandlinkUrl: '',
  promoCode: '',
  usePartnerBonuses: '',
  usedBonuses: '',
  confirmNoRightsViolation: ''
});

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

// Данные из API
const originalTotalAmount = ref(0);
const currencySymbol = ref('₽');
const userBonuses = ref(0);

// Минимальная сумма к оплате
const MINIMUM_AMOUNT = 1;

// Максимальное количество бонусов, которое можно использовать
const maxBonuses = computed(() => {
  // Оставляем минимум 1 валюту для оплаты
  const maxDeductible = Math.max(0, originalTotalAmount.value - MINIMUM_AMOUNT);
  return Math.min(userBonuses.value, maxDeductible);
});

// Финальная сумма с учетом скидки и бонусов
const finalAmount = computed(() => {
  let total = originalTotalAmount.value;
  
  // Применяем скидку по промокоду
  if (promoDiscount.value > 0) {
    total = Math.floor(total * (100 - promoDiscount.value) / 100);
  }
  
  // Применяем бонусы
  const used = formData.usedBonuses || 0;
  
  // Не даем уйти ниже минимума
  return Math.max(MINIMUM_AMOUNT, total - used);
});

// Есть ли скидка (для отображения перечеркнутой цены)
const hasDiscount = computed(() => {
  return promoDiscount.value > 0 || formData.usedBonuses > 0;
});

// Загрузка данных из API
const loadBasketData = async () => {
  try {
    // Загружаем данные корзины для получения итоговой суммы
    const response = await sendRequest("post", '/ajax_vue/ajax/basket/updateBasket.php', {});
    console.log('updateBasket for Quiz6:', response.data);
    
    const data = response.data as any;
    
    if (data.data) {
      originalTotalAmount.value = data.data.total || 0;
      currencySymbol.value = data.data.currency_symbol || '₽';
      console.log('Loaded total amount:', originalTotalAmount.value, currencySymbol.value);
    }
    
    // Загружаем данные пользователя для получения бонусов
    const userResponse = await sendRequest("post", '/ajax_vue/ajax/getDataForm.php', {});
    console.log('getDataForm for Quiz6:', userResponse.data);
    
    const userData = userResponse.data as any;
    
    if (userData.user?.uf_bonus) {
      userBonuses.value = parseInt(userData.user.uf_bonus) || 0;
      console.log('Loaded user bonuses:', userBonuses.value);
    }
    
    // Загружаем состояние из localStorage после получения данных из API
    loadStateFromLocalStorage();
    
  } catch (error) {
    console.error('Ошибка загрузки данных корзины:', error);
    // В случае ошибки загружаем из localStorage
    loadStateFromLocalStorage();
  } finally {
    isLoading.value = false;
  }
};

// Обновление цены после применения промокода
const updatePriceWithPromo = async () => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/quiz/promoPrice.php', {});
    console.log('promoPrice response:', response.data);
    
    const data = response.data as any;
    
    if (data.data?.total) {
      originalTotalAmount.value = data.data.total;
      console.log('Updated total amount with promo:', originalTotalAmount.value);
    }
  } catch (error) {
    console.error('Ошибка обновления цены после промокода:', error);
  }
};

// Проверка промокода
const checkPromoCode = async (code: string) => {
  if (!code.trim()) {
    // Если поле пустое, сбрасываем промокод
    promoApplied.value = false;
    promoDiscount.value = 0;
    promoMessage.value = '';
    await updatePriceWithPromo();
    saveStateToLocalStorage();
    return;
  }
  
  promoLoading.value = true;
  
  try {
    // Получаем количество товаров из корзины
    const basketResponse = await sendRequest("post", '/ajax_vue/ajax/basket/updateBasket.php', {});
    const basketData = basketResponse.data as any;
    
    const counts = basketData.data?.counts || { single: 0, album: 0 };
    
    // Отправляем запрос на проверку промокода
    const response = await sendRequest("post", '/ajax_vue/ajax/quiz/promo.php', {
      PROMO: code,
      COUNT_SINGLE: counts.single || 0,
      COUNT_ALBUM: counts.album || 0
    });
    
    console.log('promo response:', response.data);
    
    if (response.data.error === 0) {
      // Промокод применен успешно
      promoApplied.value = true;
      
      // Извлекаем процент скидки из сообщения (например, "Промокод применен! 10%")
      const message = response.data.message || '';
      const percentMatch = message.match(/(\d+)%/);
      if (percentMatch) {
        promoDiscount.value = parseInt(percentMatch[1]);
      }
      
      promoMessage.value = message;
      promoMessageType.value = 'success';
      
      // Обновляем цену с учетом промокода
      await updatePriceWithPromo();
    } else {
      // Ошибка применения промокода
      promoApplied.value = false;
      promoMessage.value = response.data.message || 'Неверный промокод';
      promoMessageType.value = 'error';
      promoDiscount.value = 0;
      
      // Обновляем цену без промокода
      await updatePriceWithPromo();
    }
  } catch (error) {
    console.error('Ошибка применения промокода:', error);
    promoApplied.value = false;
    promoMessage.value = 'Ошибка при проверке промокода';
    promoMessageType.value = 'error';
    promoDiscount.value = 0;
    
    // Обновляем цену без промокода
    await updatePriceWithPromo();
  } finally {
    promoLoading.value = false;
    saveStateToLocalStorage();
  }
};

// Обработчик ввода промокода с debounce
const handlePromoInput = () => {
  // Очищаем предыдущий таймер
  if (promoDebounceTimer) {
    clearTimeout(promoDebounceTimer);
  }
  
  // Если промокод уже применен, не проверяем
  if (promoApplied.value) {
    return;
  }
  
  // Очищаем сообщение при вводе
  promoMessage.value = '';
  
  // Устанавливаем новый таймер
  promoDebounceTimer = setTimeout(() => {
    checkPromoCode(formData.promoCode);
  }, 500); // Задержка 500ms
};

// Отмена промокода
const removePromoCode = async () => {
  promoApplied.value = false;
  promoDiscount.value = 0;
  promoMessage.value = '';
  formData.promoCode = '';
  
  // Обновляем цену без промокода
  await updatePriceWithPromo();
  saveStateToLocalStorage();
  
  ElMessage.info('Промокод отменен');
};

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  if (isLoading.value) return;
  
  try {
    const stateToSave = {
      formData,
      promoApplied: promoApplied.value,
      promoDiscount: promoDiscount.value,
      promoMessage: promoMessage.value,
      promoMessageType: promoMessageType.value
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    console.log('Saved to localStorage:', stateToSave);
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
      
      // Восстанавливаем состояние промокода
      promoApplied.value = parsedState.promoApplied || false;
      promoDiscount.value = parsedState.promoDiscount || 0;
      promoMessage.value = parsedState.promoMessage || '';
      promoMessageType.value = parsedState.promoMessageType || 'success';
      
      // Проверяем, что использованные бонусы не превышают максимум
      if (formData.usedBonuses > maxBonuses.value) {
        formData.usedBonuses = maxBonuses.value;
      }
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Обработчик изменения бонусов
const handleBonusesChange = (value: number | undefined) => {
  // Проверяем, что значение не undefined
  if (value === undefined) {
    formData.usedBonuses = 0;
    return;
  }
  
  // Проверяем, что значение не превышает максимум
  if (value > maxBonuses.value) {
    formData.usedBonuses = maxBonuses.value;
    ElMessage.warning(`Максимально можно использовать ${maxBonuses.value} бонусов, чтобы сумма была не менее ${MINIMUM_AMOUNT} ${currencySymbol.value}`);
  } else if (value < 0) {
    formData.usedBonuses = 0;
  } else {
    formData.usedBonuses = value;
  }
  
  // Валидируем поле
  validateField('usedBonuses');
  saveStateToLocalStorage();
};

// Форматирование цены с разделителями тысяч
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
      
    case 'usedBonuses':
      if (formData.usedBonuses < 0) {
        errorMessage = 'Количество бонусов не может быть отрицательным';
      } else if (formData.usedBonuses > userBonuses.value) {
        errorMessage = `У вас доступно только ${userBonuses.value} бонусов`;
      } else if (formData.usedBonuses > originalTotalAmount.value - MINIMUM_AMOUNT) {
        errorMessage = `Нельзя использовать больше ${originalTotalAmount.value - MINIMUM_AMOUNT} бонусов, чтобы сумма была не менее ${MINIMUM_AMOUNT} ${currencySymbol.value}`;
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
    'usedBonuses',
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
    formData.usedBonuses >= 0 &&
    formData.usedBonuses <= userBonuses.value &&
    formData.usedBonuses <= originalTotalAmount.value - MINIMUM_AMOUNT &&
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
    // Сохраняем данные формы и переходим дальше
    console.log('Данные формы сохранены:', {
      ...formData,
      finalAmount: finalAmount.value,
      promoDiscount: promoDiscount.value,
      usedBonusesValue: formData.usedBonuses * 1 // Конвертируем в рубли
    });
    emit('go-next');
  } else {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля корректно');
  }
};

// Сохранение состояния при изменении данных формы
watch(() => formData, () => {
  if (!isLoading.value) {
    saveStateToLocalStorage();
  }
}, { deep: true });

// Следим за изменением platforms чтобы очистить otherPlatform если нужно
watch(() => formData.platforms, (newPlatforms) => {
  if (!newPlatforms.includes('other')) {
    formData.otherPlatform = '';
    errors.otherPlatform = '';
  }
  if (!isLoading.value) {
    saveStateToLocalStorage();
  }
});

// Следим за изменением бонусов
watch(() => formData.usedBonuses, (newValue, oldValue) => {
  if (!isLoading.value && newValue !== oldValue) {
    // Проверяем границы
    if (newValue > maxBonuses.value) {
      formData.usedBonuses = maxBonuses.value;
    } else if (newValue < 0) {
      formData.usedBonuses = 0;
    }
    validateField('usedBonuses');
  }
});

// Загрузка данных при монтировании компонента
onMounted(() => {
  loadBasketData();
});

// Очищаем таймер при размонтировании
onMounted(() => {
  return () => {
    if (promoDebounceTimer) {
      clearTimeout(promoDebounceTimer);
    }
  };
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
  min-height: auto;
  align-items: center;
  gap: 10px;
  color: var(--text-gray);
}
.form__group .form__checkbox_group .el-checkbox {
  padding: 10px 0 0;
}
.quiz__form_sum {
  display: flex;
  align-items: center;
  gap: 15px;
}
.quiz__form_total_wrapper {
  display: flex;
  flex-direction: column;
}
.quiz__form_price_container {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}
.quiz__form_total {
  color: var(--color);
  transform: translateY(-2.5px);
}
.quiz__form_original_price_strikethrough {
  color: var(--text-gray);
  font-size: 18px;
  text-decoration: line-through;
  opacity: 0.7;
}
.quiz__form_original_price {
  color: var(--text-gray);
  font-size: 12px;
  margin-top: 2px;
}
.quiz__form_discount_info {
  color: #67c23a;
  font-size: 12px;
  margin-top: 2px;
}
.quiz__form_error_price {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 2px;
}
.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
.success {
  color: #67c23a;
  font-size: 12px;
  margin-top: 5px;
}
.warning {
  color: #e6a23c;
  font-size: 12px;
  margin-top: 5px;
}
.form__group_inner {
  margin-top: 15px;
}
.form__bonus_input {
  display: flex;
  align-items: center;
  gap: 15px;
}
.form__promo_input {
  display: flex;
  align-items: center;
  gap: 15px;
}
.form__bonus_hint {
  color: var(--text-gray);
  font-size: 14px;
}
.promo_loading {
  color: var(--text-gray);
  font-size: 14px;
}
.promo_discount_info {
  color: #67c23a;
  font-size: 14px;
  margin-top: 5px;
}
.quiz__form_loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
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
  .form__bonus_input {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .form__promo_input {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .quiz__form_price_container {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>