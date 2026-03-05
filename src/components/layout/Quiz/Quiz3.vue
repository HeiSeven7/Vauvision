<template>
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
      <p class="quiz__important_description">Также приглашаем изучить рекомендации (носящие обязательный характер) от <a href="https://music.apple.com/">Apple Music</a></p>
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
const FILES_DB_NAME = 'filesDB';
const DB_VERSION = 1;

// Состояние для отображения важной информации
const showImportantBlock = ref(false);

// Состояние загрузки данных
const isLoading = ref(true);
const dataLoaded = ref(false);

// Базы данных
const quizDB = ref<any>(null);
const filesDB = ref<any>(null);

// Данные формы - используем reactive для реактивности
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
  coverFileName: '',
  coverFileSize: 0,
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

// Таймер для debounce сохранения
let saveTimeout: NodeJS.Timeout | null = null;

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
  try {
    // База для текстовых данных состояний
    quizDB.value = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('quizState')) {
          const store = db.createObjectStore('quizState', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
    
    // Отдельная база для файлов (обложек)
    filesDB.value = await openDB(FILES_DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('fileName', 'fileName');
          store.createIndex('type', 'type');
        }
      },
    });
    
    console.log('Databases initialized');
  } catch (error) {
    console.error('Error initializing databases:', error);
  }
};

// Сохранение файла в IndexedDB
const saveFileToDB = async (file: File, fileId: string): Promise<void> => {
  try {
    const blob = new Blob([file], { type: file.type });
    await filesDB.value.put('files', {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      data: blob,
      timestamp: Date.now()
    });
    console.log(`File saved to DB with ID: ${fileId}`);
  } catch (error) {
    console.error('Error saving file to DB:', error);
    throw error;
  }
};

// Загрузка файла из IndexedDB
const loadFileFromDB = async (fileId: string): Promise<{ file: File, fileName: string, fileSize: number } | null> => {
  try {
    const stored = await filesDB.value.get('files', fileId);
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
    console.error('Error loading file from DB:', error);
    return null;
  }
};

// Удаление файла из IndexedDB
const removeFileFromDB = async (fileId: string) => {
  try {
    await filesDB.value.delete('files', fileId);
    console.log(`File removed from DB with ID: ${fileId}`);
  } catch (error) {
    console.error('Error removing file from DB:', error);
  }
};

// Генерация ID для файла
const generateFileId = (): string => {
  return `cover-${Date.now()}-${Math.random()}`;
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  if (isLoading.value || !dataLoaded.value) {
    return;
  }
  
  try {
    const stateToSave = {
      id: STORAGE_KEY,
      formData: {
        performerName: formData.performerName || '',
        releaseName: formData.releaseName || '',
        platforms: Array.isArray(formData.platforms) ? [...formData.platforms] : [],
        otherPlatform: formData.otherPlatform || '',
        releaseDate: formData.releaseDate || '',
        hasProfanity: formData.hasProfanity || '',
        profanityTracks: formData.profanityTracks || '',
        vkLink: formData.vkLink || '',
        email: formData.email || ''
      },
      coverFileInfo: formData.coverFileId ? {
        name: coverFileName.value,
        size: coverFileSize.value,
        fileId: formData.coverFileId
      } : null,
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
      
      // Восстанавливаем основные данные формы
      if (savedState.formData) {
        formData.performerName = savedState.formData.performerName || '';
        formData.releaseName = savedState.formData.releaseName || '';
        formData.platforms = Array.isArray(savedState.formData.platforms) ? [...savedState.formData.platforms] : [];
        formData.otherPlatform = savedState.formData.otherPlatform || '';
        formData.releaseDate = savedState.formData.releaseDate || '';
        formData.hasProfanity = savedState.formData.hasProfanity || '';
        formData.profanityTracks = savedState.formData.profanityTracks || '';
        formData.vkLink = savedState.formData.vkLink || '';
        formData.email = savedState.formData.email || '';
      }
      
      // Восстанавливаем showImportantBlock
      if (savedState.showImportantBlock !== undefined) {
        showImportantBlock.value = savedState.showImportantBlock;
      }
      
      // Восстанавливаем обложку
      if (savedState.coverFileInfo) {
        const fileInfo = savedState.coverFileInfo;
        coverFileName.value = fileInfo.name || '';
        coverFileSize.value = fileInfo.size || 0;
        formData.coverFileId = fileInfo.fileId || null;
        
        if (formData.coverFileId) {
          const fileData = await loadFileFromDB(formData.coverFileId);
          if (fileData) {
            formData.coverFile = fileData.file;
            formData.coverFileName = fileData.fileName;
            formData.coverFileSize = fileData.fileSize;
            console.log('Cover file loaded');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading state from IndexedDB:', error);
  }
};

// Очистка состояния в IndexedDB
const clearStateFromDB = async () => {
  try {
    // Удаляем файл обложки
    if (formData.coverFileId) {
      await removeFileFromDB(formData.coverFileId);
    }
    
    // Удаляем состояние
    await quizDB.value.delete('quizState', STORAGE_KEY);
    
    console.log('State cleared from IndexedDB');
  } catch (error) {
    console.error('Error clearing state from IndexedDB:', error);
  }
};

// Загрузка данных с сервера
const loadUserData = async () => {
  try {
    console.log('Loading user data...');
    const response = await sendRequest("post", '/ajax_vue/ajax/getDataForm.php', {});
    console.log('getDataForm response:', response.data);
    
    const data = response.data as any;
    
    if (data.user?.email) {
      formData.email = data.user.email;
      console.log('User email loaded:', data.user.email);
    }
    
    if (data.user?.login) {
      // Загружаем только если поле пустое (чтобы не перезаписывать сохраненное)
      if (!formData.performerName) {
        formData.performerName = data.user.login;
        console.log('✅ Performer name loaded from user.login:', data.user.login);
      }
    } else {
      console.log('❌ user.login not found in response');
    }
    
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error);
  }
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  const requiredFields = [
    formData.performerName?.trim() || '',
    formData.releaseName?.trim() || '',
    (formData.platforms?.length || 0) > 0,
    formData.releaseDate?.trim() || '',
    formData.hasProfanity?.trim() || '',
    formData.coverFile !== null,
    formData.vkLink?.trim() || '',
    formData.email?.trim() || ''
  ];
  
  if (formData.platforms?.includes('other')) {
    requiredFields.push((formData.otherPlatform?.trim() || '').length > 0);
  }
  
  if (formData.hasProfanity === 'yes') {
    requiredFields.push((formData.profanityTracks?.trim() || '').length > 0);
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
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  if (!formData.performerName?.trim()) {
    errors.performerName = 'Псевдоним артиста обязателен для заполнения';
    isValid = false;
  } else if (formData.performerName.trim().length < 2) {
    errors.performerName = 'Псевдоним артиста должен содержать минимум 2 символа';
    isValid = false;
  }
  
  if (!formData.releaseName?.trim()) {
    errors.releaseName = 'Название релиза обязательно для заполнения';
    isValid = false;
  } else if (formData.releaseName.trim().length < 2) {
    errors.releaseName = 'Название релиза должно содержать минимум 2 символа';
    isValid = false;
  }
  
  if (!formData.platforms || formData.platforms.length === 0) {
    errors.platforms = 'Выберите хотя бы одну площадку для загрузки';
    isValid = false;
  }
  
  if (formData.platforms?.includes('other') && !formData.otherPlatform?.trim()) {
    errors.otherPlatform = 'Напишите в свободной форме, на какие площадки нужно (или не нужно) загрузить релиз';
    isValid = false;
  }
  
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
  
  if (!formData.hasProfanity) {
    errors.hasProfanity = 'Укажите, есть ли в треках мат';
    isValid = false;
  }
  
  if (formData.hasProfanity === 'yes' && !formData.profanityTracks?.trim()) {
    errors.profanityTracks = 'Укажите номера треков с матом';
    isValid = false;
  }
  
  if (!formData.coverFile) {
    errors.coverFile = 'Обложка релиза обязательна для загрузки';
    isValid = false;
  }
  
  if (!formData.vkLink?.trim()) {
    errors.vkLink = 'Ссылка на страницу обязательна для заполнения';
    isValid = false;
  } else if (!isValidUrl(formData.vkLink)) {
    errors.vkLink = 'Введите корректную ссылку (начинается с https://)';
    isValid = false;
  } else if (!formData.vkLink.includes('vk.com/') && !formData.vkLink.includes('instagram.com/')) {
    errors.vkLink = 'Ссылка должна вести на VK (vk.com) или Instagram (instagram.com)';
    isValid = false;
  }
  
  if (!formData.email?.trim()) {
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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errors.coverFile = 'Недопустимый формат файла. Разрешенные форматы: JPG, JPEG, PNG';
    ElMessage.error('Недопустимый формат изображения');
    return;
  }
  
  const maxSize = 12 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.coverFile = 'Файл слишком большой. Максимальный размер: 12MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  isUploading.value = true;
  
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
      // Генерируем ID для файла
      const fileId = generateFileId();
      
      // Удаляем старый файл если был
      if (formData.coverFileId) {
        await removeFileFromDB(formData.coverFileId);
      }
      
      // Сохраняем в IndexedDB
      await saveFileToDB(file, fileId);
      
      errors.coverFile = '';
      formData.coverFile = file;
      formData.coverFileId = fileId;
      coverFileName.value = file.name;
      coverFileSize.value = file.size;
      
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

const handleCoverUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  processCoverFile(file);
};

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

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
  
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  processCoverFile(file);
};

const removeUploadedCover = async () => {
  if (formData.coverFileId) {
    await removeFileFromDB(formData.coverFileId);
  }
  
  formData.coverFile = null;
  formData.coverFileId = null;
  coverFileName.value = '';
  coverFileSize.value = 0;
  errors.coverFile = '';
  
  await saveStateToDB();
  
  ElMessage.info('Обложка удалена');
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

const goBack = async () => {
  if (showImportantBlock.value) {
    showImportantBlock.value = false;
    await saveStateToDB();
  } else {
    emit('go-back');
  }
};

const handleContinue = async () => {
  if (validateForm()) {
    showImportantBlock.value = true;
    await saveStateToDB();
  }
};

const handleAccept = async () => {
  await clearStateFromDB();
  emit('go-next');
};

// Debounced save
const debouncedSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    if (dataLoaded.value) {
      saveStateToDB();
    }
  }, 500);
};

// Watchers с debounce
watch(() => formData.performerName, debouncedSave);
watch(() => formData.releaseName, debouncedSave);
watch(() => formData.otherPlatform, debouncedSave);
watch(() => formData.releaseDate, debouncedSave);
watch(() => formData.hasProfanity, debouncedSave);
watch(() => formData.profanityTracks, debouncedSave);
watch(() => formData.vkLink, debouncedSave);
watch(() => formData.email, debouncedSave);
watch(() => coverFileName.value, debouncedSave);
watch(() => coverFileSize.value, debouncedSave);
watch(showImportantBlock, debouncedSave);

// Специальный watch для platforms с debounce
watch(() => formData.platforms, () => {
  debouncedSave();
}, { deep: false });

// Логика очистки зависимых полей
watch(() => formData.hasProfanity, (newValue) => {
  if (newValue === 'no') {
    formData.profanityTracks = '';
  }
});

watch(() => formData.platforms, (newValue) => {
  if (!newValue?.includes('other')) {
    formData.otherPlatform = '';
  }
});

onMounted(async () => {
  console.log('Component mounted, initializing...');
  
  try {
    await initDB();
    await loadStateFromDB();
    await loadUserData();
    dataLoaded.value = true;
    console.log('Initialization complete');
  } catch (error) {
    console.error('Error during initialization:', error);
    ElMessage.error('Ошибка при загрузке данных');
  } finally {
    isLoading.value = false;
  }
});

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

// Добавляем обработчики событий
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

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