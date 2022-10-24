<script setup lang="ts">
import { KeyboardState, useAppStore, useKeyboardStore, usePanFileStore, useWinStore } from '../store'
import { onHideRightMenuScroll, onShowRightMenu, TestCtrl, TestKey, TestKeyboardScroll, TestKeyboardSelect } from '../utils/keyboardhelper'
import { ref } from 'vue'
import UploadDAL from '../transfer/uploaddal'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'
import useUploadedStore from './uploadedstore'
import { IStateUploadTask } from '../utils/dbupload'
import message from '../utils/message'
import AliFile from '../aliapi/file'
import PanDAL from '../pan/pandal'
import { humanSize } from '../utils/format'

const fs = window.require('fs')
const viewlist = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const uploadedStore = useUploadedStore()

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'down' || appStore.GetAppTabMenu != 'UploadedRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => uploadedStore.mSelectAll())) return

  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return

  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, uploadedStore, handleDbClick)) return 
  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, uploadedStore)) return 
})

const handleRefresh = () => UploadDAL.aReloadUploaded()
const handleSelectAll = () => uploadedStore.mSelectAll()

const handleSelect = (TaskID: number, event: any, isCtrl: boolean = false) => {
  onHideRightMenuScroll()
  uploadedStore.mMouseSelect(TaskID, event.ctrlKey || isCtrl, event.shiftKey)
}
const handleDbClick = (TaskID: number) => {
  onSelectFile(undefined, 'pan')
}

const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key
  
  uploadedStore.mKeyboardSelect(key, false, false)
  onShowRightMenu('rightuploadedmenu', e.event.clientX, e.event.clientY)
}

const onSelectFile = (item: IStateUploadTask | undefined, cmd: string) => {
  if (!item) {
    item = uploadedStore.GetSelectedFirst()
  }
  if (!item) return
  if (cmd == 'file') {
    const full = item.localFilePath
    try {
      if (fs.existsSync(full)) {
        message.loading('Loading...', 2)
        window.Electron.shell.openPath(full)
      } else {
        message.error('文件可能已经被删除')
      }
    } catch {}
  }
  if (cmd == 'dir') {
    const full = item.localFilePath
    try {
      if (fs.existsSync(full)) {
        message.loading('Loading...', 2)
        window.Electron.shell.showItemInFolder(full)
      } else {
        message.error('文件夹可能已经被删除')
      }
    } catch {}
  }
  if (cmd == 'delete') {
    UploadDAL.UploadedDelete(false)
  }
  if (cmd == 'pan') {
    
    if (item.TaskFileID) {
      AliFile.ApiGetFile(item.user_id, item.drive_id, item.TaskFileID).then(async (file) => {
        if (file) {
          await PanDAL.aReLoadOneDirToShow('', file.parent_file_id, true)
          usePanFileStore().mMouseSelect(file.file_id, false, false)
          useAppStore().toggleTab('pan')
        } else {
          message.error('找不到文件，可能已被删除')
        }
      })
    } else {
      message.error('找不到文件')
    }
  }
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
      <a-button type="text" size="small" tabindex="-1" :loading="uploadedStore.ListLoading" title="F5" @click="handleRefresh">
        <template #icon>
          <i class="iconfont iconreload-1-icon" />
        </template>
      </a-button>
    </div>

    <div v-if="uploadedStore.IsListSelected" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadedDelete(false)"><i class="iconfont icondelete" />清除选中</a-button>
    </div>

    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="() => UploadDAL.UploadedDelete(true)"><i class="iconfont iconrest" />清空全部已上传</a-button>
    </div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" title="Ctrl+A" @click="handleSelectAll">
          <i :class="uploadedStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ uploadedStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>

    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" :style="{ height: winStore.GetListHeight }" @keydown.space.prevent="() => true">
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
        itemKey: 'TaskID'
      }"
      style="width: 100%"
      :data="uploadedStore.ListDataShow"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="没有 已上传 的任务" /></template>
      <template #item="{ item, index }">
        <div :key="item.TaskID" class="listitemdiv">
          <div
            :class="'fileitem ' + (uploadedStore.ListSelected.has(item.TaskID) ? ' selected' : '') + (uploadedStore.ListFocusKey == item.TaskID ? ' focus' : '')"
            @click="handleSelect(item.TaskID, $event)"
            @dblclick="() => handleDbClick(item.TaskID)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.TaskID}} )">
            <div style="margin: 2px">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.TaskID, $event, true)">
                <i :class="uploadedStore.ListSelected.has(item.TaskID) ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + (item.isDir ? 'iconfile-folder' : 'iconwenjian')" aria-hidden="true"></i>
            </div>
            <div class="filename">
              <div class="nopoint" :title="item.localFilePath">
                {{ item.TaskName }}
              </div>
            </div>
            <div class="downsize">{{ humanSize(item.ChildTotalSize) }}</div>
            <div className="downedbtn">
              <a-button type="text" tabindex="-1" title="定位到网盘" @click.prevent.stop="onSelectFile(item, 'pan')">
                <i class="iconfont iconcloud" />
              </a-button>
              <a-button type="text" tabindex="-1" title="打开文件" @click.prevent.stop="onSelectFile(item, 'file')">
                <i class="iconfont iconwenjian" />
              </a-button>
              <a-button type="text" tabindex="-1" title="打开文件夹" @click.prevent.stop="onSelectFile(item, 'dir')">
                <i class="iconfont iconfile-folder" />
              </a-button>
              <a-button type="text" tabindex="-1" title="删除上传记录" @click.prevent.stop="onSelectFile(item, 'delete')">
                <i class="iconfont icondelete" />
              </a-button>
            </div>
          </div>
        </div>
      </template>
    </a-list>
    <a-dropdown id="rightuploadedmenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
      <template #content>
        <a-doption @click="() => onSelectFile(undefined, 'pan')">
          <template #icon> <i class="iconfont iconcloud" /> </template>
          <template #default>定位到网盘</template>
        </a-doption>
        <a-doption @click="() => onSelectFile(undefined, 'file')">
          <template #icon> <i class="iconfont iconwenjian" /> </template>
          <template #default>打开文件</template>
        </a-doption>
        <a-doption @click="() => onSelectFile(undefined, 'dir')">
          <template #icon> <i class="iconfont iconfile-folder" /> </template>
          <template #default>打开文件夹</template>
        </a-doption>
        <a-doption @click="() => onSelectFile(undefined, 'delete')">
          <template #icon> <i class="iconfont icondelete" /> </template>
          <template #default>删除上传记录</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<style>
.downedbtn {
  margin: 0 8px 0 0;
  flex-shrink: 0;
  flex-grow: 0;
  text-align: right;
}

.downedbtn > button {
  min-width: 32px !important;
  height: 30px !important;
  min-height: 30px !important;
  padding: 0px !important;
  color: var(--color-text-4) !important;
  font-size: 14px;
  line-height: 30px !important;
  border: none !important;
  margin: 0 1px;
}
.downedbtn > button .iconfont {
  font-size: 24px;
  line-height: 30px;
}

.fileitem.selected .downedbtn > button {
  color: rgb(var(--primary-6)) !important;
}

.downedbtn > button:hover,
.downedbtn > button:active {
  background: rgba(99, 125, 255, 0.2) !important;
  color: rgb(var(--primary-6)) !important;
}

body[arco-theme='dark'] .downedbtn > button:hover,
body[arco-theme='dark'] .downedbtn > button:active {
  background: rgba(99, 125, 255, 0.3) !important;
  color: rgb(var(--primary-6)) !important;
}

.downedbtn > button:hover .iconfont,
.downedbtn > button:active .iconfont {
  color: rgb(var(--primary-6)) !important;
}
</style>
