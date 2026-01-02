<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import QuizMenu from '@/components/layout/Quiz/QuizMenu.vue';
import Quiz1 from '@/components/layout/Quiz/Quiz1.vue';
import Quiz2 from '@/components/layout/Quiz/Quiz2.vue';
import Quiz3 from '@/components/layout/Quiz/Quiz3.vue';
import Quiz4 from '@/components/layout/Quiz/Quiz4.vue';
import Quiz5 from '@/components/layout/Quiz/Quiz5.vue';
import Quiz6 from '@/components/layout/Quiz/Quiz6.vue';
import Quiz7 from '@/components/layout/Quiz/Quiz7.vue';
import Quiz8 from '@/components/layout/Quiz/Quiz8.vue';

const currentStep = ref(1);

const goToStep = (step: number) => {
  currentStep.value = step;
};

const handleFinish = () => {
  ElMessage.success('Процесс загрузки завершен!');
  // Здесь можно добавить логику завершения процесса
};
</script>

<template>
  <div class="quiz__forms">
    <QuizMenu 
      :current-step="currentStep" 
      @go-to-step="goToStep"
    />
    
    <!-- Шаг 1 -->
    <Quiz1 
      v-if="currentStep === 1"
      @go-back="goToStep(0)"
      @go-next="goToStep(2)"
    />
    
    <!-- Шаг 2 -->
    <Quiz2 
      v-if="currentStep === 2"
      @go-back="goToStep(1)"
      @go-next="goToStep(3)"
    />
    
    <!-- Шаг 3 -->
    <Quiz3 
      v-if="currentStep === 3"
      @go-back="goToStep(2)"
      @go-next="goToStep(4)"
    />
    
    <!-- Шаг 4 -->
    <Quiz4 
      v-if="currentStep === 4"
      @go-back="goToStep(3)"
      @go-next="goToStep(5)"
    />
    
    <!-- Шаг 5 -->
    <Quiz5 
      v-if="currentStep === 5"
      @go-back="goToStep(4)"
      @go-next="goToStep(6)"
    />
    
    <!-- Шаг 6 -->
    <Quiz6 
      v-if="currentStep === 6"
      @go-back="goToStep(5)"
      @go-next="goToStep(7)"
    />
    
    <!-- Шаг 7 -->
    <Quiz7 
      v-if="currentStep === 7"
      @go-back="goToStep(6)"
      @go-next="goToStep(8)"
    />
    
    <!-- Шаг 8 -->
    <Quiz8 
      v-if="currentStep === 8"
      @go-back="goToStep(7)"
      @finish="handleFinish"
    />
  </div>
</template>

<style lang="css" scoped>
.quiz__forms {
  display: flex;
  width: 100%;
  padding: 50px 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}

@media (max-width: 1919px) {
  .quiz__forms {
    padding: 40px 20px;
  }
}
@media (max-width: 1439px) {
  .quiz__forms {
    flex-direction: column;
    gap: 40px;
  }
}
@media (max-width: 767px) {
  .quiz__forms {
    border: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
}
</style>