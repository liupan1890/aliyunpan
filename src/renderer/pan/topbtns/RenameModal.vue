<script lang="ts">
import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFileCmd from '../../aliapi/filecmd'
import { usePanFileStore, usePanTreeStore } from '../../store'
import message from '../../utils/message'
import { modalCloseAll, modalRename } from '../../utils/modal'
import { CheckFileName, ClearFileName } from '../../utils/filehelper'
import { defineComponent, ref, reactive, nextTick } from 'vue'
import PanDAL from '../pandal'

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

    let fileList: IAliGetFileModel[] = []

    const handleOpen = () => {
      setTimeout(() => {
        document.getElementById('RenameInput')?.focus()
      }, 200)

      if (props.istree) {
        const pantreeStore = usePanTreeStore()
        fileList = [{ ...pantreeStore.selectDir, isDir: true, ext: '', category: '', icon: '', sizeStr: '', timeStr: '', starred: false, thumbnail: '' } as IAliGetFileModel]
      } else {
        const panfileStore = usePanFileStore()
        fileList = panfileStore.GetSelected()
        if (fileList.length == 0) {
          const focus = panfileStore.mGetFocus()
          panfileStore.mKeyboardSelect(focus, false, false)
          fileList = panfileStore.GetSelected()
        }
      }
      if (fileList.length == 0) {
        form.file_id = ''
        form.parent_file_id = ''
        form.isDir = false
        form.fileName = ''
        form.bakName = ''
        nextTick(() => {
          modalCloseAll()
        })
      } else {
        
        form.file_id = fileList[0].file_id
        form.parent_file_id = fileList[0].parent_file_id
        form.isDir = fileList[0].isDir
        form.fileName = fileList[0].name
        form.bakName = fileList[0].name
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
          const chk = CheckFileName(value)
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

        const newName = ClearFileName(this.form.fileName)
        if (!newName) {
          message.error('重命名失败 文件名不能为空')
          return
        }

        if (newName == this.form.bakName) {
          
          modalCloseAll()
          return
        }

        const pantreeStore = usePanTreeStore()
        if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
          message.error('重命名失败 父文件夹错误')
          return
        }

        this.okLoading = true
        AliFileCmd.ApiRenameBatch(pantreeStore.user_id, pantreeStore.drive_id, [this.form.file_id], [newName])
          .then((data) => {
            if (data.length == 1) {
              
              usePanTreeStore().mRenameFiles(data)
              
              if (!this.istree) usePanFileStore().mRenameFiles(data)
              
              PanDAL.RefreshPanTreeAllNode(pantreeStore.drive_id) 
              message.success('重命名 成功')
            } else {
              message.error('重命名 失败')
            }
          })
          .catch((err: any) => {
            message.error('重命名 失败', err)
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
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">重命名一个文件</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="fileName" :rules="rules">
          <template #label>文件名：<span class="opblue" style="margin-left: 16px; font-size: 12px"> 不要有特殊字符 &lt; > : * ? \\ / \' " </span> </template>
          <a-input v-model.trim="form.fileName" :placeholder="form.bakName" allow-clear :input-attrs="{ id: 'RenameInput', autofocus: 'autofocus' }" />
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
