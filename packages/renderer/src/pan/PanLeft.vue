<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import usePanTreeStore from './pantreestore'
import MySwitchTab from '../layout/MySwitchTab.vue'
import { KeyboardState, useAppStore, useKeyboardStore, usePanFileStore, useSettingStore, useWinStore } from '../store'
import fuzzysort from 'fuzzysort'
import PanDAL from './pandal'
import { onShowRightMenu, onHideRightMenuScroll, TestCtrl } from '@/utils/keyboardhelper'
import DirLeftMenu from './menus/DirLeftMenu.vue'
import { TreeNodeData } from '@/store/treestore'
import { dropMoveSelectedFile } from './topbtns/topbtn'
import message from '@/utils/message'

const treeref = ref()
const winStore = useWinStore()
const TreeHeight = computed(() => winStore.height - 42 - 56 - 24 - 4)
const QuickHeight = computed(() => winStore.height - 42 - 56 - 24 - 4 - 280)
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

const switchvalues = [
  { key: 'wangpan', title: '网盘文件', alt: '' },
  { key: 'kuaijie', title: '快捷方式', alt: '' }
]

const colorTreeData = ref<TreeNodeData[]>([])
const quickTreeData = ref<TreeNodeData[]>([])

watchEffect(() => {
  let list = settingStore.uiFileColorArray
  let nodelist: TreeNodeData[] = []
  for (let i = 0; i < list.length; i++) {
    nodelist.push({
      __v_skip: true,
      key: list[i].key.replace('#', 'c'),
      title: list[i].title || list[i].key,
      namesearch: '',
      children: [],
      isLeaf: true
    })
  }
  nodelist.push({
    __v_skip: true,
    key: 'c5b89b8',
    title: '已看视频',
    namesearch: '',
    children: [],
    isLeaf: true
  })
  Object.freeze(nodelist)
  colorTreeData.value = nodelist
})

const handleTreeRightClick = (e: { event: MouseEvent; node: any }) => {
  let key = e.node.key as string
  if (key.length < 40 || key.startsWith('search')) return
  PanDAL.aShowDir('', key, true)
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

  
  const fileslist = ev.dataTransfer.files
  if (fileslist && fileslist.length > 0) {
    const files: string[] = []
    
    for (let i = 0, maxi = fileslist.length; i < maxi; i++) {
      const path = fileslist[i].path
      files.push(path)
    }
    message.warning('上传' + files[0])
    //UploadDAL.UploadLocalFiles(UserDAL.QueryUserID(), this.props.pandir.selectDir.drive_id, this.props.pandir.selectDir.file_id, files, true) 
  } else {
    
    dropMoveSelectedFile(movetodirid)
  }
}

const onQuickDrop = (ev: any) => {
  console.log('onQuickDrop', ev)
  ev.preventDefault() 
  ev.target.style.outline = 'none'
  ev.target.style.background = ''

  let list: { key: string; title: string }[] = []
  const selectedFile = usePanFileStore().GetSelected()
  for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
    if (selectedFile[i].isdir) {
      list.push({ key: selectedFile[i].file_id, title: selectedFile[i].name })
    }
  }
  PanDAL.updateQuickFile(list)
}
const handleQuickDelete = (key: string) => {
  PanDAL.deleteQuickFile(key)
}
const handleQuickSelect = (index: number) => {
  let array = PanDAL.getQuickFileList()
  if (array.length >= index) {
    let key = array[index - 1].key
    PanDAL.aShowDir('', key, true)
  }
}
</script>
<script lang="ts">
/** Tree快速搜索-已屏蔽 */
function SearchRoot(val: string, list: TreeNodeData[]) {
  let result: TreeNodeData[] = []
  if (list.length == 0) return result
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    let item = list[i]
    let add: TreeNodeData = {
      __v_skip: true,
      key: item.key,
      title: item.title,
      namesearch: item.namesearch,
      children: [],
      icon: item.icon,
      isLeaf: item.isLeaf
    }
    if (item.children.length > 0) add.children = SearchNode(val, item.children) 
    result.push(add)
  }
  return result
}
/** Tree快速搜索node */
function SearchNode(val: string, list: TreeNodeData[]): TreeNodeData[] {
  let result: TreeNodeData[] = []
  if (list.length == 0) return result

  let findmap = new Set()
  let results = fuzzysort.go(val, list, {
    threshold: -10000,
    keys: ['title', 'namesearch'],
    scoreFn: (a) => Math.max(a[0] ? a[0].score : -10000, a[1] ? a[1].score : -10000)
  })
  for (let i = 0, maxi = results.length; i < maxi; i++) {
    if (results[i].score > -10000) findmap.add(results[i].obj.key)
  }

  for (let i = 0, maxi = list.length; i < maxi; i++) {
    let item = list[i]
    let add: TreeNodeData = {
      __v_skip: true,
      key: item.key,
      title: item.title,
      namesearch: item.namesearch,
      children: [],
      icon: item.icon,
      isLeaf: item.isLeaf
    }
    if (item.children.length > 0) add.children = SearchNode(val, item.children) 
    add.isLeaf = item.children.length == 0
    if (findmap.has(add.key) || add.children.length > 0) result.push(add) 
  }

  return result
}
</script>

<template>
  <div style="width: 100%; height: 100%; overflow: hidden; min-width: 300px" tabindex="-1" @keydown.tab.prevent="() => true">
    <div class="headswitch">
      <div class="bghr"></div>
      <div class="sw">
        <MySwitchTab :name="'panleft'" :tabs="switchvalues" :value="appStore.GetAppTabMenu" @update:value="(val:string)=>appStore.toggleTabMenu('pan', val)" />
      </div>
    </div>
    <div class="treeleft">
      <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="appStore.GetAppTabMenu">
        <a-tab-pane key="wangpan" title="1">
          <AntdTree
            :tabindex="-1"
            :focusable="false"
            ref="treeref"
            class="dirtree"
            blockNode
            selectable
            :autoExpandParent="false"
            showIcon
            :height="TreeHeight"
            :style="{ height: TreeHeight + 'px' }"
            :itemHeight="30"
            :showLine="{ showLeafIcon: false }"
            :openAnimation="{}"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected(e.node.key)"
            @expand="(_:any[],e:any)=>pantreeStore.mTreeExpand(e.node.key)"
            @rightClick="handleTreeRightClick"
            @scroll="onHideRightMenuScroll"
            :expandedKeys="pantreeStore.treeExpandedKeys"
            :selectedKeys="pantreeStore.treeSelectedKeys"
            :treeData="pantreeStore.treeData"
          >
            <template #switcherIcon>
              <i class="ant-tree-switcher-icon iconfont Arrow" />
            </template>
            <template #icon>
              <i class="iconfont iconfile-folder" />
            </template>
            <template #title="{ dataRef }">
              <span v-if="dataRef.key.length == 40 || dataRef.key == 'root'" class="dirtitle treedragnode" @drop="onRowItemDrop($event, dataRef.key)" @dragover="onRowItemDragOver" @dragenter="onRowItemDragEnter" @dragleave="onRowItemDragLeave">{{
                dataRef.title
              }}</span>
              <span v-else class="dirtitle">{{ dataRef.title }}</span>
            </template>
          </AntdTree>

          <DirLeftMenu />
        </a-tab-pane>
        <a-tab-pane key="kuaijie" title="2">
          <AntdTree
            :tabindex="-1"
            :focusable="false"
            class="colortree"
            blockNode
            selectable
            :autoExpandParent="false"
            showIcon
            :itemHeight="30"
            :showLine="{ showLeafIcon: false }"
            :openAnimation="{}"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected('color'+e.node.key+' '+e.node.title)"
            :selectedKeys="pantreeStore.treeSelectedKeys"
            :treeData="colorTreeData"
          >
            <template #icon>
              <i class="iconfont iconwbiaoqian" />
            </template>
            <template #title="{ dataRef }">
              <span :class="'dirtitle ' + dataRef.key">标记 · {{ dataRef.title }}</span>
            </template>
          </AntdTree>
          <div class="quickdrop" @drop="onQuickDrop($event)" @dragover="onRowItemDragOver" @dragenter="onRowItemDragEnter" @dragleave="onRowItemDragLeave">把右侧的文件夹拖放到这里<br />创建快捷方式(Ctrl 1-9)</div>
          <AntdTree
            :tabindex="-1"
            :focusable="false"
            class="quicktree"
            blockNode
            selectable
            :autoExpandParent="false"
            showIcon
            :height="QuickHeight"
            :style="{ height: QuickHeight + 'px' }"
            :itemHeight="30"
            :showLine="{ showLeafIcon: false }"
            :openAnimation="{}"
            @select="(_:any[],e:any)=>pantreeStore.mTreeSelected(e.node.key)"
            :selectedKeys="pantreeStore.treeSelectedKeys"
            :treeData="pantreeStore.quickData"
          >
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
.dirtree .iconfont.iconrss_video {
  color: #a760ef;
}
.ant-tree .iconfolder {
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
  height: 216px;
  flex-shrink: 0;
  flex-grow: 0;
}
.quickdrop {
  height: 50px;
  flex-shrink: 0;
  flex-grow: 0;
  margin: 0 4px 10px 26px;
  border: 4px dotted #eeeeee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  text-align: center;
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
