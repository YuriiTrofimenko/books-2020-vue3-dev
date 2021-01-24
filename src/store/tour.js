import firebase from 'firebase/app'
import Tour from './models/TourModel'
export default {
  state: {
    tours: []
  },
  mutations: {
    loadTours (state, payload) {
      state.tours = payload.tours
    },
    doneTour (state, payload) {
      state.tours.push(payload.tour)
    }
  },
  actions: {
    async loadTours ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const toursResponse =
          await firebase.database()
            .ref(getters.user.id + '/tours')
            .once('value')
        const tours = toursResponse.val()
        const toursArray = []
        if (tours != null) {
          Object.keys(tours).forEach(key => {
            const t = tours[key]
            toursArray.push(
              new Tour(
                t.name,
                t.done,
                key
              )
            )
          })
        }
        const payload = {
          tours: toursArray
        }
        // Send mutation
        commit('loadTours', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async doneTour ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const newTour = new Tour(
          payload.name
        )
        const tour =
          await firebase.database()
            .ref(getters.user.id + '/tours')
            .push({...newTour})
        commit('doneTour', {
          ...newTour,
          id: tour.key
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
      tours (state) {
        return state.tours
      }
  }
}