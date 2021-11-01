import firebase from 'firebase/app'
import router from '../router/index'
import User from './models/UserModel'
// const demoUser = new User('pJXqEFAmUSR3EEvznLL3PO8HJpm1', 'Yurii Trofimenko', '', 'tyaamariupol@gmail.com')
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
    async startGoogleSignIn ({getters, dispatch}) {
      if (!getters.checkUser.value) {
        const provider = new firebase.auth.GoogleAuthProvider()
        provider.addScope('profile')
        provider.addScope('email')
        provider.addScope('openid')
        try {
          firebase.auth().signInWithPopup(provider)
          // await firebase.auth().signInWithRedirect(provider)
        } catch (ex) {
          console.log(ex)
          alert('Auth Error. Allow Pop-ups in Your Browser')
        }
      } else {
        const targetAddress = getters.targetAddress
        console.log('targetAddress', targetAddress)
        if(targetAddress){
          router.push({ path: targetAddress.path, query: targetAddress.query })
          await dispatch('setTargetAddress', null)
        } else {
          router.push('/')
        }
      }
    },
    // Logged
    loggedUser ({commit}, payload) {
      // Send mutation new uid used helped Class
      commit('setUser', new User(payload.uid, payload.displayName, payload.photoURL, payload.email))
    },
    unloggedUser (/* { commit } */) {
      // router.push('/')
      window.location.reload()
      // commit('setUser', null)
    },
    // Logout
    logoutUser ({ dispatch }) {
      // commit('setUser', null)
      firebase.auth().signOut().then(() => dispatch('unloggedUser'))
    }
  },
  getters: {
    // Return user (for get id)
    user (state) {
      return state.user
    },
    // Check User (for logged)
    checkUser (state) {
      return Boolean(state.user)
    }
  }
}