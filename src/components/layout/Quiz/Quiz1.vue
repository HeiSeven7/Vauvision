<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { sendRequest } from '@/utils/api';
import { ElInputNumber, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";
import { openDB } from 'idb';

const emit = defineEmits<{
  'go-back': [];
  'go-next': [];
}>();

// Интерфейсы для данных
interface Product {
  id: string;
  name: string;
  prices: {
    rub?: string;
    usd?: string;
    eur?: string;
    four?: string;
    four_usd?: string;
    do?: string | null;
    do_eur?: string | null;
    do_usd?: string | null;
  };
  properties?: {
    name_en?: string;
    desc_en?: any;
  };
  basket_quantity?: number;
  basket_item_id?: string | null;
}

interface BasketItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  base_price: string;
  total_price: number;
  basket_item_id: string | null;
}

interface UpdateBasketResponse {
  data: {
    items: BasketItem[];
    total: number;
    currency_symbol: string;
    region: string;
    counts: {
      single: number;
      album: number;
      clip: number;
      card: number;
    };
    sums: {
      single: number;
      album: number;
      clip: number;
      card: number;
    };
  }
}

// Ключ для IndexedDB
const DB_NAME = 'quizDB';
const DB_VERSION = 1;
const STORE_NAME = 'quizState';
const STORAGE_KEY = 'quiz1_state';

// Состояние загрузки
const isLoading = ref(true);
const isInitialLoad = ref(true);
const quizDB = ref<any>(null);

// Локальные состояния
const singleCountLocal = ref(0);
const albumCountLocal = ref(0);
const clipCountLocal = ref(0);
const cardCountLocal = ref(0);

// Сохраняем предыдущие значения для отслеживания реальных изменений
const previousCounts = ref({
  single: 0,
  album: 0,
  clip: 0,
  card: 0
});

// Данные с сервера
const products = ref<Product[]>([]);
const basketItems = ref<BasketItem[]>([]);
const userRegion = ref<string>('');
const currencySymbol = ref<string>('₽');
const totalSum = ref<number>(0);

// Флаг для предотвращения циклических обновлений
const isUpdatingFromServer = ref(false);

// Инициализация IndexedDB
const initDB = async () => {
  quizDB.value = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    },
  });
};

// Сохранение состояния в IndexedDB
const saveStateToDB = async () => {
  // Не сохраняем, если обновление идет с сервера
  if (isUpdatingFromServer.value) return;
  
  try {
    const stateToSave = {
      id: STORAGE_KEY,
      singleCount: singleCountLocal.value,
      albumCount: albumCountLocal.value,
      clipCount: clipCountLocal.value,
      cardCount: cardCountLocal.value,
      timestamp: Date.now()
    };
    
    await quizDB.value.put(STORE_NAME, stateToSave);
    console.log('Saved to IndexedDB:', stateToSave);
  } catch (error) {
    console.error('Error saving state to IndexedDB:', error);
  }
};

// Загрузка состояния из IndexedDB
const loadStateFromDB = async () => {
  try {
    const savedState = await quizDB.value.get(STORE_NAME, STORAGE_KEY);
    if (savedState) {
      console.log('Loading from IndexedDB:', savedState);
      
      // Устанавливаем значения из IndexedDB
      singleCountLocal.value = savedState.singleCount || 0;
      albumCountLocal.value = savedState.albumCount || 0;
      clipCountLocal.value = savedState.clipCount || 0;
      cardCountLocal.value = savedState.cardCount || 0;
      
      // Сохраняем в предыдущие значения
      previousCounts.value = {
        single: singleCountLocal.value,
        album: albumCountLocal.value,
        clip: clipCountLocal.value,
        card: cardCountLocal.value
      };
    }
  } catch (error) {
    console.error('Error loading state from IndexedDB:', error);
  }
};

// Загрузка данных с сервера
const loadData = async () => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/getDataForm.php', {});
    console.log('getDataForm:', response.data);
    
    const data = response.data as any;
    
    // Сохраняем продукты
    if (data.products) {
      products.value = data.products;
    }
    
    // Определяем регион пользователя
    if (data.user?.uf_region) {
      userRegion.value = data.user.uf_region;
    } else if (data.region) {
      userRegion.value = data.region;
    }
    
    // Обновляем корзину после получения данных
    await fetchBasket();
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    isLoading.value = false;
    isInitialLoad.value = false;
  }
};

// Получение корзины
const fetchBasket = async () => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/basket/updateBasket.php', {});
    console.log('updateBasket:', response.data);
    
    const data = response.data as UpdateBasketResponse;
    
    if (data.data) {
      // Устанавливаем флаг, что обновление идет с сервера
      isUpdatingFromServer.value = true;
      
      // Сохраняем элементы корзины
      basketItems.value = data.data.items || [];
      
      // Получаем новые значения из корзины
      const singleItem = data.data.items.find(item => item.type === 'single');
      const albumItem = data.data.items.find(item => item.type === 'album');
      const clipItem = data.data.items.find(item => item.type === 'clip');
      const cardItem = data.data.items.find(item => item.type === 'card');
      
      const newSingle = singleItem?.quantity || 0;
      const newAlbum = albumItem?.quantity || 0;
      const newClip = clipItem?.quantity || 0;
      const newCard = cardItem?.quantity || 0;
      
      // Обновляем локальные счетчики из данных корзины ТОЛЬКО если они отличаются
      // и если это не начальная загрузка из IndexedDB
      if (!isInitialLoad.value || 
          singleCountLocal.value !== newSingle ||
          albumCountLocal.value !== newAlbum ||
          clipCountLocal.value !== newClip ||
          cardCountLocal.value !== newCard) {
        
        singleCountLocal.value = newSingle;
        albumCountLocal.value = newAlbum;
        clipCountLocal.value = newClip;
        cardCountLocal.value = newCard;
      }
      
      // Обновляем предыдущие значения
      previousCounts.value = {
        single: singleCountLocal.value,
        album: albumCountLocal.value,
        clip: clipCountLocal.value,
        card: cardCountLocal.value
      };
      
      // Обновляем общую сумму и символ валюты
      totalSum.value = data.data.total || 0;
      currencySymbol.value = data.data.currency_symbol || '₽';
      
      console.log('Updated from server:', {
        single: singleCountLocal.value,
        album: albumCountLocal.value,
        clip: clipCountLocal.value,
        card: cardCountLocal.value
      });
      
      // Сохраняем текущее состояние в IndexedDB
      await saveStateToDB();
      
      // Сбрасываем флаги
      setTimeout(() => {
        isUpdatingFromServer.value = false;
        isLoading.value = false;
        isInitialLoad.value = false;
      }, 100);
    }
  } catch (error) {
    console.error('Ошибка получения корзины:', error);
    isUpdatingFromServer.value = false;
    isLoading.value = false;
    isInitialLoad.value = false;
  }
};

// Получение цены продукта в зависимости от региона
const getProductPrice = (product: Product | undefined): number => {
  if (!product) return 0;
  
  // Если регион Russia - используем цену в рублях
  if (userRegion.value === 'Russia') {
    return product.prices?.rub ? parseInt(product.prices.rub) : 0;
  }
  
  // Для других регионов - цена в USD
  return product.prices?.usd ? parseInt(product.prices.usd) : 0;
};

// Поиск продукта по ID
const findProductById = (id: string): Product | undefined => {
  return products.value.find(p => p.id === id);
};

// Получение basket_item_id для продукта
const getBasketItemId = (productId: string): string | null => {
  const basketItem = basketItems.value.find(item => item.id === productId);
  return basketItem?.basket_item_id || null;
};

// Цены продуктов
const singlePrice = computed(() => getProductPrice(findProductById('28')));
const albumPrice = computed(() => getProductPrice(findProductById('29')));
const clipPrice = computed(() => getProductPrice(findProductById('30')));
const cardPrice = computed(() => getProductPrice(findProductById('31')));

// Названия продуктов
const singleName = computed(() => {
  const product = findProductById('28');
  return product?.name || 'Сингл';
});

const albumName = computed(() => {
  const product = findProductById('29');
  return product?.name || 'Альбом';
});

const clipName = computed(() => {
  const product = findProductById('30');
  return product?.name || 'Клип';
});

const cardName = computed(() => {
  const product = findProductById('31');
  return product?.name || 'Оформление карточки';
});

// Проверка, выбран ли хотя бы один сингл или альбом
const isContinueDisabled = computed(() => {
  return singleCountLocal.value === 0 && albumCountLocal.value === 0;
});

// Форматирование цены с разделителями тысяч
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Отправка запроса на добавление в корзину
const addToBasket = async (productId: string) => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/basket/addBasket.php', {
      ID: productId
    });
    console.log('addBasket response:', response.data);
    
    // После успешного добавления обновляем корзину
    await fetchBasket();
    
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
    // В случае ошибки возвращаем предыдущее значение
    await fetchBasket();
  }
};

// Отправка запроса на изменение количества в корзине
const editBasket = async (basketItemId: string, count: number) => {
  try {
    const response = await sendRequest("post", '/ajax_vue/ajax/basket/editBasket.php', {
      ID: basketItemId,
      COUNT: count
    });
    console.log('editBasket response:', response.data);
    
    // После успешного изменения обновляем корзину
    await fetchBasket();
    
  } catch (error) {
    console.error('Ошибка изменения корзины:', error);
    // В случае ошибки возвращаем предыдущее значение
    await fetchBasket();
  }
};

// Обработчик изменения количества
const handleQuantityChange = async (
  productId: string, 
  newCount: number, 
  oldCount: number
) => {
  // Если обновление идет с сервера или начальная загрузка - ничего не делаем
  if (isUpdatingFromServer.value || isInitialLoad.value) {
    console.log('Skipping API call due to flags:', {
      isUpdatingFromServer: isUpdatingFromServer.value,
      isInitialLoad: isInitialLoad.value
    });
    return;
  }
  
  const basketItemId = getBasketItemId(productId);
  
  if (newCount > oldCount) {
    // Увеличиваем количество - добавляем новый товар
    console.log(`Adding product ${productId} to basket`);
    await addToBasket(productId);
  } else if (newCount < oldCount && basketItemId) {
    // Уменьшаем количество - редактируем существующий
    console.log(`Editing basket item ${basketItemId} to count ${newCount}`);
    await editBasket(basketItemId, newCount);
  }
};

// При монтировании
onMounted(async () => {
  // Инициализируем IndexedDB
  await initDB();
  
  // Сначала загружаем из IndexedDB
  await loadStateFromDB();
  
  // Затем загружаем данные с сервера
  await loadData();
});

const goBack = () => {
  emit('go-back');
};

const handleContinue = async () => {
  if (isContinueDisabled.value) {
    ElMessage.warning('Для продолжения выберите хотя бы один сингл или альбом');
    return;
  }
  
  // Сохраняем текущее состояние в IndexedDB
  await saveStateToDB();
  
  emit('go-next');
};

// Следим за изменениями счетчиков
watch([singleCountLocal, albumCountLocal, clipCountLocal, cardCountLocal], 
  async ([newSingle, newAlbum, newClip, newCard], 
         [oldSingle, oldAlbum, oldClip, oldCard]) => {
    
    // Сохраняем в IndexedDB (только если не обновление с сервера)
    if (!isUpdatingFromServer.value) {
      await saveStateToDB();
    }
    
    // Обновляем предыдущие значения для следующего сравнения
    previousCounts.value = {
      single: newSingle,
      album: newAlbum,
      clip: newClip,
      card: newCard
    };
    
    // Обрабатываем изменения для каждого продукта
    if (newSingle !== oldSingle) {
      await handleQuantityChange('28', newSingle, oldSingle);
    }
    
    if (newAlbum !== oldAlbum) {
      await handleQuantityChange('29', newAlbum, oldAlbum);
    }
    
    if (newClip !== oldClip) {
      await handleQuantityChange('30', newClip, oldClip);
    }
    
    if (newCard !== oldCard) {
      await handleQuantityChange('31', newCard, oldCard);
    }
  },
  { deep: true }
);

// Сохраняем состояние при покидании страницы
window.addEventListener('beforeunload', async () => {
  await saveStateToDB();
});

// Сохраняем состояние при изменении видимости вкладки
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
    await saveStateToDB();
  }
});
</script>

<template>
<div class="quiz__form quiz__form_one">
  <div class="quiz__form_top">
    <h4 class="quiz__form_head">Что вы хотите загрузить?</h4>
    <button class="quiz__additional button__second button">
      <span>Дополнительная информация</span>
    </button>
  </div>
  <ul class="quiz__form_one_list">
    <li class="quiz__form_one_item">
      <h6 class="quiz__form_one_head">{{ singleName }}</h6>
      <div class="quiz__form_one_right">
        <p class="quiz__form_one_price">{{ formatPrice(singlePrice) }} {{ currencySymbol }}</p>
        <div class="quiz__form_one_count">
          <el-input-number 
            v-model="singleCountLocal" 
            :min="0" 
            :max="99" 
            :controls="true"
            :show-input="false"
            :disabled="isLoading"
          />
        </div>
      </div>
    </li>
    <li class="quiz__form_one_item">
      <h6 class="quiz__form_one_head">{{ albumName }}</h6>
      <div class="quiz__form_one_right">
        <p class="quiz__form_one_price">{{ formatPrice(albumPrice) }} {{ currencySymbol }}</p>
        <div class="quiz__form_one_count">
          <el-input-number 
            v-model="albumCountLocal" 
            :min="0" 
            :max="99" 
            :controls="true"
            :show-input="false"
            :disabled="isLoading"
          />
        </div>
      </div>
    </li>
    <li class="quiz__form_one_item">
      <h6 class="quiz__form_one_head">{{ clipName }}</h6>
      <div class="quiz__form_one_right">
        <p class="quiz__form_one_price">{{ formatPrice(clipPrice) }} {{ currencySymbol }}</p>
        <div class="quiz__form_one_count">
          <el-input-number 
            v-model="clipCountLocal" 
            :min="0" 
            :max="99" 
            :controls="true"
            :show-input="false"
            :disabled="isLoading"
          />
        </div>
      </div>
    </li>
    <li class="quiz__form_one_item">
      <h6 class="quiz__form_one_head">{{ cardName }}</h6>
      <div class="quiz__form_one_right">
        <p class="quiz__form_one_price">{{ formatPrice(cardPrice) }} {{ currencySymbol }}</p>
        <div class="quiz__form_one_count">
          <el-input-number 
            v-model="cardCountLocal" 
            :min="0" 
            :max="99" 
            :controls="true"
            :show-input="false"
            :disabled="isLoading"
          />
        </div>
      </div>
    </li>
  </ul>
  
  <!-- Индикатор загрузки -->
  <div v-if="isLoading" class="quiz__form_loading">
    <span>Загрузка актуальных данных...</span>
  </div>
  
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
        :disabled="isLoading"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        :disabled="isContinueDisabled || isLoading"
        @click="handleContinue"
      >
        <span>{{ isLoading ? 'Загрузка...' : 'Продолжить' }}</span>
      </button>
    </div>
    <div class="quiz__form_sum">
      <p class="quiz__form_sum_text">Итого к оплате:</p>
      <h4 class="quiz__form_total">
        <span>{{ formatPrice(totalSum) }}</span> {{ currencySymbol }}
      </h4>
    </div>
  </div>
</div>
</template>

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
.quiz__form_one_list {
  padding: 30px;
  border: 1px solid var(--border);
}
.quiz__form_one_item {
  display: flex;
  padding: 20px 0;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.quiz__form_one_item:not(:last-child) {
  border-bottom: 1px solid var(--border);
}
.quiz__form_one_head {
  text-transform: uppercase;
}
.quiz__form_one_right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 65px;
}
.quiz__form_loading {
  text-align: center;
  padding: 15px;
  color: #999;
  font-size: 14px;
}
.quiz__form_sum {
  display: flex;
  align-items: center;
  gap: 15px;
}
.quiz__form_total {
  color: var(--color);
  transform: translateY(-2.5px);
}
.quiz__form_one_price {
  flex: 0 0 auto;
}

:deep(.el-input-number.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

@media (max-width: 1439px) {
  .quiz__form_one_list {
    padding: 30px;
  }
}
@media (max-width: 767px) {
  .quiz__form_one {
    padding: 15px;
  }
  .quiz__form_one_right {
    gap: 20px;
  }
  .quiz__form_one_list {
    padding: 0;
  }
  .quiz__form_one_list {
    border: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
}
</style>