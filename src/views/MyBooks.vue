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
        el-option(:key='index' :value='typeOption.value' :label='typeOption.text' v-for='typeOption, index in typeOptions')
    //- el-collapse-item(name='2')
    el-button(icon='el-icon-check' type="success" plain @click='applyFilter') Применить
//- диалоговое окно добавления новой книги (по умолчанию скрыто)
el-dialog(
  :title="(state.selectedBookId) ? 'Изменить описание' : 'Добавить книгу'"
  v-model="state.addBookDialogVisible"
  @opened="addBookDialogOpenedHandler"
  @closed="addBookDialogClosedHandler"
  width="350px"
)
  .add-book-dialog-body
    el-form.add-book-form(:model="state.currentBook" :rules="state.addBookFormRules" ref="bookForm")
      el-form-item(label="Название книги" prop="title")
        el-input(placeholder='укажите название' v-model='state.currentBook.title')
      el-form-item(label="Тип"  prop="type")
        el-select(v-model='state.currentBook.type' clearable placeholder="выбрать тип")
          el-option(:key='index' :value='typeOption.value' :label='typeOption.text' v-for='typeOption, index in typeOptions')
      el-form-item(label="Язык(и)" prop="language")
        el-input(placeholder='укажите язык(и) текста' v-model='state.currentBook.language')
      el-form-item(label="Автор(ы)")
        el-input(placeholder='укажите автора' v-model='state.currentBook.author')
      el-form-item(label="Ваша страна" prop="country")
        auto-complete(
          :options="suggestedCountries"
          :optionsKey="state.countryOptionsKey"
          @newText="countryInputChange"
          @itemSelected="countryItemSelected"
          placeholder="выберите страну"
          :clearHandler="state.clearCountriesHandler"
          ref="countryAutoComplete"
        )
      el-form-item(v-if="state.currentBook.country.name"  label="Ваш город"  prop="city")
        auto-complete(
          :options="suggestedCities"
          :optionsKey="state.cityOptionsKey"
          @newText="cityInputChange"
          @itemSelected="cityItemSelected"
          placeholder="выберите город"
          :clearHandler="state.clearCitiesHandler"
          ref="cityAutoComplete"
        )
      el-form-item(label="Изображение")
        file-preview(
          ref="filePreviewRef"
          :initialImage="state.currentBook.image"
          @input="onNewBookImagePreview"
          :selectImageSetter="selectImageAction => state.selectImageAction = selectImageAction"
        )
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
            el-input(placeholder='укажите издателя' v-model='state.currentBook.publisher')
          el-form-item(label="Жанр")
            el-input(placeholder='укажите жанр' v-model='state.currentBook.genre')
  template(#footer)
    span.dialog-footer
      el-button(@click="addBookDialogCancel") Отмена
      el-button(type="primary" @click="addBookDialogOk") Добавить
//- диалоговое окно детальной информации о книге, выбранной из сетки
el-dialog(
  v-model="state.bookDetailsDialogVisible"
  @closed="bookDitailsDialogClosedHandler"
)
  book-details-card(
    :book="state.selectedBook"
    :startBookEdit="() => startBookEdit(state.selectedBook.id)"
    :startBookDelete="() => startBookDelete(state.selectedBook.id)"
    :startBookShare="() => startBookShare(state.selectedBook.id)"
  )
//- заголовок раздела с кнопкой открытия диалога добавления новой книги
//- и с кнопкой открытия панели фильтра
el-row(type="flex" justify="center" align="center")
  el-col(:span="12")
    h1 Мои книги
  el-col(:span="6" :offset="6" v-bind:style="{ 'align-self': 'center', 'text-align': 'right' }")
    el-tooltip(content="Добавить книгу" placement="bottom" effect="light")
      el-button(@click="startBookAdd")
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
          el-col(:span="10" v-bind:style="{ 'text-align': 'center' }" @click="() => onBookClicked(book)")
            el-image.card-image(v-if='book.image' :src='book.image' fit="cover")
            el-image.card-image(v-else src='' fit="cover")
              template(#error)
                div.image-slot
                  img.card-image(src="../assets/no_image.png")
          el-col(:span="14" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }")
            h3(@click="() => onBookClicked(book)")
              span {{book.title}}
              span(v-if='book.volumeOrIssue') &nbsp;({{book.volumeOrIssue}})
            h4(v-if='book.author') автор: {{book.author}}
            h4(v-else) автор: -
            span(v-if='book.description') {{book.description}}
            div(v-if='book.genre')
              strong жанр:&nbsp;
              span {{book.genre}}
        el-row(justify='flex-end')
          el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-edit' @click='() => startBookEdit(book.id)')
          el-button(circle icon='el-icon-delete' @click='startBookDelete(book.id)')
          el-button(circle icon='el-icon-share' @click='startBookShare(book.id)')
</template>
<script>
import { computed, reactive, /* onBeforeUnmount, */ /* watch, */ onMounted, onUnmounted, getCurrentInstance, ref } from 'vue'
import FilePreview from '../components/common/FilePreview'
import BookDetailsCard from './myBooks/BookDetailsCard'
import store from '../store'
import AutoComplete from '../components/common/AutoComplete'
export default {
  name: 'MyBooks',
  components: { AutoComplete, FilePreview, BookDetailsCard },
  setup () {
    let editedBookCountryName = ''
    let editedBookCityName = ''
    let editedBookImage = ''
    const app = getCurrentInstance()
    const notify = app.appContext.config.globalProperties.$notify
    // ссылка на форму добавления / редактирования описания книги
    // внимание! имя ссылки не должно быть равным имени компонента,
    // на экземпляр компонента эта ссылка будет ссылаться,
    // даже если имя компонента и имя ссылки записаны разными нотациями
    const bookForm = ref(null)
    const countryAutoComplete = ref(null)
    const cityAutoComplete = ref(null)
    const filePreviewRef = ref(null)
    const initialState = reactive({
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
      /* typeOptions: [
        {text: 'отдам', value: 1},
        {text: 'дам почитать', value: 2},
        {text: 'личная', value: 3}
      ], */
      // статус отправки данных о новой/редактируемой книге на сервер
      submitStatus: '',
      // Флаг отображения окна детализации книги
      bookDetailsDialogVisible: false,
      // книга, выбранная для детализации
      selectedBook: null,
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
      activeFilterBarItems: ['1'],
      selectCountryAction: null,
      selectCityAction: null,
      selectImageAction: null
    })
    const state = reactive({ ...initialState })
    // Массивы данных автодополнения для полей ввода страны и города
    // const currentBookTitle = computed(() => state.currentBook.title)
    const suggestedCountries = computed(() => store.getters.countries)
    const suggestedCities = computed(() => store.getters.cities)
    // 
    const selectedImage = computed(() => state.currentBook.image)
    const currentBookType = computed(() => state.currentBook.type)
    // 
    const books = computed(() => store.getters.myBooks)
    // eslint-disable-next-line no-unused-vars
    const typeOptions = computed(() => store.getters.types.map((item, index, types) =>
       {return {
        'text': item.name,
        'value': item.id
       }}
    ))
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
      // если запланирована принудительная установка извне названия города
      // в поле ввода с автодопонением "город"
      // перед редактированием описания книги
      if(editedBookCityName) {
        // state.selectCityAction(editedBookCityName)
        // из ссылочной оболочки получаем из свойства value ссылку на объект,
        // который вернул компонент autoComplete города;
        // вызываем метод это компонента - установка города извне
        cityAutoComplete.value.selectByText(editedBookCityName)
        editedBookCityName = ''
      }
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
    // обработчик события "модальное окно (диалог) добавления / редактирования книги" открылся
    // внимание!
    // при первом открытии окна сразу после срабатывания обработчика
    // дочерние компоненты окна скорее всего еще не созданы и не примонтированы к родителю
    function addBookDialogOpenedHandler () {
      // если методом начала редактирования книги "запланирована" инициализация
      // поля автодополнения "страна" - в локальной переменной текущего компонента
      // установлено название страны
      if(editedBookCountryName){
        setTimeout(() => {
          // state.selectCountryAction(editedBookCountryName)
          countryAutoComplete.value.selectByText(editedBookCountryName)
          editedBookCountryName = ''
          if (editedBookImage) {
            state.selectImageAction(editedBookImage)
            editedBookImage = ''
          }
        }, 1500)
      }
    }
    // обработчик клика по кнопке "Ок"
    // в диалоговом окне добавления новой книги
    async function addBookDialogOk () {
      // console.log(bookForm)
      // проверка валидности формы
      let validationResults = false
      try{
        validationResults = await bookForm.value.validate()
      } catch (ex) {
        console.log(ex)
      }
      // console.log('validationResults', validationResults)
      // если все поля валидны
      if(validationResults) {
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
              /* for (const key in state.currentBook) {
                // очистка значений всех свойств модели текущей книги
                // if (state.currentBook.hasOwnProperty(key)) {
                if (Object.prototype.hasOwnProperty.call(state.currentBook, key)) {
                  state.currentBook[key] = ''
                }
                // скрытие диалога добавления новой книги
                // state.addBookDialogVisible = false
              } */
              // повторная инициализация свойств модели текущей книги
              // со сложными значениями
              /* state.currentBook.country = {
                id: null,
                name: ''
              }
              state.currentBook.city = {
                id: null,
                name: '',
                countryId: null
              } */
              // console.log('state.currentBook', state.currentBook)
              // console.log('bookForm.value.resetFields', bookForm.value.resetFields)
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
            .finally(() => {
              // скрытие диалога добавления книги
              state.addBookDialogVisible = false
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
              /* for (const key in state.currentBook) {
                console.log('key', key)
                console.log('hasOwnProperty', Object.prototype.hasOwnProperty.call(state.currentBook, key))
                console.log('state.currentBook[key]', state.currentBook[key])
                if (Object.prototype.hasOwnProperty.call(state.currentBook, key)) {
                  state.currentBook[key] = ''
                  console.log('state.currentBook', state.currentBook)
                  console.log('state.currentBook[key]', state.currentBook[key])
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
              console.log('state.currentBook', state.currentBook)
              console.log('bookForm.value.resetFields', bookForm.value.resetFields)
              bookForm.value.resetFields() */
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
              // переключение диалога работы с книгой в режим добавления новой
              state.selectedBookId = null
              // скрытие диалога добавления книги
              state.addBookDialogVisible = false
            })
        }
      }
    }
    // 
    function addBookDialogCancel () {
      resetAddBookDialog()
      state.addBookDialogVisible = false
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
    // обработчик клика по изображению или заголовку на карточке книги в сетке
    function onBookClicked (book) {
      // установка модели выбранной книги в стостояние
      state.selectedBook = book
      // отображение окна детализации книги
      state.bookDetailsDialogVisible = true
    }
    // обработчик закрытия окна детализации книги
    function bookDitailsDialogClosedHandler () {
      // зануление модели выбранной книги в стостояние
      state.selectedBook = null
    }
    // обработчик клика кнопки открытия окна добавления / редактирования книги
    function startBookAdd () {
      resetAddBookDialog()
      state.addBookDialogVisible = true
    }
    // обработчик запуска редактирования выбранной книги
    function startBookEdit (bookId) {
      state.addBookDialogVisible = true
      resetAddBookDialog()
      state.selectedBookId = bookId
      // отсеиваем из вычисляемого списка моделей собственных книг
      // одну, которая которая соответствует идентификатору книги,
      // выбранной для редактирования
      const editedBook = books.value.find(book => book.id === bookId)
      state.currentBook.title = editedBook.title
      state.currentBook.type = editedBook.type
      state.currentBook.genre = editedBook.genre
      state.currentBook.publisher = editedBook.publisher
      state.currentBook.volumeOrIssue = editedBook.volumeOrIssue
      state.currentBook.language = editedBook.language
      state.currentBook.publicationDate = editedBook.publicationDate
      state.currentBook.author = editedBook.author
      state.currentBook.description = editedBook.description
      state.currentBook.active = editedBook.active
      // инициализация локальных переменных компонента,
      // значения из которых будут установлены в свойства состояния
      // после отображения диалога добавления/редактирования книги
      editedBookCountryName = editedBook.country
      editedBookCityName = editedBook.city
      editedBookImage = editedBook.image
      // отображение диалога добавления книги (привключенном режиме редактирования)
      // state.addBookDialogVisible = true
    }
    // обработчик запуска диалога удаления выбранной книги
    function startBookDelete (bookId) {
      console.log(startBookDelete, bookId)
    }
    // обработчик запуска панели шаринга в соцсети информации о выбранной книге
    function startBookShare (bookId) {
      console.log(startBookShare, bookId)
    }
    // 
    function resetAddBookDialog () {
      // если форма уже существует -
      // сбрасываем ее валидатор
      if (bookForm.value) {
        bookForm.value.resetFields()
      }
      // устанавливаем исходные пустые значения
      // всем свойствам модели текущей книги в состоянии компонента,
      // у которых эти свойства подключются директивой двунаправленной привязки
      state.currentBook.title = ''
      state.currentBook.type = ''
      state.currentBook.genre = ''
      state.currentBook.publisher = ''
      state.currentBook.volumeOrIssue = ''
      state.currentBook.language = ''
      state.currentBook.publicationDate = ''
      state.currentBook.author = ''
      state.currentBook.description = ''
      state.currentBook.active = true

      state.currentBook.country = {
        id: null,
        name: ''
      }
      state.currentBook.city = {
        id: null,
        countryId: null,
        name: ''
      }

      state.currentBook.image = ''

      if (filePreviewRef.value) {
        filePreviewRef.value.reset()
      }

      if (countryAutoComplete.value) {
        countryAutoComplete.value.reset()
      }

      if (cityAutoComplete.value) {
        cityAutoComplete.value.reset()
      }
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
      currentBookType, books, typeOptions, // computed
      countryItemSelected, countryInputChange,
      cityItemSelected, cityInputChange,
      yearInputChange,
      onNewBookImagePreview,
      addBookDialogOpenedHandler, addBookDialogClosedHandler, addBookDialogOk, addBookDialogCancel,
      resetAddBookDialog,
      onBookClicked, bookDitailsDialogClosedHandler,
      startBookAdd, startBookEdit, startBookDelete, startBookShare,
      onSearchInputChange, applyFilter, // methods
      bookForm, countryAutoComplete, cityAutoComplete, filePreviewRef // refs
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