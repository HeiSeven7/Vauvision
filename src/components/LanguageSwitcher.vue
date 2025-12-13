<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from "vue-router";
import Tr from "@/i18n/translation";

const { t, locale } = useI18n();
const supportedLocales = Tr.supportedLocales;
const router = useRouter();

const switchLanguage = async (event:any) => {
  if (event.target.previousElementSibling && event.target.previousElementSibling.value && event.target.previousElementSibling.value != null && event.target.previousElementSibling.value != 0) {
    ElMessage({
      message: localeSuccess,
      grouping: true,
      type: 'success',
    })
    const newLocale = event.target.previousElementSibling.value;
    await Tr.switchLanguage(newLocale)
    try {
      await router.replace({ params: { locale: newLocale } })
    } catch(e) {
      console.log(e)
      router.push("/")
    }
  } else if (event.target.children[0] && event.target.children[0].value && event.target.children[0].value != null && event.target.children[0].value != 0) {
    ElMessage({
      message: localeSuccess,
      grouping: true,
      type: 'success',
    })
    const newLocale = event.target.children[0].value;
    await Tr.switchLanguage(newLocale)

    try {
      await router.replace({ params: { locale: newLocale } })
    } catch(e) {
      console.log(e)
      router.push("/")
    }
  } else {
    ElMessage({
      message: formError,
      grouping: true,
      type: 'error',
    })
  }
};

interface RuleForm {
  lang: string
};

const localeSuccess:any = computed (()=>(
  `${t('elmessage.localeSuccess')}`
));

const formError:any = computed(()=>(
  `${t('elmessage.formError')}`
));

const ruleForm:any = reactive<RuleForm>({
  lang: `${t('locale.lang')}`,
});

const changeLang = reactive({
  max: 1,
});
</script>

<template>
<div class="language">
  <div class="language__dropdown">
    <el-config-provider :message="changeLang">
      <el-select 
        v-model="ruleForm.lang" 
        :placeholder="$t('locale.language')"
      >
          <el-option
            v-for="sLocale in supportedLocales"
            :key="`locale-${sLocale}`"
            :value="sLocale"
            :label="$t(`locale.${sLocale}`)"
            :selected="locale === sLocale"
            @click="switchLanguage"
          >
            <input type="hidden" :value="sLocale">
            <span>{{ $t(`locale.${sLocale}`) }}</span>
          </el-option>
      </el-select>
    </el-config-provider>
  </div>
</div>
</template>

<style scoped>
.language {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.language__icon {
  display: flex;
  align-items: center;
  gap: 12px;
}
.language__icon svg {
  color: var(--text-gray);
}
</style>

<style>
.language .el-select__placeholder {
  position: relative;
  top: 0;
  transform: none;
  color: var(--hover);
}
.language .el-select__wrapper,
.language .el-select__wrapper:hover {
  border: none;
  box-shadow: none;
  background-color: transparent;
}
.language .el-select__prefix,
.language .el-select__suffix {
  display: none;
}
</style>