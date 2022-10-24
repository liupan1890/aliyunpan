<script lang="ts">
import message from '../../utils/message'
import { modalArchive, modalCloseAll } from '../../utils/modal'
import { defineComponent, ref, reactive } from 'vue'
import AliArchive from '../../aliapi/archive'
import DebugLog from '../../utils/debuglog'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },

    user_id: {
      type: String,
      required: true
    },
    drive_id: {
      type: String,
      required: true
    },
    file_id: {
      type: String,
      required: true
    },
    file_name: {
      type: String,
      required: true
    },
    parent_file_id: {
      type: String,
      required: true
    },
    domain_id: {
      type: String,
      required: true
    },
    ext: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const formRef = ref()

    const form = reactive({
      password: ''
    })
    const handleOpen = () => {
      setTimeout(() => {
        document.getElementById('ArchivePasswordInput')?.focus()
      }, 200)

      form.password = ''
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }

    const rules = [
      { required: true, message: '解压密码必填' },
      { minLength: 1, message: '解压密码不能为空' }
    ]

    return { okLoading, form, formRef, handleOpen, handleClose, rules }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      this.formRef.validate(async (data: any) => {
        if (data) return 

        if (!this.form.password) {
          message.error('解压密码不能为空')
          return
        }

        this.okLoading = true
        const props = this.$props
        const resp = await AliArchive.ApiArchiveList(props.user_id, props.drive_id, props.file_id, props.domain_id, props.ext, this.form.password)
        this.okLoading = false
        if (!resp) {
          message.error('获取解压信息出错，请重试')
          return
        }
        if (resp.state == '密码错误') {
          message.error('解压密码错误，请重试')
        } else if (resp.state == 'Succeed' || resp.state == 'Running') {
          
          modalArchive(props.user_id, props.drive_id, props.file_id, props.file_name, props.parent_file_id, this.form.password)
        } else {
          message.error('在线解压失败 ' + resp.state + '，请重试')
          DebugLog.mSaveDanger('在线解压失败 ' + resp.state, props.drive_id + ' ' + props.file_id)
        }
      })
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">需要解压密码</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="password" :rules="rules">
          <template #label>密码：</template>
          <a-input v-model.trim="form.password" placeholder="请输入" allow-clear :input-attrs="{ id: 'ArchivePasswordInput', autofocus: 'autofocus' }" />
        </a-form-item>
      </a-form>
      <br />
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">确定</a-button>
    </div>
  </a-modal>
</template>

<style></style>
