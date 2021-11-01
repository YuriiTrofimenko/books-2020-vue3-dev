import { createStore } from 'vuex'
import user from './user'
import common from './common'
import country from './country'
import city from './city'
import book from './book'
import request from './request'
import type from './type'
import language from './language'
import tour from './tour'
import menuItems from './menuItems'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user, common, country, city, book, request, type, language, tour, menuItems
  }
})
