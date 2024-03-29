import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Search from '../views/Search.vue'
import MyBooks from '../views/MyBooks.vue'
import Requests from '../views/Requests.vue'
import Contacts from '../views/Contacts.vue'
// import GoogleAuth from '../views/GoogleAuth.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/my-books/:id',
    name: 'MyBooksBook',
    component: MyBooks,
    // метка: переход на данный раздел требует аутентификации
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-books',
    name: 'MyBooks',
    component: MyBooks,
    // метка: переход на данный раздел требует аутентификации
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/requests',
    name: 'Requests',
    component: Requests,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: Contacts
  }/* ,
  {
    path: '/google-auth',
    name: 'GoogleAuth',
    component: GoogleAuth
  } */
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// слежение за изменением текущего маршрута на клиенте
router.beforeEach((to, from, next) => {
  // при попытке перехода на раздел to получаем из модели соответствующего маршрута
  // значение метки:
  // требует ли аутентификации переход на данный раздел
  const requiresAuth = to.matched.some(routeModel => routeModel.meta.requiresAuth)
  // из локального хранилища получает значение флага:
  // аутентифицирован ли пользователь?
  const auth = store.getters.checkUser
  // если требуется вход, но он не был осуществлен
  if (requiresAuth && !auth) {
    // если за две секунды аутентификация не будет выполнена автоматически
    setTimeout(() => {
      if (!auth) {
        // console.log('set targetAddress', to)
        store.dispatch('setTargetAddress', to)
        // перенаправляем пользователя на раздел входа в аккаунт
        // next({name: 'GoogleAuth'})
        store.dispatch('startGoogleSignIn')
        next({name: 'Home'})
      } else {
        // иначе - пропускаем пользователя на желаемый раздел
        next()
      }
    }, 2000)
  } else {
    // иначе - пропускаем пользователя на желаемый раздел
    next()
  }
})

export default router
