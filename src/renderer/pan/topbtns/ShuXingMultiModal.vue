<script lang="ts">
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)

    const handleOpen = () => {
      
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
    }
    return { okLoading, handleOpen, handleClose }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {}
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle"></span>
    </template>
    <div class="modalbody"></div>
    <div class="modalfoot">
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">确定</a-button>
    </div>
  </a-modal>
</template>

<style></style>
