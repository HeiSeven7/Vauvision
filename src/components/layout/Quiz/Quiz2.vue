<template>
<div class="quiz__form quiz__form_two" v-if="!showImportantBlock">
  <div class="quiz__form_top">
    <h4 class="quiz__form_head">Загрузка синглов и альбомов</h4>
    <button 
      class="quiz__additional button__second button" 
      @click="openPopup"
    >
      <span>Дополнительная информация</span>
    </button>
  </div>
  
  <!-- Кнопки для массовой загрузки аудиофайлов -->
  <div class="quiz__form_two_controls">
    <button 
      v-if="showUploadAllSinglesButton"
      class="quiz__form_button button__black button" 
      @click="uploadAllSingles"
      :disabled="isLoadingTwo || isUploadingAllSingles"
    >
      <span v-if="!isUploadingAllSingles">Загрузить все синглы</span>
      <span v-else>Загрузка... {{ uploadedSinglesCount }}/{{ singleTracks.length }}</span>
    </button>
    <button 
      v-if="albums.length > 0 && !hasAnyAlbumTracksWithFiles"
      class="quiz__form_button button__black button" 
      @click="uploadAllAlbumTracks"
      :disabled="isLoadingTwo || isUploadingAllAlbums"
    >
      <span v-if="!isUploadingAllAlbums">Загрузить все треки в альбом</span>
      <span v-else>Загрузка... {{ uploadedAlbumsCount }}/{{ totalTracksToUploadCount }}</span>
    </button>
  </div>
  
  <!-- Попап с дополнительной информацией -->
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="isPopupVisible" class="quiz-popup__overlay" @click.self="closePopup">
        <div class="quiz-popup">
          <button class="quiz-popup__close" @click="closePopup">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="quiz-popup__content">
            <div class="quiz-popup__body">
              <div class="quiz-popup__instruction-block">
                <p>Выделите и выберите все нужные синглы *</p>
                <p>?</p>
                <p>Назовите файл трека по образцу: «# трека. Артист — Название».</p>
                <p>Например «1. КРЕСТ — SHiNE (prod. by CLONNEX)»</p>
                <p>Формат только .wav, разрядность только 16 bit</p>
              </div>
            </div>
            
            <div class="quiz-popup__footer">
              <button class="quiz-popup__button button__black button" @click="closePopup">
                <span>Понятно</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  
  <div class="quiz__form_two_empty" v-if="showUploadAllSinglesButton">
    <div class="quiz__form_two_lists">
      <p class="quiz__form_two_description text_small">Отметить артистов можно 3 способами:</p>
      <ul class="quiz__form_two_list">
        <li class="form__hint_item">
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
  
  <!-- СИНГЛЫ - показываем если есть загруженные синглы -->
  <div class="quiz__section" v-if="singleTracks.length > 0 && dataLoaded && hasAnySingleTracksWithFiles">
    <h4 class="quiz__section_title">Синглы</h4>
    
    <div class="quiz__singles_list">
      <div 
        v-for="(track, trackIndex) in singleTracks" 
        :key="track.id"
        class="quiz__single_item"
      >
        <h5 class="quiz__single_item_title">Сингл {{ trackIndex + 1 }}</h5>
        
        <!-- Информация о загруженном аудио -->
        <div class="quiz__form_single_audio_info">
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
        <div class="form__flex">
          <div class="form__group">
            <label class="form__label button">ФИО исполнителей<span>*</span></label>
            <el-input
              v-model="track.performerName"
              type="text"
              placeholder="Введите ФИО исполнителя"
              :disabled="isLoadingTwo"
              size="large"
              @input="() => validateSingleOnChange(trackIndex, 'performerName')"
              @blur="validateSinglePerformerName(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.performerName" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].performerName }}
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
              @input="() => validateSingleOnChange(trackIndex, 'musicAuthor')"
              @blur="validateSingleMusicAuthor(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.musicAuthor" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].musicAuthor }}
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
              @input="() => validateSingleOnChange(trackIndex, 'textAuthor')"
              @blur="validateSingleTextAuthor(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.textAuthor" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].textAuthor }}
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
              @input="() => validateSingleOnChange(trackIndex, 'trackName')"
              @blur="validateSingleTrackName(trackIndex)"
            />
            <div v-if="singleErrors[trackIndex]?.trackName" class="error text_very quiz__form_single_error">
              {{ singleErrors[trackIndex].trackName }}
            </div>
          </div>
        </div>
        
        <!-- Кнопка удаления сингла -->
        <div class="quiz__single_footer">
          <button 
            class="quiz__single_track_remove button__red button" 
            @click="removeSingleTrack(trackIndex)"
          >
            <span>Удалить сингл</span>
          </button>
        </div>
        
        <!-- Сообщение об ошибке загрузки аудио -->
        <div v-if="singleErrors[trackIndex]?.audioFile" class="error text_very quiz__form_single_error">
          {{ singleErrors[trackIndex].audioFile }}
        </div>
      </div>
    </div>
    
    <!-- Кнопка добавления нового сингла - под списком синглов -->
    <div class="quiz__add_single_button" v-if="canAddMoreSingles">
      <button 
        class="quiz__form_button button__black button" 
        @click="addSingleTrackWithFile"
        :disabled="isLoadingTwo"
      >
        <span>+ Добавить сингл ({{ singleTracks.length }}/{{ singleCountFromQuiz1 }})</span>
      </button>
    </div>
  </div>
  
  <!-- АЛЬБОМЫ - показываем только если есть треки в альбоме -->
  <div class="quiz__section" v-if="albums.length > 0 && dataLoaded && hasAnyAlbumTracksWithFiles">
    <div class="quiz__albums_list">
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
              @input="() => validateAlbumNameOnChange(albumIndex)"
              @blur="validateAlbumName(albumIndex)"
            />
            <div v-if="albumErrors[albumIndex]?.albumName" class="error text_very quiz__form_single_error">
              {{ albumErrors[albumIndex].albumName }}
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
              <!-- Информация о загруженном аудио трека -->
              <div class="quiz__album_track_audio_info">
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
              
              <!-- Поля для ввода информации о треке -->
              <div class="form__flex">
                <div class="form__group">
                  <label class="form__label button">ФИО исполнителей<span>*</span></label>
                  <el-input
                    v-model="track.performerName"
                    type="text"
                    placeholder="Введите ФИО исполнителя"
                    :disabled="isLoadingTwo"
                    size="large"
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'performerName')"
                    @blur="validateAlbumTrackPerformerName(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.performerName" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].performerName }}
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
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'musicAuthor')"
                    @blur="validateAlbumTrackMusicAuthor(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.musicAuthor" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].musicAuthor }}
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
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'textAuthor')"
                    @blur="validateAlbumTrackTextAuthor(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.textAuthor" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].textAuthor }}
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
                    @input="() => validateAlbumTrackOnChange(albumIndex, trackIndex, 'trackName')"
                    @blur="validateAlbumTrackTrackName(albumIndex, trackIndex)"
                  />
                  <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.trackName" class="error text_very quiz__form_single_error">
                    {{ albumErrors[albumIndex].tracks[trackIndex].trackName }}
                  </div>
                </div>
              </div>
              
              <!-- Кнопка удаления трека -->
              <div class="quiz__album_track_footer">
                <button 
                  class="quiz__album_track_remove button__red button" 
                  @click="removeAlbumTrack(albumIndex, trackIndex)"
                >
                  <span>Удалить трек</span>
                </button>
              </div>
              
              <!-- Сообщение об ошибке загрузки аудио -->
              <div v-if="albumErrors[albumIndex]?.tracks[trackIndex]?.audioFile" class="error text_very quiz__form_single_error">
                {{ albumErrors[albumIndex].tracks[trackIndex].audioFile }}
              </div>
            </div>
          </div>
          
          <!-- Кнопка добавления нового трека -->
          <div class="quiz__album_add_track" v-if="album.tracks.length < 20">
            <button 
              class="quiz__form_single_button button__red button" 
              @click="() => addAlbumTrackWithFile(albumIndex)"
              :disabled="isLoadingTwo"
            >
              <span>+ Добавить трек в альбом ({{ album.tracks.length }}/20)</span>
            </button>
          </div>
          <div v-else class="quiz__album_max_tracks_warning">
            <p class="text_small warning">Достигнут лимит треков в альбоме (максимум 20)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="quiz__form_bottom" v-if="dataLoaded && (singleTracks.length > 0 || albums.length > 0) && hasAnySingleTracksWithFiles && hasAnyAlbumTracksWithFiles">
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
  <div v-else-if="dataLoaded && (singleTracks.length === 0 && albums.length === 0)" class="quiz__no_items">
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

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElInput, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import CloseSVG from "@/uikit/icon/CloseSVG.vue";
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Ключи для хранения
const STORAGE_KEY = 'quiz2_state';
const DB_NAME = 'quizDB';
const AUDIO_DB_NAME = 'audioDB';
const DB_VERSION = 2;
const STORE_NAME = 'quizState';
const AUDIO_STORE_NAME = 'audio';

// Локальные состояния
const isLoadingTwo = ref(false);
const showImportantBlock = ref(false);
const quizDB = ref<any>(null);
const audioDB = ref<any>(null);
const dataLoaded = ref(false);
const dbInitialized = ref(false);
const audioDBInitialized = ref(false);

// Состояния для массовой загрузки
const isUploadingAllSingles = ref(false);
const isUploadingAllAlbums = ref(false);
const uploadedSinglesCount = ref(0);
const uploadedAlbumsCount = ref(0);

// Состояние попапа
const isPopupVisible = ref(false);

// Флаги
const singleCountFromQuiz1 = ref(0);
const albumCountFromQuiz1 = ref(0);

// Показывать кнопку "Загрузить все синглы" - если есть пустые синглы и нет ни одного загруженного
const showUploadAllSinglesButton = computed(() => {
  if (singleTracks.value.length === 0) return false;
  const hasUnuploaded = singleTracks.value.some(track => !track.hasAudioUploaded);
  const hasUploaded = singleTracks.value.some(track => track.hasAudioUploaded);
  return hasUnuploaded && !hasUploaded;
});

// Можно добавить больше синглов
const canAddMoreSingles = computed(() => {
  return singleTracks.value.length < singleCountFromQuiz1.value;
});

// Есть ли в синглах хотя бы один загруженный файл
const hasAnySingleTracksWithFiles = computed(() => {
  if (singleTracks.value.length === 0) return false;
  return singleTracks.value.some(track => track.audioFile !== null);
});

// Есть ли в альбомах хотя бы один трек с файлом
const hasAnyAlbumTracksWithFiles = computed(() => {
  if (albums.value.length === 0) return false;
  return albums.value.some(album => album.tracks.some(track => track.audioFile !== null));
});

// Общее количество треков для загрузки в альбомы
const totalTracksToUploadCount = computed(() => {
  let count = 0;
  albums.value.forEach(album => {
    album.tracks.forEach(track => {
      if (!track.audioFile) count++;
    });
  });
  return count;
});

// Запрещенные слова
const forbiddenWords = ['нет', 'такой', 'информации', 'не', 'знаю', 'откуда'];

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
  audioFileId: string | null;
  uploaded: boolean;
}

// Ошибки валидации для синглов
const singleErrors = ref<Array<{
  performerName: string;
  musicAuthor: string;
  textAuthor: string;
  trackName: string;
  audioFile: string;
}>>([]);

// Ошибки валидации для альбомов
const albumErrors = ref<Array<{
  albumName: string;
  tracks: Array<{
    performerName: string;
    musicAuthor: string;
    textAuthor: string;
    trackName: string;
    audioFile: string;
  }>;
}>>([]);

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
  audioFileId: string | null;
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

// Инициализация IndexedDB
const initDB = async () => {
  try {
    console.log('Quiz2: Initializing IndexedDB...');
    
    quizDB.value = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz2: Upgrading DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          console.log('Quiz2: Created quizState store');
        }
      },
    });
    
    audioDB.value = await openDB(AUDIO_DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Quiz2: Upgrading Audio DB from version ${oldVersion} to ${newVersion}`);
        
        if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
          const store = db.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' });
          store.createIndex('fileName', 'fileName');
          console.log('Quiz2: Created audio store');
        }
      },
    });
    
    dbInitialized.value = true;
    audioDBInitialized.value = true;
    console.log('Quiz2: IndexedDB initialized successfully');
    
  } catch (error) {
    console.error('Quiz2: Error initializing IndexedDB:', error);
    dbInitialized.value = false;
    audioDBInitialized.value = false;
  }
};

// Безопасное выполнение операций с БД
const safeDBOperation = async <T>(
  operation: () => Promise<T>, 
  fallback: T,
  dbType: 'quiz' | 'audio' = 'quiz'
): Promise<T> => {
  const db = dbType === 'quiz' ? quizDB.value : audioDB.value;
  const initialized = dbType === 'quiz' ? dbInitialized.value : audioDBInitialized.value;
  const storeName = dbType === 'quiz' ? STORE_NAME : AUDIO_STORE_NAME;
  
  if (!initialized || !db) {
    console.log(`Quiz2: ${dbType} DB not initialized`);
    return fallback;
  }
  
  try {
    if (!db.objectStoreNames || !db.objectStoreNames.contains(storeName)) {
      console.log(`Quiz2: Store ${storeName} not found in ${dbType} DB. Available stores:`, 
                  db.objectStoreNames ? Array.from(db.objectStoreNames) : []);
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    console.error(`Quiz2: Error in ${dbType} DB operation:`, error);
    return fallback;
  }
};

// Сохранение файла в IndexedDB
const saveAudioToDB = async (file: File, fileId: string): Promise<void> => {
  await safeDBOperation(
    async () => {
      const blob = new Blob([file], { type: file.type });
      await audioDB.value.put(AUDIO_STORE_NAME, {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        data: blob,
        timestamp: Date.now()
      });
      console.log(`Quiz2: Audio saved to DB with ID: ${fileId}`);
    },
    null,
    'audio'
  );
};

// Загрузка файла из IndexedDB
const loadAudioFromDB = async (fileId: string): Promise<{ file: File; fileName: string; fileSize: number } | null> => {
  return safeDBOperation(
    async () => {
      const stored = await audioDB.value.get(AUDIO_STORE_NAME, fileId);
      if (stored) {
        const file = new File([stored.data], stored.fileName, { type: stored.fileType });
        return {
          file,
          fileName: stored.fileName,
          fileSize: stored.fileSize
        };
      }
      return null;
    },
    null,
    'audio'
  );
};

// Удаление файла из IndexedDB
const removeAudioFromDB = async (fileId: string) => {
  await safeDBOperation(
    async () => {
      await audioDB.value.delete(AUDIO_STORE_NAME, fileId);
      console.log(`Quiz2: Audio removed from DB with ID: ${fileId}`);
    },
    null,
    'audio'
  );
};

// Получение количества синглов и альбомов из Quiz1
const getCountsFromQuiz1 = async () => {
  return safeDBOperation(
    async () => {
      const quiz1State = await quizDB.value.get(STORE_NAME, 'quiz1_state');
      if (quiz1State) {
        return {
          singleCount: quiz1State.singleCount || 0,
          albumCount: quiz1State.albumCount || 0
        };
      }
      return { singleCount: 0, albumCount: 0 };
    },
    { singleCount: 0, albumCount: 0 }
  );
};

// Создание пустых синглов (только при инициализации)
const createEmptySingles = (count: number) => {
  singleTracks.value = [];
  for (let i = 0; i < count; i++) {
    singleTracks.value.push({
      id: `single-${Date.now()}-${i}-${Math.random()}`,
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      trackName: '',
      audioFile: null,
      audioFileName: '',
      audioFileSize: 0,
      audioFileId: null,
      uploaded: false,
      hasAudioUploaded: false
    });
  }
};

// Создание пустых альбомов
const createEmptyAlbums = (count: number) => {
  albums.value = [];
  for (let i = 0; i < count; i++) {
    albums.value.push({
      id: `album-${Date.now()}-${i}-${Math.random()}`,
      albumName: '',
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      tracks: []
    });
  }
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  await safeDBOperation(
    async () => {
      const stateToSave = {
        id: STORAGE_KEY,
        singleTracks: singleTracks.value.map(track => ({
          id: track.id,
          performerName: track.performerName,
          musicAuthor: track.musicAuthor,
          textAuthor: track.textAuthor,
          trackName: track.trackName,
          audioFileName: track.audioFileName || '',
          audioFileSize: track.audioFileSize || 0,
          uploaded: track.uploaded || false,
          hasAudioUploaded: track.hasAudioUploaded || false,
          audioFileId: track.audioFileId || null
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
            audioFileName: track.audioFileName || '',
            audioFileSize: track.audioFileSize || 0,
            uploaded: track.uploaded || false,
            audioFileId: track.audioFileId || null
          }))
        })),
        timestamp: Date.now()
      };
      
      await quizDB.value.put(STORE_NAME, stateToSave);
      console.log('Quiz2: State saved to IndexedDB');
      
      window.dispatchEvent(new CustomEvent('quiz-data-updated'));
    },
    null
  );
};

// Загрузка синглов из сохраненного состояния
const loadSinglesFromStorage = async (savedState: any, requiredCount: number) => {
  if (savedState && savedState.singleTracks && savedState.singleTracks.length === requiredCount) {
    console.log('Quiz2: Loading saved singles:', savedState.singleTracks.length);
    
    singleTracks.value = await Promise.all(
      savedState.singleTracks.map(async (track: any, index: number) => {
        let audioFile = null;
        
        if (track.audioFileId) {
          const audioData = await loadAudioFromDB(track.audioFileId);
          if (audioData) {
            audioFile = audioData.file;
          }
        }
        
        return {
          id: track.id || `single-${Date.now()}-${index}-${Math.random()}`,
          performerName: track.performerName || '',
          musicAuthor: track.musicAuthor || '',
          textAuthor: track.textAuthor || '',
          trackName: track.trackName || '',
          audioFile: audioFile,
          audioFileName: track.audioFileName || '',
          audioFileSize: track.audioFileSize || 0,
          audioFileId: track.audioFileId || null,
          uploaded: track.uploaded || false,
          hasAudioUploaded: track.hasAudioUploaded || false
        };
      })
    );
  } else {
    console.log(`Quiz2: Creating ${requiredCount} new empty singles`);
    createEmptySingles(requiredCount);
  }
  
  singleErrors.value = singleTracks.value.map(() => ({
    performerName: '',
    musicAuthor: '',
    textAuthor: '',
    trackName: '',
    audioFile: ''
  }));
};

// Загрузка альбомов из сохраненного состояния
const loadAlbumsFromStorage = async (savedState: any, requiredCount: number) => {
  if (savedState && savedState.albums && savedState.albums.length === requiredCount) {
    console.log('Quiz2: Loading saved albums:', savedState.albums.length);
    
    albums.value = await Promise.all(
      savedState.albums.map(async (album: any, albumIndex: number) => {
        const newAlbum = {
          id: album.id || `album-${Date.now()}-${albumIndex}-${Math.random()}`,
          albumName: album.albumName || '',
          performerName: album.performerName || '',
          musicAuthor: album.musicAuthor || '',
          textAuthor: album.textAuthor || '',
          tracks: [] as AlbumTrack[]
        };
        
        if (album.tracks && Array.isArray(album.tracks) && album.tracks.length > 0) {
          newAlbum.tracks = await Promise.all(
            album.tracks.map(async (track: any, trackIndex: number) => {
              let audioFile = null;
              
              if (track.audioFileId) {
                const audioData = await loadAudioFromDB(track.audioFileId);
                if (audioData) {
                  audioFile = audioData.file;
                }
              }
              
              return {
                id: track.id || `album-track-${Date.now()}-${trackIndex}-${Math.random()}`,
                trackNumber: track.trackNumber || trackIndex + 1,
                trackName: track.trackName || '',
                performerName: track.performerName || album.performerName || '',
                musicAuthor: track.musicAuthor || album.musicAuthor || '',
                textAuthor: track.textAuthor || album.textAuthor || '',
                audioFile: audioFile,
                audioFileName: track.audioFileName || '',
                audioFileSize: track.audioFileSize || 0,
                audioFileId: track.audioFileId || null,
                uploaded: track.uploaded || false
              };
            })
          );
        }
        
        return newAlbum;
      })
    );
  } else {
    console.log(`Quiz2: Creating ${requiredCount} new empty albums`);
    createEmptyAlbums(requiredCount);
  }
  
  albumErrors.value = albums.value.map(album => ({
    albumName: '',
    tracks: album.tracks.map(() => ({
      performerName: '',
      musicAuthor: '',
      textAuthor: '',
      trackName: '',
      audioFile: ''
    }))
  }));
};

// Загрузка состояния из IndexedDB
const loadStateFromDB = async () => {
  if (!dbInitialized.value) {
    console.log('Quiz2: DB not initialized, skipping load');
    return;
  }
  
  await safeDBOperation(
    async () => {
      console.log('Quiz2: Loading state from IndexedDB...');
      const savedState = await quizDB.value.get(STORE_NAME, STORAGE_KEY);
      const counts = await getCountsFromQuiz1();
      
      console.log('Quiz2: Quiz1 counts:', counts);
      console.log('Quiz2: Saved state:', savedState);
      
      singleCountFromQuiz1.value = counts.singleCount;
      albumCountFromQuiz1.value = counts.albumCount;
      
      if (counts.singleCount > 0) {
        await loadSinglesFromStorage(savedState, counts.singleCount);
      } else {
        singleTracks.value = [];
        singleErrors.value = [];
      }
      
      if (counts.albumCount > 0) {
        await loadAlbumsFromStorage(savedState, counts.albumCount);
      } else {
        albums.value = [];
        albumErrors.value = [];
      }
      
      console.log('Quiz2: Final data loaded:', {
        singles: singleTracks.value.length,
        albums: albums.value.length
      });
    },
    null
  );
};

// Проверка готовности к продолжению
const isReadyForNextStep = computed(() => {
  // Проверяем все синглы
  const allSinglesComplete = singleTracks.value.every((track, index) => 
    track.trackName.trim().length >= 1 &&
    track.audioFile !== null &&
    track.uploaded &&
    track.performerName.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.performerName &&
    track.musicAuthor.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.musicAuthor &&
    track.textAuthor.trim().split(/\s+/).length >= 3 &&
    !singleErrors.value[index]?.textAuthor
  );

  // Проверяем все альбомы
  const allAlbumsComplete = albums.value.every((album, albumIndex) =>
    album.albumName.trim().length >= 1 &&
    album.tracks.length > 0 &&
    album.tracks.every((track, trackIndex) =>
      track.trackName.trim().length >= 1 &&
      track.audioFile !== null &&
      track.uploaded &&
      track.performerName.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.performerName &&
      track.musicAuthor.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.musicAuthor &&
      track.textAuthor.trim().split(/\s+/).length >= 3 &&
      !albumErrors.value[albumIndex]?.tracks[trackIndex]?.textAuthor
    )
  );

  const counts = {
    singleCount: singleTracks.value.length,
    albumCount: albums.value.length
  };
  
  return (counts.singleCount === 0 || allSinglesComplete) && 
         (counts.albumCount === 0 || allAlbumsComplete);
});

// Проверка на запрещенные слова
const checkForbiddenWords = (value: string): boolean => {
  if (!value.trim()) return false;
  
  const lowerValue = value.toLowerCase();
  return forbiddenWords.some(word => 
    lowerValue.includes(` ${word} `) || 
    lowerValue.startsWith(`${word} `) || 
    lowerValue.endsWith(` ${word}`) ||
    lowerValue === word
  );
};

// Проверка минимального количества слов
const checkMinWords = (value: string, minWords: number): boolean => {
  if (!value.trim()) return false;
  return value.trim().split(/\s+/).length >= minWords;
};

// Валидация поля исполнителей для сингла
const validateSinglePerformerName = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].performerName;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО исполнителя обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО исполнителя должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО исполнителей" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].performerName = error;
  return !error;
};

// Валидация поля автора музыки для сингла
const validateSingleMusicAuthor = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].musicAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора музыки обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора музыки должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов музыки" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].musicAuthor = error;
  return !error;
};

// Валидация поля автора текста для сингла
const validateSingleTextAuthor = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].textAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора текста обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора текста должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов текста" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  singleErrors.value[trackIndex].textAuthor = error;
  return !error;
};

// Валидация поля названия трека для сингла
const validateSingleTrackName = (trackIndex: number) => {
  const value = singleTracks.value[trackIndex].trackName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название трека обязательно для заполнения';
  } else if (value.trim().length < 1) {
    error = 'Название трека должно содержать минимум 1 символ';
  }
  
  singleErrors.value[trackIndex].trackName = error;
  return !error;
};

// Валидация формы сингла
const validateSingleForm = async (trackIndex: number) => {
  let isValid = true;
  
  if (!validateSinglePerformerName(trackIndex)) isValid = false;
  if (!validateSingleMusicAuthor(trackIndex)) isValid = false;
  if (!validateSingleTextAuthor(trackIndex)) isValid = false;
  if (!validateSingleTrackName(trackIndex)) isValid = false;
  
  if (!singleTracks.value[trackIndex].audioFile) {
    singleErrors.value[trackIndex].audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  } else {
    singleErrors.value[trackIndex].audioFile = '';
  }
  
  return isValid;
};

// Валидация поля исполнителей для трека альбома
const validateAlbumTrackPerformerName = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].performerName;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО исполнителя обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО исполнителя должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО исполнителей" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].performerName = error;
  return !error;
};

// Валидация поля автора музыки для трека альбома
const validateAlbumTrackMusicAuthor = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].musicAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора музыки обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора музыки должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов музыки" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].musicAuthor = error;
  return !error;
};

// Валидация поля автора текста для трека альбома
const validateAlbumTrackTextAuthor = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].textAuthor;
  let error = '';
  
  if (!value.trim()) {
    error = 'ФИО автора текста обязательно для заполнения';
  } else if (!checkMinWords(value, 3)) {
    error = 'ФИО автора текста должно содержать минимум 3 слова (например: Иван Иванович Иванов)';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "ФИО авторов текста" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].textAuthor = error;
  return !error;
};

// Валидация поля названия трека для трека альбома
const validateAlbumTrackTrackName = (albumIndex: number, trackIndex: number) => {
  const value = albums.value[albumIndex].tracks[trackIndex].trackName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название трека обязательно для заполнения';
  } else if (value.trim().length < 1) {
    error = 'Название трека должно содержать минимум 1 символ';
  }
  
  albumErrors.value[albumIndex].tracks[trackIndex].trackName = error;
  return !error;
};

// Валидация поля названия альбома
const validateAlbumName = (albumIndex: number) => {
  const value = albums.value[albumIndex].albumName;
  let error = '';
  
  if (!value.trim()) {
    error = 'Название альбома обязательно для заполнения';
  } else if (value.trim().length < 1) {
    error = 'Название альбома должно содержать минимум 1 символ';
  } else if (checkForbiddenWords(value)) {
    error = 'В поле "Название альбома" запрещено использовать слова: "нет", "такой", "информации", "не", "знаю", "откуда"';
  }
  
  albumErrors.value[albumIndex].albumName = error;
  return !error;
};

// Валидация формы трека альбома
const validateAlbumTrackForm = async (albumIndex: number, trackIndex: number) => {
  let isValid = true;
  
  if (!validateAlbumTrackPerformerName(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackMusicAuthor(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackTextAuthor(albumIndex, trackIndex)) isValid = false;
  if (!validateAlbumTrackTrackName(albumIndex, trackIndex)) isValid = false;
  
  if (!albums.value[albumIndex].tracks[trackIndex].audioFile) {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = 'Аудио файл обязателен для загрузки';
    isValid = false;
  } else {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
  }
  
  return isValid;
};

// Генерация ID для аудио файла
const generateAudioId = (type: 'single' | 'album', ...indices: number[]): string => {
  return `${type}-${indices.join('-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Обработка загрузки аудио файла для сингла
const handleSingleAudioUpload = async (trackIndex: number, file: File): Promise<void> => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Недопустимый формат файла. Разрешенные форматы: MP3, WAV, FLAC, AAC, OGG');
  }
  
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Файл слишком большой. Максимальный размер: 50MB');
  }
  
  const fileId = generateAudioId('single', trackIndex);
  
  if (singleTracks.value[trackIndex].audioFileId) {
    await removeAudioFromDB(singleTracks.value[trackIndex].audioFileId);
  }
  
  await saveAudioToDB(file, fileId);
  
  singleTracks.value[trackIndex].audioFile = file;
  singleTracks.value[trackIndex].audioFileName = file.name;
  singleTracks.value[trackIndex].audioFileSize = file.size;
  singleTracks.value[trackIndex].audioFileId = fileId;
  singleTracks.value[trackIndex].uploaded = true;
  singleTracks.value[trackIndex].hasAudioUploaded = true;
  
  singleErrors.value[trackIndex].audioFile = '';
};

// Обработка загрузки аудио файла для трека альбома
const handleAlbumTrackUpload = async (albumIndex: number, trackIndex: number, file: File): Promise<void> => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Недопустимый формат файла. Разрешенные форматы: MP3, WAV, FLAC, AAC, OGG');
  }
  
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Файл слишком большой. Максимальный размер: 50MB');
  }
  
  const album = albums.value[albumIndex];
  if (!album) throw new Error('Альбом не найден');
  
  const fileId = generateAudioId('album', albumIndex, trackIndex);
  
  if (album.tracks[trackIndex].audioFileId) {
    await removeAudioFromDB(album.tracks[trackIndex].audioFileId);
  }
  
  await saveAudioToDB(file, fileId);
  
  const updatedTrack = {
    ...album.tracks[trackIndex],
    audioFile: file,
    audioFileName: file.name,
    audioFileSize: file.size,
    audioFileId: fileId,
    uploaded: true
  };
  
  album.tracks[trackIndex] = updatedTrack;
  
  if (albumErrors.value[albumIndex]?.tracks[trackIndex]) {
    albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
  }
  
  albums.value = [...albums.value];
};

// Добавление нового сингла с выбором файла
const addSingleTrackWithFile = async () => {
  if (singleTracks.value.length >= singleCountFromQuiz1.value) {
    ElMessage.warning(`Максимальное количество синглов - ${singleCountFromQuiz1.value}`);
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.multiple = false;
  input.style.display = 'none';
  
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    isLoadingTwo.value = true;
    
    try {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Недопустимый формат файла');
      }
      
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Файл слишком большой');
      }
      
      const fileId = generateAudioId('single', singleTracks.value.length);
      await saveAudioToDB(file, fileId);
      
      const newTrack = {
        id: `single-${Date.now()}-${singleTracks.value.length}-${Math.random()}`,
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        trackName: '',
        audioFile: file,
        audioFileName: file.name,
        audioFileSize: file.size,
        audioFileId: fileId,
        uploaded: true,
        hasAudioUploaded: true
      };
      
      singleTracks.value.push(newTrack);
      singleErrors.value.push({
        performerName: '',
        musicAuthor: '',
        textAuthor: '',
        trackName: '',
        audioFile: ''
      });
      
      singleTracks.value = [...singleTracks.value];
      await saveStateToDB();
      
      ElMessage.success(`Сингл добавлен (${singleTracks.value.length}/${singleCountFromQuiz1.value})`);
    } catch (error: any) {
      ElMessage.error(`Ошибка загрузки: ${error.message}`);
    } finally {
      isLoadingTwo.value = false;
    }
  };
  
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Удаление сингла
const removeSingleTrack = async (trackIndex: number) => {
  if (trackIndex >= 0 && trackIndex < singleTracks.value.length) {
    const track = singleTracks.value[trackIndex];
    
    if (track.audioFileId) {
      await removeAudioFromDB(track.audioFileId);
    }
    
    const newTracks = singleTracks.value.filter((_, index) => index !== trackIndex);
    singleTracks.value = newTracks;
    singleErrors.value = singleErrors.value.filter((_, index) => index !== trackIndex);
    
    await saveStateToDB();
    
    ElMessage.success('Сингл удален');
  }
};

// Массовая загрузка всех синглов
const uploadAllSingles = async () => {
  const notUploadedIndices: number[] = [];
  singleTracks.value.forEach((track, index) => {
    if (!track.hasAudioUploaded) {
      notUploadedIndices.push(index);
    }
  });
  
  if (notUploadedIndices.length === 0) {
    ElMessage.info('Все синглы уже загружены');
    return;
  }
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.multiple = true;
  input.style.display = 'none';
  
  input.onchange = async (event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (files.length === 0) return;
    
    isUploadingAllSingles.value = true;
    uploadedSinglesCount.value = 0;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < notUploadedIndices.length && i < files.length; i++) {
      const trackIndex = notUploadedIndices[i];
      try {
        await handleSingleAudioUpload(trackIndex, files[i]);
        successCount++;
      } catch (error: any) {
        errorCount++;
        ElMessage.error(`Ошибка загрузки сингла ${trackIndex + 1}: ${error.message}`);
      }
      uploadedSinglesCount.value = successCount + errorCount;
    }
    
    isUploadingAllSingles.value = false;
    await saveStateToDB();
    
    if (errorCount > 0) {
      ElMessage.warning(`Загружено ${successCount} из ${notUploadedIndices.length} синглов. Ошибок: ${errorCount}`);
    } else {
      ElMessage.success(`Все ${notUploadedIndices.length} синглов успешно загружены`);
    }
  };
  
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Массовая загрузка всех треков в альбом
const uploadAllAlbumTracks = async () => {
  if (albums.value.length === 0) {
    ElMessage.info('Нет доступных альбомов');
    return;
  }
  
  const album = albums.value[0];
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.multiple = true;
  input.style.display = 'none';
  
  input.onchange = async (event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (files.length === 0) return;
    
    isUploadingAllAlbums.value = true;
    uploadedAlbumsCount.value = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Недопустимый формат файла');
        }
        
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error('Файл слишком большой');
        }
        
        const fileId = generateAudioId('album', 0, album.tracks.length);
        await saveAudioToDB(file, fileId);
        
        const newTrack: AlbumTrack = {
          id: `album-track-${Date.now()}-${Math.random()}`,
          trackNumber: album.tracks.length + 1,
          trackName: '',
          performerName: album.performerName || '',
          musicAuthor: album.musicAuthor || '',
          textAuthor: album.textAuthor || '',
          audioFile: file,
          audioFileName: file.name,
          audioFileSize: file.size,
          audioFileId: fileId,
          uploaded: true
        };
        
        album.tracks.push(newTrack);
        
        if (!albumErrors.value[0]) {
          albumErrors.value[0] = { albumName: '', tracks: [] };
        }
        
        albumErrors.value[0].tracks.push({
          performerName: '',
          musicAuthor: '',
          textAuthor: '',
          trackName: '',
          audioFile: ''
        });
        
        albums.value = [...albums.value];
        successCount++;
      } catch (error: any) {
        errorCount++;
        ElMessage.error(`Ошибка загрузки трека ${i + 1}: ${error.message}`);
      }
      uploadedAlbumsCount.value = successCount + errorCount;
    }
    
    isUploadingAllAlbums.value = false;
    albums.value = [...albums.value];
    await saveStateToDB();
    
    if (errorCount > 0) {
      ElMessage.warning(`Загружено ${successCount} из ${files.length} треков. Ошибок: ${errorCount}`);
    } else {
      ElMessage.success(`Все ${files.length} треков успешно загружены в альбом`);
    }
  };
  
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

// Добавить трек в альбом с выбором файла
const addAlbumTrackWithFile = async (albumIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    
    if (album.tracks.length >= 20) {
      ElMessage.warning('Максимальное количество треков в альбоме - 20');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = false;
    input.style.display = 'none';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      isLoadingTwo.value = true;
      
      try {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Недопустимый формат файла');
        }
        
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error('Файл слишком большой');
        }
        
        const fileId = generateAudioId('album', albumIndex, album.tracks.length);
        await saveAudioToDB(file, fileId);
        
        const newTrack: AlbumTrack = {
          id: `album-track-${Date.now()}-${Math.random()}`,
          trackNumber: album.tracks.length + 1,
          trackName: '',
          performerName: album.performerName || '',
          musicAuthor: album.musicAuthor || '',
          textAuthor: album.textAuthor || '',
          audioFile: file,
          audioFileName: file.name,
          audioFileSize: file.size,
          audioFileId: fileId,
          uploaded: true
        };
        
        album.tracks.push(newTrack);
        
        if (!albumErrors.value[albumIndex]) {
          albumErrors.value[albumIndex] = { albumName: '', tracks: [] };
        }
        
        albumErrors.value[albumIndex].tracks.push({
          performerName: '',
          musicAuthor: '',
          textAuthor: '',
          trackName: '',
          audioFile: ''
        });
        
        albums.value = [...albums.value];
        await saveStateToDB();
        
        ElMessage.success(`Трек добавлен в альбом (${album.tracks.length}/20)`);
      } catch (error: any) {
        ElMessage.error(`Ошибка загрузки: ${error.message}`);
      } finally {
        isLoadingTwo.value = false;
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
};

// Удалить трек из альбома
const removeAlbumTrack = async (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      
      if (album.tracks[trackIndex].audioFileId) {
        await removeAudioFromDB(album.tracks[trackIndex].audioFileId);
      }
      
      const newTracks = album.tracks.filter((_, index) => index !== trackIndex);
      
      newTracks.forEach((track, index) => {
        track.trackNumber = index + 1;
      });
      
      album.tracks = newTracks;
      
      if (albumErrors.value[albumIndex]?.tracks) {
        albumErrors.value[albumIndex].tracks = albumErrors.value[albumIndex].tracks.filter((_, index) => index !== trackIndex);
      }
      
      albums.value = [...albums.value];
      await saveStateToDB();
      
      ElMessage.success('Трек удален из альбома');
    }
  }
};

// Удаление загруженного аудио для сингла
const removeSingleUploadedAudio = async (trackIndex: number) => {
  if (singleTracks.value[trackIndex].audioFileId) {
    await removeAudioFromDB(singleTracks.value[trackIndex].audioFileId);
  }
  
  singleTracks.value[trackIndex].audioFile = null;
  singleTracks.value[trackIndex].audioFileName = '';
  singleTracks.value[trackIndex].audioFileSize = 0;
  singleTracks.value[trackIndex].audioFileId = null;
  singleTracks.value[trackIndex].uploaded = false;
  singleTracks.value[trackIndex].hasAudioUploaded = false;
  
  singleErrors.value[trackIndex].audioFile = '';
  
  await saveStateToDB();
  
  ElMessage.info('Аудио файл удален');
};

// Удаление загруженного аудио для трека альбома
const removeAlbumTrackAudio = async (albumIndex: number, trackIndex: number) => {
  if (albumIndex >= 0 && albumIndex < albums.value.length) {
    const album = albums.value[albumIndex];
    if (trackIndex >= 0 && trackIndex < album.tracks.length) {
      
      if (album.tracks[trackIndex].audioFileId) {
        await removeAudioFromDB(album.tracks[trackIndex].audioFileId);
      }
      
      const updatedTrack = {
        ...album.tracks[trackIndex],
        audioFile: null,
        audioFileName: '',
        audioFileSize: 0,
        audioFileId: null,
        uploaded: false
      };
      
      album.tracks[trackIndex] = updatedTrack;
      
      if (albumErrors.value[albumIndex]?.tracks[trackIndex]) {
        albumErrors.value[albumIndex].tracks[trackIndex].audioFile = '';
      }
      
      albums.value = [...albums.value];
      await saveStateToDB();
      
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

// Валидация при изменении полей сингла
const validateSingleOnChange = (trackIndex: number, field: string) => {
  switch (field) {
    case 'performerName':
      validateSinglePerformerName(trackIndex);
      break;
    case 'musicAuthor':
      validateSingleMusicAuthor(trackIndex);
      break;
    case 'textAuthor':
      validateSingleTextAuthor(trackIndex);
      break;
    case 'trackName':
      validateSingleTrackName(trackIndex);
      break;
  }
  saveStateToDB();
};

// Валидация при изменении полей трека альбома
const validateAlbumTrackOnChange = (albumIndex: number, trackIndex: number, field: string) => {
  switch (field) {
    case 'performerName':
      validateAlbumTrackPerformerName(albumIndex, trackIndex);
      break;
    case 'musicAuthor':
      validateAlbumTrackMusicAuthor(albumIndex, trackIndex);
      break;
    case 'textAuthor':
      validateAlbumTrackTextAuthor(albumIndex, trackIndex);
      break;
    case 'trackName':
      validateAlbumTrackTrackName(albumIndex, trackIndex);
      break;
  }
  saveStateToDB();
};

// Валидация названия альбома при изменении
const validateAlbumNameOnChange = (albumIndex: number) => {
  validateAlbumName(albumIndex);
  saveStateToDB();
};

// Обработчики попапа
const openPopup = () => {
  isPopupVisible.value = true;
  document.body.style.overflow = 'hidden';
};

const closePopup = () => {
  isPopupVisible.value = false;
  document.body.style.overflow = '';
};

const goBack = async () => {
  if (showImportantBlock.value) {
    showImportantBlock.value = false;
  } else {
    await saveStateToDB();
    emit('go-back');
  }
};

const handleContinue = async () => {
  let allValid = true;
  
  for (let i = 0; i < singleTracks.value.length; i++) {
    if (!await validateSingleForm(i)) {
      allValid = false;
    }
  }
  
  for (let albumIndex = 0; albumIndex < albums.value.length; albumIndex++) {
    if (!validateAlbumName(albumIndex)) {
      allValid = false;
    }
    
    for (let trackIndex = 0; trackIndex < albums.value[albumIndex].tracks.length; trackIndex++) {
      if (!await validateAlbumTrackForm(albumIndex, trackIndex)) {
        allValid = false;
      }
    }
  }
  
  if (allValid) {
    await saveStateToDB();
    showImportantBlock.value = true;
  } else {
    ElMessage.error('Пожалуйста, заполните все обязательные поля');
  }
};

const handleAccept = async () => {
  await saveStateToDB();
  emit('go-next');
};

// При монтировании загружаем состояние
onMounted(async () => {
  try {
    console.log('Quiz2: Mounting...');
    isLoadingTwo.value = true;
    
    await initDB();
    await loadStateFromDB();
    
    dataLoaded.value = true;
  } catch (error) {
    console.error('Quiz2: Error in onMounted:', error);
    ElMessage.error('Ошибка при загрузке данных');
  } finally {
    isLoadingTwo.value = false;
  }
});

// Следим за изменениями и сохраняем
watch([singleTracks, albums], async () => {
  if (dataLoaded.value && !isLoadingTwo.value && dbInitialized.value) {
    await saveStateToDB();
  }
}, { deep: true });

// Сохраняем состояние при покидании страницы
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    if (dbInitialized.value) {
      await saveStateToDB();
    }
  });

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden' && dbInitialized.value) {
      await saveStateToDB();
    }
  });
}
</script>

<style lang="css" scoped>
.quiz__form_top {
  display: flex;
  width: 100%;
  padding: 0 0 40px;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}
.quiz__additional {
  text-transform: uppercase;
}
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
.quiz__form_single_name {
  display: flex;
  width: 100%;
  padding: 20px;
  margin: 20px 0;
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
.quiz__single_footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.quiz__single_track_remove {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}
.quiz__album_track_footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.quiz__album_track_remove {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}
.quiz__album_add_track {
  margin-top: 20px;
}
.quiz__album_max_tracks_warning {
  margin-top: 20px;
  text-align: center;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
}
.quiz__singles_list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.quiz__form_two_controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.quiz__add_single_button {
  margin-top: 30px;
  text-align: center;
}
.quiz__upload_waiting {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--bg-color);
  border-radius: 8px;
  margin: 20px 0;
}
.quiz__upload_waiting .loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 158, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.warning {
  color: #e6a23c;
}

.quiz-popup__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 80px 20px 20px;
  backdrop-filter: blur(5px);
}
.quiz-popup {
  width: 100%;
  max-width: 600px;
  position: relative;
  background-color: var(--bg);
}
.quiz-popup__close {
  display: flex;
  padding: 8px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: -60px;
  background: var(--bg);
  cursor: pointer;
  color: var(--text);
  border: none;
  z-index: 1002;
}
.quiz-popup__content {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 30px;
}
.quiz-popup__body {
  padding: 0 0 20px;
}
.quiz-popup__instruction-block {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}
.quiz-popup__instruction-block p {
  margin-bottom: 10px;
}
.quiz-popup__instruction-block p:first-child {
  font-weight: 600;
  margin-bottom: 5px;
}
.quiz-popup__instruction-block p:nth-child(2) {
  font-size: 24px;
  text-align: center;
  margin: 15px 0;
}
.quiz-popup__footer {
  padding: 20px 0 0;
  text-align: center;
}
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .quiz-popup__close {
    top: -60px;
    left: auto;
    right: 0;
    background: var(--bg);
  }
  .quiz-popup__content {
    padding: 20px;
  }
  .quiz__form_top {
    padding: 0 0 20px;
  }
  .quiz-popup__button {
    min-width: 160px;
    padding: 12px 24px;
    font-size: 14px;
  }
  .quiz__form_two_controls {
    margin-bottom: 20px;
  }
  .quiz__form_two_controls .button {
    width: 100%;
  }
}
@media (max-width: 480px) {
  .quiz-popup__close {
    top: -50px;
  }
  .quiz-popup__content {
    padding: 15px;
  }
}
</style>