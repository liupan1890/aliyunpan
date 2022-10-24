<script lang="ts">
import { defineComponent, nextTick, PropType, ref, toRefs, watch } from 'vue'

export default defineComponent({
  props: { tabs: Array as PropType<{ key: string; title: string; alt: string }[]>, name: String, value: String },
  emits: ['update:value'],
  setup(props, ctx) {
    const width = ref(0)
    const translate = ref(0)
    const WRAPPER_PADDING = 4
    const { value } = toRefs(props)
    if (props.tabs && props.tabs.length > 0) {
      const val = props.value || props.tabs[0].key
      const id = 'mantine-' + props.name + '-label-' + val
      nextTick(() => {
        let label = document.getElementById(id)
        if (label) {
          label = label.parentElement
          if (label) {
            width.value = label.offsetWidth
            translate.value = label.offsetLeft - WRAPPER_PADDING
          }
        }
      })
    }

    watch(value, (newvalue: any, oldvalue: any) => {
      const val = newvalue
      const id = 'mantine-' + props.name + '-label-' + val
      nextTick(() => {
        let label = document.getElementById(id)
        if (label) {
          label = label.parentElement
          if (label) {
            width.value = label.offsetWidth
            translate.value = label.offsetLeft - WRAPPER_PADDING
          }
        }
      })
    })

    const click = (val: any, event: MouseEvent) => {
      const doc = (event.target as HTMLElement).parentElement
      if (doc) {
        width.value = doc.offsetWidth
        translate.value = doc.offsetLeft - WRAPPER_PADDING
      }
      ctx.emit('update:value', val as string)
    }
    return { width, translate, click }
  }
})
</script>

<template>
  <div class="mantine-root">
    <span class="mantine-SegmentedControl-active mantine-bgblock" :style="{ width: width + 'px', transform: 'translate(' + translate + 'px, 0px)' }"></span>
    <div v-for="item in tabs" :key="name + '-' + item.key" :class="'mantine-item' + (value == item.key ? ' mantine-item-active' : '')" @click="(e) => click(item.key, e)">
      <input :id="'mantine-' + name + '-' + item.key" type="radio" :name="'mantine-' + name + '-' + item.key" class="mantine-input" :value="item.key" :checked="value == item.key" disabled />
      <label :id="'mantine-' + name + '-label-' + item.key" :class="'mantine-label' + (value == item.key ? ' mantine-label-active' : '')" :for="'mantine-' + name + '-' + item.key" :title="item.alt">{{ item.title }}</label>
    </div>
  </div>
</template>

<style>
.mantine-root {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  background-color: var(--color-fill-2);
  border-radius: 4px;
  overflow: hidden;
  padding: 4px;
  z-index: 2;
}
.mantine-item {
  position: relative;
  box-sizing: border-box;
  flex: 1 1 0%;
  z-index: 2;
  margin-left: 2px;
  border-radius: 4px;
}
.mantine-item:first-of-type {
  margin-left: 0;
}
.mantine-item:not(.mantine-item-active):hover {
  background-color: var(--color-fill-3);
}

.mantine-input {
  height: 0;
  width: 0;
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  opacity: 0;
}
.mantine-label {
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: block;
  text-align: center;
  padding: 5px 10px;
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  user-select: none;
  color: var(--color-text-2);
  transition: color 200ms ease 0s;
  line-height: 16px;
}

.mantine-label-active,
.mantine-label-active:hover {
  color: rgb(0, 0, 0);
}

body[arco-theme='dark'] .mantine-label-active,
body[arco-theme='dark'] .mantine-label-active:hover {
  color: rgb(255, 255, 255);
}

.mantine-bgblock {
  box-sizing: border-box;
  border-radius: 4px;
  position: absolute;
  z-index: 1;
  box-shadow: rgb(0 0 0 / 5%) 0px 1px 3px, rgb(0 0 0 / 10%) 0px 1px 2px;
  transition: transform 200ms ease 0s, width 100ms ease 0s;
  background-color: rgb(255, 255, 255);
  height: 26px;
}

body[arco-theme='dark'] .mantine-bgblock {
  box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 3px, rgba(0, 0, 0, 0.5) 0px 1px 2px;
  background-color: rgb(var(--primary-6));
}
</style>
