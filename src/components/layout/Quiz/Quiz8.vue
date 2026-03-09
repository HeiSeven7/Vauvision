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
    
    <!-- Статус файлов -->
    <div class="quiz__summary_status">
      <div class="status_item" :class="{ 'status_success': hasCover, 'status_error': !hasCover }">
        <span class="status_icon">{{ hasCover ? '✅' : '❌' }}</span>
        <span class="status_text">Обложка: {{ hasCover ? coverFileName : 'не найдена' }}</span>
      </div>
      <div class="status_item" :class="{ 'status_success': audioFilesCount > 0, 'status_error': audioFilesCount === 0 }">
        <span class="status_icon">{{ audioFilesCount > 0 ? '✅' : '❌' }}</span>
        <span class="status_text">Аудиофайлы: {{ audioFilesCount }} шт.</span>
      </div>
      <div class="status_item" :class="{ 'status_success': hasAppleMusicFile, 'status_error': !hasAppleMusicFile }">
        <span class="status_icon">{{ hasAppleMusicFile ? '✅' : '❌' }}</span>
        <span class="status_text">Текст (docx): {{ hasAppleMusicFile ? appleMusicFileName : 'не найден' }}</span>
      </div>
      <div class="status_item" :class="{ 'status_success': hasKaraokeFile, 'status_error': !hasKaraokeFile }">
        <span class="status_icon">{{ hasKaraokeFile ? '✅' : '❌' }}</span>
        <span class="status_text">Караоке (ttml): {{ hasKaraokeFile ? karaokeFileName : 'не найден' }}</span>
      </div>
    </div>
    
    <!-- Информация о выбранных типах -->
    <div class="quiz__summary_status">
      <div class="status_item" :class="{ 'status_success': hasSingles, 'status_error': !hasSingles }">
        <span class="status_icon">{{ hasSingles ? '✅' : '❌' }}</span>
        <span class="status_text">Синглы: {{ hasSingles ? singleCount + ' шт.' : 'не выбраны' }}</span>
      </div>
      <div class="status_item" :class="{ 'status_success': hasAlbums, 'status_error': !hasAlbums }">
        <span class="status_icon">{{ hasAlbums ? '✅' : '❌' }}</span>
        <span class="status_text">Альбомы: {{ hasAlbums ? albumCount + ' шт.' : 'не выбраны' }}</span>
      </div>
    </div>
    
    <!-- Шаг 1: Количество треков -->
    <div class="quiz__summary_section" v-if="singleCount || albumCount">
      <h6>Шаг 1: Количество треков</h6>
      <div class="quiz__summary_content">
        <p v-if="singleCount">Синглов: <strong>{{ singleCount }}</strong></p>
        <p v-if="albumCount">Альбомов: <strong>{{ albumCount }}</strong></p>
        <p v-if="clipCount">Клипов: <strong>{{ clipCount }}</strong></p>
        <p v-if="cardCount">Оформлений карточек: <strong>{{ cardCount }}</strong></p>
      </div>
    </div>
    
    <!-- Шаг 2: Синглы (только если есть синглы) -->
    <div class="quiz__summary_section" v-if="hasSingles && summaryData.singleTracks && summaryData.singleTracks.length > 0">
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
    
    <!-- Шаг 2: Альбомы (только если есть альбомы) -->
    <div class="quiz__summary_section" v-if="hasAlbums && summaryData.albums && summaryData.albums.length > 0">
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
    
    <!-- Шаг 3: Информация о релизе (всегда отправляется) -->
    <div class="quiz__summary_section" v-if="summaryData.releaseInfo">
      <h6>Шаг 3: Информация о релизе</h6>
      <div class="quiz__summary_content">
        <p><strong>Артист:</strong> {{ summaryData.releaseInfo.performerName || 'Не указано' }}</p>
        <p><strong>Название релиза:</strong> {{ summaryData.releaseInfo.releaseName || 'Не указано' }}</p>
        <p><strong>Email:</strong> {{ summaryData.releaseInfo.email || 'Не указано' }}</p>
        <p><strong>Ссылка VK:</strong> {{ summaryData.releaseInfo.vkLink || 'Не указано' }}</p>
        <p><strong>Дата релиза:</strong> {{ formatDate(summaryData.releaseInfo.releaseDate) }}</p>
        <p><strong>Мат:</strong> {{ summaryData.releaseInfo.hasProfanity === 'yes' ? 'Да' : 'Нет' }}</p>
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
      </div>
    </div>
    
    <!-- Подпись из Quiz7 -->
    <div class="quiz__summary_section" v-if="summaryData.signature">
      <h6>Подпись (Шаг 7)</h6>
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
    <p class="text_small">Отправлено файлов: {{ uploadedCount }}/{{ totalFilesCount }}</p>
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
import { FileRequest } from '@/utils/api';
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
  audioFileId?: string;
  product_id?: string;
}

interface AlbumTrack {
  trackNumber?: number;
  trackName?: string;
  audioFileName?: string;
  audioFileId?: string;
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
const FILES_DB_NAME = 'filesDB';
const AUDIO_DB_NAME = 'audioDB';
const DB_VERSION = 2;

const isLoading = ref(true);
const isSubmitting = ref(false);
const dataLoaded = ref(false);
const quizDB = ref<any>(null);
const filesDB = ref<any>(null);
const audioDB = ref<any>(null);
const dbInitialized = ref(false);
const filesDBInitialized = ref(false);
const audioDBInitialized = ref(false);

// Прогресс отправки
const uploadProgress = ref(0);
const uploadedCount = ref(0);
const totalFilesCount = ref(0);

// Файлы для отправки
const coverFile = ref<File | null>(null);
const coverFileName = ref('');
const audioFilesList = ref<Array<{file: File, fileName: string, type: string, productId?: string}>>([]);

// Файлы из Quiz5
const appleMusicFile = ref<File | null>(null);
const karaokeFile = ref<File | null>(null);
const appleMusicFileName = ref('');
const karaokeFileName = ref('');

// Данные из шагов
const quiz1Data = ref<Quiz1Data | null>(null);
const quiz2Data = ref<Quiz2Data | null>(null);
const quiz3Data = ref<Quiz3Data | null>(null);
const quiz4Data = ref<Quiz4Data | null>(null);
const quiz5Data = ref<Quiz5Data | null>(null);
const quiz6Data = ref<Quiz6Data | null>(null);
const quiz7Data = ref<Quiz7Data | null>(null);

// Вычисляемые значения для проверки наличия синглов/альбомов
const singleCount = computed(() => quiz1Data.value?.singleCount || 0);
const albumCount = computed(() => quiz1Data.value?.albumCount || 0);
const clipCount = computed(() => quiz1Data.value?.clipCount || 0);
const cardCount = computed(() => quiz1Data.value?.cardCount || 0);

const hasSingles = computed(() => singleCount.value > 0);
const hasAlbums = computed(() => albumCount.value > 0);

// Инициализация IndexedDB
const initDB = async () => {
  try {
    console.log('Quiz8: Initializing databases...');
    
    // Основная БД
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
    
    // База для файлов (обложки, docx, ttml)
    filesDB.value = await openDB(FILES_DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz8: Upgrading Files DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('fileName', 'fileName');
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz8: Created files store');
        }
      },
    });
    
    // База для аудиофайлов
    audioDB.value = await openDB(AUDIO_DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz8: Upgrading Audio DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains('audio')) {
          const store = db.createObjectStore('audio', { keyPath: 'id' });
          store.createIndex('fileName', 'fileName');
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz8: Created audio store');
        }
      },
    });
    
    dbInitialized.value = true;
    filesDBInitialized.value = true;
    audioDBInitialized.value = true;
    console.log('Quiz8: Databases initialized successfully');
    
  } catch (error) {
    console.error('Quiz8: Error initializing databases:', error);
  }
};

// Загрузка файла из IndexedDB
const loadFileFromDB = async (fileId: string, dbType: 'files' | 'audio' = 'files'): Promise<File | null> => {
  const db = dbType === 'files' ? filesDB.value : audioDB.value;
  const storeName = dbType === 'files' ? 'files' : 'audio';
  
  if (!db) return null;
  
  try {
    const stored = await db.get(storeName, fileId);
    if (stored && stored.data) {
      return new File([stored.data], stored.fileName, { type: stored.fileType || 'application/octet-stream' });
    }
    return null;
  } catch (error) {
    console.error(`Error loading file from ${dbType} DB:`, error);
    return null;
  }
};

// Загрузка обложки из Quiz3
const loadCoverFile = async (): Promise<File | null> => {
  if (!filesDBInitialized.value || !quiz3Data.value?.coverFileInfo?.fileId) {
    return null;
  }
  
  const fileId = quiz3Data.value.coverFileInfo.fileId;
  const file = await loadFileFromDB(fileId, 'files');
  
  if (file) {
    coverFileName.value = file.name;
    console.log('Quiz8: Cover file loaded:', file.name);
  }
  
  return file;
};

// Загрузка Apple Music файла (docx) из Quiz5
const loadAppleMusicFile = async (): Promise<File | null> => {
  if (!filesDBInitialized.value || !quiz5Data.value?.appleMusicFileInfo?.fileId) {
    return null;
  }
  
  const fileId = quiz5Data.value.appleMusicFileInfo.fileId;
  const file = await loadFileFromDB(fileId, 'files');
  
  if (file) {
    appleMusicFileName.value = file.name;
    console.log('Quiz8: Apple Music file loaded:', file.name);
  }
  
  return file;
};

// Загрузка Karaoke файла (ttml) из Quiz5
const loadKaraokeFile = async (): Promise<File | null> => {
  if (!filesDBInitialized.value || !quiz5Data.value?.karaokeFileInfo?.fileId) {
    return null;
  }
  
  const fileId = quiz5Data.value.karaokeFileInfo.fileId;
  const file = await loadFileFromDB(fileId, 'files');
  
  if (file) {
    karaokeFileName.value = file.name;
    console.log('Quiz8: Karaoke file loaded:', file.name);
  }
  
  return file;
};

// Загрузка всех аудиофайлов из Quiz2
const loadAllAudioFiles = async (): Promise<Array<{file: File, fileName: string, type: string, productId?: string}>> => {
  const files: Array<{file: File, fileName: string, type: string, productId?: string}> = [];
  
  if (!audioDBInitialized.value || !quiz2Data.value) {
    return files;
  }
  
  try {
    // Загружаем синглы (только если есть синглы)
    if (hasSingles.value && quiz2Data.value.singleTracks) {
      for (const track of quiz2Data.value.singleTracks) {
        if (track.audioFileId) {
          const file = await loadFileFromDB(track.audioFileId, 'audio');
          if (file) {
            files.push({
              file,
              fileName: file.name,
              type: 'single',
              productId: track.product_id
            });
            console.log('Quiz8: Single audio loaded:', file.name, 'Product ID:', track.product_id);
          }
        }
      }
    }
    
    // Загружаем треки альбомов (только если есть альбомы)
    if (hasAlbums.value && quiz2Data.value.albums) {
      for (const album of quiz2Data.value.albums) {
        if (album.tracks) {
          for (const track of album.tracks) {
            if (track.audioFileId) {
              const file = await loadFileFromDB(track.audioFileId, 'audio');
              if (file) {
                files.push({
                  file,
                  fileName: file.name,
                  type: 'album',
                  productId: track.product_id
                });
                console.log('Quiz8: Album audio loaded:', file.name, 'Product ID:', track.product_id);
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error loading audio files:', error);
  }
  
  return files;
};

// Загрузка данных из IndexedDB
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
    
    // Загружаем данные из всех шагов
    quiz1Data.value = await loadFromDB(STORAGE_KEYS.QUIZ1);
    quiz2Data.value = await loadFromDB(STORAGE_KEYS.QUIZ2);
    quiz3Data.value = await loadFromDB(STORAGE_KEYS.QUIZ3);
    quiz4Data.value = await loadFromDB(STORAGE_KEYS.QUIZ4);
    quiz5Data.value = await loadFromDB(STORAGE_KEYS.QUIZ5);
    quiz6Data.value = await loadFromDB(STORAGE_KEYS.QUIZ6);
    quiz7Data.value = await loadFromDB(STORAGE_KEYS.QUIZ7);
    
    console.log('Quiz8: Loaded text data');
    console.log('Quiz8: Has singles:', hasSingles.value, 'Has albums:', hasAlbums.value);
    
    // Загружаем файлы
    coverFile.value = await loadCoverFile();
    audioFilesList.value = await loadAllAudioFiles();
    appleMusicFile.value = await loadAppleMusicFile();
    karaokeFile.value = await loadKaraokeFile();
    
    console.log('Quiz8: Files loaded:', {
      cover: coverFile.value ? '✅' : '❌',
      audioCount: audioFilesList.value.length,
      appleMusic: appleMusicFile.value ? '✅' : '❌',
      karaoke: karaokeFile.value ? '✅' : '❌'
    });
    
    dataLoaded.value = true;
    
  } catch (error) {
    console.error('Error loading all data:', error);
    ElMessage.error('Ошибка загрузки данных');
  } finally {
    isLoading.value = false;
  }
};

// Вычисляемые свойства
const hasContract = computed(() => {
  return !!(quiz6Data.value?.contractData || quiz7Data.value?.contractData);
});

const hasSignature = computed(() => {
  return !!quiz7Data.value?.signature;
});

const hasCover = computed(() => {
  return coverFile.value !== null;
});

const audioFilesCount = computed(() => {
  return audioFilesList.value.length;
});

const hasAppleMusicFile = computed(() => {
  return appleMusicFile.value !== null;
});

const hasKaraokeFile = computed(() => {
  return karaokeFile.value !== null;
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
  const contractExists = hasContract.value;
  const signatureExists = hasSignature.value;
  const coverExists = hasCover.value;
  const audioExists = audioFilesCount.value > 0;
  
  console.log('Quiz8: canSubmit check:', {
    contractExists,
    signatureExists,
    coverExists,
    audioExists,
    result: contractExists && signatureExists && coverExists && audioExists
  });
  
  return contractExists && signatureExists && coverExists && audioExists;
});

// Вспомогательные функции
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

const cleanField = (value: string): string => {
  if (!value) return '';
  return value.replace(/[\/\\&@+=<>\[\]{}|~?*]/g, ' ').replace(/\s+/g, ' ').trim();
};

// Функция для создания FormData с ВСЕМИ файлами
const prepareOrderData = async (): Promise<FormData> => {
  const formData = new FormData();
  
  console.log('========== НАЧАЛО ФОРМИРОВАНИЯ ЗАПРОСА ==========');
  console.log('hasSingles:', hasSingles.value, 'hasAlbums:', hasAlbums.value);
  
  console.log('--- ДАННЫЕ ДЛЯ trackID[] И albumID[] ---');

  if (hasSingles.value && quiz2Data.value?.singleTracks) {
    console.log('trackID[] будет содержать:');
    quiz2Data.value.singleTracks.forEach((track, index) => {
      if (track.product_id) {
        console.log(`  [${index}] ${track.product_id} (${track.trackName})`);
      }
    });
  }

  if (hasAlbums.value && quiz2Data.value?.albums) {
    console.log('albumID[] будет содержать:');
    quiz2Data.value.albums.forEach((album, albumIndex) => {
      album.tracks?.forEach((track, trackIndex) => {
        if (track.product_id) {
          console.log(`  [Альбом ${albumIndex + 1}, Трек ${trackIndex + 1}] ${track.product_id} (${track.trackName})`);
        }
      });
    });
  }
  
  // --- 1. ШАГ 1: Количество ---
  formData.append('check-karta', cardCount.value > 0 ? 'on' : 'off');
  console.log('check-karta:', cardCount.value > 0 ? 'on' : 'off');
  
  formData.append('COUNT', String(singleCount.value));
  formData.append('COUNT', String(albumCount.value));
  formData.append('COUNT', String(clipCount.value));
  formData.append('COUNT', String(cardCount.value));
  
  formData.append('countSingle', String(singleCount.value));
  formData.append('countAlbum', String(albumCount.value));

  // --- 2. ШАГ 2: Синглы (текстовые данные) - ТОЛЬКО ЕСЛИ ЕСТЬ СИНГЛЫ ---
  if (hasSingles.value && quiz2Data.value?.singleTracks) {
    console.log('--- СИНГЛЫ (отправляем) ---');
    quiz2Data.value.singleTracks.forEach((track: SingleTrack, index: number) => {
      if (track.product_id) {
        console.log(`Сингл ${index + 1}: ID=${track.product_id}`);
        
        formData.append('trackID[]', track.product_id);
        formData.append(`path-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`name-file[${track.product_id}]`, track.audioFileName || '');
        formData.append(`artist[${track.product_id}]`, cleanField(track.performerName || ''));
        formData.append(`autor-music[${track.product_id}]`, cleanField(track.musicAuthor || ''));
        formData.append(`autor-words[${track.product_id}]`, cleanField(track.textAuthor || ''));
        formData.append(`autor-files[${track.product_id}]`, cleanField(track.performerName || ''));
      } else {
        console.warn(`Сингл ${index + 1} не имеет product_id!`);
      }
    });
  } else {
    console.log('--- НЕТ СИНГЛОВ, пропускаем данные для синглов ---');
  }

  // --- 3. ШАГ 2: Альбомы (текстовые данные) - ТОЛЬКО ЕСЛИ ЕСТЬ АЛЬБОМЫ ---
  if (hasAlbums.value && quiz2Data.value?.albums) {
    console.log('--- АЛЬБОМЫ (отправляем) ---');
    quiz2Data.value.albums.forEach((album: Album, albumIndex: number) => {
      if (album.tracks) {
        album.tracks.forEach((track: AlbumTrack, trackIndex: number) => {
          if (track.product_id) {
            console.log(`Альбом ${albumIndex + 1}, Трек ${trackIndex + 1}: ID=${track.product_id}`);
            
            formData.append('albumID[]', track.product_id);
            formData.append(`path-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`name-file-album[${track.product_id}]`, track.audioFileName || '');
            formData.append(`artist-album[${track.product_id}]`, cleanField(album.albumName || ''));
            formData.append(`autor-music-album[${track.product_id}]`, '');
            formData.append(`autor-words-album[${track.product_id}]`, '');
            formData.append(`autor-files-album[${track.product_id}]`, cleanField(album.albumName || ''));
          } else {
            console.warn(`Альбом ${albumIndex + 1}, трек ${trackIndex + 1} не имеет product_id!`);
          }
        });
      }
    });
  } else {
    console.log('--- НЕТ АЛЬБОМОВ, пропускаем данные для альбомов ---');
  }

  // --- 4. ШАГ 3: Информация о релизе ---
  if (quiz3Data.value?.formData) {
    const f = quiz3Data.value.formData;
    
    console.log('--- ШАГ 3: Информация о релизе ---');
    
    const releaseName = cleanField(f.releaseName || 'Релиз');
    formData.append('name_relize', releaseName);
    
    const alias = cleanField(f.performerName || '');
    formData.append('alias', alias);
    
    formData.append('kuda-reliz1', '1');
    formData.append('kuda-reliz', '1');
    formData.append('others-kuda', f.otherPlatform || '');
    formData.append('calendar-reliz', f.releaseDate || '');
    
    const matValue = f.hasProfanity === 'yes' ? '12' : '13';
    formData.append('mat1', matValue);
    formData.append('mat', matValue);
    formData.append('others-mat', f.profanityTracks || '');
    
    formData.append('mat1ai', '13');
    formData.append('matai', '13');
    formData.append('others-matai', '');
    formData.append('all-obl', '1');
    formData.append('vk', f.vkLink || '');
    formData.append('email-clear', f.email || '');

    // Альбомные переменные - ТОЛЬКО ЕСЛИ ЕСТЬ АЛЬБОМЫ
    if (hasAlbums.value) {
      console.log('--- Альбомные переменные (отправляем) ---');
      const albumReleaseName = cleanField(quiz2Data.value?.albums?.[0]?.albumName || f.releaseName || 'Альбом');
      formData.append('name-relize-album', albumReleaseName);
      formData.append('alias-album', alias);
      formData.append('kuda-reliz-album1', '4');
      formData.append('kuda-reliz-album', '4');
      formData.append('others-kuda-album', '');
      formData.append('calendar-reliz-album', f.releaseDate || '');
      formData.append('mat-album1', matValue);
      formData.append('mat-album', matValue);
      formData.append('others-mat-album', f.profanityTracks || '');
      formData.append('mat-album1ai', '13');
      formData.append('mat-albumai', '13');
      formData.append('others-matai-album', '');
      formData.append('vk-album', f.vkLink || '');
      formData.append('email-clear-album', f.email || '');
    } else {
      console.log('--- НЕТ АЛЬБОМОВ, пропускаем альбомные переменные ---');
    }
  }

  // --- 5. ШАГ 4: Данные пользователя ---
  if (quiz4Data.value?.formData) {
    const u = quiz4Data.value.formData;
    console.log('--- ШАГ 4: Данные пользователя ---');
    
    formData.append('citysenship1', '');
    formData.append('citysenship', u.userType === 'individual' ? 'Физическое лицо' : 'Индивидуальный предприниматель');
    formData.append('select__fizurlico', '');
    formData.append('others', '');
    formData.append('yur-arg-org', u.legalAddress || '');
    formData.append('inn', u.inn || '');
    formData.append('ogrn', u.ogrn || '');
    formData.append('rasy', u.accountNumber || '');
    formData.append('bank', u.bankName || '');
    formData.append('inn-bank', u.bankInn || '');
    formData.append('bik', u.bankBik || '');
    formData.append('kor-s', u.correspondentAccount || '');
    formData.append('yur-adr-bank', u.bankLegalAddress || '');
    
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
  console.log('quiz-policy-one:', acceptTerms ? 'on' : 'off');
  console.log('quiz-policy-two:', acceptPrivacy ? 'on' : 'off');
  
  formData.append('quiz-policy-one', acceptTerms ? 'on' : 'off');
  formData.append('quiz-policy-two', acceptPrivacy ? 'on' : 'off');
  
  if (quiz7Data.value?.signature) {
    console.log('podp-url: [подпись получена]');
    formData.append('podp-url', quiz7Data.value.signature);
  }

  // --- 10. ПРИКРЕПЛЯЕМ ВСЕ ФАЙЛЫ ---
  console.log('--- ПРИКРЕПЛЯЕМ ФАЙЛЫ ---');
  
  // Считаем общее количество файлов для прогресса
  let totalFiles = 0;
  if (coverFile.value) totalFiles++;
  totalFiles += audioFilesList.value.length;
  if (appleMusicFile.value) totalFiles++;
  if (karaokeFile.value) totalFiles++;
  totalFilesCount.value = totalFiles;
  uploadedCount.value = 0;
  let currentFileIndex = 0;
  
  // 10.1 Прикрепляем обложку
  if (coverFile.value) {
    if (hasSingles.value && singleCount.value > 1) {
      // Для нескольких синглов - несколько полей
      for (let i = 1; i <= singleCount.value; i++) {
        formData.append(`file-obl${i}`, coverFile.value);
        console.log(`Прикреплена обложка как file-obl${i}:`, coverFile.value.name);
      }
    } else if (hasAlbums.value) {
      // Для альбома
      formData.append('file-obl-album', coverFile.value);
      console.log('Прикреплена обложка как file-obl-album:', coverFile.value.name);
    } else {
      // Для одного сингла
      formData.append('file-obl1', coverFile.value);
      console.log('Прикреплена обложка как file-obl1:', coverFile.value.name);
    }
    
    currentFileIndex++;
    uploadedCount.value = currentFileIndex;
  }
  
  // 10.2 Прикрепляем аудиофайлы по их product_id
  for (let i = 0; i < audioFilesList.value.length; i++) {
    const audio = audioFilesList.value[i];
    
    if (audio.productId) {
      formData.append(`file[${audio.productId}]`, audio.file);
      console.log(`Прикреплен аудиофайл file[${audio.productId}]:`, audio.fileName);
    } else {
      console.warn('Аудиофайл без product_id:', audio.fileName);
    }
    
    currentFileIndex++;
    uploadedCount.value = currentFileIndex;
  }
  
  // 10.3 Прикрепляем Apple Music файл (docx)
  if (appleMusicFile.value) {
    formData.append('apple-music-text', appleMusicFile.value);
    console.log('Прикреплен Apple Music текст (docx):', appleMusicFile.value.name);
    
    currentFileIndex++;
    uploadedCount.value = currentFileIndex;
  }
  
  // 10.4 Прикрепляем Karaoke файл (ttml)
  if (karaokeFile.value) {
    formData.append('karaoke-text', karaokeFile.value);
    console.log('Прикреплен Karaoke текст (ttml):', karaokeFile.value.name);
    
    currentFileIndex++;
    uploadedCount.value = currentFileIndex;
  }

  // --- 11. ФИНАЛЬНАЯ ПРОВЕРКА ---
  console.log('========== ФИНАЛЬНАЯ ПРОВЕРКА ==========');
  console.log('Проверяем критически важные поля:');
  console.log('name-relize:', formData.get('name-relize'));
  
  if (hasSingles.value) {
    console.log('trackID[]:', formData.getAll('trackID[]'));
    console.log('Количество trackID[]:', formData.getAll('trackID[]').length);
  }
  
  if (hasAlbums.value) {
    console.log('albumID[]:', formData.getAll('albumID[]'));
    console.log('Количество albumID[]:', formData.getAll('albumID[]').length);
    console.log('name-relize-album:', formData.get('name-relize-album'));
  }
  
  console.log('quiz-policy-one:', formData.get('quiz-policy-one'));
  console.log('quiz-policy-two:', formData.get('quiz-policy-two'));
  console.log('Количество файлов:', totalFilesCount.value);
  console.log('Обложка:', coverFile.value ? '✅' : '❌');
  console.log('Аудиофайлы:', audioFilesList.value.length);
  console.log('Apple Music файл:', appleMusicFile.value ? '✅' : '❌');
  console.log('Karaoke файл:', karaokeFile.value ? '✅' : '❌');
  
  // Проверка наличия product_id
  if (hasSingles.value) {
    const singlesWithoutId = quiz2Data.value?.singleTracks?.filter(t => !t.product_id) || [];
    if (singlesWithoutId.length > 0) {
      console.warn(`ВНИМАНИЕ: ${singlesWithoutId.length} синглов без product_id!`);
    }
  }
  
  if (hasAlbums.value) {
    let tracksWithoutId = 0;
    quiz2Data.value?.albums?.forEach(album => {
      album.tracks?.forEach(track => {
        if (!track.product_id) tracksWithoutId++;
      });
    });
    if (tracksWithoutId > 0) {
      console.warn(`ВНИМАНИЕ: ${tracksWithoutId} треков альбомов без product_id!`);
    }
  }
  
  console.log('=========================================');

  return formData;
};

const goBack = () => {
  emit('go-back');
};

const handleFinish = async () => {
  try {
    isSubmitting.value = true;
    uploadProgress.value = 0;
    uploadedCount.value = 0;
    
    console.log('========== НАЧАЛО ОТПРАВКИ ЗАКАЗА ==========');
    console.log('Проверка наличия всех необходимых данных:');
    
    // Проверка наличия всех необходимых данных
    if (!hasContract.value) {
      console.error('❌ Данные договора не найдены');
      ElMessage.error('Данные договора не найдены');
      isSubmitting.value = false;
      return;
    } else {
      console.log('✅ Договор:', contractData.value);
    }
    
    if (!hasSignature.value) {
      console.error('❌ Подпись не найдена');
      ElMessage.error('Подпись не найдена. Пожалуйста, вернитесь на шаг 7 и подпишите договор.');
      isSubmitting.value = false;
      return;
    } else {
      console.log('✅ Подпись:', quiz7Data.value?.signature?.substring(0, 50) + '...');
    }
    
    if (!hasCover.value) {
      console.error('❌ Обложка не найдена');
      ElMessage.error('Обложка не найдена');
      isSubmitting.value = false;
      return;
    } else {
      console.log('✅ Обложка:', coverFileName.value);
    }
    
    if (audioFilesCount.value === 0) {
      console.error('❌ Аудиофайлы не найдены');
      ElMessage.error('Аудиофайлы не найдены');
      isSubmitting.value = false;
      return;
    } else {
      console.log(`✅ Аудиофайлы: ${audioFilesCount.value} шт.`);
      audioFilesList.value.forEach((audio, index) => {
        console.log(`   Аудио ${index + 1}:`, {
          fileName: audio.fileName,
          productId: audio.productId,
          type: audio.type
        });
      });
    }
    
    // Проверка чекбоксов
    if (!quiz7Data.value?.formData?.acceptTerms) {
      console.error('❌ Условия оферты не приняты');
      ElMessage.error('Необходимо принять условия оферты');
      isSubmitting.value = false;
      return;
    } else {
      console.log('✅ Условия оферты приняты');
    }
    
    if (!quiz7Data.value?.formData?.acceptPrivacy) {
      console.error('❌ Согласие на обработку данных не дано');
      ElMessage.error('Необходимо дать согласие на обработку персональных данных');
      isSubmitting.value = false;
      return;
    } else {
      console.log('✅ Согласие на обработку данных дано');
    }
    
    console.log('\n--- ДАННЫЕ ИЗ ВСЕХ ШАГОВ ---');
    
    // Данные из Quiz1
    console.log('Quiz1 (Количество):', {
      singleCount: singleCount.value,
      albumCount: albumCount.value,
      clipCount: clipCount.value,
      cardCount: cardCount.value,
      hasSingles: hasSingles.value,
      hasAlbums: hasAlbums.value
    });
    
    // Данные из Quiz2
    console.log('Quiz2 (Синглы и альбомы):');
    if (hasSingles.value && quiz2Data.value?.singleTracks) {
      console.log('  Синглы:');
      quiz2Data.value.singleTracks.forEach((track, index) => {
        console.log(`    ${index + 1}.`, {
          trackName: track.trackName,
          performerName: track.performerName,
          musicAuthor: track.musicAuthor,
          textAuthor: track.textAuthor,
          audioFileName: track.audioFileName,
          product_id: track.product_id
        });
      });
    }
    
    if (hasAlbums.value && quiz2Data.value?.albums) {
      console.log('  Альбомы:');
      quiz2Data.value.albums.forEach((album, albumIndex) => {
        console.log(`    Альбом ${albumIndex + 1}:`, {
          albumName: album.albumName
        });
        album.tracks?.forEach((track, trackIndex) => {
          console.log(`      Трек ${trackIndex + 1}:`, {
            trackName: track.trackName,
            audioFileName: track.audioFileName,
            product_id: track.product_id
          });
        });
      });
    }
    
    // Данные из Quiz3
    console.log('Quiz3 (Информация о релизе):', quiz3Data.value?.formData);
    console.log('Quiz3 (Обложка):', quiz3Data.value?.coverFileInfo);
    
    // Данные из Quiz4
    console.log('Quiz4 (Данные пользователя):', {
      userType: quiz4Data.value?.formData?.userType,
      lastName: quiz4Data.value?.formData?.lastName,
      firstName: quiz4Data.value?.formData?.firstName,
      middleName: quiz4Data.value?.formData?.middleName,
      passportNumber: quiz4Data.value?.formData?.passportNumber
    });
    
    // Данные из Quiz5
    console.log('Quiz5 (Жанр и текст):', quiz5Data.value?.formData);
    console.log('Quiz5 (Файлы):', {
      appleMusic: quiz5Data.value?.appleMusicFileInfo,
      karaoke: quiz5Data.value?.karaokeFileInfo
    });
    
    // Данные из Quiz6
    console.log('Quiz6 (Дополнительная информация):', quiz6Data.value?.formData);
    console.log('Quiz6 (Промо):', {
      promoApplied: quiz6Data.value?.promoApplied,
      promoDiscount: quiz6Data.value?.promoDiscount
    });
    
    // Данные из Quiz7
    console.log('Quiz7 (Согласия):', quiz7Data.value?.formData);
    console.log('Quiz7 (Подпись):', quiz7Data.value?.signature ? '✅ есть' : '❌ нет');
    
    // Данные договора
    console.log('Договор (из newdock):', contractData.value);
    
    console.log('\n--- ПРОВЕРКА PRODUCT_ID ---');
    
    // Проверяем наличие product_id у всех треков
    let missingProductIds = false;
    
    if (hasSingles.value && quiz2Data.value?.singleTracks) {
      quiz2Data.value.singleTracks.forEach((track, index) => {
        if (!track.product_id) {
          console.error(`❌ Сингл ${index + 1} не имеет product_id!`, track);
          missingProductIds = true;
        } else {
          console.log(`✅ Сингл ${index + 1} имеет product_id:`, track.product_id);
        }
      });
    }
    
    if (hasAlbums.value && quiz2Data.value?.albums) {
      quiz2Data.value.albums.forEach((album, albumIndex) => {
        album.tracks?.forEach((track, trackIndex) => {
          if (!track.product_id) {
            console.error(`❌ Альбом ${albumIndex + 1}, трек ${trackIndex + 1} не имеет product_id!`, track);
            missingProductIds = true;
          } else {
            console.log(`✅ Альбом ${albumIndex + 1}, трек ${trackIndex + 1} имеет product_id:`, track.product_id);
          }
        });
      });
    }
    
    if (missingProductIds) {
      console.warn('⚠️ Есть треки без product_id! Они не будут отправлены на сервер.');
    } else {
      console.log('✅ Все треки имеют product_id');
    }
    
    ElMessage.info('Подготовка данных для отправки...');
    
    // Подготавливаем FormData со ВСЕМИ файлами
    console.log('\n--- ПОДГОТОВКА FORM DATA ---');
    const formData = await prepareOrderData();
    
    // Выводим содержимое FormData
    console.log('Содержимое FormData:');
    for (const pair of (formData as any).entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: [ФАЙЛ] ${pair[1].name} (${pair[1].size} bytes)`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }
    
    // Считаем количество файлов в FormData
    let fileCount = 0;
    for (const pair of (formData as any).entries()) {
      if (pair[1] instanceof File) fileCount++;
    }
    console.log(`\n📊 Всего файлов в FormData: ${fileCount}`);
    
    ElMessage.info(`Отправка данных на сервер (${totalFilesCount.value} файлов)...`);
    
    // Отправляем все данные в order.php
    console.log('\n--- ОТПРАВКА ЗАПРОСА В order.php ---');
    const response = await FileRequest("post", '/ajax_vue/ajax/order.php', formData);
    
    console.log('✅ Ответ сервера (полный):', response);
    console.log('✅ Статус ответа:', response.status);
    console.log('✅ Данные ответа (raw):', response.data);
    
    // ИСПРАВЛЕННАЯ ЧАСТЬ: Перенаправление в этой же вкладке
    if (response && response.data) {
      
      let responseData = response.data;
      let parsedData = null;
      let paymentUrl = null;
      let orderId = null;
      
      // Если ответ - строка, пытаемся найти JSON
      if (typeof responseData === 'string') {
        console.log('🔍 Анализируем строку ответа...');
        
        // Ищем JSON в строке
        const jsonMatch = responseData.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ Найден JSON в ответе:', parsedData);
            
            // Извлекаем данные из JSON
            if (parsedData.error === 0) {
              paymentUrl = parsedData.data?.payment_url;
              orderId = parsedData.data?.order_id;
              
              console.log('💰 Извлеченные данные:', {
                orderId: orderId,
                paymentUrl: paymentUrl
              });
            }
          } catch (e) {
            console.error('❌ Ошибка парсинга JSON:', e);
          }
        }
      }
      
      // Если нашли payment_url
      if (paymentUrl) {
        ElMessage.success('Заказ успешно оформлен! Сейчас вы будете перенаправлены на страницу оплаты...');
        
        // Формируем полный URL
        const baseUrl = window.location.origin;
        const fullPaymentUrl = baseUrl + (paymentUrl.startsWith('/') ? paymentUrl : '/' + paymentUrl);
        
        console.log('🔗 Перенаправляем на:', fullPaymentUrl);
        
        // Небольшая задержка, чтобы пользователь увидел сообщение об успехе
        setTimeout(() => {
          // Перенаправляем в этой же вкладке (как будто нажали на кнопку)
          window.location.href = fullPaymentUrl;
        }, 1500);
        
        // НЕ вызываем emit('finish') здесь, так как мы перенаправляем пользователя
        return;
      } else {
        console.error('❌ Payment URL не найден в ответе сервера');
        ElMessage.warning('Заказ оформлен, но ссылка на оплату не получена');
        emit('finish');
        return;
      }
    } else {
      console.error('❌ Пустой ответ от сервера');
      ElMessage.error('Сервер вернул пустой ответ');
    }
    
  } catch (error: any) {
    console.error('❌ Ошибка при отправке заказа:', error);
    
    if (error.response) {
      console.error('❌ Статус ошибки:', error.response.status);
      console.error('❌ Данные ошибки:', error.response.data);
      ElMessage.error(`Ошибка сервера: ${error.response.status}`);
    } else if (error.request) {
      console.error('❌ Нет ответа от сервера:', error.request);
      ElMessage.error('Нет ответа от сервера. Проверьте соединение.');
    } else {
      ElMessage.error(error.message || 'Произошла ошибка при отправке данных');
    }
  } finally {
    isSubmitting.value = false;
    console.log('========== ЗАВЕРШЕНИЕ ОТПРАВКИ ==========');
  }
};

// Следим за изменениями данных
watch([quiz6Data, quiz7Data, coverFile, audioFilesList, appleMusicFile, karaokeFile], () => {
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
  flex-wrap: wrap;
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