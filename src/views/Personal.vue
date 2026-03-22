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
import SignaturePopup from "@/components/layout/Signature.vue";

const loading = ref<boolean>(true);
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

const loadedCount = ref(0);
const API_BASE_URL = window.location.origin;

// Интерфейсы для объектов списков
interface Track {
  id: number;
  title: string;
  track_number: number;
  duration: number;
  isrc: string;
  upc?: string;
  artist?: string[];
  artist_name?: string;
  composer?: string;
  lyricist?: string;
  is_explicit?: boolean;
  has_file?: boolean;
  has_lyrics?: boolean;
  [key: string]: any;
}

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
  tracks?: Track[]; // Добавляем массив треков
}

interface Report {
  id: string | number;
  filename: string;
  filesize: string;
  date: string;
  hasAct: boolean;
  xlsxUrl?: string;
  pdfUrl?: string | null;
  images?: string[];
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

interface Article {
  img: string;
  name: string;
  url: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  date: string;
  earnings: string;
  releases: string;
}

interface Quarter {
  id: string;
  name: string;
  months: string;
}

interface ActResponse {
  docx_url: string;
  pdf_url: string;
  images: string[];
  element_id: string;
  message: string;
}

// Данные из API
const profileData = ref({
  balance: 0,
  bonus: 0,
  region: 'Russia'
});
const userName = ref<string>('');
const showReportButton = ref(false);
const reportYears = ref<string[]>([]);
const selectedYear = ref<string>('');
const selectedQuarter = ref<string>('');
const showReportPopup = ref(false);
const showQuarterPopup = ref(false);
const showSignaturePopup = ref(false);
const showPayoutAmountPopup = ref(false);
const showImagesPopup = ref(false);
const actData = ref<ActResponse | null>(null);
const userLabel = ref(0);
const isoldsumm = ref("0");

const payoutAmount = ref<number | null>(null);
const isRequestingAct = ref(false);
const actError = ref('');
const isSubmittingVyplata = ref(false);
const vyplataError = ref('');

const availableQuarters = ref<Quarter[]>([]);

const releasesData = ref<Release[]>([]);
const reportsData = ref<Report[]>([]);
const transactionsData = ref<Transaction[]>([]);
const articlesData = ref<Article[]>([]);
const partnersData = ref<Partner[]>([]);

const isLoadingReleases = ref(false);
const isLoadingReports = ref(false);
const isLoadingTransactions = ref(false);
const isLoadingQuarters = ref(false);
const isDownloading = ref(false);

const releasesPagination = ref({
  currentPage: 1,
  perPage: 4,
  total: "0"
});

const reportsPagination = ref({
  currentPage: 1,
  perPage: 4,
  total: "0"
});

const transactionsPagination = ref({
  currentPage: 1,
  perPage: 4,
  total: "0"
});

const releasesPerPage = ref<number>(4);
const currentReleasesPage = ref<number>(1);
const totalReleasesItems = computed(() => parseInt(releasesPagination.value.total) || 0);

const reportsPerPage = ref<number>(4);
const currentReportsPage = ref<number>(1);
const totalReportsItems = computed(() => parseInt(reportsPagination.value.total) || 0);

const transactionsPerPage = ref<number>(4);
const currentTransactionsPage = ref<number>(1);
const totalTransactionsItems = computed(() => parseInt(transactionsPagination.value.total) || 0);

const totalReleasesPages = computed(() => {
  return Math.ceil(totalReleasesItems.value / releasesPerPage.value);
});

const paginatedReleases = computed(() => {
  return releasesData.value;
});

const showReleasesPagination = computed(() => {
  return totalReleasesItems.value > releasesPerPage.value;
});

const totalReportsPages = computed(() => {
  return Math.ceil(totalReportsItems.value / reportsPerPage.value);
});

const paginatedReports = computed(() => {
  return reportsData.value;
});

const showReportsPagination = computed(() => {
  return totalReportsItems.value > reportsPerPage.value;
});

const totalTransactionsPages = computed(() => {
  return Math.ceil(totalTransactionsItems.value / transactionsPerPage.value);
});

const paginatedTransactions = computed(() => {
  return transactionsData.value;
});

const showTransactionsPagination = computed(() => {
  return totalTransactionsItems.value > transactionsPerPage.value;
});

const lastThreeArticles = computed(() => {
  return articlesData.value.slice(0, 3);
});

const lastThreePartners = computed(() => {
  return partnersData.value.slice(0, 3);
});

const showBonusPayoutPopup = ref(false);
const bonusPayoutAmount = ref<number | null>(null);
const isSubmittingBonusPayout = ref(false);
const payoutError = ref('');

const maxBonusAmount = computed(() => profileData.value.bonus || 0);
const isBonusAmountValid = computed(() => {
  if (!bonusPayoutAmount.value) return false;
  return bonusPayoutAmount.value > 0 && bonusPayoutAmount.value <= maxBonusAmount.value;
});

const minPayoutAmount = computed(() => {
  return isoldsumm.value === "1" ? 1000 : 5000;
});

const isPayoutAmountValid = computed(() => {
  if (!payoutAmount.value) return false;
  return payoutAmount.value >= minPayoutAmount.value && payoutAmount.value <= profileData.value.balance;
});

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

const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Функция для извлечения данных треков
const extractTracks = (trackJson: any): Track[] => {
  if (!trackJson) return [];
  
  if (Array.isArray(trackJson)) {
    return trackJson.map((track: any) => ({
      id: track.id || track.zvonko_id,
      title: track.title || track.name,
      track_number: track.track_number,
      duration: track.duration,
      isrc: track.isrc || '',
      upc: track.upc || track.album_upc,
      artist: track.artist,
      artist_name: track.artist_name,
      composer: track.composer,
      lyricist: track.lyricist,
      is_explicit: track.is_explicit,
      has_file: track.has_file,
      has_lyrics: track.has_lyrics,
      ...track
    }));
  }
  
  if (typeof trackJson === 'object' && trackJson.id) {
    return [{
      id: trackJson.id,
      title: trackJson.title || trackJson.name,
      track_number: trackJson.track_number,
      duration: trackJson.duration,
      isrc: trackJson.isrc || '',
      ...trackJson
    }];
  }
  
  return [];
};

// Функция для загрузки страницы релизов
const fetchReleasesPage = async (page: number) => {
  isLoadingReleases.value = true;
  try {
    const response = await sendRequest('get', `/ajax_vue/ajax/getData.php?PAGEN_1=${page}`, {});
    
    if (response.data && response.data.releases) {
      releasesData.value = response.data.releases.items.map((item: any) => ({
        id: item.ID || item.id,
        name: item.NAME || item.name,
        date: item.DATE_CREATE || item.date,
        image: item.PROPERTY_ZVONKO_ALBUM_JSON?.image || item.image,
        upcCode: item.PROPERTY_ZVONKO_ALBUM_JSON?.upc || item.upc,
        link: item.PROPERTY_ZVONKO_ALBUM_JSON?.smart_link?.url || item.PROPERTY_ZVONKO_SMART_LINK_URL_VALUE || item.link,
        contractFile: item.CONTRACT_FILE ? getFullUrl(item.CONTRACT_FILE) : null,
        hasPng: item.HAS_PNG,
        previewText: item.PREVIEW_TEXT,
        propertyDateRelizValue: item.PROPERTY_DATE_RELIZ_VALUE,
        propertyDopValue: item.PROPERTY_DOP_VALUE,
        propertyNewDocxValue: item.PROPERTY_NEW_DOCX_VALUE,
        propertyDogovorUserValue: item.PROPERTY_DOGOVOR_USER_VALUE,
        propertyDogovorPdfValue: item.PROPERTY_DOGOVOR_PDF_VALUE ? getFullUrl(item.PROPERTY_DOGOVOR_PDF_VALUE) : null,
        propertyLinkValue: item.PROPERTY_LINK_VALUE,
        propertyDogovorStatusValue: item.PROPERTY_DOGOVOR_STATUS_VALUE,
        tracks: extractTracks(item.PROPERTY_ZVONKO_TRACK_JSON)
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
    const response = await sendRequest('get', `/ajax_vue/ajax/getData.php?report_page=${page}`, {});
    
    if (response.data && response.data.downloadedReports) {
      reportsData.value = response.data.downloadedReports.items.map((item: any) => ({
        id: item.id,
        filename: item.name || 'Отчет',
        filesize: '',
        date: '',
        hasAct: false,
        xlsxUrl: item.xlsxUrl,
        pdfUrl: item.pdfUrl,
        images: item.images || []
      }));
      
      reportsPagination.value = {
        currentPage: response.data.downloadedReports.currentPage || page,
        perPage: response.data.downloadedReports.perPage || reportsPerPage.value,
        total: response.data.downloadedReports.totalItems?.toString() || "0"
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
    const response = await sendRequest('get', `/ajax_vue/ajax/getData.php?PAGEN_2=${page}`, {});
    
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

const selectYear = async (year: string) => {
  selectedYear.value = year;
  
  loading.value = true;
  isLoadingQuarters.value = true;
  try {
    const response = await sendRequest('post', '/ajax_vue/ajax/profile/kvartal.php', {
      ID: year
    });
    
    console.log('Ответ с кварталами (HTML):', response.data);
    
    const quartersHtml = response.data;
    const parser = new DOMParser();
    const doc = parser.parseFromString(quartersHtml, 'text/html');
    const radioInputs = doc.querySelectorAll('input[name="QUARTER_ID"]');
    
    console.log('Найдено radio inputs:', radioInputs.length);
    
    availableQuarters.value = [];
    
    radioInputs.forEach((input: Element) => {
      const value = input.getAttribute('value');
      const label = doc.querySelector(`label[for="${input.id}"]`);
      let text = '';
      
      if (label) {
        const span = label.querySelector('span');
        text = span ? span.textContent || '' : label.textContent || '';
      }
      
      console.log('Найден квартал:', { value, text });
      
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
            name: text || value,
            months: ''
          });
        }
      }
    });
    
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
    loading.value = false;
  }
};

const downloadReport = async () => {
  if (!selectedQuarter.value) {
    alert('Пожалуйста, выберите квартал');
    return;
  }

  loading.value = true;
  isDownloading.value = true;
  try {
    const requestData = {
      LABLE_1: userLabel.value,
      QUARTER_ID: selectedQuarter.value,
      YEAR_ID: selectedYear.value
    };
    
    const response = await fetch('/ajax_vue/ajax/profile/report.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    console.log('Ответ от сервера:', data);
    
    if (data.message) {
      if (data.error === 0 && data.message.startsWith('http')) {
        const link = document.createElement('a');
        link.href = data.message;
        link.download = '';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        closeAllPopups();
      } else {
        alert(data.message);
      }
    }
    
  } catch (error) {
    console.error('Ошибка при запросе:', error);
    alert('Произошла ошибка при запросе');
  } finally {
    isDownloading.value = false;
    loading.value = false;
  }
};

const showReportPopupFunc = () => {
  if (!showReportButton.value) {
    alert('Кнопка скачивания отчета недоступна');
    return;
  }
  
  if (reportYears.value.length === 0) {
    alert('Нет доступных отчетов');
    return;
  }
  
  showReportPopup.value = true;
  document.documentElement.classList.add('noscroll');
};

const closeAllPopups = () => {
  showReportPopup.value = false;
  showQuarterPopup.value = false;
  showSignaturePopup.value = false;
  showBonusPayoutPopup.value = false;
  showPayoutAmountPopup.value = false;
  showImagesPopup.value = false;
  selectedYear.value = '';
  selectedQuarter.value = '';
  availableQuarters.value = [];
  actData.value = null;
  actError.value = '';
  payoutAmount.value = null;
  vyplataError.value = '';
  document.documentElement.classList.remove('noscroll');
};

const backToYearSelection = () => {
  showQuarterPopup.value = false;
  showReportPopup.value = true;
  selectedQuarter.value = '';
  availableQuarters.value = [];
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    const placeholder = document.createElement('div');
    placeholder.className = 'personal__releases_image_placeholder';
    parent.appendChild(placeholder);
  }
};

const fetchProfileData = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    console.log('Данные из API:', response.data);
    
    if (response.data) {
      isoldsumm.value = response.data.isoldsumm || "0";
    }

    if (response.data && response.data.user) {
      userName.value = response.data.user.name || response.data.user.login || 'Пользователь';
    }
    
    if (response.data && response.data.profile) {
      profileData.value.balance = response.data.profile.balance || 0;
      profileData.value.bonus = response.data.profile.bonus || 0;
      profileData.value.region = response.data.profile.region || 'Russia';
      showReportButton.value = response.data.profile.showReportButton || false;
      userLabel.value = response.data.profile.ufLable || 0;
    }
    
    if (response.data && response.data.reportYears) {
      reportYears.value = response.data.reportYears;
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке профиля:', error);
    throw error;
  }
};

const fetchReleases = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    if (response.data && response.data.releases) {
      releasesData.value = response.data.releases.items.map((item: any) => ({
        id: item.ID || item.id,
        name: item.NAME || item.name,
        date: item.DATE_CREATE || item.date,
        image: item.PROPERTY_ZVONKO_ALBUM_JSON?.image || item.image,
        upcCode: item.PROPERTY_ZVONKO_ALBUM_JSON?.upc || item.upc,
        link: item.PROPERTY_ZVONKO_ALBUM_JSON?.smart_link?.url || item.PROPERTY_ZVONKO_SMART_LINK_URL_VALUE || item.link,
        contractFile: item.CONTRACT_FILE ? getFullUrl(item.CONTRACT_FILE) : null,
        hasPng: item.HAS_PNG,
        previewText: item.PREVIEW_TEXT,
        propertyDateRelizValue: item.PROPERTY_DATE_RELIZ_VALUE,
        propertyDopValue: item.PROPERTY_DOP_VALUE,
        propertyNewDocxValue: item.PROPERTY_NEW_DOCX_VALUE,
        propertyDogovorUserValue: item.PROPERTY_DOGOVOR_USER_VALUE,
        propertyDogovorPdfValue: item.PROPERTY_DOGOVOR_PDF_VALUE ? getFullUrl(item.PROPERTY_DOGOVOR_PDF_VALUE) : null,
        propertyLinkValue: item.PROPERTY_LINK_VALUE,
        propertyDogovorStatusValue: item.PROPERTY_DOGOVOR_STATUS_VALUE,
        tracks: extractTracks(item.PROPERTY_ZVONKO_TRACK_JSON)
      }));
      
      releasesPagination.value = {
        currentPage: response.data.releases.currentPage || 1,
        perPage: response.data.releases.perPage || releasesPerPage.value,
        total: response.data.releases.total || "0"
      };
      currentReleasesPage.value = releasesPagination.value.currentPage;
    }
  } catch (error) {
    console.error('Ошибка при загрузке релизов:', error);
    throw error;
  }
};

const fetchReports = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
    if (response.data && response.data.downloadedReports) {
      reportsData.value = response.data.downloadedReports.items.map((item: any) => ({
        id: item.id,
        filename: item.name || 'Отчет',
        filesize: '',
        date: '',
        hasAct: false,
        xlsxUrl: item.xlsxUrl,
        pdfUrl: item.pdfUrl,
        images: item.images || []
      }));
      
      reportsPagination.value = {
        currentPage: response.data.downloadedReports.currentPage || 1,
        perPage: response.data.downloadedReports.perPage || reportsPerPage.value,
        total: response.data.downloadedReports.totalItems?.toString() || "0"
      };
      currentReportsPage.value = reportsPagination.value.currentPage;
    }
  } catch (error) {
    console.error('Ошибка при загрузке отчетов:', error);
    throw error;
  }
};

const fetchTransactions = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php', {});
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
  } catch (error) {
    console.error('Ошибка при загрузке транзакций:', error);
    throw error;
  }
};

const fetchArticles = async () => {
  try {
    const response = await sendRequest('get', '/ajax_vue/ajax/getData.php?articles', {});
    if (response.data && response.data.articles) {
      articlesData.value = response.data.articles;
    } else {
      articlesData.value = [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке статей:', error);
    articlesData.value = [];
    throw error;
  }
};

const fetchPartners = async () => {
  try {
    const partnerResponse = await sendRequest('get', '/ajax_vue/ajax/getData.php?referral', {});
    if (partnerResponse.data && partnerResponse.data.profile && partnerResponse.data.profile.referralUsers) {
      partnersData.value = partnerResponse.data.profile.referralUsers.map((user: any, index: number) => ({
        id: parseInt(user.ID) || index + 1,
        name: user.LOGIN || 'Без имени',
        email: user.EMAIL || '',
        date: formatDate(user.DATE_REGISTER),
        earnings: user.PAYOUT || '0 ₽',
        releases: formatReleases(user.UF_RELEASES)
      }));
    } else {
      partnersData.value = [];
    }
  } catch (error) {
    console.error('Ошибка при загрузке партнеров:', error);
    partnersData.value = [];
    throw error;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatReleases = (releases: string | number) => {
  const count = Number(releases);
  if (count === 0) return '0 релизов';
  if (count === 1) return '1 релиз';
  if (count >= 2 && count <= 4) return `${count} релиза`;
  return `${count} релизов`;
};

const openPayoutAmountPopup = () => {
  if (profileData.value.balance < minPayoutAmount.value) {
    alert(`Минимальная сумма для выплаты: ${minPayoutAmount.value} ₽`);
    return;
  }
  
  payoutAmount.value = null;
  actError.value = '';
  showPayoutAmountPopup.value = true;
  document.documentElement.classList.add('noscroll');
};

const requestPayoutAct = async () => {
  if (!isPayoutAmountValid.value) {
    actError.value = `Сумма должна быть от ${minPayoutAmount.value} до ${profileData.value.balance}`;
    return;
  }

  loading.value = true;
  isRequestingAct.value = true;
  actError.value = '';

  try {
    const valuta = profileData.value.region === 'Russia' ? 'RUB' : 'USD';
    
    const response = await sendRequest('post', '/ajax_vue/ajax/profile/aktVyplata.php', {
      summ: payoutAmount.value,
      valuta: valuta,
      summLabels: payoutAmount.value
    });

    console.log('Ответ при получении акта:', response.data);

    if (response.data && response.data.error === 0) {
      actData.value = {
        docx_url: response.data.data.docx_url,
        pdf_url: response.data.data.pdf_url,
        images: response.data.data.images || [],
        element_id: response.data.data.element_id,
        message: response.data.message
      };
      
      showPayoutAmountPopup.value = false;
      showImagesPopup.value = true;
    } else {
      actError.value = response.data?.message || 'Ошибка при получении акта';
    }
  } catch (error: any) {
    console.error('Ошибка при запросе акта:', error);
    actError.value = error.response?.data?.message || 'Не удалось получить акт для подписи';
  } finally {
    isRequestingAct.value = false;
    loading.value = false;
  }
};

const goToSignature = () => {
  showImagesPopup.value = false;
  showSignaturePopup.value = true;
};

const submitToVyplataApi = async () => {
  if (!actData.value || !payoutAmount.value) return;
  
  isSubmittingVyplata.value = true;
  vyplataError.value = '';
  
  try {
    const valuta = profileData.value.region === 'Russia' ? 'RUB' : 'USD';
    
    const response = await sendRequest('post', '/ajax_vue/ajax/profile/vyplata.php', {
      summ: payoutAmount.value,
      valuta: valuta,
      summLables: payoutAmount.value,
      element_id: actData.value.element_id
    });
    
    console.log('Ответ от API выплаты:', response.data);
    
    if (response.data && response.data.error === 0) {
      alert('Выплата успешно обработана');
      closeAllPopups();
      await fetchProfileData();
    } else {
      vyplataError.value = response.data?.message || 'Ошибка при обработке выплаты';
      alert(vyplataError.value);
    }
  } catch (error: unknown) {
    console.error('Ошибка при отправке на API выплаты:', error);
    
    let errorMessage = 'Не удалось обработать выплату';
    if (error && typeof error === 'object') {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    vyplataError.value = errorMessage;
    alert(vyplataError.value);
  } finally {
    isSubmittingVyplata.value = false;
  }
};

const submitSignature = async (signatureDataUrl: string) => {
  if (!actData.value) return;

  try {
    const response = await fetch(signatureDataUrl);
    const blob = await response.blob();
    
    const fileName = `${actData.value.element_id}.png`;
    const signatureFile = new File([blob], fileName, { type: 'image/png' });

    const formData = new FormData();
    formData.append('name', actData.value.element_id);
    formData.append('signature', signatureFile); 

    const submitResponse = await fetch('/ajax_vue/ajax/newAkt_vyp.php', {
      method: 'POST',
      body: formData,
    });

    if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error('Ошибка HTTP:', submitResponse.status, errorText);
        throw new Error(`HTTP error! status: ${submitResponse.status}`);
    }

    const result = await submitResponse.json();
    console.log('Ответ при отправке подписи:', result);

    if (result && result.error) {
      throw new Error(result.message || 'Ошибка при отправке подписи');
    }

    await submitToVyplataApi();
    
  } catch (error: unknown) {
    console.error('Ошибка при отправке подписи:', error);
    
    let errorMessage = 'Неизвестная ошибка';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }
    
    alert(`Не удалось отправить подпись: ${errorMessage}`);
  }
};

const openBonusPayoutPopup = () => {
  bonusPayoutAmount.value = null;
  payoutError.value = '';
  
  if (maxBonusAmount.value <= 0) {
    alert('У вас нет бонусов для выплаты');
    return;
  }
  
  showBonusPayoutPopup.value = true;
  document.documentElement.classList.add('noscroll');
};

const submitBonusPayout = async () => {
  if (!isBonusAmountValid.value) {
    payoutError.value = `Сумма должна быть от 1 до ${maxBonusAmount.value}`;
    return;
  }

  loading.value = true;
  isSubmittingBonusPayout.value = true;
  payoutError.value = '';

  try {
    const valuta = profileData.value.region === 'Russia' ? 'RUB' : 'USD';
    
    const response = await sendRequest('post', '/ajax_vue/ajax/profile/bonusVyplata.php', {
      summ: bonusPayoutAmount.value,
      valuta: valuta
    });

    console.log('Ответ на выплату бонусов:', response.data);

    if (response.data) {
      if (response.data.error === 0 || response.data.error === false || response.data.error === '0') {
        alert('Запрос на выплату бонусов успешно отправлен');
        closeBonusPayoutPopup();
        await fetchProfileData();
        return;
      }
      
      if (response.data.success === true || response.data.success === '1' || response.data.success === 1) {
        alert('Запрос на выплату бонусов успешно отправлен');
        closeBonusPayoutPopup();
        await fetchProfileData();
        return;
      }
      
      if (response.data.status === 'ok' || response.data.status === 'success') {
        alert('Запрос на выплату бонусов успешно отправлен');
        closeBonusPayoutPopup();
        await fetchProfileData();
        return;
      }
      
      if (response.data.message && (
          response.data.message.toLowerCase().includes('успех') || 
          response.data.message.toLowerCase().includes('success') ||
          response.data.message.toLowerCase().includes('отправлен')
      )) {
        alert(response.data.message);
        closeBonusPayoutPopup();
        await fetchProfileData();
        return;
      }
      
      if (!response.data.error && !response.data.errorCode) {
        alert('Запрос на выплату бонусов успешно отправлен');
        closeBonusPayoutPopup();
        await fetchProfileData();
        return;
      }
    }
    
    const errorMessage = response.data?.message || 
                        response.data?.errorMessage || 
                        response.data?.error ||
                        'Произошла ошибка при запросе выплаты';
    
    payoutError.value = errorMessage;
    
  } catch (error: unknown) {
    console.error('Ошибка при запросе выплаты бонусов:', error);
    
    let errorMessage = 'Не удалось отправить запрос. Проверьте соединение и попробуйте позже.';
    
    if (error && typeof error === 'object') {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    payoutError.value = errorMessage;
  } finally {
    isSubmittingBonusPayout.value = false;
    loading.value = false;
  }
};

const closeBonusPayoutPopup = () => {
  showBonusPayoutPopup.value = false;
  bonusPayoutAmount.value = null;
  payoutError.value = '';
  isSubmittingBonusPayout.value = false;
  document.documentElement.classList.remove('noscroll');
};

const loadAllData = async () => {
  loading.value = true;
  loadedCount.value = 0;
  
  try {
    await Promise.all([
      fetchProfileData().finally(() => loadedCount.value++),
      fetchReleases().finally(() => loadedCount.value++),
      fetchReports().finally(() => loadedCount.value++),
      fetchTransactions().finally(() => loadedCount.value++),
      fetchArticles().finally(() => loadedCount.value++),
      fetchPartners().finally(() => loadedCount.value++)
    ]);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    loading.value = false;
  }
};

watch(currentReportsPage, async (newPage) => {
  if (newPage > 0) {
    await fetchReportsPage(newPage);
  }
});

onMounted(() => {
  loadAllData();
});
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div v-if="loading" class="personal__block">
      <div class="loading__container">
        <div 
          v-loading="loading" 
          :element-loading-svg="loadingSvg" 
          class="loading__svg" 
          element-loading-svg-view-box="-10, -10, 50, 50"
        ></div>
      </div>
    </div>
    <div v-else class="personal__block">
      <div class="personal__balance">
        <div class="personal__balance_info">
          <h3 class="personal__balance_head">ЛИЧНЫЙ КАБИНЕТ {{ userName }}</h3>
        </div>
        <div class="personal__divider"></div>
        <ul class="personal__balance_list">
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><WalletSVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading text_one">Отчет</h4>
                <p class="personal__balance_desc">Баланс обновляется после скачивания отчёта. Пожалуйста, скачайте отчёт, после этого сумма на балансе обновится</p>
              </div>
            </div>
            <button 
              class="personal__balance_button button__primary"
              @click="openPayoutAmountPopup"
              :disabled="profileData.balance < minPayoutAmount"
              :class="{ 'button__disabled': profileData.balance < minPayoutAmount }"
            >
              <span>Запросить выплаты</span>
            </button>
          </li>
          <li class="personal__balance_item">
            <div class="personal__balance_top">
              <div class="personal__balance_svg"><WalletSVG/></div>
              <div class="personal__balance_top_info">
                <h4 class="personal__balance_heading">
                  <span class="personal__balance_description text_one">Баланс</span>
                  {{ profileData.balance.toLocaleString() }} ₽
                </h4>
              </div>
            </div>
            <button 
              class="personal__balance_button button__black" 
              :class="{ 'button__disabled': !showReportButton }"
              :disabled="!showReportButton"
              @click="showReportPopupFunc"
            >
              <span><DownloadSVG/>Скачать отчет</span>
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
            <button 
              class="personal__balance_button button__primary"
              @click="openBonusPayoutPopup"
              :disabled="profileData.bonus <= 0"
              :class="{ 'button__disabled': profileData.bonus <= 0 }"
              style="display: none;"
            >
              <span>Запросить выплаты бонусов</span>
            </button>
          </li>
        </ul>
      </div>
      <div class="personal__flex">
        <div class="personal__content">
          <div class="personal__release">
            <div class="personal__release_flex">
              <h5 class="personal__release_head">ОТПРАВИТЬ РЕЛИЗ НА ПЛОЩАДКИ</h5>
              <p class="personal__release_desc">Нажмите на кнопку ниже, чтобы заполнить форму и отправить свой релиз на все платформы!</p>
            </div>
            <RouterLink class="personal__release_button button__red button" :to="Tr.i18nRoute({ name: 'release' })">
              <span>Выложить релиз</span>
            </RouterLink>
          </div>
          <div class="personal__releases">
            <div class="personal__releases_block">
              <h5 class="personal__releases_title">ВАШИ РЕЛИЗЫ</h5>
              <ul class="personal__releases_list">
                <li 
                  class="personal__releases_item" 
                  v-for="release in paginatedReleases" 
                  :key="release.id"
                >
                  <div class="personal__releases_information">
                    <div class="personal__releases_image">
                      <img 
                        v-if="release.image"
                        :src="release.image"
                        @error="handleImageError"
                        alt=""
                      >
                      <div v-else class="personal__releases_image_placeholder"></div>
                    </div>
                    <div class="personal__releases_flex">
                      <div class="personal__releases_top">
                        <h5 class="personal__releases_head"><span>{{ release.propertyNewDocxValue === '1' ? 'Сингл' : 'Релиз' }}</span> {{ release.name }}</h5>
                        <p class="personal__releases_album text_very"></p>
                      </div>
                      <p class="personal__releases_date text_very">Дата релиза: {{ release.propertyDateRelizValue ? release.propertyDateRelizValue.split('-').reverse().join('.') : release.date.split(' ')[0]  }}</p>
                    </div>
                  </div>
                  <div class="personal__releases_info">
                    <div class="personal__releases_top">
                      <h5 class="personal__releases_head"><span>{{ release.propertyNewDocxValue === '1' ? 'Сингл' : 'Релиз' }}</span> {{ release.name }}</h5>
                      <p class="personal__releases_album text_very"></p>
                    </div>
                    <div class="personal__releases_codes">
                      <button v-if="release.upcCode" class="personal__releases_code">
                        <span>UPC код: {{ release.upcCode }}</span>
                      </button>
                      <a 
                        v-if="release.link" 
                        :href="release.link" 
                        class="personal__releases_code"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkSVG/>
                        <span>{{ release.link }}</span>
                      </a>
                    </div>
                    
                    <!-- Блок с треками и их кодами -->
                    <div v-if="release.tracks && release.tracks.length > 0" class="personal__releases_tracks">
                      <div class="personal__releases_tracks_header">
                        <span class="personal__releases_tracks_title">Треки:</span>
                      </div>
                      <div class="personal__releases_tracks_list">
                        <div 
                          v-for="(track, idx) in release.tracks" 
                          :key="track.id || idx"
                          class="personal__releases_track"
                        >
                          <div class="personal__releases_track_header">
                            <span class="personal__releases_track_number">{{ track.track_number }}.</span>
                            <span class="personal__releases_track_title">{{ track.title }}</span>
                            <span class="personal__releases_track_duration" v-if="track.duration">
                              {{ Math.floor(track.duration / 60) }}:{{ (track.duration % 60).toString().padStart(2, '0') }}
                            </span>
                          </div>
                          <div class="personal__releases_track_codes">
                            <button v-if="track.isrc" class="personal__releases_code personal__releases_code_small">
                              <span>ISRC: {{ track.isrc }}</span>
                            </button>
                            <button v-if="track.upc" class="personal__releases_code personal__releases_code_small">
                              <span>UPC: {{ track.upc }}</span>
                            </button>
                            <button v-if="track.composer" class="personal__releases_code personal__releases_code_small">
                              <span>Композитор: {{ track.composer }}</span>
                            </button>
                            <button v-if="track.lyricist" class="personal__releases_code personal__releases_code_small">
                              <span>Автор текста: {{ track.lyricist }}</span>
                            </button>
                            <button v-if="track.artist_name" class="personal__releases_code personal__releases_code_small">
                              <span>Исполнитель: {{ track.artist_name }}</span>
                            </button>
                            <button v-if="track.is_explicit" class="personal__releases_code personal__releases_code_small explicit">
                              <span>⚠️ Explicit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="personal__releases_bottom">
                      <p class="personal__releases_date text_very">Дата релиза: {{ release.propertyDateRelizValue ? release.propertyDateRelizValue.split('-').reverse().join('.') : release.date.split(' ')[0]  }}</p>
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
                      v-if="report.xlsxUrl"
                      :href="getFullUrl(report.xlsxUrl)" 
                      class="personal__reports_button button__text" 
                      download=""
                    >
                      <DownloadSVG/>
                      <span>Скачать XLSX</span>
                    </a>
                    
                    <a 
                      v-if="report.pdfUrl"
                      :href="getFullUrl(report.pdfUrl)" 
                      class="personal__reports_button button__text" 
                      download=""
                    >
                      <DownloadSVG/>
                      <span>Скачать PDF</span>
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
              <h5 class="personal__articles_head">Стать партнёром VAUVISION</h5>
              <p class="personal__articles_desc">Зарабатывайте деньги за рекомендации!</p>
            </div>
            <RouterLink class="personal__partner_button button__primary" :to="Tr.i18nRoute({ name: 'partner' })">
              <span>Присоединиться</span>
            </RouterLink>
          </div>
          <div class="personal__articles">
            <div class="personal__articles_top">
              <h5 class="personal__articles_head">Cтатьи</h5>
              <RouterLink class="personal__articles_all button" :to="Tr.i18nRoute({ name: 'articles' })">
                Смотреть больше
              </RouterLink>
            </div>
            <ul class="personal__articles_list">
              <li 
                class="personal__articles_item" 
                v-for="article in lastThreeArticles" 
                :key="article.url"
              >
                <a :href="article.url" class="personal__articles_link">
                  <div class="personal__articles_image">
                    <img 
                      :src="getFullUrl(article.img)" 
                      :alt="article.name"
                      @error="handleImageError"
                    >
                  </div>
                  <div class="personal__articles_info">
                    <p class="personal__articles_head text_small">{{ article.name }}</p>
                    <p class="personal__articles_date text_very">Читать статью</p>
                  </div>
                </a>
              </li>
              <li v-if="lastThreeArticles.length === 0" class="personal__articles_item">
                <div class="personal__articles_link">
                  <div class="personal__articles_image">
                    <div class="articles__image_placeholder"></div>
                  </div>
                  <div class="personal__articles_info">
                    <p class="personal__articles_head text_small">Статьи временно недоступны</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="personal__partners">
            <div class="personal__partners_top">
              <h5 class="personal__partners_head">Партнеры</h5>
              <RouterLink class="personal__partners_all button" :to="Tr.i18nRoute({ name: 'partner' })">Смотреть больше</RouterLink>
            </div>
            <ul class="personal__partners_list">
              <li 
                class="personal__partners_item" 
                v-for="partner in lastThreePartners" 
                :key="partner.id"
              >
                <a href="#" target="_blank" class="personal__partners_link">
                  <p class="personal__partners_heading button">{{ partner.name }}</p>
                  <p class="personal__partners_desc text_very">{{ partner.email }} • {{ partner.date }}</p>
                </a>
              </li>
              <li v-if="lastThreePartners.length === 0" class="personal__partners_item">
                <div class="personal__partners_link">
                  <p class="personal__partners_heading button">Нет партнеров</p>
                  <p class="personal__partners_desc text_very">Пригласите друзей</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

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

<Teleport to="body">
  <div class="popup" v-if="showPayoutAmountPopup" @click.self="closeAllPopups">
    <div class="popup__content popup__content_small">
      <div class="popup__header">
        <h3 class="popup__title">Запрос выплаты</h3>
        <button class="popup__close" @click="closeAllPopups">×</button>
      </div>
      <div class="popup__body">
        <div class="popup__info">
          <p class="popup__balance-info">
            Доступно средств: <strong>{{ profileData.balance.toLocaleString() }} ₽</strong>
          </p>
          <p class="popup__min-amount">
            Минимальная сумма: <strong>{{ minPayoutAmount }} ₽</strong>
          </p>
        </div>
        
        <div class="popup__form-group">
          <label for="payout-amount" class="popup__label">
            Введите сумму для выплаты:
          </label>
          <input
            id="payout-amount"
            type="number"
            class="popup__input"
            :class="{ 'popup__input_error': actError }"
            v-model.number="payoutAmount"
            :min="minPayoutAmount"
            :max="profileData.balance"
            :placeholder="`От ${minPayoutAmount} до ${profileData.balance}`"
            :disabled="isRequestingAct"
            @keyup.enter="requestPayoutAct"
          />
          <p v-if="actError" class="popup__error-message">{{ actError }}</p>
        </div>
        
        <div class="popup__actions">
          <button 
            class="popup__button button button__primary"
            @click="requestPayoutAct"
            :disabled="!isPayoutAmountValid || isRequestingAct"
          >
            <span v-if="!isRequestingAct">Получить акт</span>
            <span v-else>Запрос...</span>
          </button>
          <button 
            class="popup__button button button__black"
            @click="closeAllPopups"
            :disabled="isRequestingAct"
          >
            <span>Отмена</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</Teleport>

<Teleport to="body">
  <div class="popup" v-if="showImagesPopup && actData" @click.self="closeAllPopups">
    <div class="popup__content popup__content_images">
      <div class="popup__header">
        <h3 class="popup__title">Изображения акта</h3>
        <button class="popup__close" @click="closeAllPopups">×</button>
      </div>
      <div class="popup__body">
        <p class="popup__images-info">Акт успешно создан. Просмотрите изображения:</p>
        
        <div class="popup__images-grid" v-if="actData.images && actData.images.length > 0">
          <div 
            v-for="(image, index) in actData.images" 
            :key="index"
            class="popup__image-item"
          >
            <img 
              :src="getFullUrl(image)" 
              :alt="`Изображение ${index + 1}`"
              class="popup__image"
            >
          </div>
        </div>
        
        <div v-else class="popup__empty">
          Нет изображений для отображения
        </div>
        
        <div class="popup__actions">
          <button 
            class="popup__button button button__primary"
            @click="goToSignature"
          >
            <span>Перейти к подписи</span>
          </button>
          <button 
            class="popup__button button button__black"
            @click="closeAllPopups"
          >
            <span>Отмена</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</Teleport>

<SignaturePopup
  v-if="showSignaturePopup && actData"
  @close="closeAllPopups"
  @submit="submitSignature"
/>

<Teleport to="body">
  <div class="popup" v-if="showBonusPayoutPopup" @click.self="closeBonusPayoutPopup">
    <div class="popup__content popup__content_small">
      <div class="popup__header">
        <h3 class="popup__title">Запрос выплаты бонусов</h3>
        <button class="popup__close" @click="closeBonusPayoutPopup">×</button>
      </div>
      <div class="popup__body">
        <div class="popup__info">
          <p class="popup__balance-info">
            Доступно бонусов: <strong>{{ profileData.bonus.toLocaleString() }}</strong>
          </p>
        </div>
        
        <div class="popup__form-group">
          <label for="bonus-amount" class="popup__label">
            Введите сумму для выплаты:
          </label>
          <input
            id="bonus-amount"
            type="number"
            class="popup__input"
            :class="{ 'popup__input_error': payoutError }"
            v-model.number="bonusPayoutAmount"
            :min="1"
            :max="maxBonusAmount"
            :placeholder="`От 1 до ${maxBonusAmount}`"
            :disabled="isSubmittingBonusPayout"
            @keyup.enter="submitBonusPayout"
          />
          <p v-if="payoutError" class="popup__error-message">{{ payoutError }}</p>
        </div>
        
        <div class="popup__actions">
          <button 
            class="popup__button button button__primary"
            @click="submitBonusPayout"
            :disabled="!isBonusAmountValid || isSubmittingBonusPayout"
          >
            <span v-if="!isSubmittingBonusPayout">Отправить запрос</span>
            <span v-else>Отправка...</span>
          </button>
          <button 
            class="popup__button button button__black"
            @click="closeBonusPayoutPopup"
            :disabled="isSubmittingBonusPayout"
          >
            <span>Отмена</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</Teleport>
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
  padding: 0 40px;
  flex-wrap: wrap;
  position: relative;
}

.personal__balance_item {
  display: flex;
  max-width: calc(33.333% - 27px);
  padding: 40px 20px;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  position: relative;
}

.personal__balance_item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 1px;
  background-color: var(--border);
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
  min-height: 315px;
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
  position: relative;
  background-color: var(--border);
}
.personal__releases_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.personal__releases_image_placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--border);
  border-radius: 4px;
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
  margin-bottom: 16px;
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
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.personal__releases_code:hover {
  color: var(--white);
  background-color: var(--color);
  border-color: var(--color);
}
.personal__releases_code svg {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.personal__releases_code_small {
  padding: 6px 12px;
  font-size: 12px;
}
.personal__releases_code_small.explicit {
  background-color: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
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
  flex-wrap: wrap;
}

/* Стили для треков */
.personal__releases_tracks {
  margin: 16px 0;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.personal__releases_tracks_header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.personal__releases_tracks_title {
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--color);
}
.personal__releases_tracks_list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.personal__releases_track {
  padding: 12px;
  background-color: var(--bg);
  border-radius: 6px;
  border: 1px solid var(--border);
}
.personal__releases_track_header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.personal__releases_track_number {
  font-weight: 600;
  font-size: 14px;
  color: var(--color);
}
.personal__releases_track_title {
  font-weight: 500;
  font-size: 15px;
  flex: 1;
}
.personal__releases_track_duration {
  font-size: 12px;
  color: var(--text-gray);
  font-family: monospace;
}
.personal__releases_track_codes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.personal__partner {
  display: flex;
  min-height: 315px;
  padding: 52px;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
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
  position: relative;
  background-color: var(--border);
}
.personal__articles_image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.articles__image_placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--border);
  border-radius: 4px;
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

.popup__content_images {
  max-width: 800px;
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

.popup__content_small {
  max-width: 400px;
}

.popup__info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  border: 1px solid var(--border);
}

.popup__balance-info {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 5px;
}

.popup__min-amount {
  font-size: 14px;
  color: var(--text-gray);
  margin-top: 5px;
}

.popup__balance-info strong,
.popup__min-amount strong {
  font-size: 16px;
  color: var(--color);
}

.popup__form-group {
  margin-bottom: 20px;
}

.popup__label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-gray);
}

.popup__input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid var(--border);
  background-color: var(--bg);
  color: var(--text);
  border-radius: 4px;
  transition: border-color 0.3s;
}

.popup__input:focus {
  outline: none;
  border-color: var(--color);
}

.popup__input_error {
  border-color: #ff4d4f;
}

.popup__error-message {
  margin-top: 5px;
  font-size: 14px;
  color: #ff4d4f;
}

.popup__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.popup__images-info {
  margin-bottom: 20px;
  font-size: 16px;
  color: var(--text);
}

.popup__images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding: 5px;
}

.popup__image-item {
  width: 100%;
  position: relative;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  cursor: pointer;
}

.popup__image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.pagination__buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.pagination__buttons_button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.pagination__buttons_info {
  font-size: 14px;
  color: var(--text-gray);
}

@media (max-width: 1919px) {
  .personal__flex {
    gap: 20px;
  }
  .personal__content {
    width: calc(100% - 340px);
  }
  .personal__balance_item {
    max-width: calc(33.333% - 27px);
    padding: 40px 20px;
  }
  .personal__partner {
    gap: 84px;
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
    gap: 30px;
  }
  
  .personal__balance_item:first-child {
    width: 100%;
    max-width: 100%;
    padding: 0;
  }
  
  .personal__balance_item:first-child::after {
    display: none;
  }
  
  .personal__balance_item {
    max-width: 100%;
    padding: 0;
  }
  
  .personal__balance_item:not(:last-child)::after {
    display: none;
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
  .personal__release,
  .personal__partner {
    min-height: auto;
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
  
  .popup__header {
    flex-direction: column;
    gap: 10px;
  }
  
  .popup__title {
    position: static;
    transform: none;
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
    gap: 20px;
  }
  
  .personal__balance_item {
    padding: 0;
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
  
  .personal__releases_track_header {
    flex-direction: column;
    gap: 4px;
  }
  
  .personal__releases_track_codes {
    flex-direction: column;
  }

  .popup__images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    max-height: 300px;
  }
}

@media (max-width: 580px) {
  .personal__release_image {
    width: 150px;
    bottom: -100px;
  }
}

@media (max-width: 480px) {
  .popup__actions {
    flex-direction: column;
  }
  
  .popup__images-grid {
    grid-template-columns: 1fr;
  }
}
</style>