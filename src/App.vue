<template lang='pug'>
el-container(lang="ru")
  el-header
    Header
  el-main.container
    router-view.container
  loader(v-if="store.getters.loading" object='#3465a4' color1='#ffffff' color2='#729fcf' size='5' speed='2' bg='#343a40' objectbg='#999793' opacity='80' disablescrolling='false' name='circular')
</template>
<script>
// import { reactive } from 'vue'
import Header from './components/base/Header'
import store from './store'
export default {
  name: 'App',
  components: {
    Header
  },
  setup () {
    return { store }
  }
}
</script>
<style lang='stylus'>
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  /* text-align center */
  color #2c3e50
</style>
<style lang='stylus' scoped>
.el-header
  top 0
  position sticky
  z-index 999
@media screen and (min-width: 768px)
  .container
    width 1140px
    padding 0
    margin 0 auto
</style>
