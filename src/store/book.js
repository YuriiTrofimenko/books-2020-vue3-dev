// import firebase from 'firebase/app'

import Book from './models/BookModel'

export default ({
  // Состояние - переменные локального хранилища данных (в оперативной памяти)
  state: {
    // массив книг всех владельцев
    books: [],
    // массив собственных книг
    myBooks: [],
    // идентификатор самого последнего скачанного описания книги
    oldestBookId: null,
    // идентификатор самого последнего скачанного описания собственной книги
    oldestMyBookId: null,
    myTotalCount: 0
  },
  // Функции изменения состояния
  mutations: {
    // Создать описание книги
    newBook (
      state,
      {
        id,
        updatedAt,
        userId,
        userEmail,
        title,
        author,
        genre,
        publisher,
        volumeOrIssue,
        description,
        country,
        city,
        type,
        language,
        publicationDate,
        image,
        active
      }
    ) {
      // Добавление объекта книги в начало массива
      state.myBooks.unshift({
        id,
        updatedAt,
        userId,
        userEmail,
        title,
        author,
        genre,
        publisher,
        volumeOrIssue,
        description,
        country,
        city,
        type,
        language,
        publicationDate,
        image,
        active
      })
    },
    // Добавление массива книг / собственных книг в зависимости от переданной константы
    loadBooks (state, payload) {
      // console.log(...payload.books)
      // console.log('loadBooks ', payload)
      state[payload.target].push(...payload.books)
    },
    loadTotalCount (state, payload) {
      // console.log(...payload.books)
      // console.log('loadBooks ', payload)
      state[payload.target] = payload.count
    },
    // Редактирование собственной книги
    editBook (state, payload) {
      // Находим в локальном состоянии книгу с таким id, который был у нее до редактирования
      const oldBook = state.myBooks.find(book => book.id === payload.oldId)
      // Заполняем новый объект книги новыми данными
      const newBook = {
        id: payload.id,
        updatedAt: payload.updatedAt,
        userId: oldBook.userId,
        userEmail: oldBook.userEmail,
        title: (payload.title) ? payload.title : oldBook.title,
        author: (payload.author) ? payload.author : oldBook.author,
        genre: (payload.genre) ? payload.genre : oldBook.genre,
        publisher: (payload.publisher) ? payload.publisher : oldBook.publisher,
        volumeOrIssue: (payload.volumeOrIssue) ? payload.volumeOrIssue : oldBook.volumeOrIssue,
        description: (payload.description) ? payload.description : oldBook.description,
        country: (payload.country) ? payload.country : oldBook.country,
        city: (payload.city) ? payload.city : oldBook.city,
        type: (payload.type) ? payload.type : oldBook.type,
        language: (payload.language) ? payload.language : oldBook.language,
        publicationDate: (payload.publicationDate) ? payload.publicationDate : oldBook.publicationDate,
        image: (payload.image) ? payload.image : oldBook.image,
        active: payload.active
      }
      // Копируем все данные из нового объекта в старый, находящийся в локальном массиве
      Object.assign(oldBook, newBook)
    },
    // Удаление книги
    deleteBook (state, payload) {
      // по идентификатору книги, подлежащей удалению,
      // найти ссылку на элемент в массиве
      const deletedBook = state.myBooks.find(book => book.id === payload.id)
      console.log(state.myBooks)
      console.log(deletedBook)
      // получить индекс по ссылке на элемент массива,
      // найти в массиве по индексу книгу подлежащую удалению,
      // и удалить один элемент массива, начиная с найденного, включительно,
      // то есть ту самую книгу
      state.myBooks.splice(state.myBooks.indexOf(deletedBook), 1)
      console.log(state.myBooks)
    },
    clearBooks (state) {
      state.books = []
    },
    clearMyBooks (state) {
      state.myBooks = []
    },
    setOldestMyBookId (state, payload) {
      state.oldestMyBookId = payload
    },
    setOldestBookId (state, payload) {
      // console.log('state.oldestBookId = ', payload)
      state.oldestBookId = payload
    }
  },
  // Действия, которые можно вызывать и из других файлов
  actions: {
    // Создание описания книги
    async newBook ({commit, getters, dispatch}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Готовим объект данных для отправки на сервер
        let newBookData = {
          'title': payload.title,
          'author': payload.author,
          'genre': payload.genre,
          'publisher': payload.publisher,
          'volumeOrIssue': payload.volumeOrIssue,
          'description': payload.description,
          'countryId': payload.country,
          'cityId': payload.city,
          'typeId': payload.type,
          'language': payload.language,
          'publicationDate': payload.publicationDate,
          'image': payload.image,
          'active': payload.active ? 1 : 0,
          'userId': getters.user.id,
          'userEmail': getters.user.email,
          'id': null,
          'updatedAt': null
        }
        // Адрес добавления книги на сервер
        const url = getters.baseRestApiUrl + '?controller=book&action=create'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(newBookData)
        }
        const request = new Request(url, requestData)
        await fetch(request).then(function (response) {
          // Извлечение полезной нагрузки из стандартного объекта-обертки,
          // который генерируется методом fetch
          return response.json()
        }).then(function (response) {
          // Если модель ответа содержит поле модели данных
          if (response.data) {
            // Добавляем модель данных о новой книге в локальное состояние
            commit('newBook', {
              ...response.data
            })
            dispatch('loadMyTotalCount')
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
    },
    // Загрузка собственных книг пользователя
    async loadMyBooks ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const filterData = Object.assign({ 'userId': getters.user.id }, payload)
        // если ранее загружались книг
        // - помещаем ИД последней загруженной книги
        // параметр фильтра, который сообщит бэку,
        // с какой книги проддолжить зыдачу списка книг
        // - для постраничности или бесконечного скролла
        if (getters.oldestMyBookId) {
          filterData.lastId = getters.oldestMyBookId
        }
        const url = getters.baseRestApiUrl + '?controller=book&action=filter'
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
              commit('setOldestMyBookId', response.data[response.data.length - 1].id)
              response.data.forEach(myBook => {
                console.log(myBook)
              })
              const booksArray = []
              // Get task key (id)
              response.data.forEach(myBook => {
                booksArray.push(
                  new Book(
                    myBook.title,
                    myBook.author,
                    myBook.genre,
                    myBook.publisher,
                    myBook.volumeOrIssue,
                    myBook.description,
                    myBook.country,
                    myBook.city,
                    myBook.type,
                    myBook.language,
                    myBook.publicationDate,
                    myBook.image,
                    myBook.active,
                    myBook.userId,
                    myBook.userEmail,
                    myBook.updatedAt,
                    myBook.id
                  )
                )
              })
              const payload = {
                target: 'myBooks',
                books: booksArray
              }
              // Send mutation
              commit('loadBooks', payload)
            } else {
              // Иначе - зануляем поле локального состояния -
              // идентификатор последней скачанной модели книги
              commit('setOldestMyBookId', null)
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
    async loadBooks ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const filterData = Object.assign({active: 1}, payload)
        // filterData.active = 1
        // console.log('getters.oldestBookId', getters.oldestBookId)
        if (getters.oldestBookId) {
          filterData.lastId = getters.oldestBookId
        }
        const url = getters.baseRestApiUrl + '?controller=book&action=filter'
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
            if (response.data.length > 0) {
              commit('setOldestBookId', response.data[response.data.length - 1].id)
              /* response.data.forEach(myBook => {
                console.log(myBook)
              }) */
              const booksArray = []
              // Get task key (id)
              response.data.forEach(book => {
                booksArray.push(
                  new Book(
                    book.title,
                    book.author,
                    book.genre,
                    book.publisher,
                    book.volumeOrIssue,
                    book.description,
                    book.country,
                    book.city,
                    book.type,
                    book.language,
                    book.publicationDate,
                    book.image,
                    book.active,
                    book.userId,
                    book.userEmail,
                    book.updatedAt,
                    book.id
                  )
                )
              })
              const payload = {
                target: 'books',
                books: booksArray
              }
              // console.log(payload)
              // Send mutation
              commit('loadBooks', payload)
            } else {
              commit('setOldestBookId', null)
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
    async editBook ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const oldId = payload.id
        let editedBookData = {
          'title': payload.title,
          'author': payload.author,
          'genre': payload.genre,
          'publisher': payload.publisher,
          'volumeOrIssue': payload.volumeOrIssue,
          'description': payload.description,
          'countryId': payload.country,
          'cityId': payload.city,
          'typeId': payload.type,
          'language': payload.language,
          'publicationDate': payload.publicationDate,
          'image': payload.image,
          'active': payload.active ? 1 : 0,
          'userId': getters.user.id,
          'userEmail': getters.user.email,
          'id': payload.id,
          'updatedAt': null
        }
        const url = getters.baseRestApiUrl + '?controller=book&action=edit'
        const requestData = {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify(editedBookData)
        }
        const request = new Request(url, requestData)
        const response = await fetch(request)
        const responseBody = await response.json() 
        if (responseBody.data) {
          responseBody.data.oldId = oldId
          commit('editBook', {
            ...responseBody.data
          })
        } else {
          commit('setError', response.message)
        }
      } catch (e) {
        commit('setError', e.message)
        console.log(e)
      } finally {
        commit('setLoading', false)
      }
    },
    // действие удаления книги
    async deleteBook ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      const oldId = payload.id
      try {
        const url = getters.baseRestApiUrl + `?controller=book&action=delete&id=${payload.id}`
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
            console.log({id: oldId})
            commit('deleteBook', {id: oldId})
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
    clearMyBooks ({commit}) {
      commit('clearMyBooks')
      commit('setOldestMyBookId', null)
    },
    clearBooks ({commit}) {
      commit('clearBooks')
      commit('setOldestBookId', null)
    },
    /* // Запрос на получение книги
    requestBook ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        // Отправка на сервер данных о пользователе, который просит книгу
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
    }, */
    // Запрос на получение модели книги на клиент
    async getBookById ({commit, getters}, payload) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const url = getters.baseRestApiUrl + `?controller=book&action=get&id=${payload.id}`
        const requestData = {
          method: 'GET',
          mode: 'cors'
        }
        const request = new Request(url, requestData)
        const response = await fetch(request)
        const responseBody = await response.json()
        const book = responseBody.data
        if (book) {
          console.log('fetched by id book', book)
          return new Book(
            book.title,
            book.author,
            book.genre,
            book.publisher,
            book.volumeOrIssue,
            book.description,
            book.country,
            book.city,
            book.type,
            book.language,
            book.publicationDate,
            book.image,
            book.active,
            book.userId,
            book.userEmail,
            book.updatedAt,
            book.id
          )
        } else {
          commit('setError', response.message)
        }
      } catch (error) {
        commit('setLoading', false)
        commit('setError', error.message)
        throw error
      }
    },

    async loadMyTotalCount ({commit, getters}) {
      commit('clearError')
      commit('setLoading', true)
      try {
        const url = getters.baseRestApiUrl + `?controller=book&action=getMyTotalCount&userId=${getters.user.id}`
        const requestData = {
          method: 'GET',
          mode: 'cors'
        }
        const request = new Request(url, requestData)
        return await fetch(request).then(function (response) {
          return response.json()
        }).then(function (response) {
          if (response.data) {
            commit('loadTotalCount', {target: 'myTotalCount', count: response.data.totalCount})
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
    books (state) {
      return state.books
    },
    myBooks (state) {
      return state.myBooks
    },
    oldestMyBookId (state) {
      return state.oldestMyBookId
    },
    oldestBookId (state) {
      return state.oldestBookId
    },
    myTotalCount (state) {
      return state.myTotalCount
    }
  }
})