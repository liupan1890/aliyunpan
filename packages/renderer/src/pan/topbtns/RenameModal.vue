<script lang="ts">
import { IAliGetFileModel } from '@/aliapi/alimodels'
import AliFileCmd from '@/aliapi/filecmd'
import { usePanFileStore, usePanTreeStore } from '@/store'
import message from '@/utils/message'
import { modalCloseAll, modalRename } from '@/utils/modal'
import { CheckFileName, ClearFileName } from '@/utils/utils'
import { defineComponent, ref, reactive } from 'vue'
import TreeStore from '@/store/treestore'

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
      isdir: false,
      filename: '',
      bakname: ''
    })

    let filelist: IAliGetFileModel[] = []

    const handleOpen = () => {
      if (props.istree) {
        const pantreeStore = usePanTreeStore()
        filelist = [{ ...pantreeStore.selectDir, isdir: true, ext: '', category: '', icon: '', sizestr: '', timestr: '', starred: false, thumbnail: '' }]
      } else {
        const panfileStore = usePanFileStore()
        filelist = panfileStore.GetSelected()
      }
      if (filelist.length == 0) {
        message.error('没有选中任何文件')
      } else {
        
        form.file_id = filelist[0].file_id
        form.parent_file_id = filelist[0].parent_file_id
        form.isdir = filelist[0].isdir
        form.filename = filelist[0].name
        form.bakname = filelist[0].name
      }
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }

    const rules = [
      { required: true, message: '文件名必填' },
      { minLength: 1, message: '文件夹不能为空' },
      { maxLength: 100, message: '文件夹太长(100)' },
      {
        validator: (value: string, cb: any) => {
          let chk = CheckFileName(value)
          if (chk) cb('文件名' + chk)
        }
      }
    ]

    const handleMulti = () => {
      modalRename(props.istree, true)
    }

    return { okLoading, form, formRef, handleOpen, handleClose, rules, handleMulti }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      this.formRef.validate((data: any) => {
        if (data) return 

        let newname = ClearFileName(this.form.filename)
        if (!newname) {
          message.error('重命名失败 文件名不能为空')
          return
        }

        if (newname == this.form.bakname) {
          
          modalCloseAll()
          return
        }

        const pantreeStore = usePanTreeStore()
        if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
          message.error('重命名失败 父文件夹错误')
          return
        }

        this.okLoading = true
        AliFileCmd.ApiRenameBatch(pantreeStore.user_id, pantreeStore.drive_id, [this.form.file_id], [newname])
          .then((data) => {
            if (data.length == 1) {
              
              TreeStore.RenameDirs(pantreeStore.drive_id, data)
              
              usePanTreeStore().mRenameFiles(data)
              
              if (!this.istree) usePanFileStore().mRenameFiles(data)
              message.success('重命名 成功')
            } else {
              message.error('重命名 失败')
            }
          })
          .catch((e: any) => {
            message.error('重命名 失败 ' + (e.message || ''))
          })
          .then(() => {
            modalCloseAll()
          })
      })
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">重命名一个文件</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="filename" :rules="rules">
          <template #label>文件名：<span class="opblue" style="margin-left: 16px; font-size: 12px"> 不要有特殊字符 &lt; > : * ? \\ / \' " </span> </template>
          <a-input v-model.trim="form.filename" :placeholder="form.bakname" allow-clear />
        </a-form-item>
      </a-form>
      <br />
    </div>
    <div class="modalfoot">
      <a-button type="outline" size="small" @click="handleMulti">批量重命名</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">重命名</a-button>
    </div>
  </a-modal>
</template>

<style></style>
