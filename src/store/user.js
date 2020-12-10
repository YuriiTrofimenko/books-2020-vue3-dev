import User from './models/UserModel'

export default {
  state: {
    user: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    // Logged
    loggedUser ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setUser', new User(payload.uid, payload.displayName, payload.photoURL, payload.email))
    },
    // Logout
    async logoutUser ({commit}) {
      // firebase.auth().signOut()
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