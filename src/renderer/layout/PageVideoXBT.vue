<script lang="ts">
import { IAliFileAudioMeta, IAliFileItem, IAliFileVideoMeta } from '../aliapi/alimodels'
import AliFile from '../aliapi/file'
import { IVideoXBTUrl } from '../aliapi/models'
import { useAppStore, useSettingStore } from '../store'
import { copyToClipboard } from '../utils/electronhelper'
import { humanSize, humanTime } from '../utils/format'
import message from '../utils/message'
import { computed, defineComponent, onMounted, ref } from 'vue'
import domtoimage from 'dom-to-image'

export default defineComponent({
  setup() {
    const handleHideClick = (_e: any) => {
      window.close()
    }
    const appStore = useAppStore()
    const settingStore = useSettingStore()
    const loading = ref(false)
    const preview = ref(false)
    const error = ref('')
    const fileInfo = ref<IAliFileItem>()
    const rowNum = ref(4)
    const imageList = ref<IVideoXBTUrl[]>([])

    onMounted(() => {
      handleWinSizeClick(settingStore.uiXBTWidth || 960)
      loadXBT()

      const name = '视频雪碧图 ' + (appStore.pageVideoXBT?.file_name || '')
      setTimeout(() => {
        document.title = name
      }, 1000)
      setTimeout(() => {
        document.title = name
      }, 10000)
    })

    const loadXBT = async () => {
      const pageVideoXBT = appStore.pageVideoXBT!

      
      loading.value = true
      const alifile = await AliFile.ApiFileInfo(pageVideoXBT.user_id, pageVideoXBT.drive_id, pageVideoXBT.file_id)

      if (!alifile) {
        message.error('错误的文件')
        error.value = '错误的文件'
        return
      }
      let duration = Math.ceil(Number.parseFloat(alifile.video_media_metadata?.duration?.toString() || alifile.video_preview_metadata?.duration?.toString() || '0'))
      if (duration <= 0) {
        message.error('错误的文件(视频时长错误)')
        error.value = '错误的文件(视频时长错误)'
        fileInfo.value = alifile
        duration = 1800 
      }

      const x = Math.max(alifile?.video_media_metadata?.width || 0, alifile?.video_preview_metadata?.width || 0)
      const y = Math.max(alifile?.video_media_metadata?.height || 0, alifile?.video_preview_metadata?.height || 0)

      const uiXBTNumber = settingStore.uiXBTNumber || 36
      
      AliFile.ApiBiXueTuBatch(pageVideoXBT.user_id, pageVideoXBT.drive_id, pageVideoXBT.file_id, duration, uiXBTNumber, 720).then((data) => {
        fileInfo.value = alifile
        rowNum.value = x > y ? 3 : 4
        loading.value = false
        imageList.value = data
      })
    }

    const handleWinSizeClick = (size: number) => {
      settingStore.uiXBTWidth = size
      window.resizeTo(size + 32, window.outerHeight)
      let node = document.getElementById('docxbttop')
      if (node) node.style.width = size + 'px'
      node = document.getElementById('docxbt')
      if (node) node.style.width = size + 'px'
    }

    const handleCopyM3U8Click = () => {
      const pageVideoXBT = appStore.pageVideoXBT!
      AliFile.ApiVideoPreviewUrl(pageVideoXBT.user_id, pageVideoXBT.drive_id, pageVideoXBT.file_id).then((data) => {
        if (data && data.url) {
          copyToClipboard(data.url)
          message.success('视频的M3U8链接已复制，4小时内有效')
        } else {
          message.error('视频的M3U8链接获取失败，请稍后重试')
        }
      })
    }
    const handleCopyDownClick = () => {
      const pageVideoXBT = appStore.pageVideoXBT!
      AliFile.ApiFileDownloadUrl(pageVideoXBT.user_id, pageVideoXBT.drive_id, pageVideoXBT.file_id, 14400).then((data) => {
        if (data && typeof data !== 'string' && data.url) {
          copyToClipboard(data.url)
          message.success('视频的下载链接已复制，4小时内有效')
        } else {
          message.error('视频的下载链接获取失败，请稍后重试')
        }
      })
    }

    const handleSaveImageClick = () => {
      loading.value = true
      const node = document.getElementById('docxbt')
      const width = node?.clientWidth || 0
      domtoimage
        .toPng(node, { bgcolor: '#23232e' })
        .then((dataUrl: any) => {
          loading.value = false
          const link = document.createElement('a')
          link.download = appStore.pageVideoXBT?.file_name + '_' + width.toString() + '.png'
          link.href = dataUrl
          link.click()
        })
        .catch((err: any) => {
          loading.value = false
          message.error('生成雪碧图出错', err)
        })
    }

    const getFenBianLv = computed(() => {
      const x = Math.max(fileInfo.value?.video_media_metadata?.width || 0, fileInfo.value?.video_preview_metadata?.width || 0)
      const y = Math.max(fileInfo.value?.video_media_metadata?.height || 0, fileInfo.value?.video_preview_metadata?.height || 0)
      return x.toString() + 'x' + y.toString()
    })

    const getVideoInfo = computed(() => {
      let info = ''
      let metas: IAliFileVideoMeta[] = []
      if (fileInfo.value?.video_media_metadata?.video_media_video_stream) {
        if (Array.isArray(fileInfo.value?.video_media_metadata?.video_media_video_stream)) {
          metas = fileInfo.value?.video_media_metadata?.video_media_video_stream
        } else {
          metas = [fileInfo.value?.video_media_metadata?.video_media_video_stream]
        }
      }

      for (let i = 0, maxi = metas.length; i < maxi; i++) {
        const meta = metas[i]
        if (meta.code_name == 'mjpeg') continue
        let one = ''

        if (meta.code_name) one += '    编码=' + meta.code_name.toUpperCase()
        if (meta.bitrate) {
          let bit = parseInt(meta.bitrate)
          let bitdw = 'bps'
          if (bit / 1000 > 40) {
            bit = bit / 1000
            bitdw = 'kbps'
          }
          if (bit / 1000 > 40) {
            bit = bit / 1000
            bitdw = 'mbps'
          }
          one += '    码率=' + Math.floor(bit) + bitdw
        }
        if (meta.fps) {
          one += '    帧率=' + meta.fps
          const fps = meta.fps.split('/')
          if (fps.length == 2) {
            const fpsn = parseInt(fps[0]) / parseInt(fps[1])
            one += ' (' + fpsn.toFixed(1) + ')'
          }
        }
        if (i > 0) info += ';'
        info += one
      }
      info = info.trimStart()

      if (!info) return ''
      return info
    })

    const getAudioInfo = computed(() => {
      let info = ''
      let metas: IAliFileAudioMeta[] = []
      if (fileInfo.value?.video_media_metadata?.video_media_audio_stream) {
        if (Array.isArray(fileInfo.value?.video_media_metadata?.video_media_audio_stream)) {
          metas = fileInfo.value?.video_media_metadata?.video_media_audio_stream
        } else {
          metas = [fileInfo.value?.video_media_metadata?.video_media_audio_stream]
        }
      }

      const audioList: string[] = []
      for (let i = 0, maxi = metas.length; i < maxi; i++) {
        const meta = metas[i]
        let one = ''
        if (meta.code_name) one += '    编码=' + meta.code_name.toUpperCase()

        if (meta.bit_rate) {
          let bit = parseInt(meta.bit_rate)
          let bitdw = 'bps'
          if (bit / 1000 > 8) {
            bit = bit / 1000
            bitdw = 'kbps'
          }
          if (bit / 1000 > 8) {
            bit = bit / 1000
            bitdw = 'mbps'
          }
          one += '    码率=' + Math.floor(bit) + bitdw
        }
        if (meta.sample_rate) one += '    采样率=' + meta.sample_rate + 'Hz'
        if (meta.channels) one += '    声道数=' + meta.channels
        if (meta.channel_layout) one += '    声道=' + meta.channel_layout.replace('stereo', '立体声').replace('mono', '单声道').replace('quad', '四通道')
        if (audioList.includes(one) == false) {
          audioList.push(one)
        }
      }
      if (metas.length > 1) info = '    音轨=' + metas.length.toString()
      info += audioList.join(';')
      info = info.trimStart()
      if (!info) return ''
      return info
    })

    const getPreviewInfo = computed(() => {
      let info = ''
      const meta = fileInfo.value?.video_preview_metadata
      if (meta) {
        let one = ''
        if (meta.video_format) one += '    视频编码=' + meta.video_format.toUpperCase()
        if (meta.bitrate) {
          let bit = parseInt(meta.bitrate)
          let bitdw = 'bps'
          if (bit / 1000 > 100) {
            bit = bit / 1000
            bitdw = 'kbps'
          }
          if (bit / 1000 > 100) {
            bit = bit / 1000
            bitdw = 'mbps'
          }
          one += '    总码率=' + Math.floor(bit) + bitdw
        }
        if (meta.frame_rate) {
          one += '    帧率=' + meta.frame_rate
          const fps = meta.frame_rate.split('/')
          if (fps.length == 2) {
            const fpsn = parseInt(fps[0]) / parseInt(fps[1])
            one += ' (' + fpsn.toFixed(1) + ')'
          }
        }
        if (meta.audio_format) one += '    音频编码=' + meta.audio_format.toUpperCase()
        info = one
      }
      info = info.trimStart()
      if (!info) return ''
      return info
    })

    return {
      handleHideClick,
      appStore,
      settingStore,
      loading,
      preview,
      rowNum,
      fileinfo: fileInfo,
      imagelist: imageList,
      handleWinSizeClick,
      handleCopyM3U8Click,
      handleCopyDownClick,
      handleSaveImageClick,
      humanSize,
      humanTime,
      getFenBianLv,
      getVideoInfo,
      getAudioInfo,
      getPreviewInfo
    }
  }
})
</script>

<template>
  <a-layout style="height: 100vh" draggable="false">
    <a-layout-header id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <a-button type="text" tabindex="-1">
          <i class="iconfont iconfile_video"></i>
        </a-button>
        <div class="title">视频雪碧图 {{ appStore.pageVideoXBT?.file_name || '' }}</div>
        <div class="flexauto"></div>
        <a-button type="text" tabindex="-1" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="height: calc(100vh - 42px); padding: 12px 6px 12px 16px">
      <div id="doc-preview" class="doc-preview" style="width: 100%; height: 100%; overflow: auto; text-align: center">
        <div id="docxbttop" class="xbtbtns settingbody" style="text-align: left">
          <a-radio-group type="button" size="small" tabindex="-1" :model-value="settingStore.uiXBTWidth" @update:model-value="handleWinSizeClick($event as number)">
            <a-radio tabindex="-1" :value="720">720P</a-radio>
            <a-radio tabindex="-1" :value="960">960P</a-radio>
            <a-radio tabindex="-1" :value="1080">1080P</a-radio>
            <a-radio tabindex="-1" :value="1280">1280P</a-radio>
          </a-radio-group>

          <div style="margin-right: 12px"></div>

          <a-button type="outline" size="small" tabindex="-1" :loading="loading" title="下载雪碧图到本地" @click="handleSaveImageClick"> <i class="iconfont icondownload"></i>保存雪碧图 </a-button>

          <div style="flex-grow: 1"></div>
          <a-button v-if="false" type="outline" size="small" tabindex="-1" title="复制M3U8链接" @click="handleCopyM3U8Click"> <i class="iconfont iconlink2"></i>M3U8链接 </a-button>

          <div style="margin-right: 12px"></div>
          <a-button v-if="false" type="outline" size="small" tabindex="-1" title="复制原文件链接" @click="handleCopyDownClick"> <i class="iconfont iconlink2"></i>下载链接 </a-button>

          <div style="margin-right: 12px"></div>
        </div>

        <div id="docxbt" style="margin: 0 auto; text-align: left">
          <div class="xbtinfo" style="color: #ffffffd9; padding: 24px 8px 16px 16px; background: #17171f; border-radius: 4px; white-space: pre-wrap; margin-bottom: 2px">
            <h3 style="color: #fffffff2; font-size: 18px; font-weight: 500; line-height: 1.40625">{{ fileinfo?.name }}</h3>
            <div>
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 文件大小 </span>
              ：{{ humanSize(fileinfo?.size || 0) }}
            </div>
            <div>
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 分辨率 </span>
              ：{{ getFenBianLv }}
            </div>
            <div>
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 播放时长 </span>
              ：{{ humanTime(fileinfo?.video_media_metadata?.duration || fileinfo?.video_preview_metadata?.duration || 0) }}
            </div>

            <div v-if="getVideoInfo">
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 视频信息 </span>
              ：{{ getVideoInfo }}
            </div>

            <div v-if="getAudioInfo">
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 音频信息 </span>
              ：{{ getAudioInfo }}
            </div>

            <div v-if="getPreviewInfo">
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 预览信息 </span>
              ：{{ getPreviewInfo }}
            </div>
            <div v-if="fileinfo?.video_media_metadata?.time || ''">
              <span class="xinfo" style="display: inline-block; width: 66px; text-align: right"> 创建时间 </span>
              ：{{ fileinfo?.video_media_metadata?.time }}
            </div>
          </div>
          <div class="xbtvideo" style="display: flex; flex-wrap: wrap; border: 2px solid #17171f; border-bottom: 24px solid #17171f; padding: 16px; border-radius: 4px; background: #17171f">
            <a-image-preview-group @visible-change="(val:boolean)=>{preview=val}">
              <div v-for="(item, index) in imagelist" :key="'xbt-' + index.toString()" class="xbtimage" :style="{ width: rowNum == 4 ? '25%' : '33.333%' }">
                <a-image width="100%" :src="item.url" />
                <div class="xbttime" style="text-align: center; color: #ffffffa6">
                  {{ item.time }}
                </div>
              </div>
            </a-image-preview-group>
          </div>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
.xbtbtns {
  margin: 14px auto 36px auto;
  display: flex;
}

.xbtimage {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
  border: 2px solid #17171f;
  min-height: 100px;
}
</style>
