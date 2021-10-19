<template lang='pug'>
div
  //- диалоговое окно подтверждения передачи карточки книги новому пользователю,
  //- отправившему запрос на получение
  el-dialog(
    :title="'Передача книги'"
    v-model="state.transferBookDialogVisible"
    width="350px"
  )
    span.dialog-body Внимание! Карточка с описанием книги будет передана пользователю, который запросил книгу. Выполните это действие после передачи самой книги. Продолжить?
    template(#footer)
      span.dialog-footer
        el-button(@click="state.confirmTransferBookDialogVisible = false") Отмена
        el-button(@click="state.confirmDialogAction") Передать
  //- диалоговое окно подтверждения удаления записи о полученном запросе
  el-dialog(
    :title="'Удаление запроса'"
    v-model="state.deleteRequestDialogVisible"
    width="350px"
  )
    span.dialog-body Внимание! Запись о запросе книги будет удалена безвозвратно. Продолжить?
    template(#footer)
      span.dialog-footer
        el-button(@click="state.confirmDeleteRequestDialogVisible = false") Отмена
        el-button(@click="state.confirmDialogAction") Удалить
  el-row(type="flex" justify="center" align="middle"  ref='pageHeaderRef')
    el-col(:span="24")
      h1 Запросы на получение книг
  tour(
    :data="state.tourData"
    v-if="tourIsVisible"
    @update="tourUpdate($event)"
  )
  .infinite-wrapper
    el-row.request-row
      el-col.request-col(:key="request.id" v-for="request in requests" :span="24")
        el-card.box-card
          span Пользователь {{request.userEmail}} запросил книгу
          strong {{request.bookName}}
          span {{request.createdAt}}
          span
            el-row(justify='flex-end')
              el-tooltip(content='открыть карточку книги')
               el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-view' @click='showBookDetails(request.bookId)') Книга
              el-tooltip(content='передать карточку книги')
                el-button(icon='el-icon-right' @click='transferBook(request.bookId, request.userId)') Передать
              el-tooltip(content='удалить запрос')
                el-button(icon='el-icon-delete' @click='deleteRequest(request.id)') Удалить
</template>
<script>
import { computed, reactive, /* onBeforeUnmount,  watch,*/ onMounted, onUnmounted, ref, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import store from '../store'
import AutoComplete from '../components/common/AutoComplete'
export default {
  name: 'Search',
  components: { AutoComplete },
  setup () {
    const requestTourName = 'request'
    const router = useRouter()
    const route = useRoute()
    const pageHeaderRef = ref(null)
    // ссылка на главный объект приложения
    const app = getCurrentInstance()
    // ссылка на глобально доступную функцию отображния уведомлений
    const notify = app.appContext.config.globalProperties.$notify
    // Создаем ссылку, по которой можно работать с элементом-оберткой
    // области бесконечной догрузки (карточек книг)
    const state = reactive({
      confirmTransferBookDialogVisible: false,
      confirmDeleteRequestDialogVisible: false,
      confirmDialogAction: () => {},
      isInfiniteLoadingCompleted: false,
      // идентификатор книги, выбранной для просмотра детализации,
      // для запроса на получение или для шаринга в соцсетях
      selectedRequestId: null,
      tourData: {
        steps: [],
        index: localStorage.getItem(requestTourName + '-tour') ? -1 : 0,
        localStorageKey: requestTourName + '-tour'
      }
    })
    // источник данных о книгах
    const requests = computed(() => store.getters.requests)
    const tourIsVisible = computed(() => state.tourData.index >= 0 && state.tourData.index < state.tourData.steps.length)
    // метод для вызова каждый раз, когда нужно получить
    // очередную порцию моделей запрос для заполнения сетки
    function loadMoreRequests () {
      // запоминание количества ранее загруженных запросов
      const prevRequestsCount = requests.value.length
      // попытка получить следующую порцию моделей запрос
      store.dispatch('loadRequests')
        .then(() => {
          // Если локальный список запросов увеличился
          if (requests.value.length > prevRequestsCount) {
            // ничего не меняем, рассчитываем,
            // что при следующем запросе могут быть получены
            // новые запросы
          } else {
            // иначе считаем, что список запросов закончился,
            // и устанавливаем флаг завершения попыток получения новых запросов
            state.isInfiniteLoadingCompleted = true
          }
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
				loadMoreRequests()
			}
    }
    // обработчик события жизненного цикла компонента:
    // был примонтирован к дереву
    onMounted(() => {
      // первый вызов метода получения порции моделей запросов
      if (route.params.id) {
        showBookDetails(route.params.id)
      } else {
        loadMoreRequests()
      }
      store.dispatch('loadTotalRequestsCount')
      // установка обработчика события прокрутки
      window.addEventListener('scroll', handleScroll)
      const pageHeaderPosition = pageHeaderRef.value.$el.getBoundingClientRect()
      state.tourData.steps = [{
            targetElementId: 'step_1',
            content: `Свяжитесь с пользователем, запросившим книгу, по email и договоритесь о передаче`,
            next: 'далее',
            direction: 'bottom',
            top: pageHeaderPosition.top + 60 + 'px',
            left: pageHeaderPosition.left + 'px'
          },
          {
            targetElementId: 'step_2',
            content: 'После передачи книги передайте и ее карточку новому пользователю, кликнув "Передать"',
            next: 'далее',
            direction: 'bottom',
            top: pageHeaderPosition.top + 60 + 'px',
            left: pageHeaderPosition.left + 'px'
          },
          {
            targetElementId: 'step_3',
            content: 'После передачи карточки книги можно удалить запись о запросе, кликнув "Удалить"',
            next: 'закрыть',
            direction: 'bottom',
            top: pageHeaderPosition.top + 60 + 'px',
            left: pageHeaderPosition.left + 'px'
          }]
    })
    // обработчик события жизненного цикла компонента:
    // был отмонтирован от дерева
		onUnmounted(async () => {
      // удаление обработчика события прокрутки
      window.removeEventListener("scroll", handleScroll)
      // очистка списка моделей запросов
      await store.dispatch('clearRequests')
		})
    /* async function resetInfiniteRequestLoading () {
      // очистка списка моделей книг
      await store.dispatch('clearRequests')
      // вызов метода получения порции моделей книг
      // для старта процесса бесконечной загрузки с нуля
      loadMoreRequests()
    } */
    // отображение детализации запроса,
    // выбранного пользователем из списка,
    // или по ИД, указанному в адресной строке
    async function showBookDetails (bookId) {
      router.push({ name: 'MyBooksBook', params: { id: bookId } })
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
    // обработчик клика по кнопке передачи книги на карточке запроса
    function transferBook (bookId, userId) {
      // отобразить диалог подтверждения передачи карточки
      state.confirmTransferBookDialogVisible = true
      state.confirmDialogAction = () => {
        // начать передачу карточки
        store.dispatch('transferBook', { bookId, userId }).then(() => {
          notify({
            type: 'success',
            title: 'Действие выполнено',
            message: `Карточка передана новому пользователю книги.`
          })
        })
        // скрыть диалог подтверждения отправки карточки
        state.confirmTransferBookDialogVisible = false
      }
    }
    // обработчик клика по кнопке удаления запроса на карточке запроса
    function deleteRequest (requestId) {
      // отобразить диалог подтверждения передачи карточки
      state.confirmDeleteRequestDialogVisible = true
      state.confirmDialogAction = () => {
        // начать передачу карточки
        store.dispatch('deleteRequest', { requestId }).then(() => {
          notify({
            type: 'success',
            title: 'Действие выполнено',
            message: `Запрос на передачу книги удален из списка`
          })
        })
        // скрыть диалог подтверждения отправки карточки
        state.confirmDeleteRequestDialogVisible = false
      }
    }
    function tourUpdate(index) {
      state.tourData.index = index
    }
    return {
      state, // state
      requests, tourIsVisible, // computed
      showBookDetails, transferBook, deleteRequest, tourUpdate, // methods
      pageHeaderRef // refs
    }
  }
}
</script>

<style scoped lang="stylus">
img
  max-height 300px
  max-width 100%
.dialog-body
  word-break normal !important
  hyphens auto
.infinite-wrapper
  overflow-y scroll
  overflow-x hidden
  height 933px
  max-height 933px
  /* margin-top -1px */
  .request-row
    padding-left 7.5px
    padding-right 7.5px
    .request-col
      padding-top 7.5px !important
      padding-bottom 7.5px !important
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