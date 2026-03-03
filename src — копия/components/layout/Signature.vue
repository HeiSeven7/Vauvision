<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const emit = defineEmits<{
  close: [];
  submit: [signatureData: string];
}>();

// Ключ для сохранения подписи в localStorage
const SIGNATURE_STORAGE_KEY = 'signature_data';

const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const signatureDrawn = ref(false);
let canvasContext: CanvasRenderingContext2D | null = null;

// Сохранение подписи в localStorage
const saveSignatureToLocalStorage = () => {
  if (!signatureCanvas.value) return;
  
  try {
    // Получаем данные подписи в формате base64
    const dataUrl = signatureCanvas.value.toDataURL('image/png');
    localStorage.setItem(SIGNATURE_STORAGE_KEY, dataUrl);
  } catch (error) {
    console.error('Error saving signature to localStorage:', error);
  }
};

// Загрузка подписи из localStorage
const loadSignatureFromLocalStorage = () => {
  try {
    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (savedSignature && canvasContext && signatureCanvas.value) {
      const img = new Image();
      img.onload = () => {
        canvasContext!.clearRect(0, 0, signatureCanvas.value!.width, signatureCanvas.value!.height);
        canvasContext!.drawImage(img, 0, 0);
        signatureDrawn.value = true;
      };
      img.src = savedSignature;
    }
  } catch (error) {
    console.error('Error loading signature from localStorage:', error);
  }
};

// Очистка подписи из localStorage
const clearSignatureFromLocalStorage = () => {
  localStorage.removeItem(SIGNATURE_STORAGE_KEY);
};

// Инициализация канваса
const initCanvas = () => {
  if (!signatureCanvas.value) return;
  
  const canvas = signatureCanvas.value;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  canvasContext = ctx;
  
  // Установка размеров канваса
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  ctx.scale(dpr, dpr);
  
  // Настройка стилей рисования
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';
  
  // Очистка канваса
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Загружаем сохраненную подпись
  loadSignatureFromLocalStorage();
};

// Начало рисования (мышь)
const startDrawing = (e: MouseEvent) => {
  if (!signatureCanvas.value) return;
  
  const rect = signatureCanvas.value.getBoundingClientRect();
  lastX.value = e.clientX - rect.left;
  lastY.value = e.clientY - rect.top;
  isDrawing.value = true;
};

// Рисование (мышь)
const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !canvasContext || !signatureCanvas.value) return;
  
  const rect = signatureCanvas.value.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  canvasContext.beginPath();
  canvasContext.moveTo(lastX.value, lastY.value);
  canvasContext.lineTo(currentX, currentY);
  canvasContext.stroke();
  
  lastX.value = currentX;
  lastY.value = currentY;
  signatureDrawn.value = true;
  
  // Сохраняем подпись в localStorage при рисовании
  saveSignatureToLocalStorage();
};

// Начало рисования (тач)
const startDrawingTouch = (e: TouchEvent) => {
  e.preventDefault();
  if (!signatureCanvas.value || e.touches.length === 0) return;
  
  const rect = signatureCanvas.value.getBoundingClientRect();
  const touch = e.touches[0];
  lastX.value = touch.clientX - rect.left;
  lastY.value = touch.clientY - rect.top;
  isDrawing.value = true;
};

// Рисование (тач)
const drawTouch = (e: TouchEvent) => {
  e.preventDefault();
  if (!isDrawing.value || !canvasContext || !signatureCanvas.value || e.touches.length === 0) return;
  
  const rect = signatureCanvas.value.getBoundingClientRect();
  const touch = e.touches[0];
  const currentX = touch.clientX - rect.left;
  const currentY = touch.clientY - rect.top;
  
  canvasContext.beginPath();
  canvasContext.moveTo(lastX.value, lastY.value);
  canvasContext.lineTo(currentX, currentY);
  canvasContext.stroke();
  
  lastX.value = currentX;
  lastY.value = currentY;
  signatureDrawn.value = true;
  
  // Сохраняем подпись в localStorage при рисовании
  saveSignatureToLocalStorage();
};

// Остановка рисования
const stopDrawing = () => {
  isDrawing.value = false;
  // Сохраняем финальную версию подписи
  saveSignatureToLocalStorage();
};

// Очистка подписи
const clearSignature = () => {
  if (!canvasContext || !signatureCanvas.value) return;
  
  const ctx = canvasContext;
  const canvas = signatureCanvas.value;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  signatureDrawn.value = false;
  
  // Удаляем подпись из localStorage
  clearSignatureFromLocalStorage();
};

// Отправка подписи
const submitSignature = () => {
  if (!signatureCanvas.value) return;
  
  // Получаем данные подписи в формате base64
  const dataUrl = signatureCanvas.value.toDataURL('image/png');
  
  // Очищаем localStorage после успешной отправки
  clearSignatureFromLocalStorage();
  
  emit('submit', dataUrl);
};

// Закрытие попапа
const closePopup = () => {
  // Не очищаем localStorage при закрытии, чтобы сохранить черновик подписи
  emit('close');
};

// Обработчики изменения размера окна
const handleResize = () => {
  initCanvas();
};

// Автосохранение подписи при размонтировании компонента (на всякий случай)
const handleBeforeUnload = () => {
  saveSignatureToLocalStorage();
};

onMounted(() => {
  nextTick(() => {
    initCanvas();
  });
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
<div class="signature__popup_overlay" @click.self="closePopup">
  <div class="signature__popup">
    <button class="signature__popup_close" @click="closePopup">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="signature__canvas_container">
      <canvas 
        ref="signatureCanvas" 
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawingTouch"
        @touchmove="drawTouch"
        @touchend="stopDrawing"
      >
        Ваш браузер не поддерживает Canvas
      </canvas>
      <h5 class="signature__hint">нарисуйте подпись</h5>
    </div>
    
    <!-- Кнопки управления -->
    <div class="signature__controls">
      <button 
        class="signature__clear button__black button"
        @click="clearSignature"
      >
        <span>Очистить</span>
      </button>
      <button 
        class="signature__submit button__red button"
        @click="submitSignature"
        :disabled="!signatureDrawn"
      >
        <span>Подписать</span>
      </button>
    </div>
  </div>
</div>
</template>

<style scoped>
.signature__popup_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}
.signature__popup {
  width: 100%;
  padding: 30px;
  max-width: 600px;
  position: relative;
  background-color: var(--bg);
}
.signature__popup_close {
  display: flex;
  padding: 8px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: -60px;
  background: var(--bg);
  cursor: pointer;
  color: var(--text);
}
.signature__canvas_container canvas {
  width: 100%;
  height: 330px;
  border: 2px dashed var(--border);
  cursor: crosshair;
  touch-action: none;
}
.signature__controls {
  display: flex;
  margin-top: 20px;
  gap: 15px;
}
.signature__hint {
  margin: 20px 0 0;
}
@media (max-width: 767px) {
  .signature__popup_close {
    top: -60px;
    left: auto;
    right: 0;
  }
}
</style>