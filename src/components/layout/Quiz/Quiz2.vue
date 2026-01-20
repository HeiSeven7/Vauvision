<script lang="ts" setup>
import { ref, reactive, computed, onMounted, } from 'vue';
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

// Ошибки валидации
const errors = reactive({
  performerName: '',
  musicAuthor: '',
  textAuthor: '',
  trackName: '',
  audioFile: ''
});

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
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Загружаем синглы
      if (parsedState.singleTracks && parsedState.singleTracks.length > 0) {
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
      }
      
      // Загружаем альбомы
      if (parsedState.albums && parsedState.albums.length > 0) {
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
      }
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
  
  // Создаем синглы
  if (counts.singleCount > 0 && singleTracks.value.length === 0) {
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
  }
  
  // Создаем альбомы
  if (counts.albumCount > 0 && albums.value.length === 0) {
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
  }
};

// Проверка, нужно ли показывать секцию синглов
const showSinglesSection = computed(() => {
  const counts = getCountsFromQuiz1();
  return counts.singleCount > 0 || singleTracks.value.length > 0;
});

// Проверка, нужно ли показывать секцию альбомов
const showAlbumsSection = computed(() => {
  const counts = getCountsFromQuiz1();
  return counts.albumCount > 0 || albums.value.length > 0;
});

// Проверка готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем все синглы
  const allSinglesComplete = singleTracks.value.every(track => 
    track.trackName.trim().split(/\s+/).length >= 3 &&
    track.audioFile !== null &&
    track.uploaded
  );

  // Проверяем все альбомы
  const allAlbumsComplete = albums.value.every(album =>
    album.albumName.trim().split(/\s+/).length >= 3 &&
    album.tracks.length > 0 &&
    album.tracks.every(track =>
      track.trackName.trim().split(/\s+/).length >= 3 &&
      track.audioFile !== null &&
      track.uploaded
    )
  );

  const counts = getCountsFromQuiz1();
  return (counts.singleCount === 0 || allSinglesComplete) && 
         (counts.albumCount === 0 || allAlbumsComplete);
});

// Валидация формы сингла
const validateSingleForm = async (trackIndex: number) => {
  const track = singleTracks.value[trackIndex];
  let isValid = true;
  
  // Очищаем ошибки
  errors.trackName = '';
  errors.audioFile = '';
  
  // Валидация названия трека (минимум 3 слова)
  if (!track.trackName.trim()) {
    errors.trackName = 'Название трека обязательно для заполнения';
    isValid = false;
  } else if (track.trackName.trim().split(/\s+/).length < 3) {
    errors.trackName = 'Название трека должно содержать минимум 3 слова';
    isValid = false;
  }
  
  // Валидация аудио файла
  if (!track.audioFile) {
    errors.audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  }
  
  // Сохраняем состояние после валидации
  if (isValid) {
    await saveStateToLocalStorage();
  }
  
  return isValid;
};

// Валидация формы альбома
const validateAlbumForm = async (albumIndex: number) => {
  const album = albums.value[albumIndex];
  let isValid = true;
  
  // Очищаем ошибки
  errors.trackName = '';
  errors.audioFile = '';
  
  // Валидация названия альбома
  if (!album.albumName.trim()) {
    errors.trackName = 'Название альбома обязательно для заполнения';
    isValid = false;
  } else if (album.albumName.trim().split(/\s+/).length < 3) {
    errors.trackName = 'Название альбома должно содержать минимум 3 слова';
    isValid = false;
  }
  
  // Валидация наличия треков
  if (album.tracks.length === 0) {
    errors.audioFile = 'Добавьте хотя бы один трек в альбом';
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
  const track = albums.value[albumIndex].tracks[trackIndex];
  let isValid = true;
  
  // Очищаем ошибки
  errors.trackName = '';
  errors.audioFile = '';
  
  // Валидация названия трека
  if (!track.trackName.trim()) {
    errors.trackName = 'Название трека обязательно для заполнения';
    isValid = false;
  } else if (track.trackName.trim().split(/\s+/).length < 3) {
    errors.trackName = 'Название трека должно содержать минимум 3 слова';
    isValid = false;
  }
  
  // Валидация аудио файла
  if (!track.audioFile) {
    errors.audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
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
    errors.audioFile = 'Недопустимый формат файла. Разрешенные форматы: MP3, WAV, FLAC, AAC, OGG';
    ElMessage.error('Недопустимый формат аудио файла');
    return;
  }
  
  // Валидация размера файла (макс 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.audioFile = 'Файл слишком большой. Максимальный размер: 50MB';
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
    ElMessage.error('Недопустимый формат аудио файла');
    return;
  }
  
  // Валидация размера файла (макс 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
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
              @blur="validateSingleForm(trackIndex)"
            />
            <div v-if="errors.performerName" class="error text_very quiz__form_single_error">
              {{ errors.performerName }}
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
              @blur="validateSingleForm(trackIndex)"
            />
            <div v-if="errors.musicAuthor" class="error text_very quiz__form_single_error">
              {{ errors.musicAuthor }}
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
              @blur="validateSingleForm(trackIndex)"
            />
            <div v-if="errors.textAuthor" class="error text_very quiz__form_single_error">
              {{ errors.textAuthor }}
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
              @blur="validateSingleForm(trackIndex)"
            />
            <div v-if="errors.trackName" class="error text_very quiz__form_single_error">
              {{ errors.trackName }}
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
        <div v-if="errors.audioFile && !track.hasAudioUploaded" class="error text_very quiz__form_single_error">
          {{ errors.audioFile }}
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
              @blur="validateAlbumForm(albumIndex)"
            />
            <div v-if="errors.trackName" class="error text_very quiz__form_single_error">
              {{ errors.trackName }}
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
              <div class="quiz__album_track_header">
                <button 
                  v-if="album.tracks.length > 1"
                  class="quiz__album_track_remove button__second button"
                  @click="removeAlbumTrack(albumIndex, trackIndex)"
                >
                  Удалить
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
                    @blur="validateAlbumTrackForm(albumIndex, trackIndex)"
                  />
                  <div v-if="errors.performerName" class="error text_very quiz__form_single_error">
                    {{ errors.performerName }}
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
                    @blur="validateAlbumTrackForm(albumIndex, trackIndex)"
                  />
                  <div v-if="errors.musicAuthor" class="error text_very quiz__form_single_error">
                    {{ errors.musicAuthor }}
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
                    @blur="validateAlbumTrackForm(albumIndex, trackIndex)"
                  />
                  <div v-if="errors.textAuthor" class="error text_very quiz__form_single_error">
                    {{ errors.textAuthor }}
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
                    @blur="validateAlbumTrackForm(albumIndex, trackIndex)"
                  />
                  <div v-if="errors.trackName" class="error text_very quiz__form_single_error">
                    {{ errors.trackName }}
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
              <div v-if="errors.audioFile && !track.audioFile" class="error text_very quiz__form_single_error">
                {{ errors.audioFile }}
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
  
  <div class="quiz__form_bottom" v-if="(showSinglesSection || showAlbumsSection) && dataLoaded">
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