<script lang="ts" setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

// Получаем экземпляр компонента для доступа к родителю
const instance = getCurrentInstance();
const parent = instance?.parent;

// Состояние загрузки
const isLoading = ref(false);

const goBack = () => {
  emit('go-back');
};

// Функция для извлечения реальных данных из Proxy
const extractData = (proxyData: any): any => {
  if (!proxyData) return null;
  
  // Если это Proxy от Vue 3, извлекаем raw value
  if (proxyData.__v_raw !== undefined) {
    return proxyData.__v_raw;
  }
  
  // Если это Ref, получаем значение
  if (proxyData.value !== undefined && typeof proxyData === 'object' && '_value' in proxyData) {
    return proxyData.value;
  }
  
  // Если это обычный объект или массив, копируем его
  if (Array.isArray(proxyData)) {
    return proxyData.map(item => extractData(item));
  }
  
  if (typeof proxyData === 'object' && proxyData !== null) {
    const result: Record<string, any> = {};
    for (const key in proxyData) {
      result[key] = extractData(proxyData[key]);
    }
    return result;
  }
  
  return proxyData;
};

// Функция для сбора всех данных из форм
const collectAllData = () => {
  const allData: Record<string, any> = {};
  
  // Получаем данные из родительского компонента
  if (parent?.exposed) {
    const quizState = parent.exposed.quizState || {};
    
    // Извлекаем все данные из quizState
    Object.keys(quizState).forEach(key => {
      allData[key] = extractData(quizState[key]);
    });
    
    // Добавляем общую сумму
    if (parent.exposed.totalSum) {
      allData.totalSum = extractData(parent.exposed.totalSum);
    }
    
    // Если есть отдельные методы для получения данных, используем их
    if (parent.exposed.getSingleTracks) {
      allData.singleTracks = extractData(parent.exposed.getSingleTracks());
    }
    
    if (parent.exposed.getAlbumTracks) {
      allData.albumTracks = extractData(parent.exposed.getAlbumTracks());
    }
    
    if (parent.exposed.getFormData) {
      const formData = parent.exposed.getFormData();
      Object.assign(allData, extractData(formData));
    }
    
    // Собираем данные из всех шагов напрямую
    const stepsData: Record<string, any> = {};
    
    // Данные из Quiz1
    if (quizState.singleCount !== undefined) stepsData.singleCount = extractData(quizState.singleCount);
    if (quizState.albumCount !== undefined) stepsData.albumCount = extractData(quizState.albumCount);
    if (quizState.clipCount !== undefined) stepsData.clipCount = extractData(quizState.clipCount);
    if (quizState.cardCount !== undefined) stepsData.cardCount = extractData(quizState.cardCount);
    
    // Данные из Quiz2
    if (quizState.singleTracks !== undefined) stepsData.singleTracks = extractData(quizState.singleTracks);
    if (quizState.albumTracks !== undefined) stepsData.albumTracks = extractData(quizState.albumTracks);
    
    // Данные из Quiz3
    if (quizState.releaseInfo !== undefined) stepsData.releaseInfo = extractData(quizState.releaseInfo);
    if (quizState.performerName !== undefined) stepsData.performerName = extractData(quizState.performerName);
    if (quizState.releaseName !== undefined) stepsData.releaseName = extractData(quizState.releaseName);
    if (quizState.platforms !== undefined) stepsData.platforms = extractData(quizState.platforms);
    if (quizState.releaseDate !== undefined) stepsData.releaseDate = extractData(quizState.releaseDate);
    if (quizState.hasProfanity !== undefined) stepsData.hasProfanity = extractData(quizState.hasProfanity);
    if (quizState.profanityTracks !== undefined) stepsData.profanityTracks = extractData(quizState.profanityTracks);
    if (quizState.vkLink !== undefined) stepsData.vkLink = extractData(quizState.vkLink);
    if (quizState.email !== undefined) stepsData.email = extractData(quizState.email);
    if (quizState.coverFile !== undefined) stepsData.coverFile = extractData(quizState.coverFile);
    
    // Данные из Quiz4
    if (quizState.userType !== undefined) stepsData.userType = extractData(quizState.userType);
    if (quizState.citizenship !== undefined) stepsData.citizenship = extractData(quizState.citizenship);
    if (quizState.lastName !== undefined) stepsData.lastName = extractData(quizState.lastName);
    if (quizState.firstName !== undefined) stepsData.firstName = extractData(quizState.firstName);
    if (quizState.middleName !== undefined) stepsData.middleName = extractData(quizState.middleName);
    if (quizState.passportNumber !== undefined) stepsData.passportNumber = extractData(quizState.passportNumber);
    if (quizState.passportIssuedBy !== undefined) stepsData.passportIssuedBy = extractData(quizState.passportIssuedBy);
    if (quizState.passportIssueDate !== undefined) stepsData.passportIssueDate = extractData(quizState.passportIssueDate);
    if (quizState.registrationAddress !== undefined) stepsData.registrationAddress = extractData(quizState.registrationAddress);
    
    // Данные из Quiz5
    if (quizState.genre !== undefined) stepsData.genre = extractData(quizState.genre);
    if (quizState.tiktokStartSeconds !== undefined) stepsData.tiktokStartSeconds = extractData(quizState.tiktokStartSeconds);
    if (quizState.hasDrugsMention !== undefined) stepsData.hasDrugsMention = extractData(quizState.hasDrugsMention);
    if (quizState.drugsTracks !== undefined) stepsData.drugsTracks = extractData(quizState.drugsTracks);
    if (quizState.appleMusicLinks !== undefined) stepsData.appleMusicLinks = extractData(quizState.appleMusicLinks);
    if (quizState.spotifyLinks !== undefined) stepsData.spotifyLinks = extractData(quizState.spotifyLinks);
    if (quizState.vkLinks !== undefined) stepsData.vkLinks = extractData(quizState.vkLinks);
    if (quizState.yandexMusicLinks !== undefined) stepsData.yandexMusicLinks = extractData(quizState.yandexMusicLinks);
    if (quizState.socialLinks !== undefined) stepsData.socialLinks = extractData(quizState.socialLinks);
    
    // Данные из Quiz6
    if (quizState.rightsInfo !== undefined) stepsData.rightsInfo = extractData(quizState.rightsInfo);
    if (quizState.additionalComments !== undefined) stepsData.additionalComments = extractData(quizState.additionalComments);
    if (quizState.promoPlan !== undefined) stepsData.promoPlan = extractData(quizState.promoPlan);
    if (quizState.bandlinkUrl !== undefined) stepsData.bandlinkUrl = extractData(quizState.bandlinkUrl);
    if (quizState.promoCode !== undefined) stepsData.promoCode = extractData(quizState.promoCode);
    
    // Данные из Quiz7
    if (quizState.acceptTerms !== undefined) stepsData.acceptTerms = extractData(quizState.acceptTerms);
    if (quizState.acceptPrivacy !== undefined) stepsData.acceptPrivacy = extractData(quizState.acceptPrivacy);
    if (quizState.acceptMarketing !== undefined) stepsData.acceptMarketing = extractData(quizState.acceptMarketing);
    
    // Объединяем все данные
    Object.assign(allData, stepsData);
  }
  
  return allData;
};

const handleFinish = async () => {
  try {
    isLoading.value = true;
    
    // Собираем все данные
    const allData = collectAllData();
    
    console.log('Данные для отправки (RAW):', allData);
    
    // Проверяем, что данные есть
    if (Object.keys(allData).length === 0) {
      ElMessage.error('Нет данных для отправки');
      return;
    }
    
    // Подготовка данных для отправки - используем JSON для простоты
    const dataToSend = JSON.parse(JSON.stringify(allData, (_, value) => {
      // Исключаем файлы из JSON (они не сериализуемы)
      if (value instanceof File) {
        return {
          _type: 'File',
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified
        };
      }
      return value;
    }));
    
    // Добавляем метаданные
    dataToSend.timestamp = new Date().toISOString();
    dataToSend.submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Имитация отправки данных на сервер
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // В реальном приложении:
    // const response = await fetch('/api/submit-quiz', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(dataToSend),
    // });
    
    console.log('Данные отправлены на сервер:', dataToSend);
    
    ElMessage.success({
      message: 'Все данные успешно отправлены!',
      duration: 3000
    });
    
    // Оповещаем родительский компонент о завершении
    if (parent?.exposed?.onFinish) {
      parent.exposed.onFinish();
    }
    
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

onMounted(() => {
  const allData = collectAllData();
  console.log('Quiz8 mounted, все данные:', allData);
  console.log('Структура данных:', Object.keys(allData));
});
</script>

<template>
<div class="quiz__form quiz__form_eight">
  <h4 class="quiz__form_head">Финал</h4>
  <p class="quiz__form_description">Все данные заполнены. Нажмите кнопку ниже для отправки.</p>
  
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
        <span v-if="!isLoading">Отправить данные</span>
        <span v-else>Отправка...</span>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form {
  width: calc(100% - 330px);
  padding: 0 40px 0 60px;
}
.quiz__form_head {
  margin-bottom: 20px;
}
.quiz__form_description {
  color: var(--text-gray);
  margin-bottom: 40px;
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
  .quiz__form_buttons {
    width: 100%;
    flex-direction: column;
    gap: 15px;
  }
  .form__back,
  .quiz__form_button {
    width: 100%;
    justify-content: center;
  }
}
</style>