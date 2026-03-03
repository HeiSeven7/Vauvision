import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const timeSince = (date:any) => {
  console.log(t('interval.ago'))
  var seconds = Math.floor((new Date().valueOf() - date) / 1000);
  switch (true) {
    case (seconds >= 31536000):
    return `${t('interval.years', Math.floor(seconds / 31536000))}` + ` ${t('interval.ago')}`;
    case (seconds >= 2592000):
    return `${t('interval.months', Math.floor(seconds / 2592000))}` + ` ${t('interval.ago')}`;
    case (seconds >= 86400):
    return `${t('interval.days', Math.floor(seconds / 86400))}` + ` ${t('interval.ago')}`;
    case (seconds >= 3600):
    return `${t('interval.hours', Math.floor(seconds / 3600))}` + ` ${t('interval.ago')}`;
    case (seconds >= 60):
    return `${t('interval.minutes', Math.floor(seconds / 60))}` + ` ${t('interval.ago')}`;
    default:
    return `${t('interval.seconds', Math.floor(seconds / 1))}` + ` ${t('interval.ago')}`;
  }
};
// axios.interceptors.response.use(function (response) {
//   return response
// }, function (error) {
//   console.log(error.response.data)
//   if (error.response.status === 401) {
//     // store.dispatch('logout')
//     // router.push('/auth')
//   }
//   return Promise.reject(error)
// })

export { timeSince }