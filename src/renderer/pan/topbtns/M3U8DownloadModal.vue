<script lang="ts">
import AliFile from '../../aliapi/file'
import { IVideoPreviewUrl } from '../../aliapi/models'
import { usePanFileStore, usePanTreeStore } from '../../store'
import { copyToClipboard } from '../../utils/electronhelper'
import { humanTime } from '../../utils/format'
import message from '../../utils/message'
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

    const user_id = ref('')
    const drive_id = ref('')
    const file_id = ref('')
    const file_name = ref('')

    const m3u8List = ref<string[]>([])
    const m3u8Info = ref('')
    const videoPreview = ref<IVideoPreviewUrl>()
    const handleOpen = async () => {
      okLoading.value = true
      const first = usePanFileStore().GetSelectedFirst()!
      user_id.value = usePanTreeStore().user_id
      drive_id.value = first.drive_id
      file_id.value = first.file_id
      file_name.value = first.name
      const info = await AliFile.ApiFileInfo(user_id.value, first.drive_id, first.file_id)
      if (!info) {
        message.error('读取文件链接失败，请重试')
        return
      }

      const preview = await AliFile.ApiVideoPreviewUrl(user_id.value, first.drive_id, first.file_id)
      if (preview) {
        videoPreview.value = preview
        let info = ''
        if (preview.urlFHD) {
          m3u8List.value.push('1080P')
          if (!info) info = '1080P'
        }
        if (preview.urlHD) {
          m3u8List.value.push('720P')
          if (!info) info = '720P'
        }
        if (preview.urlSD) {
          m3u8List.value.push('540P')
          if (!info) info = '540P'
        }
        if (preview.urlLD) {
          m3u8List.value.push('480P')
          if (!info) info = '480P'
        }

        m3u8Info.value = '时长：' + humanTime(preview.duration) + '  分辨率：' + preview.width + ' x ' + preview.height + '  清晰度：' + info
      }
    }

    const handleDownload = (item: string) => {
      message.error('当前版本M3U8视频下载功能尚不可用，可以自行使用其他m3u8下载软件下载', 5)
      handleCopyUrl(item)
    }

    const handleCopyUrl = (item: string) => {
      let url = ''
      if (item == '1080P') url = videoPreview.value?.urlFHD || ''
      if (item == '720P') url = videoPreview.value?.urlHD || ''
      if (item == '540P') url = videoPreview.value?.urlSD || ''
      if (item == '480P') url = videoPreview.value?.urlLD || ''

      if (url) {
        copyToClipboard(url)
        message.success(item + ' M3U8下载链接已复制到剪切板')
      }
    }

    const handleClose = () => {
      
      m3u8List.value = []
      user_id.value = ''
      drive_id.value = ''
      file_id.value = ''
      file_name.value = ''
      if (okLoading.value) okLoading.value = false
    }
    return { okLoading, handleOpen, handleClose, file_name, m3u8Info, m3u8List, handleDownload, handleCopyUrl }
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
      <span class="modaltitle">下载转码后的视频</span>
    </template>
    <div class="modalbody" style="width: 540px">
      <div style="width: 100%">
        <a-input :model-value="m3u8Info" readonly />
      </div>

      <div class="arco-upload-list arco-upload-list-type-text">
        <div v-for="item in m3u8List" :key="item" class="arco-upload-list-item arco-upload-list-item-done">
          <div class="arco-upload-list-item-content">
            <div class="arco-upload-list-item-name">
              <span class="arco-upload-list-item-file-icon">
                <i class="iconfont iconluxiang"></i>
              </span>
              <a class="arco-upload-list-item-name-link" @click.stop="() => handleCopyUrl(item)">{{ file_name }}</a>
            </div>
            <span class="arco-upload-progress">
              <span class="arco-upload-icon arco-upload-icon-success" style="cursor: default">
                {{ item }}
              </span>
            </span>
          </div>
          <span class="arco-upload-list-item-operation">
            <a-button-group>
              <a-button type="outline" size="small" @click="() => handleCopyUrl(item)">复制</a-button>
              <a-button type="outline" size="small" @click="() => handleDownload(item)">下载</a-button>
            </a-button-group>
          </span>
        </div>
      </div>

      <a-typography style="background: var(--color-fill-2); padding: 8px; margin-top: 24px">
        <a-typography-paragraph>说明:</a-typography-paragraph>
        <ul>
          <li>转码视频下载功能当前版本不可用</li>
          <li>m3u8是一堆ts文件，下载后会自动合并成一个完整的文件</li>
        </ul>
      </a-typography>
    </div>
  </a-modal>
</template>

<style></style>
