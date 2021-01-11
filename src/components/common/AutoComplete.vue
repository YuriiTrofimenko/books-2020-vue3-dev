<template lang="pug">
div
  el-input.input(type="text" @input="onChange" v-model="state.userInput" :placeholder="placeholder")
  .suggestions-card(v-if="suggestions.length && state.isSuggestionsShown && state.userInput")
    div(v-for="(s,i) in suggestions" :key="i" @click="()=>{selected(s)}") {{s[optionsKey]}}
</template>

<script>
import { reactive, computed, watch } from 'vue'
export default {
  name: 'AutoComplete',
  // типизация свойств, получаемых извне
  props: {
    options: Array,
    optionsKey: String,
    placeholder: String,
    clearHandler: Boolean
  },
  setup(props, ctx) {
    // локальное состояние компонента
    const state = reactive({
      userInput: "", // текст из поля ввода, набранный пользователем или выбранный пользователем из списка
      selectedItem: {}, // модель пункта, выбранного из списка
      isSuggestionsShown: false // отображен ли список предлагаемых вариантов
    })
    // наблюдаемые свойства
    const suggestions = computed(() => props.options) // список вариантов
    const clearHandlerComputed = computed(() => props.clearHandler) // флаг старта очистки поля ввода
    // наблюдатели за фактом изменения значения свойства
    watch(suggestions, (newValue) => {
      // список предложений не пуст - отображаем область предложений
      if (newValue.length > 0){
        state.isSuggestionsShown = true
      } else {
        state.isSuggestionsShown = false
      }
    })
    watch(clearHandlerComputed, (newValue) => {
      // извне значение свойства clearHandler установлено в true -
      // очищаем поле ввода и переинициализируем пустым объектом
      // свойство состояния selectedItem
      if (newValue){
        state.userInput = ""
        state.selectedItem = { }
      }
    })
    // методы
    // выбран пункт списка предложений
    function selected (item) {
      // по ключу, полученному из внешнего свойства,
      // извлекаем значение одного из свойств модели пункта списка,
      // предназначенное для вывода надписи на пункте списка,
      // и сохранияем набранный текст
      state.userInput = item[props.optionsKey]
      // устанавливаем модель выбранного пункта списка в состояние
      state.selectedItem = { userInput: state.userInput, item: item }
      // скрываем область предложений
      state.isSuggestionsShown = false
      // выброс события пользовательского типа itemSelected
      // с аргументом - моделью выбранного пункта
      ctx.emit('item-selected', item)
    }
    // изменился текст в поле ввода
    function onChange (value) {
      // перевыброс события для обработки снаружи компонента
      // new-text - имя пользовательского типа события (newText),
      // value - значение-аргумент события
      ctx.emit('new-text', value)
      // сбрасываем в локальном сосотоянии модель выбранного пункта списка,
      // устанавливаем в состояние набранный текст
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
