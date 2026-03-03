<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

const isLoading = ref(false);

// Интерфейсы для типизации
interface SingleTrack {
  trackName?: string;
}

interface Album {
  tracks?: SingleTrack[];
}

interface AllData {
  singleTracks?: SingleTrack[];
  albums?: Album[];
  singleCount?: number;
  albumCount?: number;
  clipCount?: number;
  cardCount?: number;
  releaseInfo?: {
    performerName?: string;
    email?: string;
  };
  passportInfo?: {
    lastName?: string;
    firstName?: string;
  };
  additionalInfo?: {
    confirmNoRightsViolation?: boolean;
  };
  signature?: string;
  coverFileName?: string;
  coverFileSize?: number;
  appleMusicFileName?: string;
  appleMusicFileSize?: number;
  karaokeFileName?: string;
  karaokeFileSize?: number;
  agreement?: any;
}

// Вычисляемые свойства для шаблона
const allData = computed<AllData>(() => {
  const data: AllData = {};
  
  // Собираем данные из каждого шага
  const quizSteps = [1, 2, 3, 4, 5, 6, 7];
  
  quizSteps.forEach(step => {
    try {
      const stepData = localStorage.getItem(`quiz${step}_state`);
      if (stepData) {
        const parsedData = JSON.parse(stepData);
        
        switch(step) {
          case 1:
            Object.assign(data, parsedData);
            break;
          case 2:
            data.singleTracks = parsedData.singleTracks || [];
            data.albums = parsedData.albums || [];
            data.singleCount = parsedData.singleCount || 0;
            data.albumCount = parsedData.albumCount || 0;
            break;
          case 3:
            data.releaseInfo = parsedData.formData || {};
            data.coverFileName = parsedData.coverFileName || '';
            data.coverFileSize = parsedData.coverFileSize || 0;
            break;
          case 4:
            data.passportInfo = parsedData.formData || {};
            break;
          case 5:
            Object.assign(data, parsedData.formData || {});
            data.appleMusicFileName = parsedData.appleMusicFileName || '';
            data.appleMusicFileSize = parsedData.appleMusicFileSize || 0;
            data.karaokeFileName = parsedData.karaokeFileName || '';
            data.karaokeFileSize = parsedData.karaokeFileSize || 0;
            break;
          case 6:
            data.additionalInfo = parsedData.formData || {};
            break;
          case 7:
            data.agreement = parsedData || {};
            break;
        }
      }
    } catch (error) {
      console.error(`Error collecting data from step ${step}:`, error);
    }
  });
  
  // Получаем подпись
  try {
    const signatureData = localStorage.getItem('signature_data');
    if (signatureData) {
      data.signature = signatureData;
    }
  } catch (error) {
    console.error('Error collecting signature:', error);
  }
  
  return data;
});

// Для логики (отдельная функция)
const collectAllDataForLogic = (): AllData => {
  return allData.value;
};

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

const goBack = () => {
  emit('go-back');
};

const handleFinish = async () => {
  try {
    isLoading.value = true;
    
    // Собираем все данные
    const data = collectAllDataForLogic();
    
    console.log('Все собранные данные:', data);
    
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
    if (!performerName || !email) {
      errors.push('Не заполнены обязательные поля информации о треке (шаг 3)');
      hasErrors = true;
    }
    
    // Проверка шага 4
    const lastName = data.passportInfo?.lastName || '';
    const firstName = data.passportInfo?.firstName || '';
    if (!lastName || !firstName) {
      errors.push('Не заполнены паспортные данные (шаг 4)');
      hasErrors = true;
    }
    
    // Проверка шага 6
    const confirmNoRightsViolation = data.additionalInfo?.confirmNoRightsViolation || false;
    if (!confirmNoRightsViolation) {
      errors.push('Не подтверждено отсутствие нарушений прав (шаг 6)');
      hasErrors = true;
    }
    
    // Проверка подписи
    if (!data.signature) {
      errors.push('Требуется подпись договора');
      hasErrors = true;
    }
    
    if (hasErrors) {
      errors.forEach(error => ElMessage.error(error));
      isLoading.value = false;
      return;
    }
    
    // Подготавливаем данные для отправки
    const formData = new FormData();
    formData.append('quizData', JSON.stringify(data));
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Сохраняем финальные данные
    const finalData = {
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      totalTracks: calculateTotalTracks(data)
    };
    
    localStorage.setItem('quiz_final_submission', JSON.stringify(finalData));
    
    // Очищаем временные данные
    [1, 2, 3, 4, 5, 6, 7].forEach(step => {
      localStorage.removeItem(`quiz${step}_state`);
    });
    localStorage.removeItem('signature_data');
    
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
onMounted(() => {
  console.log('Данные на последнем шаге:', allData.value);
});
</script>

<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Отправка данных</h4>
  
  <div class="quiz__summary">
    <h5 class="quiz__summary_title">Сводка данных</h5>
    
    <div class="quiz__summary_section">
      <h6>Шаг 1: Количество треков</h6>
      <div class="quiz__summary_content">
        <p v-if="allData.singleCount">Синглов: {{ allData.singleCount }}</p>
        <p v-if="allData.albumCount">Альбомов: {{ allData.albumCount }}</p>
        <p v-if="allData.clipCount">Клипов: {{ allData.clipCount }}</p>
        <p v-if="allData.cardCount">Оформлений карточек: {{ allData.cardCount }}</p>
      </div>
    </div>
    
    <div class="quiz__summary_section" v-if="allData.singleTracks && allData.singleTracks.length > 0">
      <h6>Шаг 2: Синглы</h6>
      <div class="quiz__summary_content">
        <div v-for="(track, index) in allData.singleTracks" :key="index">
          <p><strong>Сингл {{ index + 1 }}:</strong> {{ track.trackName || 'Без названия' }}</p>
        </div>
      </div>
    </div>
    
    <div class="quiz__summary_section" v-if="allData.releaseInfo">
      <h6>Шаг 3: Информация о релизе</h6>
      <div class="quiz__summary_content">
        <p><strong>Артист:</strong> {{ allData.releaseInfo.performerName || 'Не указано' }}</p>
        <p><strong>Email:</strong> {{ allData.releaseInfo.email || 'Не указано' }}</p>
      </div>
    </div>
    
    <div class="quiz__summary_section" v-if="allData.signature">
      <h6>Подпись договора</h6>
      <div class="quiz__summary_content">
        <p>✓ Подпись предоставлена</p>
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
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Продолжить</span>
        <span v-else>Отправка...</span>
      </button>
    </div>
    
    <div class="quiz__form_hint">
      <p class="text_small">
        Нажмите кнопку выше для отправки всех данных из всех форм, включая файлы и подпись.
      </p>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__summary {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg-color);
}
.quiz__summary_title {
  margin-bottom: 20px;
  text-transform: uppercase;
}
.quiz__summary_section {
  margin-bottom: 15px;
  padding-bottom: 15px;
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
}
</style>