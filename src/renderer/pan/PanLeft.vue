<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import usePanTreeStore, { fileiconfn } from './pantreestore'
import MySwitchTab from '../layout/MySwitchTab.vue'
import { KeyboardState, useAppStore, useKeyboardStore, usePanFileStore, useSettingStore, useWinStore } from '../store'
import PanDAL from './pandal'
import { onShowRightMenu, onHideRightMenuScroll, TestCtrl } from '../utils/keyboardhelper'
import DirLeftMenu from './menus/DirLeftMenu.vue'
import { TreeNodeData } from '../store/treestore'
import { dropMoveSelectedFile } from './topbtns/topbtn'
import message from '../utils/message'
import { modalUpload } from '../utils/modal'

const treeref = ref()
const winStore = useWinStore()
const treeHeight = computed(() => winStore.height - 42 - 56 - 24 - 4)
const quickHeight = computed(() => winStore.height - 42 - 56 - 24 - 4 - 280 - 28)
const appStore = useAppStore()
const pantreeStore = usePanTreeStore()
const settingStore = useSettingStore()

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'pan') return
  if (TestCtrl('1', state.KeyDownEvent, () => handleQuickSelect(1))) return
  if (TestCtrl('2', state.KeyDownEvent, () => handleQuickSelect(2))) return
  if (TestCtrl('3', state.KeyDownEvent, () => handleQuickSelect(3))) return
  if (TestCtrl('4', state.KeyDownEvent, () => handleQuickSelect(4))) return
  if (TestCtrl('5', state.KeyDownEvent, () => handleQuickSelect(5))) return
  if (TestCtrl('6', state.KeyDownEvent, () => handleQuickSelect(6))) return
  if (TestCtrl('7', state.KeyDownEvent, () => handleQuickSelect(7))) return
  if (TestCtrl('8', state.KeyDownEvent, () => handleQuickSelect(8))) return
  if (TestCtrl('9', state.KeyDownEvent, () => handleQuickSelect(9))) return
})

const switchValues = [
  { key: 'wangpan', title: '网盘文件', alt: '' },
  { key: 'kuaijie', title: '快捷方式', alt: '' }
]

const colorTreeData = ref<TreeNodeData[]>([])

watchEffect(() => {
  const list = settingStore.uiFileColorArray
  const nodeList: TreeNodeData[] = []
  nodeList.push({
    __v_skip: true,
    key: 'video',
    title: '放映室',
    namesearch: 'ca760ef',
    icon: fileiconfn('iconrss_video'),
    children: [],
    isLeaf: true
  } as TreeNodeData)
  for (let i = 0; i < list.length; i++) {
    nodeList.push({
      __v_skip: true,
      key: 'color' + list[i].key.replace('#', 'c') + ' ' + (list[i].title || list[i].key),
      title: list[i].title || list[i].key,
      namesearch: list[i].key.replace('#', 'c'),
      children: [],
      isLeaf: true
    } as TreeNodeData)
  }
  nodeList.push({
    __v_skip: true,
    key: 'colorc5b89b8 已看视频',
    title: '已看视频',
    namesearch: 'c5b89b8',
    children: [],
    isLeaf: true
  } as TreeNodeData)
  Object.freeze(nodeList)
  colorTreeData.value = nodeList
})
watchEffect(() => {
  const scrollToDir = pantreeStore.scrollToDir
  if (scrollToDir) treeref.value.scrollTo({ key: scrollToDir, align: 'top', offset: 220 })
  pantreeStore.mSaveTreeScrollTo('')
})

const handleTreeRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key as string
  if (key.length < 40 || key.startsWith('search')) return
  PanDAL.aReLoadOneDirToShow('', key, true)
  onShowRightMenu('leftpanmenu', e.event.clientX, e.event.clientY)
}

const onRowItemDragEnter = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault() 
  ev.target.style.outline = '2px dotted #637dff'
  ev.target.style.background = 'rgba(var(--primary-6),0.3)'
  ev.dataTransfer.dropEffect = 'move'
}
const onRowItemDragLeave = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault() 
  ev.target.style.outline = 'none'
  ev.target.style.background = ''
}
const onRowItemDragOver = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault() 
}

const onRowItemDrop = (ev: any, movetodirid: string) => {
  ev.stopPropagation()
  ev.preventDefault() 
  ev.target.style.outline = 'none'
  ev.target.style.background = ''

  
  const filesList = ev.dataTransfer.files
  if (filesList && filesList.length > 0) {
    const files: string[] = []
    
    for (let i = 0, maxi = filesList.length; i < maxi; i++) {
      const path = filesList[i].path
      files.push(path)
    }
    modalUpload(movetodirid, files)
  } else {
    
    dropMoveSelectedFile(movetodirid)
  }
}

const onQuickDrop = (ev: any) => {
  ev.preventDefault() 
  ev.target.style.outline = 'none'
  ev.target.style.background = ''

  const list: { key: string; title: string }[] = []
  const selectedFile = usePanFileStore().GetSelected()
  for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
    if (selectedFile[i].isDir) {
      list.push({ key: selectedFile[i].file_id, title: selectedFile[i].name })
    }
  }
  if (list.length == 0) {
    message.error('没有选择任何文件夹！')
    return
  }
  PanDAL.updateQuickFile(list)
}
const handleQuickDelete = (key: string) => {
  PanDAL.deleteQuickFile(key)
}
const handleQuickSelect = (index: number) => {
  const array = PanDAL.getQuickFileList()
  if (array.length >= index) {
    const key = array[index - 1].key 
    PanDAL.aReLoadOneDirToShow('', key, true)
  }
}
</script>

<template>
  <div style="width: 100%; height: 100%; overflow: hidden; min-width: 300px" tabindex="-1" @keydown.tab.prevent="() => true">
    <div class="headswitch">
      <div class="bghr"></div>
      <div class="sw">
        <MySwitchTab :name="'panleft'" :tabs="switchValues" :value="appStore.GetAppTabMenu" @update:value="(val:string)=>appStore.toggleTabMenu('pan', val)" />
      </div>
    </div>
    <div class="treeleft">
      <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="appStore.GetAppTabMenu">
        <a-tab-pane key="wangpan" title="1">
          <AntdTree
            ref="treeref"
            :tabindex="-1"
            :focusable="false"
            class="dirtree"
            block-node
            selectable
            :auto-expand-parent="false"
            show-icon
            :height="treeHeight"
            :style="{ height: treeHeight + 'px' }"
            :item-height="30"
            :show-line="{ showLeafIcon: false }"
            :open-animation="{}"
            :expanded-keys="pantreeStore.treeExpandedKeys"
            :selected-keys="pantreeStore.treeSelectedKeys"
            :tree-data="pantreeStore.treeData"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected(e.node.key)"
            @expand="(_:any[],e:any)=>pantreeStore.mTreeExpand(e.node.key)"
            @right-click="handleTreeRightClick"
            @scroll="onHideRightMenuScroll">
            <template #switcherIcon>
              <i class="ant-tree-switcher-icon iconfont Arrow" />
            </template>
            <template #icon>
              <i class="iconfont iconfile-folder" />
            </template>
            <template #title="{ dataRef }">
              <span v-if="dataRef.key.length == 40 || dataRef.key == 'root'" class="dirtitle treedragnode" @drop="onRowItemDrop($event, dataRef.key)" @dragover="onRowItemDragOver" @dragenter="onRowItemDragEnter" @dragleave="onRowItemDragLeave">{{ dataRef.title }}</span>
              <span v-else class="dirtitle">{{ dataRef.title }}</span>
            </template>
          </AntdTree>
        </a-tab-pane>
        <a-tab-pane key="kuaijie" title="2">
          <AntdTree
            :tabindex="-1"
            :focusable="false"
            class="colortree"
            block-node
            selectable
            :auto-expand-parent="false"
            show-icon
            :item-height="30"
            :show-line="{ showLeafIcon: false }"
            :open-animation="{}"
            :selected-keys="pantreeStore.treeSelectedKeys"
            :tree-data="colorTreeData"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected(e.node.key)">
            <template #icon="{ dataRef }">
              <i class="iconfont iconwbiaoqian" :class="dataRef.namesearch" />
            </template>
            <template #title="{ dataRef }">
              <span :class="'dirtitle ' + dataRef.namesearch">标记 · {{ dataRef.title }}</span>
            </template>
          </AntdTree>
          <div class="quickdrop" @drop="onQuickDrop($event)" @dragover="onRowItemDragOver" @dragenter="onRowItemDragEnter" @dragleave="onRowItemDragLeave">把右侧的文件夹拖放到这里<br />创建快捷方式(Ctrl 1-9)</div>
          <AntdTree
            :tabindex="-1"
            :focusable="false"
            class="quicktree"
            block-node
            selectable
            :auto-expand-parent="false"
            show-icon
            :height="quickHeight"
            :style="{ height: quickHeight + 'px' }"
            :item-height="30"
            :show-line="{ showLeafIcon: false }"
            :open-animation="{}"
            :selected-keys="pantreeStore.treeSelectedKeys"
            :tree-data="pantreeStore.quickData"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected(e.node.key)">
            <template #icon>
              <i class="iconfont iconfile-folder" />
            </template>
            <template #title="{ dataRef }">
              <span class="quicktitle" :title="dataRef.namesearch">快捷 · {{ dataRef.title }}</span>
              <span class="quickbtn"> <a-button type="text" size="mini" @click.stop="handleQuickDelete(dataRef.key)">删除</a-button></span>
            </template>
          </AntdTree>
        </a-tab-pane>
      </a-tabs>
    </div>
    <DirLeftMenu />
  </div>
</template>

<style>
.treeleft {
  margin-left: -22px;
}

.dirtree {
  height: 100%;
}
.dirtree .iconfont,
.sharetree .iconfont,
.quicktree .iconfont,
.videotree .iconfont {
  font-size: 20px;
}
.dirtree .iconfont.iconfile-folder,
.sharetree .iconfont.iconfile-folder,
.quicktree .iconfont.iconfile-folder,
.videotree .iconfont.iconfile-folder {
  color: #ffb74d;
  font-size: 20px;
}
.colortree .iconfont {
  font-size: 20px;
}

.dirtree .iconfont.iconrecover {
  color: #13c2c2;
}
.dirtree .iconfont.icondelete {
  color: #ff4d4fd9;
}
.dirtree .iconfont.iconsearch {
  color: #1890ff;
}
.colortree .iconfont.iconrss_video {
  color: #a760ef;
}
.ant-tree .iconfile-folder {
  color: #ffb74d;
  font-size: 20px;
}

.dirtitle {
  white-space: nowrap;
  word-break: keep-all;
}
.dirtitle.treedragnode {
  width: 100%;
  display: inline-block;
}

.dirtree .ant-tree-list-holder-inner .ant-tree-node-content-wrapper {
  flex-wrap: nowrap !important;
  flex-shrink: 0 !important;
  display: flex;
}

.dirtree .ant-tree-list-holder {
  overflow-x: hidden;
}

.dirtree .ant-tree-title {
  flex-grow: 1;
}

.ant-tree-node-selected .ant-tree-title,
.ant-tree-node-selected .ant-tree-title > span {
  color: rgb(var(--primary-6)) !important;
  font-weight: 500;
}

body[arco-theme='dark'] .ant-tree-node-selected .ant-tree-title,
body[arco-theme='dark'] .ant-tree-node-selected .ant-tree-title > span {
  color: rgb(255, 255, 255) !important;
}

.headswitch {
  width: 100%;
  height: 56px;
  overflow: hidden;
  text-align: center;
  position: relative;
  padding-top: 16px;
  padding-bottom: 6px;
  flex-shrink: 0;
  flex-grow: 0;
}
.headswitch .bghr {
  position: absolute;
  left: 0;
  right: 0;
  top: 32px;
  border-bottom: 1px solid var(--color-neutral-3);
  z-index: -1;
}
.headswitch .sw {
  margin: 0 auto;
  background: var(--color-bg-1);
  width: fit-content;
}

.rootsearch {
  width: calc(100% - 151px) !important;
  float: right;
}
.rootsearch.arco-input-wrapper {
  background-color: transparent;
  border: 1px solid rgb(var(--primary-6)) !important;
}

.colortree {
  height: 246px;
  flex-shrink: 0;
  flex-grow: 0;
}
.quickdrop {
  height: 50px;
  flex-shrink: 0;
  flex-grow: 0;
  margin: 0 4px 10px 26px;
  border: 3px dotted var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  text-align: center;
  line-height: 1.3;
}

.quicktree .ant-tree-icon__customize .iconfont {
  font-size: 18px;
  margin-right: 2px;
}

.quicktree .ant-tree-node-content-wrapper {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.quicktree .ant-tree-title {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.quicktree .quicktitle {
  flex-shrink: 1;
  flex-grow: 1;
  display: -webkit-box;
  max-height: 24px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
}

.quicktree .quickbtn {
  padding-left: 2px;
  padding-right: 2px;
  font-size: 12px;
  color: var(--color-text-3);
  flex-shrink: 0;
  flex-grow: 0;
}
.quicktree .quickbtn .arco-btn-size-mini {
  padding: 0 4px;
}

.quicktree .quickbtn .arco-btn-size-mini:hover,
.quicktree .quickbtn .arco-btn-size-mini:active {
  color: #fff !important;
  background: rgba(255, 77, 79, 0.85) !important;
}
</style>
