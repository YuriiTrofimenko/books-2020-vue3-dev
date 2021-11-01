// import firebase from 'firebase/app'
// import Item from './models/MenuItemModel'

const MENU_ITEMS_COLLECTIONS = {
  'userMenuItems': [
    { title: 'Главная', url: '/', icon: 'mdi-home' },
    { title: 'Поиск', url: '/search', icon: 'mdi-book-search-outline' },
    { title: 'Мои книги', url: '/my-books', icon: 'mdi-format-list-bulleted' },
    { title: 'Запросы', url: '/requests', icon: 'mdi-file-send-outline' },
    { title: 'О нас', url: '/contacts', icon: 'mdi-contact-phone-outline' }
  ],
  'guestMenuItems': [
    { title: 'Главная', url: '/', icon: 'mdi-home' },
    { title: 'Поиск', url: '/search', icon: 'mdi-book-search-outline' },
    { title: 'О нас', url: '/contacts', icon: 'mdi-contact-phone-outline' }
  ]
}

export default ({
  state: {
    menuItems: []// MENU_ITEMS_COLLECTIONS['guestMenuItems']
  },
  mutations: {
    setItems (state, payload) {
      state.menuItems.length = 0
      state.menuItems.push(...MENU_ITEMS_COLLECTIONS[payload.collectionName + 'MenuItems'])
    }
  },
  actions: {
    setGuestItems ({commit}) {
      commit('setItems', {'collectionName': 'guest'})
    },
    setUserItems ({commit}) {
      commit('setItems', {'collectionName': 'user'})
    }
  },
  getters: {
    menuItems (state){
      return state.menuItems
    }
  }
})