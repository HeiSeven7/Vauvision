<script lang="ts" setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, watch } from 'vue';
import { ElInput, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Получаем экземпляр компонента для доступа к родителю
const instance = getCurrentInstance();
const parent = instance?.parent;

// Локальные состояния
const isLoadingTwo = ref(false);
const showImportantBlock = ref(false); // <-- Добавлено: состояние для отображения важной информации

// Получаем количество из родительского компонента
const singleCount = computed(() => {
  return parent?.exposed?.quizState?.singleCount || 0;
});

const albumCount = computed(() => {
  return parent?.exposed?.quizState?.albumCount || 0;
});

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
  uploaded: boolean;
}

// Данные для синглов
const singleTracks = ref<Array<{
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  trackName: string;
  audioFile: File | null;
  audioFileName: string;
  audioFileSize: number;
  uploaded: boolean;
  hasAudioUploaded: boolean;
}>>([]);

// Данные для альбомов
const albums = ref<Array<{
  albumName: string;
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  tracks: AlbumTrack[];
}>>([]);

// Инициализация данных на основе количества
const initializeData = () => {
  // Инициализация синглов
  singleTracks.value = [];
  for (let i = 0; i < singleCount.value; i++) {
    singleTracks.value.push({
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      trackName: '',
      audioFile: null,
      audioFileName: '',
      audioFileSize: 0,
      uploaded: false,
      hasAudioUploaded: false
    });
  }

  // Инициализация альбомов
  albums.value = [];
  for (let i = 0; i < albumCount.value; i++) {
    albums.value.push({
      albumName: '',
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      tracks: []
    });
  }
};

// Проверка готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем все синглы
  const allSinglesComplete = singleTracks.value.every(track => 
    track.performerName.trim().split(/\s+/).length >= 3 && // Изменено
    track.musicAuthor.trim().split(/\s+/).length >= 3 &&   // Изменено
    track.textAuthor.trim().split(/\s+/).length >= 3 &&    // Изменено
    track.trackName.trim().split(/\s+/).length >= 3 &&     // Изменено
    track.audioFile !== null &&
    track.uploaded
  );

  // Проверяем все альбомы
  const allAlbumsComplete = albums.value.every(album =>
    album.albumName.trim().split(/\s+/).length >= 3 &&     // Изменено
    album.tracks.length > 0 &&
    album.tracks.every(track =>
      track.trackName.trim().split(/\s+/).length >= 3 &&   // Изменено
      track.performerName.trim().split(/\s+/).length >= 3 && // Изменено
      track.musicAuthor.trim().split(/\s+/).length >= 3 &&  // Изменено
      track.textAuthor.trim().split(/\s+/).length >= 3 &&   // Изменено
      track.audioFile !== null &&
      track.uploaded
    )
  );

  return (singleCount.value === 0 || allSinglesComplete) && 
         (albumCount.value === 0 || allAlbumsComplete);
});

// Валидация формы сингла
const validateSingleForm = (trackIndex: number) => {
  const track = singleTracks.value[trackIndex];
  let isValid = true;
  
  if (!track.performerName.trim()) {
    errors.performerName = 'ФИО исполнителя обязательно для заполнения';
    isValid = false;
  } else if (track.performerName.trim().split(/\s+/).length < 3) { // Изменено
    errors.performerName = 'ФИО исполнителя должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.musicAuthor.trim()) {
    errors.musicAuthor = 'ФИО автора музыки обязательно для заполнения';
    isValid = false;
  } else if (track.musicAuthor.trim().split(/\s+/).length < 3) { // Изменено
    errors.musicAuthor = 'ФИО автора музыки должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.textAuthor.trim()) {
    errors.textAuthor = 'ФИО автора текста обязательно для заполнения';
    isValid = false;
  } else if (track.textAuthor.trim().split(/\s+/).length < 3) { // Изменено
    errors.textAuthor = 'ФИО автора текста должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.trackName.trim()) {
    errors.trackName = 'Название трека обязательно для заполнения';
    isValid = false;
  } else if (track.trackName.trim().split(/\s+/).length < 3) { // Изменено
    errors.trackName = 'Название трека должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.audioFile) {
    errors.audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  }
  
  return isValid;
};

// Валидация формы альбома
const validateAlbumForm = (albumIndex: number) => {
  const album = albums.value[albumIndex];
  let isValid = true;
  
  if (!album.albumName.trim()) {
    errors.trackName = 'Название альбома обязательно для заполнения';
    isValid = false;
  } else if (album.albumName.trim().split(/\s+/).length < 3) { // Изменено
    errors.trackName = 'Название альбома должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (album.tracks.length === 0) {
    errors.audioFile = 'Добавьте хотя бы один трек в альбом';
    isValid = false;
  }
  
  return isValid;
};

// Валидация формы трека альбома
const validateAlbumTrackForm = (albumIndex: number, trackIndex: number) => {
  const track = albums.value[albumIndex].tracks[trackIndex];
  let isValid = true;
  
  if (!track.performerName.trim()) {
    errors.performerName = 'ФИО исполнителя обязательно для заполнения';
    isValid = false;
  } else if (track.performerName.trim().split(/\s+/).length < 3) { // Изменено
    errors.performerName = 'ФИО исполнителя должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.musicAuthor.trim()) {
    errors.musicAuthor = 'ФИО автора музыки обязательно для заполнения';
    isValid = false;
  } else if (track.musicAuthor.trim().split(/\s+/).length < 3) { // Изменено
    errors.musicAuthor = 'ФИО автора музыки должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.textAuthor.trim()) {
    errors.textAuthor = 'ФИО автора текста обязательно для заполнения';
    isValid = false;
  } else if (track.textAuthor.trim().split(/\s+/).length < 3) { // Изменено
    errors.textAuthor = 'ФИО автора текста должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.trackName.trim()) {
    errors.trackName = 'Название трека обязательно для заполнения';
    isValid = false;
  } else if (track.trackName.trim().split(/\s+/).length < 3) { // Изменено
    errors.trackName = 'Название трека должно содержать минимум 3 слова';
    isValid = false;
  }
  
  if (!track.audioFile) {
    errors.audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  }
  
  return isValid;
};

// Обработка загрузки аудио файла для сингла
const handleSingleAudioUpload = (trackIndex: number, event: Event) => {
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
  
  // Сохраняем данные файла
  singleTracks.value[trackIndex].audioFile = file;
  singleTracks.value[trackIndex].audioFileName = file.name;
  singleTracks.value[trackIndex].audioFileSize = file.size;
  singleTracks.value[trackIndex].uploaded = true;
  singleTracks.value[trackIndex].hasAudioUploaded = true;
  
  ElMessage.success('Аудио файл успешно загружен');
};

// Обработка загрузки аудио файла для трека альбома
const handleAlbumTrackUpload = (albumIndex: number, trackIndex: number, event: Event) => {
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
  
  // Обновляем данные трека
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      album.tracks[trackIndex].audioFile = file;
      album.tracks[trackIndex].audioFileName = file.name;
      album.tracks[trackIndex].audioFileSize = file.size;
      album.tracks[trackIndex].uploaded = true;
      
      // Проверяем валидацию трека после загрузки
      validateAlbumTrackForm(albumIndex, trackIndex);
      
      ElMessage.success(`Трек ${trackIndex + 1} успешно загружен`);
    }
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
const addAlbumTrack = (albumIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    albums.value[albumIndex].tracks.push({
      id: `album-track-${Date.now()}-${Math.random()}`,
      trackNumber: albums.value[albumIndex].tracks.length + 1,
      trackName: '',
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      audioFile: null,
      audioFileName: '',
      audioFileSize: 0,
      uploaded: false
    });
  }
};

// Удалить трек из альбома
const removeAlbumTrack = (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      album.tracks.splice(trackIndex, 1);
      // Обновляем номера треков
      album.tracks.forEach((track, index) => {
        track.trackNumber = index + 1;
      });
      ElMessage.info('Трек удален из альбома');
    }
  }
};

// Удаление загруженного аудио для сингла
const removeSingleUploadedAudio = (trackIndex: number) => {
  singleTracks.value[trackIndex].audioFile = null;
  singleTracks.value[trackIndex].audioFileName = '';
  singleTracks.value[trackIndex].audioFileSize = 0;
  singleTracks.value[trackIndex].uploaded = false;
  singleTracks.value[trackIndex].hasAudioUploaded = false;
  ElMessage.info('Аудио файл удален');
};

// Удаление загруженного аудио для трека альбома
const removeAlbumTrackAudio = (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      album.tracks[trackIndex].audioFile = null;
      album.tracks[trackIndex].audioFileName = '';
      album.tracks[trackIndex].audioFileSize = 0;
      album.tracks[trackIndex].uploaded = false;
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

// Сохранить данные в родительский компонент
const saveDataToParent = () => {
  if (!parent?.exposed) return;
  
  // Сохраняем синглы
  singleTracks.value.forEach((track, index) => {
    if (parent.exposed?.updateSingleTrack) {
      parent.exposed.updateSingleTrack(index, {
        performerName: track.performerName,
        musicAuthor: track.musicAuthor,
        textAuthor: track.textAuthor,
        trackName: track.trackName,
        audioFile: track.audioFile,
        audioFileName: track.audioFileName,
        audioFileSize: track.audioFileSize,
        uploaded: track.uploaded
      });
    }
  });
  
  // Сохраняем альбомы
  albums.value.forEach((album, albumIndex) => {
    if (parent.exposed?.updateAlbum) {
      parent.exposed.updateAlbum(albumIndex, {
        albumName: album.albumName,
        performerName: album.performerName,
        musicAuthor: album.musicAuthor,
        textAuthor: album.textAuthor,
      });
      
      // Сохраняем треки альбома
      album.tracks.forEach((track) => {
        if (parent.exposed?.addAlbumTrack) {
          parent.exposed.addAlbumTrack(albumIndex, {
            ...track
          });
        }
      });
    }
  });
};

// Загрузить данные из родительского компонента
const loadDataFromParent = () => {
  if (!parent?.exposed?.quizState) return;
  
  // Загружаем синглы
  if (parent.exposed.quizState.singleTracks) {
    parent.exposed.quizState.singleTracks.forEach((track: any, index: number) => {
      if (index < singleTracks.value.length) {
        singleTracks.value[index] = {
          performerName: track.performerName || '',
          musicAuthor: track.musicAuthor || '',
          textAuthor: track.textAuthor || '',
          trackName: track.trackName || '',
          audioFile: track.audioFile || null,
          audioFileName: track.audioFileName || '',
          audioFileSize: track.audioFileSize || 0,
          uploaded: track.uploaded || false,
          hasAudioUploaded: !!track.audioFile
        };
      }
    });
  }
  
  // Загружаем альбомы
  if (parent.exposed.quizState.albumTracks) {
    parent.exposed.quizState.albumTracks.forEach((album: any, albumIndex: number) => {
      if (albumIndex < albums.value.length) {
        albums.value[albumIndex] = {
          albumName: album.albumName || '',
          performerName: album.performerName || '',
          musicAuthor: album.musicAuthor || '',
          textAuthor: album.textAuthor || '',
          tracks: album.tracks?.map((track: any) => ({
            id: track.id || `album-track-${Date.now()}-${Math.random()}`,
            trackNumber: track.trackNumber || 1,
            trackName: track.trackName || '',
            performerName: track.performerName || album.performerName || '',
            musicAuthor: track.musicAuthor || album.musicAuthor || '',
            textAuthor: track.textAuthor || album.textAuthor || '',
            audioFile: track.audioFile || null,
            audioFileName: track.audioFileName || '',
            audioFileSize: track.audioFileSize || 0,
            uploaded: track.uploaded || false
          })) || []
        };
      }
    });
  }
};

const goBack = () => {
  if (showImportantBlock.value) {
    // Если показываем блок important, возвращаемся к форме
    showImportantBlock.value = false;
  } else {
    // Если показываем форму, возвращаемся к первому шагу
    saveDataToParent();
    emit('go-back');
  }
};

const handleContinue = () => {
  // Проверяем все формы
  let allValid = true;
  
  // Проверяем синглы
  singleTracks.value.forEach((_, index) => {
    if (!validateSingleForm(index)) {
      allValid = false;
    }
  });
  
  // Проверяем альбомы
  albums.value.forEach((album, albumIndex) => {
    if (!validateAlbumForm(albumIndex)) {
      allValid = false;
    }
    
    // Проверяем треки альбома
    album.tracks.forEach((_, trackIndex) => {
      if (!validateAlbumTrackForm(albumIndex, trackIndex)) {
        allValid = false;
      }
    });
  });
  
  if (allValid) {
    saveDataToParent();
    // Показываем блок с важной информацией
    showImportantBlock.value = true;
  } else {
    ElMessage.error('Пожалуйста, заполните все обязательные поля и загрузите аудио файлы');
  }
};

const handleAccept = () => {
  // Принимаем условия и переходим к третьему шагу
  emit('go-next');
};

// Инициализация при монтировании
onMounted(() => {
  initializeData();
  loadDataFromParent();
});

// Следим за изменением количеств
watch([singleCount, albumCount], () => {
  initializeData();
  loadDataFromParent();
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
      <p class="quiz__form_two_description">Отметить артистов можно 3 способами:</p>
      <ul class="quiz__form_two_list">
        <li class="quiz__form_two_item">
          <p class="quiz__form_two_description">Артист 1, Артист 2 (через запятую). Тогда оба артиста будут считаться основными, у всех появится своя карточка артиста, в которые попадёт релиз (либо попадёт в существующие, если карточки уже есть).</p>
        </li>
        <li class="quiz__form_two_item">
          <p class="quiz__form_two_description">Артист 1 feat Артист 2. Тут второй артист будет считаться второстепенным, релиз не отобразится у него в карточке. Если у Артист 2 нет карточки, то новая ему не создастся.</p>
        </li>
        <li class="quiz__form_two_item">
          <p class="quiz__form_two_description">Артист 1 & Артист 2. В таком случае оба артиста будут считаться коллективом, для которого создастся отдельная карточка. У каждого артиста по отдельности карточки не будет, а релиз в них не попадёт.</p>
        </li>
      </ul>
      <p class="quiz__form_two_description">Это все возможные варианты, отмечать артистов через "х" или другие знаки нельзя - площадки не принимают подобные релизы.</p>
      <p class="quiz__form_two_description">Если вы хотите, чтобы рядом с названием трека серым цветом отображался Prod. by, то укажите это в скобках названия трека.</p>
    </div>
  </div>
  
  <!-- СИНГЛЫ -->
  <div class="quiz__section" v-if="singleCount > 0">
    <h4 class="quiz__section_title">Синглы</h4>
    
    <div class="quiz__singles_list">
      <div 
        v-for="(track, trackIndex) in singleTracks" 
        :key="trackIndex"
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
            <label class="form__label button">ФИО исполнителей*</label>
            <el-input
              v-model="track.performerName"
              type="text"
              placeholder="Введите ФИО исполнителя"
              :disabled="isLoadingTwo"
              size="large"
            />
          </div>
          
          <div class="form__group">
            <label class="form__label button">ФИО авторов музыки*</label>
            <el-input
              v-model="track.musicAuthor"
              type="text"
              placeholder="Введите ФИО автора музыки"
              :disabled="isLoadingTwo"
              size="large"
            />
          </div>
          
          <div class="form__group">
            <label class="form__label button">ФИО авторов текста*</label>
            <el-input
              v-model="track.textAuthor"
              type="text"
              placeholder="Введите ФИО автора текста"
              :disabled="isLoadingTwo"
              size="large"
            />
          </div>
          
          <div class="form__group">
            <label class="form__label button">полное название трека*</label>
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
            />
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
      </div>
    </div>
  </div>
  
  <!-- АЛЬБОМЫ -->
  <div class="quiz__section" v-if="albumCount > 0">
    <h4 class="quiz__section_title">Альбомы</h4>
    
    <div class="quiz__albums_list">
      <div 
        v-for="(album, albumIndex) in albums" 
        :key="albumIndex"
        class="quiz__album_item"
      >
        <h5 class="quiz__album_item_title">Альбом {{ albumIndex + 1 }}</h5>
        
        <!-- Основная информация об альбоме -->
        <div class="form__flex">
          <div class="form__group">
            <label class="form__label button">Название альбома*</label>
            <el-input
              v-model="album.albumName"
              type="text"
              placeholder="Введите название альбома"
              :disabled="isLoadingTwo"
              size="large"
            />
          </div>
        </div>
        
        <!-- Треки альбома -->
        <div class="quiz__album_tracks">
          <h6 class="quiz__album_tracks_head">Треки альбома</h6>
          
          <div class="quiz__album_tracks_list">
            <div 
              v-for="(track, trackIndex) in album.tracks" 
              :key="track.id"
              class="quiz__album_track_item"
            >
              <div class="quiz__album_track_header">
                <h6 class="quiz__album_track_number">Трек {{ track.trackNumber }}</h6>
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
                  <label class="form__label button">ФИО исполнителей*</label>
                  <el-input
                    v-model="track.performerName"
                    type="text"
                    placeholder="Введите ФИО исполнителя"
                    :disabled="isLoadingTwo"
                    size="large"
                  />
                </div>
                
                <div class="form__group">
                  <label class="form__label button">ФИО авторов музыки*</label>
                  <el-input
                    v-model="track.musicAuthor"
                    type="text"
                    placeholder="Введите ФИО автора музыки"
                    :disabled="isLoadingTwo"
                    size="large"
                  />
                </div>
                
                <div class="form__group">
                  <label class="form__label button">ФИО авторов текста*</label>
                  <el-input
                    v-model="track.textAuthor"
                    type="text"
                    placeholder="Введите ФИО автора текста"
                    :disabled="isLoadingTwo"
                    size="large"
                  />
                </div>
                
                <div class="form__group">
                  <label class="form__label button">полное название трека*</label>
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
                  />
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
        :disabled="true"
      >
        <span>Продолжить</span>
      </button>
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
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleAccept"
        :disabled="!isReadyForNextStep || isLoadingTwo"
      >
        <span>принимаю</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form_top {
  display: flex;
  width: 100%;
  padding: 0 0 20px;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}
.quiz__no_items {
  text-align: center;
  padding: 50px 0;
}
.quiz__no_items_text {
  margin-bottom: 20px;
  color: var(--text-gray);
}
.quiz__form_two_lists {
  display: flex;
  padding: 20px 0 0;
  flex-direction: column;
  gap: 10px;
}
.quiz__form_two_list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  counter-reset: quiz-counter;
  list-style: none;
  padding-left: 0;
}
.quiz__form_two_list li {
  position: relative;
  padding-left: 30px;
  counter-increment: quiz-counter;
}
.quiz__form_two_list li::before {
  content: counter(quiz-counter) ".";
  position: absolute;
  left: 0;
  top: 2.3px;
  color: var(--text-gray);
}
.quiz__form_two_description {
  color: var(--text-gray);
}

/* Стили для секций */
.quiz__section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
}
.quiz__section:first-child {
  margin-top: 20px;
  padding-top: 0;
  border-top: none;
}
.quiz__section_title {
  margin-bottom: 30px;
  text-transform: uppercase;
}

/* Стили для синглов */
.quiz__singles_list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.quiz__single_item {
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: #f8f9fa;
}
.quiz__single_item_title {
  margin-bottom: 20px;
  text-transform: uppercase;
}

/* Стили для альбомов */
.quiz__albums_list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.quiz__album_item {
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: #f8f9fa;
}
.quiz__album_item_title {
  margin-bottom: 20px;
  text-transform: uppercase;
}

/* Общие стили для загрузки аудио */
.quiz__form_single_audio_info {
  margin: 20px 0;
}
.quiz__form_single_name {
  display: flex;
  width: 100%;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background-color: #EDFBE2;
}
.quiz__form_single_name_svg {
  display: flex;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transform: rotate(0deg);
  transition: transform 0.15s linear;
}
.quiz__form_single_name_svg:hover {
  transform: rotate(90deg);
}
.quiz__form_single_name_svg svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.quiz__form_single_name_left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.quiz__form_single_name_size {
  color: var(--text-gray);
}
.quiz__form_single_error {
  margin-top: 10px;
  color: #f56c6c;
  padding: 8px 12px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
}
.quiz__form_single_button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Стили для треков альбома */
.quiz__album_tracks {
  margin-top: 30px;
  padding: 30px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background-color: white;
}
.quiz__album_tracks_head {
  margin-bottom: 20px;
  text-transform: uppercase;
  font-size: 16px;
}
.quiz__album_tracks_list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.quiz__album_track_item {
  padding: 20px;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  background-color: #f8f9fa;
}
.quiz__album_track_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.quiz__album_track_number {
  text-transform: uppercase;
  font-size: 14px;
  margin: 0;
}
.quiz__album_track_remove {
  padding: 5px 15px;
  font-size: 12px;
}
.quiz__album_track_buttons {
  margin-top: 20px;
}
.quiz__album_add_track {
  margin-top: 30px;
  text-align: center;
}

/* Формы */
.quiz__form_single_buttons {
  padding: 20px 0 0;
}
.form__flex {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form__label {
  text-transform: uppercase;
}
.form__hint_list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding-left: 20px;
}
.form__hint_item {
  position: relative;
}
.form__hint_item::before {
  content: "•";
  position: absolute;
  left: -15px;
  color: var(--text-gray);
}
</style>