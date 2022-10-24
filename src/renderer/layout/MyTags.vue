<script lang="ts">
import message from '../utils/message'
import { defineComponent, PropType, ref } from 'vue'

export default defineComponent({
  props: { value: Array as PropType<string[]>, maxlen: Number },
  emits: ['update:value'],
  setup(props, context) {
    const addVal = ref('')
    const del = (delVal: string) => {
      const value = props.value
      const arr: string[] = []
      value?.forEach((val: string) => {
        if (val != delVal) {
          if (arr.includes(val as string) == false) {
            arr.push(val as string)
          }
        }
      })
      context.emit('update:value', arr)
    }
    const add = (val: string) => {
      if (props.maxlen && val.length > props.maxlen) {
        message.error('输入的字符太长了，最长' + props.maxlen + '个')
        return
      }
      const value = props.value
      const arr: string[] = []
      value?.forEach((val) => {
        if (arr.includes(val as string) == false) arr.push(val as string)
      })
      if (arr.includes(val) == false) arr.push(val)
      addVal.value = ''
      context.emit('update:value', arr)
    }

    return { addVal, add, del }
  }
})
</script>

<template>
  <div class="mytags">
    <a-tag v-for="item in value" :key="item" closable color="red" tabindex="-1" @close="del(item)">{{ item }}</a-tag>
    <a-input-search v-model:model-value="addVal" tabindex="-1" :style="{ width: '120px' }" size="small" button-text="添加" search-button @search="add" @press-enter="add(addVal)" />
  </div>
</template>
<style>
.mytags .arco-tag {
  margin-right: 8px;
  margin-bottom: 4px;
  user-select: none;
}
.mytags .arco-input-search {
  height: 24px;
  margin-right: 8px;
  margin-bottom: 4px;
}
.mytags .arco-input-search .arco-input-wrapper {
  padding-left: 4px;
  padding-right: 4px;
  font-size: 12px;
}
.mytags .arco-input-search .arco-input-wrapper .arco-input {
  font-size: 12px;
  line-height: 22px;
}

.mytags .arco-input-search .arco-input-append {
  font-size: 12px;
}
.mytags .arco-input-search .arco-input-append .arco-input-search-btn {
  height: 23px;
  padding: 0 5px;
  font-size: 12px;
}
</style>
