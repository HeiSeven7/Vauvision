<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import Menu from "@/components/layout/Menu.vue";
// import { useRouter } from "vue-router";

// const router = useRouter();
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="partner__top">
        <h3 class="partner__head">ЧТО ТАКОЕ ПАРТНЁРСКАЯ ПРОГРАММА VAUVISION?</h3>
        <p class="partner__desc">Не нашли ответ на вопрос? Написать в поддержку.</p>
      </div>
      <div class="partner__flex">
        <div class="partner__content">
          <div class="partner__empty">
            <h5 class="partner__heading">Партнеры, зарегистрировавшиеся по вашей ссылке</h5>
            <p class="partner__description button">у вас Пока нет партнеров</p>
          </div>
          <div class="personal__registered">
            <h5 class="personal__registered_head">Финансовые транзакции</h5>
            <ul class="personal__registered_list">
              <li class="personal__registered_item personal__registered_header">
                <div class="personal__registered_cell personal__registered_type text_very">Тип транзакции</div>
                <div class="personal__registered_cell personal__registered_date text_very">Дата</div>
                <div class="personal__registered_cell personal__registered_period text_very">Период</div>
                <div class="personal__registered_cell personal__registered_status text_very">Статус</div>
                <div class="personal__registered_cell personal__registered_amount text_very">Сумма</div>
              </li>
              <li class="personal__registered_item">
                <div class="personal__registered_cell personal__registered_type">
                  <div class="personal__registered_image"><TransactionSVG /></div>
                  <span class="personal__registered_typevalue button">Выплата роялти</span>
                </div>
                <div class="personal__registered_cell personal__registered_date">
                  <span class="personal__registered_datevalue text_small">15.10.2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_period">
                  <span class="personal__registered_periodvalue text_small">Q3 2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_status">
                  <span class="personal__registered_statusvalue text_small">Завершено</span>
                </div>
                <div class="personal__registered_cell personal__registered_amount">
                  <span class="personal__registered_amountvalue text_small">55 000 ₽</span>
                </div>
              </li>
              <li class="personal__registered_item">
                <div class="personal__registered_cell personal__registered_type">
                  <div class="personal__registered_image"><TransactionSVG /></div>
                  <span class="personal__registered_typevalue button">Пополнение счета</span>
                </div>
                <div class="personal__registered_cell personal__registered_date">
                  <span class="personal__registered_datevalue text_small">10.10.2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_period">
                  <span class="personal__registered_periodvalue text_small">-</span>
                </div>
                <div class="personal__registered_cell personal__registered_status">
                  <span class="personal__registered_statusvalue text_small">Завершено</span>
                </div>
                <div class="personal__registered_cell personal__registered_amount">
                  <span class="personal__registered_amountvalue text_small">55 000 ₽</span>
                </div>
              </li>
              <li class="personal__registered_item">
                <div class="personal__registered_cell personal__registered_type">
                  <div class="personal__registered_image"><TransactionSVG /></div>
                  <span class="personal__registered_typevalue button">Выплата бонусов</span>
                </div>
                <div class="personal__registered_cell personal__registered_date">
                  <span class="personal__registered_datevalue text_small">05.10.2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_period">
                  <span class="personal__registered_periodvalue text_small">Сентябрь 2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_status">
                  <span class="personal__registered_statusvalue text_small">В обработке</span>
                </div>
                <div class="personal__registered_cell personal__registered_amount">
                  <span class="personal__registered_amountvalue text_small">55 000 ₽</span>
                </div>
              </li>
              <li class="personal__registered_item">
                <div class="personal__registered_cell personal__registered_type">
                  <div class="personal__registered_image"><TransactionSVG /></div>
                  <span class="personal__registered_typevalue button">Комиссия сервиса</span>
                </div>
                <div class="personal__registered_cell personal__registered_date">
                  <span class="personal__registered_datevalue text_small">01.10.2025</span>
                </div>
                <div class="personal__registered_cell personal__registered_period">
                  <span class="personal__registered_periodvalue text_small">-</span>
                </div>
                <div class="personal__registered_cell personal__registered_status">
                  <span class="personal__registered_statusvalue text_small">Завершено</span>
                </div>
                <div class="personal__registered_cell personal__registered_amount">
                  <span class="personal__registered_amountvalue text_small">55 000 ₽</span>
                </div>
              </li>
            </ul>
            <button class="personal__registered_load button__primary">
              <span>Загрузить еще</span>
            </button>
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
              <p class="partner__referral_desc">Зарабатывайте вместе с VAUVISION. Получайте реальные деньги за каждого вашего друга, выложевшего релиз.</p>
            </div>
            <div class="partner__referral_info">
              <p class="partner__referral_heading button">ваша реферальная ссылка</p>
              <button class="partner__conditions_button button__primary text_very"><span>Появится после принятия условий участия</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal {
  margin: 0 0 auto;
}
.partner__flex {
  display: flex;
  gap: 40px;
}
.partner__content {
  display: flex;
  width: calc(100% - 440px);
  flex: 0 0 auto;
  flex-direction: column;
  gap: 40px;
}
.partner__top,
.partner__empty {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.partner__empty {
  padding: 40px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.partner__head,
.partner__heading,
.partner__description,
.partner__conditions_head {
  text-transform: uppercase;
}
.partner__right {
  display: flex;
  flex-direction: column;
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

.personal__registered {
  display: flex;
  padding: 40px;
  flex-direction: column;
  gap: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
}
.personal__registered_head {
  text-transform: uppercase;
}
.personal__registered_list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--border);
}
.personal__registered_item {
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: center;
  background-color: var(--bg);
  gap: 20px;
}
.personal__registered_header {
  text-transform: capitalize;
  color: var(--text-gray);
}
.personal__registered_cell {
  display: flex;
  align-items: center;
  gap: 15px;
}
.personal__registered_type {
  flex: 2;
  min-width: 180px;
}
.personal__registered_date {
  flex: 1;
  min-width: 120px;
}
.personal__registered_period {
  flex: 1;
  min-width: 120px;
}
.personal__registered_status {
  flex: 1;
  min-width: 140px;
}
.personal__registered_amount {
  flex: 1;
  min-width: 120px;
  justify-content: flex-end;
  font-weight: 500;
}
.personal__registered_image {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: #F2F1EF;
  border-radius: 4px;
  overflow: hidden;
}
.personal__registered_image svg {
  width: 20px;
  height: 20px;
  object-fit: contain;
  color: var(--text);
}
.personal__registered_typevalue {
  color: var(--text);
}
.personal__registered_datevalue,
.personal__registered_periodvalue {
  color: var(--text-gray);
}
.personal__registered_statusvalue {
  display: flex;
  padding: 7px 15px;
  border-radius: 4px;
  overflow: hidden;
}
.personal__registered_amountvalue {
  color: var(--text);
}
.personal__registered_load {
  margin: 50px auto 0;
}
@media (max-width: 1439px) {
  .personal__registered_load {
    margin: 40px auto 0;
  }
}
@media (max-width: 1023px) {
  .personal__registered_header {
    display: none;
  }
  .personal__registered_item {
    flex-wrap: wrap;
    gap: 10px;
  }
  .personal__registered_type {
    width: calc(100% - 115px - 10px);
    min-width: auto;
    flex: 0 0 auto;
    order: 1;
  }
  .personal__registered_status {
    width: 115px;
    min-width: auto;
    flex: 0 0 auto;
    justify-content: flex-end;
    order: 2;
  }
  .personal__registered_date {
    min-width: auto;
    order: 3;
  }
  .personal__registered_period {
    min-width: auto;
    order: 4;
  }
  .personal__registered_amount {
    min-width: auto;
    order: 5;
  }
  .personal__registered_load {
    margin: 30px 0 0;
  }
}
@media (max-width: 767px) {
  .personal__registered {
    padding: 30px 15px;
  }
}
</style>