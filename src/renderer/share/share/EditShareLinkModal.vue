<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import dayjs from 'dayjs'
import { useMyShareStore, useUserStore } from '../../store'
import message from '../../utils/message'
import { copyToClipboard, openExternal } from '../../utils/electronhelper'
import { IAliShareItem } from '../../aliapi/alimodels'
import AliShare, { UpdateShareModel } from '../../aliapi/share'
import { modalCloseAll } from '../../utils/modal'
import { GetShareUrlFormate } from '../../utils/shareurl'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    sharelist: {
      type: Array as PropType<IAliShareItem[]>,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const shareName = ref('')
    const sharePwd = ref('')
    const shareDate = ref('')

    const handleOpen = () => {
      shareName.value = props.sharelist.length > 0 ? props.sharelist[0].share_name : ''
      sharePwd.value = props.sharelist.length > 0 ? props.sharelist[0].share_pwd : ''
      let date = props.sharelist.length > 0 ? props.sharelist[0].expiration : ''
      if (date) date = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
      shareDate.value = date
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      shareName.value = ''
      sharePwd.value = ''
      shareDate.value = ''
    }

    return { okLoading, handleOpen, handleClose, shareName, sharePwd, shareDate, dayjs }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleSaveEditLink() {
      let expiration = this.shareDate
      const mindate = new Date()
      mindate.setMinutes(mindate.getMinutes() + 2)
      if (expiration) expiration = new Date(expiration) < mindate ? mindate.toISOString() : new Date(expiration).toISOString()
      else expiration = ''

      const share_pwd = this.sharePwd.trim().replaceAll(' ', '')
      if (share_pwd.length != 4 && share_pwd.length != 0) {
        message.error('提取码必须为 空 或者 4位 数字字母汉字特殊字符的组合')
        return
      }

      let share_name = this.shareName.trim().replaceAll('"', '')
      share_name = share_name.replace(/[<>:"\\|?*]+/g, '')
      share_name = share_name.replace(/[\f\n\r\t\v]/g, '')
      while (share_name.endsWith(' ') || share_name.endsWith('.')) share_name = share_name.substring(0, share_name.length - 1)

      if (share_name.length < 1) {
        message.error('必须填写名称')
        return
      }

      const files = this.sharelist
      const idList: string[] = []
      const expLsit: string[] = []
      const pwdList: string[] = []
      let nameList: string[] | undefined = []
      for (let i = 0, maxi = files.length; i < maxi; i++) {
        idList.push(files[i].share_id)
        expLsit.push(expiration)
        pwdList.push(share_pwd)
        nameList.push(share_name)
      }

      if (files.length > 1) nameList = undefined 
      const user_id = useUserStore().user_id
      AliShare.ApiUpdateShareBatch(user_id, idList, expLsit, pwdList, nameList).then((success: UpdateShareModel[]) => {
        useMyShareStore().mUpdateShare(success)
        modalCloseAll()
      })
    },
    handleOpenShare() {
      const url = this.sharelist[0].share_url
      if (this.sharelist[0].share_pwd) {
        copyToClipboard(this.sharelist[0].share_pwd)
        message.success('提取码已复制到剪切板')
      }
      openExternal(url)
    },
    handleCopyShare() {
      const url = GetShareUrlFormate(this.sharelist[0].share_name, this.sharelist[0].share_url, this.sharelist[0].share_pwd)
      copyToClipboard(url)
      message.success('分享链接已复制到剪切板')
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>{{ sharelist.length == 1 ? '修改分享链接' : '批量修改分享链接' }}</template>
    <div style="width: 500px">
      <div v-if="sharelist.length == 1" class="sharelinkcopy">
        <a title="点击打开" class="sharelinkcopya" @click="handleOpenShare"> {{ sharelist[0].share_url }}{{ sharelist[0].share_pwd ? ' 提取码：' + sharelist[0].share_pwd : '' }} </a>
        <a-button-group>
          <a-button type="outline" size="mini" tabindex="-1" title="复制链接" @click="handleCopyShare">复制</a-button>
          <a-button type="outline" size="mini" tabindex="-1" title="打开链接" @click="handleOpenShare">打开</a-button>
        </a-button-group>
      </div>
      <div v-else class="sharelinkcopy">
        <a class="sharelinkcopya"> 批量修改已选中的 {{ sharelist.length }} 条分享链接，统一链接的有效期和提取码 </a>
      </div>
      <div v-if="sharelist.length == 1" style="margin-top: 20px">
        <a-row>
          <a-col flex="auto"> 分享链接名称：</a-col>
        </a-row>
        <a-row>
          <a-col flex="auto">
            <a-input v-model="shareName" tabindex="-1" />
          </a-col>
        </a-row>
      </div>
      <div style="margin-top: 20px">
        <a-row>
          <a-col flex="200px"> 有效期：</a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="100px"> 提取码：</a-col>
          <a-col flex="auto"></a-col>
        </a-row>
        <a-row>
          <a-col flex="200px">
            <a-date-picker
              v-model="shareDate"
              style="width: 200px; margin: 0"
              show-time
              :preview-shortcut="false"
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
                  label: '1周',
                  value: () => dayjs().add(1, 'week')
                },
                {
                  label: '1月',
                  value: () => dayjs().add(1, 'month')
                }
              ]" />
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="100px">
            <a-input v-model="sharePwd" tabindex="-1" placeholder="没有不填" />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="60px">
            <a-button type="primary" tabindex="-1" :loading="okLoading" @click="handleSaveEditLink">{{ sharelist.length > 1 ? '批量更新' : '更新' }}</a-button>
          </a-col>
        </a-row>
      </div>
      <div style="margin-top: 20px"></div>
    </div>
  </a-modal>
</template>
<style>
.sharelinkcopy {
  width: 100%;
  height: 44px;
  color: rgba(37, 38, 43, 0.36);
  background-color: rgba(132, 133, 141, 0.08);
  border-radius: 4px;
  -webkit-backdrop-filter: saturate(150%) blur(30px);
  backdrop-filter: saturate(150%) blur(30px);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
body[arco-theme='dark'] .sharelinkcopy {
  color: rgba(211, 216, 241, 0.45);
}
.sharelinkcopya {
  margin: 0;
  white-space: pre;
  max-width: calc(100% - 96px);
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  cursor: pointer;
  font-size: 13px;
}
</style>
