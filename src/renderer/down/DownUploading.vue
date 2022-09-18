<script setup lang="ts">
import { KeyboardState, useAppStore, useKeyboardStore, useWinStore } from '../store'
import { onHideRightMenuScroll, onShowRightMenu, TestCtrl, TestKey, TestKeyboardScroll, TestKeyboardSelect } from '../utils/keyboardhelper'
import { ref } from 'vue'
import UploadDAL from './uploaddal'
import useUploadingStore from './uploadingstore'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'

const viewlist = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const uploadingStore = useUploadingStore()

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'down' || appStore.GetAppTabMenu != 'UploadingRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => uploadingStore.mSelectAll())) return

  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return

  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, uploadingStore)) return 
  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, uploadingStore, UploadDAL.UploadingStateOne)) return 
})

const handleRefresh = () => UploadDAL.aReloadUploading()
const handleSelectAll = () => uploadingStore.mSelectAll()

const handleSelect = (UploadID: string, event: any) => {
  onHideRightMenuScroll()
  uploadingStore.mMouseSelect(UploadID, event.ctrlKey, event.shiftKey)
}

const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  let key = e.node.key
  
  if (!uploadingStore.ListSelected.has(key)) uploadingStore.mMouseSelect(key, false, false)
  onShowRightMenu('rightuploadingmenu', e.event.clientX, e.event.clientY)
}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div style="flex-grow: 1"></div>
  </div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" class="iconbtn" size="small" tabindex="-1" :loading="uploadingStore.ListLoading" @click="handleRefresh" title="F5">
        <template #icon>
          <i class="iconfont iconreload-1-icon" />
        </template>
      </a-button>
    </div>

    <div v-if="uploadingStore.IsListSelected" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadingState(false, true)"><i class="iconfont iconstart" />开始</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadingState(false, false)"><i class="iconfont iconpause" />暂停</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.aUploadingDelete(false)"><i class="iconfont icondelete" />清除</a-button>
    </div>
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadingState(true, true)"><i class="iconfont iconstart" />开始全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadingState(true, false)"><i class="iconfont iconpause" />暂停全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.aUploadingDelete(true)"><i class="iconfont iconrest" />清空全部</a-button>
    </div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" @click="handleSelectAll" title="Ctrl+A">
          <i :class="uploadingStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ uploadingStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>
    <div class="cell tiquma">瞬时速度</div>
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" @keydown.space.prevent="() => true" style="position: relative">
    <a-list
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtualListProps="{
        height: winStore.GetListHeightNumber,
        fixedSize: true,
        estimatedSize: 50,
        threshold: 1,
        itemKey: 'UploadID'
      }"
      style="width: 100%"
      :data="uploadingStore.ListDataShow"
      tabindex="-1"
      @scroll="onHideRightMenuScroll"
    >
      <template #empty><a-empty description="没有 需要上传 的任务" /></template>
      <template #item="{ item, index }">
        <div :key="item.UploadID" class="listitemdiv" :data-id="item.UploadID">
          <div
            :class="'fileitem ' + (uploadingStore.ListSelected.has(item.UploadID) ? ' selected' : '') + (uploadingStore.ListFocusKey == item.UploadID ? ' focus' : '') + (item.UploadState == 'hashing' || item.UploadState == 'running' ? ' running' : '')"
            @click="handleSelect(item.UploadID, $event)"
            @dblclick="() => UploadDAL.UploadingStateOne(item.UploadID)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.UploadID}} )"
          >
            <div style="margin: 2px">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.UploadID, { ctrlKey: true, shiftKey: false })">
                <i :class="uploadingStore.ListSelected.has(item.UploadID) ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + item.icon" aria-hidden="true"></i>
            </div>
            <div class="filename">
              <div class="nopoint" :title="item.LocalFilePath">
                {{ item.name }}
              </div>
            </div>
            <div class="downsize">{{ item.sizestr }}</div>
            <div class="downprogress">
              <div class="transfering-state">
                <p class="text-state">{{ item.UploadState }}</p>
                <div class="progress-total">
                  <div :class="'progress-current ' + (item.UploadState == 'success' ? ' succeed' : item.UploadState == 'error' ? ' error' : item.UploadState == '已暂停' ? '' : ' active')" :style="{ width: item.Progress + '%' }"></div>
                </div>
                <p class="text-error">{{ item.ErrorMessage }}</p>
              </div>
            </div>
            <div class="downspeed">{{ item.SpeedStr }}</div>
          </div>
        </div>
      </template>
    </a-list>
    <span class="rightBottomTip" :style="{ display: uploadingStore.ListDataShow.length != uploadingStore.ListDataCount ? '' : 'none' }">前 {{ uploadingStore.ListDataShow.length }} / {{ uploadingStore.ListDataCount }} 条</span>
    <a-dropdown id="rightuploadingmenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
      <template #content>
        <a-doption @click="() => UploadDAL.UploadingState(false, true)">
          <template #icon> <i class="iconfont iconstart" /> </template>
          <template #default>开始上传</template>
        </a-doption>

        <a-doption @click="() => UploadDAL.UploadingState(false, false)">
          <template #icon> <i class="iconfont iconpause" /> </template>
          <template #default>暂停上传</template>
        </a-doption>
        <a-doption @click="() => UploadDAL.aUploadingDelete(false)">
          <template #icon> <i class="iconfont icondelete" /> </template>
          <template #default>清除上传</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<style>
.rightBottomTip {
  display: inline-block;
  position: absolute;
  bottom: 0;
  right: 20px;
  padding: 0;
  opacity: 0.8;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-text-3);
}

.downHideTip {
  padding: 8px;
  text-align: center;
  opacity: 0.5;
}
.downHideTip .iconfont {
  color: #ccc;
  font-size: 80px;
}

.fileitem .icondownload {
  color: #bcb3b399;
}
.fileitem .running .icondownload {
  color: #2196f3;
}

.downprogress {
  flex-grow: 0;
  flex-shrink: 0;
  width: 110px;
  margin-right: 8px;
}
.downspeed {
  flex-grow: 0;
  flex-shrink: 0;
  width: 130px;
  overflow: hidden;
  color: #00000033;
  font-size: 25px;

  text-align: right;
  text-overflow: clip;
  white-space: nowrap;
  word-break: keep-all;
}

body[arco-theme='dark'] .downspeed {
  color: #ffffff33;
}

@media only screen and (min-width: 900px) {
  .downprogress {
    width: 150px;
  }
}
@media only screen and (min-width: 960px) {
  .downprogress {
    width: 170px;
  }
}
@media only screen and (min-width: 1000px) {
  .downprogress {
    width: 180px;
  }
  .downspeed {
    width: 150px;
  }
}

.downsize {
  flex-grow: 0;
  flex-shrink: 0;
  width: 84px;
  margin-right: 16px;
  font-size: 16px;
  text-align: right;
  color: var(--color-text-3);
  text-overflow: clip;
  white-space: nowrap;
  word-break: keep-all;
}

.transfering-state {
  display: block;
  width: 100%;
  overflow: visible;
}
.text-state {
  max-width: 100%;
  height: 16px;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-3);
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}
.text-error {
  width: 100%;
  height: 16px;
  margin: 0;
  overflow: visible;
  color: #f35b51;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
}
.progress-total {
  position: relative;
  width: 100%;
  height: 3px;
  margin-top: 2px;
  background: #84858d14;
  border-radius: 1.5px;
}
body[arco-theme='dark'] .progress-total {
  background: #84858d;
}
.progress-total .progress-current {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 6px;
  max-width: 100%;
  height: 100%;
  background: #00000033;
  border-radius: 1.5px;
  -webkit-transition: width 0.3s ease, opacity 0.3s ease;
  -o-transition: width 0.3s ease, opacity 0.3s ease;
  transition: width 0.3s ease, opacity 0.3s ease;
}
.progress-total .progress-current.succeed {
  background: #099970;
}
.progress-total .progress-current.error {
  background: #f35b51;
}
.progress-total .progress-current.active {
  background: linear-gradient(270deg, #ffba7a 0%, #ff74c7 8.56%, #637dff 26.04%, rgba(99, 125, 255, 0.2) 100%);
}

.nopoint {
  cursor: default !important;
  color: var(--color-text-1) !important;
}
</style>
