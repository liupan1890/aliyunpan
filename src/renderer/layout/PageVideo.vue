<script lang="ts">
import AliFile from '../aliapi/file'
import { useAppStore } from '../store'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

export default defineComponent({
  setup() {
    const handleHideClick = (_e: any) => {
      AliFile.ApiUpdateVideoTime(pageVideo.user_id, pageVideo.drive_id, pageVideo.file_id, player.currentTime())
        .catch(() => {})
        .then(() => {
          window.close()
        })
    }
    const appStore = useAppStore()
    const videoPlayer = ref()
    let player: any

    const options = {
      fill: true,
      autoplay: false,
      controls: true,
      language: 'zh-CN',
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 6],
      controlBar: {
        children: ['playToggle', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'volumePanel', 'qualitySelector', 'playbackRateMenuButton', 'subsCapsButton', 'audioTrackButton', 'PictureInPictureToggle', 'fullscreenToggle']
      }
    }
    const pageVideo = appStore.pageVideo!
    onMounted(() => {
      window.addEventListener('keydown', onKeyDown, true)

      const name = appStore.pageVideo?.file_name || '文档在线预览'
      setTimeout(() => {
        document.title = name
      }, 1000)
      setTimeout(() => {
        document.title = name
      }, 10000)

      // eslint-disable-next-line no-undef
      player = videojs(videoPlayer.value, options, () => {})

      AliFile.ApiVideoPreviewUrl(pageVideo.user_id, pageVideo.drive_id, pageVideo.file_id).then((data) => {
        if (data) {
          const urlList: { src: string; type: string; label: string; selected?: boolean }[] = []
          if (data.urlFHD) urlList.push({ src: data.urlFHD, type: 'application/x-mpegURL', label: '1080P' })
          if (data.urlHD) urlList.push({ src: data.urlHD, type: 'application/x-mpegURL', label: '720P' })
          if (data.urlSD) urlList.push({ src: data.urlSD, type: 'application/x-mpegURL', label: '540P' })
          if (data.urlLD) urlList.push({ src: data.urlLD, type: 'application/x-mpegURL', label: '480P' })
          urlList[0].selected = true

          player.src(urlList)

          AliFile.ApiFileInfo(pageVideo.user_id, pageVideo.drive_id, pageVideo.file_id).then((info) => {
            try {
              if (info?.play_cursor) {
                player.currentTime(info?.play_cursor)
              } else if (info?.user_meta) {
                const meta = JSON.parse(info?.user_meta)
                if (meta.play_cursor) {
                  const time = parseFloat(meta.play_cursor)
                  player.currentTime(time)
                }
              }
            } catch {}
            const volume = localStorage.getItem('videojsvolume')
            if (volume) player.volume(parseFloat(volume))
            const muted = localStorage.getItem('videojsmuted')
            if (muted) player.muted(muted === 'true')
            player.play()
          })

          if (data.subtitles.length > 0) {
            for (let i = 0; i < data.subtitles.length; i++) {
              const sub =
                i == 0
                  ? {
                      label: data.subtitles[i].language + '_' + i,
                      kind: 'captions',
                      src: data.subtitles[i].url,
                      mode: 'showing'
                    }
                  : {
                      label: data.subtitles[i].language + '_' + i,
                      kind: 'captions',
                      src: data.subtitles[i].url
                    }
              player.addRemoteTextTrack(sub, false)
            }
          }

          player.on('ended', function () {
            AliFile.ApiUpdateVideoTime(pageVideo.user_id, pageVideo.drive_id, pageVideo.file_id, player.currentTime())
          })
          player.on('pause', function () {
            AliFile.ApiUpdateVideoTime(pageVideo.user_id, pageVideo.drive_id, pageVideo.file_id, player.currentTime())
          })
          player.on('volumechange', function () {
            localStorage.setItem('videojsvolume', player.volume())
            localStorage.setItem('videojsmuted', player.muted() ? 'true' : 'false')
          })
        }
      })
    })
    onBeforeUnmount(() => {
      if (player) player.dispose()
      window.removeEventListener('keydown', onKeyDown)
    })
    const vol = 0.05 
    const time = 10 
    const onKeyDown = (e: any) => {
      if (!player) return
      if (e.keyCode == 173) {
        player.muted(true)
      } else if (e.code === 'ArrowUp' || e.keyCode == 175) {
        
        if (player.volume() <= 1) player.volume(player.volume() + vol)
      } else if (e.code === 'ArrowDown' || e.keyCode == 174) {
        
        if (player.volume() >= 0) player.volume(player.volume() - vol)
      } else if (e.code === 'ArrowLeft') {
        
        if (player.currentTime() >= 0) player.currentTime(player.currentTime() - time)
      } else if (e.code === 'ArrowRight') {
        
        player.currentTime(player.currentTime() + time)
      } else if (e.code === 'Space' || e.keyCode == 179) {
        
        player.paused() ? player.play() : player.pause()
      }
    }

    return { handleHideClick, appStore, videoPlayer }
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
        <div class="title">{{ appStore.pageVideo?.file_name || '视频在线预览' }}</div>
        <div class="flexauto"></div>
        <a-button type="text" tabindex="-1" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="height: calc(100vh - 42px)">
      <div id="doc-preview" class="doc-preview" style="width: 100%; height: 100%">
        <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: block;
}

.video-js .vjs-time-control {
  display: block;
}
.video-js .vjs-remaining-time {
  display: none;
}

.vjs-playback-rate .vjs-menu {
  width: 6em;
  left: -1em;
}
.vjs-playback-rate .vjs-menu .vjs-menu-content {
  max-height: 24em !important;
}

.video-js .vjs-progress-control .vjs-progress-holder,
.video-js .vjs-progress-control:hover .vjs-progress-holder {
  font-size: 2em;
}

.video-js .vjs-progress-control .vjs-progress-holder.disabled {
  font-size: 1em;
}
</style>
