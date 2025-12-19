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
import Tr from "@/i18n/translation";

const isMenuPopup = ref<boolean>(false);
const isOverlay = ref<boolean>(false);
const menu = ref<boolean>(false);

const getData = async () => {
  // const getversion = await sendRequest (
  //   "get",
  //   '/api/v1/app-versions/last/',
  //   {}
  // )
  // .then((response:any) => {
  //   return response;
  // });
  // versions.value = getversion.data.version_number;
};

onMounted(async () => {
  getData();
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
</script>

<template>
  <div :class="['overlay', { active: isOverlay }]" @click="clickOverlay"></div>
  
  <header class="header">
    <div class="container header__container">
      <div class="header__block">
        <div class="header__flex">
          <RouterLink class="header__logo" :to="Tr.i18nRoute({ name: 'home' })">
            <LogoSVG />
          </RouterLink>
          
          <div class="header__info">
            <div class="header__balance header__button">
              <PaySVG />
              <span>Баланс: 144 000 руб.</span>
            </div>
            <div class="header__invite header__button">
              <LinkSVG />
              <span>Пригласи партнера по ссылке</span>
            </div>
          </div>
          
          <div class="header__right">
            <button class="header__faq">
              <FaqSVG />
            </button>
            <button class="header__personal">
              <PersonalSVG />
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
            <RouterLink class="header__logo" :to="Tr.i18nRoute({ name: 'home' })" @click="closeMenu">
              <LogoSVG />
            </RouterLink>
            <button class="header__burger" :class="{ active: menu }" @click="toggleMenu">
              <span></span>
            </button>
          </div>
          
          <!-- Информация пользователя -->
          <div class="burger__personal">
            <div class="burger__personal_logo">
              <PersonalSVG />
            </div>
            <div class="burger__personal_info">
              <h5 class="burger__personal_name">Виктор Иванов</h5>
              <p class="burger__personal_mail">example@gmail.com</p>
            </div>
          </div>
          
          <!-- Навигационное меню -->
          <nav class="burger__nav">
            <ul class="burger__nav_list">
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'personal' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <HomeSVG class="burger__nav_icon" />
                  <span>Главная</span>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'quiz' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <UploadSVG class="burger__nav_icon" />
                  <span>Выложить релиз</span>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'setting' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <SettingSVG class="burger__nav_icon" />
                  <span>Настройки</span>
                </RouterLink>
              </li>
              <li class="burger__nav_item">
                <RouterLink 
                  :to="Tr.i18nRoute({ name: 'partner' })" 
                  class="burger__nav_link"
                  @click="closeMenu"
                >
                  <PartnerSVG class="burger__nav_icon" />
                  <span>Стать партнером</span>
                </RouterLink>
              </li>
              <li class="burger__nav_item burger__nav_item--logout">
                <button class="burger__nav_link burger__nav_link--logout" @click="closeMenu">
                  <LogoutSVG class="burger__nav_icon" />
                  <span>Выйти</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <!-- Кнопки -->
          <div class="burger__buttons">
            <div class="header__balance header__button">
              <PaySVG />
              <span>Баланс: 144 000 руб.</span>
            </div>
            <div class="header__invite header__button">
              <LinkSVG />
              <span>Пригласи партнера по ссылке</span>
            </div>
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
  padding: 0 0 0 30px;
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
  gap: 120px;
}

.header__info {
  display: flex;
  gap: 20px;
}

.header__button {
  display: flex;
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
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
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

.header__faq:hover,
.header__personal:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
}

.header__faq svg {
  width: 22.79px;
  height: 22.79px;
  object-fit: contain;
}

.header__personal {
  color: var(--text);
  background-color: var(--bg-gray);
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
  padding: 30px;
}

.burger__flex {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 30px;
}

/* Burger Header */
.burger__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.burger__header .header__logo {
  width: auto;
  padding: 0;
  border-right: none;
}

.burger__header .header__logo svg {
  width: 150px;
  height: 28px;
}

.burger__header .header__burger {
  display: inline-block;
  width: 50px;
  height: 50px;
  position: relative;
  cursor: pointer;
}

/* Personal Info in Burger */
.burger__personal {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: var(--bg-gray);
  border-radius: 12px;
  margin-bottom: 10px;
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
}

.burger__personal_logo svg {
  width: 32px;
  height: 32px;
  opacity: 0.8;
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

/* Menu Items in Burger */
.burger__nav {
  flex: 1;
}

.burger__nav_list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.burger__nav_item {
  margin-bottom: 8px;
}

.burger__nav_item--logout {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.burger__nav_link {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: var(--text);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  gap: 12px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
  cursor: pointer;
}

.burger__nav_link:hover {
  background-color: var(--bg-gray);
  color: var(--color);
}

.burger__nav_link.router-link-active {
  background-color: var(--color-light);
  color: var(--color);
  font-weight: 500;
}

.burger__nav_link--logout {
  color: var(--error);
}

.burger__nav_link--logout:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.burger__nav_icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.burger__nav_link:hover .burger__nav_icon {
  opacity: 1;
}

/* Buttons in Burger */
.burger__buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

.burger__buttons .header__button {
  display: flex;
  padding: 16px 25px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  transition: all 0.15s linear;
  cursor: pointer;
  font-size: 15px;
  width: 100%;
}

.burger__buttons .header__button:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Privacy Policy */
.burger__privacy {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  text-align: center;
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

/* Scrollbar Styling */
.burger__menu::-webkit-scrollbar {
  width: 6px;
}

.burger__menu::-webkit-scrollbar-track {
  background: var(--bg-gray);
}

.burger__menu::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.burger__menu::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* No Scroll on Body */
.noscroll {
  overflow: hidden;
}

/* Responsive Adjustments */
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
}

@media (max-width: 440px) {
  .burger__menu {
    max-width: 100%;
    border-left: none;
  }
  
  .burger__block {
    padding: 20px;
  }
  
  .burger__personal {
    padding: 15px;
  }
  
  .burger__personal_logo {
    width: 50px;
    height: 50px;
  }
  
  .burger__personal_logo svg {
    width: 26px;
    height: 26px;
  }
  
  .burger__header .header__logo svg {
    width: 130px;
    height: 24px;
  }
}

@media (max-width: 374px) {
  .burger__block {
    padding: 15px;
  }
  
  .burger__flex {
    gap: 20px;
  }
  
  .burger__buttons .header__button {
    padding: 14px 20px;
    font-size: 14px;
  }
  
  .burger__nav_link {
    padding: 12px 15px;
    font-size: 15px;
  }
  
  .burger__personal_name {
    font-size: 16px;
  }
  
  .burger__personal_mail {
    font-size: 13px;
  }
}
</style>