<template lang='pug'>
//- h1 Search
//-     h2 Demo Countries List
//-         ul(v-for="country in countries" :key="country.id.toString()")
//-             li {{country.name}}
div
    vs-prompt(@accept='acceptAlert' :active.sync='activeRequestPrompt')
      | Hello!
    vs-sidebar.sidebarx(parent='body' default-index='1' color='primary' spacer='' v-model='filterBarActive')
      .header-sidebar(slot='header')
        h4 Фильтры
      vs-sidebar-item(index='1' icon='place')
        vue-autosuggest(v-model="filter.country.name" :suggestions="suggestedCountries" :get-suggestion-value="getCountriesSuggestionValue" :input-props="{id:'autosuggest__input', placeholder:'страна'}" @input='countryInputChange' @selected='countryItemSelected')
          template(slot-scope='{suggestion}')
            span {{suggestion.item.name}}
      vs-sidebar-item(index='2' icon='place')
        vue-autosuggest(v-model="filter.city.name" :suggestions="suggestedCities" :get-suggestion-value="getCitiesSuggestionValue" :input-props="{id:'autosuggest__input', placeholder:'город?'}" @input='cityInputChange' @selected='cityItemSelected')
          template(slot-scope='{suggestion}')
            span {{suggestion.item.name}}
      .footer-sidebar(slot='footer')
        vs-button(icon='done' color='success' type='flat' @click='applyFilter') Применить
    vs-row#search-row
      vs-col(vs-type='flex' vs-justify='center' vs-align='center' vs-lg='11' vs-sm='6' vs-xs='12')
        vs-input(icon="search" icon-after="true" placeholder='Поиск по названию / автору' v-model='filter.search' @input='onSearchInputChange')
      vs-col(vs-type='flex' vs-justify='center' vs-align='center' vs-lg='1' vs-sm='1' vs-xs='12')
        vs-icon(icon='filter_list' @click='filterBarActive = !filterBarActive')
        span(@click='filterBarActive = !filterBarActive') Фильтр
    vs-row.infinite-wrapper
      vs-col(:key='book.id' v-for='book in books' vs-type='flex' vs-justify='center' vs-align='center' vs-lg='6' vs-sm='6' vs-xs='12')
        template
          vs-row(vs-justify='center')
            vs-col(type='flex' vs-justify='center' vs-align='center' vs-w='12')
              vs-card.cardx
                div(slot='header')
                  h3
                    | {{book.title}}
                div(slot='media')
                  img(v-if='book.image' :src='book.image')
                  img(v-if='!book.image' src='../assets/logo.png')
                div
                  span
                    | {{book.description}}
                div(slot='footer')
                  vs-row(vs-justify='flex-end')
                    vs-button(type='gradient' color='danger' icon='favorite')
                    vs-button(color='primary' icon='turned_in_not')
                    vs-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='details' @click='showBookDetails(book.id)')
      infinite-loading(@infinite='booksInfiniteHandler' force-use-infinite-wrapper='.infinite-wrapper')
</template>
<script>
// import { computed, onMounted } from "vue"
// import store from "../store"
// export default {
//     setup () {
//         const countries = computed(() => store.getters.countries)
//         onMounted(() => {
//             store.dispatch('loadCountries', {startsWith: ''})
//         })
//         return {
//             countries
//         }
//     }
// }
import InfiniteLoading from 'vue-infinite-loading'
import { VueAutosuggest } from 'vue-autosuggest'
export default {
  name: 'Search',
  components: { InfiniteLoading, VueAutosuggest },
  data () {
    return {
      isBooksListChanged: false,
      // Модель фильрации по строке поиска и полям боковой панели
      filter: {
        search: '',
        country: {
          id: null,
          name: ''
        },
        city: {
          id: null,
          name: ''
        },
        type: null
      },
      infiniteLoadingState: null,
      filterBarActive: false,
      suggestedCountries: [],
      suggestedCities: [],
      activeRequestPrompt: false,
      selectedBookId: null
    }
  },
  computed: {
    books () {
      // источник данных о книгах
      return this.$store.getters.books
    },
    countries () {
      return [
        {
          data: this.$store.getters.countries
        }
      ]
    },
    cities () {
      return [
        {
          data: this.$store.getters.cities
        }
      ]
    }
  },
  watch: {
    // Если изменился список
    books (newVal, oldVal) {
      this.isBooksListChanged = true
    },
    countries (newVal, oldVal) {
      this.suggestedCountries = newVal
      if (newVal[0].data.length === 0) {
        this.filter.country.id = null
      }
    },
    cities (newVal, oldVal) {
      this.suggestedCities = newVal
      if (newVal[0].data.length === 0) {
        this.filter.city.id = null
      }
    }
  },
  created () {
    console.log('created')
    /* this.books.length = 0
    this.$store.dispatch('clearBooks') */
  },
  beforeDestroy () {
    console.log('beforeDestroy')
    if (this.infiniteLoadingState) {
      this.$store.dispatch('clearBooks')
    }
  },
  methods: {
    booksInfiniteHandler ($state) {
      this.infiniteLoadingState = $state
      this.$store.dispatch('loadBooks', this.filter)
        .then(() => {
          if (this.isBooksListChanged) {
            console.log('$state.loaded()')
            $state.loaded()
          } else {
            console.log('$state.complete()')
            $state.complete()
          }
          this.isBooksListChanged = false
        })
        .catch(err => {
          console.log(err)
        })
    },
    // Содержимое поля ввода поиска изменилось на один символ
    onSearchInputChange () {
      if (this.infiniteLoadingState) {
        this.$store.dispatch('clearBooks')
        this.infiniteLoadingState.reset()
      }
    },
    countryItemSelected (selectedCountry) {
      this.filter.country = selectedCountry.item
      this.filter.city = {
        id: null,
        name: ''
      }
      this.$store.dispatch('loadCities', {
        startsWith: '',
        countryId: this.filter.country.id
      })
    },
    async countryInputChange (text) {
      this.filter.country.id = null
      this.filter.city = {
        id: null,
        name: ''
      }
      await this.$store.dispatch('loadCities', {
        startsWith: text,
        countryId: null
      })
      // your search method
      // now `items` will be showed in the suggestion list
      this.$store.dispatch('loadCountries', {
        startsWith: text
      })
        .then(() => {
          console.log('country suggestions', this.countries)
        })
        .catch(err => {
          console.log(err)
        })
    },
    getCountriesSuggestionValue (suggestion) {
      return suggestion.item.name
    },
    cityItemSelected (selectedCity) {
      this.filter.city = selectedCity.item
    },
    cityInputChange (text) {
      this.filter.city.id = null
      this.$store.dispatch('loadCities', {
        startsWith: text,
        countryId: this.filter.country.id
      })
        .then(() => {
          console.log('city suggestions', this.cities)
        })
        .catch(err => {
          console.log(err)
        })
    },
    getCitiesSuggestionValue (suggestion) {
      return suggestion.item.name
    },
    // Обработка клика по кнопке применения фильтра
    applyFilter () {
      if (this.infiniteLoadingState) {
        this.$store.dispatch('clearBooks')
        this.infiniteLoadingState.reset()
      }
    },
    // Отображение диалога детализации книги (НЕ РЕАЛИЗОВАНО - ВЫВЕСТИ ВСЕ ДАННЫЕ)
    showBookDetails (id) {
      this.selectedBookId = id
      this.activeRequestPrompt = true
    },
    // Отправка запроса на книгу владельцу, если кликнута положительная кнопка диалога
    acceptAlert () {
      // console.log(this.selectedBookId)
      this.$store.dispatch('requestBook', {bookId: this.selectedBookId})
      this.selectedBookId = null
    }
  }
}
</script>

<style scoped lang="stylus">
  img
    max-height 300px
    max-width 100%
  .infinite-wrapper
    overflow scroll
    height 800px
  #search-row
    padding 15px
    .vs-con-input-label
      width 100% !important
      min-width 200px
      margin-right 15px
</style>