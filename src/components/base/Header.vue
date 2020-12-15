<template lang='pug'>
el-menu(:default-active="state.activeIndex" class="el-menu-demo" mode="horizontal")
    el-menu-item(
        v-for="(link, index) in state.linkMenu"
        :key="link.title"
        @click="state.menuShow = false"
        :index="index.toString()"
    )
        router-link(
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
            activeIndex: "0",
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
.is-active
    font-weight bold
</style>