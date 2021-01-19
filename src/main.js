import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import firebase from 'firebase/app'
import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/database'
import { firebaseConfig } from './configs/firebaseConfig'
import App from './App.vue'
import router from './router'
import store from './store'

import {i18n} from './utils/i18n'
import FlagIcon from 'vue-flag-icon'

const app = createApp(App).use(store).use(router).use(ElementPlus).use(i18n).use(FlagIcon)
// активация клиентской логики firebase
firebase.initializeApp(firebaseConfig)
// начало сбора статистики использования фронтенда клиентами
firebase.analytics()
// установка обработчика события изменения состояния аутентификации
firebase.auth().onAuthStateChanged(async (user) => {
    // Если в результате попытки аутентификации появились данные о пользователе
    if (user) {
      // Запоминаем его модель в переменную локального хранилища
      await store.dispatch('loggedUser', user)
      // Переходим на раздел сайта
      const targetAddress = store.getters.targetAddress
      console.log('targetAddress main', targetAddress)
      if(targetAddress){
        router.push({ path: targetAddress.path, query: targetAddress.query })
        await store.dispatch('setTargetAddress', null)
      } else {
        router.push('/')
      }
    } else {
      // Если данные о пользователе исчезли, например, после выхода
      // из учетной записи -
      // зануляем переменную данных о текущем пользователе в локальном хранилище
      // и переходим на раздел "Home"
      store.dispatch('logoutUser')
      router.push('/')
    }
  })
app.mount('#app')
