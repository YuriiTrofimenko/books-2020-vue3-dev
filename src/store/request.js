// import firebase from 'firebase/app'

import BookRequest from './models/RequestModel'

export default ({
  // Состояние - переменные локального хранилища данных (в оперативной памяти)
  state: {
    // массив запросов, полученных аутентифицированным пользователем
    requests: [],
    // идентификатор описания самого последнего скачанного на клиент запроса
    oldestRequestId: null,
    // полное число запросов, полученных аутентифицированным пользователем
    totalCount: 0
  },
  // Функции изменения состояния
  mutations: {
    // Добавить новый запрос на получение книги
    newRequest (
      state,
      {
        id,
        createdAt,
        bookId,
        userEmail
      }
    ) {
      // Добавление объекта запроса книги в начало массива
      state.requests.unshift({
        id,
        createdAt,
        bookId,
        userEmail
      })
    },
    // Добавление массива запросов
    loadRequests (state, payload) {
      state.requests.push(...payload.requests)
    },
    // Установка значения полного числа запросов
    loadTotalCount (state, payload) {
      state.totalCount = payload.count
    },
    // Удаление запроса
    deleteRequest (state, payload) {
      // по идентификатору запроса, подлежащему удалению,
      // найти ссылку на элемент в массиве
      const deletedRequest = state.requests.find(request => request.id === payload.id)
      // получить индекс по ссылке на элемент массива,
      // найти в массиве по индексу запрос, подлежащий удалению,
      // и удалить один элемент массива, начиная с найденного, включительно,
      // то есть тот самый объект запроса
      state.requests.splice(state.requests.indexOf(deletedRequest), 1)
    },
    // Очистка локального списка запросов
    clearRequests (state) {
      state.requests = []
    },
    // Установка идентификатора последнего скачанного описания запроса
    setOldestRequestId (state, payload) {
      state.oldestRequestId = payload
    }
  },
  // Действия, которые можно вызывать из других модулей
  actions: {
    // Создание описания запроса
    /* async requestBook ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Готовим объект данных для отправки на сервер
        let newRequestData = {
          'bookId': payload.bookId,
          'userEmail': getters.user.email,
          'id': null,
          'updatedAt': null
        }
        // Адрес добавления запроса на сервер
        const url = getters.baseRestApiUrl + '?controller=request&action=create'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(newRequestData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          // Извлечение полезной нагрузки из стандартного объекта-обертки,
          // который генерируется методом fetch
          return response.json()
        }).then(function (response) {
          // Если модель ответа содержит поле модели данных
          if (response.data) {
            // Добавляем модель данных о новом запросе в локальное состояние
            // commit('newRequest', {
            //   ...response.data
            // })
            // dispatch('loadTotalCount')
            console.log(response.data)
          } else {
            commit('setError', response.message)
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
    }, */
    // Загрузка списка запросов, полученных аутентифицированным пользователем
    async loadRequests ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const filterData = { 'userId': getters.user.id }
        // если ранее загружались запросы
        // - помещаем ИД последнего из них
        // в параметр фильтра, который сообщит бэку,
        // с какого запроса проддолжить выдачу списка запросов
        // - для постраничности или бесконечного скролла
        if (getters.oldestRequestId) {
          filterData.lastId = getters.oldestRequestId
        }
        const url = getters.baseRestApiUrl + '?controller=request&action=filter'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(filterData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            // Если очередная порция данных пришла не пустой -
            // пополняем ею массив локального состояния
            if (response.data.length > 0) {
              commit('setOldestRequestId', response.data[response.data.length - 1].id)
              const requestsArray = []
              response.data.forEach(request => {
                requestsArray.push(
                  new BookRequest(
                    request.bookId,
                    request.userEmail,
                    request.createdAt,
                    request.id
                  )
                )
              })
              const payload = {
                requests: requestsArray
              }
              commit('loadRequests', payload)
            } else {
              // Иначе - зануляем поле локального состояния -
              // идентификатор последней скачанной модели запроса на получение книги
              commit('setOldestRequestId', null)
            }
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
    // действие удаления запроса
    async deleteRequest ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      const oldId = payload.id
      try {
        const url = getters.baseRestApiUrl + `?controller=request&action=delete&id=${payload.id}`
        const requestData = {
          method: 'GET',
          mode: 'cors'
        }
        const request = new Request(url, requestData)
        return await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          console.log(response)
          if (response.status === 'ok') {
            commit('deleteRequest', {id: oldId})
          } else if (response.message) {
            commit('setError', response.message)
          } else {
            commit('setError', 'Неизвестная ошибка')
          }
        }).catch(function (e) {
          console.log(e)
        }).finally(function () {
          commit('setLoading', false)
        })
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    clearRequests ({commit}) {
      commit('clearRequests')
      commit('setOldestRequestId', null)
    },
    // Отправка запроса аутентифицированного пользователя на получение книги
    // текущему ее пользователю
    requestBook ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Отправка на сервер данных о пользователе, который просит книгу
        // (payload должен содержать bookId)
        const data = Object.assign({userEmail: getters.user.email}, payload)
        const url = getters.baseRestApiUrl + '?controller=request&action=create'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(data)
        }
        const request = new Request(url, requestData)
        fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (!response.data) {
            commit('setError', response.message)
          }
          commit('setLoading', false)
        }).catch(function (e) {
          commit('setError', e.message)
        })
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },
    // обращение на сервер для получения числа запросов,
    // полученных аутентифицированным пользователем
    async loadTotalCount ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const url = getters.baseRestApiUrl + `?controller=request&action=getCount&userId=${getters.user.id}`
        const requestData = {
          method: 'GET',
          mode: 'cors'
        }
        const request = new Request(url, requestData)
        return await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            commit('loadTotalCount', {count: response.data.totalCount})
          } else {
            commit('setError', response.message)
          }
        }).catch(function (e) {
          console.log(e)
        }).finally(function () {
          commit('setLoading', false)
        })
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    }

  },
  getters: {
    requests (state) {
      return state.requests
    },
    oldestRequestId (state) {
      return state.oldestRequestId
    },
    totalRequestCount (state) {
      return state.totalCount
    }
  }
})