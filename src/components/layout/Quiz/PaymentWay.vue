<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    /** URL для «Оплатить в USDT»; если нет — событие pay-usdt */
    usdtPaymentUrl?: string;
    /** URL для «Оплатить картой»; если нет — событие pay-card */
    cardPaymentUrl?: string;
    /** Заголовок блока */
    title?: string;
    /** Подзаголовок */
    subtitle?: string;
  }>(),
  {
    title: 'Способы оплаты',
    subtitle: 'Выберите удобный способ оплаты',
  }
);

const emit = defineEmits<{
  'pay-usdt': [];
  'pay-card': [];
}>();

const openUsdt = () => {
  if (props.usdtPaymentUrl) {
    window.location.href = props.usdtPaymentUrl;
    return;
  }
  emit('pay-usdt');
};

const openCard = () => {
  if (props.cardPaymentUrl) {
    window.location.href = props.cardPaymentUrl;
    return;
  }
  emit('pay-card');
};
</script>

<template>
  <div class="payment-way">
    <div class="payment-way__panel">
      <h1 class="payment-way__title">{{ title }}</h1>
      <p class="payment-way__subtitle">{{ subtitle }}</p>
      <div class="payment-way__actions">
        <button
          type="button"
          class="button button__black payment-way__btn"
          @click="openUsdt"
        >
          <span>Оплатить в USDT</span>
        </button>
        <button
          type="button"
          class="button button__black payment-way__btn"
          @click="openCard"
        >
          <span>Оплатить картой</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.payment-way {
  box-sizing: border-box;
  width: 100%;
  min-height: min(70vh, 640px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background-color: var(--bg-gray, #f4f4f4);

  &__panel {
    width: 100%;
    margin: 0 auto;
    padding: 56px 48px 64px;
    text-align: center;
    background-color: var(--bg, #fff);
    border: 1px solid var(--border, #e5e5e5);
  }

  &__title {
    margin: 0 0 12px;
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text);
  }

  &__subtitle {
    margin: 0 0 40px;
    font-size: 15px;
    line-height: 1.5;
    color: var(--text-gray);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px 20px;
  }

  &__btn {
    min-width: min(280px, 100%);
    border-radius: 0;
    padding-top: 16px;
    padding-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.06em;

    :deep(span) {
      text-transform: uppercase;
    }
  }

  @media (max-width: 767px) {
    min-height: auto;
    padding: 24px 16px;

    &__panel {
      padding: 40px 24px 48px;
    }

    &__btn {
      width: 100%;
      min-width: 0;
    }
  }
}
</style>
