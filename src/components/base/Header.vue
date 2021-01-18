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
      span.lang-icon(
        @click="setLocale('en')"
        :class="{ 'active-lang': this.$i18n.locale === 'en' }"
      )
        flag(:iso="'gb'")
      span.lang-icon(
        @click="setLocale('ru')"
        :class="{ 'active-lang': this.$i18n.locale === 'ru' }"
      )
        flag(:iso="'ru'")
    // меню учетной записи, если пользователь аутентифицирован
    el-menu-item(v-if="checkUser")
        el-dropdown
            span.el-dropdown-link
                // el-avatar(:size="64" :src="userData.photo")
                img(:src="userData.photo" style="height: 32px; width: 32px; border-radius: 50%")
                i.el-icon-arrow-down.el-icon--right
            template(#dropdown='')
                el-dropdown-menu
                    el-dropdown-item(disabled='') {{userData.name}}
                    el-dropdown-item(disabled='') {{userData.email}}
                    el-dropdown-item(divided='' @click='signOut') SignOut
    // ссылка на раздел аутентификации, если пользователь не аутентифицирован
    el-menu-item(v-else)
        router-link(:to="'/google-auth'" ) {{t('base.header.signInButton')}}
</template>
<script>
import { reactive, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from "vue3-i18n"
import store from '../../store'
export default {
    name: 'Header',
    setup () {
        const app = getCurrentInstance()
        const t = app.appContext.config.globalProperties.$t
        const i18n = useI18n()
        const router = useRouter()
        const state = reactive({
            menuShow: false,
            activeIndex: "0"
        })
        const checkUser = computed(() => store.getters.checkUser)
        const userData = computed(() => store.getters.user)
        const isLoading = computed(() => store.getters.loading)
        /* const linkMenu = computed(() =>
          (checkUser.value)
            ? [
                { title: 'Home', url: '/', icon: 'mdi-home' },
                { title: 'Search', url: '/search', icon: 'mdi-book-search-outline' },
                { title: 'My Offers', url: '/my-offers', icon: 'mdi-format-list-bulleted' },
                { title: 'Contacts', url: '/contacts', icon: 'mdi-contact-phone-outline' }
              ] : [
                { title: 'Home', url: '/', icon: 'mdi-home' },
                { title: 'Search', url: '/search', icon: 'mdi-book-search-outline' },
                { title: 'Contacts', url: '/contacts', icon: 'mdi-contact-phone-outline' }
              ]
          ) */
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
            checkUser, userData, isLoading, linkMenu, // вычисляемые свойства
            signOut, t, setLocale // методы
        }
    }
}
</script>
<style scoped lang="stylus">
.is-active
    font-weight bold
</style>