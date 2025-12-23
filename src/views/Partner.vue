<script lang="ts" setup>
import { ref, computed } from "vue";
import Header from "@/components/layout/Header.vue";
import Menu from "@/components/layout/Menu.vue";
import PersonalSVG from "@/uikit/icon/PersonalSVG.vue";
import MoreSVG from "@/uikit/icon/MoreSVG.vue";
import ButtonSVG from "@/uikit/icon/ButtonSVG.vue";

// Интерфейс для партнера
interface Partner {
  id: number;
  name: string;
  email: string;
  date: string;
  earnings: string;
  releases: string;
}

// Объект для списка партнеров
const partnersData = ref<Partner[]>([
  {
    id: 1,
    name: "Superkuper",
    email: "mail@yandex.ru",
    date: "12.10.2025",
    earnings: "400 ₽",
    releases: "3 релиза"
  },
  {
    id: 2,
    name: "leoneo",
    email: "leoneo@mail.com",
    date: "11.10.2025",
    earnings: "800 ₽",
    releases: "6 релизов"
  },
  {
    id: 3,
    name: "tat55",
    email: "tatiana@example.com",
    date: "10.10.2025",
    earnings: "1200 ₽",
    releases: "9 релизов"
  },
  {
    id: 4,
    name: "musiclover",
    email: "music@protonmail.com",
    date: "09.10.2025",
    earnings: "400 ₽",
    releases: "2 релиза"
  },
  {
    id: 5,
    name: "beatmaker",
    email: "beats@gmail.com",
    date: "08.10.2025",
    earnings: "1600 ₽",
    releases: "12 релизов"
  },
  {
    id: 6,
    name: "dj_pro",
    email: "dj@yandex.ru",
    date: "07.10.2025",
    earnings: "400 ₽",
    releases: "1 релиз"
  },
  {
    id: 7,
    name: "soundmaster",
    email: "sound@mail.ru",
    date: "06.10.2025",
    earnings: "1200 ₽",
    releases: "8 релизов"
  },
  {
    id: 8,
    name: "vocalist",
    email: "vocal@protonmail.com",
    date: "05.10.2025",
    earnings: "800 ₽",
    releases: "5 релизов"
  },
  {
    id: 9,
    name: "guitarhero",
    email: "guitar@example.com",
    date: "04.10.2025",
    earnings: "400 ₽",
    releases: "3 релиза"
  },
  {
    id: 10,
    name: "producer_x",
    email: "producer@yandex.ru",
    date: "03.10.2025",
    earnings: "2000 ₽",
    releases: "15 релизов"
  },
  {
    id: 11,
    name: "bassline",
    email: "bass@mail.com",
    date: "02.10.2025",
    earnings: "400 ₽",
    releases: "2 релиза"
  },
  {
    id: 12,
    name: "synthwave",
    email: "synth@example.com",
    date: "01.10.2025",
    earnings: "1200 ₽",
    releases: "7 релизов"
  },
  {
    id: 13,
    name: "drummer",
    email: "drums@yandex.ru",
    date: "30.09.2025",
    earnings: "800 ₽",
    releases: "4 релиза"
  },
  {
    id: 14,
    name: "mixengineer",
    email: "mix@protonmail.com",
    date: "29.09.2025",
    earnings: "400 ₽",
    releases: "3 релиза"
  },
  {
    id: 15,
    name: "composer",
    email: "compose@mail.ru",
    date: "28.09.2025",
    earnings: "1600 ₽",
    releases: "10 релизов"
  }
]);

// Пагинация для партнеров
const partnersPerPage = ref<number>(6);
const currentPartnersPage = ref<number>(1);

// Вычисляемые свойства для партнеров
const totalPartnersPages = computed(() => {
  return Math.ceil(partnersData.value.length / partnersPerPage.value);
});

const paginatedPartners = computed(() => {
  const start = (currentPartnersPage.value - 1) * partnersPerPage.value;
  const end = start + partnersPerPage.value;
  return partnersData.value.slice(start, end);
});

const showPartnersPagination = computed(() => {
  return partnersData.value.length > partnersPerPage.value;
});

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
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="partner__top">
        <h3 class="partner__head">ЧТО ТАКОЕ ПАРТНЁРСКАЯ ПРОГРАММА VAUVISION?</h3>
        <p class="partner__desc">Получайте 400 рублей за каждого друга, выкладывающего релизы через VAUVISION по вашей реферальной ссылке! А также за их каждый следующий релиз и за каждый релиз их друзей! </p>
      </div>
      <div class="partner__flex">
        <div class="partner__content">
          <div class="partner__table">
            <h5 class="partner__heading">Партнеры, зарегистрировавшиеся по вашей ссылке</h5>
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
            
            <!-- Альтернатива: кнопка "Загрузить еще" -->
            <!--
            <button 
              class="partner__load button__primary"
              @click="loadMorePartners"
              v-if="partnersPerPage < partnersData.length"
            >
              <span>Загрузить еще</span>
            </button>
            -->
          </div>
        </div>
        <div class="partner__right">
          <div class="partner__conditions">
            <div class="partner__conditions_info">
              <h5 class="partner__conditions_head">условия участия</h5>
              <p class="partner__conditions_desc">Детали начисления за повторные релизы и приглашенных друзей указаны ниже в разделе «Условия участия».</p>
            </div>
            <button class="partner__conditions_button button__red"><span>стать партнером</span></button>
          </div>
          <div class="partner__referral">
            <div class="partner__referral_info">
              <h5 class="partner__referral_head">реферальная ссылка</h5>
              <p class="partner__referral_desc">Зарабатывайте вместе с VAUVISION.Получайте реальные деньги за каждого вашего друга, выложевшего релиз.</p>
            </div>
            <div class="partner__referral_info">
              <p class="partner__referral_heading button">ваша реферальная ссылка</p>
              <button class="partner__conditions_copy text_very"><span>Появится после принятия условий участия</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
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
.partner__conditions_head {
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
}
.partner__conditions_copy:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
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
}
</style>