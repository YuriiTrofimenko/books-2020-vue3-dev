<template lang='pug'>
//Header
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
  text-align center
  color #2c3e50
</style>
