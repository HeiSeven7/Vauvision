<script lang="ts" setup>
import { reactive, computed } from 'vue';
import { ElCheckbox, ElMessage } from 'element-plus';
import BackSVG from "@/uikit/icon/BackSVG.vue";

const emit = defineEmits<{
  'go-back': [];
  'go-next': [data: any];
}>();

// Типы для формы
interface FormData {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

interface FormErrors {
  acceptTerms: string;
  acceptPrivacy: string;
  acceptMarketing: string;
}

// Данные формы
const formData = reactive<FormData>({
  acceptTerms: false,
  acceptPrivacy: false,
  acceptMarketing: false
});

// Ошибки валидации
const errors = reactive<FormErrors>({
  acceptTerms: '',
  acceptPrivacy: '',
  acceptMarketing: ''
});

// Правила валидации
const validationRules = {
  acceptTerms: (value: boolean) => {
    if (!value) return 'Необходимо принять условия оферты';
    return '';
  },
  acceptPrivacy: (value: boolean) => {
    if (!value) return 'Необходимо дать согласие на обработку персональных данных';
    return '';
  },
  acceptMarketing: (_: boolean) => {
    return ''; // Это поле необязательное
  }
};

// Валидация конкретного поля
const validateField = (fieldName: keyof FormErrors): boolean => {
  const value = formData[fieldName as keyof FormData];
  const validator = validationRules[fieldName as keyof typeof validationRules];
  
  if (validator) {
    errors[fieldName] = validator(value);
    return !errors[fieldName];
  }
  
  return true;
};

// Валидация всей формы
const validateForm = (): boolean => {
  let isValid = true;
  
  const requiredFields: (keyof FormErrors)[] = ['acceptTerms', 'acceptPrivacy'];
  
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
};

// Вычисляемое свойство для проверки готовности к продолжению
const isReadyForNextStep = computed(() => {
  return formData.acceptTerms && formData.acceptPrivacy;
});

// Обработчик изменений чекбоксов
const handleCheckboxChange = (fieldName: keyof FormData) => {
  validateField(fieldName as keyof FormErrors);
  
  // Если это обязательное поле и оно стало true, очищаем ошибку
  if (fieldName === 'acceptTerms' && formData.acceptTerms) {
    errors.acceptTerms = '';
  }
  if (fieldName === 'acceptPrivacy' && formData.acceptPrivacy) {
    errors.acceptPrivacy = '';
  }
  if (fieldName === 'acceptMarketing') {
    errors.acceptMarketing = '';
  }
};

const goBack = () => {
  emit('go-back');
};

const goNext = () => {
  const formValid = validateForm();
  
  if (formValid) {
    // Собираем данные для отправки
    const dataToSend = {
      acceptTerms: formData.acceptTerms,
      acceptPrivacy: formData.acceptPrivacy,
      acceptMarketing: formData.acceptMarketing,
      timestamp: new Date().toISOString()
    };
    
    // В реальном приложении здесь можно сохранить данные в store или отправить на сервер
    console.log('Данные договора:', dataToSend);
    
    // Проверяем, что пользователь действительно проскроллил вниз (опционально)
    const agreementSection = document.querySelector('.quiz__form_agreement');
    if (agreementSection) {
      const sectionBottom = agreementSection.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;
      
      if (sectionBottom > viewportHeight + 100) {
        // Если пользователь не проскроллил достаточно далеко, показываем предупреждение
        ElMessage.warning({
          message: 'Пожалуйста, просмотрите договор полностью перед продолжением',
          duration: 3000
        });
        
        // Прокручиваем к договору
        agreementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    emit('go-next', dataToSend);
  } else {
    ElMessage.warning({
      message: 'Пожалуйста, примите обязательные условия договора',
      duration: 3000
    });
    
    // Прокручиваем к первому полю с ошибкой
    const firstErrorField = document.querySelector('.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

// Функция для прокрутки к чекбоксам (может быть вызвана из родительского компонента)
const scrollToCheckboxes = () => {
  const checkboxesSection = document.querySelector('.quiz__form_checkboxes');
  if (checkboxesSection) {
    checkboxesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Экспортируем функции, если нужно использовать извне
defineExpose({
  validateForm,
  scrollToCheckboxes
});
</script>

<template>
<div class="quiz__form quiz__form_seven">
  <h4 class="quiz__form_head">Договор</h4>
  <p class="quiz__form_description">Пожалуйста, проверьте договор. Если всё верно, то переходите к следующему шагу и оплате. Если нужно что-то исправить, то вернитесь назад. Для перехода на следующий шаг пролистайте вниз страницы.</p>
  
  <div class="quiz__form_agreement">
    <img src="@/assets/img/quiz/agreement_1.webp" alt="Страница 1 договора" loading="lazy">
    <img src="@/assets/img/quiz/agreement_2.webp" alt="Страница 2 договора" loading="lazy">
    <img src="@/assets/img/quiz/agreement_3.webp" alt="Страница 3 договора" loading="lazy">
    <img src="@/assets/img/quiz/agreement_4.webp" alt="Страница 4 договора" loading="lazy">
  </div>
  
  <div class="quiz__form_checkboxes">
    <div class="form__checkbox_group" :class="{ 'error': errors.acceptTerms }">
      <el-checkbox
        v-model="formData.acceptTerms"
        @change="() => handleCheckboxChange('acceptTerms')"
        size="large"
      >
        <span class="checkbox__text">
          Я принимаю условия <a href="/offer" target="_blank" class="checkbox__link">публичной оферты</a>*
        </span>
      </el-checkbox>
      <div v-if="errors.acceptTerms" class="error text_very">
        {{ errors.acceptTerms }}
      </div>
    </div>
    
    <div class="form__checkbox_group" :class="{ 'error': errors.acceptPrivacy }">
      <el-checkbox
        v-model="formData.acceptPrivacy"
        @change="() => handleCheckboxChange('acceptPrivacy')"
        size="large"
      >
        <span class="checkbox__text">
          Я даю согласие на обработку <a href="/privacy" target="_blank" class="checkbox__link">персональных данных</a>*
        </span>
      </el-checkbox>
      <div v-if="errors.acceptPrivacy" class="error text_very">
        {{ errors.acceptPrivacy }}
      </div>
    </div>
    
    <div class="form__checkbox_group">
      <el-checkbox
        v-model="formData.acceptMarketing"
        @change="() => handleCheckboxChange('acceptMarketing')"
        size="large"
      >
        <span class="checkbox__text">
          Я даю согласие на получение рекламных рассылок и специальных предложений
        </span>
      </el-checkbox>
    </div>
  </div>
  
  <div class="quiz__form_bottom">
    <div class="quiz__form_buttons">
      <button 
        class="form__back button__second button" 
        @click="goBack"
      >
        <span><BackSVG /></span>
        <span>Назад</span>
      </button>
      <button 
        class="quiz__form_button button__black button"
        @click="goNext"
        :disabled="!isReadyForNextStep"
        :class="{ 'button__disabled': !isReadyForNextStep }"
      >
        <span>Перейти к оплате</span>
      </button>
    </div>
    
    <div class="quiz__form_hint" v-if="!isReadyForNextStep">
      <p class="text_small">Обязательно дождитесь полной загрузки формы, не закрывайте вкладку! Спасибо, что выбрали нас!</p>
    </div>
  </div>
</div>
</template>

<style lang="css" scoped>
.quiz__form_agreement {
  display: flex;
  padding: 20px 0 0;
  flex-direction: column;
  gap: 20px;
}
.quiz__form_agreement img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--border);
}
.quiz__form_checkboxes {
  display: flex;
  padding: 20px 0 0;
  flex-direction: column;
  gap: 10px;
}
.quiz__form_description {
  padding: 20px 0 0;
}
</style>