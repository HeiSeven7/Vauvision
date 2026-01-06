<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import ClipSVG from "@/uikit/icon/ClipSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";
import { ElInput, ElSelect, ElOption } from 'element-plus';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [data: FormData];
}>();

interface FormData {
  genre: string;
  tiktokStartSeconds: string;
  appleMusicTextFile: File | null;
  hasDrugsMention: string;
  drugsTracks: string;
  karaokeFile: File | null;
  appleMusicLinks: string;
  spotifyLinks: string;
  vkLinks: string;
  yandexMusicLinks: string;
  socialLinks: string;
}

interface Errors {
  genre: string;
  tiktokStartSeconds: string;
  appleMusicTextFile: string;
  hasDrugsMention: string;
  drugsTracks: string;
  karaokeFile: string;
  appleMusicLinks: string;
  spotifyLinks: string;
  vkLinks: string;
  yandexMusicLinks: string;
  socialLinks: string;
  fileConsistency: string;
}

// Ключи для localStorage
const STORAGE_KEY = 'quiz5_state';

const formData = ref<FormData>({
  genre: '',
  tiktokStartSeconds: '',
  appleMusicTextFile: null,
  hasDrugsMention: '',
  drugsTracks: '',
  karaokeFile: null,
  appleMusicLinks: '',
  spotifyLinks: '',
  vkLinks: '',
  yandexMusicLinks: '',
  socialLinks: ''
});

const errors = ref<Errors>({
  genre: '',
  tiktokStartSeconds: '',
  appleMusicTextFile: '',
  hasDrugsMention: '',
  drugsTracks: '',
  karaokeFile: '',
  appleMusicLinks: '',
  spotifyLinks: '',
  vkLinks: '',
  yandexMusicLinks: '',
  socialLinks: '',
  fileConsistency: ''
});

// Используем отдельные переменные для каждой области drag-and-drop
const appleMusicDragOver = ref(false);
const karaokeDragOver = ref(false);
const appleMusicTextFileRef = ref<HTMLInputElement | null>(null);
const karaokeFileRef = ref<HTMLInputElement | null>(null);

const drugsOptions = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Нет' }
];

// Состояния для файлов (нужны для отображения)
const appleMusicFileName = ref('');
const appleMusicFileSize = ref(0);
const karaokeFileName = ref('');
const karaokeFileSize = ref(0);

// Сохранение состояния в localStorage
const saveStateToLocalStorage = () => {
  try {
    const stateToSave = {
      formData: {
        ...formData.value,
        // Файлы не сохраняем в localStorage, только информацию о них
        appleMusicTextFile: formData.value.appleMusicTextFile ? {
          name: formData.value.appleMusicTextFile.name,
          size: formData.value.appleMusicTextFile.size,
          type: formData.value.appleMusicTextFile.type
        } : null,
        karaokeFile: formData.value.karaokeFile ? {
          name: formData.value.karaokeFile.name,
          size: formData.value.karaokeFile.size,
          type: formData.value.karaokeFile.type
        } : null
      },
      appleMusicFileName: appleMusicFileName.value,
      appleMusicFileSize: appleMusicFileSize.value,
      karaokeFileName: karaokeFileName.value,
      karaokeFileSize: karaokeFileSize.value
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
      const { appleMusicTextFile, karaokeFile, ...otherFormData } = parsedState.formData;
      formData.value = {
        ...otherFormData,
        appleMusicTextFile: null, // Нельзя восстановить File объект из localStorage
        karaokeFile: null
      };
      
      // Восстанавливаем информацию о файлах
      appleMusicFileName.value = parsedState.appleMusicFileName || '';
      appleMusicFileSize.value = parsedState.appleMusicFileSize || 0;
      karaokeFileName.value = parsedState.karaokeFileName || '';
      karaokeFileSize.value = parsedState.karaokeFileSize || 0;
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
};

// Очистка состояния в localStorage
const clearLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Проверка всех обязательных полей
const isContinueButtonEnabled = computed(() => {
  // 1. Жанр (обязательное поле)
  if (!formData.value.genre.trim()) return false;
  if (formData.value.genre.length > 100) return false;
  
  // 2. Упоминание наркотических средств (обязательное поле)
  if (!formData.value.hasDrugsMention) return false;
  
  // 3. Если есть упоминание наркотиков, то должны быть указаны номера треков
  if (formData.value.hasDrugsMention === 'yes') {
    if (!formData.value.drugsTracks.trim()) return false;
    
    const tracksArray = formData.value.drugsTracks.split(',').map(s => s.trim());
    const isValidTracks = tracksArray.every(s => {
      const num = Number(s);
      return !isNaN(num) && num > 0 && num <= 100 && Number.isInteger(num);
    });
    if (!isValidTracks) return false;
  }
  
  // 4. Ссылки на соцсети (обязательное поле)
  if (!formData.value.socialLinks.trim()) return false;
  
  const socialLinks = formData.value.socialLinks.split(',').map(s => s.trim());
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
  const hasInvalidSocialLink = socialLinks.some(link => !urlPattern.test(link));
  if (hasInvalidSocialLink) return false;
  
  // 5. Проверка секунд для TikTok (если заполнено)
  if (formData.value.tiktokStartSeconds.trim()) {
    const secondsArray = formData.value.tiktokStartSeconds.split(',').map(s => s.trim());
    const isValidSeconds = secondsArray.every(s => {
      const num = Number(s);
      return !isNaN(num) && num >= 0 && num <= 5999 && Number.isInteger(num);
    });
    if (!isValidSeconds) return false;
  }
  
  // 6. Проверка файлов (если загружены)
  if (formData.value.appleMusicTextFile) {
    const allowedExtensions = ['.docx'];
    const fileName = formData.value.appleMusicTextFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidExtension) return false;
    if (formData.value.appleMusicTextFile.size > 10 * 1024 * 1024) return false;
  }
  
  if (formData.value.karaokeFile) {
    const allowedExtensions = ['.ttml'];
    const fileName = formData.value.karaokeFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidExtension) return false;
    if (formData.value.karaokeFile.size > 10 * 1024 * 1024) return false;
  }
  
  // 7. Проверка консистентности файлов
  const hasAppleMusicFile = !!formData.value.appleMusicTextFile;
  const hasKaraokeFile = !!formData.value.karaokeFile;
  if ((hasAppleMusicFile && !hasKaraokeFile) || (!hasAppleMusicFile && hasKaraokeFile)) {
    return false;
  }
  
  // 8. Проверка ссылок на карточки (если заполнены)
  const validateLinks = (links: string) => {
    if (links.trim()) {
      const linkArray = links.split(',').map(s => s.trim());
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
      const hasInvalidLink = linkArray.some(link => {
        if (link.toLowerCase() === 'нужны новые карточки') return false;
        return !urlPattern.test(link);
      });
      return !hasInvalidLink;
    }
    return true;
  };
  
  if (!validateLinks(formData.value.appleMusicLinks)) return false;
  if (!validateLinks(formData.value.spotifyLinks)) return false;
  if (!validateLinks(formData.value.vkLinks)) return false;
  if (!validateLinks(formData.value.yandexMusicLinks)) return false;
  
  return true;
});

const validateField = (fieldName: keyof FormData) => {
  switch (fieldName) {
    case 'genre':
      if (!formData.value.genre.trim()) {
        errors.value.genre = 'Укажите жанр';
      } else if (formData.value.genre.length > 100) {
        errors.value.genre = 'Жанр не должен превышать 100 символов';
      } else {
        errors.value.genre = '';
      }
      break;

    case 'tiktokStartSeconds':
      if (formData.value.tiktokStartSeconds.trim()) {
        const secondsArray = formData.value.tiktokStartSeconds.split(',').map(s => s.trim());
        const isValid = secondsArray.every(s => {
          const num = Number(s);
          return !isNaN(num) && num >= 0 && num <= 5999 && Number.isInteger(num);
        });
        
        if (!isValid) {
          errors.value.tiktokStartSeconds = 'Укажите корректные секунды (целые числа от 0 до 5999, разделенные запятыми)';
        } else {
          errors.value.tiktokStartSeconds = '';
        }
      } else {
        errors.value.tiktokStartSeconds = '';
      }
      break;

    case 'hasDrugsMention':
      if (!formData.value.hasDrugsMention) {
        errors.value.hasDrugsMention = 'Выберите ответ';
      } else {
        errors.value.hasDrugsMention = '';
      }
      break;

    case 'drugsTracks':
      if (formData.value.hasDrugsMention === 'yes') {
        if (!formData.value.drugsTracks.trim()) {
          errors.value.drugsTracks = 'Укажите номера треков с упоминанием наркотических средств';
        } else {
          const tracksArray = formData.value.drugsTracks.split(',').map(s => s.trim());
          const isValid = tracksArray.every(s => {
            const num = Number(s);
            return !isNaN(num) && num > 0 && num <= 100 && Number.isInteger(num);
          });
          
          if (!isValid) {
            errors.value.drugsTracks = 'Укажите корректные номера треков (целые числа от 1 до 100, разделенные запятыми)';
          } else {
            errors.value.drugsTracks = '';
          }
        }
      } else {
        errors.value.drugsTracks = '';
      }
      break;

    case 'appleMusicLinks':
    case 'spotifyLinks':
    case 'vkLinks':
    case 'yandexMusicLinks':
      const value = formData.value[fieldName];
      if (value.trim()) {
        const links = value.split(',').map(s => s.trim());
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        const hasInvalidLink = links.some(link => {
          if (link.toLowerCase() === 'нужны новые карточки') return false;
          return !urlPattern.test(link);
        });
        
        if (hasInvalidLink) {
          errors.value[fieldName] = 'Укажите корректные ссылки или "Нужны новые карточки"';
        } else {
          errors.value[fieldName] = '';
        }
      } else {
        errors.value[fieldName] = '';
      }
      break;

    case 'socialLinks':
      if (!formData.value.socialLinks.trim()) {
        errors.value.socialLinks = 'Укажите ссылки на соцсети';
      } else {
        const links = formData.value.socialLinks.split(',').map(s => s.trim());
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
        const hasInvalidLink = links.some(link => !urlPattern.test(link));
        
        if (hasInvalidLink) {
          errors.value.socialLinks = 'Укажите корректные ссылки на соцсети';
        } else {
          errors.value.socialLinks = '';
        }
      }
      break;
  }
  
  validateFileConsistency();
  // Сохраняем состояние после валидации
  saveStateToLocalStorage();
};

const validateFileConsistency = () => {
  const hasAppleMusicFile = !!formData.value.appleMusicTextFile;
  const hasKaraokeFile = !!formData.value.karaokeFile;
  
  if ((hasAppleMusicFile && !hasKaraokeFile) || (!hasAppleMusicFile && hasKaraokeFile)) {
    errors.value.fileConsistency = 'Для добавления текста трека необходимо прикрепить оба файла: docx и ttml';
  } else {
    errors.value.fileConsistency = '';
  }
};

const validateForm = (): boolean => {
  validateField('genre');
  validateField('tiktokStartSeconds');
  validateField('hasDrugsMention');
  validateField('drugsTracks');
  validateField('appleMusicLinks');
  validateField('spotifyLinks');
  validateField('vkLinks');
  validateField('yandexMusicLinks');
  validateField('socialLinks');
  
  if (formData.value.appleMusicTextFile) {
    const allowedExtensions = ['.docx'];
    const fileName = formData.value.appleMusicTextFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      errors.value.appleMusicTextFile = 'Неверный формат файла. Разрешены только файлы .docx';
    } else if (formData.value.appleMusicTextFile.size > 10 * 1024 * 1024) {
      errors.value.appleMusicTextFile = 'Размер файла не должен превышать 10 МБ';
    } else {
      errors.value.appleMusicTextFile = '';
    }
  } else {
    errors.value.appleMusicTextFile = '';
  }
  
  if (formData.value.karaokeFile) {
    const allowedExtensions = ['.ttml'];
    const fileName = formData.value.karaokeFile.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      errors.value.karaokeFile = 'Неверный формат файла. Разрешены только файлы .ttml';
    } else if (formData.value.karaokeFile.size > 10 * 1024 * 1024) {
      errors.value.karaokeFile = 'Размер файла не должен превышать 10 МБ';
    } else {
      errors.value.karaokeFile = '';
    }
  } else {
    errors.value.karaokeFile = '';
  }
  
  validateFileConsistency();
  
  const hasErrors = Object.values(errors.value).some(error => error !== '');
  return !hasErrors;
};

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  if (validateForm()) {
    // Очищаем localStorage после успешного завершения
    clearLocalStorage();
    emit('go-next', formData.value);
  }
};

const handleAppleMusicFileClick = () => {
  appleMusicTextFileRef.value?.click();
};

const handleKaraokeFileClick = () => {
  karaokeFileRef.value?.click();
};

const handleAppleMusicFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    formData.value.appleMusicTextFile = file;
    appleMusicFileName.value = file.name;
    appleMusicFileSize.value = file.size;
    
    validateField('appleMusicTextFile');
    validateFileConsistency();
    saveStateToLocalStorage();
  }
};

const handleKaraokeFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    formData.value.karaokeFile = file;
    karaokeFileName.value = file.name;
    karaokeFileSize.value = file.size;
    
    validateField('karaokeFile');
    validateFileConsistency();
    saveStateToLocalStorage();
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  // Определяем, над какой областью происходит drag
  const target = event.currentTarget as HTMLElement;
  if (target.classList.contains('apple-music-upload')) {
    appleMusicDragOver.value = true;
  } else if (target.classList.contains('karaoke-upload')) {
    karaokeDragOver.value = true;
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  if (target.classList.contains('apple-music-upload')) {
    appleMusicDragOver.value = false;
  } else if (target.classList.contains('karaoke-upload')) {
    karaokeDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0];
    const target = event.currentTarget as HTMLElement;
    
    if (target.classList.contains('apple-music-upload')) {
      appleMusicDragOver.value = false;
      const allowedExtensions = ['.docx'];
      const fileName = file.name.toLowerCase();
      const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidExtension) {
        errors.value.appleMusicTextFile = 'Неверный формат файла. Разрешены только файлы .docx';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        errors.value.appleMusicTextFile = 'Размер файла не должен превышать 10 МБ';
        return;
      }
      
      formData.value.appleMusicTextFile = file;
      appleMusicFileName.value = file.name;
      appleMusicFileSize.value = file.size;
      errors.value.appleMusicTextFile = '';
    } else if (target.classList.contains('karaoke-upload')) {
      karaokeDragOver.value = false;
      const allowedExtensions = ['.ttml'];
      const fileName = file.name.toLowerCase();
      const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidExtension) {
        errors.value.karaokeFile = 'Неверный формат файла. Разрешены только файлы .ttml';
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        errors.value.karaokeFile = 'Размер файла не должен превышать 10 МБ';
        return;
      }
      
      formData.value.karaokeFile = file;
      karaokeFileName.value = file.name;
      karaokeFileSize.value = file.size;
      errors.value.karaokeFile = '';
    }
    
    validateFileConsistency();
    saveStateToLocalStorage();
  }
};

const removeUploadedAppleMusicFile = () => {
  formData.value.appleMusicTextFile = null;
  appleMusicFileName.value = '';
  appleMusicFileSize.value = 0;
  if (appleMusicTextFileRef.value) {
    appleMusicTextFileRef.value.value = '';
  }
  errors.value.appleMusicTextFile = '';
  validateFileConsistency();
  saveStateToLocalStorage();
};

const removeUploadedKaraokeFile = () => {
  formData.value.karaokeFile = null;
  karaokeFileName.value = '';
  karaokeFileSize.value = 0;
  if (karaokeFileRef.value) {
    karaokeFileRef.value.value = '';
  }
  errors.value.karaokeFile = '';
  validateFileConsistency();
  saveStateToLocalStorage();
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Сохранение состояния при изменении данных формы
watch(() => formData.value, () => {
  saveStateToLocalStorage();
}, { deep: true });

watch(() => formData.value.hasDrugsMention, (newValue) => {
  if (newValue !== 'yes') {
    formData.value.drugsTracks = '';
    errors.value.drugsTracks = '';
  }
  validateField('hasDrugsMention');
  validateField('drugsTracks');
  saveStateToLocalStorage();
});

// Загрузка состояния при монтировании компонента
onMounted(() => {
  loadStateFromLocalStorage();
});
</script>

<template>
<div class="quiz__form quiz__form_five">
  <h4 class="quiz__form_head">жанр и текст</h4>
  <div class="quiz__form_single">
    <div class="form__flex">
      <div class="form__group">
        <label for="genre" class="form__label button">Какой жанр указать?*</label>
        <el-input
          id="genre"
          v-model="formData.genre"
          type="text"
          :class="{ 'error': errors.genre }"
          placeholder="Например: Поп, Хип-хоп, Рок"
          @blur="validateField('genre')"
          @input="errors.genre = ''"
          size="large"
        />
        <div v-if="errors.genre" class="error text_very">
          {{ errors.genre }}
        </div>
      </div>
      
      <div class="form__group">
        <label for="tiktokStartSeconds" class="form__label button">С какой секунды воспроизводить трек в Tik Tok?</label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Укажите секунды через запятую в порядке загруженных ранее треков.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Если вам нужно начать отрывок, например, с 1:24 (одной минуты и двадцать червёртой секунды), то укажите 84. Это число появилось из логики, что в 1 минуте 60 секунд, следовательно, вам нужна 60+24=84 секунда.</p>
          </li>
        </ul>
        <el-input
          id="tiktokStartSeconds"
          v-model="formData.tiktokStartSeconds"
          type="text"
          :class="{ 'error': errors.tiktokStartSeconds }"
          placeholder="Например: 0, 30, 84, 120"
          @blur="validateField('tiktokStartSeconds')"
          @input="errors.tiktokStartSeconds = ''"
          size="large"
        />
        <div v-if="errors.tiktokStartSeconds" class="error text_very">
          {{ errors.tiktokStartSeconds }}
        </div>
      </div>
      
      <div class="form__group">
        <label class="form__label button">Текст для Apple Music</label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Куплеты и припевы должны быть разделены пробелом, каждая строчка с большой буквы, в конце строчек без знаков препинания. В тексте должно быть только то, что произносится в песне.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Пожалуйста, обратите внимание на текст. Припевы и куплеты отделите пробелом, в конце строчек не ставьте знаки препинания, мат не нужно сокращать или цензурить ***.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">В тексте нужно полностью прописать все, что проговаривается, включая интро и аутро.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Бэки, эдлибы можно не указывать</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">ВАЖНО: Если вы хотите добавить текст трека - ОБЯЗАТЕЛЬНО нужно прикреплять и файл docx, и караоке-файл, иначе текст не будет добавлен на площадки. При добавлении только одного из файлов вы не будете допущены на следующую страницу загрузочной формы. Если вы не хотите добавлять текст, то оставьте оба поля ПУСТЫМИ.</p>
          </li>
        </ul>
        <input 
          type="file" 
          ref="appleMusicTextFileRef" 
          @change="handleAppleMusicFileChange" 
          accept=".docx" 
          style="display: none"
        />
        <div 
          class="quiz__form_cover_upload apple-music-upload"
          :class="{ 'drag-over': appleMusicDragOver }"
          @click="handleAppleMusicFileClick"
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
              Формат файла (docx)
            </p>
          </div>
        </div>
        <div v-if="formData.appleMusicTextFile" class="quiz__form_single_name">
          <div class="quiz__form_single_name_left">
            <p class="quiz__form_single_name_text">{{ appleMusicFileName }}</p>
            <p class="quiz__form_single_name_size text_small">{{ formatFileSize(appleMusicFileSize) }}</p>
          </div>
          <div class="quiz__form_single_name_svg" @click="removeUploadedAppleMusicFile">
            <CloseSVG />
          </div>
        </div>
        <div v-if="errors.appleMusicTextFile" class="error text_very quiz__form_single_error">
          {{ errors.appleMusicTextFile }}
        </div>
      </div>
      
      <div class="form__group">
        <label class="form__label button">ЕСТЬ ЛИ У ВАС В РЕЛИЗЕ УПОМИНАНИЕ НАРКОТИЧЕСКИХ СРЕДСТВ?*</label>
        <p class="form__hint text_small">В тексте или названии любого из треков. Независимо от контекста: любое упоминание веществ, способы употребления или производства, в том числе слегновые названия. Алкоголь и сигареты не считаются.</p>
        <el-select
          v-model="formData.hasDrugsMention"
          placeholder="Выберите ответ"
          :class="{ 'error': errors.hasDrugsMention }"
          size="large"
          @change="validateField('hasDrugsMention')"
        >
          <el-option
            v-for="option in drugsOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div v-if="errors.hasDrugsMention" class="error text_very">
          {{ errors.hasDrugsMention }}
        </div>
        
        <div v-if="formData.hasDrugsMention === 'yes'" class="form__group_inner">
          <p class="form__hint text_small">Укажите номера треков*</p>
          <el-input
            v-model="formData.drugsTracks"
            type="text"
            placeholder="Например: 1, 3, 5"
            :class="{ 'error': errors.drugsTracks }"
            @blur="validateField('drugsTracks')"
            @input="errors.drugsTracks = ''"
            size="large"
          />
          <div v-if="errors.drugsTracks" class="error text_very">
            {{ errors.drugsTracks }}
          </div>
        </div>
      </div>
      
      <div class="form__group">
        <label class="form__label button">Караоке текст для Apple Music и Spotify, Yandex.Music, VK</label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Чтобы сделать караоке файл, зайдите на наш сайт, следуйте инструкции на сайте и создайте необходимые файлы. Обязательно подпишите их по названию треков, к которым они относятся.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">При создании караоке файлов важно, чтобы изначальный текст был верно отредактирован, как указано в предыдущем пункте.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Если вы сделаете караоке файл из текста, где есть лишние слова (напр. "Припев", "Куплет" и проч.), то караоке файл будет отклонён площадками и это может задержать выход релиза.</p>
          </li>
        </ul>
        <input 
          type="file" 
          ref="karaokeFileRef" 
          @change="handleKaraokeFileChange" 
          accept=".ttml" 
          style="display: none"
        />
        <div 
          class="quiz__form_cover_upload karaoke-upload"
          :class="{ 'drag-over': karaokeDragOver }"
          @click="handleKaraokeFileClick"
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
              Формат файла (ttml)
            </p>
          </div>
        </div>
        <div v-if="formData.karaokeFile" class="quiz__form_single_name">
          <div class="quiz__form_single_name_left">
            <p class="quiz__form_single_name_text">{{ karaokeFileName }}</p>
            <p class="quiz__form_single_name_size text_small">{{ formatFileSize(karaokeFileSize) }}</p>
          </div>
          <div class="quiz__form_single_name_svg" @click="removeUploadedKaraokeFile">
            <CloseSVG />
          </div>
        </div>
        <div v-if="errors.karaokeFile" class="error text_very quiz__form_single_error">
          {{ errors.karaokeFile }}
        </div>
        <div v-if="errors.fileConsistency" class="error text_very quiz__form_single_error">
          {{ errors.fileConsistency }}
        </div>
      </div>
      
      <div class="form__group">
        <label class="form__label button">ССЫЛКИ НА КАРТОЧКИ АРТИСТОВ</label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Укажите через запятую ссылки на карточки в Apple Music всех артистов, указанных в загружаемом релизе. Если карточек нет, укажите "Нужны новые карточки".</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Указание карточек повышает шансы, что релиз попадёт по адресу, но НЕ ГАРАНТИРУЕТ этого. Распределение по карточкам совершают алгоритмы, поэтому есть вероятность ошибок. В случае ошибки, исправить её можно через нашу поддержку.</p>
          </li>
        </ul>
        <el-input
          v-model="formData.appleMusicLinks"
          type="text"
          :class="{ 'error': errors.appleMusicLinks }"
          placeholder="Ссылки в Apple Music через запятую"
          @blur="validateField('appleMusicLinks')"
          @input="errors.appleMusicLinks = ''"
          size="large"
        />
        <el-input
          v-model="formData.spotifyLinks"
          type="text"
          :class="{ 'error': errors.spotifyLinks }"
          placeholder="Ссылки в Spotify через запятую"
          @blur="validateField('spotifyLinks')"
          @input="errors.spotifyLinks = ''"
          size="large"
        />
        <el-input
          v-model="formData.vkLinks"
          type="text"
          :class="{ 'error': errors.vkLinks }"
          placeholder="Ссылки в VK через запятую"
          @blur="validateField('vkLinks')"
          @input="errors.vkLinks = ''"
          size="large"
        />
        <el-input
          v-model="formData.yandexMusicLinks"
          type="text"
          :class="{ 'error': errors.yandexMusicLinks }"
          placeholder="Ссылки в Yandex Music через запятую"
          @blur="validateField('yandexMusicLinks')"
          @input="errors.yandexMusicLinks = ''"
          size="large"
        />
        <div v-if="errors.appleMusicLinks" class="error text_very">
          {{ errors.appleMusicLinks }}
        </div>
        <div v-if="errors.spotifyLinks" class="error text_very">
          {{ errors.spotifyLinks }}
        </div>
        <div v-if="errors.vkLinks" class="error text_very">
          {{ errors.vkLinks }}
        </div>
        <div v-if="errors.yandexMusicLinks" class="error text_very">
          {{ errors.yandexMusicLinks }}
        </div>
      </div>
      
      <div class="form__group">
        <label for="socialLinks" class="form__label button">ССЫЛКИ НА СОЦИАЛЬНЫЕ СЕТИ АРТИСТОВ*</label>
        <ul class="form__hint_list">
          <li class="form__hint_item">
            <p class="form__hint text_small">Паблик в VK, страница в Instagram, профиль в TikTok, YouTube и проч.</p>
          </li>
          <li class="form__hint_item">
            <p class="form__hint text_small">Модерация может запросить ссылки на соц. сети артиста. Важно, чтобы название паблика/аккаунта совпадало с псевдонимом артиста. Верификация не обязательна. Непредоставление этой информации может задержать выход релиза.</p>
          </li>
        </ul>
        <el-input
          id="socialLinks"
          v-model="formData.socialLinks"
          type="text"
          :class="{ 'error': errors.socialLinks }"
          placeholder="Ссылки на соцсети через запятую"
          @blur="validateField('socialLinks')"
          @input="errors.socialLinks = ''"
          size="large"
        />
        <p class="form__hint text_small">*деятельность компании Meta Platforms Inc., которой принадлежит Инстаграм / Фейсбук, запрещена на территории РФ в части реализации данной (-ых) социальной (-ых) сети (-ей) на основании осуществления ею экстремистской деятельности</p>
        <div v-if="errors.socialLinks" class="error text_very">
          {{ errors.socialLinks }}
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
        @click="goNext"
        :disabled="!isContinueButtonEnabled"
      >
        <span>Продолжить</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form_single {
  padding: 20px 0 0;
}
</style>