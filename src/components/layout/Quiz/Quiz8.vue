<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Отправка данных</h4>
  
  <div v-if="!dataLoaded" class="quiz__form_loading">
    <span>Загрузка данных...</span>
  </div>
  
  <div v-else class="quiz__summary">
    <h5 class="quiz__summary_title">Сводка данных</h5>
    
    <!-- Шаг 1: Количество треков -->
    <div class="quiz__summary_section">
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
    
    <!-- Данные договора из Quiz6 -->
    <div class="quiz__summary_section" v-if="summaryData.contractData">
      <h6>Договор (из Quiz6)</h6>
      <div class="quiz__summary_content">
        <p><strong>PDF:</strong> {{ summaryData.contractData.doc_pdf }}</p>
        <p><strong>DOCX:</strong> {{ summaryData.contractData.doc_docx }}</p>
        <p><strong>Количество страниц:</strong> {{ summaryData.contractData.images?.length || 0 }}</p>
      </div>
    </div>
    
    <!-- Подпись из Quiz7 -->
    <div class="quiz__summary_section" v-if="summaryData.signature">
      <h6>Подпись</h6>
      <div class="quiz__summary_content">
        <p><strong>Подпись:</strong> получена</p>
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
import { ref, computed, onMounted } from 'vue';
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
const DB_VERSION = 1;

const isLoading = ref(false);
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

const initDB = async () => {
  quizDB.value = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('quizState')) {
        const store = db.createObjectStore('quizState', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
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
  return !!summaryData.value.contractData && !!summaryData.value.signature;
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

const prepareOrderData = (): FormData => {
  const formData = new FormData();
  
  // Шаг 1
  if (quiz1Data.value) {
    formData.append('check-single', quiz1Data.value.singleCount > 0 ? 'on' : 'off');
    formData.append('check-album', quiz1Data.value.albumCount > 0 ? 'on' : 'off');
    formData.append('check-klip', quiz1Data.value.clipCount > 0 ? 'on' : 'off');
    formData.append('check-karta', quiz1Data.value.cardCount > 0 ? 'on' : 'off');
    formData.append('countSingle', String(quiz1Data.value.singleCount || 0));
    formData.append('countAlbum', String(quiz1Data.value.albumCount || 0));
  }
  
  // Шаг 2 - Синглы
  if (quiz2Data.value?.singleTracks) {
    quiz2Data.value.singleTracks.forEach((track: SingleTrack) => {
      if (track.product_id) {
        formData.append('trackID[]', track.product_id);
        formData.append(`path-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`name-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`artist[${track.product_id}]`, track.performerName || '');
        formData.append(`autor-music[${track.product_id}]`, track.musicAuthor || '');
        formData.append(`autor-words[${track.product_id}]`, track.textAuthor || '');
        formData.append(`autor-files[${track.product_id}]`, track.performerName || '');
      }
    });
  }
  
  // Шаг 2 - Альбомы
  if (quiz2Data.value?.albums) {
    quiz2Data.value.albums.forEach((album: Album) => {
      if (album.tracks) {
        album.tracks.forEach((track: AlbumTrack) => {
          if (track.product_id) {
            formData.append('albumID[]', track.product_id);
            formData.append(`path-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`name-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`artist-album[${track.product_id}]`, '');
            formData.append(`autor-music-album[${track.product_id}]`, '');
            formData.append(`autor-words-album[${track.product_id}]`, '');
            formData.append(`autor-files-album[${track.product_id}]`, '');
          }
        });
      }
    });
  }
  
  // Шаг 3
  if (quiz3Data.value?.formData) {
    const f = quiz3Data.value.formData;
    formData.append('alias', f.performerName || '');
    formData.append('name-relize', f.releaseName || '');
    formData.append('kuda-reliz1', '1');
    formData.append('kuda-reliz', '1');
    formData.append('others-kuda', f.otherPlatform || '');
    formData.append('calendar-reliz', f.releaseDate || '');
    formData.append('mat1', f.hasProfanity === 'yes' ? '12' : '13');
    formData.append('mat', f.hasProfanity === 'yes' ? '12' : '13');
    formData.append('others-mat', f.profanityTracks || '');
    formData.append('mat1ai', '13');
    formData.append('matai', '13');
    formData.append('others-matai', '');
    formData.append('all-obl', '1');
    formData.append('vk', f.vkLink || '');
    formData.append('email-clear', f.email || '');
    
    formData.append('alias-album', f.performerName || '');
    formData.append('name-relize-album', '');
    formData.append('kuda-reliz-album1', '');
    formData.append('kuda-reliz-album', '1');
    formData.append('others-kuda-album', '');
    formData.append('calendar-reliz-album', '');
    formData.append('mat-album1', '13');
    formData.append('mat-album', '13');
    formData.append('others-mat-album', '');
    formData.append('mat-album1ai', '13');
    formData.append('mat-albumai', '13');
    formData.append('others-matai-album', '');
    formData.append('vk-album', f.vkLink || '');
    formData.append('email-clear-album', f.email || '');
  }
  
  // Шаг 4
  if (quiz4Data.value?.formData) {
    const u = quiz4Data.value.formData;
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
    formData.append('kemvidan', '');
    formData.append('when-doing', formatDateForAPI(u.passportIssueDate) || '');
    formData.append('adress', u.registrationAddress || '');
  }
  
  // Шаг 5
  if (quiz5Data.value?.formData) {
    const g = quiz5Data.value.formData;
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
  
  // Шаг 6
  if (quiz6Data.value?.formData) {
    const a = quiz6Data.value.formData;
    formData.append('otkuda-uznali1', a.platforms?.[0] || '');
    formData.append('otkuda-uznali', a.platforms?.[0] || '');
    formData.append('others-otkuda', a.otherPlatform || '');
    formData.append('instrumentals', a.rightsInfo || '');
    formData.append('comments', a.additionalComments || '');
    formData.append('plan', a.promoPlan || '');
    formData.append('link-bandlink', a.bandlinkUrl || '');
    formData.append('promocode', a.promoCode || '');
    formData.append('promosum', '');
    formData.append('sumOrder', '2590');
    formData.append('policy', a.confirmNoRightsViolation ? 'on' : 'off');
  }
  
  // Шаг 7 - чекбоксы
  if (quiz7Data.value?.formData) {
    formData.append('quiz-policy_one', quiz7Data.value.formData.acceptTerms ? 'on' : 'off');
    formData.append('quiz-policy_two', quiz7Data.value.formData.acceptPrivacy ? 'on' : 'off');
  }
  
  // Данные договора из Quiz6 - добавляем ВСЕ что получили от /ajax/newDock.php
  if (quiz6Data.value?.contractData) {
    const contract = quiz6Data.value.contractData;
    formData.append('docName', contract.doc_pdf || '');
    formData.append('docNameDocx', contract.doc_docx || '');
    
    // Добавляем ВСЕ картинки из массива images как imgDoc0, imgDoc1, ... imgDocN
    if (contract.images && Array.isArray(contract.images)) {
      contract.images.forEach((img: string, index: number) => {
        formData.append(`imgDoc${index}`, img);
      });
    }
  }
  
  // Подпись из Quiz7
  if (quiz7Data.value?.signature) {
    formData.append('podp_url', quiz7Data.value.signature);
  }
  
  return formData;
};

const goBack = () => {
  emit('go-back');
};

const handleFinish = async () => {
  try {
    isSubmitting.value = true;
    
    if (!quiz6Data.value?.contractData) {
      ElMessage.error('Данные договора не найдены');
      isSubmitting.value = false;
      return;
    }
    
    if (!quiz7Data.value?.signature) {
      ElMessage.error('Подпись не найдена');
      isSubmitting.value = false;
      return;
    }
    
    ElMessage.info('Подготовка данных для отправки...');
    
    const formData = prepareOrderData();
    
    console.log('Sending data to /ajax_vue/ajax/order.php');
    const entries: any = {};
    for (const pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
      entries[pair[0]] = pair[1];
    }
    
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
}
</style>