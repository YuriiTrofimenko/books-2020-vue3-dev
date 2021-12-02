<template lang='pug'>
div(ref='singleSelectRef')
  div(v-if='!state.selectedOption' :class='classes.wrapper')
    .relative.inline-block.w-full
      input(ref='searchRef' :disabled='disabled' :class='[classes.input, isRequired]' :id='inputId' @focus='seedSearchText' @keydown.enter.prevent='setOption' @keyup.enter.prevent='setOption' @keyup.down='movePointerDown' @keyup.tab.stop='closeOut' @keyup.esc.stop='closeOut' @keyup.up='movePointerUp' :placeholder='placeholder' autocomplete='off' :required='required' v-model='state.searchText')
      .cursor-pointer.absolute.flex.items-center(@click='toggleDropdown' :class='[classes.icons]')
        svg(v-if='!state.dropdownOpen' aria-hidden='true' viewbox='0 0 448 512')
          path(d='M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z')
        svg(v-else='' aria-hidden='true' viewbox='0 0 448 512')
          path(d='M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z')
      ul.absolute.w-full.overflow-auto.appearance-none.mt-px.list-reset(tabindex='-1' ref='options' v-if='matchingOptions' :style="{'max-height': maxHeight}" style='z-index: 100;padding' :class='[classes.dropdown]')
        li.cursor-pointer.outline-none(tabindex='-1' v-for='(option, idx) in matchingOptions' :key='idx' :class="idx === pointer ? classes.activeClass : ''" @mouseover='setPointerIdx(idx)' @keyup.enter='setOption' @keyup.up='movePointerUp' @keyup.down='movePointerDown' @click.prevent='setOption')
          slot(name='option' v-bind='{option,idx}') {{ getOptionDescription(option) }}
  div(:class='classes.wrapper' v-if='state.selectedOption')
    input(:id='inputId' :class='[classes.input]' ref='matchRef' :required='required' @input='switchToSearch($event)' :value='getOptionDescription(state.selectedOption)')
    input(type='hidden' :name='name' ref='selectedValueRef' :value='getOptionValue(state.selectedOption)')
    .flex.absolute.items-center(:class='classes.icons')
      svg.cursor-pointer(aria-hidden='true' @click='closeOut' viewbox='0 0 512 512')
        path(d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z')
</template>
<script>
import pointerScroll from "./pointerScroll"
import * as Vue from 'vue'
import { onMounted, onUnmounted, reactive, watch, computed, ref } from 'vue'
export default {
  name: 'SingleSelect',
  mixins: [pointerScroll],
  props: {
    modelValue: {
      required: true
    },
    name: {
      type: String,
      required: false,
      default: () => ""
    },
    options: {
      type: Array,
      required: false,
      default: () => []
    },
    optionLabel: {
      type: String,
      required: false,
      default: () => null
    },
    optionKey: {
      type: String,
      required: false,
      default: () => null
    },
    placeholder: {
      type: String,
      required: false,
      default: () => "Search Here"
    },
    maxHeight: {
      type: String,
      default: () => "220px",
      required: false
    },
    inputId: {
      type: String,
      default: () => "single-select",
      required: false
    },
    classes: {
      type: Object,
      required: false,
      default: () => {
        return {
          pointer: -1,
          wrapper: "single-select-wrapper",
          input: "search-input",
          icons: "icons",
          required: "required",
          activeClass: "active",
          dropdown: "dropdown"
        };
      }
    },
    initial: {
      type: String,
      required: false,
      default: () => null
    },
    disabled: {
      type: Boolean,
      required: false,
      default: () => false
    },
    required: {
      type: Boolean,
      required: false,
      default: () => false
    },
    maxResults: {
      type: Number,
      required: false,
      default: () => 30
    },
    tabindex: {
      type: String,
      required: false,
      default: () => {
        return "";
      }
    },
    getOptionDescription: {
      type: Function,
      default: function(option) {
        if (this.optionKey && this.optionLabel) {
          return option[this.optionKey] + " " + option[this.optionLabel];
        }
        if (this.optionLabel) {
          return option[this.optionLabel];
        }
        if (this.optionKey) {
          return option[this.optionKey];
        }
        return option;
      }
    },
    getOptionValue: {
      type: Function,
      default: function(option) {
        if (this.optionKey) {
          return option[this.optionKey];
        }

        if (this.optionLabel) {
          return option[this.optionLabel];
        }

        return option;
      }
    },
    filterBy: {
      type: Function,
      default: function(option, state) {
        if (this.optionLabel && this.optionKey) {
          return (
            option[this.optionLabel]
              .toString()
              .toLowerCase()
              .includes(state.searchText.toString().toLowerCase()) ||
            option[this.optionKey]
              .toString()
              .toLowerCase()
              .includes(state.searchText.toString().toLowerCase())
          );
        }
        if (this.optionLabel) {
          return option[this.optionLabel]
            .toString()
            .toLowerCase()
            .includes(state.searchText.toString().toLowerCase());
        }

        if (this.optionKey) {
          option[this.optionKey]
            .toString()
            .toLowerCase()
            .includes(state.searchText.toString().toLowerCase());
        }

        return option
          .toString()
          .toLowerCase()
          .includes(state.searchText.toString().toLowerCase());
      }
    }
  },
  setup (props, ctx) {
    /* Refs */
    const singleSelectRef = ref(null)
    const searchRef = ref(null)
    const selectedValueRef = ref(null)
    const matchRef = ref(null)
    /* Lifecycle */
    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keyup", handleClickOutside);
      const currentOption = props.options.find((o) => o[props.optionKey] === props.modelValue)
      if (currentOption) {
        // state.selectedOption = props.modelValue;
        state.selectedOption = currentOption
        console.log('onMounted selectedOption', state.selectedOption)
        return;
      }
      state.searchText = props.initial;
    })
    onUnmounted(() => {
      document.removeEventListener("keyup", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    })
    /* Reactive */
    const state = reactive({ 
      searchText: null,
      selectedOption: null,
      dropdownOpen: false
    })
    /* Watch */
    watch(() => props.modelValue, (curr) => {
      // state.selectedOption = curr
      state.selectedOption = props.options.find((o) => o[props.optionKey] === curr)
      console.log('watch selectedOption', state.selectedOption)
    })
    watch(() => state.searchText, (curr, prev) => {
      if (curr !== prev) {
        // eslint-disable-next-line vue/no-mutating-props
        props.classes.pointer = -1;
      }
    })
    watch(() => state.selectedOption, (curr) => {
      // ctx.emit("input", curr)
      if (curr) {
        ctx.emit("update:modelValue", curr[props.optionKey])
      } else {
        ctx.emit("update:modelValue", null)
      }
    })
    watch(() => state.dropdownOpen, (curr, prev) => {
      if (curr === prev) {
        return;
      }
      if (!curr) {
        state.searchText = null;
        return;
      }
      if (!state.searchText) {
        state.searchText = "";
      }
      Vue.nextTick(() => {}).then(() => {
        searchRef.value.search.focus();
      })
    })
    /* Computed */
    const isRequired = computed(() => {
      if (!props.required) {
        return "";
      }
      if (state.selectedOption) {
        return "";
      }
      return "required";
    })
    const matchingOptions = computed(() => {
      if (state.searchText === null) {
        return null;
      }
      if (!state.searchText.length) {
        return [...props.options].slice(0, props.maxResults);
      }

      return props.options
        .filter(option => props.filterBy(option, state))
        .slice(0, props.maxResults);
    })
    /* Methods */
    function setPointerIdx(idx) {
      // eslint-disable-next-line vue/no-mutating-props
      props.classes.pointer = idx
    }
    function seedSearchText() {
      if (state.searchText !== null) {
        return;
      }
      state.searchText = "";
    }
    function switchToSearch(event) {
      selectedValueRef.value.value = null;
      state.searchText = event.target.value;
      state.selectedOption = null;
      state.dropdownOpen = true;
    }
    function toggleDropdown() {
      if (props.disabled) {
        return;
      }
      state.dropdownOpen = !state.dropdownOpen;
    }
    function closeOut() {
      state.selectedOption = null;
      state.dropdownOpen = false;
      state.searchText = null;
    }
    function movePointerDown() {
      if (!this.matchingOptions) {
        return;
      }
      if (props.classes.pointer >= this.matchingOptions.length - 1) {
        return;
      }

      // eslint-disable-next-line vue/no-mutating-props
      props.classes.pointer++;
    }
    function movePointerUp() {
      if (props.classes.pointer > 0) {
        // eslint-disable-next-line vue/no-mutating-props
        props.classes.pointer--;
      }
    }
    function setOption() {
      console.log(this.matchingOptions);
      if (!this.matchingOptions || !this.matchingOptions.length) {
        return;
      }
      if (props.classes.pointer === -1) {
        // eslint-disable-next-line vue/no-mutating-props
        props.classes.pointer++;
      }

      state.selectedOption = this.matchingOptions[props.classes.pointer];
      state.searchText = null;
      state.dropdownOpen = false;
      // eslint-disable-next-line vue/no-mutating-props
      props.classes.pointer = -1;
      Vue.nextTick(() => {}).then(() => {
        matchRef.value.focus();
      });
    }
    function handleClickOutside(e) {
      if (singleSelectRef.value.contains(e.target) || e.target.id === this.inputId) {
        return;
      }
      state.dropdownOpen = false;
      state.searchText = null;
    }
    return {
      // state
      state,
      // computed
      isRequired, matchingOptions,
      // methods
      setPointerIdx, seedSearchText, switchToSearch, toggleDropdown, closeOut,
      movePointerDown, movePointerUp, setOption, handleClickOutside,
      // refs
      singleSelectRef, searchRef, selectedValueRef, matchRef
    }
  }
}
</script>
<style scoped>
.w-full {
  width: 100%;
}
.inline-block {
  display: inline-block;
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.border {
  border-width: thin;
  border-style: solid;
}
.rounded {
  border-radius: 0.25em;
}
.text-black {
  color: #22292f;
}
.border-grey-lighter {
  border-color: #ced4da;
}
.bg-grey-lighter {
  background-color: #606f7b;
}
.bg-grey-light {
  background-color: #dae1e7;
}
.bg-grey-dark {
  background-color: #8795a1;
}
.bg-white {
  background-color: #fff;
}
.pin-r {
  right: 0;
}
.pin-y {
  top: 0;
  bottom: 0;
}
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.items-center {
  align-items: center;
}
.p-0 {
  padding: 0;
}
.p-1 {
  padding: 0.25em;
}
.px-1 {
  padding-left: 0.25em;
  padding-right: 0.25em;
}
.py-2 {
  padding-top: 0.5em;
  padding-bottom: 0.5em;
}
.px-2 {
  padding-left: 0.5em;
  padding-right: 0.5em;
}
.mt-px {
  margin-top: 1px;
}
.leading-tight {
  line-height: 1.25;
}
.leading-normal {
  line-height: 1.5;
}
.text-left {
  text-align: left;
}
.w-full {
  width: 100%;
}
.shadow {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}
.list-reset {
  list-style: none;
  padding: 0;
}
.overflow-auto {
  overflow: auto;
}
.appearance-none {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.w-1 {
  width: 0.25em;
}
.w-2 {
  width: 0.5em;
}
.w-3 {
  width: 0.75em;
}
.w-4 {
  width: 1em;
}
.h-4 {
  height: 1em;
}
.h-1 {
  height: 0.25em;
}
.h-2 {
  height: 0.5em;
}
.h-3 {
  height: 0.75em;
}
.fill-current {
  fill: currentColor;
}
.no-underline {
  text-decoration: none;
}
.hover\:no-underline:hover {
  text-decoration: none;
}
.outline-none {
  outline: 0;
}
.hover\:outline-none {
  outline: 0;
}
.hover\:bg-grey-light:hover {
  background-color: #dae1e7;
}
.shadow-md {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}
.search-input {
  display: block;
  width: 100%;
  padding: 0.375em 0.75em;
  font-size: 1em;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25em;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
}
.icons {
  padding: 0 1em;
  right: 0;
  top: 0;
  bottom: 0;
  fill: #606f7b;
}
.icons svg {
  width: 0.75em;
  height: 0.75em;
}
.single-select-wrapper {
  position: relative;
  margin-bottom: 0.5em;
}
.required {
  _color: #721c24;
  _background-color: #f8d7da;
  border-color: #f5c6cb;
}
.cursor-pointer {
  cursor: pointer;
}
.dropdown {
  -webkit-box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px 0 rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #606f7b;
  border-radius: 0.25em;
  line-height: 1.25;
  text-align: left;
}
.dropdown > li {
  padding: 0.5em 0.75em;
}
.active {
  background: #dae1e7;
}
</style>