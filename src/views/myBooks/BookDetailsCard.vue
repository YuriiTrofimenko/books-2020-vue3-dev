<template lang='pug'>
el-card(v-if="book")
  el-row(type='flex' justify='start' align='middle' :gutter="5")
    el-col(:span="10" v-bind:style="{ 'text-align': 'center' }")
      el-image.card-image(v-if='book.image' :src='book.image' fit="cover")
      el-image.card-image(v-else src='' fit="cover")
        template(#error)
          div.image-slot
            img.card-image(src="../../assets/no_image.png")
    el-col(:span="14" v-bind:style="{ 'align-self': 'start', 'text-align': 'left' }")
      h3
        span {{book.title}}
        span(v-if='book.volumeOrIssue') &nbsp;({{book.volumeOrIssue}})
      h4(v-if='book.author') автор: {{book.author}}
      h4(v-else) автор: -
      span(v-if='book.description') {{book.description}}
      div(v-if='book.genre')
        strong жанр:&nbsp;
        span {{book.genre}}
  el-row(justify='flex-end')
    el-button(color='rgb(230,230,230)' color-text='rgb(50,50,50)' icon='el-icon-edit' @click='startBookEdit(book.id)')
    el-button(circle icon='el-icon-delete' @click='startBookDelete(book.id)')
    el-button(circle icon='el-icon-share' @click='startBookShare(book.id)')
</template>
<script>
import Book from '../../store/models/BookModel'
export default {
  name: 'BookDetailsCard',
  // типизация свойств, получаемых извне
  props: {
    book: Book,
    startBookEdit: Function,
    startBookDelete: Function,
    startBookShare: Function
  },
}
</script>
<style scoped lang='stylus'>
.card-image
  width 150px
  height 225px
</style>