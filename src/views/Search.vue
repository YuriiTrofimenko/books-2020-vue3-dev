<template lang='pug'>
//- h1 Search
//-     h2 Demo Countries List
//-         ul(v-for="country in countries" :key="country.id.toString()")
//-             li {{country.name}}
div
    //- vs-prompt(@accept='acceptAlert' :active.sync='activeRequestPrompt')
    //-   | Hello!
    //- боковая панель фильтра и сортировки
    el-drawer(title="Фильтры" v-model='state.filterBarActive')
      el-collapse
        el-collapse-item(name='1')
          template(#title)
            | Страна
            i place
          vue-autosuggest(v-model="filter.country.name" :suggestions="suggestedCountries" :get-suggestion-value="getCountriesSuggestionValue" :input-props="{id:'autosuggest__input', placeholder:'страна'}" @input='countryInputChange' @selected='countryItemSelected')
            template(slot-scope='{suggestion}')
              span {{suggestion.item.name}}
        el-collapse-item(name='2')
          vue-autosuggest(v-model="state.filter.city.name" :suggestions="state.suggestedCities" :get-suggestion-value="getCitiesSuggestionValue" :input-props="{id:'autosuggest__input', placeholder:'город?'}" @input='cityInputChange' @selected='cityItemSelected')
            template(slot-scope='{suggestion}')
              span {{suggestion.item.name}}
        el-button(icon='el-icon-check' type="success" plain @click='applyFilter') Применить
    el-row#search-row(type='flex' justify='center' align='middle' )
      el-col(:lg="11" :sm="6" :xs="12")
        el-input(suffix-icon="search" placeholder='Поиск по названию / автору' v-model='state.filter.search' @input='onSearchInputChange')
      el-col(:lg="1" :sm="1" :xs="12")
        el-button(icon='filter_list' @click='state.filterBarActive = !state.filterBarActive')
          span(@click='state.filterBarActive = !state.filterBarActive') Фильтр
    el-row.infinite-wrapper(type='flex' justify='center' align='middle' ref='scrollComponent')
      el-col(:key="book.id" v-for="book in books" :lg="6" :sm="6" :xs="12")
        el-card
          h3
            | {{book.title}}
          div
            img(v-if='book.image' :src='book.image')
            img(v-else src='../assets/logo.png')
          div
            span
              | {{book.description}}
          div
            el-row(justify='flex-end')
              el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-info' @click='showBookDetails(book.id)')
              el-button(circle icon='el-icon-question')
              el-button(circle icon='el-icon-share')
    //- infinite-loading(@infinite="booksInfiniteHandler" force-use-infinite-wrapper='.infinite-wrapper' slot="append")
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
// import InfiniteLoading from 'vue-infinite-loading'
import { VueAutosuggest } from 'vue-autosuggest'
import { computed, reactive, /* onBeforeUnmount, */ watch, ref, onMounted, onUnmounted } from 'vue'
import store from '../store'
export default {
  name: 'Search',
  components: { /* InfiniteLoading, */ VueAutosuggest },
  setup () {
    // Создаем ссылку, по которой можно работать с элементом-оберткой
    // области бесконечной догрузки (карточек книг)
    const scrollComponent = ref(null)
    const state = reactive({
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
      // infiniteLoadingState: null,
      isInfiniteLoadingCompleted: false,
      filterBarActive: false,
      suggestedCountries: [],
      suggestedCities: [],
      // activeRequestPrompt: false,
      selectedBookId: null
    })
    // источник данных о книгах
    const books = computed(() => store.getters.books)
    const countries = computed(() => [
        {
          data: store.getters.countries
        }
      ])
    const cities = computed(() => [
        {
          data: store.getters.cities
        }
      ])
    // Если изменился список
    console.log(scrollComponent)
    watch(scrollComponent, (scrollComponentRef) => {
      console.log('watch', scrollComponentRef.value)
      state.isBooksListChanged = true
    })
    watch(() => countries.value, (newVal) => {
      state.suggestedCountries = newVal
      if (newVal[0].data.length === 0) {
        state.filter.country.id = null
      }
    })
    watch(() => cities.value, (newVal) => {
      state.suggestedCities = newVal
      if (newVal[0].data.length === 0) {
        state.filter.city.id = null
      }
    })
    /* onBeforeUnmount (() => {
      console.log('beforeDestroy')
      if (state.infiniteLoadingState) {
        store.dispatch('clearBooks')
      }
    })
    function booksInfiniteHandler ($state) {
      state.infiniteLoadingState = $state
      store.dispatch('loadBooks', state.filter)
        .then(() => {
          if (state.isBooksListChanged) {
            console.log('$state.loaded()')
            $state.loaded()
          } else {
            console.log('$state.complete()')
            $state.complete()
          }
          state.isBooksListChanged = false
        })
        .catch(err => {
          console.log(err)
        })
    } */
    function loadMoreBooks () {
      store.dispatch('loadBooks', state.filter)
        .then(() => {
          if (state.isBooksListChanged) {
            console.log('$state.loaded()')
            // $state.loaded()
          } else {
            console.log('$state.complete()')
            state.isInfiniteLoadingCompleted = true
            // $state.complete()
          }
          state.isBooksListChanged = false
        })
        .catch(err => {
          console.log(err)
        })
    }
    const handleScroll = () => {
			// let element = scrollComponent.value
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight
          && !state.isInfiniteLoadingCompleted) {
				loadMoreBooks()
			}
		}
    onMounted(() => {
			window.addEventListener("scroll", handleScroll)
		})
		onUnmounted(() => {
			window.removeEventListener("scroll", handleScroll)
		})
    // Содержимое поля ввода поиска изменилось на один символ
    function onSearchInputChange () {
      store.dispatch('clearBooks')
      /* if (state.infiniteLoadingState) {
        store.dispatch('clearBooks')
        // TODO infinite-loading -> custom infinite loading
        // state.infiniteLoadingState.reset()
      } */
    }
    // пользователь выбрал страну из предложенного списка
    function countryItemSelected (selectedCountry) {
      state.filter.country = selectedCountry.item
      // срос информации о городе:
      // после выбора страны пользователь получит результаты фильтра
      // с книгами из всех городов этой страны
      state.filter.city = {
        id: null,
        name: ''
      }
      // загрузка списка городов выбранной страны
      store.dispatch('loadCities', {
        startsWith: '',
        countryId: state.filter.country.id
      })
    }
    // если пользователь начал набирать название страны вручную -
    async function countryInputChange (text) {
      // - сброс ИД выбранной страны ...
      state.filter.country.id = null
      // ... и сброс выбранного города 
      state.filter.city = {
        id: null,
        name: ''
      }
      await store.dispatch('loadCities', {
        startsWith: text,
        countryId: null
      })
      // получение с сервера списка стран,
      // название которых начинается на подстроку из переменной text
      store.dispatch('loadCountries', {
        startsWith: text
      })
        .then(() => {
          console.log('country suggestions', countries.value)
        })
        .catch(err => {
          console.log(err)
        })
    }
    function getCountriesSuggestionValue (suggestion) {
      return suggestion.item.name
    }
    function cityItemSelected (selectedCity) {
      state.filter.city = selectedCity.item
    }
    function cityInputChange (text) {
      state.filter.city.id = null
      store.dispatch('loadCities', {
        startsWith: text,
        countryId: state.filter.country.id
      })
        .then(() => {
          console.log('city suggestions', cities.value)
        })
        .catch(err => {
          console.log(err)
        })
    }
    function getCitiesSuggestionValue (suggestion) {
      return suggestion.item.name
    }
    // Обработка клика по кнопке применения фильтра
    function applyFilter () {
      // TODO infinite-loading -> custom infinite loading
      store.dispatch('clearBooks')
      /* if (state.infiniteLoadingState) {
        store.dispatch('clearBooks')
        state.infiniteLoadingState.reset()
      } */
    }
    // Отображение диалога детализации книги (НЕ РЕАЛИЗОВАНО - ВЫВЕСТИ ВСЕ ДАННЫЕ)
    function showBookDetails (id) {
      state.selectedBookId = id
      state.activeRequestPrompt = true
    }
    // Отправка запроса на книгу владельцу, если кликнута положительная кнопка диалога
    function acceptAlert () {
      // console.log(state.selectedBookId)
      store.dispatch('requestBook', {bookId: state.selectedBookId})
      state.selectedBookId = null
    }
    return {
      state, // state
      books, countries, cities, // computed
      /* booksInfiniteHandler, */ onSearchInputChange, countryItemSelected, countryInputChange,
      getCountriesSuggestionValue,
      cityItemSelected, cityInputChange, getCitiesSuggestionValue,
      applyFilter, showBookDetails, acceptAlert // methods
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