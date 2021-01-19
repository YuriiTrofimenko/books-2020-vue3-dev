// import firebase from 'firebase/app'
import Language from './models/LanguageModel'

export default ({
  state: {
    // Локальный массив
    languages: [],
  },
  mutations: {

    loadLanguages (state, payload) {
      // console.log(...payload.books)
      state.languages = payload.languages
    }
    
  },
  actions: {
    // Загрузка собственных книг пользователя
    async loadLanguages ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const url = getters.baseRestApiUrl + '?controller=language&action=getAll'
        const requestData = {
          method: 'GET',
          mode: 'cors',
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            const languagesArray = []
            response.data.forEach(type => {
              languagesArray.push(
                new Language(
                  type.name,
                  type.localeKey,
                  type.flagKey,
                  type.priority,
                  type.id
                )
              )
            })
            const payload = {
              languages: languagesArray
            }
            // Send mutation
            commit('loadLanguages', payload)
          }
        }).catch(function (e) {
          console.log(e)
        })
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }
  },
  getters: {
    languages (state){
      return state.languages
    }
  }
})