<script lang="ts" setup>
import Header from "@/components/layout/Header.vue";
// import Footer from "@/components/layout/Footer.vue";
import Menu from "@/components/layout/Menu.vue";
import DownloadSVG from "@/uikit/icon/DownloadSVG.vue";
import EyeSVG from "@/uikit/icon/EyeSVG.vue";
import LinkSVG from "@/uikit/icon/LinkSVG.vue";
import WalletSVG from "@/uikit/icon/WalletSVG.vue";
import PaySVG from "@/uikit/icon/PaySVG.vue";
// import { useRouter } from "vue-router";

// const router = useRouter();
</script>

<template>
<Header></Header>
<section class="personal">
  <div class="container personal__container">
    <Menu />
    <div class="personal__block">
      <div class="personal__flex">
        <div class="personal__balance">
          <div class="personal__balance_info">
            <h3 class="personal__balance_head">Баланс и бонусы аккаунта</h3>
            <p class="personal__balance_desc">Take advantage of this incredible offer and maximize your profits.</p>
          </div>
          <div class="personal__divider"></div>
          <ul class="personal__balance_list">
            <li class="personal__balance_item">
              <div class="personal__balance_top">
                <h4 class="personal__balance_heading">Квартальный отчет</h4>
              </div>
              <button class="personal__balance_button button__red"><span><DownloadSVG/>Скачать квартальный отчет</span></button>
            </li>
            <li class="personal__balance_item">
              <div class="personal__balance_top">
                <div class="personal__balance_svg"><WalletSVG/></div><p class="personal__balance_description">Счет</p> <h4 class="personal__balance_heading">144 000 ₽</h4>
              </div>
              <button class="personal__balance_button button__primary"><span>Запросить выплаты</span></button>
            </li>
            <li class="personal__balance_item">
              <div class="personal__balance_top">
                <div class="personal__balance_svg"><PaySVG/></div><p class="personal__balance_description">Бонусы партнера</p> <h4 class="personal__balance_heading">455</h4>
              </div>
              <button class="personal__balance_button button__primary"><span>Запросить выплаты бонусов</span></button>
            </li>
          </ul>
        </div>
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
              <li class="personal__releases_item">
                <div class="personal__releases_image">
                  <img src="@/assets/img/personal/releases/releases_1.webp" alt="">
                </div>
                <div class="personal__releases_info">
                  <div class="personal__releases_top">
                    <h6 class="personal__releases_head">НаWhere Have You Been (Orchestra)</h6>
                    <p class="personal__releases_album text_very">Lune</p>
                  </div>
                  <div class="personal__releases_codes">
                    <button class="personal__releases_code"><span>UPC код: 8712</span></button>
                    <button class="personal__releases_code"><LinkSVG/><span>https://www.google.com</span></button>
                  </div>
                  <div class="personal__releases_bottom">
                    <p class="personal__releases_date text_very">10.10.2025</p>
                    <div class="personal__releases_agreements">
                      <a href="#" class="personal__releases_agreement" download=""><DownloadSVG/><span>Скачать договор</span></a>
                      <a href="#" class="personal__releases_agreement" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                    </div>
                  </div>
                </div>
              </li>
              <li class="personal__releases_item">
                <div class="personal__releases_image">
                  <img src="@/assets/img/personal/releases/releases_2.webp" alt="">
                </div>
                <div class="personal__releases_info">
                  <div class="personal__releases_top">
                    <h6 class="personal__releases_head">НаWhere Have You Been (Orchestra)</h6>
                    <p class="personal__releases_album text_very">Lune</p>
                  </div>
                  <div class="personal__releases_codes">
                    <button class="personal__releases_code"><span>UPC код: 8712</span></button>
                    <button class="personal__releases_code"><LinkSVG/><span>https://www.google.com</span></button>
                  </div>
                  <div class="personal__releases_bottom">
                    <p class="personal__releases_date text_very">10.10.2025</p>
                    <div class="personal__releases_agreements">
                      <a href="#" class="personal__releases_agreement" download=""><DownloadSVG/><span>Скачать договор</span></a>
                      <a href="#" class="personal__releases_agreement" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                    </div>
                  </div>
                </div>
              </li>
              <li class="personal__releases_item">
                <div class="personal__releases_image">
                  <img src="@/assets/img/personal/releases/releases_3.webp" alt="">
                </div>
                <div class="personal__releases_info">
                  <div class="personal__releases_top">
                    <h6 class="personal__releases_head">НаWhere Have You Been (Orchestra)</h6>
                    <p class="personal__releases_album text_very">Lune</p>
                  </div>
                  <div class="personal__releases_codes">
                    <button class="personal__releases_code"><span>UPC код: 8712</span></button>
                    <button class="personal__releases_code"><LinkSVG/><span>https://www.google.com</span></button>
                  </div>
                  <div class="personal__releases_bottom">
                    <p class="personal__releases_date text_very">10.10.2025</p>
                    <div class="personal__releases_agreements">
                      <a href="#" class="personal__releases_agreement" download=""><DownloadSVG/><span>Скачать договор</span></a>
                      <a href="#" class="personal__releases_agreement" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                    </div>
                  </div>
                </div>
              </li>
              <li class="personal__releases_item">
                <div class="personal__releases_image">
                  <img src="@/assets/img/personal/releases/releases_4.webp" alt="">
                </div>
                <div class="personal__releases_info">
                  <div class="personal__releases_top">
                    <h6 class="personal__releases_head">НаWhere Have You Been (Orchestra)</h6>
                    <p class="personal__releases_album text_very">Lune</p>
                  </div>
                  <div class="personal__releases_codes">
                    <button class="personal__releases_code"><span>UPC код: 8712</span></button>
                    <button class="personal__releases_code"><LinkSVG/><span>https://www.google.com</span></button>
                  </div>
                  <div class="personal__releases_bottom">
                    <p class="personal__releases_date text_very">10.10.2025</p>
                    <div class="personal__releases_agreements">
                      <a href="#" class="personal__releases_agreement" download=""><DownloadSVG/><span>Скачать договор</span></a>
                      <a href="#" class="personal__releases_agreement" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                    </div>
                  </div>
                </div>
              </li>
              <li class="personal__releases_item">
                <div class="personal__releases_image">
                  <img src="@/assets/img/personal/releases/releases_5.webp" alt="">
                </div>
                <div class="personal__releases_info">
                  <div class="personal__releases_top">
                    <h6 class="personal__releases_head">НаWhere Have You Been (Orchestra)</h6>
                    <p class="personal__releases_album text_very">Lune</p>
                  </div>
                  <div class="personal__releases_codes">
                    <button class="personal__releases_code"><span>UPC код: 8712</span></button>
                    <button class="personal__releases_code"><LinkSVG/><span>https://www.google.com</span></button>
                  </div>
                  <div class="personal__releases_bottom">
                    <p class="personal__releases_date text_very">10.10.2025</p>
                    <div class="personal__releases_agreements">
                      <a href="#" class="personal__releases_agreement" download=""><DownloadSVG/><span>Скачать договор</span></a>
                      <a href="#" class="personal__releases_agreement" target="_blank"><EyeSVG/><span>Открыть договор</span></a>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="personal__content">
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
            <a href="" class="personal__articles_all button">Смотреть больше</a>
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
              <a href="" class="ersonal__partners_link">
                <p class="personal__partners_heading button">Superkuper</p>
                <p class="ersonal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
              </a>
            </li>
            <li class="personal__partners_item">
              <a href="" class="ersonal__partners_link">
                <p class="personal__partners_heading button">leoneo</p>
                <p class="ersonal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
              </a>
            </li>
            <li class="personal__partners_item">
              <a href="" class="ersonal__partners_link">
                <p class="personal__partners_heading button">tat55</p>
                <p class="ersonal__partners_desc text_very">mail@yandex.ru  • 12.10.2025</p>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- <Footer></Footer> -->
</template>

<style lang="css" scoped>
.personal {
  min-height: calc(100vh - 80px);
  margin: 0 0 auto;
  background-color: var(--bg-gray);
}
.personal__block {
  display: flex;
  width: calc(100% - 280px);
  padding: 60px 0 80px 120px;
  margin: 0 0 0 auto;
  gap: 20px;
}
.personal__flex {
  display: flex;
  width: calc(100% - 440px);
  flex-direction: column;
  gap: 30px;
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
  justify-content: space-between;
  gap: 40px;
}
.personal__balance_item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}
.personal__balance_top {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}
.personal__balance_heading {
  flex: 0 0 auto;
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

.personal__content {
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
}
.personal__release_flex {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.personal__release_desc {
  max-width: 510px;
  color: var(--text-gray);
}
.personal__release_image {
  width: 315px;
  max-width: calc(100% - 510px - 20px);
  height: 100%;
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
.personal__releases_top {
  display: flex;
  padding: 0 0 16px;
  flex-direction: column;
  gap: 10px;
}
.personal__releases_head {
  text-transform: uppercase;
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
  gap: 117px;
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
}
.personal__articles_image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
.ersonal__partners_link {
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  gap: 6px;
}
.ersonal__partners_desc {
  color: var(--text-gray);
}
</style>