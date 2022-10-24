<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAppStore, useKeyboardStore, KeyboardState, useSettingStore, useUserStore, useWinStore, useFootStore, useServerStore } from '../store'
import { onHideRightMenu, TestAlt, TestCtrl, TestKey, TestShift } from '../utils/keyboardhelper'
import { getResourcesPath, openExternal } from '../utils/electronhelper'
import Config from '../utils/config'
import DebugLog from '../utils/debuglog'

import Setting from '../setting/index.vue'
import Rss from '../rss/index.vue'
import Share from '../share/index.vue'
import Down from '../down/index.vue'
import Pan from '../pan/index.vue'
import Pic from '../pic/index.vue'

import UserInfo from '../user/UserInfo.vue'
import UserLogin from '../user/UserLogin.vue'
import ShutDown from '../setting/ShutDown.vue'

import MyModal from './MyModal.vue'
import { B64decode } from '../utils/format'
import { throttle } from '../utils/debounce'
import ServerHttp from '../aliapi/server'

const appStore = useAppStore()
const winStore = useWinStore()
const keyboardStore = useKeyboardStore()
const footStore = useFootStore()
DebugLog.aLoadFromDB()

const handleHideClick = (_e: any) => {
  if (window.WebToElectron) window.WebToElectron({ cmd: useSettingStore().uiExitOnClose ? 'exit' : 'close' })
}
const handleMinClick = (_e: any) => {
  if (window.WebToElectron) window.WebToElectron({ cmd: 'minsize' })
}

const handleHelpPage = () => {
  window.WebOpenWindow({ page: 'PageHelp', theme: 'dark' })
  return
  const ourl = B64decode(useServerStore().helpUrl)
  if (ourl) openExternal(ourl)
}

keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  console.log(state.KeyDownEvent)

  if (TestAlt('1', state.KeyDownEvent, () => appStore.toggleTab('pan'))) return
  if (TestAlt('2', state.KeyDownEvent, () => appStore.toggleTab('pic'))) return
  if (TestAlt('3', state.KeyDownEvent, () => appStore.toggleTab('down'))) return
  if (TestAlt('4', state.KeyDownEvent, () => appStore.toggleTab('share'))) return
  if (TestAlt('5', state.KeyDownEvent, () => appStore.toggleTab('rss'))) return
  if (TestAlt('6', state.KeyDownEvent, () => appStore.toggleTab('setting'))) return
  if (TestAlt('f4', state.KeyDownEvent, () => handleHideClick(undefined))) return
  if (TestAlt('m', state.KeyDownEvent, () => handleMinClick(undefined))) return

  if (TestShift('tab', state.KeyDownEvent, () => appStore.toggleTabNext())) return
  if (TestCtrl('tab', state.KeyDownEvent, () => appStore.toggleTabNextMenu())) return
  if (TestAlt('l', state.KeyDownEvent, () => (useUserStore().userShowLogin = true))) return
  const f11 = () => {
    if (window.WebToElectron) window.WebToElectron({ cmd: 'maxsize' })
  }
  if (TestKey('f11', state.KeyDownEvent, f11)) return
})

const onResize = throttle(() => {
  const width = document.body.offsetWidth || 800
  const height = document.body.offsetHeight || 600

  if (winStore.width != width || winStore.height != height) winStore.updateStore({ width, height })
  // let ddsound = document.getElementById('ddsound') as { play: any } | undefined
  // if (ddsound) ddsound.play()
}, 50)

const onKeyDown = (event: KeyboardEvent) => {
  const ele = (event.srcElement || event.target) as any
  const nodeName = ele && ele.nodeName
  if (event.key === 'Tab') {
    
    event.preventDefault()
    event.stopPropagation()
    event.cancelBubble = true
    event.returnValue = false
    if (nodeName && !'BODY|DIV'.includes(nodeName)) ele.blur()
  }
  if (document.body.getElementsByClassName('arco-modal-container').length) return 
  if (event.key == 'Control' || event.key == 'Shift' || event.key == 'Alt' || event.key == 'Meta') return

  const isInput = nodeName == 'INPUT' || nodeName == 'TEXTAREA' || false
  if (!isInput) {
    onHideRightMenu()
    keyboardStore.KeyDown(event)
  }
}

const handleAsyncDelete = (key: string) => {
  footStore.mDeleteTask(key)
}
const handleAudioStop = () => {
  footStore.mSaveAudioUrl('')
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('keydown', onKeyDown, true) 

  setTimeout(() => {
    onHideRightMenu() 
  }, 300)

  window.addEventListener('click', onHideRightMenu, { passive: true })

  const css = document.getElementById('usercsslink')
  const csshref = getResourcesPath('theme.css')
  if (css) css.setAttribute('href', 'file:///' + csshref)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('click', onHideRightMenu)
})


const verLoading = ref(false)

const handleCheckVer = () => {
  verLoading.value = true
  ServerHttp.CheckUpgrade(true).then(() => {
    verLoading.value = false
  })
}
</script>
<template>
  <a-layout style="height: 100vh" draggable="false">
    <a-layout-header id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <div class="title">阿里云盘</div>

        <a-menu mode="horizontal" :selected-keys="[appStore.appTab]" @update:selected-keys="appStore.toggleTab($event[0])">
          <a-menu-item key="pan" title="Alt+1">网盘</a-menu-item>
          <a-menu-item key="pic" title="Alt+2" disabled>相册</a-menu-item>
          <a-menu-item key="down" title="Alt+3">传输</a-menu-item>
          <a-menu-item key="share" title="Alt+4">分享</a-menu-item>
          <a-menu-item key="rss" title="Alt+5">插件</a-menu-item>
        </a-menu>

        <div class="flexauto"></div>
        <ShutDown />
        <UserInfo />
        <UserLogin />
        <a-button type="text" tabindex="-1" title="设置 Alt+6" :class="appStore.appTab == 'setting' ? 'active' : ''" @click="appStore.toggleTab('setting')">
          <i class="iconfont iconsetting"></i>
        </a-button>
        <a-button type="text" tabindex="-1" title="最小化 Alt+M" @click="handleMinClick">
          <i class="iconfont iconzuixiaohua"></i>
        </a-button>
        <a-button type="text" tabindex="-1" title="关闭 Alt+F4" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content id="xbybody">
      <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="appStore.appTab">
        <a-tab-pane key="pan" title="1"><Pan /></a-tab-pane>
        <a-tab-pane key="pic" title="2"><Pic /></a-tab-pane>
        <a-tab-pane key="down" title="3"><Down /></a-tab-pane>
        <a-tab-pane key="share" title="4"><Share /></a-tab-pane>
        <a-tab-pane key="rss" title="5"><Rss /></a-tab-pane>
        <a-tab-pane key="setting" title="6"><Setting /></a-tab-pane>
      </a-tabs>
    </a-layout-content>
    <a-layout-footer id="xbyfoot" draggable="false">
      <div id="footer2">
        <div v-if="footStore.loadingInfo" id="footLoading" class="footerBar fix" style="padding: 0 8px 0 0">
          <div class="arco-spin">
            <div class="arco-spin-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="arco-icon arco-icon-loading arco-icon-spin" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter">
                <path d="M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6"></path>
              </svg>
            </div>
          </div>
          <span style="margin-right: 8px">{{ footStore.loadingInfo }}</span>
        </div>
        <div class="footinfo">
          {{ footStore.GetSpaceInfo }}
        </div>
        <div class="flexauto">
          <audio id="ddsound" src="notify.wav"></audio>
        </div>
        <div :style="{ minWidth: footStore.rightWidth + 'px', display: 'flex', paddingRight: '16px', flexShrink: 0, flexGrow: 0 }">
          <div class="flexauto"></div>
          <div class="footinfo">
            {{ footStore.GetInfo }}
          </div>
          <div v-if="footStore.audioUrl" style="width: 300px; display: flex; overflow: hidden">
            <audio controls autoplay style="width: 360px; height: 24px; margin: 0 -50px 0 -12px" :src="footStore.audioUrl">no audio</audio>
          </div>
          <div v-if="footStore.audioUrl" class="footerBar fix" title="关闭音频预览" style="cursor: pointer" @click.stop="handleAudioStop()">
            <i class="iconfont iconclose" />
          </div>

          <div class="footerBar fix">
            <i class="iconfont iconshangchuansudu" />
            <span id="footUploadSpeed"></span>
          </div>

          <div class="footerBar fix">
            <i class="iconfont iconxiazaisudu" />
            <span id="footDownSpeed"></span>
          </div>

          <div class="footerBar fix" style="padding: 0 8px; cursor: pointer" @click="handleCheckVer">{{ Config.appVersion }}</div>

          <a-popover v-model:popup-visible="footStore.taskVisible" trigger="click" position="top" class="asynclist">
            <div class="footerBar fix" style="cursor: pointer">
              <span :class="footStore.GetIsRunning ? 'shake' : ''">
                <i class="iconfont icontongzhiblue" />
              </span>
              <span>异步通知</span>
            </div>
            <template #content>
              <div style="width: 360px; min-height: 120px; max-height: 50vh; overflow-y: auto; overflow-x: hidden">
                <div v-for="item in footStore.taskList" :key="item.key" class="asynclistitem">
                  <div class="asynclistitem-content">
                    <div v-if="item.status == 'error'" class="asynclistitem-name danger" :title="item.title">{{ item.title }}</div>
                    <div v-else class="asynclistitem-name" :title="item.title">{{ item.title }}</div>
                    <span v-if="item.status == 'running'" class="asynclistitem-progress asynclistitem-icon-running" title="执行中"><i class="iconfont iconhourglass" />{{ item.usetime }}</span>
                    <span v-if="item.status == 'success'" class="asynclistitem-progress asynclistitem-icon-success" title="成功"><i class="iconfont iconcheck" />{{ item.usetime }}</span>
                    <span v-if="item.status == 'error'" class="asynclistitem-progress asynclistitem-icon-error" title="失败"><i class="iconfont iconclose" />{{ item.usetime }}</span>
                  </div>
                  <div class="asynclistitem-operation">
                    <a-button type="text" size="mini" @click.stop="handleAsyncDelete(item.key)">删除</a-button>
                  </div>
                </div>
                <a-empty v-if="footStore.taskList.length == 0" style="margin-top: 24px">没有正在执行的异步任务</a-empty>
              </div>
            </template>
          </a-popover>
          <div class="footerBar fix" style="margin: 0; cursor: pointer" @click="handleHelpPage">帮助文档</div>
        </div>
      </div>
      <MyModal />
    </a-layout-footer>
  </a-layout>
</template>

<style>
#xbyhead {
  z-index: 2;
  height: 42px !important;
  padding: 3px 4px 2px 4px !important;
  color: var(--color-text-2);
  line-height: 37px !important;
  background: var(--color-menu-light-bg);
  box-shadow: var(--topshadow) 0px 2px 12px 0px;
}
.arco-avatar-circle .arco-avatar-image {
  line-height: 100% !important;
}
#xbyhead2 {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  height: 37px;
  padding: 0px 2px 0 4px;
  line-height: 37px;
}

#xbyhead2 .title {
  min-width: 160px;
  padding: 0 8px 0 4px;
  overflow: hidden;
  font-weight: 600;
  font-size: 17px;
  line-height: 37px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}

#xbyhead2 button {
  min-width: 32px !important;
  height: 32px !important;
  min-height: 32px !important;
  margin-right: 1px;
  margin-left: 1px;
  padding: 0 !important;
  line-height: 32px !important;
  display: flex;
  justify-items: center;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-shrink: 0;
}

#xbyhead2 .arco-btn-text {
  color: var(--color-text-2);
}
#xbyhead2 .arco-btn-text:hover,
#xbyhead2 .arco-btn-text.active {
  color: rgb(var(--primary-6));
  background-color: var(--color-fill-2);
}
#xbyhead2 .iconfont {
  font-size: 24px;
}
#xbyhead2 .arco-menu-horizontal {
  width: 420px;
  height: 37px;
  line-height: 24px;
}
#xbyhead2 .arco-menu-horizontal .arco-menu-inner {
  padding: 0;
  overflow: visible;
}
#xbyhead2 .arco-menu-horizontal .arco-menu-item {
  line-height: 24px;
  padding: 0;
  min-width: 56px;
  text-align: center;
}
#xbyhead2 .arco-menu-horizontal .arco-menu-item.arco-menu-selected {
  font-size: 15px;
}
#xbyhead2 .arco-menu-selected-label {
  bottom: -7px;
  left: 0;
  right: 0;
  height: 2px;
}
#xbybody {
  padding: 0 3px 0 2px;
  height: calc(100% - 42px - 24px - 20px);
}
.hidetabs {
  height: 100%;
}
.hidetabs > .ant-tabs-nav {
  height: 0 !important;
  display: none !important;
}

.hidetabs .ant-tabs-content {
  height: 100%;
}
.hidetabs > .arco-tabs-content {
  padding-top: 0 !important;
  padding-bottom: 1px !important;
}
.hidetabs > .arco-tabs-nav {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

#xbyfoot {
  display: flex;
  flex-direction: row;
  height: 24px;
  padding: 0;
  padding: 0 0 0 16px;
  color: var(--foot-txt);
  font-size: 12px;
  line-height: 23px;
  background: var(--foot-bg);
}

a {
  /*color: #F596AA;*/
  color: rosybrown;
}

#footer2 {
  display: flex;
  flex: 100% 1 1;
  flex-direction: row;
  height: 24px;
  padding: 0;
  color: hsla(0, 0%, 100%, 0.85);
  font-size: 12px;
  line-height: 24px;
  justify-content: stretch;
  align-items: center;
}
.footerBar {
  flex: auto 1;
  flex-shrink: 0;
  padding: 0 8px;
  cursor: default;
  height: 100%;
  line-height: 24px;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: center;
}
.footerBar.fix {
  flex-grow: 0;
}
.footerBar:hover {
  background-color: #569dff;
}
.footerBar .iconfont {
  font-size: 14px;
  line-height: 24px;
}
#footLoading .arco-icon-loading {
  color: hsla(0, 0%, 100%, 0.85);
  width: 14px;
  height: 14px;
}

.footloadingicon {
  width: 14px;
  height: 14px;
  display: inline-block;
}

.syncmessage {
  width: 380px;
}

#footLoading .arco-spin .arco-spin-icon {
  padding-bottom: 4px;
  margin-right: 2px;
}

.footinfo {
  padding: 0 8px;
  opacity: 0.9;
}
body[arco-theme='dark'] .footinfo {
  opacity: 0.8;
}
.footuploadlist .arco-popover-popup-content,
.footdownlist .arco-popover-popup-content,
.asynclist .arco-popover-popup-content {
  padding: 0 8px 12px 8px;
  margin-right: 8px;
}
.asynclistitem {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin-top: 12px;
}
.asynclistitem-content {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px 8px 12px;
  overflow: hidden;
  font-size: 14px;
  background-color: var(--color-fill-1);
  border-radius: var(--border-radius-small);
  transition: background-color 0.1s cubic-bezier(0, 0, 1, 1);
}
.asynclistitem-operation {
  margin-left: 12px;
  color: var(--color-text-2);
  font-size: 12px;
}
.asynclistitem-operation .arco-btn {
  padding: 0 6px;
}
.asynclistitem-name {
  display: flex;
  flex: 1;
  align-items: center;
  margin-right: 10px;
  overflow: hidden;
  color: rgb(var(--link-6));
  font-size: 14px;
  line-height: 1.4286;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.asynclistitem-progress {
  position: relative;
  margin-left: auto;
  line-height: 12px;
  min-width: 52px;
  display: inline-block;
}

.asynclistitem-icon-running {
  color: var(--color-text-2);
  font-size: 14px;
  line-height: 14px;
}

.asynclistitem-icon-success {
  color: rgb(var(--success-6));
  font-size: 14px;
  line-height: 14px;
}
.asynclistitem-icon-error {
  color: rgb(var(--danger-6));
  font-size: 14px;
  line-height: 14px;
}

#footer2 audio {
  border-radius: 0;
  border: none;
  outline: none;
}
#footer2 audio::-webkit-media-controls-panel {
  border-radius: 0;
  border: none;
  color: #ffffff !important;
  filter: invert(80);
}

#footer2 audio::-webkit-media-controls-enclosure {
  background: var(--foot-bg);
  border-radius: 4px;
}
#footer2 audio::-webkit-media-controls-current-time-display,
#footer2 audio::-webkit-media-controls-time-remaining-display {
  text-shadow: unset;
  font-size: 12px;
  font-weight: bold;
  color: #000000 !important;
}

body[arco-theme='dark'] #footer2 audio::-webkit-media-controls-panel {
  filter: invert(0);
}
body[arco-theme='dark'] #footer2 audio::-webkit-media-controls-current-time-display,
body[arco-theme='dark'] #footer2 audio::-webkit-media-controls-time-remaining-display {
  color: #ffffff !important;
}

.arco-upload-list-item-file-icon {
  margin-right: 4px !important;
}
.footspeedstr {
  min-width: 52px;
  display: inline-block;
}
</style>

<style>
.shake {
  animation-name: upAnimation;
  transform-origin: center top;
  animation-duration: 2s;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-delay: 0.5s;
}
@keyframes upAnimation {
  0% {
    transform: rotate(0deg);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  10% {
    transform: rotate(-12deg);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  20% {
    transform: rotate(12deg);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  28% {
    transform: rotate(-10deg);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  36% {
    transform: rotate(10deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  42% {
    transform: rotate(-8deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  48% {
    transform: rotate(8deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  52% {
    transform: rotate(-4deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  56% {
    transform: rotate(4deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  60% {
    transform: rotate(0deg);
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
  }
  100% {
    transform: rotate(0deg);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
}
</style>
