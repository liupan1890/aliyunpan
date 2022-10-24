<script lang="ts">
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    istree: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const formRef = ref()

    const form = reactive({
      file_id: '',
      parent_file_id: '',
      isDir: false,
      fileName: '',
      bakName: ''
    })

    const handleOpen = () => {}

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }

    return { okLoading, form, formRef, handleOpen, handleClose }
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
      <span class="modaltitle">从网盘下载 文件/文件夹 到本地</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <br />
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">开始下载</a-button>
    </div>
  </a-modal>
</template>

<style></style>
