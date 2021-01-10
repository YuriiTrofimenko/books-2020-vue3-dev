<template lang='pug'>
//- боковая панель фильтра и сортировки
el-drawer(title="Фильтры" v-model='state.filterBarActive' size="350px")
  el-collapse(v-model="state.activeFilterBarItems")
    el-collapse-item.filter-form__collapse-body(name='1')
      template(#title)
        .filter-form__collapse-header
          | Тип предложения
          i.header-icon.el-icon-place
      el-select(v-model='state.filter.type' clearable placeholder="выбрать тип")
        el-option(:key='index' :value='typeOption.value' :label='typeOption.text' v-for='typeOption, index in state.typeOptions')
    //- el-collapse-item(name='2')
    el-button(icon='el-icon-check' type="success" plain @click='applyFilter') Применить
//- диалоговое окно добавления новой книги (по умолчанию скрыто)
el-dialog(
  title="Добавить книгу"
  v-model="state.addBookDialogVisible"
  @closed="addBookDialogClosedHandler"
  width="350px"
)
  .add-book-dialog-body
    el-form.add-book-form(:model="state.currentBook" :rules="state.addBookFormRules" ref="state.currentBook")
      el-form-item(label="Название книги" prop="title")
        el-input(placeholder='укажите название' v-model='state.currentBook.title')
      el-form-item(label="Тип"  prop="type")
        el-select(v-model='state.currentBook.type' clearable placeholder="выбрать тип")
          el-option(:key='index' :value='typeOption.value' :label='typeOption.text' v-for='typeOption, index in state.typeOptions')
      el-form-item(label="Язык(и)" prop="language")
        el-input(placeholder='укажите язык(и) текста' v-model='state.currentBook.language')
      el-form-item(label="Автор(ы)")
        el-input(placeholder='укажите автора' v-model='state.currentBook.author')
      el-form-item(label="Ваша страна" prop="country")
        auto-complete(:options="suggestedCountries" :optionsKey="state.countryOptionsKey" @newText="countryInputChange" @itemSelected="countryItemSelected" :placeholder="'выберите страну'" :clearHandler="state.clearCountriesHandler")
      el-form-item(v-if="state.currentBook.country.name"  label="Ваш город"  prop="city")
        auto-complete(:options="suggestedCities" :optionsKey="state.cityOptionsKey" @newText="cityInputChange" @itemSelected="cityItemSelected" :placeholder="'выберите город'" :clearHandler="state.clearCitiesHandler")
      el-form-item(label="Изображение")
        file-preview(@input="onNewBookImagePreview")
      el-form-item(v-if="currentBookType === 1 || currentBookType === 2" label="Активность")
        el-checkbox(v-model="state.currentBook.active") Отображать в поиске
      el-collapse
        el-collapse-item(name='1')
          template(#title)
            | Дополнительная информация
          el-form-item(label="Описание/примечания")
            el-input(type="textarea" maxlength="512" show-word-limit placeholder='добавьте описание/примечания' v-model='state.currentBook.description')
          el-form-item(label="Номер тома/выпуска")
            el-input(placeholder='укажите номер/выпуск' v-model='state.currentBook.volumeOrIssue')
          el-form-item(label="Год издания" prop="publicationDate")
            el-input(placeholder='укажите год издания' v-model='state.currentBook.publicationDate' @input="yearInputChange")
          el-form-item(label="Издатель")
            el-input(placeholder='укажите издателя' v-model='state.currentBook.bulisher')
          el-form-item(label="Жанр")
            el-input(placeholder='укажите жанр' v-model='state.currentBook.genre')
  template(#footer)
    span.dialog-footer
      el-button(@click="state.addBookDialogVisible = false") Cancel
      el-button(type="primary" @click="addBookDialogOk") Add
//- заголовок раздела с кнопкой открытия диалога добавления новой книги
el-row(type="flex" justify="center" align="center")
  el-col(:span="12")
    h1 Мои книги
  el-col(:span="6" :offset="6" v-bind:style="{ 'align-self': 'center', 'text-align': 'right' }")
    el-tooltip(content="Добавить книгу" placement="bottom" effect="light")
      el-button(@click="state.addBookDialogVisible = true")
        i.el-icon-plus
    el-tooltip(content="Фильтр" placement="bottom" effect="light")
      el-button(icon='filter_list' @click='state.filterBarActive = !state.filterBarActive')
        span Фильтр
//- область основного содержимого - карточки описаний собственных книг
.infinite-wrapper
  el-row(type='flex' justify='center' align='middle' :gutter="15")
    el-col(:key="book.id" v-for="book in books" :lg="12" :sm="12" :xs="24")
      el-card
        el-row(type='flex' justify='start' align='middle' :gutter="5")
          el-col(:span="10" v-bind:style="{ 'text-align': 'center' }")
            el-image.card-image(v-if='book.image' :src='book.image' fit="cover")
            el-image.card-image(v-else src='' fit="cover")
              template(#error)
                div.image-slot
                  img.card-image(src="../assets/no_image.png")
          el-col(:span="14" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }")
            h3
              span {{book.title}}
              span(v-if='book.volumeOrIssue') &nbsp;({{book.volumeOrIssue}})
            h4(v-if='book.author') {{book.author}}
            h4(v-else) -
            span(v-if='book.description') {{book.description}}
            span(v-else) -
            div(v-if='book.genre')
              strong жанр:&nbsp;
              span {{book.genre}}
        el-row(justify='flex-end')
          el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-edit' @click='startBookEdit(book.id)')
          el-button(circle icon='el-icon-delete' @click='startBookDelete(book.id)')
          el-button(circle icon='el-icon-share' @click='startBookShare(book.id)')
</template>
<script>
import { computed, reactive, /* onBeforeUnmount, */ /* watch, */ onMounted, onUnmounted, getCurrentInstance } from 'vue'
import FilePreview from '../components/common/FilePreview'
import store from '../store'
import AutoComplete from '../components/common/AutoComplete'
export default {
  name: 'MyBooks',
  components: { AutoComplete, FilePreview },
  setup () {
    const app = getCurrentInstance()
    const notify = app.appContext.config.globalProperties.$notify
    const state = reactive({
      // Флаг отображения окна добавления/редактирования описания книги
      addBookDialogVisible: false,
      // Данные описания книги, которое создается или редактируется
      currentBook: {
        title: '',
        type: null,
        publisher: '',
        volumeOrIssue: '',
        author: '',
        genre: '',
        description: '',
        counterDanger: false,
        country: {
          id: null,
          name: ''
        },
        city: {
          id: null,
          countryId: null,
          name: ''
        },
        language: '',
        publicationDate: '',
        image: '',
        active: true
      },
      addBookFormRules: {
        title: [
          { required: true, message: 'Нужно указать название книги', trigger: 'blur' }
        ],
        type: [
          { required: true, message: 'Нужно выбрать тип', trigger: 'change' }
        ],
        country: [
          { required: true, message: 'Нужно указать страну Вашего расположения', trigger: 'blur' }
        ],
        city: [
          { required: true, message: 'Нужно указать город Вашего расположения', trigger: 'blur' }
        ],
        language: [
          { required: true, message: 'Нужно указать язык(и) текста', trigger: 'blur' }
        ]
      },
      countryOptionsKey: 'name',
      cityOptionsKey: 'name',
      clearCountriesHandler: false,
      clearCitiesHandler: false,
      // TODO загружать типы книг с сервера
      typeOptions: [
        {text: 'отдам', value: 1},
        {text: 'дам почитать', value: 2},
        {text: 'личная', value: 3}
      ],
      // статус отправки данных о новой/редактируемой книге на сервер
      submitStatus: '',
      // Флаг факта изменения списка книг после очередного срабатывания догрузки
      // бесконечным скроллом
      isBooksListChanged: false,
      // Флаг: все ли модели собственных книг загружены на веб-клиент?
      isInfiniteLoadingCompleted: false,
      // ИД описания книги, выбранной для редактирования
      selectedBookId: null,
      // Модель фильтрации по строке поиска и полям боковой панели
      filter: {
        search: '',
        type: null
      },
      filterBarActive: false,
      activeFilterBarItems: ['1']
    })
    // Массивы данных автодополнения для полей ввода страны и города
    // const currentBookTitle = computed(() => state.currentBook.title)
    const suggestedCountries = computed(() => store.getters.countries)
    const suggestedCities = computed(() => store.getters.cities)
    // 
    const selectedImage = computed(() => state.currentBook.image)
    const currentBookType = computed(() => state.currentBook.type)
    // 
    const books = computed(() => store.getters.myBooks)
    /* watch(books, (newValue) => {
      if (newValue.length > 0){
        state.isSuggestionsShown = true
      } else {
        state.isSuggestionsShown = false
      }
    }) */
    /* watch(state.currentBook.title, (newValue) => {
      console.log('year', newValue)
      if (newValue && newValue.length > 0){
        state.addBookFormRules['year'] = {type: 'string', required: true, pattern: '^-?\\d{4}$', message: 'Формат года издания ГГГГ или -ГГГГ (до н.э.)'}
      } else {
        delete state.addBookFormRules.year
      }
    }) */
    // обработчик события жизненного цикла компонента:
    // был примонтирован к дереву
    onMounted(() => {
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
    // пользователь выбрал страну из предложенного списка
    function countryItemSelected (selectedCountry) {
      state.currentBook.country = selectedCountry
      // срос информации о городе:
      // после выбора страны пользователь получит результаты фильтра
      // с книгами из всех городов этой страны
      state.currentBook.city = {
        id: null,
        name: ''
      }
      clearCities()
      // загрузка списка городов выбранной страны
      store.dispatch('loadCities', {
        startsWith: '',
        countryId: state.currentBook.country.id
      })
    }
    // если пользователь начал набирать название страны
    async function countryInputChange (inputText) {
      // сброс ИД выбранной страны ...
      state.currentBook.country.id = null
      state.currentBook.country.name = inputText
      // ... и сброс выбранного города 
      state.currentBook.city = {
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
    function cityItemSelected (selectedCity) {
      state.currentBook.city = selectedCity
    }
    function cityInputChange (inputText) {
      state.currentBook.city.id = null
      state.currentBook.city.name = inputText
      store.dispatch('loadCities', {
        startsWith: inputText,
        countryId: state.currentBook.country.id
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
    function yearInputChange (newValue) {
      if (newValue){
        state.addBookFormRules['publicationDate'] = {required: true, pattern: /^-?\d{4}$/, message: 'Формат года издания ГГГГ или -ГГГГ (до н.э.)', trigger: 'change'}
      } else {
        delete state.addBookFormRules.publicationDate
      }
    }
    function onNewBookImagePreview (imageBase64) {
      state.currentBook.image = imageBase64
    }
    function addBookDialogClosedHandler () {
      console.log(state.currentBook)
    }
    // обработчик клика по кнопке "Ок"
    // в диалоговом окне добавления новой книги
    async function addBookDialogOk () {
      // если названия страны и/или города - новые -
      // добавляем в БД записи о них
      if (!state.currentBook.country.id) {
        await store.dispatch('newCountry', {
          name: state.currentBook.country.name
        })
          .then(() => {
            state.currentBook.country.id = store.getters.newCountryId
            state.submitStatus = 'OK'
          })
          .catch(err => {
            state.submitStatus = err.message
          })
      }
      if (!state.currentBook.city.id) {
        await store.dispatch('newCity', {
          name: state.currentBook.city.name,
          countryId: state.currentBook.country.id
        })
          .then(() => {
            state.currentBook.city.id = store.getters.newCityId
            state.submitStatus = 'OK'
          })
          .catch(err => {
            state.submitStatus = err.message
          })
      }
      // Создание новой книги,
      // если у текущей книги отсутствует идентификатор,
      // то есть ее описание еще не было добавлено в БД
      const bookTitle = state.currentBook.title
      if (!state.selectedBookId) {
        store.dispatch('newBook', {
          title: state.currentBook.title,
          author: state.currentBook.author,
          genre: state.currentBook.genre,
          publisher: state.currentBook.publisher,
          volumeOrIssue: state.currentBook.volumeOrIssue,
          description: state.currentBook.description,
          country: state.currentBook.country.id,
          city: state.currentBook.city.id,
          type: state.currentBook.type,
          language: state.currentBook.language,
          publicationDate: state.currentBook.publicationDate,
          image: state.currentBook.image,
          active: state.currentBook.active
        })
          .then(() => {
            for (const key in state.currentBook) {
              // очистка значений всех свойств модели текущей книги
              // if (state.currentBook.hasOwnProperty(key)) {
              if (Object.prototype.hasOwnProperty.call(state.currentBook, key)) {
                state.currentBook[key] = ''
              }
              // скрытие диалога добавления новой книги
              state.addBookDialogVisible = false
            }
            // повторная инициализация свойств модели текущей книги
            // со сложными значениями
            state.currentBook.country = {
              id: null,
              name: ''
            }
            state.currentBook.city = {
              id: null,
              name: '',
              countryId: null
            }
            // уведомление пользователя об успешном добавлении
            // описания книги
            if (!store.getters.error) {
              notify({
                type: 'success',
                title: 'Действие выполнено',
                message: `Описание книги "${bookTitle}" добавлено`
              })
            } else {
              notify({
                type: 'error',
                title: 'Ошибка',
                message: `Ошибка добавления книги "${bookTitle}": ${store.getters.error}`
              })
            }
            state.submitStatus = 'OK'
          })
          .catch(err => {
            state.submitStatus = err.message
            // уведомление пользователя об успешном добавлении
            // описания книги
            notify({
              type: 'error',
              title: 'Ошибка',
              message: `Ошибка добавления книги "${bookTitle}": ${state.submitStatus}`
            })
          })
      } else {
        // Редактирование выбранной книги
        store.dispatch('editBook', {
          title: state.currentBook.title,
          author: state.currentBook.author,
          genre: state.currentBook.genre,
          publisher: state.currentBook.publisher,
          volumeOrIssue: state.currentBook.volumeOrIssue,
          description: state.currentBook.description,
          country: state.currentBook.country.id,
          city: state.currentBook.city.id,
          type: state.currentBook.type,
          language: state.currentBook.language,
          publicationDate: state.currentBook.publicationDate,
          image: state.currentBook.image,
          active: state.currentBook.active,
          id: state.selectedBookId
        })
          .then(() => {
            for (const key in state.currentBook) {
              if (Object.prototype.hasOwnProperty.call(state.currentBook, key)) {
                state.currentBook[key] = ''
              }
            }
            state.currentBook.country = {
              id: null,
              name: ''
            }
            state.currentBook.city = {
              id: null,
              name: '',
              countryId: null
            }
            if (!store.getters.error) {
              notify({
                type: 'success',
                title: 'Действие выполнено',
                message: `Описание книги "${bookTitle}" обновлено`
              })
            } else {
              notify({
                type: 'error',
                title: 'Ошибка',
                message: `Ошибка обновления книги "${bookTitle}": ${store.getters.error}`
              })
            }
            state.submitStatus = 'OK'
          })
          .catch(err => {
            state.submitStatus = err.message
            notify({
              type: 'error',
              title: 'Ошибка',
              message: `Ошибка обновления книги "${bookTitle}": ${state.submitStatus}`
            })
          })
          .finally(() => {
            state.selectedBookId = null
          })
      }
    }
    // метод для вызова каждый раз, когда нужно получить
    // очередную порцию моделей книг для заполнения сетки
    function loadMoreBooks () {
      // запоминание количества ранее загруженных книг
      const prevBooksCount = books.value.length
      // попытка получить следующую порцию моделей книг
      store.dispatch('loadMyBooks', state.filter)
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
    // Содержимое поля ввода поиска изменилось на один символ
    function onSearchInputChange () {
      resetInfiniteBookLoading()
    }
    // Обработка клика по кнопке применения фильтра
    function applyFilter () {
      resetInfiniteBookLoading()
    }
    function resetInfiniteBookLoading () {
      // очистка списка моделей книг
      store.dispatch('clearBooks')
      // вызов метода получения порции моделей книг
      // для старта процесса бесконечной загрузки с нуля
      loadMoreBooks()
    }
    return {
      state, // state
      suggestedCountries, suggestedCities, selectedImage,
      currentBookType, books, // computed
      countryItemSelected, countryInputChange,
      cityItemSelected, cityInputChange,
      yearInputChange,
      onNewBookImagePreview,
      addBookDialogClosedHandler, addBookDialogOk,
      onSearchInputChange, applyFilter // methods
    }
  }
}
</script>
<style lang="stylus" scoped>
.add-book-dialog-body
  max-height calc(100vh - 510px)
  overflow-y auto
/* img
  max-height 300px
  max-width 100% */
.preview
  max-height 300px
/* input[type=file]
  width 0px
  height 0px
  position absolute
  z-index -1
  overflow hidden
  opacity 0 */
.infinite-wrapper
  overflow scroll
  height 800px
  .card-image
    width 150px
    height 225px
</style>