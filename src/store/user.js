import firebase from 'firebase/app'
import User from './models/UserModel'

export default {
  // состояние с наблюдаемыми свойствами
  state: {
    user: null
  },
  // методы изменения состояния
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  // методы действий, вызываемые, как правило, из внешних модулей,
  // и вызывающие методы изменения состояния,
  // а также взаимодействующие с сервером (опционально)
  actions: {
    // Logged
    loggedUser ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setUser', new User(payload.uid, payload.displayName, payload.photoURL, payload.email))
    },
    // Logout
    async logoutUser ({commit}) {
      firebase.auth().signOut()
      // Send mutation null
      commit('setUser', null)
    }
  },
  getters: {
    // Return user (for get id)
    user (state) {
      return state.user
    },
    // Check User (for logged)
    checkUser (state) {
      return state.user !== null
    }
  }
}