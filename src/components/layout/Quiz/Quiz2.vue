<template>
  <div class="quiz__form quiz__form_two">
    <h4 class="quiz__form_head">Выделите и выберите все нужные синглы</h4>
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
    
    <!-- Форма для загрузки сингла -->
    <div class="quiz__form_single" v-if="showAudioForm">
      <div class="quiz__form_single_audio_info" v-if="uploadedAudio">
        <h5 class="quiz__form_single_head">сингл</h5>
        <div class="quiz__form_single_name">
          <div class="quiz__form_single_name_left">
            <p class="quiz__form_single_name_text">{{ audioFileName }}</p>
            <p class="quiz__form_single_name_size text_small">{{ formatFileSize(audioFileSize) }}</p>
          </div>
          <div class="quiz__form_single_name_svg" @click="removeUploadedAudio">
            <CloseSVG />
          </div>
        </div>
        <div v-if="errors.audioFile" class="error text_very quiz__form_single_error">
          {{ errors.audioFile }}
        </div>
      </div>
      <div class="form__flex">
        <div class="form__group">
          <label for="performerName" class="form__label button">ФИО исполнителей*</label>
          <el-input
            id="performerName"
            v-model="formData.performerName"
            type="text"
            :class="{ 'error': errors.performerName }"
            placeholder="Введите ФИО исполнителя"
            :disabled="isLoadingTwo"
            @blur="validateForm"
            @input="errors.performerName = ''"
            size="large"
          />
          <div v-if="errors.performerName" class="error text_very">
            {{ errors.performerName }}
          </div>
        </div>
        
        <div class="form__group">
          <label for="musicAuthor" class="form__label button">ФИО авторов музыки*</label>
          <el-input
            id="musicAuthor"
            v-model="formData.musicAuthor"
            type="text"
            :class="{ 'error': errors.musicAuthor }"
            placeholder="Введите ФИО автора музыки"
            :disabled="isLoadingTwo"
            @blur="validateForm"
            @input="errors.musicAuthor = ''"
            size="large"
          />
          <div v-if="errors.musicAuthor" class="error text_very">
            {{ errors.musicAuthor }}
          </div>
        </div>
        
        <div class="form__group">
          <label for="textAuthor" class="form__label button">ФИО авторов текста*</label>
          <el-input
            id="textAuthor"
            v-model="formData.textAuthor"
            type="text"
            :class="{ 'error': errors.textAuthor }"
            placeholder="Введите ФИО автора текста"
            :disabled="isLoadingTwo"
            @blur="validateForm"
            @input="errors.textAuthor = ''"
            size="large"
          />
          <div v-if="errors.textAuthor" class="error text_very">
            {{ errors.textAuthor }}
          </div>
        </div>
        
        <div class="form__group">
          <label for="trackName" class="form__label button">полное название трека*</label>
          <ul class="form__hint_list">
            <li class="form__hint_item">
              <p class="form__hint text_small">Укажите полное название трека, включая псевдонимы и версии. Если загружаете альбом, то напишите номер каждого трека.</p>
            </li>
            <li class="form__hint_item">
              <p class="form__hint text_small">Например: «1. Artist 1, Artist 2 – Best Song (Prod. by Beatmaker)»</p>
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
            id="trackName"
            v-model="formData.trackName"
            type="text"
            :class="{ 'error': errors.trackName }"
            placeholder="Введите название трека"
            :disabled="isLoadingTwo"
            @blur="validateForm"
            @input="errors.trackName = ''"
            size="large"
          />
          <div v-if="errors.trackName" class="error text_very">
            {{ errors.trackName }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="quiz__form_single_buttons">
      <button 
        class="quiz__form_single_button button__red button" 
        @click="handleUploadButtonClick"
        :disabled="isLoadingTwo"
        v-if="!showAudioForm"
      >
        <span v-if="!isLoadingTwo">добавить трек</span>
        <span v-else>Загрузка...</span>
      </button>
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
          :disabled="!isReadyForNextStep || isLoadingTwo"
        >
          <span>Продолжить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElInput, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Состояния для загрузки аудио
const showAudioForm = ref(false);
const isLoadingTwo = ref(false);
const uploadedAudio = ref<File | null>(null);
const audioFileName = ref('');
const audioFileSize = ref(0);

// Данные формы для сингла
const formData = reactive({
  performerName: '',
  musicAuthor: '',
  textAuthor: '',
  trackName: '',
  referralCode: ''
});

// Ошибки валидации
const errors = reactive({
  performerName: '',
  musicAuthor: '',
  textAuthor: '',
  trackName: '',
  referralCode: '',
  audioFile: ''
});

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем, что форма показана и все обязательные поля заполнены
  if (!showAudioForm.value || !uploadedAudio.value) return false;
  
  return (
    formData.performerName.trim().length >= 2 &&
    formData.musicAuthor.trim().length >= 2 &&
    formData.textAuthor.trim().length >= 2 &&
    formData.trackName.trim().length >= 2
  );
});

// Валидация формы
const validateForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Валидация обязательных полей
  if (!formData.performerName.trim()) {
    errors.performerName = 'ФИО исполнителя обязательно для заполнения';
    isValid = false;
  } else if (formData.performerName.trim().length < 2) {
    errors.performerName = 'ФИО исполнителя должно содержать минимум 2 символа';
    isValid = false;
  }
  
  if (!formData.musicAuthor.trim()) {
    errors.musicAuthor = 'ФИО автора музыки обязательно для заполнения';
    isValid = false;
  } else if (formData.musicAuthor.trim().length < 2) {
    errors.musicAuthor = 'ФИО автора музыки должно содержать минимум 2 символа';
    isValid = false;
  }
  
  if (!formData.textAuthor.trim()) {
    errors.textAuthor = 'ФИО автора текста обязательно для заполнения';
    isValid = false;
  } else if (formData.textAuthor.trim().length < 2) {
    errors.textAuthor = 'ФИО автора текста должно содержать минимум 2 символа';
    isValid = false;
  }
  
  if (!formData.trackName.trim()) {
    errors.trackName = 'Название трека обязательно для заполнения';
    isValid = false;
  } else if (formData.trackName.trim().length < 2) {
    errors.trackName = 'Название трека должно содержать минимум 2 символа';
    isValid = false;
  }
  
  // Валидация аудио файла
  if (!uploadedAudio.value) {
    errors.audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  }
  
  return isValid;
};

// Обработка загрузки аудио файла
const handleAudioUpload = (event: Event) => {
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
  const maxSize = 50 * 1024 * 1024; // 50MB в байтах
  if (file.size > maxSize) {
    errors.audioFile = 'Файл слишком большой. Максимальный размер: 50MB';
    ElMessage.error('Файл превышает максимальный допустимый размер');
    return;
  }
  
  // Очистка ошибок и установка файла
  errors.audioFile = '';
  uploadedAudio.value = file;
  audioFileName.value = file.name;
  audioFileSize.value = file.size;
  
  // Показ формы и скрытие кнопки
  showAudioForm.value = true;
  
  ElMessage.success('Аудио файл успешно загружен');
};

// Обработка клика по кнопке загрузки
const handleUploadButtonClick = () => {
  if (!showAudioForm.value) {
    // Если форма еще не показана, создаем скрытый input для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.style.display = 'none';
    input.onchange = handleAudioUpload;
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
};

// Удаление загруженного аудио
const removeUploadedAudio = () => {
  uploadedAudio.value = null;
  audioFileName.value = '';
  audioFileSize.value = 0;
  showAudioForm.value = false;
  errors.audioFile = '';
  // Сброс полей формы
  formData.performerName = '';
  formData.musicAuthor = '';
  formData.textAuthor = '';
  formData.trackName = '';
  ElMessage.info('Аудио файл удален');
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  if (validateForm()) {
    emit('go-next');
  }
};
</script>

<style lang="css" scoped>
.quiz__form {
  width: calc(100% - 330px);
  padding: 0 40px 0 60px;
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
.quiz__form_single {
  display: flex;
  padding: 50px 0 0;
  flex-direction: column;
  gap: 30px;
}
.quiz__form_single_buttons {
  padding: 50px 0 0;
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
.quiz__form_single_submit {
  margin-top: 20px;
}
.quiz__form_single_button:disabled,
.quiz__form_single_submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
.text_small {
  font-size: 14px;
}
.text_very {
  font-size: 12px;
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
  .quiz__form_single_name {
    padding: 15px;
    align-items: flex-start;
  }
}
</style>