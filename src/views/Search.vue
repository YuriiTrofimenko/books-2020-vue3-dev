<template lang='pug'>
div
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
        el-select(v-model='state.filter.typeId' clearable placeholder="выбрать тип")
          el-option(
            :key='index'
            :value='typeOption.value'
            :label='typeOption.text'
            v-for='typeOption, index in typeOptions'
          )
      //- el-collapse-item(name='3')
      el-button(icon='el-icon-check' type="success" plain @click='applyFilter') Применить
  el-row(type="flex" justify="center" align="middle")
    el-col(:span="24")
      h1 Поиск книг
  el-row#search-row(type='flex' justify='center' align='middle' :gutter="15")
    el-col(:lg="22" :sm="22" :xs="24" id="step_1" ref='searchInputRef')
      el-input(suffix-icon="search" placeholder='Поиск по названию / автору' v-model='state.filter.search' @input='onSearchInputChange')
    el-col(:lg="2" :sm="2" :xs="24" id="step_2" ref='filterButtonRef' v-bind:style="{ 'align-self': 'center', 'text-align': 'right' }")
      el-button(icon='filter_list' @click='state.filterBarActive = !state.filterBarActive')
        span Фильтр
  tour(
    :data="state.tourData"
    v-if="tourIsVisible"
    @update="tourUpdate($event)"
  )
  //- el-row.infinite-wrapper(type='flex' justify='center' align='middle' ref='scrollComponent')
  .infinite-wrapper
    el-row.books-row(type='flex' justify='center' align='middle' :gutter="15")
      el-col.book-col(:key="book.id" v-for="book in books" :lg="12" :sm="24" :xs="24")
        el-card
          el-row(type='flex' justify='start' align='middle' :gutter="5")
            el-col(:lg="8" :sm="8" :xs="24" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }" @click="() => onBookClicked(book)")
              el-image.card-image(v-if='book.image' :src='book.image' fit='cover')
              el-image.card-image(v-else src='' fit='cover')
                template(#error)
                  div.image-slot
                    img.card-image(src="../assets/no_image.png")
            el-col(:lg="16" :sm="16" :xs="24" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }")
              h3.book-card__title(@click="() => onBookClicked(book)")
                span {{book.title}}
                span(v-if='book.volumeOrIssue') &nbsp;({{book.volumeOrIssue}})
              h4(v-if='typeOptions && book.type == 1' v-bind:style="{ 'color': '#093' }") {{typeOptions.find(t => t.value === book.type).text}}
              h4(v-if='typeOptions && book.type == 2' v-bind:style="{ 'color': '#69f' }") {{typeOptions.find(t => t.value === book.type).text}}
              div(v-if='book.author')
                strong автор(ы):&nbsp;
                span {{book.author}}
              div(v-if='book.publicationDate')
                strong год:&nbsp;
                span {{book.publicationDate}}
              div(v-if='book.language')
                strong язык(и):&nbsp;
                span {{book.language}}
              div(v-if='book.genre')
                strong жанр:&nbsp;
                span {{book.genre}}
              div
                strong расположение:&nbsp;
                span {{book.country}}, {{book.city}}
              .book-card__ellipsis-description(v-if='book.description') {{book.description}}
          div
            el-row(justify='flex-end')
              el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-info' @click='showBookDetails(book.id)')
              el-button(circle icon='el-icon-question')
              el-button(circle icon='el-icon-share')
</template>
<script>
import { computed, reactive, /* onBeforeUnmount,  watch,*/ onMounted, onUnmounted, ref } from 'vue'
import store from '../store'
import AutoComplete from '../components/common/AutoComplete'
export default {
  name: 'Search',
  components: { AutoComplete },
  setup () {
    const searchTourName = 'search'
    const searchInputRef = ref(null)
    const filterButtonRef = ref(null)
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
        typeId: null
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
      activeFilterBarItems: ['1', '2'],
      tourData: {
        steps: [],
        index: localStorage.getItem(searchTourName + '-tour') ? -1 : 0,
        localStorageKey: searchTourName + '-tour'
      }
    })
    // источник данных о книгах
    const books = computed(() => store.getters.books)
    const suggestedCountries = computed(() => store.getters.countries)
    const suggestedCities = computed(() => store.getters.cities)
    const tourIsVisible = computed(() => state.tourData.index >= 0 && state.tourData.index < state.tourData.steps.length)
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
      const searchInputPosition = searchInputRef.value.$el.getBoundingClientRect()
      const filterButtonPosition = filterButtonRef.value.$el.getBoundingClientRect()
      state.tourData.steps = [{
            targetElementId: 'step_1',
            content: `Найдите книгу по названию/автору`,
            next: 'далее',
            direction: 'bottom',
            top: searchInputPosition.top + 60 + 'px',
            left: searchInputPosition.left + 'px'
          },
          {
            targetElementId: 'step_2',
            content: 'Дополнительные фильтры списка книг',
            next: 'закрыть',
            direction: 'bottom',
            top: filterButtonPosition.top + 60 + 'px',
            left: filterButtonPosition.left + 'px'
          }]
    })
    // обработчик события жизненного цикла компонента:
    // был отмонтирован от дерева
		onUnmounted(async () => {
      // удаление обработчика события прокрутки
      window.removeEventListener("scroll", handleScroll)
      // очистка списка моделей книг
      await store.dispatch('clearBooks')
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
    // обработчик клика по изображению или заголовку на карточке книги в сетке
    function onBookClicked (/* book */) {
      // установка модели выбранной книги в состояние компонента
      // state.selectedBook = book
      // установка маршрута к разделу "Мои книги" с ИД выбранной книги
      // router.push({ name: 'MyBooksBook', params: { id: book.id } })
      // вызов метода отображения детализации книги
      // без передачи ИД книги, т.к. модель выбранной книги уже есть на фронтенде
      // и установлена в состояние компонента 
      // showBookDetails()
    }
    // отображение детализации книги,
    // выбранной пользователем из списка,
    // или по ИД, указанному в адресной строке
    async function showBookDetails (/* id */) {
      // если на фронтенде информации о книге нет -
      // запрашиваем ее с сервера по ИД
      /* if (!state.selectedBook) {
        state.selectedBook =
          await store.dispatch('getBookById', { id })
      }
      if(state.selectedBook){
        console.log("state.selectedBook", state.selectedBook.image.length)
      }
      
      // отображение окна детализации книги
      state.bookDetailsDialogVisible = true */
    }
    // обработчик закрытия окна детализации книги
    function bookDitailsDialogClosedHandler () {
      // зануление модели выбранной книги в стостоянии компонента
      /* state.selectedBook = null
      // установка маршрута к разделу "Мои книги" без ИД выбранной книги
      router.push({ name: 'MyBooks' })
      //
      if (books.value.length === 0) {
        loadMoreBooks()
      } */
    }
    // Отправка запроса на книгу владельцу, если кликнута положительная кнопка диалога
    function acceptAlert () {
      // console.log(state.selectedBookId)
      store.dispatch('requestBook', {bookId: state.selectedBookId})
      state.selectedBookId = null
    }
    function tourUpdate(index) {
      state.tourData.index = index
    }
    return {
      state, // state
      books, suggestedCountries, suggestedCities, typeOptions, tourIsVisible, // computed
      /* booksInfiniteHandler, */ onSearchInputChange, countryItemSelected, countryInputChange,
      cityItemSelected, cityInputChange,
      applyFilter, showBookDetails, acceptAlert, tourUpdate,
      onBookClicked, bookDitailsDialogClosedHandler, // methods
      searchInputRef, filterButtonRef // refs
    }
  }
}
</script>

<style scoped lang="stylus">
img
  max-height 300px
  max-width 100%
.infinite-wrapper
  overflow-y scroll
  overflow-x hidden
  height 933px
  max-height 933px
  /* margin-top -1px */
  .books-row
    padding-left 7.5px
    padding-right 7.5px
    .book-col
      padding-top 7.5px !important
      padding-bottom 7.5px !important
    .card-image
      width 150px
      height 225px
    .book-card__title
      margin-top: 0
    .book-card__ellipsis-description
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
.filter-form__collapse-body
  margin 10px
  /* .filter-form__collapse-header
    margin-left 15px */
#search-row
  padding-left 5px
  padding-right 35px
  > .el-col
    padding-top 5px
    padding-bottom 5px
  /* padding 15px */
  .vs-con-input-label
    width 100% !important
    min-width 200px
    margin-right 15px
</style>