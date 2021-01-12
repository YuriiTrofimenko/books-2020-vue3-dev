import { createStore } from 'vuex'
import user from './user'
import common from './common'
import country from './country'
import city from './city'
import book from './book'
import type from './type'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user, common, country, city, book, type
  }
})
