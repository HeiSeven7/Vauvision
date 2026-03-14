<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import PersonalSVG from "@/uikit/icon/PersonalSVG.vue";
import MoreSVG from "@/uikit/icon/MoreSVG.vue";
import ButtonSVG from "@/uikit/icon/ButtonSVG.vue";
import ClipSVG from "@/uikit/icon/ClipSVG.vue";
import { sendRequest } from '@/utils/api';

const isLoading = ref<boolean>(false);
const loadingSvg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

// Интерфейс для партнера из API
interface ReferralUser {
  ID: string;
  EMAIL: string;
  LOGIN: string;
  DATE_REGISTER: string;
  UF_RELEASES: string | number;
  PAYOUT: string;
}

// Данные из API
const referralData = ref({
  isAgreed: false,
  link: ''
});

const referralUsers = ref<ReferralUser[]>([]);
const isAccepting = ref(false);
const copySuccess = ref(false);

// Пагинация для партнеров
const partnersPerPage = ref<number>(6);
const currentPartnersPage = ref<number>(1);

// Вычисляемые свойства для партнеров
const totalPartnersPages = computed(() => {
  return Math.ceil(referralUsers.value.length / partnersPerPage.value);
});

const paginatedPartners = computed(() => {
  const start = (currentPartnersPage.value - 1) * partnersPerPage.value;
  const end = start + partnersPerPage.value;
  return referralUsers.value.slice(start, end).map((user: ReferralUser) => ({
    id: parseInt(user.ID),
    name: user.LOGIN || 'Без имени',
    email: user.EMAIL,
    date: formatDate(user.DATE_REGISTER),
    earnings: user.PAYOUT,
    releases: formatReleases(user.UF_RELEASES)
  }));
});

const showPartnersPagination = computed(() => {
  return referralUsers.value.length > partnersPerPage.value;
});

// Форматирование даты
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Форматирование количества релизов
const formatReleases = (releases: string | number) => {
  const count = Number(releases);
  if (count === 0) return '0 релизов';
  if (count === 1) return '1 релиз';
  if (count >= 2 && count <= 4) return `${count} релиза`;
  return `${count} релизов`;
};

// Методы для пагинации партнеров
const nextPartnersPage = () => {
  if (currentPartnersPage.value < totalPartnersPages.value) {
    currentPartnersPage.value++;
  }
};

const prevPartnersPage = () => {
  if (currentPartnersPage.value > 1) {
    currentPartnersPage.value--;
  }
};

// Загрузка данных
const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    console.log('Данные из API:', response.data);
    
    if (response.data && response.data.referral) {
      referralData.value = {
        isAgreed: response.data.referral.isAgreed || false,
        link: response.data.referral.link || ''
      };
    }
    
    if (response.data && response.data.profile && response.data.profile.referralUsers) {
      referralUsers.value = response.data.profile.referralUsers || [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    isLoading.value = false;
  }
};

// Принять условия партнерской программы
const acceptAgreement = async () => {
  isAccepting.value = true;
  try {
    const response = await sendRequest('post', '/auth/profile/agreeReferalProgram.php', {});
    
    if (response.data && response.data.success) {
      // Обновляем данные
      await fetchData();
    } else {
      alert('Ошибка при принятии условий');
    }
  } catch (error) {
    console.error('Ошибка при принятии условий:', error);
    alert('Не удалось принять условия');
  } finally {
    isAccepting.value = false;
  }
};

// Копировать ссылку
const copyReferralLink = () => {
  if (!referralData.value.link) return;
  
  navigator.clipboard.writeText(referralData.value.link).then(() => {
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  }).catch(err => {
    console.error('Ошибка при копировании:', err);
  });
};

// Загружаем данные при монтировании
onMounted(() => {
  fetchData();
});
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div v-if="isLoading === true" class="personal__block">
      <div class="loading__container">
        <div 
          v-loading="isLoading" 
          :element-loading-svg="loadingSvg" 
          class="loading__svg" 
          element-loading-svg-view-box="-10, -10, 50, 50"
        ></div>
      </div>
    </div>
    <div v-else class="personal__block">
      <div class="partner__top">
        <h3 class="partner__head">ЧТО ТАКОЕ ПАРТНЁРСКАЯ ПРОГРАММА VAUVISION?</h3>
        <p class="partner__desc">Получайте 400 рублей за каждого друга, выкладывающего релизы через VAUVISION по вашей реферальной ссылке! А также за их каждый следующий релиз и за каждый релиз их друзей!</p>
      </div>
      
      <!-- Блок для пользователей, не принявших условия -->
      <div v-if="!referralData.isAgreed" class="partner__agreement">
        <div class="partner__agreement_info">
          <h5 class="partner__agreement_head">Документ партнерской программы</h5>
          <p class="partner__agreement_desc">Ознакомьтесь с условиями партнерской программы</p>
        </div>
        <div class="partner__agreement_buttons">
          <a 
            href="/auth/profile/Agree.pdf" 
            class="partner__agreement_button button__primary"
            target="_blank"
          >
            <span>Открыть документ</span>
          </a>
          <button 
            class="partner__agreement_button button__red"
            @click="acceptAgreement"
            :disabled="isAccepting"
          >
            <span>{{ isAccepting ? 'Принятие...' : 'Принять условия' }}</span>
          </button>
        </div>
      </div>
      
      <div class="partner__flex">
        <div class="partner__content">
          <div class="partner__table">
            <h5 class="partner__heading">Партнеры, зарегистрировавшиеся по вашей ссылке</h5>
            
            <!-- Загрузка -->
            <div v-if="isLoading" class="partner__loading">
              Загрузка партнеров...
            </div>
            
            <!-- Нет партнеров -->
            <div v-else-if="referralUsers.length === 0" class="partner__empty">
              У вас пока нет приглашенных партнеров
            </div>
            
            <!-- Список партнеров -->
            <template v-else>
              <ul class="partner__list">
                <li class="partner__item partner__header">
                  <div class="partner__cell partner__name">Партнер</div>
                  <div class="partner__cell partner__email">E-mail</div>
                  <div class="partner__cell partner__date">Дата регистрации</div>
                  <div class="partner__cell partner__earnings">Начисления</div>
                  <div class="partner__cell partner__releases">Релизы</div>
                  <div class="partner__cell partner__actions"></div>
                </li>
                <li 
                  class="partner__item" 
                  v-for="partner in paginatedPartners" 
                  :key="partner.id"
                >
                  <div class="partner__cell partner__name">
                    <div class="partner__user">
                      <PersonalSVG />
                    </div>
                    <span class="partner__name-text">{{ partner.name }}</span>
                  </div>
                  <div class="partner__cell partner__email">
                    <span class="partner__email-text">{{ partner.email }}</span>
                  </div>
                  <div class="partner__cell partner__date">
                    <span class="partner__date-text">{{ partner.date }}</span>
                  </div>
                  <div class="partner__cell partner__earnings">
                    <span class="partner__earnings-text">{{ partner.earnings }}</span>
                  </div>
                  <div class="partner__cell partner__releases">
                    <span class="partner__releases-text">{{ partner.releases }}</span>
                  </div>
                  <div class="partner__cell partner__actions">
                    <button class="partner__more">
                      <MoreSVG/>
                    </button>
                  </div>
                </li>
              </ul>
              
              <!-- Пагинация -->
              <div class="pagination__buttons" v-if="showPartnersPagination">
                <button 
                  class="pagination__buttons_button button button__pagination button__pagination_prev"
                  @click="prevPartnersPage"
                  :disabled="currentPartnersPage === 1"
                >
                  <span><ButtonSVG /></span>
                  <span>{{ $t('button.prev') }}</span>
                </button>
                
                <div class="pagination__buttons_info">
                  {{ currentPartnersPage }}/{{ totalPartnersPages }}
                </div>
                
                <button 
                  class="pagination__buttons_button button button__pagination button__pagination_next"
                  @click="nextPartnersPage"
                  :disabled="currentPartnersPage === totalPartnersPages"
                >
                  <span>{{ $t('button.next') }}</span>
                  <span><ButtonSVG /></span>
                </button>
              </div>
            </template>
          </div>
        </div>
        <div class="partner__right">
          <div class="partner__conditions">
            <div class="partner__conditions_info">
              <h5 class="partner__conditions_head">условия участия</h5>
              <p class="partner__conditions_desc">Детали начисления за повторные релизы и приглашенных друзей указаны ниже в разделе «Условия участия».</p>
            </div>
            <button 
              class="partner__conditions_button button__red"
              :disabled="referralData.isAgreed"
            >
              <span>{{ referralData.isAgreed ? 'Условия приняты' : 'стать партнером' }}</span>
            </button>
          </div>
          <div class="partner__referral">
            <div class="partner__referral_info">
              <h5 class="partner__referral_head">реферальная ссылка</h5>
              <p class="partner__referral_desc">Зарабатывайте вместе с VAUVISION. Получайте реальные деньги за каждого вашего друга, выложевшего релиз.</p>
            </div>
            <div class="partner__referral_info">
              <p class="partner__referral_heading button">ваша реферальная ссылка</p>
              
              <!-- Если пользователь не принял условия -->
              <div v-if="!referralData.isAgreed" class="partner__referral_notice">
                <button class="partner__conditions_copy text_very" disabled>
                  <span>Появится после принятия условий участия</span>
                </button>
              </div>
              
              <!-- Если условия приняты и есть ссылка -->
              <div v-else-if="referralData.link" class="partner__referral_link">
                <button 
                  class="partner__conditions_copy text_very partner__conditions_copy_with-icon"
                  @click="copyReferralLink"
                >
                  <span>{{ referralData.link }}</span>
                  <ClipSVG />
                </button>
                <span v-if="copySuccess" class="partner__copy_success">Скопировано!</span>
              </div>
              
              <!-- Если ссылка не загрузилась -->
              <div v-else class="partner__referral_notice">
                <button class="partner__conditions_copy text_very" disabled>
                  <span>Загрузка ссылки...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.loading__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.loading__svg {
  width: 100px;
  height: 100px;
}

.personal {
  margin: 0 0 auto;
}

.partner__agreement {
  display: flex;
  padding: 30px 40px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.partner__agreement_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.partner__agreement_head {
  text-transform: uppercase;
  font-weight: 500;
}

.partner__agreement_desc {
  color: var(--text-gray);
}

.partner__agreement_buttons {
  display: flex;
  gap: 10px;
}

.partner__agreement_button {
  padding: 12px 24px;
  text-transform: uppercase;
}

.partner__loading,
.partner__empty {
  padding: 40px;
  text-align: center;
  color: var(--text-gray);
  background-color: var(--bg);
  border: 1px solid var(--border);
}

.partner__flex {
  display: flex;
  gap: 40px;
}

.partner__content,
.partner__top {
  display: flex;
  width: calc(100% - 440px);
  flex: 0 0 auto;
  flex-direction: column;
  gap: 20px;
}

.partner__top,
.partner__table {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.partner__table {
  padding: 40px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}

.partner__head,
.partner__heading,
.partner__conditions_head,
.partner__agreement_head {
  text-transform: uppercase;
}

.partner__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--border);
}

.partner__item {
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: center;
  background-color: var(--bg);
  gap: 20px;
}

.partner__header,
.partner__header .partner__earnings {
  text-transform: capitalize;
  color: var(--text-gray);
}

.partner__cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.partner__name {
  flex: 2;
  min-width: 140px;
}

.partner__email {
  flex: 2;
  min-width: 140px;
}

.partner__date {
  flex: 1;
  min-width: 140px;
}

.partner__earnings {
  flex: 1;
  min-width: 100px;
  font-weight: 500;
  color: var(--color);
}

.partner__releases {
  flex: 1;
  min-width: 100px;
}

.partner__actions {
  flex: 0 0 40px;
  min-width: 40px;
  justify-content: flex-end;
}

.partner__user {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  color: #00000038;
  background-color: var(--bg-gray);
}

.partner__user svg {
  width: 24px;
  height: 24px;
  object-fit: cover;
}

.partner__more {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-gray);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.partner__more:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.partner__more svg {
  width: 20px;
  height: 20px;
}

.partner__load {
  margin: 30px auto 0;
}

.partner__right {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 20px;
}

.partner__conditions,
.partner__referral {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 30px;
  position: relative;
  background-color: var(--bg);
  border: 1px solid var(--border);
}

.partner__conditions_info,
.partner__referral_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.partner__conditions_desc,
.partner__referral_desc {
  color: var(--text-gray);
}

.partner__conditions_copy {
  width: 100%;
  padding: 15px 20px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--text);
  transition: background-color 0.15s linear, border-color 0.15s linear, color 0.15s linear;
  cursor: pointer;
}

.partner__conditions_copy:hover:not(:disabled) {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
}

.partner__conditions_copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.partner__conditions_copy span {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  text-transform: uppercase;
  overflow: hidden;
}

.partner__conditions_copy_with-icon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.partner__conditions_copy_with-icon svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.partner__referral_link {
  position: relative;
}

.partner__copy_success {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: var(--color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.partner__referral_notice {
  width: 100%;
}

@media (max-width: 1919px) {
  .partner__flex {
    gap: 20px;
  }
  .partner__content,
  .partner__top {
    width: calc(100% - 340px);
  }
  .partner__releases {
    display: none;
  }
}

@media (max-width: 1439px) {
  .partner__content,
  .partner__top {
    width: 100%;
  }
  .partner__flex {
    flex-direction: column;
  }
  .partner__right {
    flex-direction: row;
  }
  .partner__conditions,
  .partner__referral {
    width: calc(50% - 10px);
  }
  .partner__conditions {
    justify-content: space-between;
  }
  
  .partner__agreement {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .partner__agreement_buttons {
    width: 100%;
  }
  
  .partner__agreement_button {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .partner__table {
    padding: 30px 15px;
  }
  .partner__header {
    display: none;
  }
  .partner__item {
    flex-wrap: wrap;
    gap: 10px 20px;
    padding: 15px 0;
  }
  .partner__name {
    width: calc(100% - 50px - 20px);
    min-width: auto;
    flex: 0 0 auto;
    order: 1;
  }
  .partner__actions {
    width: 50px;
    min-width: auto;
    flex: 0 0 auto;
    order: 2;
  }
  .partner__date {
    min-width: auto;
    flex: 0 0 auto;
    order: 3;
  }
  .partner__email {
    min-width: auto;
    flex: 0 0 auto;
    order: 4;
  }
  .partner__earnings {
    min-width: auto;
    margin: 0 0 0 auto;
    flex: 0 0 auto;
    justify-content: flex-end;
    order: 5;
  }
  .partner__load {
    margin: 20px 0 0;
  }
  
  .partner__flex {
    flex-direction: column;
    gap: 20px;
  }
  .partner__right {
    flex-direction: column;
    gap: 10px;
  }
  .partner__conditions,
  .partner__referral {
    width: 100%;
  }
  
  .partner__agreement {
    padding: 20px 15px;
  }
  
  .partner__agreement_buttons {
    flex-direction: column;
  }
  
  .partner__agreement_button {
    width: 100%;
  }
  
  .partner__copy_success {
    top: auto;
    bottom: -25px;
  }
}
</style>