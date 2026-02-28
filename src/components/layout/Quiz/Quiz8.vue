<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { sendRequest } from '@/utils/api';
import { useRouter } from 'vue-router';
const router = useRouter();

const emit = defineEmits<{
  'go-back': [];
  'finish': [];
}>();

const isLoading = ref(false);

// Интерфейсы для данных
interface SingleTrack {
  id?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  trackName?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFileBase64?: string;
}

interface AlbumTrack {
  id?: string;
  trackNumber?: number;
  trackName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFileBase64?: string;
}

interface Album {
  id?: string;
  albumName?: string;
  performerName?: string;
  musicAuthor?: string;
  textAuthor?: string;
  tracks?: AlbumTrack[];
}

interface Step1Data {
  singleCount: number;
  albumCount: number;
  clipCount: number;
  cardCount: number;
}

interface Step2Data {
  singleTracks?: SingleTrack[];
  albums?: Album[];
}

interface Step3Data {
  performerName?: string;
  releaseName?: string;
  platforms?: string[];
  otherPlatform?: string;
  releaseDate?: string;
  hasProfanity?: string;
  profanityTracks?: string;
  coverFileName?: string;
  coverFileBase64?: string;
  vkLink?: string;
  email?: string;
}

interface Step4Data {
  userType?: string;
  citizenship?: string;
  otherCitizenship?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  passportNumber?: string;
  passportIssuedBy?: string;
  passportIssueDate?: string;
  registrationAddress?: string;
  legalAddress?: string;
  inn?: string;
  ogrn?: string;
  accountNumber?: string;
  bankName?: string;
  bankInn?: string;
  bankBik?: string;
  correspondentAccount?: string;
  bankLegalAddress?: string;
}

interface Step5Data {
  genre?: string;
  tiktokStartSeconds?: string;
  hasDrugsMention?: string;
  drugsTracks?: string;
  appleMusicFileName?: string;
  appleMusicFileBase64?: string;
  karaokeFileName?: string;
  karaokeFileBase64?: string;
  appleMusicLinks?: string;
  spotifyLinks?: string;
  vkLinks?: string;
  yandexMusicLinks?: string;
  socialLinks?: string;
}

interface Step6Data {
  platforms?: string[];
  otherPlatform?: string;
  rightsInfo?: string;
  rightsContractLink?: string;
  additionalComments?: string;
  promoPlan?: string;
  bandlinkUrl?: string;
  promoCode?: string;
  usePartnerBonuses?: boolean;
  confirmNoRightsViolation?: boolean;
}

interface Step7Data {
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptMarketing?: boolean;
}

interface SignatureData {
  name?: string;
  timestamp?: string;
  ip?: string;
  data?: string;
}

// Данные из localStorage
const step1Data = ref<Step1Data>({ singleCount: 0, albumCount: 0, clipCount: 0, cardCount: 0 });
const step2Data = ref<Step2Data>({});
const step3Data = ref<Step3Data>({});
const step4Data = ref<Step4Data>({});
const step5Data = ref<Step5Data>({});
const step6Data = ref<Step6Data>({});
const step7Data = ref<Step7Data>({});
const signatureData = ref<SignatureData | null>(null);

// Проверка наличия данных
const hasStep1Data = computed(() => {
  return Number(step1Data.value.singleCount || 0) > 0 || 
         Number(step1Data.value.albumCount || 0) > 0 || 
         Number(step1Data.value.clipCount || 0) > 0 || 
         Number(step1Data.value.cardCount || 0) > 0;
});

const hasStep2Data = computed(() => {
  return (step2Data.value.singleTracks && step2Data.value.singleTracks.length > 0) ||
         (step2Data.value.albums && step2Data.value.albums.length > 0);
});

const hasStep3Data = computed(() => {
  return Object.keys(step3Data.value).length > 0;
});

const hasStep4Data = computed(() => {
  return Object.keys(step4Data.value).length > 0;
});

const hasStep5Data = computed(() => {
  return Object.keys(step5Data.value).length > 0;
});

const hasStep6Data = computed(() => {
  return Object.keys(step6Data.value).length > 0;
});

const hasStep7Data = computed(() => {
  return Object.keys(step7Data.value).length > 0;
});

const hasAnyData = computed(() => {
  return hasStep1Data.value || hasStep2Data.value || hasStep3Data.value || 
         hasStep4Data.value || hasStep5Data.value || hasStep6Data.value || 
         hasStep7Data.value || signatureData.value;
});

const allData = computed(() => {
  return {
    step1: step1Data.value,
    step2: step2Data.value,
    step3: step3Data.value,
    step4: step4Data.value,
    step5: step5Data.value,
    step6: step6Data.value,
    step7: step7Data.value,
    signature: signatureData.value
  };
});

// Загрузка всех данных из localStorage
const loadAllData = () => {
  try {
    // Шаг 1
    const step1 = localStorage.getItem('quiz1_state');
    if (step1) {
      const parsed = JSON.parse(step1);
      step1Data.value = {
        singleCount: Number(parsed.singleCount || 0),
        albumCount: Number(parsed.albumCount || 0),
        clipCount: Number(parsed.clipCount || 0),
        cardCount: Number(parsed.cardCount || 0)
      };
    }

    // Шаг 2
    const step2 = localStorage.getItem('quiz2_state');
    if (step2) {
      const parsed = JSON.parse(step2);
      step2Data.value = {
        singleTracks: parsed.singleTracks || [],
        albums: parsed.albums || []
      };
    }

    // Шаг 3
    const step3 = localStorage.getItem('quiz3_state');
    if (step3) {
      const parsed = JSON.parse(step3);
      step3Data.value = {
        performerName: parsed.formData?.performerName,
        releaseName: parsed.formData?.releaseName,
        platforms: parsed.formData?.platforms,
        otherPlatform: parsed.formData?.otherPlatform,
        releaseDate: parsed.formData?.releaseDate,
        hasProfanity: parsed.formData?.hasProfanity,
        profanityTracks: parsed.formData?.profanityTracks,
        coverFileName: parsed.formData?.coverFileName,
        coverFileBase64: parsed.formData?.coverFileBase64,
        vkLink: parsed.formData?.vkLink,
        email: parsed.formData?.email
      };
    }

    // Шаг 4
    const step4 = localStorage.getItem('quiz4_state');
    if (step4) {
      const parsed = JSON.parse(step4);
      step4Data.value = parsed.formData || {};
    }

    // Шаг 5
    const step5 = localStorage.getItem('quiz5_state');
    if (step5) {
      const parsed = JSON.parse(step5);
      step5Data.value = {
        genre: parsed.formData?.genre,
        tiktokStartSeconds: parsed.formData?.tiktokStartSeconds,
        hasDrugsMention: parsed.formData?.hasDrugsMention,
        drugsTracks: parsed.formData?.drugsTracks,
        appleMusicFileName: parsed.formData?.appleMusicFileName,
        appleMusicFileBase64: parsed.formData?.appleMusicFileBase64,
        karaokeFileName: parsed.formData?.karaokeFileName,
        karaokeFileBase64: parsed.formData?.karaokeFileBase64,
        appleMusicLinks: parsed.formData?.appleMusicLinks,
        spotifyLinks: parsed.formData?.spotifyLinks,
        vkLinks: parsed.formData?.vkLinks,
        yandexMusicLinks: parsed.formData?.yandexMusicLinks,
        socialLinks: parsed.formData?.socialLinks
      };
    }

    // Шаг 6
    const step6 = localStorage.getItem('quiz6_state');
    if (step6) {
      const parsed = JSON.parse(step6);
      step6Data.value = parsed.formData || {};
    }

    // Шаг 7
    const step7 = localStorage.getItem('quiz7_state');
    if (step7) {
      const parsed = JSON.parse(step7);
      step7Data.value = parsed.formData || {};
    }

    // Подпись
    const signature = localStorage.getItem('quiz7_signature');
    if (signature) {
      try {
        signatureData.value = JSON.parse(signature);
      } catch {
        signatureData.value = { data: signature };
      }
    }

    console.log('All data loaded from localStorage:', allData.value);
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
};

// Форматирование даты
const formatDate = (date?: string): string => {
  if (!date) return 'Не указано';
  try {
    return new Date(date).toLocaleDateString('ru-RU');
  } catch {
    return date;
  }
};

const formatDateTime = (date?: string): string => {
  if (!date) return 'Не указано';
  try {
    return new Date(date).toLocaleString('ru-RU');
  } catch {
    return date;
  }
};

// Форматирование полного имени
const formatFullName = (data: Step4Data): string => {
  const parts = [data.lastName, data.firstName, data.middleName].filter(Boolean);
  return parts.join(' ') || 'Не указано';
};

// Форматирование платформ
const formatPlatforms = (platforms?: string[], other?: string): string => {
  if (!platforms || platforms.length === 0) return 'Не указано';
  
  const platformNames: Record<string, string> = {
    'all': 'Все площадки',
    'other': 'Другое'
  };
  
  const names = platforms.map(p => platformNames[p] || p);
  if (platforms.includes('other') && other) {
    return [...names.filter(n => n !== 'Другое'), other].join(', ');
  }
  return names.join(', ');
};

// Форматирование источников
const formatSources = (platforms?: string[], other?: string): string => {
  if (!platforms || platforms.length === 0) return 'Не указано';
  
  const sourceNames: Record<string, string> = {
    'social': 'Социальные сети',
    'friends': 'Рекомендация друзей',
    'search': 'Поиск в интернете',
    'youtube': 'YouTube',
    'forums': 'Музыкальные форумы',
    'previous': 'Ранее пользовались',
    'other': 'Другое'
  };
  
  const names = platforms.map(p => sourceNames[p] || p);
  if (platforms.includes('other') && other) {
    return [...names.filter(n => n !== 'Другое'), other].join(', ');
  }
  return names.join(', ');
};

// Расчет общей суммы
const calculateTotal = (): number => {
  const price = 2590;
  const singleCount = Number(step1Data.value.singleCount || 0);
  const albumCount = Number(step1Data.value.albumCount || 0);
  const clipCount = Number(step1Data.value.clipCount || 0);
  const cardCount = Number(step1Data.value.cardCount || 0);
  
  return (singleCount + albumCount + clipCount + cardCount) * price;
};

const goBack = () => {
  emit('go-back');
};

// Функция для конвертации base64 в Blob
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1] || arr[0]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

// Очистка всех данных из localStorage
const clearAllQuizData = (): void => {
  const steps = [1, 2, 3, 4, 5, 6, 7];
  steps.forEach(step => {
    localStorage.removeItem(`quiz${step}_state`);
  });
  localStorage.removeItem('quiz7_signature');
  localStorage.removeItem('signature_data');
  localStorage.removeItem('signature_name');
  console.log('All quiz data cleared from localStorage');
};

// Подготовка FormData с красивыми отдельными полями
const prepareFormData = () => {
  const formData = new FormData();
  
  // ===== ШАГ 1: Основные данные =====
  formData.append('single_count', String(step1Data.value.singleCount || 0));
  formData.append('album_count', String(step1Data.value.albumCount || 0));
  formData.append('clip_count', String(step1Data.value.clipCount || 0));
  formData.append('card_count', String(step1Data.value.cardCount || 0));
  formData.append('total_amount', String(calculateTotal()));
  
  // ===== ШАГ 2: Данные синглов (как JSON) =====
  if (step2Data.value.singleTracks && step2Data.value.singleTracks.length > 0) {
    const singlesData = step2Data.value.singleTracks.map((track: SingleTrack) => ({
      id: track.id,
      performer_name: track.performerName,
      music_author: track.musicAuthor,
      text_author: track.textAuthor,
      track_name: track.trackName,
      audio_file_name: track.audioFileName,
      audio_file_size: track.audioFileSize
    }));
    formData.append('singles', JSON.stringify(singlesData));
  }
  
  // ===== ШАГ 2: Данные альбомов (как JSON) =====
  if (step2Data.value.albums && step2Data.value.albums.length > 0) {
    const albumsData = step2Data.value.albums.map((album: Album) => ({
      id: album.id,
      album_name: album.albumName,
      performer_name: album.performerName,
      music_author: album.musicAuthor,
      text_author: album.textAuthor,
      tracks: album.tracks?.map((track: AlbumTrack) => ({
        id: track.id,
        track_number: track.trackNumber,
        track_name: track.trackName,
        performer_name: track.performerName,
        music_author: track.musicAuthor,
        text_author: track.textAuthor,
        audio_file_name: track.audioFileName,
        audio_file_size: track.audioFileSize
      }))
    }));
    formData.append('albums', JSON.stringify(albumsData));
  }
  
  // ===== ШАГ 3: Информация о релизе =====
  formData.append('performer_name', step3Data.value.performerName || '');
  formData.append('release_name', step3Data.value.releaseName || '');
  formData.append('platforms', JSON.stringify(step3Data.value.platforms || []));
  formData.append('other_platform', step3Data.value.otherPlatform || '');
  formData.append('release_date', step3Data.value.releaseDate || '');
  formData.append('has_profanity', step3Data.value.hasProfanity || '');
  formData.append('profanity_tracks', step3Data.value.profanityTracks || '');
  formData.append('vk_link', step3Data.value.vkLink || '');
  formData.append('email', step3Data.value.email || '');
  
  // ===== ШАГ 4: Паспортные данные =====
  formData.append('user_type', step4Data.value.userType || 'individual');
  formData.append('citizenship', step4Data.value.citizenship || '');
  formData.append('other_citizenship', step4Data.value.otherCitizenship || '');
  formData.append('last_name', step4Data.value.lastName || '');
  formData.append('first_name', step4Data.value.firstName || '');
  formData.append('middle_name', step4Data.value.middleName || '');
  formData.append('passport_number', step4Data.value.passportNumber || '');
  formData.append('passport_issued_by', step4Data.value.passportIssuedBy || '');
  formData.append('passport_issue_date', step4Data.value.passportIssueDate || '');
  formData.append('registration_address', step4Data.value.registrationAddress || '');
  
  // Данные ИП (если есть)
  if (step4Data.value.userType === 'entrepreneur') {
    formData.append('legal_address', step4Data.value.legalAddress || '');
    formData.append('inn', step4Data.value.inn || '');
    formData.append('ogrn', step4Data.value.ogrn || '');
    formData.append('account_number', step4Data.value.accountNumber || '');
    formData.append('bank_name', step4Data.value.bankName || '');
    formData.append('bank_inn', step4Data.value.bankInn || '');
    formData.append('bank_bik', step4Data.value.bankBik || '');
    formData.append('correspondent_account', step4Data.value.correspondentAccount || '');
    formData.append('bank_legal_address', step4Data.value.bankLegalAddress || '');
  }
  
  // ===== ШАГ 5: Жанр и текст =====
  formData.append('genre', step5Data.value.genre || '');
  formData.append('tiktok_start_seconds', step5Data.value.tiktokStartSeconds || '');
  formData.append('has_drugs_mention', step5Data.value.hasDrugsMention || '');
  formData.append('drugs_tracks', step5Data.value.drugsTracks || '');
  formData.append('apple_music_links', step5Data.value.appleMusicLinks || '');
  formData.append('spotify_links', step5Data.value.spotifyLinks || '');
  formData.append('vk_links', step5Data.value.vkLinks || '');
  formData.append('yandex_music_links', step5Data.value.yandexMusicLinks || '');
  formData.append('social_links', step5Data.value.socialLinks || '');
  
  // ===== ШАГ 6: Дополнительная информация =====
  formData.append('source_platforms', JSON.stringify(step6Data.value.platforms || []));
  formData.append('other_source', step6Data.value.otherPlatform || '');
  formData.append('rights_info', step6Data.value.rightsInfo || '');
  formData.append('rights_contract_link', step6Data.value.rightsContractLink || '');
  formData.append('additional_comments', step6Data.value.additionalComments || '');
  formData.append('promo_plan', step6Data.value.promoPlan || '');
  formData.append('bandlink_url', step6Data.value.bandlinkUrl || '');
  formData.append('promo_code', step6Data.value.promoCode || '');
  formData.append('use_partner_bonuses', step6Data.value.usePartnerBonuses ? '1' : '0');
  formData.append('confirm_no_rights_violation', step6Data.value.confirmNoRightsViolation ? '1' : '0');
  
  // ===== ШАГ 7: Договор =====
  formData.append('accept_terms', step7Data.value.acceptTerms ? '1' : '0');
  formData.append('accept_privacy', step7Data.value.acceptPrivacy ? '1' : '0');
  formData.append('accept_marketing', step7Data.value.acceptMarketing ? '1' : '0');
  
  // ===== ПОДПИСЬ =====
  if (signatureData.value) {
    formData.append('signature_name', signatureData.value.name || 'Аноним');
    formData.append('signature_ip', signatureData.value.ip || '');
    formData.append('signature_timestamp', signatureData.value.timestamp || '');
  }
  
  // ===== ФАЙЛЫ =====
  
  // Обложка
  if (step3Data.value.coverFileBase64) {
    const coverBlob = dataURLtoBlob(step3Data.value.coverFileBase64);
    const fileName = step3Data.value.coverFileName || 'cover.png';
    formData.append('cover_file', coverBlob, fileName);
    console.log('Added cover_file:', fileName);
  }
  
  // Аудио файлы из синглов
  if (step2Data.value.singleTracks) {
    step2Data.value.singleTracks.forEach((track: SingleTrack, index: number) => {
      if (track.audioFileBase64) {
        const audioBlob = dataURLtoBlob(track.audioFileBase64);
        const fileName = track.audioFileName || `single_${index}.mp3`;
        formData.append(`single_audio_${index}`, audioBlob, fileName);
        console.log(`Added single_audio_${index}:`, fileName);
      }
    });
  }
  
  // Аудио файлы из альбомов
  if (step2Data.value.albums) {
    step2Data.value.albums.forEach((album: Album, albumIndex: number) => {
      if (album.tracks) {
        album.tracks.forEach((track: AlbumTrack, trackIndex: number) => {
          if (track.audioFileBase64) {
            const audioBlob = dataURLtoBlob(track.audioFileBase64);
            const fileName = track.audioFileName || `album_${albumIndex}_track_${trackIndex}.mp3`;
            formData.append(`album_${albumIndex}_track_${trackIndex}`, audioBlob, fileName);
            console.log(`Added album_${albumIndex}_track_${trackIndex}:`, fileName);
          }
        });
      }
    });
  }
  
  // Текстовые файлы
  if (step5Data.value.appleMusicFileBase64) {
    const appleMusicBlob = dataURLtoBlob(step5Data.value.appleMusicFileBase64);
    const fileName = step5Data.value.appleMusicFileName || 'apple_music.docx';
    formData.append('apple_music_file', appleMusicBlob, fileName);
    console.log('Added apple_music_file:', fileName);
  }
  
  if (step5Data.value.karaokeFileBase64) {
    const karaokeBlob = dataURLtoBlob(step5Data.value.karaokeFileBase64);
    const fileName = step5Data.value.karaokeFileName || 'karaoke.ttml';
    formData.append('karaoke_file', karaokeBlob, fileName);
    console.log('Added karaoke_file:', fileName);
  }
  
  // Подпись
  if (signatureData.value?.data) {
    const signatureBlob = dataURLtoBlob(signatureData.value.data);
    formData.append('signature', signatureBlob, 'signature.png');
    console.log('Added signature file');
  }
  
  // Метаданные
  formData.append('submitted_at', new Date().toISOString());
  
  return formData;
};

const handleFinish = async () => {
  try {
    isLoading.value = true;
    
    // Всегда отправляем через FormData, даже если нет файлов
    console.log('Sending data with separate fields...');
    const formData = prepareFormData();
    
    // Логируем содержимое FormData для отладки
    console.log('FormData contents:');
    for (let pair of (formData as any).entries()) {
      if (pair[1] instanceof Blob) {
        console.log(pair[0] + ': [FILE] ' + (pair[1] as Blob).size + ' bytes');
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }
    
    const response = await sendRequest('post', '/ajax/quiz/submit.php', formData);
    
    console.log('Ответ от сервера:', response.data);
    
    // Проверяем ответ как в Personal.vue
    if (response.data) {
      // Если есть поле error и оно равно 0 - успех
      if (response.data.error === 0) {
        clearAllQuizData();
        
        ElMessage.success({
          message: response.data.message || 'Данные успешно отправлены!',
          duration: 3000
        });
        
        setTimeout(() => {
          emit('finish');
          router.push({ name: 'personal' });
        }, 1500);
        
      } else {
        ElMessage.error({
          message: response.data.message || 'Ошибка при отправке данных',
          duration: 5000
        });
      }
    } else {
      throw new Error('Пустой ответ от сервера');
    }
    
  } catch (error: any) {
    console.error('Ошибка при отправке данных:', error);
    
    ElMessage.error({
      message: error.response?.data?.message || error.message || 'Ошибка при отправке данных',
      duration: 5000
    });
  } finally {
    isLoading.value = false;
  }
};

// Загружаем данные при монтировании
onMounted(() => {
  loadAllData();
});
</script>

<template>
  <div class="quiz__form quiz__form_eight">
    <h4 class="quiz__form_head">Отправка данных</h4>
    <p class="quiz__form_description">Проверьте все введенные данные перед отправкой</p>
    
    <div class="quiz__summary" v-if="Object.keys(allData).length > 0">
      <!-- Шаг 1: Что загружаем -->
      <div class="quiz__summary_section" v-if="hasStep1Data">
        <h5 class="quiz__summary_title">Шаг 1: Что вы хотите загрузить?</h5>
        <div class="quiz__summary_content">
          <div v-if="step1Data.singleCount > 0" class="quiz__summary_item">
            <span class="quiz__summary_label">Синглы:</span>
            <span class="quiz__summary_value">{{ step1Data.singleCount }} шт.</span>
          </div>
          <div v-if="step1Data.albumCount > 0" class="quiz__summary_item">
            <span class="quiz__summary_label">Альбомы:</span>
            <span class="quiz__summary_value">{{ step1Data.albumCount }} шт.</span>
          </div>
          <div v-if="step1Data.clipCount > 0" class="quiz__summary_item">
            <span class="quiz__summary_label">Клипы:</span>
            <span class="quiz__summary_value">{{ step1Data.clipCount }} шт.</span>
          </div>
          <div v-if="step1Data.cardCount > 0" class="quiz__summary_item">
            <span class="quiz__summary_label">Оформление карточки:</span>
            <span class="quiz__summary_value">{{ step1Data.cardCount }} шт.</span>
          </div>
          <div class="quiz__summary_item total">
            <span class="quiz__summary_label">Итого к оплате:</span>
            <span class="quiz__summary_value">{{ calculateTotal() }} ₽</span>
          </div>
        </div>
      </div>

      <!-- Шаг 2: Синглы и альбомы -->
      <div class="quiz__summary_section" v-if="hasStep2Data">
        <h5 class="quiz__summary_title">Шаг 2: Загрузка синглов и альбомов</h5>
        
        <!-- Синглы -->
        <div v-if="step2Data.singleTracks && step2Data.singleTracks.length > 0" class="quiz__summary_subsection">
          <h6 class="quiz__summary_subtitle">Синглы ({{ step2Data.singleTracks.length }})</h6>
          <div v-for="(track, index) in step2Data.singleTracks" :key="track.id" class="quiz__summary_card">
            <div class="quiz__summary_card_header">Сингл {{ Number(index) + 1 }}</div>
            <div class="quiz__summary_card_content">
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Название трека:</span>
                <span class="quiz__summary_value">{{ track.trackName || 'Не указано' }}</span>
              </div>
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Исполнитель:</span>
                <span class="quiz__summary_value">{{ track.performerName || 'Не указано' }}</span>
              </div>
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Автор музыки:</span>
                <span class="quiz__summary_value">{{ track.musicAuthor || 'Не указано' }}</span>
              </div>
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Автор текста:</span>
                <span class="quiz__summary_value">{{ track.textAuthor || 'Не указано' }}</span>
              </div>
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Аудио файл:</span>
                <span class="quiz__summary_value">{{ track.audioFileName || 'Не загружен' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Альбомы -->
        <div v-if="step2Data.albums && step2Data.albums.length > 0" class="quiz__summary_subsection">
          <h6 class="quiz__summary_subtitle">Альбомы ({{ step2Data.albums.length }})</h6>
          <div v-for="(album, albumIndex) in step2Data.albums" :key="album.id" class="quiz__summary_card">
            <div class="quiz__summary_card_header">Альбом {{ Number(albumIndex) + 1 }}</div>
            <div class="quiz__summary_card_content">
              <div class="quiz__summary_item">
                <span class="quiz__summary_label">Название альбома:</span>
                <span class="quiz__summary_value">{{ album.albumName || 'Не указано' }}</span>
              </div>
              
              <!-- Треки альбома -->
              <div v-if="album.tracks && album.tracks.length > 0" class="quiz__summary_tracks">
                <div class="quiz__summary_tracks_label">Треки в альбоме:</div>
                <div v-for="(track, trackIndex) in album.tracks" :key="track.id" class="quiz__summary_track">
                  <div class="quiz__summary_track_header">Трек {{ Number(trackIndex) + 1 }}</div>
                  <div class="quiz__summary_item">
                    <span class="quiz__summary_label">Название:</span>
                    <span class="quiz__summary_value">{{ track.trackName || 'Не указано' }}</span>
                  </div>
                  <div class="quiz__summary_item">
                    <span class="quiz__summary_label">Исполнитель:</span>
                    <span class="quiz__summary_value">{{ track.performerName || 'Не указано' }}</span>
                  </div>
                  <div class="quiz__summary_item">
                    <span class="quiz__summary_label">Аудио файл:</span>
                    <span class="quiz__summary_value">{{ track.audioFileName || 'Не загружен' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Шаг 3: Информация о треке -->
      <div class="quiz__summary_section" v-if="hasStep3Data">
        <h5 class="quiz__summary_title">Шаг 3: Информация о треке</h5>
        <div class="quiz__summary_content">
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Псевдоним артиста:</span>
            <span class="quiz__summary_value">{{ step3Data.performerName || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Название релиза:</span>
            <span class="quiz__summary_value">{{ step3Data.releaseName || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Площадки:</span>
            <span class="quiz__summary_value">{{ formatPlatforms(step3Data.platforms, step3Data.otherPlatform) }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Желаемая дата выхода:</span>
            <span class="quiz__summary_value">{{ formatDate(step3Data.releaseDate) }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Наличие мата:</span>
            <span class="quiz__summary_value">{{ step3Data.hasProfanity === 'yes' ? 'Да' : 'Нет' }}</span>
          </div>
          <div v-if="step3Data.hasProfanity === 'yes'" class="quiz__summary_item">
            <span class="quiz__summary_label">Треки с матом:</span>
            <span class="quiz__summary_value">{{ step3Data.profanityTracks || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Обложка:</span>
            <span class="quiz__summary_value">{{ step3Data.coverFileName || 'Не загружена' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Ссылка на страницу:</span>
            <span class="quiz__summary_value">{{ step3Data.vkLink || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Email:</span>
            <span class="quiz__summary_value">{{ step3Data.email || 'Не указано' }}</span>
          </div>
        </div>
      </div>

      <!-- Шаг 4: Данные паспорта и реквизиты -->
      <div class="quiz__summary_section" v-if="hasStep4Data">
        <h5 class="quiz__summary_title">Шаг 4: Данные паспорта и реквизиты</h5>
        <div class="quiz__summary_content">
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Тип лица:</span>
            <span class="quiz__summary_value">{{ step4Data.userType === 'entrepreneur' ? 'ИП' : 'Физлицо' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Гражданство:</span>
            <span class="quiz__summary_value">{{ step4Data.citizenship === 'RU' ? 'РФ' : (step4Data.otherCitizenship || 'Не указано') }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">ФИО:</span>
            <span class="quiz__summary_value">{{ formatFullName(step4Data) }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Паспорт:</span>
            <span class="quiz__summary_value">{{ step4Data.passportNumber || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Кем выдан:</span>
            <span class="quiz__summary_value">{{ step4Data.passportIssuedBy || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Дата выдачи:</span>
            <span class="quiz__summary_value">{{ formatDate(step4Data.passportIssueDate) }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Адрес регистрации:</span>
            <span class="quiz__summary_value">{{ step4Data.registrationAddress || 'Не указано' }}</span>
          </div>

          <!-- Данные ИП -->
          <template v-if="step4Data.userType === 'entrepreneur'">
            <div class="quiz__summary_divider"></div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Юридический адрес:</span>
              <span class="quiz__summary_value">{{ step4Data.legalAddress || 'Не указано' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">ИНН:</span>
              <span class="quiz__summary_value">{{ step4Data.inn || 'Не указано' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">ОГРН:</span>
              <span class="quiz__summary_value">{{ step4Data.ogrn || 'Не указано' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Расчетный счет:</span>
              <span class="quiz__summary_value">{{ step4Data.accountNumber || 'Не указано' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Банк:</span>
              <span class="quiz__summary_value">{{ step4Data.bankName || 'Не указано' }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Шаг 5: Жанр и текст -->
      <div class="quiz__summary_section" v-if="hasStep5Data">
        <h5 class="quiz__summary_title">Шаг 5: Жанр и текст</h5>
        <div class="quiz__summary_content">
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Жанр:</span>
            <span class="quiz__summary_value">{{ step5Data.genre || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Секунды для TikTok:</span>
            <span class="quiz__summary_value">{{ step5Data.tiktokStartSeconds || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Упоминание наркотиков:</span>
            <span class="quiz__summary_value">{{ step5Data.hasDrugsMention === 'yes' ? 'Да' : 'Нет' }}</span>
          </div>
          <div v-if="step5Data.hasDrugsMention === 'yes'" class="quiz__summary_item">
            <span class="quiz__summary_label">Треки с упоминанием:</span>
            <span class="quiz__summary_value">{{ step5Data.drugsTracks || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Текст для Apple Music:</span>
            <span class="quiz__summary_value">{{ step5Data.appleMusicFileName || 'Не загружен' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Караоке файл:</span>
            <span class="quiz__summary_value">{{ step5Data.karaokeFileName || 'Не загружен' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Ссылки на соцсети:</span>
            <span class="quiz__summary_value">{{ step5Data.socialLinks || 'Не указано' }}</span>
          </div>
        </div>
      </div>

      <!-- Шаг 6: Дополнительная информация -->
      <div class="quiz__summary_section" v-if="hasStep6Data">
        <h5 class="quiz__summary_title">Шаг 6: Дополнительная информация</h5>
        <div class="quiz__summary_content">
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Откуда узнали:</span>
            <span class="quiz__summary_value">{{ formatSources(step6Data.platforms, step6Data.otherPlatform) }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Права на инструменты:</span>
            <span class="quiz__summary_value">{{ step6Data.rightsInfo || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Доп. комментарии:</span>
            <span class="quiz__summary_value">{{ step6Data.additionalComments || 'Нет' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Промо-план:</span>
            <span class="quiz__summary_value">{{ step6Data.promoPlan || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Bandlink:</span>
            <span class="quiz__summary_value">{{ step6Data.bandlinkUrl || 'Не указано' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Промокод:</span>
            <span class="quiz__summary_value">{{ step6Data.promoCode || 'Не указан' }}</span>
          </div>
          <div class="quiz__summary_item">
            <span class="quiz__summary_label">Подтверждение прав:</span>
            <span class="quiz__summary_value">{{ step6Data.confirmNoRightsViolation ? 'Да' : 'Нет' }}</span>
          </div>
        </div>
      </div>

      <!-- Шаг 7: Договор и подпись -->
      <div class="quiz__summary_section" v-if="hasStep7Data || signatureData">
        <h5 class="quiz__summary_title">Шаг 7: Договор и подпись</h5>
        <div class="quiz__summary_content">
          <div v-if="hasStep7Data">
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Принятие оферты:</span>
              <span class="quiz__summary_value">{{ step7Data.acceptTerms ? 'Да' : 'Нет' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Согласие на обработку данных:</span>
              <span class="quiz__summary_value">{{ step7Data.acceptPrivacy ? 'Да' : 'Нет' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Согласие на рассылки:</span>
              <span class="quiz__summary_value">{{ step7Data.acceptMarketing ? 'Да' : 'Нет' }}</span>
            </div>
          </div>
          
          <!-- Информация о подписи -->
          <div v-if="signatureData" class="quiz__summary_subsection">
            <h6 class="quiz__summary_subtitle">Подпись</h6>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Имя:</span>
              <span class="quiz__summary_value">{{ signatureData.name || 'Аноним' }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">Дата подписи:</span>
              <span class="quiz__summary_value">{{ formatDateTime(signatureData.timestamp) }}</span>
            </div>
            <div class="quiz__summary_item">
              <span class="quiz__summary_label">IP-адрес:</span>
              <span class="quiz__summary_value">{{ signatureData.ip || 'Не определен' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="quiz__summary_empty">
      <p>Нет данных для отображения</p>
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
          :disabled="isLoading || !hasAnyData"
        >
          <span v-if="!isLoading">Отправить данные</span>
          <span v-else>Отправка...</span>
        </button>
      </div>
      
      <div class="quiz__form_hint">
        <p class="text_small">
          Нажмите кнопку выше для отправки всех данных
        </p>
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
.quiz__summary {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg-color);
}
.quiz__summary_section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}
.quiz__summary_section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.quiz__summary_title {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color);
}
.quiz__summary_subsection {
  margin-top: 20px;
}
.quiz__summary_subtitle {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
}
.quiz__summary_content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quiz__summary_item {
  display: flex;
  padding: 5px 0;
  border-bottom: 1px dashed var(--border-light);
}
.quiz__summary_item:last-child {
  border-bottom: none;
}
.quiz__summary_item.total {
  margin-top: 10px;
  font-weight: 600;
  color: var(--color);
  border-top: 2px solid var(--border);
  border-bottom: none;
  padding-top: 10px;
}
.quiz__summary_label {
  flex: 0 0 200px;
  color: var(--text-gray);
  font-size: 14px;
}
.quiz__summary_value {
  flex: 1;
  font-weight: 500;
  word-break: break-word;
}
.quiz__summary_card {
  margin: 15px 0;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--bg);
}
.quiz__summary_card_header {
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--color);
}
.quiz__summary_tracks {
  margin-top: 15px;
  padding-left: 15px;
}
.quiz__summary_tracks_label {
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--text-gray);
}
.quiz__summary_track {
  margin: 10px 0;
  padding: 10px;
  border-left: 2px solid var(--border);
  background-color: var(--bg-light);
}
.quiz__summary_track_header {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color);
}
.quiz__summary_divider {
  height: 1px;
  margin: 15px 0;
  background-color: var(--border);
}
.quiz__summary_empty {
  padding: 40px;
  text-align: center;
  color: var(--text-gray);
  border: 1px dashed var(--border);
  border-radius: 8px;
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
  .quiz__summary_item {
    flex-direction: column;
    gap: 5px;
  }
  .quiz__summary_label {
    flex: none;
  }
  .quiz__form {
    padding: 0;
  }
}
</style>