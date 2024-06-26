export default {
    state: {
        loading: 0,
        error: null,
        baseRestApiUrl: 'http://192.168.0.135:8082/api.php',
        // baseRestApiUrl: 'https://books-as-a-gift.000webhostapp.com/api.php',
        targetAddress: null
        // baseRestApiUrl: 'https://books-as-a-gift.000webhostapp.com/api.php'
    },
    mutations: {
        setLoading (state, payload) {
          // state.loading = payload
          if (payload) {
            state.loading++
          } else {
            state.loading--
          }
        },
        setError (state, payload) {
            state.error = payload
        },
        clearError (state) {
            state.error = null
        },
        setTargetAddress (state, payload) {
            state.targetAddress = payload
        }
    },
    actions: {
        // Show loading
        setLoading ({commit}, payload) {
          commit('setLoading', payload)
        },
        // Show error
        setError ({commit}, payload) {
            commit('setError', payload)
        },
        // Clear error
        clearError ({commit}) {
            commit('clearError')
        },
        //
        setTargetAddress ({commit}, payload) {
            commit('setTargetAddress', payload)
        }
    },
    getters: {
        // Get load status
        loading (state) {
            return state.loading
        },
        // Get error message
        error (state) {
            return state.error
        },
        baseRestApiUrl (state) {
            return state.baseRestApiUrl
        },
        targetAddress (state) {
            return state.targetAddress
        }
    }
}
