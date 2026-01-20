<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ElInput, ElMessage, ElSelect, ElOption, ElDatePicker } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";
import ClipSVG from "@/uikit/icon/ClipSVG.vue";
import dayjs from 'dayjs';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для localStorage
const STORAGE_KEY = 'quiz3_state';

// Состояние для отображения важной информации
const showImportantBlock = ref(false);

// Данные формы с инициализацией из localStorage
const formData = reactive({
  performerName: '',
  releaseName: '',
  platforms: [] as string[],
  otherPlatform: '',
  releaseDate: '',
  hasProfanity: '',
  profanityTracks: '',
  coverFile: null as File | null,
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
const isLoading = ref(false);
const coverFileName = ref('');
const coverFileSize = ref(0);
const dragOver = ref(false); // Состояние для drag-and-drop

// Опции для выбора
const platformOptions = [
  { label: 'Все площадки', value: 'all' },
  { label: 'Другое', value: 'other' }
];

const profanityOptions = [
  { label: 'Да', value: 'yes' },
  { label: 'Нет', value: 'no' }
];

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

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  try {
    // Преобразуем File в объект для хранения (можно сохранить только имя и размер)
    const stateToSave = {
      formData: {
        ...formData,
        coverFile: formData.coverFile ? {
          name: formData.coverFile.name,
          size: formData.coverFile.size,
          type: formData.coverFile.type
        } : null
      },
      coverFileName: coverFileName.value,
      coverFileSize: coverFileSize.value,
      showImportantBlock: showImportantBlock.value
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
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
      
      // Восстанавливаем основные данные формы
      Object.assign(formData, parsedState.formData);
      formData.coverFile = null; // Нельзя восстановить File объект из localStorage
      
      // Восстанавливаем информацию о файле
      coverFileName.value = parsedState.coverFileName || '';
      coverFileSize.value = parsedState.coverFileSize || 0;
      
      // НЕ восстанавливаем showImportantBlock - всегда показываем форму
      showImportantBlock.value = false;
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Очистка состояния в localStorage
const clearLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

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
  
  // Валидация псевдонима артиста
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
const processCoverFile = (file: File) => {
  // Валидация типа файла
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errors.coverFile = 'Недопустимый формат файла. Разрешенные форматы: JPG, JPEG, PNG';
    ElMessage.error('Недопустимый формат изображения');
    return;
  }
  
  // Валидация размера файла (макс 12MB)
  const maxSize = 12 * 1024 * 1024; // 12MB в байтах
  if (file.size > maxSize) {
    errors.coverFile = 'Файл слишком большой. Максимальный размер: 12MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  // Проверка размеров изображения
  const img = new Image();
  img.onload = () => {
    if (img.width < 1500 || img.height < 1500) {
      errors.coverFile = 'Изображение слишком маленькое. Минимальный размер: 1500x1500 пикселей';
      ElMessage.error('Изображение не соответствует требованиям по размеру');
      return;
    }
    
    if (img.width > 4000 || img.height > 4000) {
      errors.coverFile = 'Изображение слишком большое. Максимальный размер: 4000x4000 пикселей';
      ElMessage.error('Изображение не соответствует требованиям по размеру');
      return;
    }
    
    if (Math.abs(img.width - img.height) > 1) {
      errors.coverFile = 'Изображение должно быть квадратным (одинаковая ширина и высота)';
      ElMessage.error('Изображение должно быть квадратным');
      return;
    }
    
    // Очистка ошибок и установка файла
    errors.coverFile = '';
    formData.coverFile = file;
    coverFileName.value = file.name;
    coverFileSize.value = file.size;
    
    // Сохраняем состояние
    saveStateToLocalStorage();
    
    ElMessage.success('Обложка успешно загружена');
  };
  
  img.onerror = () => {
    errors.coverFile = 'Не удалось загрузить изображение. Проверьте файл';
    ElMessage.error('Ошибка загрузки изображения');
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
const removeUploadedCover = () => {
  formData.coverFile = null;
  coverFileName.value = '';
  coverFileSize.value = 0;
  errors.coverFile = '';
  
  // Сохраняем состояние
  saveStateToLocalStorage();
  
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

const goBack = () => {
  if (showImportantBlock.value) {
    // Если показываем блок important, возвращаемся к форме
    showImportantBlock.value = false;
    saveStateToLocalStorage();
  } else {
    // Если показываем форму, возвращаемся ко второму шагу
    emit('go-back');
  }
};

const handleContinue = () => {
  if (validateForm()) {
    // Если форма валидна, показываем блок с важной информацией
    showImportantBlock.value = true;
    saveStateToLocalStorage();
  }
};

const handleAccept = () => {
  // Очищаем localStorage после успешного завершения
  clearLocalStorage();
  
  // Принимаем условия и переходим к следующему шагу (четвертому)
  emit('go-next');
};

// Сохранение состояния при изменении данных формы
watch(() => formData, () => {
  saveStateToLocalStorage();
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

// Загрузка состояния при монтировании компонента
onMounted(() => {
  loadStateFromLocalStorage();
  // Всегда показываем форму при загрузке компонента
  showImportantBlock.value = false;
});

// Очистка при размонтировании (опционально, можно оставить для будущих шагов)
onUnmounted(() => {
  // Если нужно очищать при переходе на другие шаги
  // clearLocalStorage();
});
</script>

<template>
<div class="quiz__form quiz__form_three" v-if="!showImportantBlock">
  <h4 class="quiz__form_head">Информация о треке</h4>
  
  <div class="quiz__form_single">
    <div class="form__flex">
      <!-- Псевдоним артиста -->
      <div class="form__group">
        <label for="performerName" class="form__label button">впишите псевдоним артиста<span>*</span></label>
        <p class="form__hint text_small">Укажите имя артиста (ваш псевдоним). Даже если трек совместный, укажите только один свой псевдоним.</p>
        <el-input
          id="performerName"
          v-model="formData.performerName"
          type="text"
          :class="{ 'error': errors.performerName }"
          placeholder="Введите псевдоним артиста"
          :disabled="isLoading"
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
          :disabled="isLoading"
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
          :disabled="isLoading"
          @blur="validateForm"
          @input="errors.vkLink = ''"
          size="large"
        />
        <div v-if="errors.vkLink" class="error text_very">
          {{ errors.vkLink }}
        </div>
      </div>
      
      <!-- Email -->
      <div class="form__group">
        <label for="email" class="form__label button">Введите вашу электронную почту<span>*</span></label>
        <el-input
          id="email"
          v-model="formData.email"
          type="email"
          :class="{ 'error': errors.email }"
          placeholder="Введите ваш email"
          :disabled="isLoading"
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
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleContinue"
        :disabled="!isReadyForNextStep || isLoading"
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
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="handleAccept"
        :disabled="!isReadyForNextStep || isLoading"
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