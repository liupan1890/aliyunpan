<script lang="ts">
import message from '../utils/message'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: { value: Array, maxlen: Number },
  emits: ['update:value'],
  setup(props, context) {
    const addval = ref('')
    const del = (delval: any) => {
      let value = props.value
      let arr: string[] = []
      value?.forEach((val) => {
        if ((val as string) != (delval as string)) {
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
      let value = props.value
      let arr: string[] = []
      value?.forEach((val) => {
        if (arr.includes(val as string) == false) arr.push(val as string)
      })
      if (arr.includes(val) == false) arr.push(val)
      addval.value = ''
      context.emit('update:value', arr)
    }

    return { addval, add, del }
  }
})
</script>

<template>
  <div class="mytags">
    <a-tag tabindex="-1" v-for="item in value" closable color="red" @close="del(item)">{{ item }}</a-tag>
    <a-input-search tabindex="-1" v-model:model-value="addval" :style="{ width: '120px' }" size="small" button-text="添加" search-button @search="add" @press-enter="add(addval)" />
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
