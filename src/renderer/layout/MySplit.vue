<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useWinStore, WinState } from '../store'

export default defineComponent({
  emits: ['splitSize'],
  setup() {
    const leftMinWidth = 304
    const rightMinWidth = 380
    const winStore = useWinStore()
    const bodyWidth = ref(Math.max(winStore.width, 800))
    const splitMoveing = ref(false)
    const splitSize = ref(bodyWidth.value < 900 ? '300px' : '350px')
    const splitSizeMax = ref(bodyWidth.value - rightMinWidth)

    winStore.$subscribe((_m: any, state: WinState) => {
      const width = state.width
      if (width > 0 && bodyWidth.value != width) {
        bodyWidth.value = width
        splitSizeMax.value = width - rightMinWidth
        const tempSize = parseInt(splitSize.value, 10)
        if (tempSize < leftMinWidth) splitSize.value = leftMinWidth.toString() + 'px'
        else if (tempSize > leftMinWidth && tempSize > splitSizeMax.value) splitSize.value = splitSizeMax.value.toString() + 'px'
      }
    })

    return { splitSize, leftMinWidth, splitSizeMax, splitMoveing }
  }
})
</script>

<template>
  <a-split v-model:size="splitSize" class="MySplit" style="height: 100%; width: 100%" :min="leftMinWidth" :max="splitSizeMax" tabindex="-1" @move-start="splitMoveing = true" @move-end="splitMoveing = false">
    <template #first>
      <slot name="first">first</slot>
    </template>
    <template #resize-trigger>
      <div class="splitline" :class="splitMoveing ? 'resize' : ''" draggable="false">
        <div class="line" draggable="false"></div>
      </div>
    </template>
    <template #second>
      <slot name="second">second</slot>
    </template>
  </a-split>
</template>
<style>
.MySplit .arco-split-pane {
  overflow: hidden;
}
.splitline {
  box-sizing: border-box;
  width: 4px;
  height: 100%;
  border-right: 2px solid transparent;
  border-left: 1px solid var(--color-border-2);
  user-select: none;
  margin-right: 2px;
}
.splitline:hover {
  border-left: 0 solid transparent;
  background: rgb(var(--primary-6));
  cursor: col-resize;
}
.splitline.resize {
  background: rgb(var(--primary-6));
}
.splitline .line {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 60px;
  margin-top: -30px;
  background: rgb(var(--primary-6));
}
</style>
