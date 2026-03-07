<template>
  <div class="quiz__form quiz__form_six">
    <h4 class="quiz__form_head">дополнительная информация</h4>
    
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="quiz__form_loading">
      <div class="loading-spinner"></div>
      <p>Загрузка данных...</p>
    </div>
    
    <div v-else>
      <!-- Индикатор загрузки файлов и генерации договора -->
      <div v-if="uploadingFiles || isGeneratingContract" class="quiz__form_contract_loading">
        <div class="loading-spinner"></div>
        <p v-if="uploadingFiles">Отправка файлов на сервер... {{ uploadedCount }}/{{ totalFilesCount }}</p>
        <p v-else-if="isGeneratingContract">Генерация договора... Это может занять несколько секунд</p>
      </div>
      
      <div class="form__flex" :class="{ 'blur-content': uploadingFiles || isGeneratingContract }">
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
            :disabled="uploadingFiles || isGeneratingContract"
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
              :disabled="uploadingFiles || isGeneratingContract"
            />
            <div v-if="errors.otherPlatform" class="error text_very">
              {{ errors.otherPlatform }}
            </div>
          </div>
        </div>

        <!-- Права на инструменты -->
        <div class="form__group">
          <label for="rightsInfo" class="form__label button">Правила на инструменты</label>
          <p class="form__hint text_small">В поле ниже, пожалуйста, укажите в столбик «Название трека – тип прав».</p>
          <el-input
            v-model="formData.rightsInfo"
            type="textarea"
            :rows="6"
            placeholder="1. Название первого трека - исключительная лицензия
2. Название второго трека - wav лицензия"
            @input="errors.rightsInfo = ''"
            size="large"
            :disabled="uploadingFiles || isGeneratingContract"
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
              :disabled="uploadingFiles || isGeneratingContract"
            />
            <div v-if="errors.rightsContractLink" class="error text_very">
              {{ errors.rightsContractLink }}
            </div>
          </div>
        </div>

        <!-- Дополнительные комментарии -->
        <div class="form__group">
          <label for="additionalComments" class="form__label button">дополнительные комментарии</label>
          <el-input
            v-model="formData.additionalComments"
            type="textarea"
            :rows="4"
            placeholder="Ваши комментарии и пожелания..."
            @input="errors.additionalComments = ''"
            size="large"
            :disabled="uploadingFiles || isGeneratingContract"
          />
        </div>

        <!-- Промо-план релиза -->
        <div class="form__group">
          <label for="promoPlan" class="form__label button">Промо-план релиза для редакторов площадок</label>
          <el-input
            v-model="formData.promoPlan"
            type="textarea"
            :rows="4"
            placeholder="Информация об артисте, релизе, планах по рекламе..."
            @input="errors.promoPlan = ''"
            size="large"
            :disabled="uploadingFiles || isGeneratingContract"
          />
        </div>

        <!-- Ссылка на Bandlink -->
        <div class="form__group">
          <label for="bandlinkUrl" class="form__label button">ССЫЛКА НА ВАШ ПРЕДСТОЯЩИЙ РЕЛИЗ В BANDLINK</label>
          <el-input
            v-model="formData.bandlinkUrl"
            type="text"
            :class="{ 'error': errors.bandlinkUrl }"
            placeholder="https://band.link/..."
            @blur="validateUrlField('bandlinkUrl')"
            @input="errors.bandlinkUrl = ''"
            size="large"
            :disabled="uploadingFiles || isGeneratingContract"
          />
          <div v-if="errors.bandlinkUrl" class="error text_very">
            {{ errors.bandlinkUrl }}
          </div>
        </div>

        <!-- Промокод -->
        <div class="form__group">
          <label for="promoCode" class="form__label button">промокод</label>
          <div class="form__promo_input">
            <el-input
              v-model="formData.promoCode"
              type="text"
              placeholder="Введите промокод"
              :disabled="promoApplied || uploadingFiles || isGeneratingContract"
              @input="handlePromoInput"
              size="large"
              style="flex: 1;"
            />
            <el-button 
              v-if="promoApplied && !uploadingFiles && !isGeneratingContract"
              type="info" 
              @click="removePromoCode"
              size="default"
            >
              Отменить
            </el-button>
            <span v-if="promoLoading" class="promo_loading">Проверка...</span>
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
              :disabled="uploadingFiles || isGeneratingContract"
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
              :disabled="uploadingFiles || isGeneratingContract"
            >
              Я подтверждаю, что мои треки не нарушают права других авторов музыки и текста*
            </el-checkbox>
          </div>
          <div v-if="errors.confirmNoRightsViolation" class="error text_very">
            {{ errors.confirmNoRightsViolation }}
          </div>
        </div>
      </div>
      
      <!-- Прогресс загрузки файлов -->
      <div v-if="uploadingFiles" class="upload_progress">
        <div class="upload_progress_bar">
          <div class="upload_progress_bar_fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="upload_progress_count">Отправлено {{ uploadedCount }} из {{ totalFilesCount }}</p>
      </div>
      
      <!-- Результат генерации договора -->
      <div v-if="contractData" class="quiz__form_contract_result">
        <h5 class="quiz__form_contract_title">Договор сгенерирован!</h5>
        <div class="quiz__form_contract_links">
          <p><strong>PDF:</strong> <a :href="contractData.doc_pdf" target="_blank">{{ contractData.doc_pdf }}</a></p>
          <p><strong>DOCX:</strong> <a :href="contractData.doc_docx" target="_blank">{{ contractData.doc_docx }}</a></p>
        </div>
      </div>
      
      <div class="quiz__form_bottom">
        <div class="quiz__form_buttons">
          <button 
            class="form__back button__second button" 
            @click="goBack"
            :disabled="isLoading || uploadingFiles || isGeneratingContract"
          >
            <span><BackSVG /></span>
            <span>Назад</span>
          </button>
          <button 
            class="quiz__form_button button__black button"
            @click="handleContinue"
            :disabled="!isReadyForNextStep || isLoading || uploadingFiles || isGeneratingContract || finalAmount < 1"
          >
            <span v-if="uploadingFiles">Отправка файлов...</span>
            <span v-else-if="isGeneratingContract">Генерация договора...</span>
            <span v-else-if="contractData">Далее: Просмотр договора</span>
            <span v-else>{{ isLoading ? 'Загрузка...' : 'Сгенерировать договор' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElSelect, ElOption, ElInput, ElCheckbox, ElInputNumber, ElMessage, ElButton } from 'element-plus';
import { sendRequest } from '@/utils/api';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [contractData: ContractData];
}>();

// Интерфейсы
interface ContractData {
  doc_pdf: string;
  doc_docx: string;
  images: string[];
}

interface UploadedFileInfo {
  file_name: string;
  product_id: string;
  type: 'single' | 'album';
  track_number?: number;
  album_number?: number;
}

// Ключи для хранения
const STORAGE_KEY = 'quiz6_state';
const DB_NAME = 'quizDB';
const AUDIO_DB_NAME = 'audioDB';
const DB_VERSION = 2; // Увеличиваем версию до 2

const quizDB = ref<any>(null);
const audioDB = ref<any>(null);
const dataLoaded = ref(false);
const dbInitialized = ref(false);
const audioDBInitialized = ref(false);

// Состояние загрузки
const isLoading = ref(true);
const promoLoading = ref(false);
const promoApplied = ref(false);
const promoDiscount = ref(0);

// Состояние отправки файлов
const uploadingFiles = ref(false);
const uploadProgress = ref(0);
const uploadedCount = ref(0);
const totalFilesCount = ref(0);

// Состояние генерации договора
const isGeneratingContract = ref(false);
const contractData = ref<ContractData | null>(null);

// Таймер для debounce
let promoDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

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

// Инициализация IndexedDB
const initDB = async () => {
  try {
    console.log('Quiz6: Initializing databases...');
    
    quizDB.value = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz6: Upgrading DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains('quizState')) {
          const store = db.createObjectStore('quizState', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz6: Created quizState store');
        }
      },
    });
    
    audioDB.value = await openDB(AUDIO_DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz6: Upgrading Audio DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains('audio')) {
          const store = db.createObjectStore('audio', { keyPath: 'id' });
          store.createIndex('fileName', 'fileName');
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz6: Created audio store');
        }
      },
    });
    
    dbInitialized.value = true;
    audioDBInitialized.value = true;
    console.log('Quiz6: Databases initialized successfully');
    
  } catch (error) {
    console.error('Quiz6: Error initializing databases:', error);
    dbInitialized.value = false;
    audioDBInitialized.value = false;
  }
};

// Безопасное выполнение операций с БД
const safeDBOperation = async <T>(
  operation: () => Promise<T>, 
  fallback: T,
  dbType: 'quiz' | 'audio' = 'quiz'
): Promise<T> => {
  const db = dbType === 'quiz' ? quizDB.value : audioDB.value;
  const initialized = dbType === 'quiz' ? dbInitialized.value : audioDBInitialized.value;
  const storeName = dbType === 'quiz' ? 'quizState' : 'audio';
  
  if (!initialized || !db) {
    console.log(`Quiz6: ${dbType} DB not initialized`);
    return fallback;
  }
  
  try {
    if (!db.objectStoreNames || !db.objectStoreNames.contains(storeName)) {
      console.log(`Quiz6: Store ${storeName} not found in ${dbType} DB. Available stores:`, 
                  db.objectStoreNames ? Array.from(db.objectStoreNames) : []);
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    console.error(`Quiz6: Error in ${dbType} DB operation:`, error);
    return fallback;
  }
};

// Функция для создания безопасной копии состояния
const createSafeStateCopy = () => {
  return {
    id: STORAGE_KEY,
    formData: {
      platforms: [...formData.platforms],
      otherPlatform: formData.otherPlatform,
      rightsInfo: formData.rightsInfo,
      rightsContractLink: formData.rightsContractLink,
      additionalComments: formData.additionalComments,
      promoPlan: formData.promoPlan,
      bandlinkUrl: formData.bandlinkUrl,
      promoCode: formData.promoCode,
      usePartnerBonuses: formData.usePartnerBonuses,
      usedBonuses: formData.usedBonuses,
      confirmNoRightsViolation: formData.confirmNoRightsViolation
    },
    promoApplied: promoApplied.value,
    promoDiscount: promoDiscount.value,
    contractData: contractData.value,
    timestamp: Date.now()
  };
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  if (isLoading.value || !dataLoaded.value || !dbInitialized.value) return;
  
  await safeDBOperation(
    async () => {
      const stateToSave = createSafeStateCopy();
      await quizDB.value.put('quizState', stateToSave);
      console.log('Quiz6: State saved to IndexedDB');
      
      // Отправляем событие об обновлении данных для QuizMenu
      window.dispatchEvent(new CustomEvent('quiz-data-updated'));
    },
    null
  );
};

// Загрузка состояния из IndexedDB
const loadStateFromDB = async () => {
  if (!dbInitialized.value) {
    console.log('Quiz6: DB not initialized, skipping load');
    return;
  }
  
  await safeDBOperation(
    async () => {
      const savedState = await quizDB.value.get('quizState', STORAGE_KEY);
      if (savedState) {
        console.log('Quiz6: Loading from IndexedDB:', savedState);
        
        // Восстанавливаем данные формы
        if (savedState.formData) {
          formData.platforms = savedState.formData.platforms || [];
          formData.otherPlatform = savedState.formData.otherPlatform || '';
          formData.rightsInfo = savedState.formData.rightsInfo || '';
          formData.rightsContractLink = savedState.formData.rightsContractLink || '';
          formData.additionalComments = savedState.formData.additionalComments || '';
          formData.promoPlan = savedState.formData.promoPlan || '';
          formData.bandlinkUrl = savedState.formData.bandlinkUrl || '';
          formData.promoCode = savedState.formData.promoCode || '';
          formData.usePartnerBonuses = savedState.formData.usePartnerBonuses || false;
          formData.usedBonuses = savedState.formData.usedBonuses || 0;
          formData.confirmNoRightsViolation = savedState.formData.confirmNoRightsViolation || false;
        }
        
        // Восстанавливаем состояние промокода
        promoApplied.value = savedState.promoApplied || false;
        promoDiscount.value = savedState.promoDiscount || 0;
        
        // Восстанавливаем данные договора
        if (savedState.contractData) {
          contractData.value = savedState.contractData;
        }
      }
    },
    null
  );
};

// Максимальное количество бонусов, которое можно использовать
const maxBonuses = computed(() => {
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
    console.log('Quiz6: Loading basket data...');
    
    // Загружаем данные корзины для получения итоговой суммы
    const response = await sendRequest("post", '/ajax_vue/ajax/basket/updateBasket.php', {});
    
    const data = response.data as any;
    
    if (data.data) {
      originalTotalAmount.value = data.data.total || 0;
      currencySymbol.value = data.data.currency_symbol || '₽';
      console.log('Quiz6: Original total amount:', originalTotalAmount.value);
    }
    
    // Загружаем данные пользователя для получения бонусов
    const userResponse = await sendRequest("post", '/ajax_vue/ajax/getDataForm.php', {});
    
    const userData = userResponse.data as any;
    
    if (userData.user?.uf_bonus) {
      userBonuses.value = parseInt(userData.user.uf_bonus) || 0;
      console.log('Quiz6: User bonuses:', userBonuses.value);
    }
    
  } catch (error) {
    console.error('Quiz6: Ошибка загрузки данных:', error);
  }
};

// Загрузка данных при монтировании
const loadInitialData = async () => {
  isLoading.value = true;
  
  try {
    // Сначала инициализируем БД
    await initDB();
    
    // Загружаем данные из API
    await loadBasketData();
    
    // Затем загружаем сохраненное состояние из IndexedDB (после загрузки API)
    await loadStateFromDB();
    
    // Проверяем, что использованные бонусы не превышают максимум
    if (formData.usedBonuses > maxBonuses.value) {
      formData.usedBonuses = maxBonuses.value;
    }
    
    dataLoaded.value = true;
    console.log('Quiz6: Initialization complete');
    
  } catch (error) {
    console.error('Quiz6: Error in loadInitialData:', error);
    ElMessage.error('Ошибка при загрузке данных');
  } finally {
    isLoading.value = false;
  }
};

// Обновление цены после применения промокода
const updatePriceWithPromo = async () => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/quiz/promoPrice.php', {});
    
    const data = response.data as any;
    
    if (data.data?.total) {
      originalTotalAmount.value = data.data.total;
      console.log('Quiz6: Price updated with promo:', originalTotalAmount.value);
    }
  } catch (error) {
    console.error('Quiz6: Ошибка обновления цены после промокода:', error);
  }
};

// Проверка промокода
const checkPromoCode = async (code: string) => {
  if (!code.trim()) {
    promoApplied.value = false;
    promoDiscount.value = 0;
    await updatePriceWithPromo();
    await saveStateToDB();
    return;
  }
  
  promoLoading.value = true;
  
  try {
    const basketResponse = await sendRequest("post", '/ajax_vue/ajax/basket/updateBasket.php', {});
    const basketData = basketResponse.data as any;
    
    const counts = basketData.data?.counts || { single: 0, album: 0 };
    
    const response = await sendRequest("post", '/ajax_vue/ajax/quiz/promo.php', {
      PROMO: code,
      COUNT_SINGLE: counts.single || 0,
      COUNT_ALBUM: counts.album || 0
    });
    
    if (response.data.error === 0) {
      promoApplied.value = true;
      
      const message = response.data.message || '';
      const percentMatch = message.match(/(\d+)%/);
      if (percentMatch) {
        promoDiscount.value = parseInt(percentMatch[1]);
      }
      
      ElMessage.success(message);
      await updatePriceWithPromo();
    } else {
      promoApplied.value = false;
      promoDiscount.value = 0;
      ElMessage.error(response.data.message || 'Неверный промокод');
      await updatePriceWithPromo();
    }
  } catch (error) {
    console.error('Quiz6: Ошибка применения промокода:', error);
    promoApplied.value = false;
    promoDiscount.value = 0;
    ElMessage.error('Ошибка при проверке промокода');
    await updatePriceWithPromo();
  } finally {
    promoLoading.value = false;
    await saveStateToDB();
  }
};

// Обработчик ввода промокода с debounce
const handlePromoInput = () => {
  if (promoDebounceTimer) {
    clearTimeout(promoDebounceTimer);
  }
  
  if (promoApplied.value) {
    return;
  }
  
  promoDebounceTimer = setTimeout(() => {
    checkPromoCode(formData.promoCode);
  }, 500);
};

// Отмена промокода
const removePromoCode = async () => {
  promoApplied.value = false;
  promoDiscount.value = 0;
  formData.promoCode = '';
  
  await updatePriceWithPromo();
  await saveStateToDB();
  
  ElMessage.info('Промокод отменен');
};

// Обработчик изменения бонусов
const handleBonusesChange = (value: number | undefined) => {
  if (value === undefined) {
    formData.usedBonuses = 0;
    return;
  }
  
  if (value > maxBonuses.value) {
    formData.usedBonuses = maxBonuses.value;
    ElMessage.warning(`Максимально можно использовать ${maxBonuses.value} бонусов, чтобы сумма была не менее ${MINIMUM_AMOUNT} ${currencySymbol.value}`);
  } else if (value < 0) {
    formData.usedBonuses = 0;
  } else {
    formData.usedBonuses = value;
  }
  
  validateField('usedBonuses');
  debouncedSave();
};

// Форматирование цены с разделителями тысяч
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Валидация URL
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Валидация конкретного поля
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
      if (formData.rightsContractLink.trim() && !isValidUrl(formData.rightsContractLink)) {
        errorMessage = 'Введите корректную ссылку (начинается с https://)';
      }
      break;
      
    case 'bandlinkUrl':
      if (formData.bandlinkUrl.trim() && !isValidUrl(formData.bandlinkUrl)) {
        errorMessage = 'Введите корректную ссылку (начинается с https://)';
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
  }
  
  errors[fieldName] = errorMessage;
  debouncedSave();
  
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
  
  debouncedSave();
  
  return isValid;
};

// Валидация всей формы
const validateForm = (): boolean => {
  let isValid = true;
  
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
  
  if (formData.platforms.includes('other')) {
    const otherPlatformValid = validateField('otherPlatform');
    if (!otherPlatformValid) {
      isValid = false;
    }
  }
  
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
  
  debouncedSave();
  
  return isValid;
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  const requiredFieldsValid = 
    formData.platforms.length > 0 &&
    formData.usedBonuses >= 0 &&
    formData.usedBonuses <= userBonuses.value &&
    formData.usedBonuses <= originalTotalAmount.value - MINIMUM_AMOUNT &&
    formData.confirmNoRightsViolation;
  
  let otherPlatformValid = true;
  if (formData.platforms.includes('other')) {
    otherPlatformValid = formData.otherPlatform.trim().length >= 2;
  }
  
  let rightsContractUrlValid = true;
  if (formData.rightsContractLink.trim()) {
    rightsContractUrlValid = isValidUrl(formData.rightsContractLink);
  }
  
  let bandlinkUrlValid = true;
  if (formData.bandlinkUrl.trim()) {
    bandlinkUrlValid = isValidUrl(formData.bandlinkUrl) && formData.bandlinkUrl.includes('band.link');
  }
  
  return requiredFieldsValid && 
         otherPlatformValid && 
         rightsContractUrlValid && 
         bandlinkUrlValid;
});

// Получение всех аудиофайлов из IndexedDB
const getAllAudioFiles = async (): Promise<Array<{ file: File; type: 'single' | 'album'; trackIndex?: number; albumIndex?: number }>> => {
  const files: Array<{ file: File; type: 'single' | 'album'; trackIndex?: number; albumIndex?: number }> = [];
  
  if (!audioDBInitialized.value) {
    console.log('Quiz6: Audio DB not initialized');
    return files;
  }
  
  await safeDBOperation(
    async () => {
      // Получаем состояние Quiz2
      const quiz2State = await quizDB.value.get('quizState', 'quiz2_state');
      
      if (!quiz2State) {
        console.log('Quiz6: No Quiz2 state found');
        return;
      }
      
      console.log('Quiz6: Quiz2 state:', quiz2State);
      
      // Собираем синглы
      if (quiz2State.singleTracks && Array.isArray(quiz2State.singleTracks)) {
        for (let i = 0; i < quiz2State.singleTracks.length; i++) {
          const track = quiz2State.singleTracks[i];
          
          if (track.audioFileId) {
            const audioData = await audioDB.value.get('audio', track.audioFileId);
            if (audioData) {
              console.log(`Quiz6: Loaded single file ${i}: ${audioData.fileName}`);
              
              // Создаем File из Blob
              const blob = audioData.data;
              const file = new File([blob], audioData.fileName, { 
                type: audioData.fileType || 'audio/mpeg' 
              });
              
              files.push({ file, type: 'single', trackIndex: i });
            }
          }
        }
      }
      
      // Собираем альбомы
      if (quiz2State.albums && Array.isArray(quiz2State.albums)) {
        for (let a = 0; a < quiz2State.albums.length; a++) {
          const album = quiz2State.albums[a];
          
          if (album.tracks && Array.isArray(album.tracks)) {
            for (let t = 0; t < album.tracks.length; t++) {
              const track = album.tracks[t];
              
              if (track.audioFileId) {
                const audioData = await audioDB.value.get('audio', track.audioFileId);
                if (audioData) {
                  console.log(`Quiz6: Loaded album ${a} track ${t} file: ${audioData.fileName}`);
                  
                  const blob = audioData.data;
                  const file = new File([blob], audioData.fileName, { 
                    type: audioData.fileType || 'audio/mpeg' 
                  });
                  
                  files.push({ file, type: 'album', albumIndex: a, trackIndex: t });
                }
              }
            }
          }
        }
      }
    },
    null,
    'audio'
  );
  
  console.log(`Quiz6: Total files loaded: ${files.length}`);
  return files;
};

// Очистка старых номеров перед отправкой
const clearOldNumbers = async (): Promise<void> => {
  await safeDBOperation(
    async () => {
      console.log('Quiz6: Clearing old product numbers...');
      
      // Получаем состояние Quiz2
      const quiz2State = await quizDB.value.get('quizState', 'quiz2_state');
      
      if (!quiz2State) {
        console.log('Quiz6: No Quiz2 state to clear');
        return;
      }
      
      // Очищаем номера у синглов
      if (quiz2State.singleTracks && Array.isArray(quiz2State.singleTracks)) {
        quiz2State.singleTracks.forEach((track: any) => {
          if (track.product_id) {
            console.log(`Quiz6: Clearing product_id ${track.product_id} from single track`);
            delete track.product_id;
          }
        });
      }
      
      // Очищаем номера у альбомов
      if (quiz2State.albums && Array.isArray(quiz2State.albums)) {
        quiz2State.albums.forEach((album: any) => {
          if (album.tracks && Array.isArray(album.tracks)) {
            album.tracks.forEach((track: any) => {
              if (track.product_id) {
                console.log(`Quiz6: Clearing product_id ${track.product_id} from album track`);
                delete track.product_id;
              }
            });
          }
        });
      }
      
      // Сохраняем очищенное состояние
      await quizDB.value.put('quizState', quiz2State);
      console.log('Quiz6: Old product numbers cleared');
    },
    null
  );
};

// Сохранение полученных номеров
const saveProductNumbers = async (uploadedFiles: UploadedFileInfo[]): Promise<void> => {
  await safeDBOperation(
    async () => {
      console.log('Quiz6: Saving product numbers:', uploadedFiles);
      
      // Получаем состояние Quiz2
      const quiz2State = await quizDB.value.get('quizState', 'quiz2_state');
      
      if (!quiz2State) {
        console.log('Quiz6: No Quiz2 state to save numbers');
        return;
      }
      
      let updated = false;
      
      // Для каждого загруженного файла
      uploadedFiles.forEach((file: UploadedFileInfo) => {
        const fileName = file.file_name;
        const productId = file.product_id;
        
        console.log(`Quiz6: Saving product_id ${productId} for file: ${fileName}`);
        
        // Сначала ищем в синглах
        if (quiz2State.singleTracks && Array.isArray(quiz2State.singleTracks)) {
          const singleTrack = quiz2State.singleTracks.find((track: any) => 
            track.audioFileName === fileName
          );
          
          if (singleTrack) {
            console.log(`Quiz6: Found matching single track, saving product_id ${productId}`);
            singleTrack.product_id = productId;
            updated = true;
            return;
          }
        }
        
        // Если не нашли в синглах, ищем в альбомах
        if (quiz2State.albums && Array.isArray(quiz2State.albums)) {
          quiz2State.albums.forEach((album: any) => {
            if (album.tracks && Array.isArray(album.tracks)) {
              const albumTrack = album.tracks.find((track: any) => 
                track.audioFileName === fileName
              );
              
              if (albumTrack) {
                console.log(`Quiz6: Found matching album track, saving product_id ${productId}`);
                albumTrack.product_id = productId;
                updated = true;
              }
            }
          });
        }
      });
      
      if (updated) {
        // Сохраняем обновленное состояние
        await quizDB.value.put('quizState', quiz2State);
        console.log('Quiz6: Product numbers saved successfully');
      } else {
        console.log('Quiz6: No tracks were updated');
      }
    },
    null
  );
};

// Отправка одного файла на сервер
const uploadFile = async (file: File, type: 'single' | 'album', trackIndex?: number, albumIndex?: number): Promise<any> => {
  // Создаем FormData и добавляем файл
  const formData = new FormData();
  
  // Добавляем файл как есть - он будет отправлен как multipart/form-data
  formData.append('file', file);
  
  // Добавляем метаданные в зависимости от типа
  if (type === 'single') {
    formData.append('type', 'single');
    formData.append('track_number', String(trackIndex !== undefined ? trackIndex + 1 : 1));
  } else {
    formData.append('type', 'album');
    formData.append('album_number', String(albumIndex !== undefined ? albumIndex + 1 : 1));
    formData.append('track_number', String(trackIndex !== undefined ? trackIndex + 1 : 1));
  }
  
  // Определяем URL в зависимости от типа
  const url = type === 'single' 
    ? '/ajax_vue/ajax/quiz/loadSingle.php'
    : '/ajax_vue/ajax/quiz/loadAlbum.php';
  
  try {
    console.log(`Quiz6: Uploading ${type} file:`, file.name, 'size:', file.size, 'type:', file.type);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quiz6: Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log(`Quiz6: ${type} file response:`, data);
    
    return data;
  } catch (error) {
    console.error(`Quiz6: Error uploading ${type} file:`, error);
    throw error;
  }
};

// Отправка всех файлов на сервер
const uploadAllFiles = async (): Promise<UploadedFileInfo[]> => {
  const files = await getAllAudioFiles();
  
  if (files.length === 0) {
    console.log('Quiz6: No files to upload');
    return [];
  }
  
  totalFilesCount.value = files.length;
  uploadedCount.value = 0;
  uploadingFiles.value = true;
  uploadProgress.value = 0;
  
  console.log(`Quiz6: Starting upload of ${files.length} files...`);
  
  // Сначала очищаем старые номера
  await clearOldNumbers();
  
  const uploadedFilesData: UploadedFileInfo[] = [];
  
  try {
    for (let i = 0; i < files.length; i++) {
      const { file, type, trackIndex, albumIndex } = files[i];
      
      const response = await uploadFile(file, type, trackIndex, albumIndex);
      
      // Проверяем структуру ответа
      if (response && response.error === 0) {
        console.log(`Quiz6: File ${i + 1}/${files.length} uploaded successfully`);
        
        // В ответе может быть data.uploaded (массив) или сразу uploaded
        const uploaded = response.data?.uploaded || response.uploaded;
        
        if (uploaded && Array.isArray(uploaded)) {
          console.log(`Quiz6: Received ${uploaded.length} file entries in response`);
          uploadedFilesData.push(...uploaded);
        } else {
          console.log('Quiz6: No uploaded array in response:', response);
        }
      } else {
        console.log(`Quiz6: File ${i + 1}/${files.length} upload returned error:`, response);
      }
      
      uploadedCount.value = i + 1;
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100);
    }
    
    // Сохраняем все полученные product_id
    if (uploadedFilesData.length > 0) {
      console.log('Quiz6: Saving product numbers:', uploadedFilesData);
      await saveProductNumbers(uploadedFilesData);
    } else {
      console.log('Quiz6: No product numbers to save');
    }
    
    console.log('Quiz6: All files uploaded successfully');
    return uploadedFilesData;
  } catch (error) {
    console.error('Quiz6: Error during file upload:', error);
    ElMessage.error('Ошибка при отправке файлов на сервер');
    throw error;
  } finally {
    uploadingFiles.value = false;
  }
};

// Функция для форматирования даты в формат DD/MM/YYYY
const formatDateForAPI = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Функция для форматирования гражданства
const formatCitizenship = (citizenship?: string, other?: string): string => {
  if (!citizenship) return '';
  if (citizenship === 'RU') return 'Российская Федерация';
  if (citizenship === 'other') return other || '';
  return citizenship;
};

// Получение всех данных из всех шагов для отправки на генерацию договора
const getAllFormDataForContract = async (): Promise<any> => {
  if (!dbInitialized.value) {
    console.log('Quiz6: DB not initialized');
    throw new Error('База данных не инициализирована');
  }
  
  return safeDBOperation(
    async () => {
      console.log('Quiz6: Loading all quiz states for contract generation');
      
      // Загружаем данные всех шагов
      const quiz1State = await quizDB.value.get('quizState', 'quiz1_state');
      const quiz2State = await quizDB.value.get('quizState', 'quiz2_state');
      const quiz3State = await quizDB.value.get('quizState', 'quiz3_state');
      const quiz4State = await quizDB.value.get('quizState', 'quiz4_state');
      const quiz5State = await quizDB.value.get('quizState', 'quiz5_state');
      
      // Собираем все данные в одну структуру для отправки
      const allData: any = {};
      
      // Шаг 1 - количества и чекбоксы
      if (quiz1State) {
        allData['check-single'] = quiz1State.singleCount > 0 ? 'on' : 'off';
        allData['check-album'] = quiz1State.albumCount > 0 ? 'on' : 'off';
        allData['check-klip'] = quiz1State.clipCount > 0 ? 'on' : 'off';
        allData['check-karta'] = quiz1State.cardCount > 0 ? 'on' : 'off';
        allData.countSingle = String(quiz1State.singleCount || 0);
        allData.countAlbum = String(quiz1State.albumCount || 0);
      }
      
      // Шаг 2 - Синглы
      if (quiz2State?.singleTracks) {
        quiz2State.singleTracks.forEach((track: any) => {
          if (track.product_id) {
            // Добавляем trackID
            if (!allData['trackID[]']) allData['trackID[]'] = [];
            allData['trackID[]'].push(track.product_id);
            
            // Добавляем путь к файлу
            allData[`path-file[${track.product_id}]`] = track.audioFileName || '';
            
            // Добавляем название файла
            allData[`name-file[${track.product_id}]`] = track.audioFileName || '';
            
            // Добавляем артиста
            allData[`artist[${track.product_id}]`] = track.performerName || '';
            
            // Добавляем автора музыки
            allData[`autor-music[${track.product_id}]`] = track.musicAuthor || '';
            
            // Добавляем автора слов
            allData[`autor-words[${track.product_id}]`] = track.textAuthor || '';
            
            // Добавляем автора файла
            allData[`autor-files[${track.product_id}]`] = track.performerName || '';
          }
        });
      }
      
      // Шаг 2 - Альбомы
      if (quiz2State?.albums) {
        quiz2State.albums.forEach((album: any) => {
          if (album.tracks) {
            album.tracks.forEach((track: any) => {
              if (track.product_id) {
                // Добавляем albumID
                if (!allData['albumID[]']) allData['albumID[]'] = [];
                allData['albumID[]'].push(track.product_id);
                
                // Добавляем путь к файлу альбома
                allData[`path-file-album[${track.product_id}]`] = track.audioFileName || '';
                
                // Добавляем название файла альбома
                allData[`name-file-album[${track.product_id}]`] = track.audioFileName || '';
                
                // Добавляем артиста альбома
                allData[`artist-album[${track.product_id}]`] = track.performerName || '';
                
                // Добавляем автора музыки альбома
                allData[`autor-music-album[${track.product_id}]`] = track.musicAuthor || '';
                
                // Добавляем автора слов альбома
                allData[`autor-words-album[${track.product_id}]`] = track.textAuthor || '';
                
                // Добавляем автора файла альбома
                allData[`autor-files-album[${track.product_id}]`] = track.performerName || '';
              }
            });
          }
        });
      }
      
      // Шаг 3 - Информация о релизе
      if (quiz3State?.formData) {
        const f = quiz3State.formData;
        allData.alias = f.performerName || '';
        allData['name-relize'] = f.releaseName || '';
        allData.kuda_reliz1 = '1';
        allData['kuda-reliz'] = '1';
        allData['others-kuda'] = f.otherPlatform || '';
        allData['calendar-reliz'] = f.releaseDate || '';
        allData.mat1 = f.hasProfanity === 'yes' ? '12' : '13';
        allData.mat = f.hasProfanity === 'yes' ? '12' : '13';
        allData['others-mat'] = f.profanityTracks || '';
        allData.mat1ai = '13';
        allData.matai = '13';
        allData['others-matai'] = '';
        allData['all-obl'] = '1';
        allData.vk = f.vkLink || '';
        allData['email-clear'] = f.email || '';
        
        // Альбомные версии
        allData['alias-album'] = f.performerName || '';
        allData['name-relize-album'] = '';
        allData['kuda-reliz-album1'] = '';
        allData['kuda-reliz-album'] = '1';
        allData['others-kuda-album'] = '';
        allData['calendar-reliz-album'] = '';
        allData['mat-album1'] = '13';
        allData['mat-album'] = '13';
        allData['others-mat-album'] = '';
        allData['mat-album1ai'] = '13';
        allData['mat-albumai'] = '13';
        allData['others-matai-album'] = '';
        allData['vk-album'] = f.vkLink || '';
        allData['email-clear-album'] = f.email || '';
      }
      
      // Шаг 4 - Данные пользователя
      if (quiz4State?.formData) {
        const u = quiz4State.formData;
        allData.citysenship1 = '';
        allData.citysenship = u.userType === 'individual' ? 'Физическое лицо' : 'Индивидуальный предприниматель';
        allData.select__fizurlico = '';
        allData.others = '';
        allData.yur_arg_org = u.legalAddress || '';
        allData.inn = u.inn || '';
        allData.ogrn = u.ogrn || '';
        allData.rasy = u.accountNumber || '';
        allData.bank = u.bankName || '';
        allData.inn_bank = u.bankInn || '';
        allData.bik = u.bankBik || '';
        allData.kor_s = u.correspondentAccount || '';
        allData.yur_adr_bank = u.bankLegalAddress || '';
        
        // Паспортные данные
        allData.citysenship1 = '';
        allData.citysenship = formatCitizenship(u.citizenship, u.otherCitizenship);
        allData.others = '';
        allData.FAM = u.lastName || '';
        allData.IMYA = u.firstName || '';
        allData.OTCH = u.middleName || '';
        allData.passport = u.passportNumber || '';
        allData['who-doing'] = u.passportIssuedBy || '';
        allData.kemvidan = '';
        allData['when-doing'] = formatDateForAPI(u.passportIssueDate) || '';
        allData.adress = u.registrationAddress || '';
      }
      
      // Шаг 5 - Жанр и текст
      if (quiz5State?.formData) {
        const g = quiz5State.formData;
        allData.genre = g.genre || '';
        allData['time-play'] = g.tiktokStartSeconds || '';
        allData.nark = g.hasDrugsMention === 'yes' ? '12' : '13';
        allData.narc = g.hasDrugsMention === 'yes' ? '12' : '13';
        allData['others-narc'] = g.drugsTracks || '';
        // file-apple и file-karaoke-apple1 - бинарные файлы (будут добавлены позже)
        allData.apple = g.appleMusicLinks || '';
        allData.spotify = g.spotifyLinks || '';
        allData['link-vk'] = g.vkLinks || '';
        allData['link-yandex'] = g.yandexMusicLinks || '';
        allData.socialartist = g.socialLinks || '';
      }
      
      // Шаг 6 (текущий)
      allData['otkuda-uznali1'] = formData.platforms[0] || '';
      allData['otkuda-uznali'] = formData.platforms[0] || '';
      allData['others-otkuda'] = formData.otherPlatform || '';
      allData.instrumentals = formData.rightsInfo || '';
      allData.comments = formData.additionalComments || '';
      allData.plan = formData.promoPlan || '';
      allData['link-bandlink'] = formData.bandlinkUrl || '';
      allData.promocode = formData.promoCode || '';
      allData.promosum = '';
      allData.sumOrder = String(finalAmount.value || 0);
      allData.policy = formData.confirmNoRightsViolation ? 'on' : 'off';
      
      console.log('Quiz6: Collected all form data:', allData);
      
      return allData;
    },
    null
  );
};

// Отправка запроса на генерацию договора
const generateContract = async (): Promise<ContractData> => {
  // Получаем все данные из всех шагов для отправки
  const allFormData = await getAllFormDataForContract();
  
  console.log('Quiz6: Sending ALL form data to generate contract:', allFormData);
  
  // Отправляем ВСЕ данные формы
  const response = await sendRequest("post", '/ajax_vue/ajax/newDock.php', allFormData);
  
  console.log('Quiz6: Contract generation response:', response.data);
  
  // Проверяем структуру ответа
  if (response.data && response.data.error === 0 && response.data.data) {
    const data = response.data.data;
    
    // Проверяем, что пришли все необходимые данные
    if (data.doc_pdf && data.doc_docx && Array.isArray(data.images)) {
      return {
        doc_pdf: data.doc_pdf,
        doc_docx: data.doc_docx,
        images: data.images
      };
    } else {
      throw new Error('Неполные данные в ответе сервера');
    }
  } else {
    throw new Error(response.data?.message || 'Ошибка генерации договора');
  }
};

const goBack = () => {
  emit('go-back');
};

const handleContinue = async () => {
  const formValid = validateForm();
  
  if (!formValid) {
    ElMessage.warning('Пожалуйста, заполните все обязательные поля корректно');
    return;
  }
  
  if (finalAmount.value < 1) {
    ElMessage.warning('Сумма к оплате не может быть меньше 1');
    return;
  }
  
  try {
    // Если договор уже сгенерирован, переходим к следующему шагу
    if (contractData.value) {
      console.log('Quiz6: Contract already generated, proceeding to next step');
      emit('go-next', contractData.value);
      return;
    }
    
    // Шаг 1: Отправляем файлы на сервер (получаем product_id)
    ElMessage.info('Начинаем отправку файлов на сервер...');
    const uploadedFiles = await uploadAllFiles();
    
    if (uploadedFiles.length === 0) {
      ElMessage.error('Не удалось загрузить файлы на сервер');
      return;
    }
    
    // Шаг 2: Генерируем договор, отправляя ВСЕ данные формы
    ElMessage.info('Генерируем договор...');
    isGeneratingContract.value = true;
    
    const contract = await generateContract();
    
    // Шаг 3: Сохраняем результат
    contractData.value = contract;
    await saveStateToDB();
    
    ElMessage.success('Договор успешно сгенерирован!');
    
  } catch (error: any) {
    console.error('Quiz6: Error in handleContinue:', error);
    ElMessage.error(error.message || 'Ошибка при обработке данных');
  } finally {
    isGeneratingContract.value = false;
  }
};

// Debounced save
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    if (dataLoaded.value && dbInitialized.value) {
      saveStateToDB();
    }
  }, 500);
};

// Watchers с debounce
watch(() => formData.platforms, () => { if (dataLoaded.value) debouncedSave(); }, { deep: true });
watch(() => formData.otherPlatform, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.rightsInfo, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.rightsContractLink, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.additionalComments, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.promoPlan, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.bandlinkUrl, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.promoCode, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.usePartnerBonuses, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.usedBonuses, () => { if (dataLoaded.value) debouncedSave(); });
watch(() => formData.confirmNoRightsViolation, () => { if (dataLoaded.value) debouncedSave(); });

// Следим за изменением platforms чтобы очистить otherPlatform если нужно
watch(() => formData.platforms, async (newPlatforms) => {
  if (!newPlatforms.includes('other')) {
    formData.otherPlatform = '';
    errors.otherPlatform = '';
  }
  if (dataLoaded.value) debouncedSave();
}, { deep: true });

// Следим за изменением бонусов
watch(() => formData.usedBonuses, (newValue, oldValue) => {
  if (dataLoaded.value && newValue !== oldValue) {
    if (newValue > maxBonuses.value) {
      formData.usedBonuses = maxBonuses.value;
    } else if (newValue < 0) {
      formData.usedBonuses = 0;
    }
    validateField('usedBonuses');
  }
});

// При монтировании компонента
onMounted(async () => {
  await loadInitialData();
});

// Сохраняем состояние при покидании страницы
const handleBeforeUnload = async () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  await saveStateToDB();
};

const handleVisibilityChange = async () => {
  if (document.visibilityState === 'hidden') {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    await saveStateToDB();
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  if (promoDebounceTimer) {
    clearTimeout(promoDebounceTimer);
  }
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
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
.upload_progress {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}
.upload_progress_bar {
  width: 100%;
  height: 20px;
  background-color: #e4e7ed;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.upload_progress_bar_fill {
  height: 100%;
  background-color: #409eff;
  transition: width 0.3s ease;
}
.upload_progress_count {
  color: #909399;
  font-size: 14px;
}

/* Стили для индикатора генерации договора */
.quiz__form_contract_loading {
  position: relative;
  margin: 20px 0 30px;
  padding: 30px;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  text-align: center;
  border: 1px solid #409eff;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 158, 255, 0.2);
  border-radius: 50%;
  border-top-color: #409eff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Затемнение контента при генерации */
.blur-content {
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* Стили для результата договора */
.quiz__form_contract_result {
  margin: 30px 0;
  padding: 25px;
  background-color: #f0f9eb;
  border: 1px solid #67c23a;
  border-radius: 8px;
}

.quiz__form_contract_title {
  color: #67c23a;
  margin-bottom: 15px;
  font-size: 18px;
}

.quiz__form_contract_links {
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
}

.quiz__form_contract_links a {
  color: #409eff;
  word-break: break-all;
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