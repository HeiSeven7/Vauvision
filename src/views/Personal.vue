<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import Menu from "@/components/layout/Menu.vue";
import DownloadSVG from "@/uikit/icon/DownloadSVG.vue";
import EyeSVG from "@/uikit/icon/EyeSVG.vue";
import LinkSVG from "@/uikit/icon/LinkSVG.vue";
import WalletSVG from "@/uikit/icon/WalletSVG.vue";
import PaySVG from "@/uikit/icon/PaySVG.vue";
import ReportsSVG from "@/uikit/icon/ReportsSVG.vue";
import TransactionSVG from "@/uikit/icon/TransactionSVG.vue";
import ButtonSVG from "@/uikit/icon/ButtonSVG.vue";
import Tr from "@/i18n/translation"

// Интерфейсы для объектов списков
interface Release {
  id: number;
  title: string;
  type: string;
  album: string;
  date: string;
  image: string;
  upcCode: string;
  link: string;
}

interface Report {
  id: number;
  filename: string;
  filesize: string;
  date: string;
  hasAct: boolean;
}

interface Transaction {
  id: number;
  type: string;
  date: string;
  period: string;
  status: 'completed' | 'processing' | 'cancelled';
  amount: string;
}

// Объекты для списка релизов
const releasesData = ref<Release[]>([
  {
    id: 1,
    title: "Where Have You Been (Orchestra)",
    type: "Сингл",
    album: "Lune",
    date: "10.10.2025",
    image: "releases_1.webp",
    upcCode: "8712",
    link: "https://www.google.com"
  },
  {
    id: 2,
    title: "Where Have You Been (Orchestra)",
    type: "Альбом",
    album: "Lune",
    date: "10.10.2025",
    image: "releases_2.webp",
    upcCode: "8713",
    link: "https://www.google.com"
  },
  {
    id: 3,
    title: "Where Have You Been (Orchestra)",
    type: "Сингл",
    album: "Lune",
    date: "10.10.2025",
    image: "releases_3.webp",
    upcCode: "8714",
    link: "https://www.google.com"
  },
  {
    id: 4,
    title: "Where Have You Been (Orchestra)",
    type: "Сингл",
    album: "Lune",
    date: "10.10.2025",
    image: "releases_4.webp",
    upcCode: "8715",
    link: "https://www.google.com"
  },
  {
    id: 5,
    title: "Where Have You Been (Orchestra)",
    type: "Сингл",
    album: "Lune",
    date: "10.10.2025",
    image: "releases_5.webp",
    upcCode: "8716",
    link: "https://www.google.com"
  },
  {
    id: 6,
    title: "Moonlight Sonata",
    type: "Альбом",
    album: "Classical Collection",
    date: "15.10.2025",
    image: "releases_1.webp",
    upcCode: "8717",
    link: "https://www.apple.com"
  },
  {
    id: 7,
    title: "Summer Vibes",
    type: "Сингл",
    album: "Beach Hits",
    date: "20.10.2025",
    image: "releases_2.webp",
    upcCode: "8718",
    link: "https://www.spotify.com"
  },
  {
    id: 8,
    title: "Winter Dreams",
    type: "Альбом",
    album: "Seasonal",
    date: "25.10.2025",
    image: "releases_3.webp",
    upcCode: "8719",
    link: "https://www.youtube.com"
  },
  {
    id: 9,
    title: "Autumn Leaves",
    type: "Сингл",
    album: "Seasonal",
    date: "30.10.2025",
    image: "releases_4.webp",
    upcCode: "8720",
    link: "https://www.deezer.com"
  },
  {
    id: 10,
    title: "Spring Flowers",
    type: "Сингл",
    album: "Seasonal",
    date: "05.11.2025",
    image: "releases_5.webp",
    upcCode: "8721",
    link: "https://www.tidal.com"
  }
]);

// Объекты для списка отчетов
const reportsData = ref<Report[]>([
  {
    id: 1,
    filename: "ArtistName Q1 2025.pdf",
    filesize: "2.4 MB",
    date: "12.10.2025",
    hasAct: true
  },
  {
    id: 2,
    filename: "ArtistName Q2 2025.pdf",
    filesize: "3.1 MB",
    date: "05.04.2025",
    hasAct: true
  },
  {
    id: 3,
    filename: "ArtistName Q3 2025.pdf",
    filesize: "5.7 MB",
    date: "15.01.2025",
    hasAct: true
  },
  {
    id: 4,
    filename: "ArtistName Q4 2024.pdf",
    filesize: "4.2 MB",
    date: "20.12.2024",
    hasAct: true
  },
  {
    id: 5,
    filename: "ArtistName Q1 2024.pdf",
    filesize: "3.8 MB",
    date: "10.10.2024",
    hasAct: true
  },
  {
    id: 6,
    filename: "ArtistName Q2 2024.pdf",
    filesize: "4.5 MB",
    date: "05.07.2024",
    hasAct: true
  },
  {
    id: 7,
    filename: "ArtistName Q3 2024.pdf",
    filesize: "5.2 MB",
    date: "15.04.2024",
    hasAct: true
  },
  {
    id: 8,
    filename: "ArtistName Q4 2023.pdf",
    filesize: "3.9 MB",
    date: "20.12.2023",
    hasAct: true
  },
  {
    id: 9,
    filename: "ArtistName Q1 2023.pdf",
    filesize: "2.8 MB",
    date: "10.10.2023",
    hasAct: true
  },
  {
    id: 10,
    filename: "ArtistName Q2 2023.pdf",
    filesize: "3.3 MB",
    date: "05.07.2023",
    hasAct: true
  }
]);

// Объекты для списка транзакций
const transactionsData = ref<Transaction[]>([
  {
    id: 1,
    type: "Выплата роялти",
    date: "15.10.2025",
    period: "Q3 2025",
    status: "completed",
    amount: "55 000 ₽"
  },
  {
    id: 2,
    type: "Пополнение счета",
    date: "10.10.2025",
    period: "-",
    status: "completed",
    amount: "55 000 ₽"
  },
  {
    id: 3,
    type: "Выплата бонусов",
    date: "05.10.2025",
    period: "Сентябрь 2025",
    status: "processing",
    amount: "55 000 ₽"
  },
  {
    id: 4,
    type: "Комиссия сервиса",
    date: "01.10.2025",
    period: "-",
    status: "completed",
    amount: "55 000 ₽"
  },
  {
    id: 5,
    type: "Выплата роялти",
    date: "15.09.2025",
    period: "Q2 2025",
    status: "completed",
    amount: "48 500 ₽"
  },
  {
    id: 6,
    type: "Пополнение счета",
    date: "10.09.2025",
    period: "-",
    status: "completed",
    amount: "25 000 ₽"
  },
  {
    id: 7,
    type: "Выплата бонусов",
    date: "05.09.2025",
    period: "Август 2025",
    status: "completed",
    amount: "12 300 ₽"
  },
  {
    id: 8,
    type: "Комиссия сервиса",
    date: "01.09.2025",
    period: "-",
    status: "completed",
    amount: "5 500 ₽"
  },
  {
    id: 9,
    type: "Выплата роялти",
    date: "15.08.2025",
    period: "Q1 2025",
    status: "completed",
    amount: "42 000 ₽"
  },
  {
    id: 10,
    type: "Отмена выплаты",
    date: "10.08.2025",
    period: "-",
    status: "cancelled",
    amount: "10 000 ₽"
  },
  {
    id: 11,
    type: "Выплата бонусов",
    date: "05.08.2025",
    period: "Июль 2025",
    status: "completed",
    amount: "8 750 ₽"
  },
  {
    id: 12,
    type: "Комиссия сервиса",
    date: "01.08.2025",
    period: "-",
    status: "completed",
    amount: "4 200 ₽"
  }
]);

// Пагинация для релизов
const releasesPerPage = ref<number>(5);
const currentReleasesPage = ref<number>(1);

// Пагинация для отчетов
const reportsPerPage = ref<number>(3);
const currentReportsPage = ref<number>(1);

// Пагинация для транзакций
const transactionsPerPage = ref<number>(4);
const currentTransactionsPage = ref<number>(1);

// Вычисляемые свойства для релизов
const totalReleasesPages = computed(() => {
  return Math.ceil(releasesData.value.length / releasesPerPage.value);
});

const paginatedReleases = computed(() => {
  const start = (currentReleasesPage.value - 1) * releasesPerPage.value;
  const end = start + releasesPerPage.value;
  return releasesData.value.slice(start, end);
});

const showReleasesPagination = computed(() => {
  return releasesData.value.length > releasesPerPage.value;
});

// Вычисляемые свойства для отчетов
const totalReportsPages = computed(() => {
  return Math.ceil(reportsData.value.length / reportsPerPage.value);
});

const paginatedReports = computed(() => {
  const start = (currentReportsPage.value - 1) * reportsPerPage.value;
  const end = start + reportsPerPage.value;
  return reportsData.value.slice(start, end);
});

const showReportsPagination = computed(() => {
  return reportsData.value.length > reportsPerPage.value;
});

// Вычисляемые свойства для транзакций
const totalTransactionsPages = computed(() => {
  return Math.ceil(transactionsData.value.length / transactionsPerPage.value);
});

const paginatedTransactions = computed(() => {
  const start = (currentTransactionsPage.value - 1) * transactionsPerPage.value;
  const end = start + transactionsPerPage.value;
  return transactionsData.value.slice(start, end);
});

const showTransactionsPagination = computed(() => {
  return transactionsData.value.length > transactionsPerPage.value;
});

// Методы для пагинации релизов
const nextReleasesPage = () => {
  if (currentReleasesPage.value < totalReleasesPages.value) {
    currentReleasesPage.value++;
  }
};

const prevReleasesPage = () => {
  if (currentReleasesPage.value > 1) {
    currentReleasesPage.value--;
  }
};

// Методы для пагинации отчетов
const nextReportsPage = () => {
  if (currentReportsPage.value < totalReportsPages.value) {
    currentReportsPage.value++;
  }
};

const prevReportsPage = () => {
  if (currentReportsPage.value > 1) {
    currentReportsPage.value--;
  }
};

// Методы для пагинации транзакций
const nextTransactionsPage = () => {
  if (currentTransactionsPage.value < totalTransactionsPages.value) {
    currentTransactionsPage.value++;
  }
};

const prevTransactionsPage = () => {
  if (currentTransactionsPage.value > 1) {
    currentTransactionsPage.value--;
  }
};

// Функция для получения класса статуса
const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'status_completed';
    case 'processing':
      return 'status_processing';
    case 'cancelled':
      return 'status_cancelled';
    default:
      return '';
  }
};

// Инициализация при монтировании
onMounted(() => {
  // Здесь может быть логика загрузки данных из API
  console.log('Компонент Personal загружен');
});
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="personal__balance">
        <div class="personal__balance_info">
          <h3 class="personal__balance_head">Баланс и бонусы аккаунта</h3>
        </div>
        <div class="personal__divider"></div>
        <ul class="personal__balance_list">
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><WalletSVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading">Квартальный отчет</h4>
                <p class="personal__balance_desc">Счёт обновляется после скачивания отчёта. Пожалуйста, скачайте отчёт, после этого сумма на балансе обновится</p>
              </div>
            </div>
            <button class="personal__balance_button button__red"><span><DownloadSVG/>Скачать отчет</span></button>
          </li>
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><WalletSVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading"><span class="personal__balance_description text_one">Счет</span>144 000 ₽</h4>
              </div>
            </div>
            <button class="personal__balance_button button__primary"><span>Запросить выплаты</span></button>
          </li>
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><PaySVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading"><span class="personal__balance_description text_one">Бонусы партнера</span>455</h4>
              </div>
            </div>
            <button class="personal__balance_button button__primary"><span>Запросить выплаты бонусов</span></button>
          </li>
        </ul>
      </div>
      <div class="personal__flex">
        <div class="personal__content">
          <div class="personal__release">
            <div class="personal__release_flex">
              <h5 class="personal__release_head">Выложите релиз</h5>
              <p class="personal__release_desc">Lorem ipsum dolor sit amet consectetur. Gravida elementum mauris penatibus lectus tellus ac neque mollis. Nascetur pulvinar tellus maecenas venenatis pharetra vulputate odio quis pretium.</p>
            </div>
            <button class="personal__release_button button__black"><span>Выложить релиз</span></button>
            <div class="personal__release_image">
              <img src="@/assets/img/personal/release/cassette.webp" alt="">
              <img src="@/assets/img/personal/release/cassette_back.webp" alt="">
            </div>
          </div>
          <div class="personal__releases">
            <div class="personal__releases_block">
              <h5 class="personal__releases_title">Релизы</h5>
              <ul class="personal__releases_list">
                <li 
                  class="personal__releases_item" 
                  v-for="release in paginatedReleases" 
                  :key="release.id"
                >
                  <div class="personal__releases_information">
                    <div class="personal__releases_image">
                      <img :src="`/src/assets/img/personal/releases/${release.image}`" alt="">
                    </div>
                    <div class="personal__releases_flex">
                      <div class="personal__releases_top">
                        <h5 class="personal__releases_head"><span>{{ release.type }}</span> {{ release.title }}</h5>
                        <p class="personal__releases_album text_very">{{ release.album }}</p>
                      </div>
                      <p class="personal__releases_date text_very">{{ release.date }}</p>
                    </div>
                  </div>
                  <div class="personal__releases_info">
                    <div class="personal__releases_top">
                      <h5 class="personal__releases_head"><span>{{ release.type }}</span> {{ release.title }}</h5>
                      <p class="personal__releases_album text_very">{{ release.album }}</p>
                    </div>
                    <div class="personal__releases_codes">
                      <button class="personal__releases_code"><span>UPC код: {{ release.upcCode }}</span></button>
                      <button class="personal__releases_code"><LinkSVG/><span>{{ release.link }}</span></button>
                    </div>
                    <div class="personal__releases_bottom">
                      <p class="personal__releases_date text_very">{{ release.date }}</p>
                      <div class="personal__releases_agreements">
                        <a href="#" class="personal__releases_agreement button" download=""><DownloadSVG/><span>Скачать договор</span></a>
                        <a href="#" class="personal__releases_agreement button" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="pagination__buttons" v-if="showReleasesPagination">
                <button 
                  class="pagination__buttons_button button button__pagination button__pagination_prev"
                  @click="prevReleasesPage"
                  :disabled="currentReleasesPage === 1"
                >
                  <span><ButtonSVG /></span>
                  <span>{{$t('button.prev')}}</span>
                </button>
                
                <div class="pagination__buttons_info">
                  {{ currentReleasesPage }}/{{ totalReleasesPages }}
                </div>
                
                <button 
                  class="pagination__buttons_button button button__pagination button__pagination_next"
                  @click="nextReleasesPage"
                  :disabled="currentReleasesPage === totalReleasesPages"
                >
                <span>{{$t('button.next')}}</span>
                  <span><ButtonSVG /></span>
                </button>
              </div>
            </div>
          </div>
          <div class="personal__reports">
            <div class="personal__reports_top">
              <h5 class="personal__reports_head">Ранее полученные отчеты</h5>
              <p class="personal__reports_desc">Новый отчёт нужно скачать через кнопку «Скачать отчёт» вверху страницы</p>
            </div>
            <ul class="personal__reports_list">
              <li class="personal__reports_item personal__reports_header">
                <div class="personal__reports_cell personal__reports_info text_very">Отчет</div>
                <div class="personal__reports_cell personal__reports_date text_very">Дата</div>
                <div class="personal__reports_cell personal__reports_actions text_very"></div>
              </li>
              <li 
                class="personal__reports_item" 
                v-for="report in paginatedReports" 
                :key="report.id"
              >
                <div class="personal__reports_cell personal__reports_info">
                  <div class="personal__reports_image"><ReportsSVG /></div>
                  <div class="personal__reports_file">
                    <span class="personal__reports_filename">{{ report.filename }}</span>
                    <span class="personal__reports_filesize">{{ report.filesize }}</span>
                  </div>
                </div>
                <div class="personal__reports_cell personal__reports_date">
                  <span class="personal__reports_datevalue">{{ report.date }}</span>
                </div>
                <div class="personal__reports_cell personal__reports_actions">
                  <div class="personal__reports_buttons">
                    <a href="#" class="personal__reports_button button__text" download="">
                      <DownloadSVG/>
                      <span>Скачать</span>
                    </a>
                    <a 
                      href="#" 
                      class="personal__reports_button button__text"
                      v-if="report.hasAct"
                    >
                      <DownloadSVG/>
                      <span>Скачать акт</span>
                    </a>
                  </div>
                </div>
              </li>
            </ul>
            <div class="pagination__buttons" v-if="showReportsPagination">
              <button 
                class="pagination__buttons_button button button__pagination button__pagination_prev"
                @click="prevReportsPage"
                :disabled="currentReportsPage === 1"
              >
                <span><ButtonSVG /></span>
                <span>{{$t('button.prev')}}</span>
              </button>
              
              <div class="pagination__buttons_info">
                {{ currentReportsPage }}/{{ totalReportsPages }}
              </div>
              
              <button 
                class="pagination__buttons_button button button__pagination button__pagination_next"
                @click="nextReportsPage"
                :disabled="currentReportsPage === totalReportsPages"
              >
              <span>{{$t('button.next')}}</span>
                <span><ButtonSVG /></span>
              </button>
            </div>
          </div>
          <div class="personal__transactions">
            <h5 class="personal__transactions_head">Финансовые транзакции</h5>
            <ul class="personal__transactions_list">
              <li class="personal__transactions_item personal__transactions_header">
                <div class="personal__transactions_cell personal__transactions_type text_very">Тип транзакции</div>
                <div class="personal__transactions_cell personal__transactions_date text_very">Дата</div>
                <div class="personal__transactions_cell personal__transactions_period text_very">Период</div>
                <div class="personal__transactions_cell personal__transactions_status text_very">Статус</div>
                <div class="personal__transactions_cell personal__transactions_amount text_very">Сумма</div>
              </li>
              <li 
                class="personal__transactions_item" 
                v-for="transaction in paginatedTransactions" 
                :key="transaction.id"
              >
                <div class="personal__transactions_cell personal__transactions_type">
                  <div class="personal__transactions_image"><TransactionSVG /></div>
                  <span class="personal__transactions_typevalue button">{{ transaction.type }}</span>
                </div>
                <div class="personal__transactions_cell personal__transactions_date">
                  <span class="personal__transactions_datevalue text_small">{{ transaction.date }}</span>
                </div>
                <div class="personal__transactions_cell personal__transactions_period">
                  <span class="personal__transactions_periodvalue text_small">{{ transaction.period }}</span>
                </div>
                <div class="personal__transactions_cell personal__transactions_status">
                  <span 
                    class="personal__transactions_statusvalue text_small"
                    :class="getStatusClass(transaction.status)"
                  >
                    {{ 
                      transaction.status === 'completed' ? 'Завершено' :
                      transaction.status === 'processing' ? 'В обработке' :
                      transaction.status === 'cancelled' ? 'Отменено' : ''
                    }}
                  </span>
                </div>
                <div class="personal__transactions_cell personal__transactions_amount">
                  <span class="personal__transactions_amountvalue text_small">{{ transaction.amount }}</span>
                </div>
              </li>
            </ul>
            <div class="pagination__buttons" v-if="showTransactionsPagination">
              <button 
                class="pagination__buttons_button button button__pagination button__pagination_prev"
                @click="prevTransactionsPage"
                :disabled="currentTransactionsPage === 1"
              >
                <span><ButtonSVG /></span>
                <span>{{$t('button.prev')}}</span>
              </button>
              
              <div class="pagination__buttons_info">
                {{ currentTransactionsPage }}/{{ totalTransactionsPages }}
              </div>
              
              <button 
                class="pagination__buttons_button button button__pagination button__pagination_next"
                @click="nextTransactionsPage"
                :disabled="currentTransactionsPage === totalTransactionsPages"
              >
              <span>{{$t('button.next')}}</span>
                <span><ButtonSVG /></span>
              </button>
            </div>
          </div>
        </div>
        <div class="personal__right">
          <div class="personal__partner">
            <div class="personal__partner_image">
              <img src="@/assets/img/personal/partner/partner.webp" alt="">
            </div>
            <div class="personal__partner_info">
              <h5 class="personal__articles_head">Станьте партнером</h5>
              <p class="personal__articles_desc">Take advantage of this incredible offer and maximize your profits.</p>
            </div>
            <button class="personal__partner_button button__primary"><span>стать партнером</span></button>
          </div>
          <div class="personal__articles">
            <div class="personal__articles_top">
              <h5 class="personal__articles_head">Cтатьи</h5>
              <RouterLink class="personal__articles_all button" :to="Tr.i18nRoute({ name: 'articles' })">
                Смотреть больше
              </RouterLink>
            </div>
            <ul class="personal__articles_list">
              <li class="personal__articles_item">
                <a href="" class="personal__articles_link">
                  <div class="personal__articles_image">
                    <img src="@/assets/img/personal/articles/articles_1.webp" alt="">
                  </div>
                  <div class="personal__articles_info">
                    <p class="personal__articles_head text_small">Продвижение артиста. Абсурдный прием, который работает.</p>
                    <p class="personal__articles_date text_very">8 дн назад</p>
                  </div>
                </a>
              </li>
              <li class="personal__articles_item">
                <a href="" class="personal__articles_link">
                  <div class="personal__articles_image">
                    <img src="@/assets/img/personal/articles/articles_2.webp" alt="">
                  </div>
                  <div class="personal__articles_info">
                    <p class="personal__articles_head text_small">Стоит ли выкладывать треки в пятницу.</p>
                    <p class="personal__articles_date text_very">8 дн назад</p>
                  </div>
                </a>
              </li>
              <li class="personal__articles_item">
                <a href="" class="personal__articles_link">
                  <div class="personal__articles_image">
                    <img src="@/assets/img/personal/articles/articles_3.webp" alt="">
                  </div>
                  <div class="personal__articles_info">
                    <p class="personal__articles_head text_small">Топ-чарты. Как туда попасть? Что получает артист?</p>
                    <p class="personal__articles_date text_very">8 дн назад</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div class="personal__partners">
            <div class="personal__partners_top">
              <h5 class="personal__partners_head">Партнеры</h5>
              <a href="" class="personal__partners_all button">Смотреть больше</a>
            </div>
            <ul class="personal__partners_list">
              <li class="personal__partners_item">
                <a href="" class="personal__partners_link">
                  <p class="personal__partners_heading button">Superkuper</p>
                  <p class="personal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
                </a>
              </li>
              <li class="personal__partners_item">
                <a href="" class="personal__partners_link">
                  <p class="personal__partners_heading button">leoneo</p>
                  <p class="personal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
                </a>
              </li>
              <li class="personal__partners_item">
                <a href="" class="personal__partners_link">
                  <p class="personal__partners_heading button">tat55</p>
                  <p class="personal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal__flex {
  display: flex;
  gap: 20px;
}
.personal__content {
  display: flex;
  width: calc(100% - 440px);
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}
.personal__balance {
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__balance_info {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 15px;
}
.personal__balance_desc {
  color: var(--text-gray);
}
.personal__divider {
  width: 100%;
  height: 1px;
  background-color: var(--border);
}
.personal__balance_list {
  display: flex;
  padding: 40px;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px 40px;
}
.personal__balance_item {
  display: flex;
  max-width: calc(33.333% - 27px);
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}
.personal__balance_top {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}
.personal__balance_top_info {
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  gap: 10px;
}
.personal__balance_heading {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  gap: 6px;
}
.personal__balance_button span {
  padding: 12px 20px;
}
.personal__balance_button svg {
  width: 20px;
  height: 20px;
  object-fit: contain;
  transform: translateY(-1px);
}
.personal__balance_svg {
  display: flex;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  background-color: var(--border);
  border-radius: 50%;
  overflow: hidden;
}
.personal__balance_svg svg {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.personal__right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.personal__release {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 30px;
  position: relative;
  background-color: var(--bg);
  border: 1px solid var(--border);
  overflow: hidden;
}
.personal__release_flex {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
}
.personal__release_button {
  position: relative;
  z-index: 2;
}
.personal__release_desc {
  max-width: 510px;
  color: var(--text-gray);
}
.personal__release_image {
  width: 315px;
  max-width: calc(100% - 510px - 20px);
  height: 100%;
  flex: 0 0 auto;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
.personal__release_image img {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: contain;
}
.personal__release_image img:nth-child(1) {
  z-index: 1;
}
.personal__release_image img:nth-child(2) {
  z-index: 2;
}

.personal__releases {
  display: flex;
  padding: 40px;
  align-items: flex-start;
  flex-direction: column;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__releases_block {
  width: 100%;
}
.personal__releases_title {
  padding: 0 0 30px;
}
.personal__releases_list {
  display: flex;
  flex-direction: column;
}
.personal__releases_item {
  display: flex;
  width: 100%;
  padding: 20px 0;
  flex-wrap: nowrap;
  gap: 40px;
  border-bottom: 1px solid var(--border);
}
.personal__releases_item:first-child {
  border-top: 1px solid var(--border);
}
.personal__releases_image {
  display: flex;
  width: 160px;
  height: 160px;
  margin: auto 0;
  flex: 0 0 auto;
}
.personal__releases_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.personal__releases_info {
  display: flex;
  width: 100%;
  flex-direction: column;
}
.personal__releases_information .personal__releases_flex {
  display: none;
}
.personal__releases_top {
  display: flex;
  padding: 0 0 16px;
  flex-direction: column;
  gap: 10px;
}
.personal__releases_head {
  text-transform: uppercase;
}
.personal__releases_head span {
  font-weight: 400;
}
.personal__releases_codes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.personal__releases_code {
  display: flex;
  padding: 10px 20px;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__releases_code:hover {
  color: var(--white);
  background-color: var(--color);
}
.personal__releases_code svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.personal__releases_date {
  color: var(--text-gray);
}
.personal__releases_agreements {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
}
.personal__releases_agreement {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  text-transform: uppercase;
}
.personal__releases_agreement svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.personal__releases_bottom {
  display: flex;
  width: 100%;
  margin: auto 0 0;
  justify-content: space-between;
  gap: 20px;
}
.personal__partner {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 63px;
  position: relative;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__partner_image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
.personal__partner_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.personal__partner_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 2;
}
.personal__partner_button {
  position: relative;
  z-index: 2;
}
.personal__articles_desc {
  max-width: 280px;
  color: var(--text-gray);
}
.personal__articles {
  display: flex;
  padding: 30px 40px;
  flex-direction: column;
  gap: 15px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__partners {
  display: flex;
  padding: 30px 40px;
  flex-direction: column;
  gap: 15px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__articles_link {
  display: flex;
  padding: 12px 0;
  gap: 15px;
}
.personal__articles_image {
  display: flex;
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
}
.personal__articles_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.personal__articles_info {
  display: flex;
  max-width: 250px;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}
.personal__articles_date {
  color: var(--text-gray);
}
.personal__partners_top,
.personal__articles_top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.personal__partners_all,
.personal__articles_all {
  text-transform: uppercase;
  color: var(--color);
}
.personal__partners_all:hover,
.personal__articles_all:hover {
  color: var(--text);
}
.personal__partners_link {
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  gap: 6px;
}
.personal__partners_desc {
  color: var(--text-gray);
}

.personal__reports {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__reports_top {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.personal__reports_head {
  text-transform: uppercase;
}
.personal__reports_desc {
  color: var(--text-gray);
}
.personal__reports_list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--border);
}
.personal__reports_item {
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: center;
  background-color: var(--bg);
  gap: 20px;
}
.personal__reports_header {
  text-transform: capitalize;
  color: var(--text-gray);
}
.personal__reports_cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.personal__reports_image {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: #FBF4E2;
  border-radius: 4px;
  overflow: hidden;
}
.personal__reports_image svg {
  display: flex;
  width: 20px;
  height: 20px;
  object-fit: contain;
  color: #E2B63F;
}
.personal__reports_info {
  flex: 3;
  min-width: 300px;
}
.personal__reports_date {
  flex: 1;
  min-width: 120px;
}
.personal__reports_actions {
  flex: 2;
  min-width: 200px;
  justify-content: flex-end;
}
.personal__reports_file {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.personal__reports_filename {
  font-weight: 500;
}
.personal__reports_filesize {
  font-size: 14px;
  color: var(--text-gray);
}
.personal__reports_datevalue {
  color: var(--text-gray);
}
.personal__reports_buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.personal__reports_button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  text-transform: uppercase;
}
.personal__reports_button:hover {
  color: var(--color);
}
.personal__reports_button svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.personal__transactions {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__transactions_head {
  text-transform: uppercase;
}
.personal__transactions_list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--border);
}
.personal__transactions_item {
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: center;
  background-color: var(--bg);
  gap: 20px;
}
.personal__transactions_header {
  text-transform: capitalize;
  color: var(--text-gray);
}
.personal__transactions_cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.personal__transactions_type {
  flex: 2;
  min-width: 180px;
}
.personal__transactions_date {
  flex: 1;
  min-width: 120px;
}
.personal__transactions_period {
  flex: 1;
  min-width: 120px;
}
.personal__transactions_status {
  flex: 1;
  min-width: 140px;
}
.personal__transactions_amount {
  flex: 1;
  min-width: 120px;
  justify-content: flex-end;
  font-weight: 500;
}
.personal__transactions_image {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: #F2F1EF;
  border-radius: 4px;
  overflow: hidden;
}
.personal__transactions_image svg {
  width: 20px;
  height: 20px;
  object-fit: contain;
  color: var(--text);
}
.personal__transactions_typevalue {
  color: var(--text);
}
.personal__transactions_datevalue,
.personal__transactions_periodvalue {
  color: var(--text-gray);
}
.personal__transactions_statusvalue {
  display: flex;
  padding: 7px 15px;
  border-radius: 4px;
  overflow: hidden;
}
.status_completed {
  color: #51AA23;
  background-color: #EDFBE2;
}
.status_processing {
  color: #85858E;
  background-color: #F2F1EF;
}
.status_cancelled {
  color: #AB1115;
  background-color: #FBEBE2;
}
.personal__transactions_amountvalue {
  color: var(--text);
}

@media (max-width: 1919px) {
  .personal__flex {
    gap: 20px;
  }
  .personal__content {
    width: calc(100% - 340px);
  }
  .personal__balance_list {
    gap: 20px 40px;
  }
  .personal__balance_item {
    max-width: calc(33.333% - 27px);
  }
  .personal__partner {
    gap: 86px;
  }
  .personal__release_desc {
    max-width: 410px;
  }
  .personal__release_image {
    width: 270px;
    max-width: calc(100% - 410px - 20px);
  }
  .personal__releases_image {
    width: 140px;
    height: 140px;
  }
}
@media (max-width: 1439px) {
  .personal__right {
    display: none;
  }
  .personal__content {
    width: 100%;
  }
  .personal__balance_info {
    padding: 30px 30px 20px;
  }
  .personal__balance_list {
    padding: 30px;
    gap: 30px 40px;
    justify-content: flex-start;
  }
  .personal__balance_item:first-child {
    width: 100%;
    max-width: 100%;
  }
  .personal__balance_item {
    max-width: 100%;
  }
  .personal__release_desc {
    max-width: 480px;
  }
  .personal__release_image {
    width: 230px;
    max-width: calc(100% - 480px - 20px);
  }
  .personal__releases {
    padding: 30px;
  }
  .personal__releases_title {
    padding: 0 0 20px;
  }
}
@media (max-width: 1023px) {
  .personal__reports_header,
  .personal__transactions_header {
    display: none;
  }
  .personal__reports_item,
  .personal__transactions_item {
    flex-wrap: wrap;
    gap: 10px;
  }
  .personal__transactions_type {
    width: calc(100% - 115px - 10px);
    min-width: auto;
    flex: 0 0 auto;
    order: 1;
  }
  .personal__transactions_status {
    width: 115px;
    min-width: auto;
    flex: 0 0 auto;
    justify-content: flex-end;
    order: 2;
  }
  .personal__transactions_date {
    min-width: auto;
    order: 3;
  }
  .personal__transactions_period {
    min-width: auto;
    order: 4;
  }
  .personal__transactions_amount {
    min-width: auto;
    order: 5;
  }
  .personal__reports_info {
    width: 100%;
    flex: 0 0 auto;
  }
}
@media (max-width: 767px) {
  .personal__container {
    padding: 0;
  }
  .personal__reports,
  .personal__transactions,
  .personal__releases {
    padding: 30px 15px;
  }
  .personal__balance_info {
    padding: 30px 15px 20px;
  }
  .personal__balance_list {
    padding: 30px 15px;
    flex-direction: column;
  }
  .personal__release {
    padding: 30px 15px;
  }
  .personal__release_desc {
    max-width: 100%;
  }
  .personal__release_image {
    width: 194px;
    max-width: 100%;
    top: auto;
    bottom: -70px;
  }
  .personal__releases_item,
  .personal__releases_info {
    flex-direction: column;
    gap: 20px;
  }
  .personal__releases_info .personal__releases_top,
  .personal__releases_info .personal__releases_date {
    display: none;
  }
  .personal__releases_information {
    display: flex;
    width: 100%;
    gap: 15px;
  }
  .personal__releases_information .personal__releases_flex {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
  }
  .personal__releases_image {
    width: 100px;
    height: 100px;
  }
}
</style>