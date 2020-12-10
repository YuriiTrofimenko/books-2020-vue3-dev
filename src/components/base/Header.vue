<template lang='pug'>
vs-navbar.nabarx(v-model='state.activeItem')
    div(slot='title')
    vs-navbar-title
        | Home Library
    vs-navbar-item(
    v-for="(link, index) in state.linkMenu"
    :key="link.title"
    @click="state.menuShow = false"
    :index="index"
    )
    router-link.navbar-link(
        :to="`${link.url}`"
    ) {{ link.title }}
</template>
<script>
import { reactive } from 'vue'
export default {
    name: 'Header',
    setup () {
        const state = reactive({
            menuShow: false,
            activeItem: 0,
            linkMenu: [
                { title: 'Home', url: '/', icon: 'mdi-home' },
                { title: 'Contacts', url: '/contacts', icon: 'mdi-contact-phone-outline' }
            ]
        })
        return {
            state
        }
    }
}
</script>
<style scoped lang="stylus">
.is-active-item
    font-weight bold
</style>