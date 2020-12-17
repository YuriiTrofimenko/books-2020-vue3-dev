import City from './models/CityModel'

export default ({
  state: {
    // Локальный массив Cities
    cities: [],
    newCityId: null
  },
  mutations: {
    newCity (state, {id}) {
      state.newCityId = id
    },
    loadCities (state, payload) {
      // console.log(...payload.books)
      state.cities = payload.cities
    }
    /* editCity (state, payload) {
      const oldBook = state.myBooks.find(book => book.id === payload.id)
      const newBook = {
        id: oldBook.id,
        title: (payload.title) ? payload.title : oldBook.title,
        author: (payload.author) ? payload.author : oldBook.author,
        description: (payload.description) ? payload.description : oldBook.description,
        city: (payload.city) ? payload.city : oldBook.city,
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
    async newCity ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        let newCityData = {
          'name': payload.name,
          'countryId': payload.countryId,
          'id': null
        }
        const url = getters.baseRestApiUrl + '?controller=city&action=create'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(newCityData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            // Send mutation
            commit('newCity', {
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
    async loadCities ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        let filterCityData = {
          'startsWith': payload.startsWith,
          'countryId': payload.countryId
        }
        const url = getters.baseRestApiUrl + '?controller=city&action=filter'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(filterCityData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            const citiesArray = []
            // Get task key (id)
            response.data.forEach(city => {
              citiesArray.push(
                new City(
                  city.name,
                  city.countryId,
                  city.id
                )
              )
            })
            const payload = {
              cities: citiesArray
            }
            // Send mutation
            commit('loadCities', payload)
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
    cities (state) {
      return state.cities
    },
    newCityId (state) {
      return state.newCityId
    }
  }
})