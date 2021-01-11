// import firebase from 'firebase/app'
import Country from './models/CountryModel'

export default ({
  state: {
    // Локальный массив Countries
    countries: [],
    newCountryId: null
  },
  mutations: {
    newCountry (state, {id}) {
      console.log('newCountry', id)
      state.newCountryId = id
    },
    loadCountries (state, payload) {
      // console.log(...payload.books)
      state.countries = payload.countries
    }
    /* editCountry (state, payload) {
      const oldBook = state.myBooks.find(book => book.id === payload.id)
      const newBook = {
        id: oldBook.id,
        title: (payload.title) ? payload.title : oldBook.title,
        author: (payload.author) ? payload.author : oldBook.author,
        description: (payload.description) ? payload.description : oldBook.description,
        country: (payload.country) ? payload.country : oldBook.country,
        city: (payload.city) ? payload.city : oldBook.city,
        type: (payload.type) ? payload.type : oldBook.type,
        image: (payload.image) ? payload.image : oldBook.image,
        active: (payload.active) ? payload.active : oldBook.active
      }
      Object.assign(oldBook, newBook)
    },
    deleteBook (state, payload) {
      const deletedBook = state.myBooks.find(book => book.id === payload.id)
      state.myBooks.splice(state[payload.target].indexOf(deletedBook), 1)
    }, */
  },
  actions: {
    /* Create a new Book */
    // With BackEnd
    async newCountry ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        let newCountryData = {
          'name': payload.name,
          'id': null
        }
        const url = getters.baseRestApiUrl + '?controller=country&action=create'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(newCountryData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            // Send mutation
            commit('newCountry', {
              id: response.data.id
            })
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
    },
    // Загрузка собственных книг пользователя
    async loadCountries ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        let filterCountryData = {
          'startsWith': payload.startsWith
        }
        const url = getters.baseRestApiUrl + '?controller=country&action=filter'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(filterCountryData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            const countriesArray = []
            response.data.forEach(country => {
              countriesArray.push(
                new Country(
                  country.name,
                  country.id
                )
              )
            })
            const payload = {
              countries: countriesArray
            }
            // Send mutation
            commit('loadCountries', payload)
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
    /* async editBook ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Update data fields
        await firebase.database().ref(getters.user.id + '/books').child(id).update({
          ...changes
        })
        // Send mutation
        commit('editBook', {id, ...changes})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async deleteBook ({commit, getters}, id) {
      commit('clearError')
      commit('setLoading', true)
      try {
        await firebase.database().ref(getters.user.id + '/books').child(id).remove()
        commit('deleteBook', {id, target: 'books'})
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async clearBooks ({commit, getters}) {
      commit('setOldestBookKeyRef', null)
      commit('setCurrentBooksOwner', null)
      commit('setOwnersBooksRemain', false)
    } */
  },
  getters: {
    countries (state) {
      return state.countries
    },
    newCountryId (state) {
      return state.newCountryId
    }
  }
})