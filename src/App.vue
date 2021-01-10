<template lang='pug'>
el-container
  el-header
    Header
  el-main.container
    router-view.container
</template>
<script>
import Header from './components/base/Header'
export default {
  name: 'App',
  components: {
    Header
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
@media screen and (min-width: 768px)
  .container
    width 1140px
    padding 0
    margin 0 auto
</style>
