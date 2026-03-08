<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Отправка данных</h4>
  
  <div v-if="isLoading" class="quiz__form_loading">
    <div class="loading-spinner"></div>
    <span>Загрузка данных...</span>
  </div>
  
  <div v-else-if="!dataLoaded" class="quiz__form_error">
    <p class="error">Не удалось загрузить данные. Пожалуйста, вернитесь на предыдущие шаги.</p>
  </div>
  
  <div v-else class="quiz__summary">
    <h5 class="quiz__summary_title">Сводка данных</h5>
    
    <!-- Статус проверки -->
    <div class="quiz__summary_status">
      <div class="status_item" :class="{ 'status_success': hasContract, 'status_error': !hasContract }">
        <span class="status_icon">{{ hasContract ? '✅' : '❌' }}</span>
        <span class="status_text">Договор: {{ hasContract ? 'загружен' : 'не найден' }}</span>
      </div>
      <div class="status_item" :class="{ 'status_success': hasSignature, 'status_error': !hasSignature }">
        <span class="status_icon">{{ hasSignature ? '✅' : '❌' }}</span>
        <span class="status_text">Подпись: {{ hasSignature ? 'получена' : 'не найдена' }}</span>
      </div>
    </div>
    
    <!-- Шаг 1: Количество треков -->
    <div class="quiz__summary_section" v-if="summaryData.singleCount || summaryData.albumCount">
      <h6>Шаг 1: Количество треков</h6>
      <div class="quiz__summary_content">
        <p v-if="summaryData.singleCount">Синглов: <strong>{{ summaryData.singleCount }}</strong></p>
        <p v-if="summaryData.albumCount">Альбомов: <strong>{{ summaryData.albumCount }}</strong></p>
        <p v-if="summaryData.clipCount">Клипов: <strong>{{ summaryData.clipCount }}</strong></p>
        <p v-if="summaryData.cardCount">Оформлений карточек: <strong>{{ summaryData.cardCount }}</strong></p>
      </div>
    </div>
    
    <!-- Шаг 2: Синглы -->
    <div class="quiz__summary_section" v-if="summaryData.singleTracks && summaryData.singleTracks.length > 0">
      <h6>Шаг 2: Синглы ({{ summaryData.singleTracks.length }})</h6>
      <div class="quiz__summary_content">
        <div v-for="(track, index) in summaryData.singleTracks" :key="index" class="summary_item">
          <p><strong>Сингл {{ index + 1 }}:</strong> {{ track.trackName || 'Без названия' }}</p>
          <p class="text_small">Исполнитель: {{ track.performerName || 'Не указан' }}</p>
          <p class="text_small">Музыка: {{ track.musicAuthor || 'Не указан' }}</p>
          <p class="text_small">Текст: {{ track.textAuthor || 'Не указан' }}</p>
          <p class="text_small" v-if="track.audioFileName">Аудио: {{ track.audioFileName }}</p>
          <p class="text_small" v-if="track.product_id">ID: {{ track.product_id }}</p>
        </div>
      </div>
    </div>
    
    <!-- Шаг 2: Альбомы -->
    <div class="quiz__summary_section" v-if="summaryData.albums && summaryData.albums.length > 0">
      <h6>Шаг 2: Альбомы ({{ summaryData.albums.length }})</h6>
      <div class="quiz__summary_content">
        <div v-for="(album, albumIndex) in summaryData.albums" :key="albumIndex" class="summary_item">
          <p><strong>Альбом {{ albumIndex + 1 }}:</strong> {{ album.albumName || 'Без названия' }}</p>
          <p class="text_small">Треков: {{ album.tracks?.length || 0 }}</p>
          <div v-if="album.tracks && album.tracks.length > 0" class="summary_subitem">
            <div v-for="(track, trackIndex) in album.tracks" :key="trackIndex">
              <p class="text_small"><strong>Трек {{ track.trackNumber }}:</strong> {{ track.trackName || 'Без названия' }}</p>
              <p class="text_small" v-if="track.audioFileName">Аудио: {{ track.audioFileName }}</p>
              <p class="text_small" v-if="track.product_id">ID: {{ track.product_id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Шаг 3: Информация о релизе -->
    <div class="quiz__summary_section" v-if="summaryData.releaseInfo">
      <h6>Шаг 3: Информация о релизе</h6>
      <div class="quiz__summary_content">
        <p><strong>Артист:</strong> {{ summaryData.releaseInfo.performerName || 'Не указано' }}</p>
        <p><strong>Название релиза:</strong> {{ summaryData.releaseInfo.releaseName || 'Не указано' }}</p>
        <p><strong>Email:</strong> {{ summaryData.releaseInfo.email || 'Не указано' }}</p>
        <p><strong>Ссылка VK:</strong> {{ summaryData.releaseInfo.vkLink || 'Не указано' }}</p>
        <p><strong>Дата релиза:</strong> {{ formatDate(summaryData.releaseInfo.releaseDate) }}</p>
        <p><strong>Мат:</strong> {{ summaryData.releaseInfo.hasProfanity === 'yes' ? 'Да' : 'Нет' }}</p>
        <p v-if="summaryData.coverFileName"><strong>Обложка:</strong> {{ summaryData.coverFileName }}</p>
      </div>
    </div>
    
    <!-- Шаг 4: Данные пользователя -->
    <div class="quiz__summary_section" v-if="summaryData.userInfo">
      <h6>Шаг 4: Данные пользователя</h6>
      <div class="quiz__summary_content">
        <p><strong>Тип лица:</strong> {{ summaryData.userInfo.userType === 'individual' ? 'Физическое лицо' : 'ИП' }}</p>
        <p><strong>Фамилия:</strong> {{ summaryData.userInfo.lastName || 'Не указано' }}</p>
        <p><strong>Имя:</strong> {{ summaryData.userInfo.firstName || 'Не указано' }}</p>
        <p><strong>Отчество:</strong> {{ summaryData.userInfo.middleName || 'Не указано' }}</p>
        <p><strong>Паспорт:</strong> {{ summaryData.userInfo.passportNumber || 'Не указано' }}</p>
      </div>
    </div>
    
    <!-- Шаг 5: Жанр и текст -->
    <div class="quiz__summary_section" v-if="summaryData.genreInfo">
      <h6>Шаг 5: Жанр и текст</h6>
      <div class="quiz__summary_content">
        <p><strong>Жанр:</strong> {{ summaryData.genreInfo.genre || 'Не указано' }}</p>
        <p><strong>Упоминание наркотиков:</strong> {{ summaryData.genreInfo.hasDrugsMention === 'yes' ? 'Да' : 'Нет' }}</p>
        <p><strong>Ссылки на соцсети:</strong> {{ summaryData.genreInfo.socialLinks || 'Не указано' }}</p>
      </div>
    </div>
    
    <!-- Шаг 6: Дополнительная информация -->
    <div class="quiz__summary_section" v-if="summaryData.additionalInfo">
      <h6>Шаг 6: Дополнительная информация</h6>
      <div class="quiz__summary_content">
        <p><strong>Откуда узнали:</strong> {{ formatPlatforms(summaryData.additionalInfo.platforms) }}</p>
        <p><strong>Подтверждение прав:</strong> 
          <span :class="summaryData.additionalInfo.confirmNoRightsViolation ? 'success' : 'warning'">
            {{ summaryData.additionalInfo.confirmNoRightsViolation ? 'Да' : 'Нет' }}
          </span>
        </p>
      </div>
    </div>
    
    <!-- Данные договора из Quiz6/Quiz7 (Ответ из newdock) -->
    <div class="quiz__summary_section" v-if="contractImages.length > 0">
      <h6>Договор (сгенерированные страницы)</h6>
      <div class="quiz__summary_content">
        <p><strong>PDF:</strong> {{ contractPdfUrl }}</p>
        <p><strong>DOCX:</strong> {{ contractDocxUrl }}</p>
        <p><strong>Количество страниц:</strong> {{ contractImages.length }}</p>
        <div v-for="(img, index) in contractImages" :key="index" class="summary_item">
            <p class="text_small">imgDoc{{ index }}: {{ img }}</p>
        </div>
      </div>
    </div>
    
    <!-- Подпись из Quiz7 (ШАГ 7) -->
    <div class="quiz__summary_section" v-if="summaryData.signature">
      <h6>Подпись (Шаг 7)</h6>
      <div class="quiz__summary_content">
        <p><strong>Подпись:</strong> получена</p>
        <p class="text_small">{{ summaryData.signature.substring(0, 100) }}...</p>
      </div>
    </div>
    
    <!-- Чекбоксы из Quiz7 -->
    <div class="quiz__summary_section" v-if="summaryData.agreement">
      <h6>Согласия</h6>
      <div class="quiz__summary_content">
        <p><strong>Условия оферты:</strong> {{ summaryData.agreement.acceptTerms ? 'Принято' : 'Не принято' }}</p>
        <p><strong>Обработка данных:</strong> {{ summaryData.agreement.acceptPrivacy ? 'Согласие дано' : 'Не дано' }}</p>
      </div>
    </div>
    
    <!-- Общая информация -->
    <div class="quiz__summary_section total">
      <h6>Всего треков к загрузке:</h6>
      <div class="quiz__summary_content">
        <p class="total_count"><strong>{{ summaryData.totalTracks || 0 }}</strong> треков</p>
      </div>
    </div>
  </div>
  
  <div v-if="isSubmitting" class="quiz__form_contract_loading">
    <div class="loading-spinner"></div>
    <p>Отправка данных на сервер... Пожалуйста, подождите</p>
  </div>
  
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
        :disabled="isSubmitting"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleFinish"
        :disabled="isSubmitting || !dataLoaded || !canSubmit"
      >
        <span v-if="!isSubmitting">Оформить заказ</span>
        <span v-else>Отправка...</span>
      </button>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { sendRequest } from '@/utils/api';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

// Интерфейсы
interface ContractData {
  doc_pdf: string;
  doc_docx: string;
  images: string[];
}

interface SingleTrack {
  trackName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  audioFileName?: string;
  product_id?: string;
}

interface AlbumTrack {
  trackNumber?: number;
  trackName?: string;
  audioFileName?: string;
  product_id?: string;
}

interface Album {
  albumName?: string;
  tracks?: AlbumTrack[];
}

interface Quiz1Data {
  singleCount: number;
  albumCount: number;
  clipCount: number;
  cardCount: number;
}

interface Quiz2Data {
  singleTracks?: SingleTrack[];
  albums?: Album[];
}

interface Quiz3Data {
  formData?: {
    performerName?: string;
    releaseName?: string;
    platforms?: string[];
    otherPlatform?: string;
    releaseDate?: string;
    hasProfanity?: string;
    profanityTracks?: string;
    vkLink?: string;
    email?: string;
  };
  coverFileInfo?: {
    name?: string;
    size?: number;
    fileId?: string | null;
  };
}

interface Quiz4Data {
  formData?: {
    userType?: string;
    legalAddress?: string;
    inn?: string;
    ogrn?: string;
    accountNumber?: string;
    bankName?: string;
    bankInn?: string;
    bankBik?: string;
    correspondentAccount?: string;
    bankLegalAddress?: string;
    citizenship?: string;
    otherCitizenship?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    passportNumber?: string;
    passportIssuedBy?: string;
    passportIssueDate?: string;
    registrationAddress?: string;
  };
}

interface Quiz5Data {
  formData?: {
    genre?: string;
    tiktokStartSeconds?: string;
    hasDrugsMention?: string;
    drugsTracks?: string;
    appleMusicLinks?: string;
    spotifyLinks?: string;
    vkLinks?: string;
    yandexMusicLinks?: string;
    socialLinks?: string;
  };
  appleMusicFileInfo?: {
    name?: string;
    size?: number;
    fileId?: string | null;
  };
  karaokeFileInfo?: {
    name?: string;
    size?: number;
    fileId?: string | null;
  };
}

interface Quiz6Data {
  formData?: {
    platforms?: string[];
    otherPlatform?: string;
    rightsInfo?: string;
    rightsContractLink?: string;
    additionalComments?: string;
    promoPlan?: string;
    bandlinkUrl?: string;
    promoCode?: string;
    usePartnerBonuses?: boolean;
    usedBonuses?: number;
    confirmNoRightsViolation?: boolean;
  };
  promoApplied?: boolean;
  promoDiscount?: number;
  contractData?: ContractData;
}

interface Quiz7Data {
  formData?: {
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    acceptMarketing?: boolean;
  };
  signature?: string;
  contractData?: ContractData;
}

interface AllData {
  singleCount?: number;
  albumCount?: number;
  clipCount?: number;
  cardCount?: number;
  singleTracks?: SingleTrack[];
  albums?: Album[];
  releaseInfo?: {
    performerName?: string;
    releaseName?: string;
    platforms?: string[];
    otherPlatform?: string;
    releaseDate?: string;
    hasProfanity?: string;
    profanityTracks?: string;
    vkLink?: string;
    email?: string;
  };
  coverFileName?: string;
  userInfo?: {
    userType?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    passportNumber?: string;
  };
  genreInfo?: {
    genre?: string;
    hasDrugsMention?: string;
    socialLinks?: string;
  };
  additionalInfo?: {
    platforms?: string[];
    otherPlatform?: string;
    confirmNoRightsViolation?: boolean;
  };
  contractData?: ContractData;
  agreement?: {
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    acceptMarketing?: boolean;
  };
  signature?: string;
  totalTracks?: number;
}

const STORAGE_KEYS = {
  QUIZ1: 'quiz1_state',
  QUIZ2: 'quiz2_state',
  QUIZ3: 'quiz3_state',
  QUIZ4: 'quiz4_state',
  QUIZ5: 'quiz5_state',
  QUIZ6: 'quiz6_state',
  QUIZ7: 'quiz7_state'
};

const DB_NAME = 'quizDB';
const DB_VERSION = 2;

const isLoading = ref(true);
const isSubmitting = ref(false);
const dataLoaded = ref(false);
const quizDB = ref<any>(null);

const quiz1Data = ref<Quiz1Data | null>(null);
const quiz2Data = ref<Quiz2Data | null>(null);
const quiz3Data = ref<Quiz3Data | null>(null);
const quiz4Data = ref<Quiz4Data | null>(null);
const quiz5Data = ref<Quiz5Data | null>(null);
const quiz6Data = ref<Quiz6Data | null>(null);
const quiz7Data = ref<Quiz7Data | null>(null);

// Вычисляемые свойства для проверки наличия данных
const hasContract = computed(() => {
  return !!(quiz6Data.value?.contractData || quiz7Data.value?.contractData);
});

const hasSignature = computed(() => {
  return !!quiz7Data.value?.signature;
});

const contractData = computed(() => {
  return quiz7Data.value?.contractData || quiz6Data.value?.contractData;
});

const contractPdfUrl = computed(() => {
  return contractData.value?.doc_pdf || '';
});

const contractDocxUrl = computed(() => {
  return contractData.value?.doc_docx || '';
});

const contractImages = computed(() => {
  return contractData.value?.images || [];
});

// Инициализация IndexedDB
const initDB = async () => {
  try {
    quizDB.value = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz8: Upgrading DB from version ${oldVersion} to ${newVersion}`);
        
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains('quizState')) {
            db.deleteObjectStore('quizState');
          }
          const store = db.createObjectStore('quizState', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz8: Created new quizState store');
        }
      },
    });
  } catch (error) {
    console.error('Quiz8: Error initializing DB:', error);
  }
};

const loadFromDB = async (key: string): Promise<any> => {
  try {
    return await quizDB.value.get('quizState', key);
  } catch (error) {
    console.error(`Error loading ${key} from DB:`, error);
    return null;
  }
};

const loadAllData = async () => {
  try {
    isLoading.value = true;
    
    quiz1Data.value = await loadFromDB(STORAGE_KEYS.QUIZ1);
    quiz2Data.value = await loadFromDB(STORAGE_KEYS.QUIZ2);
    quiz3Data.value = await loadFromDB(STORAGE_KEYS.QUIZ3);
    quiz4Data.value = await loadFromDB(STORAGE_KEYS.QUIZ4);
    quiz5Data.value = await loadFromDB(STORAGE_KEYS.QUIZ5);
    quiz6Data.value = await loadFromDB(STORAGE_KEYS.QUIZ6);
    quiz7Data.value = await loadFromDB(STORAGE_KEYS.QUIZ7);
    
    console.log('Quiz8: Loaded data:', {
      quiz6: quiz6Data.value ? '✅' : '❌',
      quiz7: quiz7Data.value ? '✅' : '❌',
      contract: quiz6Data.value?.contractData ? '✅' : '❌',
      signature: quiz7Data.value?.signature ? '✅' : '❌'
    });
    
    dataLoaded.value = true;
    
  } catch (error) {
    console.error('Error loading all data:', error);
    ElMessage.error('Ошибка загрузки данных');
  } finally {
    isLoading.value = false;
  }
};

const summaryData = computed((): AllData => {
  const data: AllData = {};
  
  if (quiz1Data.value) {
    data.singleCount = quiz1Data.value.singleCount || 0;
    data.albumCount = quiz1Data.value.albumCount || 0;
    data.clipCount = quiz1Data.value.clipCount || 0;
    data.cardCount = quiz1Data.value.cardCount || 0;
  }
  
  if (quiz2Data.value) {
    data.singleTracks = quiz2Data.value.singleTracks || [];
    data.albums = quiz2Data.value.albums || [];
  }
  
  if (quiz3Data.value) {
    data.releaseInfo = quiz3Data.value.formData || {};
    if (quiz3Data.value.coverFileInfo) {
      data.coverFileName = quiz3Data.value.coverFileInfo.name || '';
    }
  }
  
  if (quiz4Data.value) {
    data.userInfo = {
      userType: quiz4Data.value.formData?.userType,
      lastName: quiz4Data.value.formData?.lastName,
      firstName: quiz4Data.value.formData?.firstName,
      middleName: quiz4Data.value.formData?.middleName,
      passportNumber: quiz4Data.value.formData?.passportNumber
    };
  }
  
  if (quiz5Data.value) {
    data.genreInfo = {
      genre: quiz5Data.value.formData?.genre,
      hasDrugsMention: quiz5Data.value.formData?.hasDrugsMention,
      socialLinks: quiz5Data.value.formData?.socialLinks
    };
  }
  
  if (quiz6Data.value) {
    data.additionalInfo = {
      platforms: quiz6Data.value.formData?.platforms,
      otherPlatform: quiz6Data.value.formData?.otherPlatform,
      confirmNoRightsViolation: quiz6Data.value.formData?.confirmNoRightsViolation
    };
    data.contractData = quiz6Data.value.contractData;
  }
  
  if (quiz7Data.value) {
    data.agreement = quiz7Data.value.formData;
    if (quiz7Data.value.signature) {
      data.signature = quiz7Data.value.signature;
    }
    if (quiz7Data.value.contractData) {
      data.contractData = quiz7Data.value.contractData;
    }
  }
  
  const singleTracksCount = data.singleTracks?.length || 0;
  let albumTracksCount = 0;
  
  if (data.albums) {
    albumTracksCount = data.albums.reduce((total: number, album: Album) => {
      return total + (album.tracks?.length || 0);
    }, 0);
  }
  
  data.totalTracks = singleTracksCount + albumTracksCount;
  
  return data;
});

const canSubmit = computed(() => {
  const contractExists = !!(quiz6Data.value?.contractData || quiz7Data.value?.contractData);
  const signatureExists = !!quiz7Data.value?.signature;
  
  console.log('Quiz8: canSubmit check:', {
    contractExists,
    signatureExists,
    result: contractExists && signatureExists
  });
  
  return contractExists && signatureExists;
});

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указано';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
};

const formatPlatforms = (platforms?: string[]): string => {
  if (!platforms || platforms.length === 0) return 'Не указано';
  return platforms.map(p => {
    switch(p) {
      case 'social': return 'Социальные сети';
      case 'friends': return 'Рекомендация друзей';
      case 'search': return 'Поиск в интернете';
      case 'youtube': return 'YouTube';
      case 'forums': return 'Музыкальные форумы';
      case 'previous': return 'Ранее пользовались';
      case 'other': return 'Другое';
      default: return p;
    }
  }).join(', ');
};

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

const formatCitizenship = (citizenship?: string, other?: string): string => {
  if (!citizenship) return '';
  if (citizenship === 'RU') return 'Российская Федерация';
  if (citizenship === 'other') return other || '';
  return citizenship;
};

// Функция для очистки полей от запрещенных символов
const cleanField = (value: string): string => {
  if (!value) return '';
  return value.replace(/[\/\\&@+=<>\[\]{}|~?*]/g, ' ').replace(/\s+/g, ' ').trim();
};

const prepareOrderData = (): FormData => {
  const formData = new FormData();
  
  console.log('========== НАЧАЛО ФОРМИРОВАНИЯ ЗАПРОСА ==========');
  
  // --- 1. ШАГ 1: Количество ---
  const singleCount = quiz1Data.value?.singleCount || 0;
  const albumCount = quiz1Data.value?.albumCount || 0;
  const clipCount = quiz1Data.value?.clipCount || 0;
  const cardCount = quiz1Data.value?.cardCount || 0;

  formData.append('check-karta', cardCount > 0 ? 'on' : 'off');
  console.log('check-karta:', cardCount > 0 ? 'on' : 'off');
  
  formData.append('COUNT', String(singleCount));
  console.log('COUNT (single):', singleCount);
  formData.append('COUNT', String(albumCount));
  console.log('COUNT (album):', albumCount);
  formData.append('COUNT', String(clipCount));
  console.log('COUNT (clip):', clipCount);
  formData.append('COUNT', String(cardCount));
  console.log('COUNT (card):', cardCount);
  
  formData.append('countSingle', String(singleCount));
  console.log('countSingle:', singleCount);
  formData.append('countAlbum', String(albumCount));
  console.log('countAlbum:', albumCount);

  // --- 2. ШАГ 2: Синглы ---
  if (quiz2Data.value?.singleTracks) {
    console.log('--- СИНГЛЫ ---');
    quiz2Data.value.singleTracks.forEach((track: SingleTrack, index: number) => {
      if (track.product_id) {
        console.log(`Сингл ${index + 1}:`);
        console.log('  trackID[]:', track.product_id);
        console.log(`  path-file[${track.product_id}]:`, track.audioFileName);
        console.log(`  name-file[${track.product_id}]:`, track.audioFileName);
        console.log(`  artist[${track.product_id}]:`, cleanField(track.performerName || ''));
        console.log(`  autor-music[${track.product_id}]:`, cleanField(track.musicAuthor || ''));
        console.log(`  autor-words[${track.product_id}]:`, cleanField(track.textAuthor || ''));
        console.log(`  autor-files[${track.product_id}]:`, cleanField(track.performerName || ''));
        
        formData.append('trackID[]', track.product_id);
        formData.append(`path-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`name-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`artist[${track.product_id}]`, cleanField(track.performerName || ''));
        formData.append(`autor-music[${track.product_id}]`, cleanField(track.musicAuthor || ''));
        formData.append(`autor-words[${track.product_id}]`, cleanField(track.textAuthor || ''));
        formData.append(`autor-files[${track.product_id}]`, cleanField(track.performerName || ''));
      }
    });
  }

  // --- 3. ШАГ 2: Альбомы ---
  if (quiz2Data.value?.albums) {
    console.log('--- АЛЬБОМЫ ---');
    quiz2Data.value.albums.forEach((album: Album, albumIndex: number) => {
      if (album.tracks) {
        album.tracks.forEach((track: AlbumTrack, trackIndex: number) => {
          if (track.product_id) {
            console.log(`Альбом ${albumIndex + 1}, Трек ${trackIndex + 1}:`);
            console.log('  albumID[]:', track.product_id);
            console.log(`  path-file-album[${track.product_id}]:`, track.audioFileName);
            console.log(`  name-file-album[${track.product_id}]:`, track.audioFileName);
            console.log(`  artist-album[${track.product_id}]:`, cleanField(album.albumName || ''));
            console.log(`  autor-music-album[${track.product_id}]:`, '');
            console.log(`  autor-words-album[${track.product_id}]:`, '');
            console.log(`  autor-files-album[${track.product_id}]:`, cleanField(album.albumName || ''));
            
            formData.append('albumID[]', track.product_id);
            formData.append(`path-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`name-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`artist-album[${track.product_id}]`, cleanField(album.albumName || ''));
            formData.append(`autor-music-album[${track.product_id}]`, '');
            formData.append(`autor-words-album[${track.product_id}]`, '');
            formData.append(`autor-files-album[${track.product_id}]`, cleanField(album.albumName || ''));
          }
        });
      }
    });
  }

  // --- 4. ШАГ 3: Информация о релизе ---
  if (quiz3Data.value?.formData) {
    const f = quiz3Data.value.formData;
    
    console.log('--- ШАГ 3: Информация о релизе ---');
    
    const releaseName = cleanField(f.releaseName || 'Релиз');
    console.log('name-relize:', releaseName);
    formData.append('name-relize', releaseName);
    
    const alias = cleanField(f.performerName || '');
    console.log('alias:', alias);
    formData.append('alias', alias);
    
    console.log('kuda-reliz1:', '1');
    console.log('kuda-reliz:', '1');
    formData.append('kuda-reliz1', '1');
    formData.append('kuda-reliz', '1');
    
    console.log('others-kuda:', f.otherPlatform || '');
    formData.append('others-kuda', f.otherPlatform || '');
    
    console.log('calendar-reliz:', f.releaseDate || '');
    formData.append('calendar-reliz', f.releaseDate || '');
    
    const matValue = f.hasProfanity === 'yes' ? '12' : '13';
    console.log('mat1:', matValue);
    console.log('mat:', matValue);
    formData.append('mat1', matValue);
    formData.append('mat', matValue);
    
    console.log('others-mat:', f.profanityTracks || '');
    formData.append('others-mat', f.profanityTracks || '');
    
    console.log('mat1ai:', '13');
    console.log('matai:', '13');
    formData.append('mat1ai', '13');
    formData.append('matai', '13');
    
    console.log('others-matai:', '');
    formData.append('others-matai', '');
    
    console.log('all-obl:', '1');
    formData.append('all-obl', '1');
    
    console.log('vk:', f.vkLink || '');
    formData.append('vk', f.vkLink || '');
    
    console.log('email-clear:', f.email || '');
    formData.append('email-clear', f.email || '');

    // Альбомные переменные
    const albumReleaseName = cleanField(quiz2Data.value?.albums?.[0]?.albumName || f.releaseName || 'Альбом');
    console.log('--- АЛЬБОМНЫЕ ПЕРЕМЕННЫЕ ---');
    console.log('name-relize-album:', albumReleaseName);
    formData.append('name-relize-album', albumReleaseName);
    
    console.log('alias-album:', alias);
    formData.append('alias-album', alias);
    
    console.log('kuda-reliz-album1:', '4');
    console.log('kuda-reliz-album:', '4');
    formData.append('kuda-reliz-album1', '4');
    formData.append('kuda-reliz-album', '4');
    
    console.log('others-kuda-album:', '');
    formData.append('others-kuda-album', '');
    
    console.log('calendar-reliz-album:', f.releaseDate || '');
    formData.append('calendar-reliz-album', f.releaseDate || '');
    
    console.log('mat-album1:', matValue);
    console.log('mat-album:', matValue);
    formData.append('mat-album1', matValue);
    formData.append('mat-album', matValue);
    
    console.log('others-mat-album:', f.profanityTracks || '');
    formData.append('others-mat-album', f.profanityTracks || '');
    
    console.log('mat-album1ai:', '13');
    console.log('mat-albumai:', '13');
    formData.append('mat-album1ai', '13');
    formData.append('mat-albumai', '13');
    
    console.log('others-matai-album:', '');
    formData.append('others-matai-album', '');
    
    console.log('vk-album:', f.vkLink || '');
    formData.append('vk-album', f.vkLink || '');
    
    console.log('email-clear-album:', f.email || '');
    formData.append('email-clear-album', f.email || '');
  } else {
    console.log('⚠️ НЕТ ДАННЫХ ИЗ QUIZ3! Добавляю значения по умолчанию');
    formData.append('name-relize', 'Релиз');
    formData.append('name-relize-album', 'Альбом');
    console.log('name-relize (default):', 'Релиз');
    console.log('name-relize-album (default):', 'Альбом');
  }

  // --- 5. ШАГ 4: Данные пользователя ---
  if (quiz4Data.value?.formData) {
    const u = quiz4Data.value.formData;
    console.log('--- ШАГ 4: Данные пользователя ---');
    
    formData.append('citysenship1', '');
    formData.append('citysenship', u.userType === 'individual' ? 'Физическое лицо' : 'Индивидуальный предприниматель');
    formData.append('select__fizurlico', '');
    formData.append('others', '');
    formData.append('yur_arg_org', u.legalAddress || '');
    formData.append('inn', u.inn || '');
    formData.append('ogrn', u.ogrn || '');
    formData.append('rasy', u.accountNumber || '');
    formData.append('bank', u.bankName || '');
    formData.append('inn_bank', u.bankInn || '');
    formData.append('bik', u.bankBik || '');
    formData.append('kor_s', u.correspondentAccount || '');
    formData.append('yur_adr_bank', u.bankLegalAddress || '');
    
    formData.append('citysenship1', '');
    formData.append('citysenship', formatCitizenship(u.citizenship, u.otherCitizenship));
    formData.append('others', '');
    formData.append('FAM', u.lastName || '');
    formData.append('IMYA', u.firstName || '');
    formData.append('OTCH', u.middleName || '');
    formData.append('passport', u.passportNumber || '');
    formData.append('who-doing', u.passportIssuedBy || '');
    formData.append('when-doing', formatDateForAPI(u.passportIssueDate) || '22/22/2222');
    formData.append('adress', u.registrationAddress || '');
  }

  // --- 6. ШАГ 5: Жанр и текст ---
  if (quiz5Data.value?.formData) {
    const g = quiz5Data.value.formData;
    console.log('--- ШАГ 5: Жанр и текст ---');
    
    formData.append('genre', g.genre || '');
    formData.append('time-play', g.tiktokStartSeconds || '');
    formData.append('nark', g.hasDrugsMention === 'yes' ? '12' : '13');
    formData.append('narc', g.hasDrugsMention === 'yes' ? '12' : '13');
    formData.append('others-narc', g.drugsTracks || '');
    formData.append('apple', g.appleMusicLinks || '');
    formData.append('spotify', g.spotifyLinks || '');
    formData.append('link-vk', g.vkLinks || '');
    formData.append('link-yandex', g.yandexMusicLinks || '');
    formData.append('socialartist', g.socialLinks || '');
  }

  // --- 7. ШАГ 6: Дополнительная информация ---
  if (quiz6Data.value?.formData) {
    const a = quiz6Data.value.formData;
    console.log('--- ШАГ 6: Дополнительная информация ---');

    const platformValue = a.platforms && a.platforms.length > 0 ? a.platforms[0] : '0';

    formData.append('otkuda-uznali1', platformValue);
    formData.append('otkuda-uznali', platformValue);
    formData.append('others-otkuda', a.otherPlatform || '');
    formData.append('instrumentals', a.rightsInfo || '');
    formData.append('comments', a.additionalComments || '');
    formData.append('plan', a.promoPlan || '');
    formData.append('link-bandlink', a.bandlinkUrl || '');
    formData.append('promocode', a.promoCode || '');
    formData.append('promosum', '');
    
    const baseAmount = 2590;
    const finalSum = quiz6Data.value?.promoDiscount 
      ? Math.floor(baseAmount * (100 - quiz6Data.value.promoDiscount) / 100)
      : baseAmount;
    formData.append('sumOrder', String(finalSum));
    formData.append('policy', a.confirmNoRightsViolation ? 'on' : 'off');
    
    console.log('policy:', a.confirmNoRightsViolation ? 'on' : 'off');
  }

  // --- 8. ОТВЕТ ИЗ NEWDOCK ---
  if (contractData.value) {
    console.log('--- ОТВЕТ ИЗ NEWDOCK ---');
    console.log('docName:', contractData.value.doc_pdf);
    console.log('docNameDocx:', contractData.value.doc_docx);
    
    formData.append('docName', contractData.value.doc_pdf || '');
    formData.append('docNameDocx', contractData.value.doc_docx || '');
    
    if (contractData.value.images && Array.isArray(contractData.value.images)) {
      contractData.value.images.forEach((img: string, index: number) => {
        console.log(`imgDoc${index}:`, img);
        formData.append(`imgDoc${index}`, img);
      });
    }
  }

  // --- 9. ШАГ 7: Согласия и Подпись ---
  const acceptTerms = quiz7Data.value?.formData?.acceptTerms === true;
  const acceptPrivacy = quiz7Data.value?.formData?.acceptPrivacy === true;
  
  console.log('--- ШАГ 7: Согласия и Подпись ---');
  console.log('quiz_policy_one:', acceptTerms ? 'on' : 'off');
  console.log('quiz_policy_two:', acceptPrivacy ? 'on' : 'off');
  
  formData.append('quiz_policy_one', acceptTerms ? 'on' : 'off');
  formData.append('quiz_policy_two', acceptPrivacy ? 'on' : 'off');
  
  if (quiz7Data.value?.signature) {
    console.log('podp_url:', quiz7Data.value.signature.substring(0, 50) + '...');
    formData.append('podp_url', quiz7Data.value.signature);
  }

  // ФИНАЛЬНАЯ ПРОВЕРКА
  console.log('========== ФИНАЛЬНАЯ ПРОВЕРКА ==========');
  console.log('Проверяем критически важные поля:');
  console.log('name-relize:', formData.get('name-relize'));
  console.log('name-relize-album:', formData.get('name-relize-album'));
  console.log('trackID[]:', formData.getAll('trackID[]'));
  console.log('albumID[]:', formData.getAll('albumID[]'));
  console.log('quiz_policy_one:', formData.get('quiz_policy_one'));
  console.log('quiz_policy_two:', formData.get('quiz_policy_two'));
  console.log('=========================================');

  return formData;
};

const goBack = () => {
  emit('go-back');
};

const handleFinish = async () => {
  try {
    isSubmitting.value = true;
    
    const contractExists = !!(quiz6Data.value?.contractData || quiz7Data.value?.contractData);
    
    if (!contractExists) {
      ElMessage.error('Данные договора не найдены');
      isSubmitting.value = false;
      return;
    }
    
    if (!quiz7Data.value?.signature) {
      ElMessage.error('Подпись не найдена. Пожалуйста, вернитесь на шаг 7 и подпишите договор.');
      isSubmitting.value = false;
      return;
    }
    
    // Проверяем чекбоксы
    if (!quiz7Data.value?.formData?.acceptTerms) {
      ElMessage.error('Необходимо принять условия оферты');
      isSubmitting.value = false;
      return;
    }
    
    if (!quiz7Data.value?.formData?.acceptPrivacy) {
      ElMessage.error('Необходимо дать согласие на обработку персональных данных');
      isSubmitting.value = false;
      return;
    }
    
    ElMessage.info('Подготовка данных для отправки...');
    
    const formData = prepareOrderData();
    
    ElMessage.info('Отправка данных на сервер...');
    
    const response = await sendRequest("post", '/ajax_vue/ajax/order.php', formData);
    
    console.log('Order response:', response.data);
    
    if (response.data && response.data.error === 0) {
      ElMessage.success('Заказ успешно оформлен!');
      emit('finish');
    } else {
      throw new Error(response.data?.message || 'Ошибка при оформлении заказа');
    }
    
  } catch (error: any) {
    console.error('Error submitting order:', error);
    ElMessage.error(error.message || 'Произошла ошибка при отправке данных');
  } finally {
    isSubmitting.value = false;
  }
};

// Следим за изменениями данных
watch([quiz6Data, quiz7Data], () => {
  console.log('Quiz8: Data changed, canSubmit:', canSubmit.value);
}, { deep: true });

onMounted(async () => {
  try {
    await initDB();
    await loadAllData();
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
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
.quiz__form_loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
.quiz__form_error {
  text-align: center;
  padding: 40px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  margin-bottom: 20px;
}
.quiz__form_error .error {
  color: #f56c6c;
  font-size: 16px;
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

.quiz__summary {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg-color);
  max-height: 500px;
  overflow-y: auto;
}

.quiz__summary_title {
  margin-bottom: 20px;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 600;
}

.quiz__summary_status {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--bg-light);
  border-radius: 4px;
}

.status_item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
}

.status_success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status_error {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.status_icon {
  font-size: 18px;
}

.status_text {
  font-size: 14px;
  font-weight: 500;
}

.quiz__summary_section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.quiz__summary_section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.quiz__summary_section h6 {
  margin-bottom: 10px;
  font-weight: 600;
}

.quiz__summary_content {
  padding-left: 15px;
}

.quiz__summary_content p {
  margin-bottom: 5px;
  line-height: 1.5;
}

.summary_item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: var(--bg-light);
  border-radius: 4px;
}

.summary_subitem {
  margin-top: 10px;
  padding-left: 15px;
  border-left: 2px solid var(--border);
}

.text_small {
  font-size: 12px;
  color: var(--text-gray);
  margin-left: 10px;
}

.success {
  color: #67c23a;
}

.warning {
  color: #e6a23c;
}

.total {
  background-color: var(--bg-highlight);
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.total_count {
  font-size: 18px;
  color: var(--primary-color);
}

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
  .quiz__summary {
    padding: 15px;
    max-height: 400px;
  }
  .quiz__summary_status {
    flex-direction: column;
    gap: 10px;
  }
}
</style>