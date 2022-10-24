<script setup lang="ts">
import { KeyboardState, useAppStore, useKeyboardStore, useWinStore } from '../store'
import { onHideRightMenuScroll, onShowRightMenu, TestCtrl, TestKey, TestKeyboardScroll, TestKeyboardSelect } from '../utils/keyboardhelper'
import { ref } from 'vue'
import useUploadingStore from './uploadingstore'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'
import UploadingDAL from '../transfer/uploadingdal'

const viewlist = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const uploadingStore = useUploadingStore()

const menuShowDir = ref(false)
const menuShowTask = ref(false)
uploadingStore.$subscribe((_m: any, state: any) => {
  menuShowTask.value = !uploadingStore.showTaskID
  const selectItem = uploadingStore.GetSelectedFirst()
  menuShowDir.value = (selectItem && selectItem.isDir && !uploadingStore.showTaskID) || false
})

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'down' || appStore.GetAppTabMenu != 'UploadingRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => uploadingStore.mSelectAll())) return

  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return
  if (TestKey('Backspace', state.KeyDownEvent, handleBack)) return 
  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, uploadingStore, UploadingDAL.aUploadingStartOne)) return 
  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, uploadingStore)) return 
})

const handleRefresh = () => UploadingDAL.aReloadUploading()
const handleBack = () => UploadingDAL.mUploadingShowTaskBack()
const handleSelectAll = () => uploadingStore.mSelectAll()

const handleSelect = (UploadID: number, event: any, isCtrl: boolean = false) => {
  onHideRightMenuScroll()
  uploadingStore.mMouseSelect(UploadID, event.ctrlKey || isCtrl, event.shiftKey)
}

const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key
  
  if (!uploadingStore.ListSelected.has(key)) uploadingStore.mMouseSelect(key, false, false)
  onShowRightMenu('rightuploadingmenu', e.event.clientX, e.event.clientY)
}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div style="min-height: 26px; max-width: 100%; flex-shrink: 0; flex-grow: 0">
      <div class="toppannav">
        <div class="toppannavitem" title="上传中">
          <span @click="() => UploadingDAL.mUploadingShowTaskBack()"> 上传中 </span>
        </div>
        <div v-if="uploadingStore.showTaskID" class="toppannavitem" :title="uploadingStore.ShowTaskName">
          <span> {{ uploadingStore.ShowTaskName }} </span>
        </div>
      </div>
    </div>
  </div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" :disabled="uploadingStore.ListLoading" title="后退 Back Space" @click="handleBack">
        <template #icon>
          <i class="iconfont iconarrow-left-2-icon" />
        </template>
      </a-button>
      <a-button type="text" size="small" tabindex="-1" :loading="uploadingStore.ListLoading" title="F5" @click="handleRefresh">
        <template #icon>
          <i class="iconfont iconreload-1-icon" />
        </template>
      </a-button>
    </div>

    <div v-if="uploadingStore.IsListSelected" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingStart(false, true)"><i class="iconfont iconstart" />开始</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingStart(false, false)"><i class="iconfont iconpause" />暂停</a-button>
      <a-button v-show="menuShowDir" type="text" size="small" tabindex="-1" @click="() => UploadingDAL.mUploadingShowTask()"><i class="iconfont icongengduo1" />查看</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingDelete(false)"><i class="iconfont icondelete" />清除</a-button>
    </div>
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingStart(true, true)"><i class="iconfont iconstart" />开始全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingStart(true, false)"><i class="iconfont iconpause" />暂停全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadingDAL.aUploadingDelete(true)"><i class="iconfont iconrest" />清空全部</a-button>
    </div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" title="Ctrl+A" @click="handleSelectAll">
          <i :class="uploadingStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ uploadingStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>
    <div class="cell tiquma">瞬时速度</div>
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" style="position: relative" :style="{ height: winStore.GetListHeight }" @keydown.space.prevent="() => true">
    <a-list
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtual-list-props="{
        height: winStore.GetListHeightNumber,
        fixedSize: true,
        estimatedSize: 50,
        threshold: 1,
        itemKey: 'UploadID'
      }"
      style="width: 100%"
      :data="uploadingStore.ListDataShow"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="没有 需要上传 的任务" /></template>
      <template #item="{ item, index }">
        <div :key="item.UploadID" class="listitemdiv">
          <div
            :class="'fileitem ' + (uploadingStore.ListSelected.has(item.UploadID) ? ' selected' : '') + (uploadingStore.ListFocusKey == item.UploadID ? ' focus' : '') + (item.uploadState == 'hashing' || item.uploadState == 'running' ? ' running' : '')"
            @click="handleSelect(item.UploadID, $event)"
            @dblclick="UploadingDAL.aUploadingStartOne(item.UploadID)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.UploadID}} )">
            <div style="margin: 2px">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.UploadID, $event, true)">
                <i :class="uploadingStore.ListSelected.has(item.UploadID) ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + item.icon" aria-hidden="true"></i>
            </div>
            <div class="filename">
              <div v-if="item.isDir && menuShowTask" :title="item.localFilePath" @click.stop="UploadingDAL.mUploadingShowTask(item.TaskID)">
                {{ item.name }}
              </div>
              <div v-else class="nopoint" :title="item.localFilePath">
                {{ item.name }}
              </div>
            </div>
            <div class="downsize">{{ item.sizeStr }}</div>
            <div class="downprogress">
              <div class="transfering-state">
                <p class="text-state">{{ item.uploadState }} {{ item.ProgressStr }}</p>
                <div class="progress-total">
                  <div :class="'progress-current ' + (item.uploadState == 'success' ? ' succeed' : item.uploadState == 'error' ? ' error' : item.uploadState == '已暂停' ? '' : ' active')" :style="{ width: item.Progress + '%' }"></div>
                </div>
                <p v-if="item.isDir && menuShowTask" class="text-error pointer" :title="item.errorMessage" @click.stop="UploadingDAL.mUploadingShowTask(item.TaskID)">{{ item.errorMessage }}</p>
                <p v-else class="text-error" :title="item.errorMessage">{{ item.errorMessage }}</p>
              </div>
            </div>
            <div class="downspeed">{{ item.speedStr }}</div>
          </div>
        </div>
      </template>
    </a-list>
    <a-dropdown id="rightuploadingmenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
      <template #content>
        <a-doption @click="() => UploadingDAL.aUploadingStart(false, true)">
          <template #icon> <i class="iconfont iconstart" /> </template>
          <template #default>开始上传</template>
        </a-doption>

        <a-doption @click="() => UploadingDAL.aUploadingStart(false, false)">
          <template #icon> <i class="iconfont iconpause" /> </template>
          <template #default>暂停上传</template>
        </a-doption>

        <a-doption v-show="menuShowDir" @click="() => UploadingDAL.mUploadingShowTask()">
          <template #icon> <i class="iconfont icongengduo1" /> </template>
          <template #default>查看详情</template>
        </a-doption>

        <a-doption @click="() => UploadingDAL.aUploadingDelete(false)">
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

.pointer {
  cursor: pointer;
}
</style>
