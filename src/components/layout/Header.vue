<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import LogoSVG from "@/uikit/Logo.vue";
import PaySVG from "@/uikit/icon/PaySVG.vue";
import LinkSVG from "@/uikit/icon/LinkSVG.vue";
import PersonalSVG from "@/uikit/icon/PersonalSVG.vue";
import HomeSVG from "@/uikit/menu/HomeSVG.vue";
import UploadSVG from "@/uikit/menu/UploadSVG.vue";
import SettingSVG from "@/uikit/menu/SettingSVG.vue";
import PartnerSVG from "@/uikit/menu/PartnerSVG.vue";
import FaqSVG from "@/uikit/menu/FaqSVG.vue";
import LogoutSVG from "@/uikit/menu/LogoutSVG.vue";
import ArticlesSVG from "@/uikit/menu/ArticlesSVG.vue";
import Tr from "@/i18n/translation";
import { sendRequest } from '@/utils/api';

const isMenuPopup = ref<boolean>(false);
const isOverlay = ref<boolean>(false);
const menu = ref<boolean>(false);

// Данные пользователя
const userData = ref({
  name: '',
  email: '',
  balance: 0,
  avatar: ''
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

const fetchUserData = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    console.log('Header данные из API:', response.data);
    
    if (response.data) {
      // Данные пользователя
      if (response.data.user) {
        userData.value.name = response.data.user.name || response.data.user.login || 'Пользователь';
        userData.value.email = response.data.user.email || '';
        
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
      
      // Ссылка для выхода
      if (response.data.unauth) {
        logoutUrl.value = response.data.unauth;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных в Header:', error);
  }
};

// Функция для копирования ссылки
const copyReferralLink = async () => {
  if (!referralLink.value) return;
  
  isCopying.value = true;
  copySuccess.value = false;
  
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copySuccess.value = true;
    
    // Сбрасываем статус через 2 секунды
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Ошибка при копировании:', err);
  } finally {
    isCopying.value = false;
  }
};

// Функция для получения полного URL аватарки
const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  return `${baseUrl}${cleanPath}`;
};

onMounted(async () => {
  await fetchUserData();
});

const clickOverlay = () => {
  isMenuPopup.value = false;
  isOverlay.value = false;
  menu.value = false;
  document.documentElement.classList.remove("noscroll");
};

if (isMenuPopup.value === false) {
  document.addEventListener('keyup', function (evt) {
    if (evt.keyCode === 27) {
      isMenuPopup.value = false;
      isOverlay.value = false;
      menu.value = false;
      document.documentElement.classList.remove("noscroll");
    }
  });
};

// Функция для переключения меню
const toggleMenu = () => {
  menu.value = !menu.value;
  isMenuPopup.value = menu.value;
  isOverlay.value = menu.value;
  
  if (menu.value) {
    document.documentElement.classList.add("noscroll");
  } else {
    document.documentElement.classList.remove("noscroll");
  }
};

// Функция для закрытия меню при клике на ссылку
const closeMenu = () => {
  menu.value = false;
  isMenuPopup.value = false;
  isOverlay.value = false;
  document.documentElement.classList.remove("noscroll");
};

// Функция для выхода
const handleLogout = () => {
  if (logoutUrl.value) {
    window.location.href = `${baseUrl}${logoutUrl.value}`;
  }
};

// Форматирование баланса
const formattedBalance = (balance: number) => {
  return balance.toLocaleString('ru-RU');
};

// Обработчик ошибки загрузки аватарки
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    // Показываем иконку-заглушку
    const svg = parent.querySelector('svg');
    if (svg) {
      svg.style.display = 'block';
    }
  }
};
</script>

<template>
  <div :class="['overlay', { active: isOverlay }]" @click="clickOverlay"></div>
  
  <header class="header">
    <div class="container header__container">
      <div class="header__block">
        <div class="header__flex">
          <a href="/" class="header__logo">
            <LogoSVG />
          </a>
          
          <div class="header__info">
            <div 
              class="header__balance header__button" 
              :title="'Счёт обновляется после скачивания отчёта. Пожалуйста, скачайте отчёт, после этого сумма на балансе обновится'"
            >
              <PaySVG />
              <span>Баланс: {{ formattedBalance(userData.balance) }} руб.</span>
            </div>
            <button 
              v-if="referralLink"
              class="header__invite header__button"
              @click="copyReferralLink"
              :disabled="isCopying"
            >
              <LinkSVG />
              <span>{{ copySuccess ? 'Скопировано!' : 'Пригласи партнера по ссылке' }}</span>
            </button>
          </div>
          
          <div class="header__right">
            <RouterLink class="header__faq" :to="Tr.i18nRoute({ name: 'faq' })" @click="closeMenu">
              <FaqSVG />
            </RouterLink>
            <button class="header__personal">
              <div class="header__personal_logo">
                <img 
                  v-if="userData.avatar"
                  :src="getAvatarUrl(userData.avatar)"
                  @error="handleAvatarError"
                  alt="Avatar"
                  class="header__avatar"
                >
                <PersonalSVG v-else />
              </div>
            </button>
            <button class="header__burger" :class="{ active: menu }" @click="toggleMenu">
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <section class="top"></section>
  
  <div class="burger__menu" :class="{ active: menu }">
    <div class="container burger__container">
      <div class="burger__block">
        <div class="burger__flex">
          <!-- Заголовок меню -->
          <div class="burger__header">
            <RouterLink class="burger__logo" :to="Tr.i18nRoute({ name: 'home' })" @click="closeMenu">
              <LogoSVG />
            </RouterLink>
            <div class="burger__right">
              <button class="header__faq">
                <FaqSVG />
              </button>
              <button class="header__burger" :class="{ active: menu }" @click="toggleMenu">
                <span></span>
              </button>
            </div>
          </div>
          
          <!-- Информация о пользователе с аватаркой -->
          <div class="burger__personal">
            <div class="burger__personal_logo">
              <img 
                v-if="userData.avatar"
                :src="getAvatarUrl(userData.avatar)"
                @error="handleAvatarError"
                alt="Avatar"
                class="burger__avatar"
              >
              <PersonalSVG v-else />
            </div>
            <div class="burger__personal_info">
              <h6 class="burger__personal_name">{{ userData.name || 'Пользователь' }}</h6>
              <p class="burger__personal_mail">{{ userData.email || 'email@example.com' }}</p>
            </div>
          </div>
          
          <!-- Навигация -->
          <nav class="burger__nav">
            <ul class="burger__nav_list">
              <li class="burger__nav_item burger__profile">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'setting' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <SettingSVG class="burger__nav_icon" />
                  <p>Профиль</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'personal' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <HomeSVG class="burger__nav_icon" />
                  <p>Главная</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'release' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <UploadSVG class="burger__nav_icon" />
                  <p>Выложить релиз</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'partner' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <PartnerSVG class="burger__nav_icon" />
                  <p>Стать партнером</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'faq' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <FaqSVG class="burger__nav_icon" />
                  <p>FAQ</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'articles' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <ArticlesSVG class="burger__nav_icon" />
                  <p>Статьи</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'faq' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <FaqSVG class="burger__nav_icon" />
                  <p>Связь с поддержкой</p>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <a 
                  href="https://vauvision.com/auth/profile/"
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <FaqSVG class="burger__nav_icon" />
                  <p>Старая версия</p>
              </a>
              </li>
              <li class="burger__nav_item burger__logout">
                <button 
                  class="burger__nav_link" 
                  @click="handleLogout"
                >
                  <LogoutSVG class="burger__nav_icon" />
                  <p>Выйти из аккаунта</p>
                </button>
              </li>
            </ul>
          </nav>
          
          <!-- Кнопки с балансом и реферальной ссылкой -->
          <div class="burger__buttons">
            <div 
              class="header__balance header__button" 
              :title="'Счёт обновляется после скачивания отчёта. Пожалуйста, скачайте отчёт, после этого сумма на балансе обновится'"
            >
              <PaySVG />
              <span>Баланс: {{ formattedBalance(userData.balance) }} руб.</span>
            </div>
            <button 
              v-if="referralLink"
              class="header__invite header__button burger__copy-button"
              @click="copyReferralLink"
              :disabled="isCopying"
            >
              <LinkSVG />
              <span>{{ copySuccess ? 'Скопировано!' : 'Скопировать реферальную ссылку' }}</span>
            </button>
          </div>
          
          <!-- Политика конфиденциальности -->
          <div class="burger__privacy">
            <RouterLink 
              :to="Tr.i18nRoute({ name: 'home' })" 
              class="burger__privacy_link"
              @click="closeMenu"
            >
              Политика конфиденциальности
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 299;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

.top {
  height: 80px;
  margin: 0;
}

.header {
  width: 100%;
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 202;
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
}

.header__block {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.header__logo {
  display: flex;
  width: 279px;
  height: 100%;
  align-items: center;
  border-right: 1px solid var(--border);
  transition: color 0.15s linear;
}

.header__logo:hover {
  color: var(--color);
}

.header__logo svg {
  width: 175px;
  height: 32px;
  object-fit: contain;
}

.header__flex {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 130px;
}

.header__info {
  display: flex;
  gap: 20px;
}

.header__button {
  display: flex;
  width: max-content;
  padding: 14px 25px;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: color 0.15s linear, background-color 0.15s linear, border-color 0.15s linear;
  cursor: pointer;
}

.header__button:hover {
  color: var(--text);
  background-color: var(--bg);
  border-color: var(--text);
}

.header__button span {
  flex: 0 0 auto;
}

.header__button svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.header__right {
  display: flex;
  margin: 0 0 0 auto;
  flex: 0 0 auto;
  align-items: center;
  flex-wrap: nowrap;
  gap: 10px;
}

.header__faq,
.header__personal {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  transition: color 0.15s linear, background-color 0.15s linear, border-color 0.15s linear;
}

.header__faq {
  color: var(--text);
  background-color: var(--bg);
}

.header__faq:hover {
  color: var(--text);
  background-color: var(--bg);
  border-color: var(--color);
}

.header__personal {
  color: var(--text);
  background-color: var(--bg-color);
}
.header__personal_logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.header__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.header__personal:hover {
  background-color: var(--border);
}

.header__faq svg {
  width: 22.79px;
  height: 22.79px;
  object-fit: contain;
}

.header__personal svg {
  width: 26.71px;
  height: 26.71px;
  object-fit: contain;
  opacity: 0.7;
}

.header__burger {
  display: none;
}

/* Burger Menu */
.burger__menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 440px;
  height: 100vh;
  background-color: var(--bg);
  border-left: 1px solid var(--border);
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
  transition: right 0.4s cubic-bezier(0.77, 0, 0.175, 1);
  z-index: 300;
  overflow-y: auto;
  overflow-x: hidden;
}

.burger__menu.active {
  right: 0;
}

.burger__container {
  height: 100%;
  padding: 0;
}

.burger__block {
  height: 100%;
}
.burger__flex {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.burger__header {
  display: flex;
  height: 60px;
  padding: 0 10px 0 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.burger__logo {
  width: auto;
  padding: 0;
  border-right: none;
}
.burger__logo svg {
  width: 140px;
  height: 25px;
}
.burger__right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.burger__header .header__burger {
  display: inline-block;
  width: 50px;
  height: 50px;
  position: relative;
  cursor: pointer;
}
.burger__personal {
  display: flex;
  padding: 30px 20px 20px;
  align-items: center;
  gap: 15px;
}
.burger__personal_logo {
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
}
.burger__personal_logo svg {
  width: 32px;
  height: 32px;
  opacity: 0.8;
}
.burger__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.burger__personal_info {
  flex: 1;
}
.burger__personal_name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 5px 0;
}
.burger__personal_mail {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.8;
}
.burger__nav {
  flex: 1;
}
.burger__profile {
  margin: 0 0 20px;
  padding: 0 0 20px;
  border-bottom: 1px solid var(--border);
}
.burger__logout {
  margin: 20px 0 0;
  padding: 10px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.burger__nav_link {
  display: flex;
  width: 100%;
  padding: 12px 20px;
  align-items: center;
  color: var(--text);
  gap: 12px;
  text-align: left;
  transition: color 0.15s linear;
  cursor: pointer;
}
.burger__nav_link:hover,
.burger__nav_link:hover p {
  color: var(--color);
}
.burger__nav_link.router-link-active,
.burger__nav_link.router-link-active p {
  color: var(--color);
}
.burger__nav_icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
}
.burger__buttons {
  display: flex;
  margin: 50px 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.header__invite:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}
.burger__privacy {
  margin: auto 0 0;
  padding: 40px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
}
.burger__privacy_link {
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
}
.burger__privacy_link:hover {
  color: var(--color);
}

@media (max-width: 1919px) {
  .header__flex {
    gap: 50px;
  }
}
@media (max-width: 1439px) {
  .header__info,
  .header__personal {
    display: none;
  }
  .header__burger {
    display: inline-block;
    width: 50px;
    height: 50px;
    position: relative;
    z-index: 1;
    cursor: pointer;
  }
  .header__burger span {
    background-color: var(--text);
    content: "";
    display: block;
    height: 2px;
    left: calc(50% - 13px);
    position: absolute;
    top: calc(50% - 1px);
    transform-origin: 50% 50%;
    transition: background-color 0.2s ease-in-out, top 0.2s 0.2s ease-out, transform 0.2s linear;
    width: 26px;
  }
  .header__burger span:before,
  .header__burger span:after {
    background-color: var(--text);
    content: "";
    display: block;
    height: 2px;
    position: absolute;
    transform-origin: 50% 50%;
    transition: background-color 0.2s ease-in-out, top 0.2s 0.2s ease-out, transform 0.2s linear;
    width: 26px;
  }
  .header__burger span:before {
    top: 7px;
  }
  .header__burger span:after {
    top: -7px;
  }
  .header__burger.active span {
    background-color: transparent;
    transition: background-color 0.2s ease-out;
  }
  .header__burger.active span:before,
  .header__burger.active span:after {
    transition: top 0.2s ease-out, transform 0.2s 0.2s ease-out;
  }
  .header__burger.active span:before {
    top: 0;
    transform: rotate3d(0, 0, 1, -45deg);
  }
  .header__burger.active span:after {
    top: 0;
    transform: rotate3d(0, 0, 1, 45deg);
  }
  .header__flex {
    gap: 70px;
  }
}

@media (max-width: 767px) {
  .burger__personal_logo {
    width: 60px;
    height: 60px;
  }
}
</style>