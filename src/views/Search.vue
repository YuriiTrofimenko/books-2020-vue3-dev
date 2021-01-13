<template lang='pug'>
div
  //- vs-prompt(@accept='acceptAlert' :active.sync='activeRequestPrompt')
  //-   | Hello!
  //- боковая панель фильтра и сортировки
  el-drawer(title="Фильтры" v-model='state.filterBarActive' size="350px")
    //- область схлопывающихся панелей
    el-collapse(v-model="state.activeFilterBarItems")
      //- панель фильтра по месту положения пользователя
      el-collapse-item.filter-form__collapse-body(name='1')
        template(#title)
          .filter-form__collapse-header
            | Регион
            i.header-icon.el-icon-place
        //- экземпляры пользовательского компонента - поля ввода текста с автозавершением
        //- выбор страны
        auto-complete(
          :options="suggestedCountries"
          :optionsKey="state.countryOptionsKey"
          @newText="countryInputChange"
          @itemSelected="countryItemSelected"
          placeholder="Выберите страну"
          :clearHandler="state.clearCountriesHandler"
        )
        //- выбор города
        auto-complete(
          v-if="state.filter.country.id"
          :options="suggestedCities"
          :optionsKey="state.cityOptionsKey"
          @newText="cityInputChange"
          @itemSelected="cityItemSelected"
          placeholder="Выберите город"
          :clearHandler="state.clearCitiesHandler"
        )
      //- панель фильтра по типу предложения книги
      el-collapse-item.filter-form__collapse-body(name='2')
        template(#title)
          .filter-form__collapse-header
            | Тип предложения
            i.header-icon.el-icon-place
        el-select(v-model='state.filter.type' clearable placeholder="выбрать тип")
          el-option(
            :key='index'
            :value='typeOption.value'
            :label='typeOption.text'
            v-for='typeOption, index in typeOptions'
          )
      //- el-collapse-item(name='3')
      el-button(icon='el-icon-check' type="success" plain @click='applyFilter') Применить
  el-row#search-row(type='flex' justify='center' align='middle' )
    el-col(:lg="22" :sm="12" :xs="24")
      el-input(suffix-icon="search" placeholder='Поиск по названию / автору' v-model='state.filter.search' @input='onSearchInputChange')
    el-col(:lg="2" :sm="2" :xs="24")
      el-button(icon='filter_list' @click='state.filterBarActive = !state.filterBarActive')
        span Фильтр
  //- el-row.infinite-wrapper(type='flex' justify='center' align='middle' ref='scrollComponent')
  .infinite-wrapper
    el-row(type='flex' justify='center' align='middle')
      el-col(:key="book.id" v-for="book in books" :lg="12" :sm="12" :xs="24")
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
</template>
<script>
import { computed, reactive, /* onBeforeUnmount,  watch,*/ onMounted, onUnmounted } from 'vue'
import store from '../store'
import AutoComplete from '../components/common/AutoComplete'
export default {
  name: 'Search',
  components: { AutoComplete },
  setup () {
    // Создаем ссылку, по которой можно работать с элементом-оберткой
    // области бесконечной догрузки (карточек книг)
    const state = reactive({
      // Модель фильтрации по строке поиска и полям боковой панели
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
      countryOptionsKey: 'name',
      cityOptionsKey: 'name',
      clearCountriesHandler: false,
      clearCitiesHandler: false,
      isInfiniteLoadingCompleted: false,
      filterBarActive: false,
      // идентификатор книги, выбранной для просмотра детализации,
      // для запроса на получение или для шаринга в соцсетях
      selectedBookId: null,
      // TODO загружать типы книг с сервера
      // typeOptions: [
      //   {text: 'отдам', value: 1},
      //   {text: 'дам почитать', value: 2}
      // ],
      activeFilterBarItems: ['1', '2']
    })
    // источник данных о книгах
    const books = computed(() => store.getters.books)
    const suggestedCountries = computed(() => store.getters.countries)
    const suggestedCities = computed(() => store.getters.cities)
    // eslint-disable-next-line no-unused-vars
    const typeOptions = computed(() => store.getters.searchTypes.map((item, index, types) =>
       {return {
        'text': item.name,
        'value': item.id
       }}
    )) 
    // const typeOptions = computed(() => store.getters.searchTypes)
    /* watch(() => countries.value, (newVal) => {
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
    }) */
    /* onBeforeUnmount (() => {
      console.log('beforeDestroy')
      if (state.infiniteLoadingState) {
        store.dispatch('clearBooks')
      }
    }) */
    // метод для вызова каждый раз, когда нужно получить
    // очередную порцию моделей книг для заполнения сетки
    function loadMoreBooks () {
      // запоминание количества ранее загруженных книг
      const prevBooksCount = books.value.length
      // попытка получить следующую порцию моделей книг
      store.dispatch('loadBooks', state.filter)
        .then(() => {
          // Если изменился список книг
          if (books.value.length > prevBooksCount) {
            // ничего не меняем, рассчитываем,
            // что при следующем запросе могут быть получены
            // новые книги
          } else {
            // иначе считаем, что список книг закончился,
            // и устанавливаем флаг завершения попыток получения новых книг
            state.isInfiniteLoadingCompleted = true
          }
          // state.isBooksListChanged = false
        })
        .catch(err => {
          console.log(err)
        })
    }
    // обработчик прокрутки страницы до низа
    const handleScroll = () => {
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight
          && !state.isInfiniteLoadingCompleted
          && !store.getters.loading) {
				loadMoreBooks()
			}
    }
    // обработчик события жизненного цикла компонента:
    // был примонтирован к дереву
    onMounted(() => {
      store.dispatch('loadTypes')
      // первый вызов метода получения порции моделей книг
      loadMoreBooks()
      // установка обработчика события прокрутки
			window.addEventListener("scroll", handleScroll)
    })
    // обработчик события жизненного цикла компонента:
    // был отмонтирован от дерева
		onUnmounted(() => {
      // удаление обработчика события прокрутки
      window.removeEventListener("scroll", handleScroll)
      // очистка списка моделей книг
      store.dispatch('clearBooks')
		})
    // Содержимое поля ввода поиска изменилось на один символ
    function onSearchInputChange () {
      resetInfiniteBookLoading()
    }
    // пользователь выбрал страну из предложенного списка
    function countryItemSelected (selectedCountry) {
      state.filter.country = selectedCountry
      // срос информации о городе:
      // после выбора страны пользователь получит результаты фильтра
      // с книгами из всех городов этой страны
      state.filter.city = {
        id: null,
        name: ''
      }
      clearCities()
      // загрузка списка городов выбранной страны
      store.dispatch('loadCities', {
        startsWith: '',
        countryId: state.filter.country.id
      })
    }
    // если пользователь начал набирать название страны
    async function countryInputChange (inputText) {
      console.log('1', inputText)
      // сброс ИД выбранной страны ...
      state.filter.country.id = null
      // ... и сброс выбранного города 
      state.filter.city = {
        id: null,
        name: ''
      }
      clearCities()
      store.dispatch('loadCities', {
            startsWith: '',
            countryId: null
          })
      // получение с сервера списка стран,
      // название которых начинается на подстроку из переменной text
      await store.dispatch('loadCountries', {
        startsWith: inputText
      })
        .then(() => {
          console.log('country suggestions', suggestedCountries.value)
        })
        .catch(err => {
          console.log(err)
        })
    }
    /* function clearCountries () {
      state.clearCountriesHandler = true
      state.clearCountriesHandler = false
    } */
    function cityItemSelected (selectedCity) {
      state.filter.city = selectedCity
    }
    function cityInputChange (inputText) {
      state.filter.city.id = null
      store.dispatch('loadCities', {
        startsWith: inputText,
        countryId: state.filter.country.id
      })
        .then(() => {
          console.log('city suggestions', suggestedCities.value)
        })
        .catch(err => {
          console.log(err)
        })
    }
    function clearCities () {
      state.clearCitiesHandler = true
      state.clearCitiesHandler = false
    }
    // Обработка клика по кнопке применения фильтра
    function applyFilter () {
      resetInfiniteBookLoading()
    }
    async function resetInfiniteBookLoading () {
      // очистка списка моделей книг
      await store.dispatch('clearBooks')
      // вызов метода получения порции моделей книг
      // для старта процесса бесконечной загрузки с нуля
      loadMoreBooks()
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
      books, suggestedCountries, suggestedCities, typeOptions, // computed
      /* booksInfiniteHandler, */ onSearchInputChange, countryItemSelected, countryInputChange,
      cityItemSelected, cityInputChange,
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
.filter-form__collapse-body
  margin: 10px
  /* .filter-form__collapse-header
    margin-left 15px */
#search-row
  padding 15px
  .vs-con-input-label
    width 100% !important
    min-width 200px
    margin-right 15px
</style>