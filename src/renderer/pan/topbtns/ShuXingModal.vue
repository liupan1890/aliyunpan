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
    const fileinfo = ref<IAliFileItem>()
    const dirinfo = ref<IAliGetForderSizeModel>()
    const dirpath = ref('')
    const handleOpen = async () => {
      
      let file_id = ''
      const pantreeStore = usePanTreeStore()

      if (props.istree) {
        file_id = pantreeStore.selectDir.file_id
      } else {
        const panfileStore = usePanFileStore()
        file_id = panfileStore.GetSelected()[0].file_id
      }
      if (!file_id) {
        message.error('没有选中任何文件')
      } else {
        AliFile.ApiFileGetPathString(pantreeStore.user_id, pantreeStore.drive_id, file_id, '/').then((data) => {
          dirpath.value = '/' + data
        })
        fileinfo.value = await AliFile.ApiFileInfo(pantreeStore.user_id, pantreeStore.drive_id, file_id)

        if (fileinfo.value?.category == 'audio') {
          let audio = await AliFile.ApiAudioPreviewUrl(pantreeStore.user_id, pantreeStore.drive_id, file_id)
          if (audio && audio.url) fileinfo.value.thumbnail = audio.url
        } else if (fileinfo.value?.category == 'video') {
          let video = await AliFile.ApiVideoPreviewUrl(pantreeStore.user_id, pantreeStore.drive_id, file_id)
          if (video && video.url) fileinfo.value.thumbnail = video.url
        }

        if (fileinfo.value?.type == 'folder') {
          dirinfo.value = await AliFile.ApiFileGetFolderSize(pantreeStore.user_id, pantreeStore.drive_id, file_id)
        }
      }
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      dirinfo.value = { size: 0, folder_count: 0, file_count: 0, reach_limit: undefined }
      fileinfo.value = undefined
      dirpath.value = ''
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
        let exobj = JSON.parse(exif)
        if (exobj.Make && exobj.Make.value) msg += exobj.Make.value + ' '
        if (exobj.Model && exobj.Model.value) msg += exobj.Model.value + ' '
        return msg
      } catch (err:any) {
        DebugLog.mSaveWarning(exif, err)
      }
      return ''
    }

    const makeImageShiJian = (exif: string | undefined) => {
      if (!exif) return ''
      try {
        let exobj = JSON.parse(exif)
        if (exobj.DateTimeOriginal && exobj.DateTimeOriginal.value) return exobj.DateTimeOriginal.value
        if (exobj.DateTimeDigitized && exobj.DateTimeDigitized.value) return exobj.DateTimeDigitized.value
        if (exobj.DateTime && exobj.DateTime.value) return exobj.DateTime.value
      } catch (err:any) {
        DebugLog.mSaveWarning(exif, err)
      }
      return ''
    }

    const handleAudioPlay = () => {
      useFootStore().mSaveAudioUrl('')
    }
    return { okLoading, handleOpen, handleClose, fileinfo, dirinfo, dirpath, humanDateTimeDateStr, humanSize, humanTime, makeFenBianLv, makeImageSheBei, makeImageShiJian, handleAudioPlay }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {},

    handleCopyFileName() {
      if (this.fileinfo?.name) {
        copyToClipboard(this.fileinfo?.name)
        message.success('文件名已复制到剪切板')
      }
    },
    handleCopyJson() {
      if (this.fileinfo) {
        copyToClipboard(JSON.stringify(this.fileinfo))
        message.success('文件信息已复制到剪切板')
      }
    },
    handleCopyDownload() {
      const pantreeStore = usePanTreeStore()
      AliFile.ApiFileDownloadUrl(pantreeStore.user_id, pantreeStore.drive_id, this.fileinfo?.file_id || '', 14400).then((data) => {
        if (data && typeof data !== 'string' && data.url) {
          copyToClipboard(data.url)
          message.success('下载链接已复制到剪切板，4小时内有效')
        } else {
          message.error('下载链接获取失败，请稍后重试')
        }
      })
    },
    handleCopyThumbnail() {
      if (this.fileinfo?.thumbnail) {
        copyToClipboard(this.fileinfo?.thumbnail)
        message.success('预览链接已复制到剪切板')
      }
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass shuxingmodal" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">查看属性</span>
    </template>
    <div class="modalbody" style="width: 500px; max-height: calc(80vh - 100px); overflow-y: scroll">
      <a-row>
        <a-col flex="auto"> 路径：</a-col>
      </a-row>
      <div class="pathtitle">
        {{ dirpath }}
      </div>
      <div class="h16"></div>

      <a-row>
        <a-col flex="auto"> 文件名：</a-col>
      </a-row>
      <div class="shuxingbox">
        <span class="shuxingtitle">{{ fileinfo?.name }}</span>
        <a-button type="outline" size="mini" tabindex="-1" @click="handleCopyFileName" title="复制">复制</a-button>
      </div>
      <div class="h16"></div>

      <a-row>
        <a-col flex="110px"> 文件大小：</a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="170px"> 创建日期：</a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="180px"> 更新日期：</a-col>
      </a-row>
      <a-row>
        <a-col flex="110px">
          <a-input size="small" tabindex="-1" :model-value="humanSize(fileinfo?.size || dirinfo?.size || 0)" readonly />
        </a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="170px">
          <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileinfo?.created_at)" readonly />
        </a-col>
        <a-col flex="auto"></a-col>
        <a-col flex="180px">
          <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileinfo?.updated_at)" readonly />
        </a-col>
      </a-row>
      <div class="h16"></div>

      <div v-if="fileinfo?.type == 'file'">
        <a-row>
          <a-col flex="110px"> 分类：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px"> mime_type：</a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px"> crc64：</a-col>
        </a-row>
        <a-row>
          <a-col flex="110px">
            <a-input size="small" tabindex="-1" :model-value="fileinfo?.category" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="fileinfo?.mime_type" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input size="small" class="small" tabindex="-1" :model-value="fileinfo?.crc64_hash" readonly />
          </a-col>
        </a-row>
        <div class="h16"></div>

        <a-row>
          <a-col flex="1"> SHA1：</a-col>
        </a-row>
        <a-row>
          <a-col flex="1">
            <a-input size="small" class="small" tabindex="-1" :model-value="fileinfo?.content_hash" readonly />
          </a-col>
        </a-row>
      </div>
      <div v-else>
        <a-row>
          <a-col flex="1"> FolderSizeInfo：</a-col>
        </a-row>
        <a-row>
          <a-col flex="1">
            <a-input size="small" class="small" tabindex="-1" :model-value="'子文件大小：' + humanSize(dirinfo?.size) + '，子文件：' + dirinfo?.file_count + '个，子文件夹：' + dirinfo?.folder_count + '个'" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileinfo?.category == 'video'">
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
            <a-input size="small" tabindex="-1" :model-value="makeFenBianLv(fileinfo?.video_media_metadata?.width, fileinfo?.video_media_metadata?.height)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="humanTime(fileinfo?.video_media_metadata?.duration)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input size="small" tabindex="-1" :model-value="humanDateTimeDateStr(fileinfo?.video_media_metadata?.time)" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileinfo?.category == 'image'">
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
            <a-input size="small" tabindex="-1" :model-value="makeFenBianLv(fileinfo?.image_media_metadata?.width, fileinfo?.image_media_metadata?.height)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="170px">
            <a-input size="small" tabindex="-1" :model-value="makeImageSheBei(fileinfo?.image_media_metadata?.exif)" readonly />
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="180px">
            <a-input size="small" tabindex="-1" :model-value="makeImageShiJian(fileinfo?.image_media_metadata?.exif)" readonly />
          </a-col>
        </a-row>
      </div>

      <div v-if="fileinfo?.category == 'audio'">
        <div class="h16"></div>
        <div width="100%">
          <audio controls style="width: 100%; height: 32px" :src="fileinfo?.thumbnail" @play="handleAudioPlay">您的浏览器不支持 audio 元素</audio>
        </div>
      </div>

      <div class="h16"></div>
    </div>
    <div class="h16"></div>
    <div class="modalfoot">
      <a-button type="outline" size="small" @click="handleCopyJson">复制JSON</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="fileinfo?.category == 'video'" type="outline" size="small" @click="handleCopyThumbnail">复制M3U8链接</a-button>
      <a-button v-if="fileinfo?.category == 'audio'" type="outline" size="small" @click="handleCopyThumbnail">复制M3U8链接</a-button>
      <a-button v-if="fileinfo?.type !== 'folder'" type="outline" size="small" @click="handleCopyDownload">复制下载链接</a-button>
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
</style>
