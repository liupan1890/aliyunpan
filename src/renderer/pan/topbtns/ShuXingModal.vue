<script lang="ts">
import { IAliFileItem, IAliGetForderSizeModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import { useFootStore, usePanFileStore, usePanTreeStore } from '../../store'
import { copyToClipboard } from '../../utils/electronhelper'
import message from '../../utils/message'
import { modalCloseAll } from '../../utils/modal'
import { humanDateTimeDateStr, humanSize, humanTime } from '../../utils/format'
import { defineComponent, ref } from 'vue'
import DebugLog from '../../utils/debuglog'

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
    const fileInfo = ref<IAliFileItem>()
    const dirInfo = ref<IAliGetForderSizeModel>()
    const dirPath = ref('')
    const handleOpen = async () => {
      
      let file_id = ''
      const pantreeStore = usePanTreeStore()

      if (props.istree) {
        file_id = pantreeStore.selectDir.file_id
      } else {
        const panfileStore = usePanFileStore()
        let fileList = panfileStore.GetSelected()
        if (fileList.length == 0) {
          const focus = panfileStore.mGetFocus()
          panfileStore.mKeyboardSelect(focus, false, false)
          fileList = panfileStore.GetSelected()
        }
        file_id = fileList[0].file_id
      }
      if (!file_id) {
        message.error('没有选中任何文件')
      } else {
        AliFile.ApiFileGetPathString(pantreeStore.user_id, pantreeStore.drive_id, file_id, '/').then((data) => {
          dirPath.value = '/' + data
        })
        fileInfo.value = await AliFile.ApiFileInfo(pantreeStore.user_id, pantreeStore.drive_id, file_id)

        if (fileInfo.value?.category == 'audio') {
          const audio = await AliFile.ApiAudioPreviewUrl(pantreeStore.user_id, pantreeStore.drive_id, file_id)
          if (audio && audio.url) fileInfo.value.thumbnail = audio.url
        } else if (fileInfo.value?.category == 'video') {
          const video = await AliFile.ApiVideoPreviewUrl(pantreeStore.user_id, pantreeStore.drive_id, file_id)
          if (video && video.url) fileInfo.value.thumbnail = video.url
        }

        if (fileInfo.value?.type == 'folder') {
          dirInfo.value = await AliFile.ApiFileGetFolderSize(pantreeStore.user_id, pantreeStore.drive_id, file_id)
        }
      }
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      dirInfo.value = { size: 0, folder_count: 0, file_count: 0, reach_limit: undefined }
      fileInfo.value = undefined
      dirPath.value = ''
    }

    const makeFenBianLv = (width: number | undefined, height: number | undefined) => {
      if (!width) width = 0
      if (!height) height = 0
      if (width == 0 || height == 0) return ''
      return width + ' x ' + height
    }

    const makeImageSheBei = (exif: string | undefined) => {
      if (!exif) return ''
      try {
        let msg = ''
        const exobj = JSON.parse(exif)
        if (exobj.Make && exobj.Make.value) msg += exobj.Make.value + ' '
        if (exobj.Model && exobj.Model.value) msg += exobj.Model.value + ' '
        return msg
      } catch (err: any) {
        DebugLog.mSaveWarning(exif, err)
      }
      return ''
    }

    const makeImageShiJian = (exif: string | undefined) => {
      if (!exif) return ''
      try {
        const exobj = JSON.parse(exif)
        if (exobj.DateTimeOriginal && exobj.DateTimeOriginal.value) return exobj.DateTimeOriginal.value
        if (exobj.DateTimeDigitized && exobj.DateTimeDigitized.value) return exobj.DateTimeDigitized.value
        if (exobj.DateTime && exobj.DateTime.value) return exobj.DateTime.value
      } catch (err: any) {
        DebugLog.mSaveWarning(exif, err)
      }
      return ''
    }

    const handleAudioPlay = () => {
      useFootStore().mSaveAudioUrl('')
    }
    const formateCRC = ref(true)
    const handleCRC = () => {
      formateCRC.value = !formateCRC.value
    }
    const formateSize = ref(true)
    const handleSize = () => {
      formateSize.value = !formateSize.value
    }
    return { okLoading, handleOpen, handleClose, fileInfo, dirInfo, dirPath, humanDateTimeDateStr, humanSize, humanTime, makeFenBianLv, makeImageSheBei, makeImageShiJian, handleAudioPlay, formateCRC, handleCRC, formateSize, handleSize }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {},

    handleCopyFileName() {
      if (this.fileInfo?.name) {
        copyToClipboard(this.fileInfo?.name)
        message.success('文件名已复制到剪切板')
      }
    },
    handleCopyJson() {
      if (this.fileInfo) {
        copyToClipboard(JSON.stringify(this.fileInfo))
        message.success('文件信息已复制到剪切板')
      }
    },
    handleCopyDownload() {
      const pantreeStore = usePanTreeStore()
      AliFile.ApiFileDownloadUrl(pantreeStore.user_id, pantreeStore.drive_id, this.fileInfo?.file_id || '', 14400).then((data) => {
        if (data && typeof data !== 'string' && data.url) {
          copyToClipboard(data.url)
          message.success('下载链接已复制到剪切板，4小时内有效')
        } else {
          message.error('下载链接获取失败，请稍后重试')
        }
      })
    },
    handleCopyThumbnail() {
      if (this.fileInfo?.thumbnail) {
        copyToClipboard(this.fileInfo?.thumbnail)
        message.success('预览链接已复制到剪切板')
      }
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass shuxingmodal" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">查看属性</span>
    </template>
    <div class="modalbody" style="width: 500px; max-height: calc(80vh - 100px); overflow-y: scroll">
      <a-row>
        <a-col flex="auto"> 路径：</a-col>
      </a-row>
      <div class="pathtitle">
        {{ dirPath }}
      </div>
      <div class="h16"></div>

      <a-row>
        <a-col flex="auto"> 文件名：</a-col>
      </a-row>
      <div class="shuxingbox">
        <span class="shuxingtitle">{{ fileInfo?.name }}</span>
        <a-button type="outline" size="mini" tabindex="-1" title="复制" @click="handleCopyFileName">复制</a-button>
      </div>
      <div class="h16"></div>

      <a-row>
        <a-col flex="110px"> 文件大小： <i class="iconfont iconchakan link" title="点击切换格式" @click="handleSize"></i></a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="170px"> 创建日期：</a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="180px"> 更新日期：</a-col>
      </a-row>
      <a-row>
        <a-col flex="110px">
          <a-input size="small" tabindex="-1" :model-value="formateSize ? humanSize(fileInfo?.size || dirInfo?.size || 0) : (fileInfo?.size || dirInfo?.size || 0) + ' 字节'" readonly />
        </a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="170px">
          <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileInfo?.created_at)" readonly />
        </a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="180px">
          <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileInfo?.updated_at)" readonly />
        </a-col>
      </a-row>
      <div class="h16"></div>

      <div v-if="fileInfo?.type == 'file'">
        <a-row>
          <a-col flex="110px"> 分类：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px"> mime_type：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px"> crc64：<i class="iconfont iconchakan link" title="点击切换格式" @click="handleCRC"></i></a-col>
        </a-row>
        <a-row>
          <a-col flex="110px">
            <a-input size="small" tabindex="-1" :model-value="fileInfo?.category" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="fileInfo?.mime_type" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input
              size="small"
              class="small"
              tabindex="-1"
              :model-value="
                formateCRC
                  ? fileInfo?.crc64_hash
                  : parseInt(fileInfo?.crc64_hash || '0')
                      .toString(16)
                      .toUpperCase()
              "
              readonly />
          </a-col>
        </a-row>
        <div class="h16"></div>

        <a-row>
          <a-col flex="1"> SHA1：</a-col>
        </a-row>
        <a-row>
          <a-col flex="1">
            <a-input size="small" class="small" tabindex="-1" :model-value="fileInfo?.content_hash" readonly />
          </a-col>
        </a-row>
      </div>
      <div v-else>
        <a-row>
          <a-col flex="1"> FolderSizeInfo：</a-col>
        </a-row>
        <a-row>
          <a-col flex="1">
            <a-input size="small" class="small" tabindex="-1" :model-value="'子文件大小：' + humanSize(dirInfo?.size) + '，子文件：' + dirInfo?.file_count + '个，子文件夹：' + dirInfo?.folder_count + '个'" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileInfo?.category == 'video'">
        <div class="h16"></div>
        <a-row>
          <a-col flex="110px"> 分辨率：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px"> 视频时长：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px"> 制作日期：</a-col>
        </a-row>
        <a-row>
          <a-col flex="110px">
            <a-input size="small" tabindex="-1" :model-value="makeFenBianLv(fileInfo?.video_media_metadata?.width, fileInfo?.video_media_metadata?.height)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="humanTime(fileInfo?.video_media_metadata?.duration)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileInfo?.video_media_metadata?.time)" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileInfo?.category == 'image'">
        <div class="h16"></div>
        <a-row>
          <a-col flex="110px"> 分辨率：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px"> 拍摄设备：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px"> 拍摄日期：</a-col>
        </a-row>
        <a-row>
          <a-col flex="110px">
            <a-input size="small" tabindex="-1" :model-value="makeFenBianLv(fileInfo?.image_media_metadata?.width, fileInfo?.image_media_metadata?.height)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="makeImageSheBei(fileInfo?.image_media_metadata?.exif)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input size="small" tabindex="-1" :model-value="makeImageShiJian(fileInfo?.image_media_metadata?.exif)" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileInfo?.category == 'audio'">
        <div class="h16"></div>
        <div width="100%">
          <audio controls style="width: 100%; height: 32px" :src="fileInfo?.thumbnail" @play="handleAudioPlay">您的浏览器不支持 audio 元素</audio>
        </div>
      </div>

      <div class="h16"></div>
    </div>
    <div class="h16"></div>
    <div class="modalfoot">
      <a-button type="outline" size="small" @click="handleCopyJson">复制JSON</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="fileInfo?.category == 'video'" type="outline" size="small" @click="handleCopyThumbnail">复制M3U8链接</a-button>
      <a-button v-if="fileInfo?.category == 'audio'" type="outline" size="small" @click="handleCopyThumbnail">复制M3U8链接</a-button>
      <a-button v-if="fileInfo?.type !== 'folder'" type="outline" size="small" @click="handleCopyDownload">复制下载链接</a-button>
    </div>
  </a-modal>
</template>

<style>
.shuxingbox {
  width: 100%;

  background-color: rgba(132, 133, 141, 0.08);
  border-radius: 4px;
  -webkit-backdrop-filter: saturate(150%) blur(30px);
  backdrop-filter: saturate(150%) blur(30px);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shuxingtitle {
  color: rosybrown;
  margin: 0;
  max-width: calc(100% - 48px);
  display: inline-block;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  user-select: text;
}
.shuxingbox button {
  align-self: flex-end;
  padding: 0 8px;
}

.pathtitle {
  color: var(--color-text-3);
  margin: 0;
  max-width: calc(100%);
  display: inline-block;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  user-select: text;

  background-color: var(--color-fill-2);
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}

.h16 {
  padding-top: 16px;
}

.shuxingmodal .arco-input-wrapper {
  padding: 0 8px;
}

.shuxingmodal .small .arco-input {
  font-size: 13px !important;
  line-height: 22px !important;
}

i.link {
  color: rgb(var(--primary-6));
  cursor: pointer;
}
</style>
