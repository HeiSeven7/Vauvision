<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElInput, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для localStorage
const STORAGE_KEY = 'quiz2_state';

// Локальные состояния
const isLoadingTwo = ref(false);
const showImportantBlock = ref(false);

// Запрещенные слова
const forbiddenWords = ['нет', 'такой', 'информации', 'не', 'знаю', 'откуда'];

// Ошибки валидации для синглов
const singleErrors = ref<Array<{
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  trackName: string;
  audioFile: string;
}>>([]);

// Ошибки валидации для альбомов
const albumErrors = ref<Array<{
  albumName: string;
  tracks: Array<{
    performerName: string;
    musicAuthor: string;
    textAuthor: string;
    trackName: string;
    audioFile: string;
  }>;
}>>([]);

// Тип для трека альбома
interface AlbumTrack {
  id: string;
  trackNumber: number;
  trackName: string;
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  audioFile: File | null;
  audioFileName: string;
  audioFileSize: number;
  audioFileBase64: string;
  uploaded: boolean;
}

// Данные для синглов
const singleTracks = ref<Array<{
  id: string;
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  trackName: string;
  audioFile: File | null;
  audioFileName: string;
  audioFileSize: number;
  audioFileBase64: string;
  uploaded: boolean;
  hasAudioUploaded: boolean;
}>>([]);

// Данные для альбомов
const albums = ref<Array<{
  id: string;
  albumName: string;
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  tracks: AlbumTrack[];
}>>([]);

// Флаг загрузки данных
const dataLoaded = ref(false);

// Функция для конвертации File в base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Функция для конвертации base64 в File
const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const arr = base64.split(',');
  const bstr = atob(arr[1] || arr[0]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mimeType });
};

// Функция для извлечения MIME типа из base64
const getMimeTypeFromBase64 = (base64: string): string => {
  const match = base64.match(/^data:(.*?);base64,/);
  return match ? match[1] : 'audio/mpeg';
};

// Сохранение состояния в localStorage
const saveStateToLocalStorage = async () => {
  try {
    // Сохраняем текстовые данные и информацию о файлах
    const stateToSave = {
      singleTracks: singleTracks.value.map(track => ({
        id: track.id,
        performerName: track.performerName,
        musicAuthor: track.musicAuthor,
        textAuthor: track.textAuthor,
        trackName: track.trackName,
        audioFileName: track.audioFileName,
        audioFileSize: track.audioFileSize,
        audioFileBase64: track.audioFileBase64,
        uploaded: track.uploaded,
        hasAudioUploaded: track.hasAudioUploaded
      })),
      albums: albums.value.map(album => ({
        id: album.id,
        albumName: album.albumName,
        performerName: album.performerName,
        musicAuthor: album.musicAuthor,
        textAuthor: album.textAuthor,
        tracks: album.tracks.map(track => ({
          id: track.id,
          trackNumber: track.trackNumber,
          trackName: track.trackName,
          performerName: track.performerName,
          musicAuthor: track.musicAuthor,
          textAuthor: track.textAuthor,
          audioFileName: track.audioFileName,
          audioFileSize: track.audioFileSize,
          audioFileBase64: track.audioFileBase64,
          uploaded: track.uploaded
        }))
      }))
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    console.log('State saved to localStorage');
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
    ElMessage.error('Ошибка при сохранении данных');
  }
};

// Загрузка состояния из localStorage
const loadStateFromLocalStorage = async () => {
  try {
    // Загружаем состояние шага 2
    const savedState = localStorage.getItem(STORAGE_KEY);
    const counts = getCountsFromQuiz1();
    
    // Если нет сохраненного состояния, инициализируем из Quiz1
    if (!savedState) {
      return;
    }
    
    const parsedState = JSON.parse(savedState);
    
    // Загружаем синглы только если они выбраны в Quiz1
    if (counts.singleCount > 0 && parsedState.singleTracks && parsedState.singleTracks.length > 0) {
      singleTracks.value = await Promise.all(
        parsedState.singleTracks.map(async (track: any) => {
          let audioFile = null;
          if (track.audioFileBase64) {
            try {
              const mimeType = getMimeTypeFromBase64(track.audioFileBase64);
              audioFile = base64ToFile(track.audioFileBase64, track.audioFileName, mimeType);
            } catch (error) {
              console.error('Error converting base64 to file:', error);
            }
          }
          
          return {
            id: track.id || `single-${Date.now()}-${Math.random()}`,
            performerName: track.performerName || '',
            musicAuthor: track.musicAuthor || '',
            textAuthor: track.textAuthor || '',
            trackName: track.trackName || '',
            audioFile: audioFile,
            audioFileName: track.audioFileName || '',
            audioFileSize: track.audioFileSize || 0,
            audioFileBase64: track.audioFileBase64 || '',
            uploaded: track.uploaded || false,
            hasAudioUploaded: track.hasAudioUploaded || false
          };
        })
      );
      
      // Инициализируем ошибки для синглов
      singleErrors.value = singleTracks.value.map(() => ({
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        trackName: '',
        audioFile: ''
      }));
    } else {
      // Если синглы не выбраны в Quiz1, очищаем данные
      singleTracks.value = [];
      singleErrors.value = [];
    }
    
    // Загружаем альбомы только если они выбраны в Quiz1
    if (counts.albumCount > 0 && parsedState.albums && parsedState.albums.length > 0) {
      albums.value = await Promise.all(
        parsedState.albums.map(async (album: any) => ({
          id: album.id || `album-${Date.now()}-${Math.random()}`,
          albumName: album.albumName || '',
          performerName: album.performerName || '',
          musicAuthor: album.musicAuthor || '',
          textAuthor: album.textAuthor || '',
          tracks: await Promise.all(
            (album.tracks || []).map(async (track: any) => {
              let audioFile = null;
              if (track.audioFileBase64) {
                try {
                  const mimeType = getMimeTypeFromBase64(track.audioFileBase64);
                  audioFile = base64ToFile(track.audioFileBase64, track.audioFileName, mimeType);
                } catch (error) {
                  console.error('Error converting base64 to file:', error);
                }
              }
              
              return {
                id: track.id || `album-track-${Date.now()}-${Math.random()}`,
                trackNumber: track.trackNumber || 1,
                trackName: track.trackName || '',
                performerName: track.performerName || album.performerName || '',
                musicAuthor: track.musicAuthor || album.musicAuthor || '',
                textAuthor: track.textAuthor || album.textAuthor || '',
                audioFile: audioFile,
                audioFileName: track.audioFileName || '',
                audioFileSize: track.audioFileSize || 0,
                audioFileBase64: track.audioFileBase64 || '',
                uploaded: track.uploaded || false
              };
            })
          )
        }))
      );
      
      // Инициализируем ошибки для альбомов
      albumErrors.value = albums.value.map(album => ({
        albumName: '',
        tracks: album.tracks.map(() => ({
          performerName: '',
          musicAuthor: '',
          textAuthor: '',
          trackName: '',
          audioFile: ''
        }))
      }));
    } else {
      // Если альбомы не выбраны в Quiz1, очищаем данные
      albums.value = [];
      albumErrors.value = [];
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    ElMessage.error('Ошибка при загрузке сохраненных данных');
  }
};

// Получение количества синглов и альбомов из Quiz1
const getCountsFromQuiz1 = () => {
  try {
    const quiz1State = localStorage.getItem('quiz1_state');
    if (quiz1State) {
      const parsedQuiz1State = JSON.parse(quiz1State);
      return {
        singleCount: parsedQuiz1State.singleCount || 0,
        albumCount: parsedQuiz1State.albumCount || 0
      };
    }
  } catch (error) {
    console.error('Error reading quiz1 state:', error);
  }
  return { singleCount: 0, albumCount: 0 };
};

// Инициализация данных на основе количества из Quiz1
const initializeDataFromQuiz1 = () => {
  const counts = getCountsFromQuiz1();
  console.log('Counts from Quiz1:', counts);
  
  // ОЧИЩАЕМ существующие данные, если выбор изменился
  const shouldHaveSingles = counts.singleCount > 0;
  const shouldHaveAlbums = counts.albumCount > 0;
  
  // Если синглы не выбраны в Quiz1, но есть данные в singleTracks - очищаем
  if (!shouldHaveSingles && singleTracks.value.length > 0) {
    console.log('Clearing single tracks because no singles selected in Quiz1');
    singleTracks.value = [];
    singleErrors.value = [];
  }
  
  // Если альбомы не выбраны в Quiz1, но есть данные в albums - очищаем
  if (!shouldHaveAlbums && albums.value.length > 0) {
    console.log('Clearing albums because no albums selected in Quiz1');
    albums.value = [];
    albumErrors.value = [];
  }
  
  // Создаем синглы только если они выбраны в Quiz1 И еще не созданы
  if (shouldHaveSingles && singleTracks.value.length === 0) {
    console.log(`Creating ${counts.singleCount} single tracks`);
    for (let i = 0; i < counts.singleCount; i++) {
      singleTracks.value.push({
        id: `single-${Date.now()}-${i}-${Math.random()}`,
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        trackName: '',
        audioFile: null,
        audioFileName: '',
        audioFileSize: 0,
        audioFileBase64: '',
        uploaded: false,
        hasAudioUploaded: false
      });
    }
    
    // Инициализируем ошибки для синглов
    singleErrors.value = singleTracks.value.map(() => ({
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      trackName: '',
      audioFile: ''
    }));
  }
  
  // Создаем альбомы только если они выбраны в Quiz1 И еще не созданы
  if (shouldHaveAlbums && albums.value.length === 0) {
    console.log(`Creating ${counts.albumCount} albums`);
    for (let i = 0; i < counts.albumCount; i++) {
      albums.value.push({
        id: `album-${Date.now()}-${i}-${Math.random()}`,
        albumName: '',
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        tracks: []
      });
    }
    
    // Инициализируем ошибки для альбомов
    albumErrors.value = albums.value.map(album => ({
      albumName: '',
      tracks: album.tracks.map(() => ({
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        trackName: '',
        audioFile: ''
      }))
    }));
  }
};

// Проверка, нужно ли показывать секцию синглов
const showSinglesSection = computed(() => {
  const counts = getCountsFromQuiz1();
  // Показываем только если синглы выбраны в Quiz1
  return counts.singleCount > 0;
});

// Проверка, нужно ли показывать секцию альбомов
const showAlbumsSection = computed(() => {
  const counts = getCountsFromQuiz1();
  // Показываем только если альбомы выбраны в Quiz1
  return counts.albumCount > 0;
});

// Проверка готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем все синглы
  const allSinglesComplete = singleTracks.value.every((track, index) => 
    track.trackName.trim().split(/\s+/).length >= 2 &&
    track.audioFile !== null &&
    track.uploaded &&
    track.performerName.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.performerName &&
    track.musicAuthor.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.musicAuthor &&
    track.textAuthor.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.textAuthor
  );

  // Проверяем все альбомы
  const allAlbumsComplete = albums.value.every((album, albumIndex) =>
    album.albumName.trim().split(/\s+/).length >= 3 &&
    album.tracks.length > 0 &&
    album.tracks.every((track, trackIndex) =>
      track.trackName.trim().split(/\s+/).length >= 2 &&
      track.audioFile !== null &&
      track.uploaded &&
      track.performerName.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.performerName &&
      track.musicAuthor.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.musicAuthor &&
      track.textAuthor.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.textAuthor
    )
  );

  const counts = getCountsFromQuiz1();
  return (counts.singleCount === 0 || allSinglesComplete) && 
         (counts.albumCount === 0 || allAlbumsComplete);
});

// Проверка на запрещенные слова
const checkForbiddenWords = (value: string): boolean => {
  if (!value.trim()) return false;
  
  const lowerValue = value.toLowerCase();
  return forbiddenWords.some(word => 
    lowerValue.includes(` ${word} `) || 
    lowerValue.startsWith(`${word} `) || 
    lowerValue.endsWith(` ${word}`) ||
    lowerValue === word
  );
};

// Проверка минимального количества слов
const checkMinWords = (value: string, minWords: number): boolean => {
  if (!value.trim()) return false;
  return value.trim().split(/\s+/).length >= minWords;
};

// Валидация поля исполнителей для сингла
const validateSinglePerformerName = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].performerName;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО исполнителя обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО исполнителя должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО исполнителей" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].performerName = error;
  return !error;
};

// Валидация поля автора музыки для сингла
const validateSingleMusicAuthor = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].musicAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора музыки обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора музыки должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов музыки" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].musicAuthor = error;
  return !error;
};

// Валидация поля автора текста для сингла
const validateSingleTextAuthor = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].textAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора текста обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора текста должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов текста" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].textAuthor = error;
  return !error;
};

// Валидация поля названия трека для сингла
const validateSingleTrackName = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].trackName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название трека обязательно для заполнения';
  } else if (!checkMinWords(value, 2)) {
    error = 'Название трека должно содержать минимум 2 слова';
  }
  
  singleErrors.value[trackIndex].trackName = error;
  return !error;
};

// Валидация формы сингла
const validateSingleForm = async (trackIndex: number) => {
  let isValid = true;
  
  // Проверяем все поля по отдельности
  if (!validateSinglePerformerName(trackIndex)) isValid = false;
  if (!validateSingleMusicAuthor(trackIndex)) isValid = false;
  if (!validateSingleTextAuthor(trackIndex)) isValid = false;
  if (!validateSingleTrackName(trackIndex)) isValid = false;
  
  // Валидация аудио файла
  if (!singleTracks.value[trackIndex].audioFile) {
    singleErrors.value[trackIndex].audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  } else {
    singleErrors.value[trackIndex].audioFile = '';
  }
  
  // Сохраняем состояние после валидации
  if (isValid) {
    await saveStateToLocalStorage();
  }
  
  return isValid;
};

// Валидация поля исполнителей для трека альбома
const validateAlbumTrackPerformerName = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].performerName;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО исполнителя обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО исполнителя должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО исполнителей" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].performerName = error;
  return !error;
};

// Валидация поля автора музыки для трека альбома
const validateAlbumTrackMusicAuthor = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].musicAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора музыки обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора музыки должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов музыки" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].musicAuthor = error;
  return !error;
};

// Валидация поля автора текста для трека альбома
const validateAlbumTrackTextAuthor = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].textAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора текста обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора текста должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов текста" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].textAuthor = error;
  return !error;
};

// Валидация поля названия трека для трека альбома
const validateAlbumTrackTrackName = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].trackName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название трека обязательно для заполнения';
  } else if (!checkMinWords(value, 2)) {
    error = 'Название трека должно содержать минимум 2 слова';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].trackName = error;
  return !error;
};

// Валидация поля названия альбома
const validateAlbumName = (albumIndex: number) => {
  const value = albums.value[albumIndex].albumName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название альбома обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'Название альбома должно содержать минимум 3 слова';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "Название альбома" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].albumName = error;
  return !error;
};

// Валидация формы альбома
const validateAlbumForm = async (albumIndex: number) => {
  let isValid = true;
  
  // Проверяем название альбома
  if (!validateAlbumName(albumIndex)) isValid = false;
  
  // Валидация наличия треков
  if (albums.value[albumIndex].tracks.length === 0) {
    isValid = false;
  }
  
  // Сохраняем состояние после валидации
  if (isValid) {
    await saveStateToLocalStorage();
  }
  
  return isValid;
};

// Валидация формы трека альбома
const validateAlbumTrackForm = async (albumIndex: number, trackIndex: number) => {
  let isValid = true;
  
  // Проверяем все поля по отдельности
  if (!validateAlbumTrackPerformerName(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackMusicAuthor(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackTextAuthor(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackTrackName(albumIndex, trackIndex)) isValid = false;
  
  // Валидация аудио файла
  if (!albums.value[albumIndex].tracks[trackIndex].audioFile) {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  } else {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
  }
  
  // Сохраняем состояние после валидации
  if (isValid) {
    await saveStateToLocalStorage();
  }
  
  return isValid;
};

// Обработка загрузки аудио файла для сингла
const handleSingleAudioUpload = async (trackIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Валидация типа файла
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    singleErrors.value[trackIndex].audioFile = 'Недопустимый формат файла. Разрешенные форматы: MP3, WAV, FLAC, AAC, OGG';
    ElMessage.error('Недопустимый формат аудио файла');
    return;
  }
  
  // Валидация размера файла (макс 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    singleErrors.value[trackIndex].audioFile = 'Файл слишком большой. Максимальный размер: 50MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  try {
    isLoadingTwo.value = true;
    
    // Конвертируем файл в base64
    const base64 = await fileToBase64(file);
    
    // Сохраняем данные файла
    singleTracks.value[trackIndex].audioFile = file;
    singleTracks.value[trackIndex].audioFileName = file.name;
    singleTracks.value[trackIndex].audioFileSize = file.size;
    singleTracks.value[trackIndex].audioFileBase64 = base64;
    singleTracks.value[trackIndex].uploaded = true;
    singleTracks.value[trackIndex].hasAudioUploaded = true;
    
    // Очищаем ошибку аудио файла для этого трека
    singleErrors.value[trackIndex].audioFile = '';
    
    // Проверяем валидацию всех полей после загрузки
    validateSingleForm(trackIndex);
    
    // Сохраняем состояние
    await saveStateToLocalStorage();
    
    // Сбрасываем input
    target.value = '';
    
    ElMessage.success('Аудио файл успешно загружен');
  } catch (error) {
    console.error('Error uploading file:', error);
    ElMessage.error('Ошибка при загрузке файла');
  } finally {
    isLoadingTwo.value = false;
  }
};

// Обработка загрузки аудио файла для трека альбома
const handleAlbumTrackUpload = async (albumIndex: number, trackIndex: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Валидация типа файла
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = 'Недопустимый формат файла. Разрешенные форматы: MP3, WAV, FLAC, AAC, OGG';
    ElMessage.error('Недопустимый формат аудио файла');
    return;
  }
  
  // Валидация размера файла (макс 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = 'Файл слишком большой. Максимальный размер: 50MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  try {
    isLoadingTwo.value = true;
    
    // Конвертируем файл в base64
    const base64 = await fileToBase64(file);
    
    // Обновляем данные трека
    if (albumIndex >= 0 && albumIndex < albums.value.length) {
      const album = albums.value[albumIndex];
      if (trackIndex >= 0 && trackIndex < album.tracks.length) {
        album.tracks[trackIndex].audioFile = file;
        album.tracks[trackIndex].audioFileName = file.name;
        album.tracks[trackIndex].audioFileSize = file.size;
        album.tracks[trackIndex].audioFileBase64 = base64;
        album.tracks[trackIndex].uploaded = true;
        
        // Очищаем ошибку аудио файла для этого трека
        albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
        
        // Проверяем валидацию трека после загрузки
        await validateAlbumTrackForm(albumIndex, trackIndex);
        
        // Сбрасываем input
        target.value = '';
        
        ElMessage.success(`Трек ${trackIndex + 1} успешно загружен`);
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    ElMessage.error('Ошибка при загрузке файла');
  } finally {
    isLoadingTwo.value = false;
  }
};

// Обработка клика по кнопке загрузки для сингла
const handleSingleUploadButtonClick = (trackIndex: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.style.display = 'none';
  input.onchange = (event) => handleSingleAudioUpload(trackIndex, event);
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Обработка клика по кнопке загрузки для трека альбома
const handleAlbumTrackButtonClick = (albumIndex: number, trackIndex: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.style.display = 'none';
  input.onchange = (event) => handleAlbumTrackUpload(albumIndex, trackIndex, event);
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Добавить новый трек в альбом
const addAlbumTrack = async (albumIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    const newTrackNumber = album.tracks.length + 1;
    
    album.tracks.push({
      id: `album-track-${Date.now()}-${Math.random()}`,
      trackNumber: newTrackNumber,
      trackName: '',
      performerName: album.performerName || '',
      musicAuthor: album.musicAuthor || '',
      textAuthor: album.textAuthor || '',
      audioFile: null,
      audioFileName: '',
      audioFileSize: 0,
      audioFileBase64: '',
      uploaded: false
    });
    
    // Добавляем структуру ошибок для нового трека
    albumErrors.value[albumIndex].tracks.push({
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      trackName: '',
      audioFile: ''
    });
    
    // Сохраняем состояние
    await saveStateToLocalStorage();
    
    ElMessage.info('Трек добавлен в альбом');
  }
};

// Удалить трек из альбома
const removeAlbumTrack = async (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      album.tracks.splice(trackIndex, 1);
      // Удаляем ошибки для этого трека
      albumErrors.value[albumIndex].tracks.splice(trackIndex, 1);
      
      // Обновляем номера треков
      album.tracks.forEach((track, index) => {
        track.trackNumber = index + 1;
      });
      
      // Сохраняем состояние
      await saveStateToLocalStorage();
      
      ElMessage.info('Трек удален из альбома');
    }
  }
};

// Удаление загруженного аудио для сингла
const removeSingleUploadedAudio = async (trackIndex: number) => {
  singleTracks.value[trackIndex].audioFile = null;
  singleTracks.value[trackIndex].audioFileName = '';
  singleTracks.value[trackIndex].audioFileSize = 0;
  singleTracks.value[trackIndex].audioFileBase64 = '';
  singleTracks.value[trackIndex].uploaded = false;
  singleTracks.value[trackIndex].hasAudioUploaded = false;
  
  // Очищаем ошибку аудио файла
  singleErrors.value[trackIndex].audioFile = '';
  
  // Сохраняем состояние
  await saveStateToLocalStorage();
  
  ElMessage.info('Аудио файл удален');
};

// Удаление загруженного аудио для трека альбома
const removeAlbumTrackAudio = async (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      album.tracks[trackIndex].audioFile = null;
      album.tracks[trackIndex].audioFileName = '';
      album.tracks[trackIndex].audioFileSize = 0;
      album.tracks[trackIndex].audioFileBase64 = '';
      album.tracks[trackIndex].uploaded = false;
      
      // Очищаем ошибку аудио файла для этого трека
      albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
      
      // Сохраняем состояние
      await saveStateToLocalStorage();
      
      ElMessage.info('Аудио файл трека удален');
    }
  }
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Функция для валидации сингла при изменении полей
const validateSingleOnChange = (trackIndex: number, field: string) => {
  switch (field) {
    case 'performerName':
      validateSinglePerformerName(trackIndex);
      break;
    case 'musicAuthor':
      validateSingleMusicAuthor(trackIndex);
      break;
    case 'textAuthor':
      validateSingleTextAuthor(trackIndex);
      break;
    case 'trackName':
      validateSingleTrackName(trackIndex);
      break;
  }
  saveStateToLocalStorage();
};

// Функция для валидации трека альбома при изменении полей
const validateAlbumTrackOnChange = (albumIndex: number, trackIndex: number, field: string) => {
  switch (field) {
    case 'performerName':
      validateAlbumTrackPerformerName(albumIndex, trackIndex);
      break;
    case 'musicAuthor':
      validateAlbumTrackMusicAuthor(albumIndex, trackIndex);
      break;
    case 'textAuthor':
      validateAlbumTrackTextAuthor(albumIndex, trackIndex);
      break;
    case 'trackName':
      validateAlbumTrackTrackName(albumIndex, trackIndex);
      break;
  }
  saveStateToLocalStorage();
};

// Функция для валидации названия альбома при изменении
const validateAlbumNameOnChange = (albumIndex: number) => {
  validateAlbumName(albumIndex);
  saveStateToLocalStorage();
};

const goBack = async () => {
  if (showImportantBlock.value) {
    // Если показываем блок important, возвращаемся к форме
    showImportantBlock.value = false;
  } else {
    // Сохраняем текущее состояние перед переходом назад
    await saveStateToLocalStorage();
    emit('go-back');
  }
};

const handleContinue = async () => {
  // Проверяем все формы
  let allValid = true;
  
  // Проверяем синглы
  for (let i = 0; i < singleTracks.value.length; i++) {
    if (!await validateSingleForm(i)) {
      allValid = false;
    }
  }
  
  // Проверяем альбомы
  for (let albumIndex = 0; albumIndex < albums.value.length; albumIndex++) {
    const album = albums.value[albumIndex];
    
    if (!await validateAlbumForm(albumIndex)) {
      allValid = false;
    }
    
    // Проверяем треки альбома
    for (let trackIndex = 0; trackIndex < album.tracks.length; trackIndex++) {
      if (!await validateAlbumTrackForm(albumIndex, trackIndex)) {
        allValid = false;
      }
    }
  }
  
  if (allValid) {
    await saveStateToLocalStorage();
    // Показываем блок с важной информацией
    showImportantBlock.value = true;
  } else {
    ElMessage.error('Пожалуйста, заполните все обязательные поля и загрузите аудио файлы');
  }
};

const handleAccept = async () => {
  try {
    // Сохраняем финальное состояние перед переходом
    await saveStateToLocalStorage();
    
    // Принимаем условия и переходим к третьему шагу
    emit('go-next');
  } catch (error) {
    console.error('Error accepting conditions:', error);
    ElMessage.error('Ошибка при переходе к следующему шагу');
  }
};

// При монтировании загружаем состояние и инициализируем данные
onMounted(async () => {
  try {
    isLoadingTwo.value = true;
    await loadStateFromLocalStorage();
    initializeDataFromQuiz1();
    dataLoaded.value = true;
    console.log('Component mounted, data loaded:', {
      singles: singleTracks.value.length,
      albums: albums.value.length,
      showSingles: showSinglesSection.value,
      showAlbums: showAlbumsSection.value
    });
  } catch (error) {
    console.error('Error in onMounted:', error);
    ElMessage.error('Ошибка при загрузке данных');
  } finally {
    isLoadingTwo.value = false;
  }
});

// Сохраняем состояние при покидании страницы
window.addEventListener('beforeunload', async () => {
  await saveStateToLocalStorage();
});

// Сохраняем состояние при изменении видимости вкладки
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    await saveStateToLocalStorage();
  }
});
</script>

<template>
<div class="quiz__form quiz__form_two" v-if="!showImportantBlock">
  <div class="quiz__form_top">
    <h4 class="quiz__form_head">Загрузка синглов и альбомов</h4>
    <button class="quiz__additional button__second button">
      <span>Дополнительная информация</span>
    </button>
  </div>
  
  <div class="quiz__form_two_empty">
    <div class="quiz__form_two_lists">
      <p class="quiz__form_two_description text_small">Отметить артистов можно 3 способами:</p>
      <ul class="quiz__form_two_list">
        <li class="quiz__form_two_item">
          <p class="quiz__form_two_description text_small">Артист 1, Артист 2 (через запятую). Тогда оба артиста будут считаться основными, у всех появится своя карточка артиста, в которые попадёт релиз (либо попадёт в существующие, если карточки уже есть).</p>
        </li>
        <li class="form__hint_item">
          <p class="form__hint text_small">Артист 1 feat Артист 2. Тут второй артист будет считаться второстепенным, релиз не отобразится у него в карточке. Если у Артист 2 нет карточки, то новая ему не создастся.</p>
        </li>
        <li class="form__hint_item">
          <p class="form__hint text_small">Артист 1 & Артист 2. В таком случае оба артиста будут считаться коллективом, для которого создастся отдельная карточка. У каждого артиста по отдельности карточки не будет, а релиз в них не попадёт.</p>
        </li>
      </ul>
      <p class="quiz__form_two_description text_small">Это все возможные варианты, отмечать артистов через "х" или другие знаки нельзя - площадки не принимают подобные релизы.</p>
      <p class="quiz__form_two_description text_small">Если вы хотите, чтобы рядом с названием трека серым цветом отображался Prod. by, то укажите это в скобках названия трека.</p>
    </div>
  </div>
  
  <!-- СИНГЛЫ -->
  <div class="quiz__section" v-if="showSinglesSection && dataLoaded">
    <h4 class="quiz__section_title">Синглы</h4>
    
    <div class="quiz__singles_list" v-if="singleTracks.length > 0">
      <div 
        v-for="(track, trackIndex) in singleTracks" 
        :key="track.id"
        class="quiz__single_item"
      >
        <h5 class="quiz__single_item_title">Сингл {{ trackIndex + 1 }}</h5>
        
        <!-- Информация о загруженном аудио -->
        <div class="quiz__form_single_audio_info" v-if="track.hasAudioUploaded">
          <div class="quiz__form_single_name">
            <div class="quiz__form_single_name_left">
              <p class="quiz__form_single_name_text">{{ track.audioFileName }}</p>
              <p class="quiz__form_single_name_size text_small">{{ formatFileSize(track.audioFileSize) }}</p>
            </div>
            <div class="quiz__form_single_name_svg" @click="removeSingleUploadedAudio(trackIndex)">
              <CloseSVG />
            </div>
          </div>
        </div>
        
        <!-- Форма с полями для сингла -->
        <div class="form__flex" v-if="track.hasAudioUploaded">
          <div class="form__group">
            <label class="form__label button">ФИО исполнителей<span>*</span></label>
            <el-input
              v-model="track.performerName"
              type="text"
              placeholder="Введите ФИО исполнителя"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateSingleOnChange(trackIndex, 'performerName')"
              @blur="validateSinglePerformerName(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.performerName" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].performerName }}
            </div>
          </div>
          
          <div class="form__group">
            <label class="form__label button">ФИО авторов музыки<span>*</span></label>
            <el-input
              v-model="track.musicAuthor"
              type="text"
              placeholder="Введите ФИО автора музыки"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateSingleOnChange(trackIndex, 'musicAuthor')"
              @blur="validateSingleMusicAuthor(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.musicAuthor" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].musicAuthor }}
            </div>
          </div>
          
          <div class="form__group">
            <label class="form__label button">ФИО авторов текста<span>*</span></label>
            <el-input
              v-model="track.textAuthor"
              type="text"
              placeholder="Введите ФИО автора текста"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateSingleOnChange(trackIndex, 'textAuthor')"
              @blur="validateSingleTextAuthor(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.textAuthor" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].textAuthor }}
            </div>
          </div>
          
          <div class="form__group">
            <label class="form__label button">полное название трека<span>*</span></label>
            <ul class="form__hint_list">
              <li class="form__hint_item">
                <p class="form__hint text_small">Укажите полное название трека, включая псевдонимы и версии. Если загружаете альбом, то напишите номер каждого трека.</p>
              </li>
              <li class="form__hint_item">
                <p class="form__hint text_small">Например: «1. Artist 1, Artist 2 – Best Song (Prod. by Beatmaker)»</p>
              </li>
              <li class="form__hint_item">
                <p class="form__hint text_small">Не должно быть изображений/фотографий популярных людей или персонажей, если на это нет документального подтверждения правообладателя.</p>
              </li>
              <li class="form__hint_item">
                <p class="form__hint text_small">Если название на русском языке, не допускается писать «Каждое Слово С Большой Буквы». (название может быть написано «полностью маленькими буквами»).</p>
              </li>
              <li class="form__hint_item">
                <p class="form__hint text_small">Писать названия транслитом нельзя (например, нельзя писать «privet». Либо «Привет», либо «Hello»).</p>
              </li>
              <li class="form__hint_item">
                <p class="form__hint text_small">Использовать в названии треков 2+ языков нельзя (например, нельзя «Дорога to Success»)</p>
              </li>
            </ul>
            <el-input
              v-model="track.trackName"
              type="text"
              placeholder="Введите название трека"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateSingleOnChange(trackIndex, 'trackName')"
              @blur="validateSingleTrackName(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.trackName" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].trackName }}
            </div>
          </div>
        </div>
        
        <!-- Кнопка загрузки аудио для сингла -->
        <div class="quiz__form_single_buttons" v-if="!track.hasAudioUploaded">
          <button 
            class="quiz__form_single_button button__red button" 
            @click="() => handleSingleUploadButtonClick(trackIndex)"
            :disabled="isLoadingTwo"
          >
            <span v-if="!isLoadingTwo">добавить трек</span>
            <span v-else>Загрузка...</span>
          </button>
        </div>
        
        <!-- Сообщение об ошибке загрузки аудио -->
        <div v-if="singleErrors[trackIndex]?.audioFile && !track.hasAudioUploaded" class="error text_very quiz__form_single_error">
          {{ singleErrors[trackIndex].audioFile }}
        </div>
      </div>
    </div>
  </div>
  
  <!-- АЛЬБОМЫ -->
  <div class="quiz__section" v-if="showAlbumsSection && dataLoaded">
    <div class="quiz__albums_list" v-if="albums.length > 0">
      <div 
        v-for="(album, albumIndex) in albums" 
        :key="album.id"
        class="quiz__album_item"
      >
        <h5 class="quiz__album_item_title">Альбом {{ albumIndex + 1 }}</h5>
        
        <!-- Основная информация об альбоме -->
        <div class="form__flex">
          <div class="form__group">
            <label class="form__label button">Название альбома<span>*</span></label>
            <el-input
              v-model="album.albumName"
              type="text"
              placeholder="Введите название альбома"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateAlbumNameOnChange(albumIndex)"
              @blur="validateAlbumName(albumIndex)"
            />
            <div v-if="albumErrors[albumIndex]?.albumName" class="error text_very quiz__form_single_error">
              {{ albumErrors[albumIndex].albumName }}
            </div>
          </div>
        </div>
        
        <!-- Треки альбома -->
        <div class="quiz__album_tracks">
          <div class="quiz__album_tracks_list">
            <div 
              v-for="(track, trackIndex) in album.tracks" 
              :key="track.id"
              class="quiz__album_track_item"
            >
              <div class="quiz__album_track_header" v-if="album.tracks.length > 1">
                <button 
                  class="quiz__album_track_remove button__red button"
                  @click="removeAlbumTrack(albumIndex, trackIndex)"
                >
                  <span>Удалить</span>
                </button>
              </div>
              
              <!-- Информация о загруженном аудио трека -->
              <div class="quiz__album_track_audio_info" v-if="track.audioFile">
                <div class="quiz__form_single_name">
                  <div class="quiz__form_single_name_left">
                    <p class="quiz__form_single_name_text">{{ track.audioFileName }}</p>
                    <p class="quiz__form_single_name_size text_small">{{ formatFileSize(track.audioFileSize) }}</p>
                  </div>
                  <div class="quiz__form_single_name_svg" @click="removeAlbumTrackAudio(albumIndex, trackIndex)">
                    <CloseSVG />
                  </div>
                </div>
              </div>
              
              <div class="form__flex">
                <div class="form__group">
                  <label class="form__label button">ФИО исполнителей<span>*</span></label>
                  <el-input
                    v-model="track.performerName"
                    type="text"
                    placeholder="Введите ФИО исполнителя"
                    :disabled="isLoadingTwo"
                    size="large"
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'performerName')"
                    @blur="validateAlbumTrackPerformerName(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.performerName" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].performerName }}
                  </div>
                </div>
                
                <div class="form__group">
                  <label class="form__label button">ФИО авторов музыки<span>*</span></label>
                  <el-input
                    v-model="track.musicAuthor"
                    type="text"
                    placeholder="Введите ФИО автора музыки"
                    :disabled="isLoadingTwo"
                    size="large"
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'musicAuthor')"
                    @blur="validateAlbumTrackMusicAuthor(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.musicAuthor" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].musicAuthor }}
                  </div>
                </div>
                
                <div class="form__group">
                  <label class="form__label button">ФИО авторов текста<span>*</span></label>
                  <el-input
                    v-model="track.textAuthor"
                    type="text"
                    placeholder="Введите ФИО автора текста"
                    :disabled="isLoadingTwo"
                    size="large"
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'textAuthor')"
                    @blur="validateAlbumTrackTextAuthor(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.textAuthor" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].textAuthor }}
                  </div>
                </div>
                
                <div class="form__group">
                  <label class="form__label button">полное название трека<span>*</span></label>
                  <ul class="form__hint_list">
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Укажите полное название трека, включая псевдонимы и версии. Если загружаете альбом, то напишите номер каждого трека.</p>
                    </li>
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Например: «1. Artist 1, Artist 2 – Best Song (Prod. by Beatmaker)»</p>
                    </li>
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Не должно быть изображений/фотографий популярных людей или персонажей, если на это нет документального подтверждения правообладателя.</p>
                    </li>
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Если название на русском языке, не допускается писать «Каждое Слово С Большой Буквы». (название может быть написано «полностью маленькими буквами»).</p>
                    </li>
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Писать названия транслитом нельзя (например, нельзя писать «privet». Либо «Привет», либо «Hello»).</p>
                    </li>
                    <li class="form__hint_item">
                      <p class="form__hint text_small">Использовать в названии треков 2+ языков нельзя (например, нельзя «Дорога to Success»)</p>
                    </li>
                  </ul>
                  <el-input
                    v-model="track.trackName"
                    type="text"
                    placeholder="Введите название трека"
                    :disabled="isLoadingTwo"
                    size="large"
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'trackName')"
                    @blur="validateAlbumTrackTrackName(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.trackName" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].trackName }}
                  </div>
                </div>
              </div>
              
              <!-- Кнопка загрузки аудио для трека -->
              <div class="quiz__album_track_buttons" v-if="!track.audioFile">
                <button 
                  class="quiz__form_single_button button__red button" 
                  @click="() => handleAlbumTrackButtonClick(albumIndex, trackIndex)"
                  :disabled="isLoadingTwo"
                >
                  <span v-if="!isLoadingTwo">загрузить трек {{ track.trackNumber }}</span>
                  <span v-else>Загрузка...</span>
                </button>
              </div>
              
              <!-- Сообщение об ошибке загрузки аудио -->
              <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.audioFile && !track.audioFile" class="error text_very quiz__form_single_error">
                {{ albumErrors[albumIndex].tracks[trackIndex].audioFile }}
              </div>
            </div>
          </div>
          
          <!-- Кнопка добавления нового трека -->
          <div class="quiz__album_add_track">
            <button 
              class="quiz__form_single_button button__red button" 
              @click="() => addAlbumTrack(albumIndex)"
              :disabled="isLoadingTwo"
            >
              <span>+ Добавить трек в альбом</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="quiz__form_bottom" v-if="dataLoaded && (showSinglesSection && singleTracks.length > 0 || showAlbumsSection && albums.length > 0)">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
        :disabled="isLoadingTwo"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleContinue"
        :disabled="!isReadyForNextStep || isLoadingTwo"
      >
        <span v-if="!isLoadingTwo">Продолжить</span>
        <span v-else>Сохранение...</span>
      </button>
    </div>
  </div>
  <div v-else-if="dataLoaded" class="quiz__no_items">
    <p class="quiz__no_items_text">Не выбрано ни одного сингла или альбома. Вернитесь на предыдущий шаг.</p>
    <div class="quiz__form_bottom">
      <div class="quiz__form_buttons">
        <button 
          class="form__back button__second button" 
          @click="goBack"
          :disabled="isLoadingTwo"
        >
          <span><BackSVG /></span>
          <span>Назад</span>
        </button>
      </div>
    </div>
  </div>
</div>
<!-- Блок с важной информацией -->
<div class="quiz__form quiz__important" v-if="showImportantBlock">
  <h4 class="quiz__important_head">важно!</h4>
  <ul class="quiz__important_list">
    <li class="quiz__important_item">
      <p class="quiz__important_description">В ваших треках не должно быть пиратского контента, т.е. сэмплов и иных кусков чужих популярных треков, на которые у вас нет документального разрешения от авторов (скрин переписки не подойдёт, только договор передачи прав)!</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Отрывки и сэмплы даже длительностью 1, 3, 5 и т.д. секунд НЕ ДОПУСКАЮТСЯ и НЕ ПРОЙДУТ модерацию.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Если в ваших треках использованы элементы чужих авторов без их разрешения, то нужно либо убрать эти элементы, либо не загружать такой трек. Приписка «Кавер»,«Cover» или любая другая не даёт права использовать материалы чужих авторов без их письменного согласия.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Если вы грузите подобный контент, то соглашаетесь с тем, что делаете это на свой страх и риск. В случае не выхода трека по причине использования пиратского контента, оплата за загрузку НЕ ВОЗВРАЩАЕТСЯ.</p>
    </li>
  </ul>
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
        :disabled="isLoadingTwo"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleAccept"
        :disabled="isLoadingTwo"
      >
        <span v-if="!isLoadingTwo">принимаю</span>
        <span v-else>Переход...</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__section_title,
.quiz__album_item_title {
  padding: 20px 0 10px;
}
.quiz__form_two_lists {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.quiz__form_two_description {
  color: var(--text-gray);
}
</style>