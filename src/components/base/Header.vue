<template lang='pug'>
el-menu(:default-active="state.activeIndex" class="el-menu-demo" mode="horizontal")
    // ссылки на разделы сайта, генерируемые циклом
    el-menu-item(
        v-for="(link, index) in linkMenu"
        :key="link.title"
        @click="state.menuShow = false"
        :index="index.toString()"
    )
      router-link( :to="`${link.url}`" ) {{ link.title }}
    el-menu-item
      el-divider(direction='vertical')
    li.lang-menu
      span(
        v-for="(lang, index) in languages"
        :key="index"
        :index="index.toString()"
        @click="setLocale(lang.localeKey)"
        :class="{ 'active-lang': i18n.getLocale() === lang.localeKey }"
      )
        span.lang-icon
          flag(:iso="lang.flagKey")
    el-menu-item
      el-divider(direction='vertical')
    // меню учетной записи, если пользователь аутентифицирован
    li.auth-menu
      span(v-if="checkUser")
        el-dropdown
          span.el-dropdown-link
            // el-avatar(:size="64" :src="userData.photo")
            img(:src="userData.photo" style="height: 32px; width: 32px; border-radius: 50%")
            i.el-icon-arrow-down.el-icon--right
          template(#dropdown='')
            el-dropdown-menu
              el-dropdown-item(disabled='') {{userData.name}}
              el-dropdown-item(disabled='') {{userData.email}}
              el-dropdown-item(divided='' @click='signOut') {{t('base.header.signOutButton')}}
      // ссылка на раздел аутентификации, если пользователь не аутентифицирован
      span(v-else)
        router-link(:to="'/google-auth'" ) {{t('base.header.signInButton')}}
</template>
<script>
import { reactive, computed, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from "vue3-i18n"
import store from '../../store'
export default {
    name: 'Header',
    setup () {
        const app = getCurrentInstance()
        const t = app.appContext.config.globalProperties.$t
        const i18n = useI18n()
        // console.log('i18n = ', i18n)
        const router = useRouter()
        const state = reactive({
            menuShow: false,
            activeIndex: "0"
        })
        const checkUser = computed(() => store.getters.checkUser)
        const userData = computed(() => store.getters.user)
        const isLoading = computed(() => store.getters.loading)
        const languages = computed(() => store.getters.languages)
        const linkMenu = computed(() =>
          (checkUser.value)
            ? [
                { title: 'Главная', url: '/', icon: 'mdi-home' },
                { title: 'Поиск', url: '/search', icon: 'mdi-book-search-outline' },
                { title: 'Мои книги', url: '/my-books', icon: 'mdi-format-list-bulleted' },
                { title: 'О нас', url: '/contacts', icon: 'mdi-contact-phone-outline' }
              ] : [
                { title: 'Главная', url: '/', icon: 'mdi-home' },
                { title: 'Поиск', url: '/search', icon: 'mdi-book-search-outline' },
                { title: 'О нас', url: '/contacts', icon: 'mdi-contact-phone-outline' }
              ]
        )
        onMounted(() => {
          store.dispatch('loadLanguages')
        })
        function signOut () {
          // Выход из учетной записи
          store.dispatch('logoutUser')
            .then(() => {
              router.push('/')
            })
        }
        function setLocale (lang) {
          i18n.setLocale(lang)
        }
        return {
            state, // состояние
            checkUser, userData, isLoading, linkMenu, languages, // вычисляемые свойства
            signOut, t, setLocale, // методы
            i18n
        }
    }
}
</script>
<style scoped lang="stylus">
.is-active
  font-weight bold
.lang-menu
  float left
  height 60px
  line-height 60px
.auth-menu
  float left
  height 60px
  line-height 60px
  font-size 14px
  a
    color #909399
    /* text-decoration none */
  img
    margin-bottom -10px
.lang-icon
  margin-left 5px
  margin-right 5px
.active-lang
  border 4px double green
</style>