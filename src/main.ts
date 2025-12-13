import App from './App.vue'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import router from '@/router'
import i18n from "@/i18n"
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueTelInput from 'vue-tel-input';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
};
app.use(ElementPlus).use(i18n).use(VueTelInput as any).use(router).mount('#app');