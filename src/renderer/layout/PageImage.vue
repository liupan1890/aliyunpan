<script lang="ts">
import { useAppStore } from '../store'
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'

import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import axios from 'axios'
import message from '../utils/message'

let keyDowning = false

interface OneImageModel {
  index: number
  drive_id: string
  file_id: string
  name: string
  bigUrl: string
  smallUrl: string
  time: number
}

function preload(img: OneImageModel) {
  return axios
    .get(img.bigUrl, {
      withCredentials: false,
      responseType: 'blob',
      timeout: 30000
    })
    .then(() => {
      img.time = new Date().getTime()
    })
    .catch(function (err: any) {
      if (err.response && err.response.status == 400) {
        
        img.bigUrl = _imageUrlRaw(img.drive_id, img.file_id)
        img.smallUrl = img.bigUrl
        axios
          .get(img.smallUrl, {
            withCredentials: false,
            responseType: 'blob',
            timeout: 30000
          })
          .then(() => {
            img.time = new Date().getTime()
          })
          .catch(function (error: any) {
            console.log('imgerr2', error)
          })
      }
    })
}

function _imageUrlSmall(drive_id: string, file_id: string) {
  return 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() + '&drive_id=' + drive_id + '&file_id=' + file_id + '&image_thumbnail_process=image%2Fresize%2Cl_60%2Fformat%2Cjpg%2Fauto-orient%2C1'
}
function _imageUrlBig(drive_id: string, file_id: string) {
  return 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() + '&drive_id=' + drive_id + '&file_id=' + file_id + '&image_thumbnail_process=image%2Fresize%2Cl_1920%2Fformat%2Cwebp%2Fauto-orient%2C1'
}

function _imageUrlRaw(drive_id: string, file_id: string) {
  return 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() + '&drive_id=' + drive_id + '&file_id=' + file_id
}

function getImageUrl(item: OneImageModel) {
  if (!item.bigUrl) {
    item.smallUrl = _imageUrlSmall(item.drive_id, item.file_id)
    item.bigUrl = _imageUrlBig(item.drive_id, item.file_id)
  }
}

export default defineComponent({
  setup(props) {
    const handleHideClick = (_e: any) => {
      window.close()
    }
    const appStore = useAppStore()
    let viewver: Viewer | undefined

    const rawImageList = ref<OneImageModel[]>([])
    const showIndex = ref(0)
    const showName = ref('')
    const isPlaying = ref(false)

    const drive_id = appStore.pageImage?.drive_id || ''
    const file_id = appStore.pageImage?.file_id || ''
    const imageidList = appStore.pageImage?.imageidlist || []
    const imagenameList = appStore.pageImage?.imagenamelist || []

    const rawList: OneImageModel[] = []
    for (let i = 0, maxi = imageidList.length; i < maxi; i++) {
      const add: OneImageModel = {
        index: i,
        drive_id: drive_id,
        file_id: imageidList[i],
        name: imagenameList[i],
        bigUrl: '',
        smallUrl: '',
        time: 0
      }
      getImageUrl(add)
      rawList.push(add)
      if (imageidList[i] == file_id) showIndex.value = i
    }
    rawImageList.value = rawList

    const onKeyDown = (event: any) => {
      if (appStore.pageImage?.mode == 'fill') return
      event.stopPropagation() 
      event.preventDefault() 

      if (keyDowning) return
      keyDowning = true
      setTimeout(() => {
        keyDowning = false
      }, 200)
      
      if (event.code == 'ArrowRight') {
        goNextImage()
      } else if (event.code == 'ArrowLeft') {
        goLastImage()
      }
    }
    const goLastImage = () => {
      const fileIndex = showIndex.value - 1
      if (fileIndex < 0) {
        message.info('已经是第一张图片了')
      } else {
        showIndex.value = fileIndex
        showImage()
      }
    }
    const goNextImage = () => {
      const imageList = rawImageList.value
      const fileIndex = showIndex.value + 1
      if (fileIndex >= imageList.length) {
        message.info('已经是最后一张图片了')
      } else {
        showIndex.value = fileIndex
        showImage()
      }
    }
    const goRefreshImage = () => {
      const imageList = rawImageList.value
      const image = imageList[showIndex.value]
      image.time = 0
      image.bigUrl = ''
      image.smallUrl = ''
      getImageUrl(image)
      showImage()
    }
    const modeChange = (mode: string) => {
      appStore.pageImage!.mode = mode
      nextTick(() => showImage())
    }

    onMounted(() => {
      const name = appStore.pageImage?.file_name || '图片在线预览'
      document.title = name
      window.addEventListener('keydown', onKeyDown, true)

      showImage()
      preloadIndex = 1
      setTimeout(loadAllImg, 1000)
    })
    onUnmounted(() => {
      preloadIndex = -1
      window.removeEventListener('keydown', onKeyDown)
    })

    const showImage = () => {
      const imageList = rawImageList.value
      const fileIndex = showIndex.value

      const indexInfo = '[' + (fileIndex + 1).toString() + '/' + imageList.length.toString() + '] '
      const name = indexInfo + ' ' + imageList[fileIndex].name
      document.title = name
      showName.value = name

      let next = fileIndex + 1
      if (next < imageList.length) {
        
        if (imageList[next].time == 0) {
          preload(imageList[next])
        }
      }
      next = fileIndex + 2
      if (next < imageList.length) {
        
        if (imageList[next].time == 0) {
          preload(imageList[next])
        }
      }

      if (appStore.pageImage?.mode == 'fill') {
        if (!viewver) {
          viewver = new Viewer(document.getElementById('images')!, {
            container: '#app',
            backdrop: 'static',
            keyboard: true,
            focus: true,
            loading: true,
            zIndex: 0,
            button: false,
            title: false,
            url: 'data-src',
            fullscreen: true,
            loop: false,
            play: () => {
              isPlaying.value = true
            },
            stop: () => {
              isPlaying.value = false
            },
            view: (e: any) => {
              const nextIndex = e.detail.index 
              const imageList = rawImageList.value
              const rawImage = imageList[nextIndex]
              const indexInfo = '[' + rawImage.index.toString() + '/' + imageList.length.toString() + '] '
              const name = indexInfo + ' ' + rawImage.name
              document.title = name
              showIndex.value = nextIndex
              showName.value = name

              const ul = document.getElementsByClassName('viewer-list viewer-transition')
              if (ul && ul.length > 0) {
                const lilist = ul[0].childNodes
                
                for (let i = Math.max(0, nextIndex - 30), maxi = Math.min(nextIndex + 30, imageList.length); i < maxi; i++) {
                  const imgNode = lilist[i].firstChild
                  if (imgNode) {
                    const img = imgNode as Element
                    let src = img.getAttribute('src')
                    const smallurl = imageList[i].smallUrl
                    if (src != smallurl) img.setAttribute('src', smallurl)
                    src = img.getAttribute('data-original-url')
                    const bigurl = imageList[i].bigUrl
                    if (src != bigurl) img.setAttribute('data-original-url', bigurl)
                  }
                }
              }

              if (rawImage.index + 1 < imageList.length) preload(imageList[rawImage.index + 1])
              if (rawImage.index + 2 < imageList.length) preload(imageList[rawImage.index + 2])
            }
          })
        }
        viewver.view(fileIndex) 
      } else {
        setTimeout(() => {
          const doc = document.getElementById('fullwidthimage')
          if (doc) {
            doc.scrollTop = 0
          }
        }, 200)
      }
    }
    
    let preloadIndex = 0
    const loadAllImg = () => {
      if (preloadIndex && rawImageList.value && preloadIndex < rawImageList.value.length) {
        preload(rawImageList.value[preloadIndex])
        preloadIndex++
        if (preloadIndex < rawImageList.value.length) {
          setTimeout(loadAllImg, 2000)
        }
      }
    }

    return { handleHideClick, appStore, modeChange, goRefreshImage, goLastImage, goNextImage, rawImageList, showIndex, showName, isPlaying }
  }
})
</script>

<template>
  <a-layout style="height: 100vh" draggable="false">
    <a-layout-header v-show="!isPlaying" id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <a-button type="text" tabindex="-1">
          <i class="iconfont iconfile-img"></i>
        </a-button>
        <div class="title">{{ showName }}</div>
        <div class="flexauto"></div>
        <a-button type="text" tabindex="-1" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="height: calc(100vh - 42px); padding: 12px 16px 12px 16px">
      <div class="toppanbtns" style="margin-bottom: 8px">
        <div class="flexauto"></div>
        <div class="toppanbtn">
          <a-button type="text" tabindex="-1" @click="modeChange('fill')"> 相册模式 </a-button>
        </div>
        <div class="toppanbtn">
          <a-button type="text" tabindex="-1" @click="goRefreshImage"> <i class="iconfont iconreload-1-icon"></i>刷新 </a-button>
        </div>
        <div class="toppanbtn">
          <a-button type="text" tabindex="-1" @click="goLastImage"> <i class="iconfont iconarrow-left-2-icon"></i>上一张 </a-button>
          <a-button type="text" tabindex="-1" @click="goNextImage"> <i class="iconfont iconarrow-right-2-icon"></i>下一张 </a-button>
        </div>
      </div>
      <div id="doc-preview" class="doc-preview" style="width: 100%; height: calc(100% - 26px - 8px)">
        <div v-if="appStore.pageImage?.mode == 'width'" id="fullwidthimage" class="fullwidthimage scroll">
          <a-image v-if="rawImageList.length > 0" id="imagewidth" width="100%" referrerPolicy="no-referrer" :src="rawImageList[showIndex].bigUrl" :preview="false">
            <template #error>
              <img
                src="data:image/png;base64,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" />
            </template>
          </a-image>
        </div>
        <ul v-else id="images" style="display: none">
          <li v-for="item in rawImageList" :key="item.file_id">
            <img
              v-if="Math.abs(item.index - showIndex) > 10"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABkCAYAAAA2VDb+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAC1SURBVHhe7dAxAQAgEIDA1/49P4YutIBb2Dm7+0bsUq0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUK0GUKmZD2xzBHzglwceAAAAAElFTkSuQmCC"
              :data-src="item.bigUrl"
              :alt="item.name"
              referrerPolicy="no-referrer" />
            <img v-else :src="item.smallUrl" :data-src="item.bigUrl" :alt="item.name" referrerPolicy="no-referrer" />
          </li>
        </ul>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
.fullwidthimage {
  height: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: auto;
  text-align: center;
  background: #23232e;
}
.fullwidthimage .loading {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding-top: 30%;
  text-align: center;
  background: #23232e;
}
.viewer-backdrop {
  background: #23232e !important;
}
.viewer-list > .viewer-active,
.viewer-list > .viewer-active:focus,
.viewer-list > .viewer-active:hover {
  border: 4px solid rgb(var(--primary-6));
}
.viewer-player {
  z-index: 12 !important;
}
</style>
