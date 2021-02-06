<template lang='pug'>
el-card(v-if="book")
  el-row(type='flex' justify='start' align='middle' :gutter="5")
    el-col(:span="10" v-bind:style="{ 'text-align': 'center' }")
      el-image.card-image(v-if='book.image' :src='book.image' fit="cover" /* ref='imageRef' */)
      el-image.card-image(v-else src='' fit="cover")
        template(#error)
          div.image-slot
            img.card-image(src="../../assets/no_image.png")
    el-col(:span="14" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }")
      h3.book-card__title
        span {{book.title}}
        span(v-if='book.volumeOrIssue') &nbsp;({{book.volumeOrIssue}})
      h4(v-if='typeName && book.type == 1' v-bind:style="{ 'color': '#093' }") {{typeName}}
      h4(v-if='typeName && book.type == 2' v-bind:style="{ 'color': '#69f' }") {{typeName}}
      h4(v-if='typeName && book.type == 3' v-bind:style="{ 'color': 'gray' }") {{typeName}}
      div(v-if='book.author')
        strong автор(ы):&nbsp;
        span {{book.author}}
      div(v-if='book.publicationDate')
        strong год:&nbsp;
        span {{book.publicationDate}}
      div(v-if='book.language')
        strong язык(и):&nbsp;
        span {{book.language}}
      div(v-if='book.publisher')
        strong издатель:&nbsp;
        span {{book.publisher}}
      div(v-if='book.genre')
        strong жанр:&nbsp;
        span {{book.genre}}
      div
        strong расположение:&nbsp;
        span {{book.country}} - {{book.city}}
      div(v-if='book.description') {{book.description}}
  el-row(justify='flex-end')
    el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-edit' @click='startBookEdit(book.id)')
    el-button(circle icon='el-icon-delete' @click='startBookDelete(book.id)')
    el-button(circle icon='el-icon-share' @click='startBookShare(book.id)')
</template>
<script>
// import { onBeforeUnmount, ref } from 'vue'
import Book from '../../store/models/BookModel'
export default {
  name: 'MyBookDetailsCard',
  // типизация свойств, получаемых извне
  props: {
    book: Book,
    typeName: String,
    startBookEdit: Function,
    startBookDelete: Function,
    startBookShare: Function
  }/* ,
  setup () {
    const imageRef = ref(0)
    onBeforeUnmount(() => {
      imageRef.value.src = ''
    })
    return { imageRef }
  } */
}
</script>
<style scoped lang='stylus'>
.card-image
  width 150px
  height 225px
</style>