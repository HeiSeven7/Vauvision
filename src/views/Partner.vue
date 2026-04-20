<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
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

/** При ширине окна < 540px и ширине ячейки email > 130px — обрезка; раскрытие по клику */
const PARTNER_EMAIL_VIEWPORT_MAX = 539;
const PARTNER_EMAIL_CELL_TRUNCATE_MIN = 130;

const isPartnerEmailNarrowViewport = ref(false);
const partnerEmailClampActive = ref<Record<number, boolean>>({});
const expandedPartnerEmailIds = ref<Record<number, boolean>>({});

const partnerEmailCellEls = new Map<number, HTMLElement>();
const partnerEmailCellObservers = new Map<number, ResizeObserver>();

const updatePartnerEmailClampForWidth = (id: number, width: number) => {
  const active =
    isPartnerEmailNarrowViewport.value && width > PARTNER_EMAIL_CELL_TRUNCATE_MIN;
  partnerEmailClampActive.value = {
    ...partnerEmailClampActive.value,
    [id]: active,
  };
  if (!active && expandedPartnerEmailIds.value[id]) {
    const next = { ...expandedPartnerEmailIds.value };
    delete next[id];
    expandedPartnerEmailIds.value = next;
  }
};

const recalcAllPartnerEmailClamps = () => {
  partnerEmailCellEls.forEach((el, id) => {
    updatePartnerEmailClampForWidth(id, el.getBoundingClientRect().width);
  });
};

const bindPartnerEmailCell = (id: number, el: unknown) => {
  const html = el instanceof HTMLElement ? el : null;
  const prev = partnerEmailCellObservers.get(id);
  if (prev) {
    prev.disconnect();
    partnerEmailCellObservers.delete(id);
  }
  if (!html) {
    partnerEmailCellEls.delete(id);
    const nextClamp = { ...partnerEmailClampActive.value };
    delete nextClamp[id];
    partnerEmailClampActive.value = nextClamp;
    return;
  }

  partnerEmailCellEls.set(id, html);
  const ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect.width ?? html.getBoundingClientRect().width;
    updatePartnerEmailClampForWidth(id, w);
  });
  ro.observe(html);
  partnerEmailCellObservers.set(id, ro);
  updatePartnerEmailClampForWidth(id, html.getBoundingClientRect().width);
};

const togglePartnerEmail = (id: number) => {
  if (!partnerEmailClampActive.value[id]) return;
  expandedPartnerEmailIds.value = {
    ...expandedPartnerEmailIds.value,
    [id]: !expandedPartnerEmailIds.value[id],
  };
};

let partnerEmailMql: MediaQueryList | null = null;

const onPartnerEmailViewportChange = () => {
  if (!partnerEmailMql) return;
  isPartnerEmailNarrowViewport.value = partnerEmailMql.matches;
  recalcAllPartnerEmailClamps();
};

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
    expandedPartnerEmailIds.value = {};
  }
};

const prevPartnersPage = () => {
  if (currentPartnersPage.value > 1) {
    currentPartnersPage.value--;
    expandedPartnerEmailIds.value = {};
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
  partnerEmailMql = window.matchMedia(
    `(max-width: ${PARTNER_EMAIL_VIEWPORT_MAX}px)`
  );
  isPartnerEmailNarrowViewport.value = partnerEmailMql.matches;
  partnerEmailMql.addEventListener("change", onPartnerEmailViewportChange);
  fetchData();
});

onUnmounted(() => {
  partnerEmailMql?.removeEventListener("change", onPartnerEmailViewportChange);
  partnerEmailMql = null;
  partnerEmailCellObservers.forEach((ro) => ro.disconnect());
  partnerEmailCellObservers.clear();
  partnerEmailCellEls.clear();
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
                  <div
                    class="partner__cell partner__email"
                    :class="{
                      'partner__email--clamp': partnerEmailClampActive[partner.id],
                      'partner__email--expanded': expandedPartnerEmailIds[partner.id],
                    }"
                    :ref="(el) => bindPartnerEmailCell(partner.id, el)"
                    @click="togglePartnerEmail(partner.id)"
                  >
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

<style lang="scss" scoped>
.loading {
  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  &__svg {
    width: 100px;
    height: 100px;
  }
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

  &_info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &_head {
    text-transform: uppercase;
    font-weight: 500;
  }

  &_desc {
    color: var(--text-gray);
  }

  &_buttons {
    display: flex;
    gap: 10px;
  }

  &_button {
    padding: 12px 24px;
    text-transform: uppercase;
  }

  @media (max-width: 1439px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;

    &_buttons {
      width: 100%;
    }

    &_button {
      flex: 1;
    }
  }

  @media (max-width: 767px) {
    padding: 20px 15px;

    &_buttons {
      flex-direction: column;
    }

    &_button {
      width: 100%;
    }
  }
}

.partner {
  &__loading,
  &__empty {
    padding: 40px;
    text-align: center;
    color: var(--text-gray);
    background-color: var(--bg);
    border: 1px solid var(--border);
  }

  &__flex {
    display: flex;
    gap: 40px;

    @media (max-width: 1919px) {
      gap: 20px;
    }

    @media (max-width: 1439px) {
      flex-direction: column;
    }

    @media (max-width: 767px) {
      flex-direction: column;
      gap: 20px;
    }
  }

  &__content,
  &__top {
    display: flex;
    width: calc(100% - 440px);
    flex: 0 0 auto;
    flex-direction: column;
    gap: 20px;

    @media (max-width: 1919px) {
      width: calc(100% - 340px);
    }

    @media (max-width: 1439px) {
      width: 100%;
    }
  }

  &__top,
  &__table {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__table {
    padding: 40px;
    background-color: var(--bg);
    border: 1px solid var(--border);

    @media (max-width: 767px) {
      padding: 30px 15px;
    }
  }

  &__head,
  &__heading,
  &__conditions_head,
  &__agreement_head {
    text-transform: uppercase;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background-color: var(--border);
  }

  &__item {
    display: flex;
    width: 100%;
    padding: 20px 0;
    align-items: center;
    background-color: var(--bg);
    gap: 20px;

    @media (max-width: 1023px) {
      display: grid;
      grid-template-columns: 73px 1fr 1fr 1fr;
      grid-gap: 15px 30px;
      padding: 15px 0;
    }
    @media (max-width: 540px) {
      grid-gap: 15px 20px;
    }
  }

  &__header {
    text-transform: capitalize;
    color: var(--text-gray);

    & .partner__earnings {
      text-transform: capitalize;
      color: var(--text-gray);
    }

    @media (max-width: 1023px) {
      display: none;
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  &__name {
    flex: 2;
    min-width: 140px;
    &-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 140%;
      color: #181818;
    }

    @media (max-width: 1023px) {
      grid-column: 1 / 4;
      grid-row: 1 / 2;
    }
  }

  &__email {
    flex: 2;
    min-width: 140px;
    &-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 140%;
    }

    @media (max-width: 1023px) {
      min-width: auto;
      grid-column: 2 / 4;
      grid-row: 2 / 3;
    }

    &.partner__email--clamp {
      min-width: 0;
      max-width: 100%;
      cursor: pointer;

      .partner__email-text {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.partner__email--expanded .partner__email-text {
        white-space: normal;
        word-break: break-word;
        overflow: visible;
        text-overflow: clip;
      }
    }
  }

  &__date {
    flex: 1;
    min-width: 140px;
    &-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 140%;
    }

    @media (max-width: 1023px) {
      min-width: auto;
      grid-column: 1 / 2;
      grid-row: 2 / 3;
    }
  }

  &__earnings {
    flex: 1;
    min-width: 100px;
    color: var(--color);
    &-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 140%;
    }

    @media (max-width: 1023px) {
      min-width: auto;
      grid-column: 4 / 5;
      grid-row: 2 / 3;
      justify-content: flex-end;
    }
  }

  &__releases {
    flex: 1;
    min-width: 100px;

    @media (max-width: 1919px) {
      display: none;
    }
  }

  &__actions {
    flex: 0 0 40px;
    min-width: 40px;
    justify-content: flex-end;

    @media (max-width: 1023px) {
      grid-column: 4 / 5;
      grid-row: 1 / 2;
    }
  }

  &__user {
    display: flex;
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    color: #00000038;
    background-color: var(--bg-gray);

    svg {
      width: 24px;
      height: 24px;
      object-fit: cover;
    }
  }

  &__more {
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

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__load {
    margin: 30px auto 0;

    @media (max-width: 767px) {
      margin: 20px 0 0;
    }
  }

  &__right {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 20px;

    @media (max-width: 1439px) {
      flex-direction: row;
    }

    @media (max-width: 767px) {
      flex-direction: column;
      gap: 10px;
    }
  }

  &__conditions,
  &__referral {
    display: flex;
    padding: 40px;
    flex-direction: column;
    gap: 30px;
    position: relative;
    background-color: var(--bg);
    border: 1px solid var(--border);

    @media (max-width: 1439px) {
      width: calc(50% - 10px);
    }

    @media (max-width: 767px) {
      width: 100%;
    }
  }

  &__conditions {
    @media (max-width: 1439px) {
      justify-content: space-between;
    }
  }

  &__conditions_info,
  &__referral_info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__conditions_desc,
  &__referral_desc {
    color: var(--text-gray);
  }

  &__conditions_copy {
    width: 100%;
    padding: 15px 20px;
    color: var(--text);
    background-color: var(--bg);
    border: 1px solid var(--text);
    transition: background-color 0.15s linear, border-color 0.15s linear, color 0.15s linear;
    cursor: pointer;

    &:hover:not(:disabled) {
      color: var(--white);
      background-color: var(--color);
      border-color: var(--color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    span {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      text-transform: uppercase;
      overflow: hidden;
    }

    &_with-icon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }

  &__referral_link {
    position: relative;
  }

  &__copy_success {
    position: absolute;
    top: -30px;
    right: 0;
    background-color: var(--color);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;

    @media (max-width: 767px) {
      top: auto;
      bottom: -25px;
    }
  }

  &__referral_notice {
    width: 100%;
  }
}
</style>