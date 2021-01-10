<template lang='pug'>
div
  img.addImageIcon(v-if="!previewImage" src="../../assets/photoicon_300x300.png" @click='selectImage')
  .imagePreviewWrapper(v-else :style="{ 'background-image': `url(${state.previewImage})` }" @click='selectImage')
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
    const fileInput = ref(null)
    const previewImage = computed(() => state.previewImage)
    function selectImage () {
      fileInput.value.click()
    }
    function pickFile () {
      let file = fileInput.value.files
      if (file && file[0]) {
        let reader = new FileReader
        reader.onload = e => {
          resizebase64(e.target.result, 600, 900).then(result => {
            state.previewImage = result
            ctx.emit('input', result)
          })
        }
        reader.readAsDataURL(file[0])
        // ctx.emit('input', file[0])
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