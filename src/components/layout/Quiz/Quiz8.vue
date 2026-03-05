<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

const isLoading = ref(false);
const dataLoaded = ref(false);
const quizDB = ref<any>(null);
const audioDB = ref<any>(null);
const filesDB = ref<any>(null);

// Интерфейсы для типизации
interface SingleTrack {
  id?: string;
  trackName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  audioFileId?: string | null;
  uploaded?: boolean;
  hasAudioUploaded?: boolean;
  audioFileName?: string;
  audioFileSize?: number;
}

interface AlbumTrack {
  id?: string;
  trackNumber?: number;
  trackName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  audioFileId?: string | null;
  uploaded?: boolean;
  audioFileName?: string;
  audioFileSize?: number;
}

interface Album {
  id?: string;
  albumName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
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
  showImportantBlock?: boolean;
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
  showOtherCitizenshipInput?: boolean;
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
}

interface Quiz7Data {
  formData?: {
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    acceptMarketing?: boolean;
  };
}

interface AllData {
  // Шаг 1
  singleCount?: number;
  albumCount?: number;
  clipCount?: number;
  cardCount?: number;
  
  // Шаг 2
  singleTracks?: SingleTrack[];
  albums?: Album[];
  
  // Шаг 3
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
  coverFileSize?: number;
  coverFileId?: string | null;
  
  // Шаг 4
  userInfo?: {
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
  
  // Шаг 5
  genreInfo?: {
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
  appleMusicFileName?: string;
  appleMusicFileSize?: number;
  appleMusicFileId?: string | null;
  karaokeFileName?: string;
  karaokeFileSize?: number;
  karaokeFileId?: string | null;
  
  // Шаг 6
  additionalInfo?: {
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
  
  // Шаг 7
  agreement?: {
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
    acceptMarketing?: boolean;
  };
  
  // Метаданные
  totalTracks?: number;
  submittedAt?: string;
}

// Константы для ключей
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
const AUDIO_DB_NAME = 'audioDB';
const FILES_DB_NAME = 'filesDB';
const DB_VERSION = 1;

// Инициализация IndexedDB
const initDB = async () => {
  // База для текстовых данных состояний
  quizDB.value = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('quizState')) {
        const store = db.createObjectStore('quizState', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
  
  // База для аудиофайлов
  audioDB.value = await openDB(AUDIO_DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('audio')) {
        const store = db.createObjectStore('audio', { keyPath: 'id' });
        store.createIndex('fileName', 'fileName');
      }
    },
  });
  
  // База для файлов (обложки, тексты)
  filesDB.value = await openDB(FILES_DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('fileName', 'fileName');
      }
    },
  });
};

// Загрузка данных из IndexedDB по ключу
const loadFromDB = async (key: string): Promise<any> => {
  try {
    return await quizDB.value.get('quizState', key);
  } catch (error) {
    console.error(`Error loading ${key} from DB:`, error);
    return null;
  }
};

// Загрузка аудиофайла из IndexedDB
const loadAudioFromDB = async (fileId: string): Promise<{ fileName: string, fileSize: number } | null> => {
  try {
    const stored = await audioDB.value.get('audio', fileId);
    if (stored) {
      return {
        fileName: stored.fileName,
        fileSize: stored.fileSize
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading audio from DB:', error);
    return null;
  }
};

// Загрузка файла из filesDB
const loadFileFromDB = async (fileId: string): Promise<{ fileName: string, fileSize: number } | null> => {
  try {
    const stored = await filesDB.value.get('files', fileId);
    if (stored) {
      return {
        fileName: stored.fileName,
        fileSize: stored.fileSize
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading file from DB:', error);
    return null;
  }
};

// Реактивные данные
const quiz1Data = ref<Quiz1Data | null>(null);
const quiz2Data = ref<Quiz2Data | null>(null);
const quiz3Data = ref<Quiz3Data | null>(null);
const quiz4Data = ref<Quiz4Data | null>(null);
const quiz5Data = ref<Quiz5Data | null>(null);
const quiz6Data = ref<Quiz6Data | null>(null);
const quiz7Data = ref<Quiz7Data | null>(null);

// Загрузка всех данных из IndexedDB
const loadAllData = async () => {
  try {
    // Загружаем данные каждого шага
    quiz1Data.value = await loadFromDB(STORAGE_KEYS.QUIZ1);
    quiz2Data.value = await loadFromDB(STORAGE_KEYS.QUIZ2);
    quiz3Data.value = await loadFromDB(STORAGE_KEYS.QUIZ3);
    quiz4Data.value = await loadFromDB(STORAGE_KEYS.QUIZ4);
    quiz5Data.value = await loadFromDB(STORAGE_KEYS.QUIZ5);
    quiz6Data.value = await loadFromDB(STORAGE_KEYS.QUIZ6);
    quiz7Data.value = await loadFromDB(STORAGE_KEYS.QUIZ7);
    
    // Загружаем информацию о файлах из аудио БД
    if (quiz2Data.value) {
      // Загружаем информацию о файлах синглов
      if (quiz2Data.value.singleTracks) {
        for (const track of quiz2Data.value.singleTracks) {
          if (track.audioFileId) {
            const audioInfo = await loadAudioFromDB(track.audioFileId);
            if (audioInfo) {
              track.audioFileName = audioInfo.fileName;
              track.audioFileSize = audioInfo.fileSize;
              track.uploaded = true;
            }
          }
        }
      }
      
      // Загружаем информацию о файлах альбомов
      if (quiz2Data.value.albums) {
        for (const album of quiz2Data.value.albums) {
          if (album.tracks) {
            for (const track of album.tracks) {
              if (track.audioFileId) {
                const audioInfo = await loadAudioFromDB(track.audioFileId);
                if (audioInfo) {
                  track.audioFileName = audioInfo.fileName;
                  track.audioFileSize = audioInfo.fileSize;
                  track.uploaded = true;
                }
              }
            }
          }
        }
      }
    }
    
    // Загружаем информацию о файлах из filesDB (обложка, тексты)
    if (quiz3Data.value?.coverFileInfo?.fileId) {
      const fileInfo = await loadFileFromDB(quiz3Data.value.coverFileInfo.fileId);
      if (fileInfo) {
        quiz3Data.value.coverFileInfo.name = fileInfo.fileName;
        quiz3Data.value.coverFileInfo.size = fileInfo.fileSize;
      }
    }
    
    if (quiz5Data.value?.appleMusicFileInfo?.fileId) {
      const fileInfo = await loadFileFromDB(quiz5Data.value.appleMusicFileInfo.fileId);
      if (fileInfo) {
        quiz5Data.value.appleMusicFileInfo.name = fileInfo.fileName;
        quiz5Data.value.appleMusicFileInfo.size = fileInfo.fileSize;
      }
    }
    
    if (quiz5Data.value?.karaokeFileInfo?.fileId) {
      const fileInfo = await loadFileFromDB(quiz5Data.value.karaokeFileInfo.fileId);
      if (fileInfo) {
        quiz5Data.value.karaokeFileInfo.name = fileInfo.fileName;
        quiz5Data.value.karaokeFileInfo.size = fileInfo.fileSize;
      }
    }
    
    console.log('All data loaded from IndexedDB:', {
      quiz1: quiz1Data.value,
      quiz2: quiz2Data.value,
      quiz3: quiz3Data.value,
      quiz4: quiz4Data.value,
      quiz5: quiz5Data.value,
      quiz6: quiz6Data.value,
      quiz7: quiz7Data.value
    });
    
    dataLoaded.value = true;
    
  } catch (error) {
    console.error('Error loading all data:', error);
    ElMessage.error('Ошибка загрузки данных');
  }
};

// Формирование структуры данных для отображения
const summaryData = computed((): AllData => {
  const data: AllData = {};
  
  // Шаг 1
  if (quiz1Data.value) {
    data.singleCount = quiz1Data.value.singleCount || 0;
    data.albumCount = quiz1Data.value.albumCount || 0;
    data.clipCount = quiz1Data.value.clipCount || 0;
    data.cardCount = quiz1Data.value.cardCount || 0;
  }
  
  // Шаг 2
  if (quiz2Data.value) {
    data.singleTracks = quiz2Data.value.singleTracks || [];
    data.albums = quiz2Data.value.albums || [];
  }
  
  // Шаг 3
  if (quiz3Data.value) {
    data.releaseInfo = quiz3Data.value.formData || {};
    if (quiz3Data.value.coverFileInfo) {
      data.coverFileName = quiz3Data.value.coverFileInfo.name || '';
      data.coverFileSize = quiz3Data.value.coverFileInfo.size || 0;
      data.coverFileId = quiz3Data.value.coverFileInfo.fileId || null;
    }
  }
  
  // Шаг 4
  if (quiz4Data.value) {
    data.userInfo = quiz4Data.value.formData || {};
  }
  
  // Шаг 5
  if (quiz5Data.value) {
    data.genreInfo = quiz5Data.value.formData || {};
    if (quiz5Data.value.appleMusicFileInfo) {
      data.appleMusicFileName = quiz5Data.value.appleMusicFileInfo.name || '';
      data.appleMusicFileSize = quiz5Data.value.appleMusicFileInfo.size || 0;
      data.appleMusicFileId = quiz5Data.value.appleMusicFileInfo.fileId || null;
    }
    if (quiz5Data.value.karaokeFileInfo) {
      data.karaokeFileName = quiz5Data.value.karaokeFileInfo.name || '';
      data.karaokeFileSize = quiz5Data.value.karaokeFileInfo.size || 0;
      data.karaokeFileId = quiz5Data.value.karaokeFileInfo.fileId || null;
    }
  }
  
  // Шаг 6
  if (quiz6Data.value) {
    data.additionalInfo = quiz6Data.value.formData || {};
    data.promoApplied = quiz6Data.value.promoApplied || false;
    data.promoDiscount = quiz6Data.value.promoDiscount || 0;
  }
  
  // Шаг 7
  if (quiz7Data.value) {
    data.agreement = quiz7Data.value.formData || {};
  }
  
  // Общее количество треков
  data.totalTracks = calculateTotalTracks(data);
  
  return data;
});

// Функция для расчета общего количества треков
const calculateTotalTracks = (data: AllData): number => {
  const singleTracksCount = data.singleTracks?.length || 0;
  let albumTracksCount = 0;
  
  if (data.albums && Array.isArray(data.albums)) {
    albumTracksCount = data.albums.reduce((total: number, album: Album) => {
      const tracksLength = album.tracks?.length || 0;
      return total + tracksLength;
    }, 0);
  }
  
  return singleTracksCount + albumTracksCount;
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Форматирование даты
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указано';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
};

// Форматирование платформ
const formatPlatforms = (platforms?: string[]): string => {
  if (!platforms || platforms.length === 0) return 'Не указано';
  return platforms.map(p => {
    switch(p) {
      case 'all': return 'Все площадки';
      case 'other': return 'Другое';
      case 'social': return 'Социальные сети';
      case 'friends': return 'Рекомендация друзей';
      case 'search': return 'Поиск в интернете';
      case 'youtube': return 'YouTube';
      case 'forums': return 'Музыкальные форумы';
      case 'previous': return 'Ранее пользовались';
      default: return p;
    }
  }).join(', ');
};

// Форматирование гражданства
const formatCitizenship = (citizenship?: string, other?: string): string => {
  if (!citizenship) return 'Не указано';
  if (citizenship === 'RU') return 'Российская Федерация';
  if (citizenship === 'other') return other || 'Другое';
  return citizenship;
};

const goBack = () => {
  emit('go-back');
};

const handleFinish = async () => {
  try {
    isLoading.value = true;
    
    // Собираем все данные
    const data = summaryData.value;
    
    console.log('Все собранные данные для отправки:', data);
    
    // Проверяем обязательные поля
    let hasErrors = false;
    const errors: string[] = [];
    
    // Проверка шага 1
    const step1Count = (data.singleCount || 0) + (data.albumCount || 0) + (data.clipCount || 0) + (data.cardCount || 0);
    if (step1Count === 0) {
      errors.push('Не выбраны треки для загрузки (шаг 1)');
      hasErrors = true;
    }
    
    // Проверка шага 2
    if (data.singleCount && data.singleCount > 0 && (!data.singleTracks || data.singleTracks.length === 0)) {
      errors.push('Не заполнены данные о синглах (шаг 2)');
      hasErrors = true;
    }
    
    if (data.albumCount && data.albumCount > 0 && (!data.albums || data.albums.length === 0)) {
      errors.push('Не заполнены данные об альбомах (шаг 2)');
      hasErrors = true;
    }
    
    // Проверка шага 3
    const performerName = data.releaseInfo?.performerName || '';
    const email = data.releaseInfo?.email || '';
    const releaseName = data.releaseInfo?.releaseName || '';
    if (!performerName || !email || !releaseName) {
      errors.push('Не заполнены обязательные поля информации о релизе (шаг 3)');
      hasErrors = true;
    }
    
    if (!data.coverFileName) {
      errors.push('Не загружена обложка релиза (шаг 3)');
      hasErrors = true;
    }
    
    // Проверка шага 4
    const lastName = data.userInfo?.lastName || '';
    const firstName = data.userInfo?.firstName || '';
    const passportNumber = data.userInfo?.passportNumber || '';
    if (!lastName || !firstName || !passportNumber) {
      errors.push('Не заполнены паспортные данные (шаг 4)');
      hasErrors = true;
    }
    
    // Проверка шага 5
    const hasDrugsMention = data.genreInfo?.hasDrugsMention || '';
    if (!hasDrugsMention) {
      errors.push('Не указано наличие упоминаний наркотических средств (шаг 5)');
      hasErrors = true;
    }
    
    const socialLinks = data.genreInfo?.socialLinks || '';
    if (!socialLinks) {
      errors.push('Не указаны ссылки на соцсети (шаг 5)');
      hasErrors = true;
    }
    
    // Проверка консистентности файлов текстов
    const hasAppleMusicFile = !!data.appleMusicFileName;
    const hasKaraokeFile = !!data.karaokeFileName;
    if ((hasAppleMusicFile && !hasKaraokeFile) || (!hasAppleMusicFile && hasKaraokeFile)) {
      errors.push('Для добавления текста трека необходимо прикрепить оба файла: docx и ttml (шаг 5)');
      hasErrors = true;
    }
    
    // Проверка шага 6
    if (!data.additionalInfo?.platforms || data.additionalInfo.platforms.length === 0) {
      errors.push('Не указано, откуда узнали о нас (шаг 6)');
      hasErrors = true;
    }
    
    const confirmNoRightsViolation = data.additionalInfo?.confirmNoRightsViolation || false;
    if (!confirmNoRightsViolation) {
      errors.push('Не подтверждено отсутствие нарушений прав (шаг 6)');
      hasErrors = true;
    }
    
    // Проверка шага 7
    const acceptTerms = data.agreement?.acceptTerms || false;
    const acceptPrivacy = data.agreement?.acceptPrivacy || false;
    if (!acceptTerms || !acceptPrivacy) {
      errors.push('Не приняты обязательные условия договора (шаг 7)');
      hasErrors = true;
    }
    
    if (hasErrors) {
      errors.forEach(error => ElMessage.error(error));
      isLoading.value = false;
      return;
    }
    
    // Подготавливаем данные для отправки на сервер
    const formData = new FormData();
    
    // Добавляем все текстовые данные
    formData.append('quizData', JSON.stringify(data));
    
    // Здесь можно добавить реальные файлы из IndexedDB
    // Но это сложно, так как файлы хранятся как Blob в IndexedDB
    // В реальном проекте нужно будет их достать и добавить в FormData
    
    // Имитация отправки на сервер
    ElMessage.info('Отправка данных на сервер...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Сохраняем финальные данные в localStorage для истории
    const finalData = {
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    localStorage.setItem('quiz_final_submission', JSON.stringify(finalData));
    
    // ⚠️⚠️⚠️ НЕ ОЧИЩАЕМ ДАННЫЕ ИЗ INDEXEDDB!
    // Данные остаются в IndexedDB для возможности возврата
    
    ElMessage.success({
      message: 'Все данные успешно отправлены!',
      duration: 3000
    });
    
    emit('finish');
    
  } catch (error) {
    console.error('Ошибка отправки данных:', error);
    ElMessage.error({
      message: 'Произошла ошибка при отправке данных',
      duration: 3000
    });
  } finally {
    isLoading.value = false;
  }
};

// Проверяем данные при монтировании
onMounted(async () => {
  try {
    await initDB();
    await loadAllData();
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});
</script>

<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Отправка данных</h4>
  
  <!-- Индикатор загрузки -->
  <div v-if="!dataLoaded" class="quiz__form_loading">
    <span>Загрузка данных...</span>
  </div>
  
  <!-- Сводка данных -->
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
        <p v-if="!summaryData.singleCount && !summaryData.albumCount && !summaryData.clipCount && !summaryData.cardCount" class="warning">
          Нет данных (шаг 1)
        </p>
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
          <p class="text_small" v-if="track.audioFileName">Аудио: {{ track.audioFileName }} ({{ formatFileSize(track.audioFileSize || 0) }})</p>
          <p class="text_small success" v-else-if="track.uploaded">Аудио загружено</p>
          <p class="text_small warning" v-else>Аудио не загружено</p>
        </div>
      </div>
    </div>
    
    <!-- Шаг 2: Альбомы -->
    <div class="quiz__summary_section" v-if="summaryData.albums && summaryData.albums.length > 0">
      <h6>Шаг 2: Альбомы ({{ summaryData.albums.length }})</h6>
      <div class="quiz__summary_content">
        <div v-for="(album, albumIndex) in summaryData.albums" :key="albumIndex" class="summary_item">
          <p><strong>Альбом {{ albumIndex + 1 }}:</strong> {{ album.albumName || 'Без названия' }}</p>
          <p class="text_small">Исполнитель: {{ album.performerName || 'Не указан' }}</p>
          <p class="text_small">Музыка: {{ album.musicAuthor || 'Не указан' }}</p>
          <p class="text_small">Текст: {{ album.textAuthor || 'Не указан' }}</p>
          <p class="text_small">Треков: {{ album.tracks?.length || 0 }}</p>
          <div v-if="album.tracks && album.tracks.length > 0" class="summary_subitem">
            <div v-for="(track, trackIndex) in album.tracks" :key="trackIndex">
              <p class="text_small"><strong>Трек {{ track.trackNumber }}:</strong> {{ track.trackName || 'Без названия' }}</p>
              <p class="text_small" v-if="track.audioFileName">Аудио: {{ track.audioFileName }} ({{ formatFileSize(track.audioFileSize || 0) }})</p>
              <p class="text_small success" v-else-if="track.uploaded">Аудио загружено</p>
              <p class="text_small warning" v-else>Аудио не загружено</p>
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
        <p><strong>Ссылка VK/Instagram:</strong> {{ summaryData.releaseInfo.vkLink || 'Не указано' }}</p>
        <p><strong>Платформы:</strong> {{ formatPlatforms(summaryData.releaseInfo.platforms) }}</p>
        <p v-if="summaryData.releaseInfo.otherPlatform"><strong>Другие платформы:</strong> {{ summaryData.releaseInfo.otherPlatform }}</p>
        <p><strong>Дата релиза:</strong> {{ formatDate(summaryData.releaseInfo.releaseDate) }}</p>
        <p><strong>Мат:</strong> {{ summaryData.releaseInfo.hasProfanity === 'yes' ? 'Да' : 'Нет' }}</p>
        <p v-if="summaryData.releaseInfo.hasProfanity === 'yes'"><strong>Треки с матом:</strong> {{ summaryData.releaseInfo.profanityTracks }}</p>
        <p v-if="summaryData.coverFileName">
          <strong>Обложка:</strong> {{ summaryData.coverFileName }} ({{ formatFileSize(summaryData.coverFileSize || 0) }})
        </p>
        <p v-else class="warning">Обложка не загружена</p>
      </div>
    </div>
    
    <!-- Шаг 4: Данные пользователя -->
    <div class="quiz__summary_section" v-if="summaryData.userInfo">
      <h6>Шаг 4: Данные пользователя</h6>
      <div class="quiz__summary_content">
        <p><strong>Тип лица:</strong> {{ summaryData.userInfo.userType === 'individual' ? 'Физическое лицо' : 'Индивидуальный предприниматель' }}</p>
        
        <!-- Данные ИП -->
        <template v-if="summaryData.userInfo.userType === 'entrepreneur'">
          <p><strong>Юридический адрес:</strong> {{ summaryData.userInfo.legalAddress || 'Не указано' }}</p>
          <p><strong>ИНН:</strong> {{ summaryData.userInfo.inn || 'Не указано' }}</p>
          <p><strong>ОГРН:</strong> {{ summaryData.userInfo.ogrn || 'Не указано' }}</p>
          <p><strong>Расчетный счет:</strong> {{ summaryData.userInfo.accountNumber || 'Не указано' }}</p>
          <p><strong>Банк:</strong> {{ summaryData.userInfo.bankName || 'Не указано' }}</p>
          <p><strong>ИНН банка:</strong> {{ summaryData.userInfo.bankInn || 'Не указано' }}</p>
          <p><strong>БИК банка:</strong> {{ summaryData.userInfo.bankBik || 'Не указано' }}</p>
          <p><strong>Корр. счет:</strong> {{ summaryData.userInfo.correspondentAccount || 'Не указано' }}</p>
          <p><strong>Юр. адрес банка:</strong> {{ summaryData.userInfo.bankLegalAddress || 'Не указано' }}</p>
        </template>
        
        <!-- Общие данные -->
        <p><strong>Гражданство:</strong> {{ formatCitizenship(summaryData.userInfo.citizenship, summaryData.userInfo.otherCitizenship) }}</p>
        <p><strong>Фамилия:</strong> {{ summaryData.userInfo.lastName || 'Не указано' }}</p>
        <p><strong>Имя:</strong> {{ summaryData.userInfo.firstName || 'Не указано' }}</p>
        <p><strong>Отчество:</strong> {{ summaryData.userInfo.middleName || 'Не указано' }}</p>
        <p><strong>Паспорт:</strong> {{ summaryData.userInfo.passportNumber || 'Не указано' }}</p>
        <p><strong>Кем выдан:</strong> {{ summaryData.userInfo.passportIssuedBy || 'Не указано' }}</p>
        <p><strong>Дата выдачи:</strong> {{ formatDate(summaryData.userInfo.passportIssueDate) }}</p>
        <p><strong>Адрес регистрации:</strong> {{ summaryData.userInfo.registrationAddress || 'Не указано' }}</p>
      </div>
    </div>
    
    <!-- Шаг 5: Жанр и текст -->
    <div class="quiz__summary_section" v-if="summaryData.genreInfo">
      <h6>Шаг 5: Жанр и текст</h6>
      <div class="quiz__summary_content">
        <p><strong>Жанр:</strong> {{ summaryData.genreInfo.genre || 'Не указано' }}</p>
        <p><strong>Секунды для TikTok:</strong> {{ summaryData.genreInfo.tiktokStartSeconds || 'Не указано' }}</p>
        <p><strong>Упоминание наркотиков:</strong> {{ summaryData.genreInfo.hasDrugsMention === 'yes' ? 'Да' : 'Нет' }}</p>
        <p v-if="summaryData.genreInfo.hasDrugsMention === 'yes'"><strong>Треки:</strong> {{ summaryData.genreInfo.drugsTracks }}</p>
        
        <p v-if="summaryData.appleMusicFileName">
          <strong>Apple Music текст:</strong> {{ summaryData.appleMusicFileName }} 
          ({{ formatFileSize(summaryData.appleMusicFileSize || 0) }})
        </p>
        <p v-if="summaryData.karaokeFileName">
          <strong>Караоке файл:</strong> {{ summaryData.karaokeFileName }} 
          ({{ formatFileSize(summaryData.karaokeFileSize || 0) }})
        </p>
        
        <p><strong>Ссылки Apple Music:</strong> {{ summaryData.genreInfo.appleMusicLinks || 'Не указано' }}</p>
        <p><strong>Ссылки Spotify:</strong> {{ summaryData.genreInfo.spotifyLinks || 'Не указано' }}</p>
        <p><strong>Ссылки VK:</strong> {{ summaryData.genreInfo.vkLinks || 'Не указано' }}</p>
        <p><strong>Ссылки Yandex Music:</strong> {{ summaryData.genreInfo.yandexMusicLinks || 'Не указано' }}</p>
        <p><strong>Ссылки на соцсети:</strong> {{ summaryData.genreInfo.socialLinks || 'Не указано' }}</p>
      </div>
    </div>
    
    <!-- Шаг 6: Дополнительная информация -->
    <div class="quiz__summary_section" v-if="summaryData.additionalInfo">
      <h6>Шаг 6: Дополнительная информация</h6>
      <div class="quiz__summary_content">
        <p><strong>Откуда узнали:</strong> {{ formatPlatforms(summaryData.additionalInfo.platforms) }}</p>
        <p v-if="summaryData.additionalInfo.otherPlatform"><strong>Другое:</strong> {{ summaryData.additionalInfo.otherPlatform }}</p>
        <p><strong>Права на инструменты:</strong></p>
        <pre class="text_small">{{ summaryData.additionalInfo.rightsInfo || 'Не указано' }}</pre>
        <p><strong>Ссылка на договор:</strong> {{ summaryData.additionalInfo.rightsContractLink || 'Не указано' }}</p>
        <p><strong>Доп. комментарии:</strong> {{ summaryData.additionalInfo.additionalComments || 'Не указано' }}</p>
        <p><strong>Промо-план:</strong> {{ summaryData.additionalInfo.promoPlan || 'Не указано' }}</p>
        <p><strong>Bandlink:</strong> {{ summaryData.additionalInfo.bandlinkUrl || 'Не указано' }}</p>
        <p><strong>Промокод:</strong> {{ summaryData.additionalInfo.promoCode || 'Не указано' }}</p>
        <p v-if="summaryData.promoApplied"><strong>Скидка по промокоду:</strong> {{ summaryData.promoDiscount }}%</p>
        <p><strong>Использовано бонусов:</strong> {{ summaryData.additionalInfo.usedBonuses || 0 }}</p>
        <p>
          <strong>Подтверждение прав:</strong> 
          <span :class="summaryData.additionalInfo.confirmNoRightsViolation ? 'success' : 'warning'">
            {{ summaryData.additionalInfo.confirmNoRightsViolation ? 'Да' : 'Нет' }}
          </span>
        </p>
      </div>
    </div>
    
    <!-- Шаг 7: Договор -->
    <div class="quiz__summary_section" v-if="summaryData.agreement">
      <h6>Шаг 7: Договор</h6>
      <div class="quiz__summary_content">
        <p>
          <strong>Условия оферты:</strong> 
          <span :class="summaryData.agreement.acceptTerms ? 'success' : 'warning'">
            {{ summaryData.agreement.acceptTerms ? 'Принято' : 'Не принято' }}
          </span>
        </p>
        <p>
          <strong>Обработка персональных данных:</strong> 
          <span :class="summaryData.agreement.acceptPrivacy ? 'success' : 'warning'">
            {{ summaryData.agreement.acceptPrivacy ? 'Согласие дано' : 'Не дано' }}
          </span>
        </p>
        <p>
          <strong>Рекламные рассылки:</strong> 
          <span :class="summaryData.agreement.acceptMarketing ? 'success' : ''">
            {{ summaryData.agreement.acceptMarketing ? 'Согласие дано' : 'Не дано' }}
          </span>
        </p>
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
        @click="handleFinish"
        :disabled="isLoading || !dataLoaded"
      >
        <span v-if="!isLoading">Отправить данные</span>
        <span v-else>Отправка...</span>
      </button>
    </div>
    
    <div class="quiz__form_hint">
      <p class="text_small">
        Нажмите кнопку выше для отправки всех данных из всех форм, включая файлы.
        Перед отправкой проверьте все данные в сводке.
      </p>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form_loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
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
  color: var(--text-color);
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

.error {
  color: #f56c6c;
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

.quiz__form_hint {
  margin-top: 15px;
  padding: 10px;
  background-color: var(--bg-light);
  border-radius: 4px;
  text-align: center;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: var(--bg-light);
  padding: 8px;
  border-radius: 4px;
  margin-top: 5px;
  font-family: inherit;
}

@media (max-width: 767px) {
  .quiz__summary {
    padding: 15px;
    max-height: 400px;
  }
  
  .quiz__summary_content {
    padding-left: 10px;
  }
}
</style>