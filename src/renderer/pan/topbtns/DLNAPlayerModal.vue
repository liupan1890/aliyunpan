<script lang="ts">
import AliFile from '../../aliapi/file'
import { usePanFileStore, usePanTreeStore } from '../../store'
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

    const playerList = ref<any[]>([])
    let dlnacasts: any
    const handleOpen = () => {
      okLoading.value = true
      dlnacasts = window.require('dlnacasts2')()
      dlnacasts.on('update', function (player: any) {
        playerList.value.push(player) 
      })

      setTimeout(() => {
        okLoading.value = false
      }, 15000)
    }

    const handlePlay = async (index: number, mode: string) => {
      if (playerList.value.length <= index) {
        message.error('找不到指定的投屏设备')
        return
      }
      const playercurr = playerList.value[index]
      const first = usePanFileStore().GetSelectedFirst()!
      const user_id = usePanTreeStore().user_id
      const info = await AliFile.ApiFileInfo(user_id, first.drive_id, first.file_id)
      if (!info) {
        message.error('读取文件链接失败，请重试')
        return
      }
      let play_cursor = 0
      try {
        if (info?.play_cursor) {
          play_cursor = info?.play_cursor
        } else if (info?.user_meta) {
          const meta = JSON.parse(info?.user_meta)
          if (meta.play_cursor) {
            play_cursor = parseFloat(meta.play_cursor)
          }
        }
      } catch {}

      if (mode != 'm3u8') {
        // playercurr.stop()
        // await Sleep(2000)
        playercurr.play(
          info?.download_url,
          {
            title: info.name,
            type: 'video/mp4',
            seek: play_cursor > 10 ? play_cursor : 0
          },
          (e: any) => {
            console.log('cb1', e)
          }
        )
      } else {
        
        const preview = await AliFile.ApiVideoPreviewUrl(user_id, first.drive_id, first.file_id)
        if (preview) {
          const subtitles: string[] = []
          if (preview.subtitles.length > 0) {
            for (let i = 0; i < preview.subtitles.length; i++) {
              subtitles.push(preview.subtitles[i].url)
            }
          }
          // playercurr.stop()
          // await Sleep(2000)
          playercurr.play(
            preview.url,
            {
              title: info.name,
              type: 'application/x-mpegURL',
              seek: play_cursor > 10 ? play_cursor : 0,
              autoSubtitles: subtitles && subtitles.length > 0,
              subtitles: subtitles
            },
            (e: any) => {
              console.log('cb2', e)
            }
          )
        }
      }
    }

    const handleClose = () => {
      
      playerList.value = []
      if (dlnacasts) dlnacasts.destroy()
      if (okLoading.value) okLoading.value = false
    }
    return { okLoading, handleOpen, handleClose, playerList, handlePlay }
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
      <span class="modaltitle">DLNA投屏</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <div v-if="okLoading" style="width: 100%; display: flex; justify-content: center">
        <a-spin dot tip="正在查找可投屏设备..." />
      </div>

      <div class="arco-upload-list arco-upload-list-type-text">
        <div v-for="(item, index) in playerList" :key="'P' + index" class="arco-upload-list-item arco-upload-list-item-done">
          <div class="arco-upload-list-item-content">
            <div class="arco-upload-list-item-name">
              <span class="arco-upload-list-item-file-icon">
                <i class="iconfont icontouping2"></i>
              </span>
              <a class="arco-upload-list-item-name-link">{{ item.name }} - {{ item.host }}</a>
            </div>
            <span class="arco-upload-progress">
              <span class="arco-upload-icon arco-upload-icon-success">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="arco-icon arco-icon-check" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter">
                  <path d="M41.678 11.05 19.05 33.678 6.322 20.95"></path>
                </svg>
              </span>
            </span>
          </div>
          <span class="arco-upload-list-item-operation">
            <a-button type="outline" size="small" @click="() => handlePlay(index, 'm3u8')">播放转码</a-button>
            <a-button type="outline" size="small" @click="() => handlePlay(index, 'raw')">播放原始</a-button>
          </span>
        </div>
      </div>
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button type="outline" size="small" @click="handleHide">取消</a-button>
    </div>
  </a-modal>
</template>

<style></style>
