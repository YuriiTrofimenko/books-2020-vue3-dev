<template lang="pug">
div
  el-input.input(type="text" @input="onChange" v-model="state.userInput" :placeholder="placeholder")
  .suggestions-card(v-if="suggestions.length && state.isSuggestionsShown")
    div(v-for="(s,i) in suggestions" :key="i" @click="()=>{selected(s)}") {{s[optionsKey]}}
</template>

<script>
import { reactive, computed, watch } from 'vue'
export default {
  name: 'AutoComplete',
  props: {
    options: Array,
    optionsKey: String,
    placeholder: String
  },
  setup(props, ctx) {
    const state = reactive({
      userInput: "",
      selectedItem: {},
      isSuggestionsShown: false
    })
    const suggestions = computed(() => props.options)
    watch(suggestions, (newValue) => {
      console.log('newValue', newValue.length)
      if (newValue.length > 0){
        state.isSuggestionsShown = true
      } else {
        state.isSuggestionsShown = false
      }
    })
    function selected (_item) {
      state.userInput = _item[props.optionsKey];
      state.selectedItem = { userInput: state.userInput, item: _item }
      state.isSuggestionsShown = false
    }
    function onChange (value) {
      ctx.emit('new-text', value)
      state.selectedItem = { userInput: state.userInput, item: null }
    }
    return {
      state,
      suggestions,
      selected, onChange
    }
  }
}
</script>

<style lang="stylus" scoped>
body
  font-family sans-serif
.input
  margin 10px 0px
.suggestions-card
  margin-top 0
  padding-left 0
  margin-left 0
  position absolute
  z-index 100
  width 94%
  background #fff
  border 1px solid #e4e7ed
  box-shadow 0 2px 12px 0 rgba(0,0,0,.1)
  div
    padding: 10px
    &:hover
      background-color: #eaeefb;
      opacity: 0.75
</style>
