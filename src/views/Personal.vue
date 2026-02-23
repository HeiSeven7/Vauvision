<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { sendRequest } from '@/utils/api';
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
import Signature from "@/components/layout/Signature.vue";

// Получаем базовый URL из текущего окна
const API_BASE_URL = window.location.origin;

// Интерфейсы для объектов списков
interface Release {
  id: string | number;
  name: string;
  date: string;
  image?: string;
  upcCode?: string;
  link?: string;
  contractFile?: string | null;
  hasPng?: boolean;
  previewText?: string | null;
  propertyDateRelizValue?: string;
  propertyDopValue?: string | null;
  propertyNewDocxValue?: string;
  propertyDogovorUserValue?: string | null;
  propertyDogovorPdfValue?: string | null;
  propertyLinkValue?: string | null;
  propertyDogovorStatusValue?: string | null;
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
  period: string | null;
  status: 'completed' | 'processing' | 'cancelled';
  amount: string;
  currency?: string;
}

interface Quarter {
  id: string;
  name: string;
  months: string;
}

interface ActResponse {
  actImages: string[];
  paymentId: string;
}

// Данные из API
const profileData = ref({
  balance: 0,
  bonus: 0,
  region: 'Russia'
});

const showReportButton = ref(false);
const reportYears = ref<string[]>([]);
const selectedYear = ref<string>('');
const selectedQuarter = ref<string>('');
const showReportPopup = ref(false);
const showQuarterPopup = ref(false);
const showSignaturePopup = ref(false);
const actData = ref<ActResponse | null>(null);
const userLabel = ref(0);

// Список кварталов из API
const availableQuarters = ref<Quarter[]>([]);

// Данные для списков
const releasesData = ref<Release[]>([]);
const reportsData = ref<Report[]>([]);
const transactionsData = ref<Transaction[]>([]);

// Состояние загрузки
const isLoadingReleases = ref(false);
const isLoadingReports = ref(false);
const isLoadingTransactions = ref(false);
const isLoadingQuarters = ref(false);
const isDownloading = ref(false);

// Общая информация о пагинации из API
const releasesPagination = ref({
  currentPage: 1,
  perPage: 6,
  total: "0"
});

const reportsPagination = ref({
  currentPage: 1,
  perPage: 3,
  total: "0"
});

const transactionsPagination = ref({
  currentPage: 1,
  perPage: 6,
  total: "0"
});

// Пагинация для релизов
const releasesPerPage = ref<number>(6);
const currentReleasesPage = ref<number>(1);
const totalReleasesItems = computed(() => parseInt(releasesPagination.value.total) || 0);

// Пагинация для отчетов
const reportsPerPage = ref<number>(3);
const currentReportsPage = ref<number>(1);
const totalReportsItems = computed(() => parseInt(reportsPagination.value.total) || 0);

// Пагинация для транзакций
const transactionsPerPage = ref<number>(6);
const currentTransactionsPage = ref<number>(1);
const totalTransactionsItems = computed(() => parseInt(transactionsPagination.value.total) || 0);

// Вычисляемые свойства для релизов
const totalReleasesPages = computed(() => {
  return Math.ceil(totalReleasesItems.value / releasesPerPage.value);
});

const paginatedReleases = computed(() => {
  return releasesData.value;
});

const showReleasesPagination = computed(() => {
  return totalReleasesItems.value > releasesPerPage.value;
});

// Вычисляемые свойства для отчетов
const totalReportsPages = computed(() => {
  return Math.ceil(totalReportsItems.value / reportsPerPage.value);
});

const paginatedReports = computed(() => {
  return reportsData.value;
});

const showReportsPagination = computed(() => {
  return totalReportsItems.value > reportsPerPage.value;
});

// Вычисляемые свойства для транзакций
const totalTransactionsPages = computed(() => {
  return Math.ceil(totalTransactionsItems.value / transactionsPerPage.value);
});

const paginatedTransactions = computed(() => {
  return transactionsData.value;
});

const showTransactionsPagination = computed(() => {
  return totalTransactionsItems.value > transactionsPerPage.value;
});

// Методы для пагинации релизов
const nextReleasesPage = async () => {
  if (currentReleasesPage.value < totalReleasesPages.value) {
    currentReleasesPage.value++;
    await fetchReleasesPage(currentReleasesPage.value);
  }
};

const prevReleasesPage = async () => {
  if (currentReleasesPage.value > 1) {
    currentReleasesPage.value--;
    await fetchReleasesPage(currentReleasesPage.value);
  }
};

// Методы для пагинации отчетов
const nextReportsPage = async () => {
  if (currentReportsPage.value < totalReportsPages.value) {
    currentReportsPage.value++;
    await fetchReportsPage(currentReportsPage.value);
  }
};

const prevReportsPage = async () => {
  if (currentReportsPage.value > 1) {
    currentReportsPage.value--;
    await fetchReportsPage(currentReportsPage.value);
  }
};

// Методы для пагинации транзакций
const nextTransactionsPage = async () => {
  if (currentTransactionsPage.value < totalTransactionsPages.value) {
    currentTransactionsPage.value++;
    await fetchTransactionsPage(currentTransactionsPage.value);
  }
};

const prevTransactionsPage = async () => {
  if (currentTransactionsPage.value > 1) {
    currentTransactionsPage.value--;
    await fetchTransactionsPage(currentTransactionsPage.value);
  }
};

// Функция для формирования полного URL
const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Функция для загрузки страницы релизов
const fetchReleasesPage = async (page: number) => {
  isLoadingReleases.value = true;
  try {
    const response = await sendRequest('get', `/ajax/getData.php?PAGEN_1=${page}`, {});
    
    if (response.data && response.data.releases) {
      releasesData.value = response.data.releases.items.map((item: any) => ({
        id: item.ID || item.id,
        name: item.NAME || item.name,
        date: item.DATE_CREATE || item.date,
        upcCode: item.PROPERTY_ZVONKO_UPC_VALUE,
        link: item.PROPERTY_ZVONKO_SMART_LINK_URL_VALUE,
        contractFile: item.CONTRACT_FILE ? getFullUrl(item.CONTRACT_FILE) : null,
        hasPng: item.HAS_PNG,
        previewText: item.PREVIEW_TEXT,
        propertyDateRelizValue: item.PROPERTY_DATE_RELIZ_VALUE,
        propertyDopValue: item.PROPERTY_DOP_VALUE,
        propertyNewDocxValue: item.PROPERTY_NEW_DOCX_VALUE,
        propertyDogovorUserValue: item.PROPERTY_DOGOVOR_USER_VALUE,
        propertyDogovorPdfValue: item.PROPERTY_DOGOVOR_PDF_VALUE ? getFullUrl(item.PROPERTY_DOGOVOR_PDF_VALUE) : null,
        propertyLinkValue: item.PROPERTY_LINK_VALUE,
        propertyDogovorStatusValue: item.PROPERTY_DOGOVOR_STATUS_VALUE
      }));
      
      releasesPagination.value = {
        currentPage: response.data.releases.currentPage || page,
        perPage: response.data.releases.perPage || releasesPerPage.value,
        total: response.data.releases.total || "0"
      };
      
      currentReleasesPage.value = releasesPagination.value.currentPage;
    }
  } catch (error) {
    console.error('Ошибка при загрузке релизов:', error);
  } finally {
    isLoadingReleases.value = false;
  }
};

// Функция для загрузки страницы отчетов
const fetchReportsPage = async (page: number) => {
  isLoadingReports.value = true;
  try {
    const response = await sendRequest('get', `/ajax/getData.php?PAGEN_3=${page}`, {});
    
    if (response.data && response.data.reports) {
      reportsData.value = response.data.reports.items.map((item: any) => ({
        id: item.ID || item.id,
        filename: item.FILENAME || item.filename || 'Отчет',
        filesize: item.FILESIZE || item.filesize || '0 KB',
        date: item.DATE || item.date || '',
        hasAct: item.HAS_ACT || item.hasAct || false
      }));
      
      reportsPagination.value = {
        currentPage: response.data.reports.currentPage || page,
        perPage: response.data.reports.perPage || reportsPerPage.value,
        total: response.data.reports.total || "0"
      };
      
      currentReportsPage.value = reportsPagination.value.currentPage;
    }
  } catch (error) {
    console.error('Ошибка при загрузке отчетов:', error);
  } finally {
    isLoadingReports.value = false;
  }
};

// Функция для загрузки страницы транзакций
const fetchTransactionsPage = async (page: number) => {
  isLoadingTransactions.value = true;
  try {
    const response = await sendRequest('get', `/ajax/getData.php?PAGEN_2=${page}`, {});
    
    if (response.data && response.data.finances) {
      transactionsData.value = response.data.finances.items.map((item: any, index: number) => ({
        id: item.ID || index + 1,
        type: item.TYPE || 'Транзакция',
        date: item.DATE || '',
        period: item.PERIOD || '-',
        status: item.STATUS === 'В обработке' ? 'processing' : 
                item.STATUS === 'Завершено' ? 'completed' : 
                item.STATUS === 'Отменено' ? 'cancelled' : 'processing',
        amount: item.SUM ? `${Number(item.SUM).toLocaleString()} ${item.CURRENCY || '₽'}` : '0 ₽',
        currency: item.CURRENCY
      }));
      
      transactionsPagination.value = {
        currentPage: response.data.finances.currentPage || page,
        perPage: response.data.finances.perPage || transactionsPerPage.value,
        total: response.data.finances.total || "0"
      };
      
      currentTransactionsPage.value = transactionsPagination.value.currentPage;
    }
  } catch (error) {
    console.error('Ошибка при загрузке транзакций:', error);
  } finally {
    isLoadingTransactions.value = false;
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

// Функция для перевода статуса
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'processing':
      return 'В обработке';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

// Функция для выбора года - теперь выводит список кварталов
const selectYear = async (year: string) => {
  selectedYear.value = year;
  
  isLoadingQuarters.value = true;
  try {
    // Отправляем POST запрос с ID = выбранный год
    const response = await sendRequest('post', '/ajax/profile/kvartal.php', {
      ID: year
    });
    
    console.log('Ответ с кварталами (HTML):', response.data);
    
    // Получаем HTML с сервера
    const quartersHtml = response.data;
    
    // Создаем временный DOM элемент для парсинга HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(quartersHtml, 'text/html');
    
    // Находим все radio input'ы с кварталами
    const radioInputs = doc.querySelectorAll('input[name="QUARTER_ID"]');
    
    console.log('Найдено radio inputs:', radioInputs.length);
    
    // Очищаем предыдущие кварталы
    availableQuarters.value = [];
    
    // Проходим по всем найденным input'ам
    radioInputs.forEach((input: Element) => {
      const value = input.getAttribute('value');
      // Ищем соответствующий label
      const label = doc.querySelector(`label[for="${input.id}"]`);
      let text = '';
      
      if (label) {
        const span = label.querySelector('span');
        text = span ? span.textContent || '' : label.textContent || '';
      }
      
      console.log('Найден квартал:', { value, text });
      
      if (value) {
        // Пробуем извлечь название и месяцы из текста
        // Текст обычно в формате "Q3 (июнь, июль, август)"
        const match = text.match(/(Q[1-4])\s*\((.+)\)/);
        if (match) {
          availableQuarters.value.push({
            id: value,
            name: match[1],
            months: match[2]
          });
        } else {
          // Если не удалось распарсить, просто сохраняем как есть
          availableQuarters.value.push({
            id: value,
            name: text || value,
            months: ''
          });
        }
      }
    });
    
    // Если не нашли через input'ы, пробуем найти option (на случай если это select)
    if (availableQuarters.value.length === 0) {
      const select = doc.querySelector('select[name="QUARTER_ID"]');
      if (select) {
        const options = select.querySelectorAll('option');
        options.forEach((option: Element) => {
          const value = option.getAttribute('value');
          const text = option.textContent || '';
          
          if (value) {
            const match = text.match(/(Q[1-4])\s*\((.+)\)/);
            if (match) {
              availableQuarters.value.push({
                id: value,
                name: match[1],
                months: match[2]
              });
            } else {
              availableQuarters.value.push({
                id: value,
                name: text,
                months: ''
              });
            }
          }
        });
      }
    }
    
    console.log('Обработанные кварталы:', availableQuarters.value);
    
    showReportPopup.value = false;
    showQuarterPopup.value = true;
    
  } catch (error) {
    console.error('Ошибка при загрузке кварталов:', error);
    alert('Не удалось загрузить список кварталов');
  } finally {
    isLoadingQuarters.value = false;
  }
};

// Функция для скачивания отчета по кварталу
const downloadReport = async () => {
  if (!selectedQuarter.value) {
    alert('Пожалуйста, выберите квартал');
    return;
  }

  isDownloading.value = true;
  try {
    const requestData = {
      LABLE_1: userLabel.value,
      QUARTER_ID: selectedQuarter.value,
      YEAR_ID: selectedYear.value
    };
    
    // Используем fetch вместо sendRequest
    const response = await fetch('/ajax/profile/report.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    console.log('Ответ от сервера:', data);
    
    if (data.message) {
      // Если есть ссылка для скачивания
      if (data.error === 0 && data.message.startsWith('http')) {
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.href = data.message;
        link.download = ''; // Пустое значение - использовать имя из URL
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        closeAllPopups();
      } else {
        // Просто показываем сообщение
        alert(data.message);
      }
    }
    
  } catch (error) {
    console.error('Ошибка при запросе:', error);
    alert('Произошла ошибка при запросе');
  } finally {
    isDownloading.value = false;
  }
};

const showReportPopupFunc = () => {
  // Проверяем что profile.showReportButton = true
  if (!showReportButton.value) {
    alert('Кнопка скачивания отчета недоступна');
    return;
  }
  
  // Проверяем reportYears - если массив пустой, то нет отчетов
  if (reportYears.value.length === 0) {
    alert('Нет доступных отчетов');
    return;
  }
  
  showReportPopup.value = true;
  document.documentElement.classList.add('noscroll');
};

// Закрыть все попапы
const closeAllPopups = () => {
  showReportPopup.value = false;
  showQuarterPopup.value = false;
  showSignaturePopup.value = false;
  selectedYear.value = '';
  selectedQuarter.value = '';
  availableQuarters.value = [];
  actData.value = null;
  document.documentElement.classList.remove('noscroll');
};

// Вернуться к выбору года
const backToYearSelection = () => {
  showQuarterPopup.value = false;
  showReportPopup.value = true;
  selectedQuarter.value = '';
  availableQuarters.value = [];
};

const fetchData = async () => {
  try {
    const response = await sendRequest('get', '/ajax/getData.php', {});
    
    // Обновляем данные профиля из ответа API
    if (response.data && response.data.profile) {
      profileData.value.balance = response.data.profile.balance || 0;
      profileData.value.bonus = response.data.profile.bonus || 0;
      profileData.value.region = response.data.profile.region || 'Russia';
      showReportButton.value = response.data.profile.showReportButton || false;
      userLabel.value = response.data.profile.ufLable || 0;
    }
    
    // Сохраняем reportYears из ответа API
    if (response.data && response.data.reportYears) {
      reportYears.value = response.data.reportYears;
    }
    
    // Загружаем релизы
    if (response.data && response.data.releases) {
      releasesData.value = response.data.releases.items.map((item: any) => ({
        id: item.ID || item.id,
        name: item.NAME || item.name,
        date: item.DATE_CREATE || item.date,
        upcCode: item.PROPERTY_ZVONKO_UPC_VALUE,
        link: item.PROPERTY_ZVONKO_SMART_LINK_URL_VALUE,
        contractFile: item.CONTRACT_FILE ? getFullUrl(item.CONTRACT_FILE) : null,
        hasPng: item.HAS_PNG,
        previewText: item.PREVIEW_TEXT,
        propertyDateRelizValue: item.PROPERTY_DATE_RELIZ_VALUE,
        propertyDopValue: item.PROPERTY_DOP_VALUE,
        propertyNewDocxValue: item.PROPERTY_NEW_DOCX_VALUE,
        propertyDogovorUserValue: item.PROPERTY_DOGOVOR_USER_VALUE,
        propertyDogovorPdfValue: item.PROPERTY_DOGOVOR_PDF_VALUE ? getFullUrl(item.PROPERTY_DOGOVOR_PDF_VALUE) : null,
        propertyLinkValue: item.PROPERTY_LINK_VALUE,
        propertyDogovorStatusValue: item.PROPERTY_DOGOVOR_STATUS_VALUE
      }));
      
      releasesPagination.value = {
        currentPage: response.data.releases.currentPage || 1,
        perPage: response.data.releases.perPage || releasesPerPage.value,
        total: response.data.releases.total || "0"
      };
      currentReleasesPage.value = releasesPagination.value.currentPage;
    }
    
    // Загружаем отчеты (первая страница)
    if (response.data && response.data.reports) {
      reportsData.value = response.data.reports.items.map((item: any) => ({
        id: item.ID || item.id,
        filename: item.FILENAME || item.filename || 'Отчет',
        filesize: item.FILESIZE || item.filesize || '0 KB',
        date: item.DATE || item.date || '',
        hasAct: item.HAS_ACT || item.hasAct || false
      }));
      
      reportsPagination.value = {
        currentPage: response.data.reports.currentPage || 1,
        perPage: response.data.reports.perPage || reportsPerPage.value,
        total: response.data.reports.total || "0"
      };
      currentReportsPage.value = reportsPagination.value.currentPage;
    }
    
    // Загружаем транзакции
    if (response.data && response.data.finances) {
      transactionsData.value = response.data.finances.items.map((item: any, index: number) => ({
        id: item.ID || index + 1,
        type: item.TYPE || 'Транзакция',
        date: item.DATE || '',
        period: item.PERIOD || '-',
        status: item.STATUS === 'В обработке' ? 'processing' : 
                item.STATUS === 'Завершено' ? 'completed' : 
                item.STATUS === 'Отменено' ? 'cancelled' : 'processing',
        amount: item.SUM ? `${Number(item.SUM).toLocaleString()} ${item.CURRENCY || '₽'}` : '0 ₽',
        currency: item.CURRENCY
      }));
      
      transactionsPagination.value = {
        currentPage: response.data.finances.currentPage || 1,
        perPage: response.data.finances.perPage || transactionsPerPage.value,
        total: response.data.finances.total || "0"
      };
      currentTransactionsPage.value = transactionsPagination.value.currentPage;
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
};

// Функция для запроса выплаты
const requestPayout = async () => {
  try {
    const valuta = profileData.value.region === 'Russia' ? 'RUB' : 'USD';
    const summ = profileData.value.balance;
    const summLabels = profileData.value.balance;

    const response = await sendRequest('post', '/ajax/profile/aktVyplata.php', {
      summ,
      valuta,
      summLabels
    });

    if (response.data && response.data.actImages && response.data.paymentId) {
      const fullActImages = response.data.actImages.map((img: string) => 
        img.startsWith('http') ? img : getFullUrl(img)
      );
      
      actData.value = {
        actImages: fullActImages,
        paymentId: response.data.paymentId
      };
      showSignaturePopup.value = true;
      document.documentElement.classList.add('noscroll');
    } else {
      alert('Ошибка при получении акта');
    }
  } catch (error) {
    console.error('Ошибка при запросе выплаты:', error);
    alert('Не удалось получить акт для подписи');
  }
};

// Функция для отправки подписи
const submitSignature = async (signatureDataUrl: string) => {
  if (!actData.value) return;

  try {
    const response = await fetch(signatureDataUrl);
    const blob = await response.blob();
    const signatureFile = new File([blob], 'signature.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('paymentId', actData.value.paymentId);
    formData.append('signature', signatureFile);

    const submitResponse = await sendRequest('post', '/ajax/newAkt_vyp.php', formData);

    if (submitResponse.data && submitResponse.data.success) {
      alert('Выплата успешно запрошена');
      closeAllPopups();
      await fetchData();
    } else {
      alert('Ошибка при отправке подписи');
    }
  } catch (error) {
    console.error('Ошибка при отправке подписи:', error);
    alert('Не удалось отправить подпись');
  }
};

// Следим за изменением страницы отчетов
watch(currentReportsPage, async (newPage) => {
  if (newPage > 0) {
    await fetchReportsPage(newPage);
  }
});

// Инициализация при монтировании
onMounted(() => {
  fetchData();
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
            <button 
              class="personal__balance_button button__red" 
              :class="{ 'button__disabled': !showReportButton }"
              :disabled="!showReportButton"
              @click="showReportPopupFunc"
            >
              <span><DownloadSVG/>Скачать отчет</span>
            </button>
          </li>
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><WalletSVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading">
                  <span class="personal__balance_description text_one">Счет</span>
                  {{ profileData.balance.toLocaleString() }} ₽
                </h4>
              </div>
            </div>
            <button 
              class="personal__balance_button button__primary"
              @click="requestPayout"
              :disabled="profileData.balance <= 0"
              :class="{ 'button__disabled': profileData.balance <= 0 }"
            >
              <span>Запросить выплаты</span>
            </button>
          </li>
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><PaySVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading">
                  <span class="personal__balance_description text_one">Бонусы партнера</span>
                  {{ profileData.bonus.toLocaleString() }}
                </h4>
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
            <RouterLink class="personal__release_button button__black button" :to="Tr.i18nRoute({ name: 'quiz' })">
              <span>Выложить релиз</span>
            </RouterLink>
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
                      <img 
                        :src="release.hasPng 
                          ? getFullUrl(`/upload/releases/${release.id}/cover.png`) 
                          : '/src/assets/img/personal/releases/releases_1.webp'" 
                        alt=""
                      >
                    </div>
                    <div class="personal__releases_flex">
                      <div class="personal__releases_top">
                        <h5 class="personal__releases_head"><span>{{ release.propertyNewDocxValue === '1' ? 'Сингл' : 'Релиз' }}</span> {{ release.name }}</h5>
                        <p class="personal__releases_album text_very">{{ release.propertyDateRelizValue || 'Альбом' }}</p>
                      </div>
                      <p class="personal__releases_date text_very">{{ release.date }}</p>
                    </div>
                  </div>
                  <div class="personal__releases_info">
                    <div class="personal__releases_top">
                      <h5 class="personal__releases_head"><span>{{ release.propertyNewDocxValue === '1' ? 'Сингл' : 'Релиз' }}</span> {{ release.name }}</h5>
                      <p class="personal__releases_album text_very">{{ release.propertyDateRelizValue || 'Альбом' }}</p>
                    </div>
                    <div class="personal__releases_codes">
                      <button v-if="release.upcCode" class="personal__releases_code"><span>UPC код: {{ release.upcCode }}</span></button>
                      <button v-if="release.link" class="personal__releases_code"><LinkSVG/><span>{{ release.link }}</span></button>
                    </div>
                    <div class="personal__releases_bottom">
                      <p class="personal__releases_date text_very">{{ release.date }}</p>
                      <div class="personal__releases_agreements">
                        <a 
                          v-if="release.contractFile" 
                          :href="release.contractFile" 
                          class="personal__releases_agreement button" 
                          download=""
                        >
                          <DownloadSVG/><span>Скачать договор</span>
                        </a>
                        <a 
                          v-if="release.contractFile" 
                          :href="release.contractFile" 
                          class="personal__releases_agreement button" 
                          target="_blank"
                        >
                          <EyeSVG/><span>Открыть договор</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="pagination__buttons" v-if="showReleasesPagination">
                <button 
                  class="pagination__buttons_button button button__pagination button__pagination_prev"
                  @click="prevReleasesPage"
                  :disabled="currentReleasesPage === 1 || isLoadingReleases"
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
                  :disabled="currentReleasesPage === totalReleasesPages || isLoadingReleases"
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
                    <a 
                      :href="getFullUrl(`/reports/${report.id}`)" 
                      class="personal__reports_button button__text" 
                      download=""
                    >
                      <DownloadSVG/>
                      <span>Скачать</span>
                    </a>
                    <a 
                      :href="getFullUrl(`/acts/${report.id}`)" 
                      class="personal__reports_button button__text"
                      v-if="report.hasAct"
                      download=""
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
                :disabled="currentReportsPage === 1 || isLoadingReports"
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
                :disabled="currentReportsPage === totalReportsPages || isLoadingReports"
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
                    {{ getStatusText(transaction.status) }}
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
                :disabled="currentTransactionsPage === 1 || isLoadingTransactions"
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
                :disabled="currentTransactionsPage === totalTransactionsPages || isLoadingTransactions"
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

<!-- Попап для выбора года -->
<Teleport to="body">
  <div class="popup" v-if="showReportPopup" @click.self="closeAllPopups">
    <div class="popup__content">
      <div class="popup__header">
        <h3 class="popup__title">Выберите год отчета</h3>
        <button class="popup__close" @click="closeAllPopups">×</button>
      </div>
      <div class="popup__body">
        <div class="popup__years" v-if="reportYears.length > 0">
          <button 
            v-for="year in reportYears" 
            :key="year"
            class="popup__year-button button button__primary"
            @click="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
        <div v-else class="popup__empty">
          Нет доступных годов
        </div>
      </div>
    </div>
  </div>
</Teleport>

<!-- Попап для выбора квартала -->
<Teleport to="body">
  <div class="popup" v-if="showQuarterPopup" @click.self="closeAllPopups">
    <div class="popup__content">
      <div class="popup__header">
        <button class="popup__back" @click="backToYearSelection">← Назад</button>
        <h3 class="popup__title">Выберите квартал</h3>
        <button class="popup__close" @click="closeAllPopups">×</button>
      </div>
      <div class="popup__body">
        <p class="popup__year-selected">Год: {{ selectedYear }}</p>
        
        <div v-if="isLoadingQuarters" class="popup__loading">
          Загрузка кварталов...
        </div>
        
        <div v-else-if="availableQuarters.length > 0" class="popup__quarters">
          <button 
            v-for="quarter in availableQuarters" 
            :key="quarter.id"
            class="popup__quarter-button"
            :class="{ 'selected': selectedQuarter === quarter.id }"
            @click="selectedQuarter = quarter.id"
          >
            <span class="quarter__name">{{ quarter.name }}</span>
            <span class="quarter__months">{{ quarter.months }}</span>
          </button>
        </div>
        
        <div v-else class="popup__empty">
          Нет доступных кварталов
        </div>
        
        <button 
          class="popup__download-button button button__primary"
          :disabled="!selectedQuarter || isLoadingQuarters || isDownloading"
          @click="downloadReport"
        >
          <DownloadSVG/>
          <span>{{ isDownloading ? 'Загрузка...' : 'Скачать отчет' }}</span>
        </button>
      </div>
    </div>
  </div>
</Teleport>

<!-- Попап для подписи акта -->
<Signature
  v-if="showSignaturePopup"
  @close="closeAllPopups"
  @submit="submitSignature"
/>

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
.personal__balance_button {
  width: 100%;
}
.personal__balance_button span {
  width: 100%;
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
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

/* Стили для disabled кнопки */
.button__disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup__content {
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.popup__header {
  display: flex;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.popup__back {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--color);
  padding: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.popup__back:hover {
  color: var(--text);
}

.popup__title {
  margin: 0;
  font-size: 18px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.popup__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-gray);
}

.popup__body {
  padding: 20px;
}

.popup__loading {
  text-align: center;
  padding: 30px;
  color: var(--text-gray);
}

.popup__empty {
  text-align: center;
  padding: 30px;
  color: var(--text-gray);
}

.popup__years,
.popup__quarters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.popup__year-button,
.popup__quarter-button {
  width: 100%;
  padding: 15px;
  text-align: left;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.popup__year-button:hover,
.popup__quarter-button:hover {
  background-color: var(--color);
  color: var(--white);
  border-color: var(--color);
}

.popup__quarter-button.selected {
  background-color: var(--color);
  color: var(--white);
  border-color: var(--color);
}

.quarter__name {
  font-weight: 500;
  font-size: 16px;
}

.quarter__months {
  font-size: 14px;
  opacity: 0.8;
}

.popup__year-selected {
  margin-bottom: 15px;
  font-weight: 500;
  color: var(--text-gray);
}

.popup__download-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.popup__download-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.popup__download-button svg {
  width: 20px;
  height: 20px;
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

  .popup__header {
    flex-direction: column;
    gap: 10px;
  }
  
  .popup__title {
    position: static;
    transform: none;
  }
}
@media (max-width: 580px) {
  .personal__release_image {
    width: 150px;
    bottom: -100px;
  }
  .personal__reports_date {
    width: 80px;
    min-width: 80px;
    flex: none;
  }
}
</style>