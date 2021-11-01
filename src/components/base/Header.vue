<template lang='pug'>
el-menu(:default-active="state.activeLink" class="el-menu-demo" mode="horizontal")
    // ссылки на разделы сайта, генерируемые циклом
    el-menu-item(
        v-for="(link, index) in menuItems"
        :key="link.title"
        @click="navigate(link.url)"
        :index="link.url"
    )
      router-link( :to="`${link.url}`" ) {{ link.title }}
    .el-menu-item-custom
      el-divider(direction='vertical')
    li.lang-menu
      span(
        v-for="(lang, index) in languages"
        :key="index"
        @click="setLocale(lang.localeKey)"
        :class="{ 'active-lang': i18n.getLocale() === lang.localeKey }"
      )
        span.lang-icon
          flag(:iso="lang.flagKey")
    .el-menu-item-custom
      el-divider(direction='vertical')
    // меню учетной записи, если пользователь аутентифицирован
    li.auth-menu(@click="toggleAuthMenuVisibility()")
      span(v-if="checkUser")
        el-dropdown
          span.el-dropdown-link
            // el-avatar(:size="64" :src="userData.photo")
            img(:src="userData.photo" style="height: 32px; width: 32px; border-radius: 50%")
            i.el-icon-arrow-down.el-icon--right
          template(#dropdown='')
            el-dropdown-menu
              el-dropdown-item(disabled='' key='name') {{userData.name}}
              el-dropdown-item(disabled='' key='email') {{userData.email}}
              el-dropdown-item(divided='' key='out' @click='signOut') {{t('base.header.signOutButton')}}
      // ссылка на раздел аутентификации, если пользователь не аутентифицирован
      span.auth-menu__signin(v-else)
        a(@click="showGoogleSignIn()") {{t('base.header.signInButton')}}
        // router-link(:to="'/google-auth'" ) {{t('base.header.signInButton')}}
</template>
<script>
import { reactive, computed, getCurrentInstance, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
        const route = useRoute()
        const state = reactive({
            menuShow: false,
            activeLink: null,
            menuItems: []
        })
        const checkUser = computed(() => store.getters.checkUser)
        const userData = computed(() => store.getters.user)
        const isLoading = computed(() => store.getters.loading)
        const languages = computed(() => store.getters.languages)
        const menuItems = computed(() => store.getters.menuItems)
        onMounted(async () => {
          console.log('Route onMounted: ' + route.path)
          state.activeLink = route.path
        })
        watch(
          () => route.path,
          async path => {
            console.log('Route watch: ' + path)
            state.activeLink = path
          }
        )
        function signOut () {
          const dropdownPopper = document.querySelector('.el-dropdown__popper')
          dropdownPopper.style.display = 'none'
          // router.push('/')
          // Выход из учетной записи
          store.dispatch('logoutUser')
        }
        function setLocale (lang) {
          i18n.setLocale(lang)
        }
        function navigate (url) {
          state.menuShow = false
          router.push(url)
        }
        function toggleAuthMenuVisibility () {
          const dropdownPopper = document.querySelector('.el-dropdown__popper')
          if (dropdownPopper) {
            dropdownPopper.style.display = 'block'
            document.addEventListener("click", (evt) => {
              const authMenuElement = document.querySelector('.auth-menu')
              let targetElement = evt.target // clicked element
              do {
                console.log(targetElement, authMenuElement, targetElement === authMenuElement)
                if (targetElement === authMenuElement) {
                    // This is a click inside. Do nothing, just return.
                    return
                }
                // Go up the DOM
                  targetElement = targetElement.parentNode;
              } while (targetElement)
              // This is a click outside.
              dropdownPopper.style.display = 'none'
            })
          }
        }
        function showGoogleSignIn () {
          store.dispatch('startGoogleSignIn')
        }
        return {
            state, // состояние
            checkUser, userData, isLoading, languages, menuItems, // вычисляемые свойства
            signOut, t, setLocale, navigate, toggleAuthMenuVisibility, showGoogleSignIn, // методы
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
.auth-menu__signin
  cursor pointer
.lang-icon
  margin-left 5px
  margin-right 5px
.active-lang
  border 2px solid
  padding 2px
  color #409EFF
</style>