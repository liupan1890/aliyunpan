<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useAppStore } from '../store'

let IsOnShutDowning = false
export default defineComponent({
  setup() {
    const appStore = useAppStore()
    const time = ref(60)
    const percent = ref(0)

    const handleOpen = () => {
      if (IsOnShutDowning) return 
      IsOnShutDowning = true
      time.value = 60
      timeid = window.setTimeout(subtime, 1000)
    }
    const handleClose = () => {
      IsOnShutDowning = false
      if (timeid) clearTimeout(timeid)
    }
    const handleCancel = () => {
      appStore.appShutDown = false
    }

    let timeid: number = 0
    const subtime = () => {
      time.value = time.value - 1
      percent.value = Math.ceil(((60 - time.value) * 100) / 60) / 100

      if (time.value == 1) {
        percent.value = 1
        window.WebShutDown({ quitApp: true })
      } else if (time.value > 1) timeid = window.setTimeout(subtime, 1000)
    }

    return { appStore, time, percent, handleOpen, handleClose, handleCancel }
  }
})
</script>

<template>
  <a-modal :visible="appStore.appShutDown" :footer="false" :unmount-on-close="true" :mask-closable="false" :closable="false" :esc-to-close="false" @before-open="handleOpen" @close="handleClose">
    <template #title> 传输完成后自动关机 </template>
    <div>
      <div class="flex flexnoauto" style="justify-content: center; align-items: center; margin-bottom: 32px">
        <a-progress type="circle" :percent="percent" :animation="true" :show-text="true" :width="120">
          <template #text>
            <span class="lasttime">{{ time }}<br /><small>秒</small></span>
          </template>
        </a-progress>
      </div>
      <div class="flex flexnoauto" style="justify-content: center; align-items: center; margin-bottom: 16px">
        <a-button type="primary" size="small" tabindex="-1" @click="handleCancel">取消自动关机</a-button>
      </div>
    </div>
  </a-modal>
</template>
<style>
.lasttime {
  font-weight: 800;
  font-size: 1.875rem;
  line-height: 2.25rem;
}
</style>
