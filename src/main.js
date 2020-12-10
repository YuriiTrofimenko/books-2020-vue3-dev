import { createApp } from 'vue'
// import Vuesax from 'vuesax-rtl'
// import 'vuesax-rtl/dist/vuesax.min.css'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).mount('#app')
