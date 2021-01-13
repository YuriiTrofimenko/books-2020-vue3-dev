<template lang='pug'>
div
  //- изображение, приглашающее сделать клик и выбрать файл картинки из файловой системы
  img.addImageIcon(v-if="!previewImage" src="../../assets/photoicon_300x300.png" @click='selectImage')
  .imagePreviewWrapper(v-else :style="{ 'background-image': `url(${state.previewImage})` }" @click='selectImage')
  //- элемент "выбор файла", которому назначено имя ссылки "fileInput"
  input(ref='fileInput' type='file' @input='pickFile')
</template>
<script>
import { computed, reactive, ref } from 'vue'
import resizebase64 from '../../utils/resizeBase64'
export default {
  name: 'FilePreview',
  setup (props, ctx) {
    const state = reactive({
      previewImage: null
    })
    // объявление объекта-оболочки для ссылки на элемент разметки "выбор файла"
    const fileInput = ref(null)
    // вычисляемое свойство, сигнализирующее об изменении свойства состояния "previewImage"
    const previewImage = computed(() => state.previewImage)
    // обработчик события Клик по изображению
    function selectImage () {
      // по ссылке получаем доступ к элементу разметки "выбор файла"
      // и эмулируем клик пользователя на этом элементе
      fileInput.value.click()
    }
    // обработчик выбора файла с жесткого диска
    function pickFile () {
      // получение значения из стандартного свойства files элемента выбора файла
      const file = fileInput.value.files
      if (file && file[0]) {
        const reader = new FileReader
        // установка функции обратного вызова,
        // которая сработает только по окончании процесса получения файла браузером
        reader.onload = e => {
          // вызов пользовательской функции изменения размеров изображения,
          // представленного строкой в формате base64
          // аргументы:
          // 1. файл, уже преобразованный стандартными средствами браузера в строку
          // 2. ширина
          // 3. высота выходного иображения
          resizebase64(e.target.result, 600, 900).then(result => {
            // инициализируем свойство состояния строкой - отредактированным изображением
            state.previewImage = result
            // выброс в аргументе пользовательского события input
            // строки - изображения
            ctx.emit('input', result)
          })
        }
        // запуск асинхронного процесса чтения и обработки файла изображения
        // с преобразованием в строку
        reader.readAsDataURL(file[0])
      }
    }
    return {
      state, // state
      selectImage, pickFile, // methods
      fileInput, // refs
      previewImage // computed
    }
  }
}
</script>
<style scoped lang="stylus">
.imagePreviewWrapper
  width auto
  height 450px
  display block
  cursor pointer
  margin 0 auto 30px
  background-size cover
  background-position center center
.addImageIcon
  width 300px
  height 300px
  display block
  cursor pointer
  margin 0 auto 30px
  background-size cover
  background-position center center
  opacity 0.5
input
  display none
</style>