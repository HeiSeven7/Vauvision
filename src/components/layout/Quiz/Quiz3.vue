<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElInput, ElMessage, ElSelect, ElOption, ElDatePicker } from 'element-plus';
import { sendRequest } from '@/utils/api';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";
import ClipSVG from "@/uikit/icon/ClipSVG.vue";
import dayjs from 'dayjs';
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для хранения
const STORAGE_KEY = 'quiz3_state';
const DB_NAME = 'quizDB';
const DB_VERSION = 1;

// Состояние для отображения важной информации
const showImportantBlock = ref(false);

// Состояние загрузки данных
const isLoading = ref(true);
const quizDB = ref<any>(null);

// Данные формы
const formData = reactive({
  performerName: '',
  releaseName: '',
  platforms: [] as string[],
  otherPlatform: '',
  releaseDate: '',
  hasProfanity: '',
  profanityTracks: '',
  coverFile: null as File | null,
  coverFileId: null as string | null,
  vkLink: '',
  email: ''
});

// Ошибки валидации
const errors = reactive({
  performerName: '',
  releaseName: '',
  platforms: '',
  otherPlatform: '',
  releaseDate: '',
  hasProfanity: '',
  profanityTracks: '',
  coverFile: '',
  vkLink: '',
  email: ''
});

// Состояния для загрузки файлов
const isUploading = ref(false);
const coverFileName = ref('');
const coverFileSize = ref(0);
const dragOver = ref(false);

// Опции для выбора
const platformOptions = [
  { label: 'Все площадки', value: 'all' },
  { label: 'Другое', value: 'other' }
];

const profanityOptions = [
  { label: 'Да', value: 'yes' },
  { label: 'Нет', value: 'no' }
];

// Инициализация IndexedDB
const initDB = async () => {
  quizDB.value = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('quizState')) {
        const store = db.createObjectStore('quizState', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('coverImages')) {
        const coverStore = db.createObjectStore('coverImages', { keyPath: 'id' });
        coverStore.createIndex('fileName', 'fileName');
      }
    },
  });
};

// Сохранение обложки в IndexedDB
const saveCoverToDB = async (file: File, fileId: string): Promise<void> => {
  try {
    const blob = new Blob([file], { type: file.type });
    await quizDB.value.put('coverImages', {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      data: blob
    });
    console.log(`Cover saved to DB with ID: ${fileId}`);
  } catch (error) {
    console.error('Error saving cover to DB:', error);
    throw error;
  }
};

// Загрузка обложки из IndexedDB
const loadCoverFromDB = async (fileId: string): Promise<{ file: File, fileName: string, fileSize: number } | null> => {
  try {
    const stored = await quizDB.value.get('coverImages', fileId);
    if (stored) {
      const file = new File([stored.data], stored.fileName, { type: stored.fileType });
      return {
        file,
        fileName: stored.fileName,
        fileSize: stored.fileSize
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading cover from DB:', error);
    return null;
  }
};

// Удаление обложки из IndexedDB
const removeCoverFromDB = async (fileId: string) => {
  try {
    await quizDB.value.delete('coverImages', fileId);
    console.log(`Cover removed from DB with ID: ${fileId}`);
  } catch (error) {
    console.error('Error removing cover from DB:', error);
  }
};

// Генерация ID для обложки
const generateCoverId = (): string => {
  return `cover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  if (isLoading.value) return;
  
  try {
    const stateToSave = {
      id: STORAGE_KEY,
      formData: {
        performerName: formData.performerName,
        releaseName: formData.releaseName,
        platforms: formData.platforms,
        otherPlatform: formData.otherPlatform,
        releaseDate: formData.releaseDate,
        hasProfanity: formData.hasProfanity,
        profanityTracks: formData.profanityTracks,
        coverFileId: formData.coverFileId,
        vkLink: formData.vkLink,
        email: formData.email
      },
      coverFileName: coverFileName.value,
      coverFileSize: coverFileSize.value,
      showImportantBlock: showImportantBlock.value,
      timestamp: Date.now()
    };
    
    await quizDB.value.put('quizState', stateToSave);
    console.log('State saved to IndexedDB');
  } catch (error) {
    console.error('Error saving state to IndexedDB:', error);
  }
};

// Загрузка состояния из IndexedDB
const loadStateFromDB = async () => {
  try {
    const savedState = await quizDB.value.get('quizState', STORAGE_KEY);
    if (savedState) {
      console.log('Loading from IndexedDB:', savedState);
      
      // Сохраняем текущие email и performerName перед восстановлением
      const currentEmail = formData.email;
      const currentPerformerName = formData.performerName;
      
      // Восстанавливаем основные данные формы
      Object.assign(formData, savedState.formData);
      
      // Восстанавливаем email и performerName из API, если они были загружены
      if (currentEmail) {
        formData.email = currentEmail;
      }
      if (currentPerformerName) {
        formData.performerName = currentPerformerName;
      }
      
      // Загружаем обложку из IndexedDB если есть ID
      if (formData.coverFileId) {
        const coverData = await loadCoverFromDB(formData.coverFileId);
        if (coverData) {
          formData.coverFile = coverData.file;
        }
      }
      
      // Восстанавливаем информацию о файле
      coverFileName.value = savedState.coverFileName || '';
      coverFileSize.value = savedState.coverFileSize || 0;
      
      // Восстанавливаем showImportantBlock
      showImportantBlock.value = savedState.showImportantBlock || false;
    }
  } catch (error) {
    console.error('Error loading state from IndexedDB:', error);
  }
};

// Очистка состояния в IndexedDB
const clearStateFromDB = async () => {
  try {
    // Удаляем обложку если есть
    if (formData.coverFileId) {
      await removeCoverFromDB(formData.coverFileId);
    }
    await quizDB.value.delete('quizState', STORAGE_KEY);
    console.log('State cleared from IndexedDB');
  } catch (error) {
    console.error('Error clearing state from IndexedDB:', error);
  }
};

// Загрузка данных с сервера
const loadUserData = async () => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/getDataForm.php', {});
    console.log('getDataForm response:', response.data);
    
    const data = response.data as any;
    
    // Получаем email пользователя
    if (data.user?.email) {
      formData.email = data.user.email;
      console.log('User email loaded:', data.user.email);
    }
    
    // ПОЛУЧАЕМ ПСЕВДОНИМ ИЗ ПОЛЯ login
    if (data.user?.login) {
      formData.performerName = data.user.login;
      console.log('✅ Performer name loaded from user.login:', data.user.login);
    } else {
      console.log('❌ user.login not found in response');
    }
    
    // Загружаем состояние из IndexedDB после получения данных
    await loadStateFromDB();
    
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error);
    // В случае ошибки все равно загружаем из IndexedDB
    await loadStateFromDB();
  } finally {
    isLoading.value = false;
  }
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем обязательные поля
  const requiredFields = [
    formData.performerName.trim(),
    formData.releaseName.trim(),
    formData.platforms.length > 0,
    formData.releaseDate.trim(),
    formData.hasProfanity.trim(),
    formData.coverFile !== null,
    formData.vkLink.trim(),
    formData.email.trim()
  ];
  
  // Если выбрана платформа "Другое", проверяем поле otherPlatform
  if (formData.platforms.includes('other')) {
    requiredFields.push(formData.otherPlatform.trim().length > 0);
  }
  
  // Если выбрано "Да" для мата, проверяем поле profanityTracks
  if (formData.hasProfanity === 'yes') {
    requiredFields.push(formData.profanityTracks.trim().length > 0);
  }
  
  return requiredFields.every(Boolean);
});

// Валидация URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Валидация email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация всей формы
const validateForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Валидация псевдонима артиста (первое поле)
  if (!formData.performerName.trim()) {
    errors.performerName = 'Псевдоним артиста обязателен для заполнения';
    isValid = false;
  } else if (formData.performerName.trim().length < 2) {
    errors.performerName = 'Псевдоним артиста должен содержать минимум 2 символа';
    isValid = false;
  }
  
  // Валидация названия релиза
  if (!formData.releaseName.trim()) {
    errors.releaseName = 'Название релиза обязательно для заполнения';
    isValid = false;
  } else if (formData.releaseName.trim().length < 2) {
    errors.releaseName = 'Название релиза должно содержать минимум 2 символа';
    isValid = false;
  }
  
  // Валидация платформ
  if (formData.platforms.length === 0) {
    errors.platforms = 'Выберите хотя бы одну площадку для загрузки';
    isValid = false;
  }
  
  // Валидация других платформ
  if (formData.platforms.includes('other') && !formData.otherPlatform.trim()) {
    errors.otherPlatform = 'Напишите в свободной форме, на какие площадки нужно (или не нужно) загрузить релиз';
    isValid = false;
  }
  
  // Валидация даты релиза
  if (!formData.releaseDate) {
    errors.releaseDate = 'Выберите желаемую дату выхода';
    isValid = false;
  } else {
    const selectedDate = dayjs(formData.releaseDate);
    const today = dayjs().startOf('day');
    
    if (selectedDate.isBefore(today)) {
      errors.releaseDate = 'Дата релиза не может быть в прошлом';
      isValid = false;
    }
  }
  
  // Валидация наличия мата
  if (!formData.hasProfanity) {
    errors.hasProfanity = 'Укажите, есть ли в треках мат';
    isValid = false;
  }
  
  // Валидация треков с матом
  if (formData.hasProfanity === 'yes' && !formData.profanityTracks.trim()) {
    errors.profanityTracks = 'Укажите номера треков с матом';
    isValid = false;
  }
  
  // Валидация обложки
  if (!formData.coverFile) {
    errors.coverFile = 'Обложка релиза обязательна для загрузки';
    isValid = false;
  }
  
  // Валидация ссылки на ВК/Instagram
  if (!formData.vkLink.trim()) {
    errors.vkLink = 'Ссылка на страницу обязательна для заполнения';
    isValid = false;
  } else if (!isValidUrl(formData.vkLink)) {
    errors.vkLink = 'Введите корректную ссылку (начинается с https://)';
    isValid = false;
  } else if (!formData.vkLink.includes('vk.com/') && !formData.vkLink.includes('instagram.com/')) {
    errors.vkLink = 'Ссылка должна вести на VK (vk.com) или Instagram (instagram.com)';
    isValid = false;
  }
  
  // Валидация email
  if (!formData.email.trim()) {
    errors.email = 'Электронная почта обязательна для заполнения';
    isValid = false;
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Введите корректный адрес электронной почты';
    isValid = false;
  }
  
  return isValid;
};

// Общая функция для обработки файла
const processCoverFile = async (file: File) => {
  // Валидация типа файла
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errors.coverFile = 'Недопустимый формат файла. Разрешенные форматы: JPG, JPEG, PNG';
    ElMessage.error('Недопустимый формат изображения');
    return;
  }
  
  // Валидация размера файла (макс 12MB)
  const maxSize = 12 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.coverFile = 'Файл слишком большой. Максимальный размер: 12MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  isUploading.value = true;
  
  // Проверка размеров изображения
  const img = new Image();
  img.onload = async () => {
    if (img.width < 1500 || img.height < 1500) {
      errors.coverFile = 'Изображение слишком маленькое. Минимальный размер: 1500x1500 пикселей';
      ElMessage.error('Изображение не соответствует требованиям по размеру');
      isUploading.value = false;
      return;
    }
    
    if (img.width > 4000 || img.height > 4000) {
      errors.coverFile = 'Изображение слишком большое. Максимальный размер: 4000x4000 пикселей';
      ElMessage.error('Изображение не соответствует требованиям по размеру');
      isUploading.value = false;
      return;
    }
    
    if (Math.abs(img.width - img.height) > 1) {
      errors.coverFile = 'Изображение должно быть квадратным (одинаковая ширина и высота)';
      ElMessage.error('Изображение должно быть квадратным');
      isUploading.value = false;
      return;
    }
    
    try {
      // Удаляем старую обложку если была
      if (formData.coverFileId) {
        await removeCoverFromDB(formData.coverFileId);
      }
      
      // Генерируем ID и сохраняем в IndexedDB
      const fileId = generateCoverId();
      await saveCoverToDB(file, fileId);
      
      // Очистка ошибок и установка файла
      errors.coverFile = '';
      formData.coverFile = file;
      formData.coverFileId = fileId;
      coverFileName.value = file.name;
      coverFileSize.value = file.size;
      
      // Сохраняем состояние
      await saveStateToDB();
      
      ElMessage.success('Обложка успешно загружена');
    } catch (error) {
      console.error('Error saving cover:', error);
      ElMessage.error('Ошибка при сохранении обложки');
    } finally {
      isUploading.value = false;
    }
  };
  
  img.onerror = () => {
    errors.coverFile = 'Не удалось загрузить изображение. Проверьте файл';
    ElMessage.error('Ошибка загрузки изображения');
    isUploading.value = false;
  };
  
  img.src = URL.createObjectURL(file);
};

// Обработка загрузки обложки через input
const handleCoverUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  processCoverFile(file);
};

// Обработка клика по блоку загрузки обложки
const handleCoverButtonClick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/jpg,image/png';
  input.style.display = 'none';
  input.onchange = handleCoverUpload;
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Обработка drag-over
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

// Обработка drag-leave
const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
};

// Обработка drop файла
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
  
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  processCoverFile(file);
};

// Удаление загруженной обложки
const removeUploadedCover = async () => {
  if (formData.coverFileId) {
    await removeCoverFromDB(formData.coverFileId);
  }
  
  formData.coverFile = null;
  formData.coverFileId = null;
  coverFileName.value = '';
  coverFileSize.value = 0;
  errors.coverFile = '';
  
  // Сохраняем состояние
  await saveStateToDB();
  
  ElMessage.info('Обложка удалена');
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Отключение дат в прошлом
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

const goBack = async () => {
  if (showImportantBlock.value) {
    // Если показываем блок important, возвращаемся к форме
    showImportantBlock.value = false;
    await saveStateToDB();
  } else {
    // Если показываем форму, возвращаемся ко второму шагу
    emit('go-back');
  }
};

const handleContinue = async () => {
  if (validateForm()) {
    // Если форма валидна, показываем блок с важной информацией
    showImportantBlock.value = true;
    await saveStateToDB();
  }
};

const handleAccept = async () => {
  // Очищаем состояние после успешного завершения
  await clearStateFromDB();
  
  // Принимаем условия и переходим к следующему шагу (четвертому)
  emit('go-next');
};

// Сохранение состояния при изменении данных формы
watch(() => formData, async () => {
  if (!isLoading.value) {
    await saveStateToDB();
  }
}, { deep: true });

// Следим за изменением поля с матом
watch(() => formData.hasProfanity, (newValue) => {
  if (newValue === 'no') {
    formData.profanityTracks = '';
  }
});

// Следим за изменением списка платформ
watch(() => formData.platforms, (newValue) => {
  if (!newValue.includes('other')) {
    formData.otherPlatform = '';
  }
});

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    await initDB();
    await loadUserData();
  } catch (error) {
    console.error('Error in onMounted:', error);
    isLoading.value = false;
  }
});

// Сохраняем состояние при покидании страницы
window.addEventListener('beforeunload', async () => {
  await saveStateToDB();
});

// Сохраняем состояние при изменении видимости вкладки
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    await saveStateToDB();
  }
});

// Очистка при размонтировании (опционально, можно оставить для будущих шагов)
onUnmounted(() => {
  // Если нужно очищать при переходе на другие шаги
  // clearStateFromDB();
});
</script>

<template>
<!-- Template остается точно таким же -->
<div class="quiz__form quiz__form_three" v-if="!showImportantBlock">
  <h4 class="quiz__form_head">Информация о треке</h4>
  
  <!-- Индикатор загрузки -->
  <div v-if="isLoading" class="quiz__form_loading">
    <span>Загрузка данных...</span>
  </div>
  
  <div v-else class="quiz__form_single">
    <div class="form__flex">
      <!-- Псевдоним артиста - ПЕРВОЕ ПОЛЕ (подгружается из user.login) -->
      <div class="form__group">
        <label for="performerName" class="form__label button">впишите псевдоним артиста<span>*</span></label>
        <p class="form__hint text_small">Укажите имя артиста (ваш псевдоним). Даже если трек совместный, укажите только один свой псевдоним.</p>
        <el-input
          id="performerName"
          v-model="formData.performerName"
          type="text"
          :class="{ 'error': errors.performerName }"
          placeholder="Введите псевдоним артиста"
          :disabled="isUploading"
          @blur="validateForm"
          @input="errors.performerName = ''"
          size="large"
        />
        <div v-if="errors.performerName" class="error text_very">
          {{ errors.performerName }}
        </div>
      </div>
      
      <!-- Название релиза -->
      <div class="form__group">
        <label for="releaseName" class="form__label button">впишите название релиза<span>*</span></label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Если вы выбрали несколько релизов (например, 2 сингла), впишите их названия через запятую.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Перечислять названия треков с альбома не нужно.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Писать названия транслитом нельзя (например, нельзя писать "privet", либо "Привет", либо "Hello").</p>
          </li>
        </ul>
        <el-input
          id="releaseName"
          v-model="formData.releaseName"
          type="text"
          :class="{ 'error': errors.releaseName }"
          placeholder="Введите название релиза"
          :disabled="isUploading"
          @blur="validateForm"
          @input="errors.releaseName = ''"
          size="large"
        />
        <div v-if="errors.releaseName" class="error text_very">
          {{ errors.releaseName }}
        </div>
      </div>
      
      <!-- Площадки для загрузки -->
      <div class="form__group">
        <label class="form__label button">Куда загружать релиз?<span>*</span></label>
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
        
        <!-- Другое поле для других платформ -->
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
      
      <!-- Желаемая дата выхода -->
      <div class="form__group">
        <label class="form__label button">Желаемая дата выхода<span>*</span></label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Если все равно, ставьте ближайшую пятницу. Выбирайте дату с учётом официальных праздников (особенно в Новый Год)! Во время них модерация не проверяет релизы.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Заложите минимум 3 полных рабочих дня (выходные и праздники не считаются). Если релиз важный, то рекомендуем заложить 7-10 рабочих дней: на случай возвратов, ошибок и вопросов со стороны модерации...</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Если дата релиза важна, то рекомендуется заложить минимум 7 дней на загрузку. Также площадка <a href="https://music.apple.com/">Apple Music</a> сообщает, что отображение релиза на их площадке может занять до 5 рабочих дней с момента прохождения модерации. Рекомендуем учитывать это при выборе даты релиза.</p>
          </li>
        </ul>
        <el-date-picker
          v-model="formData.releaseDate"
          type="date"
          placeholder="Выберите дату"
          format="DD.MM.YYYY"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          :class="{ 'error': errors.releaseDate }"
          size="large"
          style="width: 100%;"
          @change="validateForm"
        />
        <div v-if="errors.releaseDate" class="error text_very">
          {{ errors.releaseDate }}
        </div>
      </div>
      
      <!-- Наличие мата -->
      <div class="form__group">
        <label class="form__label button">в треках есть мат?<span>*</span></label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Укажите номера треков, в которых есть мат. Если загружаете один трек, то ставьте 1.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Важно про мат! Мат считается на всех языках, вульгарная лексика также принимается за мат. В данном случае не существует "литературного" мата, считаются все "неприличные" слова. Невнимательное заполнение данного поля может задержать выход релиза.</p>
          </li>
        </ul>
        <el-select
          v-model="formData.hasProfanity"
          placeholder="Выберите ответ"
          :class="{ 'error': errors.hasProfanity }"
          size="large"
          @change="validateForm"
        >
          <el-option
            v-for="option in profanityOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div v-if="errors.hasProfanity" class="error text_very">
          {{ errors.hasProfanity }}
        </div>
        
        <!-- Поле для номеров треков с матом -->
        <div v-if="formData.hasProfanity === 'yes'" class="form__group_inner">
          <p class="form__hint text_small">Укажите номера треков</p>
          <el-input
            v-model="formData.profanityTracks"
            type="text"
            placeholder="Например: 1, 3, 5"
            :class="{ 'error': errors.profanityTracks }"
            @blur="validateForm"
            @input="errors.profanityTracks = ''"
            size="large"
          />
          <div v-if="errors.profanityTracks" class="error text_very">
            {{ errors.profanityTracks }}
          </div>
        </div>
      </div>
      
      <!-- Загрузка обложки -->
      <div class="form__group">
        <label class="form__label button">Прикрепите обложку релиза<span>*</span></label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Для обложек, созданных с помощью AI, необходимо добавлять уникальные элементы: псевдоним и/или название релиза.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Обложка должна быть квадратная, размером от 1500х1500 до 4000х4000 пикселей, в формате JPG, размером не больше 10-12 мегабайт.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Не должно быть изображений/фотографий популярных людей или персонажей, если на это нет документального подтверждения правообладателя.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">На обложке нельзя использовать нецензурные надписи. Нецензурные жесты должны быть сильно размыты, заблюрены или закрыты. Из надписей допускаются только псевдонимы артистов и название релиза, на 100% совпадающие по языку и написанию с тем, как они указаны в релизе. Несоблюдение этих критериев может задержать выход релиза.</p>
          </li>
        </ul>
        
        <!-- Блок для загрузки файла с поддержкой drag-and-drop -->
        <div 
          class="quiz__form_cover_upload"
          :class="{ 'drag-over': dragOver }"
          @click="handleCoverButtonClick"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="quiz__form_cover_upload_icon">
            <ClipSVG />
          </div>
          <div class="quiz__form_cover_upload_content">
            <div class="quiz__form_cover_upload_button text_small">
              Прикрепите файл или перетащите сюда
            </div>
            <p class="quiz__form_cover_upload_hint text_small">
              Формат файла (jpg; png; jpeg). Изображение должно быть хорошего качества.
            </p>
          </div>
        </div>
        
        <!-- Информация о загруженном файле -->
        <div v-if="formData.coverFile" class="quiz__form_single_name">
          <div class="quiz__form_single_name_left">
            <p class="quiz__form_single_name_text">{{ coverFileName }}</p>
            <p class="quiz__form_single_name_size text_small">{{ formatFileSize(coverFileSize) }}</p>
          </div>
          <div class="quiz__form_single_name_svg" @click="removeUploadedCover">
            <CloseSVG />
          </div>
        </div>
        
        <div v-if="errors.coverFile" class="error text_very quiz__form_single_error">
          {{ errors.coverFile }}
        </div>
      </div>
      
      <!-- Ссылка на ВК/Instagram -->
      <div class="form__group">
        <label for="vkLink" class="form__label button">Ссылка на вашу страницу в ВК для проверки и подписания договора<span>*</span></label>
        <p class="form__hint text_small">Если у вас нет ВК, то укажите ссылку на ваш инстаграм. Не указывайте ссылку на ваш паблик – только на личную страницу. Ссылка должна быть кликабельная в формате https://vk.com/... или https://instagram.com/... – не указывайте свои адреса через @ или другие отметки.</p>
        <el-input
          id="vkLink"
          v-model="formData.vkLink"
          type="text"
          :class="{ 'error': errors.vkLink }"
          placeholder="https://vk.com/username или https://instagram.com/username"
          :disabled="isUploading"
          @blur="validateForm"
          @input="errors.vkLink = ''"
          size="large"
        />
        <div v-if="errors.vkLink" class="error text_very">
          {{ errors.vkLink }}
        </div>
      </div>
      
      <!-- Email (подгружается из API) -->
      <div class="form__group">
        <label for="email" class="form__label button">Введите вашу электронную почту<span>*</span></label>
        <el-input
          id="email"
          v-model="formData.email"
          type="email"
          :class="{ 'error': errors.email }"
          placeholder="Введите ваш email"
          :disabled="isUploading"
          @blur="validateForm"
          @input="errors.email = ''"
          size="large"
        />
        <div v-if="errors.email" class="error text_very">
          {{ errors.email }}
        </div>
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
        :disabled="!isReadyForNextStep || isLoading || isUploading"
      >
        <span v-if="!isLoading">Продолжить</span>
        <span v-else>Загрузка...</span>
      </button>
    </div>
  </div>
</div>

<!-- Блок с важной информацией -->
<div class="quiz__form quiz__important" v-if="showImportantBlock">
  <h4 class="quiz__important_head">Игнорирование требований приведёт к увеличению сроков отгрузки релиза.</h4>
  <ul class="quiz__important_list">
    <li class="quiz__important_item">
      <p class="quiz__important_description">Обложка должна быть квадратная, размером от 1500х1500 до 4000х4000 пикселей, в формате JPG, размером не больше 10-12 мегабайт.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Не должно быть изображений/фотографий популярных людей или персонажей, если на это нет документального подтверждения правообладателя.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Не должно быть изображений наготы, запрещённых веществ и символов.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">На обложке не должно быть никаких надписей, кроме названия релиза и псевдоним(-ов) артиста. Названия на обложке должны на 100% совпадать с названием релиза/псевдонимом, до каждой буквы, запятой и пробела, иначе модерация отклонит такую обложку.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Разрешаются обложки без надписей вообще.</p>
    </li>
    <li class="quiz__important_item">
      <p class="quiz__important_description">Также приглашаем изучить рекомендации (носящие обязательный характер) от <a href="https://music.apple.com/">Apple Music</a></p>
    </li>
  </ul>
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
        @click="handleAccept"
        :disabled="!isReadyForNextStep || isLoading || isUploading"
      >
        <span>принимаю</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form_single {
  padding: 20px 0 0;
}
.quiz__form_loading {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
.quiz__form_single_name {
  display: flex;
  width: 100%;
  padding: 20px;
  margin: 30px 0 0;
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

@media (max-width: 767px) {
  .quiz__form_single_name {
    padding: 15px;
    align-items: flex-start;
  }
}
</style>