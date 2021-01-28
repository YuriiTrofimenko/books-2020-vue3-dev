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
    newTour (state, payload) {
      state.tours.push(payload.tour)
      console.log('tours', state.tours)
    },
    updateTour (state, payload) {
      const oldTour = state.tours.find(tour => tour.id === payload.id)
      const newTour = {
        id: oldTour.id,
        name: (payload.name !== undefined) ? payload.name : oldTour.name,
        index: (payload.index !== undefined) ? payload.index : oldTour.index,
        done: (payload.done !== undefined) ? payload.done : oldTour.done
      }
      Object.assign(oldTour, newTour)
      console.log('tours', state.tours)
    },
  },
  actions: {
    // получить из firebase database список моделей туров
    // (они все пройдены)
    async loadTours ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // запрос значения списка моделей туров, завернутого в оболочку
        const toursResponse =
          await firebase.database()
            .ref(getters.user.id + '/tours')
            .once('value')
        // извлечение списка из оболочки
        const tours = toursResponse.val()
        const toursArray = []
        if (tours != null) {
          Object.keys(tours).forEach(key => {
            const t = tours[key]
            toursArray.push(
              new Tour(
                t.name,
                t.index,
                t.done,
                key
              )
            )
          })
        }
        const payload = {
          tours: toursArray
        }
        // вызов изменения заполнения списка моделей туров в состоянии локального хранилища
        commit('loadTours', payload)
        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async newTour ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const newTour = new Tour(
          payload.name
        )
        // добавление в удаленное хранилище firebase database
        // нового объекта как дочернего узла tours,
        // который является дочерним узлом узла с именем-идентификатором текущего пользователя
        const tour =
          await firebase.database()
            .ref(getters.user.id + '/tours')
            .push({...newTour})
        // вызов исменения состояния локального хранилища:
        // добавить описание тура
        commit('newTour', {'tour': {
          ...newTour,
          id: tour.key
        }})

        commit('setLoading', false)
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    async updateTour ({commit, getters}, {id, changes}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        await firebase.database()
          .ref(getters.user.id + '/tours')
          .child(id)
          .update({
            ...changes
          })
        commit('updateTour', {id, ...changes})
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