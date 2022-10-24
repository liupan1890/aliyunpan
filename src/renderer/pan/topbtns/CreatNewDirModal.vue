<script lang="ts">
import AliFileCmd from '../../aliapi/filecmd'
import { usePanTreeStore, useSettingStore } from '../../store'
import message from '../../utils/message'
import { modalCloseAll } from '../../utils/modal'
import { CheckFileName, ClearFileName } from '../../utils/filehelper'
import { defineComponent, ref, reactive, PropType } from 'vue'
import PanDAL from '../pandal'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    dirtype: {
      type: String,
      required: true
    },
    parentdirid: {
      type: String
    },
    callback: {
      type: Function as PropType<(newdirid: string) => void>
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const formRef = ref()

    const form = reactive({
      dirName: '',
      dirIndex: 1
    })
    const handleOpen = () => {
      setTimeout(() => {
        document.getElementById('CreatNewDirInput')?.focus()
      }, 200)

      if (props.dirtype == 'datefolder') {
        let dirName = ''
        let dirIndex = 1

        const date = new Date(Date.now())
        const y = date.getFullYear().toString()
        let m: number | string = date.getMonth() + 1
        m = m < 10 ? '0' + m.toString() : m.toString()
        let d: number | string = date.getDate()
        d = d < 10 ? '0' + d.toString() : d.toString()
        let h: number | string = date.getHours()
        h = h < 10 ? '0' + h.toString() : h.toString()
        let minute: number | string = date.getMinutes()
        minute = minute < 10 ? '0' + minute.toString() : minute.toString()
        let second: number | string = date.getSeconds()
        second = second < 10 ? '0' + second.toString() : second.toString()

        const settingStore = useSettingStore()
        dirName = settingStore.uiTimeFolderFormate.replace(/yyyy/gi, y).replace(/MM/g, m).replace(/dd/gi, d).replace(/HH/gi, h).replace(/mm/g, minute).replace(/ss/gi, second)
        if (settingStore.uiTimeFolderFormate.indexOf('#') >= 0) {
          dirIndex = settingStore.uiTimeFolderIndex
          dirName = dirName.replace(/#{1,}/g, function (val) {
            return dirIndex.toString().padStart(val.length, '0')
          })
        }
        form.dirName = dirName
        form.dirIndex = dirIndex
      } else {
        form.dirName = ''
        form.dirIndex = 1
      }
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }

    const rules = [
      { required: true, message: '文件夹名必填' },
      { minLength: 1, message: '文件夹名不能为空' },
      { maxLength: 100, message: '文件夹名太长(100)' },
      {
        validator: (value: string, cb: any) => {
          const chk = CheckFileName(value)
          if (chk) cb('文件夹名' + chk)
        }
      }
    ]

    return { okLoading, form, formRef, handleOpen, handleClose, rules }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      this.formRef.validate((data: any) => {
        if (data) return 

        const pantreeStore = usePanTreeStore()
        if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
          message.error('新建文件夹失败 父文件夹错误')
          return
        }

        const newName = ClearFileName(this.form.dirName)
        if (!newName) {
          message.error('新建文件夹失败 文件夹名不能为空')
          return
        }

        this.okLoading = true
        let newdirid = ''
        AliFileCmd.ApiCreatNewForder(pantreeStore.user_id, pantreeStore.drive_id, this.parentdirid || pantreeStore.selectDir.file_id, newName)
          .then((data) => {
            if (data.error) message.error('新建文件夹 失败' + data.error)
            else {
              newdirid = data.file_id
              message.success('新建文件夹 成功')
              if (this.form.dirIndex) useSettingStore().updateStore({ uiTimeFolderIndex: this.form.dirIndex + 1 })
              if (!this.parentdirid || pantreeStore.selectDir.file_id == this.parentdirid) {
                
                PanDAL.aReLoadOneDirToShow('', 'refresh', false)
              } else {
                
                return PanDAL.GetDirFileList(pantreeStore.user_id, pantreeStore.drive_id, this.parentdirid, '')
              }
            }
          })
          .catch((err: any) => {
            message.error('新建文件夹 失败 ' + (err.message || ''))
          })
          .then(() => {
            modalCloseAll()
            if (this.callback) this.callback(newdirid)
          })
      })
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">新建文件夹</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="dirName" :rules="rules">
          <template #label>文件夹名：<span class="opblue" style="margin-left: 16px; font-size: 12px"> 不要有特殊字符 &lt; > : * ? \\ / \' " </span> </template>
          <a-input v-model.trim="form.dirName" placeholder="例如：新建文件夹" allow-clear :input-attrs="{ id: 'CreatNewDirInput', autofocus: 'autofocus' }" />
        </a-form-item>
      </a-form>
      <br />
    </div>
    <div class="modalfoot">
      <a-button v-if="false" type="outline" size="small" @click="handleHide">批量创建</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">创建</a-button>
    </div>
  </a-modal>
</template>

<style></style>
