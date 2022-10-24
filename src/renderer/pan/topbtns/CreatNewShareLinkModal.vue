<script lang="ts">
import { IAliGetFileModel } from '../../aliapi/alimodels'
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, PropType, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { usePanTreeStore, useSettingStore } from '../../store'
import { humanDateTime, randomSharePassword } from '../../utils/format'
import message from '../../utils/message'
import AliShare from '../../aliapi/share'
import ShareDAL from '../../share/share/ShareDAL'
import { ArrayKeyList } from '../../utils/utils'
import { copyToClipboard } from '../../utils/electronhelper'
import { GetShareUrlFormate } from '../../utils/shareurl'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    sharetype: {
      type: String,
      required: true
    },
    filelist: {
      type: Array as PropType<IAliGetFileModel[]>,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const formRef = ref()
    const settingStore = useSettingStore()
    const form = reactive({
      expiration: '',
      share_pwd: '',
      share_name: '',
      mutil: false
    })
    const handleOpen = () => {
      
      form.share_name = props.filelist[0].name

      let share_pwd = ''
      if (settingStore.uiSharePassword == 'random') share_pwd = randomSharePassword()
      else if (settingStore.uiSharePassword == 'last') share_pwd = localStorage.getItem('share_pwd') || ''
      form.share_pwd = share_pwd

      let expiration = Date.now()
      if (settingStore.uiShareDays == 'always') expiration = 0
      else if (settingStore.uiShareDays == 'week') expiration += 7 * 24 * 60 * 60 * 1000
      else expiration += 30 * 24 * 60 * 60 * 1000

      form.expiration = expiration > 0 ? humanDateTime(expiration) : ''
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
    }
    return { okLoading, handleOpen, handleClose, formRef, form, dayjs }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    async handleOK(multi: boolean) {
      const pantreeStore = usePanTreeStore()
      if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
        message.error('新建文件失败 父文件夹错误')
        return
      }

      const mindate = new Date()
      mindate.setMinutes(mindate.getMinutes() + 2)
      let expiration = this.form.expiration
      if (expiration) expiration = new Date(expiration) < mindate ? mindate.toISOString() : new Date(expiration).toISOString()
      else expiration = ''

      let share_name = this.form.share_name.trim().replaceAll('"', '')
      share_name = share_name.replace(/[<>:"\\|?*]+/g, '')
      share_name = share_name.replace(/[\f\n\r\t\v]/g, '')
      while (share_name.endsWith(' ') || share_name.endsWith('.')) share_name = share_name.substring(0, share_name.length - 1)
      if (share_name.length < 1) {
        message.error('分享链接标题不能为空')
        return
      }
      const share_pwd = this.form.share_pwd

      const user_id = pantreeStore.user_id
      const drive_id = pantreeStore.drive_id
      const file_id_list = ArrayKeyList<string>('file_id', this.filelist)
      this.okLoading = true
      
      localStorage.setItem('share_pwd', share_pwd)
      if (multi == false) {
        const result = await AliShare.ApiCreatShare(user_id, drive_id, expiration, share_pwd, share_name, file_id_list)

        if (typeof result == 'string') {
          this.okLoading = false
          message.error(result)
          return
        }

        if (result.share_name != share_name) {
          await AliShare.ApiUpdateShareBatch(user_id, [result.share_id], [result.expiration], [result.share_pwd], [share_name])
        }
        const url = GetShareUrlFormate(result.share_name, result.share_url, result.share_pwd)
        copyToClipboard(url)
        await ShareDAL.aReloadMyShareUntilShareID(user_id, result.share_id)
        message.success('创建分享链接成功，分享链接已复制到剪切板')
        this.okLoading = false
        modalCloseAll()
      } else {
        const result = await AliShare.ApiCreatShareBatch(user_id, drive_id, expiration, share_pwd, file_id_list)

        if (result.reslut.length > 0) {
          let url = ''
          for (let i = 0, maxi = result.reslut.length; i < maxi; i++) {
            const share = result.reslut[i]
            url += GetShareUrlFormate(share.share_name!, share.share_url!, share.share_pwd!) + '\n'
          }
          copyToClipboard(url)
          await ShareDAL.aReloadMyShareUntilShareID(user_id, result.reslut[0].share_id!)
          message.success('创建 ' + result.count.toString() + '条 分享链接成功，分享链接已复制到剪切板')
        } else {
          message.success('批量创建分享链接出错')
        }
        this.okLoading = false
        modalCloseAll()
      }
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle"
        >创建分享链接<span class="titletips"> (已选择{{ filelist.length }}个文件) </span></span
      >
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="share_name">
          <template #label>分享链接标题：<span class="opblue" style="margin-left: 16px; font-size: 12px"> 修改后的标题只有自己可见 </span> </template>
          <a-input v-model.trim="form.share_name" :placeholder="form.share_name" />
        </a-form-item>

        <a-row>
          <a-col flex="200px"> 有效期：</a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="100px"> 提取码：</a-col>
          <a-col flex="auto"></a-col>
        </a-row>
        <a-row>
          <a-col flex="200px">
            <a-form-item field="expiration">
              <a-date-picker
                v-model="form.expiration"
                style="width: 200px; margin: 0"
                show-time
                placeholder="永久有效"
                value-format="YYYY-MM-DD HH:mm:ss"
                :shortcuts="[
                  {
                    label: '永久',
                    value: () => ''
                  },
                  {
                    label: '3小时',
                    value: () => dayjs().add(3, 'hour')
                  },
                  {
                    label: '1天',
                    value: () => dayjs().add(1, 'day')
                  },
                  {
                    label: '3天',
                    value: () => dayjs().add(3, 'day')
                  },
                  {
                    label: '7天',
                    value: () => dayjs().add(7, 'day')
                  },
                  {
                    label: '30天',
                    value: () => dayjs().add(30, 'day')
                  }
                ]" />
            </a-form-item>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="120px">
            <a-form-item field="share_pwd" :rules="[{ length: 4, message: '提取码必须是4个字符' }]">
              <a-input v-model="form.share_pwd" tabindex="-1" placeholder="没有不填" />
            </a-form-item>
          </a-col>
          <a-col flex="auto"></a-col>
        </a-row>
      </a-form>
    </div>
    <div class="modalfoot">
      <a-button type="outline" size="small" :loading="okLoading" @click="() => handleOK(true)">为每个文件单独创建</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="() => handleOK(false)">创建分享链接</a-button>
    </div>
  </a-modal>
</template>

<style></style>
