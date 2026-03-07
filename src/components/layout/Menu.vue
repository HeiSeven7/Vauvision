<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import HomeSVG from "@/uikit/menu/HomeSVG.vue";
import UploadSVG from "@/uikit/menu/UploadSVG.vue";
import SettingSVG from "@/uikit/menu/SettingSVG.vue";
import PartnerSVG from "@/uikit/menu/PartnerSVG.vue";
import FaqSVG from "@/uikit/menu/FaqSVG.vue";
import ArticlesSVG from "@/uikit/menu/ArticlesSVG.vue";
import LogoutSVG from "@/uikit/menu/LogoutSVG.vue";
import PaySVG from "@/uikit/icon/PaySVG.vue";
import LinkSVG from "@/uikit/icon/LinkSVG.vue";
import PersonalSVG from "@/uikit/icon/PersonalSVG.vue";
import Tr from "@/i18n/translation";
import { sendRequest } from '@/utils/api';

// Состояние загрузки
const isLoading = ref(true);

// Данные пользователя
const userData = ref({
  name: '',
  email: '',
  balance: 0,
  avatar: '',
  login: ''
});

// Реферальная ссылка
const referralLink = ref('');

// Ссылка для выхода
const logoutUrl = ref('');

// Состояние копирования
const isCopying = ref(false);
const copySuccess = ref(false);

// Получаем базовый URL из текущего окна
const baseUrl = window.location.origin;

// Функция для загрузки данных
const fetchUserData = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    console.log('Menu данные из API:', response.data);
    
    if (response.data) {
      // Данные пользователя
      if (response.data.user) {
        userData.value.name = response.data.user.name || response.data.user.login || 'Пользователь';
        userData.value.email = response.data.user.email || '';
        userData.value.login = response.data.user.login || '';
        
        // Аватарка пользователя
        if (response.data.user.personalPhoto) {
          userData.value.avatar = response.data.user.personalPhoto;
        }
      }
      
      // Баланс
      if (response.data.profile) {
        userData.value.balance = response.data.profile.balance || 0;
      }
      
      // Реферальная ссылка
      if (response.data.referral && response.data.referral.link) {
        referralLink.value = response.data.referral.link;
      }
      
      // Ссылка для выхода - КАК В HEADER
      if (response.data.unauth) {
        logoutUrl.value = response.data.unauth;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных в Menu:', error);
  } finally {
    isLoading.value = false;
  }
};

// Функция для копирования ссылки - КАК В HEADER
const copyReferralLink = async () => {
  if (!referralLink.value) return;
  
  isCopying.value = true;
  copySuccess.value = false;
  
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copySuccess.value = true;
    
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Ошибка при копировании:', err);
  } finally {
    isCopying.value = false;
  }
};

// Функция для получения полного URL аватарки - КАК В HEADER
const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${baseUrl}${cleanPath}`;
};

// Функция для выхода - КАК В HEADER
const handleLogout = () => {
  if (logoutUrl.value) {
    window.location.href = `${baseUrl}${logoutUrl.value}`;
  }
};

// Форматирование баланса - КАК В HEADER
const formattedBalance = (balance: number) => {
  return balance.toLocaleString('ru-RU');
};

// Обработчик ошибки загрузки аватарки - КАК В HEADER
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    const svg = parent.querySelector('svg');
    if (svg) {
      svg.style.display = 'block';
    }
  }
  userData.value.avatar = '';
};

// Переход на старую версию
const goToOldVersion = () => {
  window.location.href = 'https://vauvision.com/auth/profile/';
};

onMounted(() => {
  fetchUserData();
});
</script>

<template>
<div class="menu__back"></div>
<div class="menu__block">
  <div class="menu__scroll">
    <div class="menu__personal">
      <div class="menu__personal_logo">
        <img 
          v-if="userData.avatar"
          :src="getAvatarUrl(userData.avatar)"
          @error="handleAvatarError"
          alt="Avatar"
          class="menu__avatar"
        >
        <PersonalSVG v-else />
      </div>
      <div class="menu__personal_info">
        <h6 class="menu__personal_name">{{ userData.name || 'Пользователь' }}</h6>
        <p class="menu__personal_mail">{{ userData.email || 'email@example.com' }}</p>
      </div>
    </div>

    <!-- Кнопка Баланс - ИСПРАВЛЕНО КАК В HEADER -->
    <div class="menu__balance">
      <div 
        class="menu__balance_button" 
        :title="'Счёт обновляется после скачивания отчёта. Пожалуйста, скачайте отчёт, после этого сумма на балансе обновится'"
      >
        <PaySVG />
        <span>Баланс: {{ formattedBalance(userData.balance) }} руб.</span>
      </div>
    </div>

    <!-- Кнопка Реферальная ссылка - ИСПРАВЛЕНО КАК В HEADER -->
    <div v-if="referralLink" class="menu__referral">
      <button 
        class="menu__referral_button"
        @click="copyReferralLink"
        :disabled="isCopying"
      >
        <LinkSVG />
        <span>{{ copySuccess ? 'Скопировано!' : 'Скопировать реферальную ссылку' }}</span>
      </button>
    </div>

    <!-- Основная навигация -->
    <ul class="menu__list">
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'personal' })">
          <span><HomeSVG /></span>
          <span>Главная</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'release' })">
          <span><UploadSVG /></span>
          <span>Выложить релиз</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'setting' })">
          <span><SettingSVG /></span>
          <span>Настройки</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'partner' })">
          <span><PartnerSVG /></span>
          <span>Стать партнером</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'faq' })">
          <span><FaqSVG /></span>
          <span>FAQ</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'articles' })">
          <span><ArticlesSVG /></span>
          <span>Статьи</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <RouterLink class="menu__link" :to="Tr.i18nRoute({ name: 'support' })">
          <span><FaqSVG /></span>
          <span>Связь с поддержкой</span>
        </RouterLink>
      </li>
      <li class="menu__item">
        <a href="#" class="menu__link" @click.prevent="goToOldVersion">
          <span><FaqSVG /></span>
          <span>Старая версия</span>
        </a>
      </li>
      
      <!-- Кнопка Выйти из аккаунта - ИСПРАВЛЕНО КАК В HEADER -->
      <li class="menu__item menu__logout">
        <button class="menu__link" @click="handleLogout">
          <span><LogoutSVG /></span>
          <span>Выйти из аккаунта</span>
        </button>
      </li>

      <!-- Политика конфиденциальности -->
      <li class="menu__item menu__privacy">
        <a 
          :href="`${baseUrl}/upload/policy.pdf`" 
          class="menu__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Политика конфиденциальности
        </a>
      </li>
    </ul>
  </div>
</div>
</template>

<style scoped>
.menu__block {
  display: flex;
  width: 319px;
  height: 100vh;
  max-height: calc(100vh - 80px);
  padding: 60px 0 20px;
  position: fixed;
  top: 80px;
  left: calc(50% - ((1920px - 160px)/2) + 140px);
  z-index: 2;
  border-right: 1px solid var(--border);
  background-color: var(--bg);
  transform: translateX(-50%);
}
.menu__block::after {
  content: "";
  height: 100vh;
  width: calc(100vw + 320px);
  position: absolute;
  left: -100vw;
  top: 0;
  z-index: 1;
  background-color: var(--bg);
}
.menu__scroll {
  display: flex;
  height: 100vh;
  max-height: calc(100vh - 160px);
  flex-direction: column;
  position: relative;
  z-index: 2;
  overflow-y: auto;
  overflow-x: hidden;
}
.menu__scroll::-webkit-scrollbar {
  display: none;
  width: 0px;
}
.menu__scroll::-webkit-scrollbar-thumb {
  display: none;
  width: 0px;
}

.menu__back {
  content: "";
  width: 1920px;
  height: 100vh;
  position: fixed;
  left: calc(50% - 1920px + 80px);
  top: 0;
  z-index: 1;
  background-color: var(--bg);
  transform: translateX(-50%);
}

/* Стили для блока个人信息 - КАК В BURGER */
.menu__personal {
  display: flex;
  padding: 0 20px 20px 20px;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 15px;
}

.menu__personal_logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: var(--white);
  border-radius: 50%;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.menu__personal_logo svg {
  width: 32px;
  height: 32px;
  opacity: 0.8;
  display: block;
}

.menu__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.menu__personal_info {
  flex: 1;
  min-width: 0;
}

.menu__personal_name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu__personal_mail {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стили для кнопки баланса - КАК В HEADER */
.menu__balance {
  padding: 0 20px 15px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 15px;
}

.menu__balance_button {
  display: flex;
  width: 100%;
  padding: 12px 15px;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: border-color 0.15s linear;
  cursor: pointer;
  font-size: 14px;
}

.menu__balance_button:hover {
  border-color: var(--text);
}

.menu__balance_button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu__balance_button span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стили для кнопки реферальной ссылки - КАК В HEADER */
.menu__referral {
  padding: 0 20px 15px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 15px;
}

.menu__referral_button {
  display: flex;
  width: 100%;
  padding: 12px 15px;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: all 0.15s linear;
  cursor: pointer;
  font-size: 14px;
}

.menu__referral_button:hover:not(:disabled) {
  border-color: var(--text);
}

.menu__referral_button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.menu__referral_button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu__referral_button span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Основной список навигации */
.menu__list {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0;
  padding: 0;
}

.menu__item {
  list-style: none;
}

.menu__logout {
  border-top: 1px solid var(--border);
  margin-top: 10px;
  padding-top: 10px;
}

.menu__privacy {
  border-top: 1px solid var(--border);
  margin-top: 10px;
  padding-top: 10px;
}

.menu__link {
  display: flex;
  width: 100%;
  padding: 14px 30px;
  align-items: center;
  gap: 12px;
  position: relative;
  color: var(--text);
  background-color: var(--bg);
  transition: color 0.15s linear, background-color 0.15s linear;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.menu__link::after {
  content: "";
  width: 3px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  background-color: var(--color);
  opacity: 0;
  transition: opacity 0.15s linear;
}

.menu__link.router-link-exact-active,
.menu__link:hover {
  color: var(--text);
  background-color: var(--bg-color);
}

.menu__link.router-link-exact-active::after {
  opacity: 1;
}

.menu__link svg {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}

.menu__link span:last-child {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стили для кнопки выхода */
.menu__logout .menu__link {
  color: var(--text);
}

.menu__logout .menu__link:hover {
  color: var(--color);
  background-color: var(--bg-color);
}

@media (max-width: 1919px) {
  .menu__block {
    left: 40px;
    transform: none;
  }
}
@media (max-width: 1439px) {
  .menu__back,
  .menu__block {
    display: none;
  }
}
@media (max-width: 1023px) {
  .menu__block {
    left: 15px;
  }
}
@media (max-width: 767px) {
}
</style>