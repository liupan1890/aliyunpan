<!-- eslint-disable no-irregular-whitespace -->
<script setup lang="ts">
import { IAliGetFileModel } from '../aliapi/alimodels'
import { KeyboardState, useAppStore, useFootStore, useKeyboardStore, usePanFileStore, useSettingStore } from '../store'
import useWinStore from '../store/winstore'
import { onShowRightMenu, TestCtrl, TestCtrlShift, TestKey, TestKeyboardScroll, TestKeyboardSelect, onHideRightMenuScroll } from '../utils/keyboardhelper'
import { onMounted, ref, watchEffect } from 'vue'
import PanDAL from './pandal'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'

import { handleUpload, topFavorDeleteAll, menuFavSelectFile, menuTrashSelectFile, menuCopySelectedFile, menuCreatShare, topSearchAll, dropMoveSelectedFile } from './topbtns/topbtn'
import { modalCreatNewFile, modalCreatNewDir, modalRename, modalDaoRuShareLink, modalUpload } from '../utils/modal'
import { PanFileState } from './panfilestore'
import PanTopbtn from './menus/PanTopbtn.vue'
import FileTopbtn from './menus/FileTopbtn.vue'
import FileRightMenu from './menus/FileRightMenu.vue'
import TrashRightMenu from './menus/TrashRightMenu.vue'
import TrashTopbtn from './menus/TrashTopbtn.vue'
import DirTopPath from './menus/DirTopPath.vue'
import message from '../utils/message'
import { menuOpenFile } from '../utils/openfile'
import { throttle } from '../utils/debounce'

const viewlist = ref()
const inputsearch = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const panfileStore = usePanFileStore()


let dirID = ''
panfileStore.$subscribe((_m: any, state: PanFileState) => {
  if (state.DirID != dirID) {
    dirID = state.DirID
    if (viewlist.value) viewlist.value.scrollIntoView(0)
  }

  const isTrash = panfileStore.SelectDirType == 'trash' || panfileStore.SelectDirType == 'recover'
  const selectItem = panfileStore.GetSelectedFirst()
  const isShowVideo = !isTrash && panfileStore.ListSelected.size == 1 && selectItem?.category == 'video'
  if (menuShowVideo.value != isShowVideo) menuShowVideo.value = isShowVideo
  const isShowZip = !isTrash && panfileStore.ListSelected.size == 1 && (selectItem?.ext == 'zip' || selectItem?.ext == 'rar')
  if (menuShowZip.value != isShowZip) menuShowZip.value = isShowZip
})

watchEffect(() => {
  const scrollToFile = panfileStore.scrollToFile
  if (scrollToFile) {
    if (viewlist.value) viewlist.value.scrollIntoView({ key: scrollToFile, align: 'top', offset: 220 })
    panfileStore.mSaveFileScrollTo('')
  }
})

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'pan') return

  if (TestCtrl('a', state.KeyDownEvent, () => panfileStore.mSelectAll())) return 
  if (TestCtrl('c', state.KeyDownEvent, () => menuCopySelectedFile(false, 'copy'))) return 
  if (TestCtrl('x', state.KeyDownEvent, () => menuCopySelectedFile(false, 'cut'))) return 
  if (TestCtrlShift('Delete', state.KeyDownEvent, () => menuTrashSelectFile(false, true))) return 
  if (TestCtrl('Delete', state.KeyDownEvent, () => menuTrashSelectFile(false, false))) return 
  if (
    TestCtrlShift('f', state.KeyDownEvent, () => {
      PanDAL.aReLoadOneDirToShow('', 'search', false)
      setTimeout(() => {
        document.getElementById('searchpanInput')?.focus()
      }, 300)
    }) 
  )
    return 
  if (TestCtrl('f', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f3', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey(' ', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestCtrlShift('n', state.KeyDownEvent, () => modalCreatNewDir('folder'))) return 
  if (TestCtrl('n', state.KeyDownEvent, modalCreatNewFile)) return 
  if (TestCtrlShift('u', state.KeyDownEvent, () => handleUpload('folder'))) return 
  if (TestCtrl('u', state.KeyDownEvent, () => handleUpload('file'))) return 
  if (TestCtrl('l', state.KeyDownEvent, modalDaoRuShareLink)) return 
  if (TestCtrl('h', state.KeyDownEvent, handleHome)) return 
  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return 
  if (TestKey('f6', state.KeyDownEvent, handleDingWei)) return 
  if (TestKey('Backspace', state.KeyDownEvent, handleBack)) return 
  if (TestKey('f2', state.KeyDownEvent, () => modalRename(false, panfileStore.IsListSelectedMulti))) return 
  if (TestCtrl('e', state.KeyDownEvent, () => modalRename(false, panfileStore.IsListSelectedMulti))) return 
  if (TestCtrl('s', state.KeyDownEvent, () => menuCreatShare(false, 'pan'))) return 
  if (TestCtrl('g', state.KeyDownEvent, () => menuFavSelectFile(false, !panfileStore.IsListSelectedFavAll))) return 
  if (TestCtrl('q', state.KeyDownEvent, onSelectRangStart)) return 
  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, panfileStore, handleOpenFile)) return 
  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, panfileStore)) return 
})

const handleRefresh = () => PanDAL.aReLoadOneDirToShow('', 'refresh', false)
const handleDingWei = () => PanDAL.aTreeScrollToDir('refresh')
const handleBack = () => PanDAL.aReLoadOneDirToShow('', 'back', false)
const handleHome = () => PanDAL.aReLoadOneDirToShow('', 'root', false)
const handleSelectAll = () => panfileStore.mSelectAll()


const handleSelect = (file_id: string, event: any, isCtrl: boolean = false) => {
  onHideRightMenuScroll()

  if (rangIsSelecting.value) {
    
    if (!rangSelectID.value) {
      
      
      if (!panfileStore.ListSelected.has(file_id)) panfileStore.mMouseSelect(file_id, true, false)
      rangSelectID.value = file_id
      rangSelectStart.value = file_id
      rangSelectFiles.value = { [file_id]: true }
    } else {
      
      const start = rangSelectID.value
      const children = panfileStore.ListDataShow
      let a = -1
      let b = -1
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        if (children[i].file_id == file_id) a = i
        if (children[i].file_id == start) b = i
        if (a > 0 && b > 0) break
      }
      const fileList: string[] = []
      if (a >= 0 && b >= 0) {
        if (a > b) [a, b] = [b, a] 
        for (let n = a; n <= b; n++) {
          fileList.push(children[n].file_id)
        }
      }
      panfileStore.mRangSelect(file_id, fileList)
      rangIsSelecting.value = false
      rangSelectID.value = ''
      rangSelectStart.value = ''
      rangSelectEnd.value = ''
      rangSelectFiles.value = {}
    }
    panfileStore.mRefreshListDataShow(false) 
  } else {
    panfileStore.mMouseSelect(file_id, event.ctrlKey || isCtrl, event.shiftKey)
  }
}

const handleOpenFile = (event: Event, file: IAliGetFileModel | undefined) => {
  if (rangIsSelecting.value) return 
  if (panfileStore.DirID == 'trash' || panfileStore.DirID == 'recover') {
    return 
  }
  if (!file) file = panfileStore.GetSelectedFirst()
  if (!file) return

  if (file.isDir) {
    
    PanDAL.aReLoadOneDirToShow('', file.compilation_id ? 'video' + file.name : file.file_id, true)
    return
  }
  
  if (!panfileStore.ListSelected.has(file.file_id)) panfileStore.mMouseSelect(file.file_id, false, false)

  menuOpenFile(file) 
}

const handleSearchInput = (value: string) => {
  panfileStore.mSearchListData(value)
  viewlist.value.scrollIntoView(0)
}
const handleSearchEnter = (event: any) => {
  event.target.blur()
  viewlist.value.scrollIntoView(0)
}

const menuShowVideo = ref(false)
const menuShowZip = ref(false)
const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key
  
  if (!panfileStore.ListSelected.has(key)) panfileStore.mMouseSelect(key, false, false)
  const dirType = panfileStore.SelectDirType
  onShowRightMenu(dirType == 'trash' || dirType == 'recover' ? 'rightpantrashmenu' : 'rightpanmenu', e.event.clientX, e.event.clientY)
}



const handleFileListOrder = (order: string) => {
  panfileStore.mOrderListData(order)
}
let listGridWidth = 0
const resizeObserver = new ResizeObserver((entries) => {
  let newWidth = 0
  entries.map((t) => {
    newWidth = t.contentRect?.width || 0
    return true
  })

  if (listGridWidth != newWidth && newWidth > 400) {
    listGridWidth = newWidth
    onGridResize()
  }
})
const onGridResize = throttle(() => {
  handleListGridMode(listGridMode.value)
  useFootStore().rightWidth = listGridWidth
}, 100)

onMounted(() => {
  resizeObserver.observe(document.getElementById('panfilelist')!)
})

const listGridMode = ref('list')
const listGridColumn = ref(1)
const listGridItemHeight = ref(50)
const handleListGridMode = (mode: string) => {
  listGridMode.value = mode
  if (mode == 'list') {
    if (listGridItemHeight.value != 50) {
      listGridItemHeight.value = 50
      listGridColumn.value = 1
    }
  } else if (mode == 'image') {
    const count = Math.max(3, Math.floor(listGridWidth / 150))
    if (listGridItemHeight.value != 180) listGridItemHeight.value = 180
    if (listGridColumn.value != count) listGridColumn.value = count
  } else {
    const count = Math.max(2, Math.floor(listGridWidth / 200))
    if (listGridItemHeight.value != 180) listGridItemHeight.value = 240
    if (listGridColumn.value != count) listGridColumn.value = count
  }
  useSettingStore().updateStore({ uiFileListMode: mode }) 
  panfileStore.mGridListData(listGridMode.value, listGridColumn.value)
}


const rangIsSelecting = ref(false)
const rangSelectID = ref('')
const rangSelectStart = ref('')
const rangSelectEnd = ref('')
const rangSelectFiles = ref<{ [k: string]: any }>({})

const onSelectRangStart = () => {
  onHideRightMenuScroll()
  rangIsSelecting.value = !rangIsSelecting.value
  rangSelectID.value = ''
  rangSelectStart.value = ''
  rangSelectEnd.value = ''
  rangSelectFiles.value = {}
  panfileStore.mRefreshListDataShow(false) 
}

const onSelectRang = (file_id: string) => {
  if (rangIsSelecting.value && rangSelectID.value != '') {
    
    let startid = rangSelectID.value
    let endid = ''
    const s: { [k: string]: any } = {}
    const children = panfileStore.ListDataShow
    let a = -1
    let b = -1
    for (let i = 0, maxi = children.length; i < maxi; i++) {
      if (children[i].file_id == file_id) a = i
      if (children[i].file_id == startid) b = i
      if (a > 0 && b > 0) break
    }
    if (a >= 0 && b >= 0) {
      if (a > b) {
        ;[a, b] = [b, a] 
        endid = file_id
      } else {
        endid = startid
        startid = file_id
      }
      for (let n = a; n <= b; n++) {
        s[children[n].file_id] = true
      }
    }

    rangSelectStart.value = startid
    rangSelectEnd.value = endid
    rangSelectFiles.value = s
    panfileStore.mRefreshListDataShow(false) 
  }
}

const dragingRowItem = ref(false)
const onRowItemDragStart = (ev: any, file_id: string) => {
  if (rangIsSelecting.value) {
    ev.stopPropagation()
    ev.preventDefault()
    return
  }

  onHideRightMenuScroll()
  dragingRowItem.value = true
  
  if (!panfileStore.ListSelected.has(file_id)) panfileStore.mMouseSelect(file_id, false, false)
  const files = panfileStore.GetSelected()
  if (files.length == 0) return

  const dragImage = document.createElement('div')
  dragImage.className = 'dragrowitem'
  if (files.length == 1) {
    dragImage.innerHTML = '<a>移动</a>' + files[0].name
  } else {
    dragImage.innerHTML = '<a>批量移动</a>' + files[0].name + ' 等(' + files.length.toString() + '个文件)'
  }

  if (ev.dataTransfer) {
    document.body.appendChild(dragImage)
    ev.dataTransfer.setDragImage(dragImage, -16, 10)
    ev.dataTransfer.dropEffect = 'move'
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }
}
const onRowItemDragEnter = (ev: any) => {
  if (dragingRowItem.value) {
    ev.stopPropagation()
    ev.preventDefault()
    ev.target.style.outline = '2px dotted #637dff'
    ev.target.style.background = 'rgba(var(--primary-6),0.3)'
    ev.dataTransfer.dropEffect = 'move'
  }
}
const onRowItemDragLeave = (ev: any) => {
  if (dragingRowItem.value) {
    ev.stopPropagation()
    ev.preventDefault()
    ev.target.style.outline = 'none'
    ev.target.style.background = ''
  }
}
const onRowItemDragOver = (ev: any) => {
  if (dragingRowItem.value) {
    ev.stopPropagation()
    ev.preventDefault() 
  }
}
const onRowItemDrop = (ev: any, movetodirid: string) => {
  ev.stopPropagation()
  ev.preventDefault() 
  ev.target.style.outline = 'none'
  ev.target.style.background = ''
  dropMoveSelectedFile(movetodirid)
}
const onRowItemDragEnd = (ev: any) => {
  if (dragingRowItem.value) {
    ev.stopPropagation()
    ev.preventDefault()
    dragingRowItem.value = false
  }
}


const showDragUpload = ref(false)
const onPanDrop = (e: any) => {
  if (!e.dataTransfer.files || e.dataTransfer.files.length == 0) return
  e.stopPropagation()
  e.preventDefault() 
  showDragUpload.value = false

  if (panfileStore.DirID.startsWith('color')) {
    message.error('不能把文件上传到颜色标记里！请先选择一个网盘里的文件夹')
  }
  if (panfileStore.DirID.startsWith('search')) {
    message.error('不能把文件上传到搜索结果里！请先选择一个网盘里的文件夹')
  }
  if (panfileStore.DirID == 'favorite') {
    message.error('不能把文件上传到收藏里！请先选择一个网盘里的文件夹')
  }
  if (panfileStore.DirID == 'recover') {
    message.error('不能把文件上传到文件恢复里！请先选择一个网盘里的文件夹')
  }
  if (panfileStore.DirID == 'trash') {
    message.error('不能把文件上传到回收站里！请先选择一个网盘里的文件夹')
  }
  if (panfileStore.DirID.length != 40 && panfileStore.DirID != 'root') {
    message.error('错误的上传位置！请先选择一个网盘里的文件夹')
    return
  }

  
  const filesList = e.dataTransfer.files
  if (filesList && filesList.length > 0) {
    const files: string[] = []
    
    for (let i = 0, maxi = filesList.length; i < maxi; i++) {
      const path = filesList[i].path
      files.push(path)
    }

    modalUpload(panfileStore.DirID, files)
  }
}
const onPanDragEnter = (ev: any) => {
  if (dragingRowItem.value) return
  ev.stopPropagation()
  ev.preventDefault()
  ev.dataTransfer.dropEffect = 'copy'
  showDragUpload.value = true
}
const onPanDragLeave = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault()
  showDragUpload.value = false
}
const onPanDragOver = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault() 
}
const onPanDragEnd = (ev: any) => {
  if (showDragUpload.value) {
    ev.stopPropagation()
    ev.preventDefault()
    showDragUpload.value = false
  }
}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px">
    <DirTopPath />
    <div style="flex-grow: 1"></div>
    <div v-if="panfileStore.SelectDirType == 'trash'" class="toppantip">回收站有效期 免费=10天 会员=30天 超级会员=60天</div>
    <div v-if="panfileStore.SelectDirType == 'recover'" class="toppantip">仅会员可用 恢复60天内彻底删除的文件(不保留文件夹路径)</div>
    <div v-if="panfileStore.SelectDirType == 'favorite'" class="toppantip">列出已收藏的文件和文件夹 右键可定位到文件夹</div>
    <div v-if="panfileStore.SelectDirType == 'color'" class="toppantip">列出已标记的文件和文件夹 右键可定位到文件夹</div>
    <div v-if="panfileStore.SelectDirType == 'video'" class="toppantip">同步手机APP的放映室 设置为内置网页播放器时可继续播放</div>
  </div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px" tabindex="-1">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" :disabled="panfileStore.ListLoading" title="后退 Back Space" @click="handleBack">
        <template #icon>
          <i class="iconfont iconarrow-left-2-icon" />
        </template>
      </a-button>
      <a-button type="text" size="small" tabindex="-1" :loading="panfileStore.ListLoading" title="刷新 F5" @click="handleRefresh">
        <template #icon>
          <i class="iconfont iconreload-1-icon" />
        </template>
      </a-button>
      <a-button type="text" size="small" tabindex="-1" :disabled="panfileStore.ListLoading" title="定位 F6" @click="handleDingWei">
        <template #icon>
          <i class="iconfont icondingwei" />
        </template>
      </a-button>
    </div>
    <div v-show="panfileStore.SelectDirType == 'favorite'" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" class="danger" @click="topFavorDeleteAll"><i class="iconfont iconcrown2" />清空收藏夹</a-button>
    </div>
    <div v-show="panfileStore.SelectDirType == 'search' && !panfileStore.IsListSelected" class="toppanbtn">
      <a-input-search
        class="searchpan"
        style="width: 240px"
        :loading="panfileStore.ListLoading"
        placeholder="输入关键字，搜索整个网盘"
        button-text="搜索"
        search-button
        :input-attrs="{ id: 'searchpanInput' }"
        @search="(val:string)=>topSearchAll(val)"
        @press-enter="($event:any)=>topSearchAll($event.srcElement.value as string)"
        @keydown.esc=";($event.target as any).blur()" />
      <a-button type="text" size="small" tabindex="-1" style="border: none" @click="() => topSearchAll('topSearchAll高级搜索')">高级搜索</a-button>
    </div>

    <PanTopbtn :dirtype="panfileStore.SelectDirType" :isselected="panfileStore.IsListSelected" />
    <FileTopbtn :dirtype="panfileStore.SelectDirType" :isselected="panfileStore.IsListSelected" :isvideo="menuShowVideo" :isselectedmulti="panfileStore.IsListSelectedMulti" :isallfavored="panfileStore.IsListSelectedFavAll" />
    <TrashTopbtn :dirtype="panfileStore.SelectDirType" :isselected="panfileStore.IsListSelected" />

    <div style="flex-grow: 1"></div>
    <div class="toppanbtn">
      <a-input-search
        ref="inputsearch"
        :model-value="panfileStore.ListSearchKey"
        :input-attrs="{ tabindex: '-1' }"
        size="small"
        title="Ctrl+F / F3 / Space"
        placeholder="快速筛选"
        draggable="false"
        @dragenter.stop="() => false"
        @input="(val:any)=>handleSearchInput(val as string)"
        @press-enter="handleSearchEnter"
        @keydown.esc=";($event.target as any).blur()" />
    </div>
    <div></div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea" tabindex="-1">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" title="Ctrl+A" @click="handleSelectAll">
          <i :class="panfileStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ panfileStore.ListDataSelectCountInfo }}</div>
    <div style="margin: 0 2px">
      <AntdTooltip placement="rightTop">
        <a-button shape="square" type="text" tabindex="-1" class="qujian" :status="rangIsSelecting ? 'danger' : 'normal'" title="Ctrl+Q" @click="onSelectRangStart">
          {{ rangIsSelecting ? '取消选择' : '区间选择' }}
        </a-button>
        <template #title>
          <div>
            第1步: 点击 区间选择 这个按钮
            <br />
            第2步: 鼠标点击一个文件
            <br />
            第3步: 移动鼠标点击另外一个文件
          </div>
        </template>
      </AntdTooltip>
    </div>
    <div style="flex-grow: 1"></div>
    <div class="fileorder">
      <a-dropdown trigger="hover" position="bl" @select="(val:any)=>handleFileListOrder(val as string)">
        <a-button type="text" size="small" tabindex="-1" :disabled="panfileStore.ListLoading"><i class="iconfont iconpaixu1" />{{ panfileStore.FileOrderDesc }} <i class="iconfont icondown" /></a-button>

        <template #content>
          <a-doption value="name asc">
            <template #default>　名称 · 升序　</template>
          </a-doption>
          <a-doption value="name desc">
            <template #default>　名称 · 降序　</template>
          </a-doption>
          <a-doption value="updated_at asc">
            <template #default>　时间 · 升序　</template>
          </a-doption>
          <a-doption value="updated_at desc">
            <template #default>　时间 · 降序　</template>
          </a-doption>
          <a-doption value="size asc">
            <template #default>　大小 · 升序　</template>
          </a-doption>
          <a-doption value="size desc">
            <template #default>　大小 · 降序　</template>
          </a-doption>
        </template>
      </a-dropdown>
    </div>
    <div>
      <AntdTooltip title="列表模式" placement="bottom">
        <a-button shape="square" type="text" tabindex="-1" :class="listGridMode == 'list' ? 'select active' : 'select'" @click="() => handleListGridMode('list')">
          <i class="iconfont iconliebiaomoshi" />
        </a-button>
      </AntdTooltip>
      <AntdTooltip title="缩略图模式" placement="bottom">
        <a-button shape="square" type="text" tabindex="-1" :class="listGridMode == 'image' ? 'select active' : 'select'" @click="() => handleListGridMode('image')">
          <i class="iconfont iconxiaotumoshi" />
        </a-button>
      </AntdTooltip>
      <AntdTooltip title="大图模式" placement="bottom">
        <a-button shape="square" type="text" tabindex="-1" :class="listGridMode == 'bigimage' ? 'select active' : 'select'" @click="() => handleListGridMode('bigimage')">
          <i class="iconfont iconsuoluetumoshi" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="cell pr"></div>
  </div>
  <div
    id="panfilelist"
    :class="'toppanlist' + (showDragUpload ? ' pandraging' : '') + (dragingRowItem ? ' draging' : '') + (rangIsSelecting ? ' ranging' : '')"
    tabindex="-1"
    :style="{ height: winStore.GetListHeight }"
    @keydown.space.prevent="() => true"
    @drop="onPanDrop"
    @dragenter="onPanDragEnter">
    <a-skeleton v-if="panfileStore.ListLoading && panfileStore.ListDataCount == 0" :loading="true" :animation="true">
      <a-skeleton-line :rows="10" :line-height="50" :line-spacing="50" />
    </a-skeleton>
    <a-list
      v-else-if="listGridMode == 'list'"
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtual-list-props="{
        height: winStore.GetListHeightNumber,
        fixedSize: true,
        estimatedSize: 50,
        threshold: 1,
        itemKey: 'file_id'
      }"
      style="width: 100%"
      :data="panfileStore.ListDataShow"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="空文件夹" /></template>
      <template #item="{ item, index }">
        <div :key="'l-' + item.file_id" class="listitemdiv">
          <div
            v-if="item.isDir"
            :class="'fileitem' + (panfileStore.ListSelected.has(item.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == item.file_id ? ' focus' : '')"
            draggable="true"
            @click="handleSelect(item.file_id, $event)"
            @mouseover="onSelectRang(item.file_id)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.file_id}} )"
            @dragstart="(ev) => onRowItemDragStart(ev, item.file_id)"
            @dragend="onRowItemDragEnd"
            @drop="onRowItemDrop($event, item.file_id)"
            @dragover="onRowItemDragOver"
            @dragenter="onRowItemDragEnter"
            @dragleave="onRowItemDragLeave">
            <div :class="'rangselect ' + (rangSelectFiles[item.file_id] ? (rangSelectStart == item.file_id ? 'rangstart' : rangSelectEnd == item.file_id ? 'rangend' : 'rang') : '')">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.file_id, $event, true)">
                <i :class="panfileStore.ListSelected.has(item.file_id) ? (item.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : item.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + item.icon" aria-hidden="true"></i>
            </div>
            <div class="filename" droppable="false">
              <div @click="handleOpenFile($event, item)">
                {{ item.name }}
              </div>
            </div>
            <div class="filebtn">
              <a-button v-if="item.description" type="text" tabindex="-1" class="label" title="标记">
                <i class="iconfont iconwbiaoqian" :class="item.description" />
              </a-button>
              <a-popover v-if="item.thumbnail" content-class="popimg" position="lt">
                <a-button type="text" tabindex="-1" class="gengduo" title="缩略图">
                  <i class="iconfont icongengduo" />
                </a-button>
                <template #content>
                  <div class="preimg">
                    <img :src="item.thumbnail" onerror="javascript:this.src='imgerror.png';" />
                  </div>
                </template>
              </a-popover>
              <a-button v-else type="text" tabindex="-1" class="gengduo" disabled> </a-button>
            </div>

            <div class="filesize">{{ item.sizeStr }}</div>
            <div class="filetime">{{ item.timeStr }}</div>
          </div>

          <div
            v-else
            :class="'fileitem' + (panfileStore.ListSelected.has(item.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == item.file_id ? ' focus' : '')"
            draggable="true"
            @click="handleSelect(item.file_id, $event)"
            @mouseover="onSelectRang(item.file_id)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.file_id}} )"
            @dragstart="(ev) => onRowItemDragStart(ev, item.file_id)"
            @dragend="onRowItemDragEnd">
            <div :class="'rangselect ' + (rangSelectFiles[item.file_id] ? (rangSelectStart == item.file_id ? 'rangstart' : rangSelectEnd == item.file_id ? 'rangend' : 'rang') : '')">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.file_id, $event, true)">
                <i :class="panfileStore.ListSelected.has(item.file_id) ? (item.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : item.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + item.icon" aria-hidden="true"></i>
            </div>
            <div class="filename" droppable="false">
              <div @click="handleOpenFile($event, item)">
                {{ item.name }}
              </div>
            </div>
            <div class="filebtn">
              <a-button v-if="item.description" type="text" tabindex="-1" class="label" title="标记">
                <i class="iconfont iconwbiaoqian" :class="item.description" />
              </a-button>
              <a-popover v-if="item.thumbnail" content-class="popimg" position="lt">
                <a-button type="text" tabindex="-1" class="gengduo">
                  <i class="iconfont icontupianyulan" />
                </a-button>
                <template #content>
                  <div class="preimg">
                    <img :src="item.thumbnail" onerror="javascript:this.src='imgerror.png';" />
                  </div>
                </template>
              </a-popover>
              <a-button v-else type="text" tabindex="-1" class="gengduo" disabled> </a-button>
            </div>

            <div class="filesize">
              {{ item.sizeStr }}
              <span>{{ item.media_duration }}</span>
              <span>{{ item.media_width > 0 ? item.media_width + 'x' + item.media_height : '' }}</span>
            </div>
            <div class="filetime">{{ item.timeStr }}</div>
          </div>
        </div>
      </template>
    </a-list>

    <a-list
      v-else-if="listGridMode == 'image'"
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtual-list-props="{
        height: winStore.GetListHeightNumber,
        fixedSize: true,
        estimatedSize: 200,
        threshold: 1,
        itemKey: 'file_id',
        buffer: 5
      }"
      style="width: 100%"
      :data="panfileStore.ListDataGrid"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="空文件夹" /></template>
      <template #item="{ item, index }">
        <div :key="'g-' + item.file_id" class="listitemdiv">
          <div class="gridrow" :style="{ gridTemplateColumns: 'repeat(' + listGridColumn + ', 150px)' }">
            <template v-for="(grid, gindex) in item.files" :key="grid.file_id">
              <div
                v-if="grid.isDir"
                :class="'griditem ' + listGridMode + ' ' + (panfileStore.ListSelected.has(grid.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == grid.file_id ? ' focus' : '')"
                draggable="true"
                @click="handleSelect(grid.file_id, $event)"
                @mouseover="() => onSelectRang(grid.file_id)"
                @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:grid.file_id}} )"
                @dragstart="(ev) => onRowItemDragStart(ev, grid.file_id)"
                @dragend="onRowItemDragEnd"
                @drop="onRowItemDrop($event, grid.file_id)"
                @dragover="onRowItemDragOver"
                @dragenter="onRowItemDragEnter"
                @dragleave="onRowItemDragLeave">
                <div class="gridicon">
                  <i :class="'iconfont ' + grid.icon" aria-hidden="true" role="img"></i>
                </div>
                <div class="gridicon"><img v-if="grid.thumbnail" :src="grid.thumbnail" @error="(e) => {(e.currentTarget! as any).style.display = 'none'}" /></div>

                <div class="gridicon">
                  <span v-if="grid.category.startsWith('video')" class="playicon" @click="handleOpenFile($event, grid)">
                    <svg viewBox="0 0 1024 1024">
                      <path d="M689.066667 480l-196.266667-177.066667c-27.733333-25.6-70.4-6.4-70.4 32v356.266667c0 36.266667 44.8 55.466667 70.4 32l196.266667-177.066667c17.066667-19.2 17.066667-49.066667 0-66.133333z"></path>
                    </svg>
                  </span>
                  <span v-else></span>
                </div>

                <div class="gridname">
                  <div :title="grid.sizeStr + ' ' + grid.name" @click="handleOpenFile($event, grid)">
                    {{ grid.name }}
                  </div>
                </div>

                <div class="gridinfo">{{ grid.timeStr }}</div>

                <div :class="'rangselect ' + (rangSelectFiles[grid.file_id] ? (rangSelectStart == grid.file_id ? 'rangstart' : rangSelectEnd == grid.file_id ? 'rangend' : 'rang') : '')">
                  <a-button shape="circle" type="text" tabindex="-1" class="select" :title="(index * listGridColumn + gindex).toString()" @click.prevent.stop="handleSelect(grid.file_id, $event, true)">
                    <i :class="panfileStore.ListSelected.has(grid.file_id) ? (grid.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : grid.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
                  </a-button>
                  <a-button v-if="grid.description" type="text" tabindex="-1" class="label" title="标记">
                    <i class="iconfont iconwbiaoqian" :class="grid.description" />
                  </a-button>
                </div>
              </div>
              <div
                v-else
                :class="'griditem ' + listGridMode + ' ' + (panfileStore.ListSelected.has(grid.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == grid.file_id ? ' focus' : '')"
                draggable="true"
                @click="handleSelect(grid.file_id, $event)"
                @mouseover="() => onSelectRang(grid.file_id)"
                @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:grid.file_id}} )"
                @dragstart="(ev) => onRowItemDragStart(ev, grid.file_id)"
                @dragend="onRowItemDragEnd">
                <div class="gridicon">
                  <i :class="'iconfont ' + grid.icon" aria-hidden="true" role="img"></i>
                </div>
                <div class="gridicon"><img v-if="grid.thumbnail" :src="grid.thumbnail" @error="(e) => {(e.currentTarget! as any).style.display = 'none'}" /></div>

                <div class="gridicon">
                  <span v-if="grid.category.startsWith('video')" class="playicon" @click="handleOpenFile($event, grid)">
                    <svg viewBox="0 0 1024 1024">
                      <path d="M689.066667 480l-196.266667-177.066667c-27.733333-25.6-70.4-6.4-70.4 32v356.266667c0 36.266667 44.8 55.466667 70.4 32l196.266667-177.066667c17.066667-19.2 17.066667-49.066667 0-66.133333z"></path>
                    </svg>
                  </span>
                  <span v-else></span>
                </div>

                <div class="gridname">
                  <div :title="grid.sizeStr + ' ' + grid.name" @click="handleOpenFile($event, grid)">
                    {{ grid.name }}
                  </div>
                </div>

                <div class="gridinfo">{{ grid.timeStr }}</div>

                <div :class="'rangselect ' + (rangSelectFiles[grid.file_id] ? (rangSelectStart == grid.file_id ? 'rangstart' : rangSelectEnd == grid.file_id ? 'rangend' : 'rang') : '')">
                  <a-button shape="circle" type="text" tabindex="-1" class="select" :title="(index * listGridColumn + gindex).toString()" @click.prevent.stop="handleSelect(grid.file_id, $event, true)">
                    <i :class="panfileStore.ListSelected.has(grid.file_id) ? (grid.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : grid.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
                  </a-button>
                  <a-button v-if="grid.description" type="text" tabindex="-1" class="label" title="标记">
                    <i class="iconfont iconwbiaoqian" :class="grid.description" />
                  </a-button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </a-list>

    <a-list
      v-else
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtual-list-props="{
        height: winStore.GetListHeightNumber,
        fixedSize: true,
        estimatedSize: 260,
        threshold: 1,
        itemKey: 'file_id',
        buffer: 5
      }"
      style="width: 100%"
      :data="panfileStore.ListDataGrid"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="空文件夹" /></template>
      <template #item="{ item, index }">
        <div :key="'g-' + item.file_id" class="listitemdiv">
          <div class="gridrow" :style="{ gridTemplateColumns: 'repeat(' + listGridColumn + ', 200px)' }">
            <template v-for="(grid, gindex) in item.files" :key="grid.file_id">
              <div
                v-if="grid.isDir"
                :class="'griditem ' + listGridMode + ' ' + (panfileStore.ListSelected.has(grid.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == grid.file_id ? ' focus' : '')"
                draggable="true"
                @click="handleSelect(grid.file_id, $event)"
                @mouseover="() => onSelectRang(grid.file_id)"
                @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:grid.file_id}} )"
                @dragstart="(ev) => onRowItemDragStart(ev, grid.file_id)"
                @dragend="onRowItemDragEnd"
                @drop="onRowItemDrop($event, grid.file_id)"
                @dragover="onRowItemDragOver"
                @dragenter="onRowItemDragEnter"
                @dragleave="onRowItemDragLeave">
                <div class="gridicon">
                  <i :class="'iconfont ' + grid.icon" aria-hidden="true" role="img"></i>
                </div>
                <div class="gridicon"><img v-if="grid.thumbnail" :src="grid.thumbnail" @error="(e) => {(e.currentTarget! as any).style.display = 'none'}" /></div>

                <div class="gridicon">
                  <span v-if="grid.category.startsWith('video')" class="playicon" @click="handleOpenFile($event, grid)">
                    <svg viewBox="0 0 1024 1024">
                      <path d="M689.066667 480l-196.266667-177.066667c-27.733333-25.6-70.4-6.4-70.4 32v356.266667c0 36.266667 44.8 55.466667 70.4 32l196.266667-177.066667c17.066667-19.2 17.066667-49.066667 0-66.133333z"></path>
                    </svg>
                  </span>
                  <span v-else></span>
                </div>

                <div class="gridname">
                  <div :title="grid.sizeStr + ' ' + grid.name" @click="handleOpenFile($event, grid)">
                    {{ grid.name }}
                  </div>
                </div>

                <div class="gridinfo">{{ grid.timeStr }}</div>

                <div :class="'rangselect ' + (rangSelectFiles[grid.file_id] ? (rangSelectStart == grid.file_id ? 'rangstart' : rangSelectEnd == grid.file_id ? 'rangend' : 'rang') : '')">
                  <a-button shape="circle" type="text" tabindex="-1" class="select" :title="(index * listGridColumn + gindex).toString()" @click.prevent.stop="handleSelect(grid.file_id, $event, true)">
                    <i :class="panfileStore.ListSelected.has(grid.file_id) ? (grid.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : grid.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
                  </a-button>

                  <a-button v-if="grid.description" type="text" tabindex="-1" class="label" title="标记">
                    <i class="iconfont iconwbiaoqian" :class="grid.description" />
                  </a-button>
                </div>
              </div>
              <div
                v-else
                :class="'griditem ' + listGridMode + ' ' + (panfileStore.ListSelected.has(grid.file_id) ? ' selected' : '') + (panfileStore.ListFocusKey == grid.file_id ? ' focus' : '')"
                draggable="true"
                @click="handleSelect(grid.file_id, $event)"
                @mouseover="() => onSelectRang(grid.file_id)"
                @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:grid.file_id}} )"
                @dragstart="(ev) => onRowItemDragStart(ev, grid.file_id)"
                @dragend="onRowItemDragEnd">
                <div class="gridicon">
                  <i :class="'iconfont ' + grid.icon" aria-hidden="true" role="img"></i>
                </div>
                <div class="gridicon"><img v-if="grid.thumbnail" :src="grid.thumbnail" @error="(e) => {(e.currentTarget! as any).style.display = 'none'}" /></div>

                <div class="gridicon">
                  <span v-if="grid.category.startsWith('video')" class="playicon" @click="handleOpenFile($event, grid)">
                    <svg viewBox="0 0 1024 1024">
                      <path d="M689.066667 480l-196.266667-177.066667c-27.733333-25.6-70.4-6.4-70.4 32v356.266667c0 36.266667 44.8 55.466667 70.4 32l196.266667-177.066667c17.066667-19.2 17.066667-49.066667 0-66.133333z"></path>
                    </svg>
                  </span>
                  <span v-else></span>
                </div>

                <div class="gridname">
                  <div :title="grid.sizeStr + ' ' + grid.name" @click="handleOpenFile($event, grid)">
                    {{ grid.name }}
                  </div>
                </div>

                <div class="gridinfo">{{ grid.timeStr }}</div>

                <div :class="'rangselect ' + (rangSelectFiles[grid.file_id] ? (rangSelectStart == grid.file_id ? 'rangstart' : rangSelectEnd == grid.file_id ? 'rangend' : 'rang') : '')">
                  <a-button shape="circle" type="text" tabindex="-1" class="select" :title="(index * listGridColumn + gindex).toString()" @click.prevent.stop="handleSelect(grid.file_id, $event, true)">
                    <i :class="panfileStore.ListSelected.has(grid.file_id) ? (grid.starred ? 'iconfont iconcrown3' : 'iconfont iconrsuccess') : grid.starred ? 'iconfont iconcrown' : 'iconfont iconpic2'" />
                  </a-button>
                  <a-button v-if="grid.description" type="text" tabindex="-1" class="label" title="标记">
                    <i class="iconfont iconwbiaoqian" :class="grid.description" />
                  </a-button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </a-list>

    <FileRightMenu :dirtype="panfileStore.SelectDirType" :isvideo="menuShowVideo" :isselected="panfileStore.IsListSelected" :isselectedmulti="panfileStore.IsListSelectedMulti" :isallfavored="panfileStore.IsListSelectedFavAll" />
    <TrashRightMenu :dirtype="panfileStore.SelectDirType" />
  </div>

  <div id="PanRightShowUpload" :style="{ display: showDragUpload ? '' : 'none' }" @drop="onPanDrop" @dragover="onPanDragOver" @dragleave="onPanDragLeave" @dragend="onPanDragEnd">
    <div class="ShowUpload">
      <i class="iconfont iconyouxian" style="font-size: 64px" />
      <div class="ShowUploadTitle">
        <span class="link">上传到：{{ panfileStore.DirName }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.arco-dropdown-option-icon {
  margin-right: 2px !important;
  width: 20px;
  flex-grow: 0;
  flex-shrink: 0;
  align-items: center;
}
.arco-dropdown-option-icon .iconfont {
  font-size: 18px;
}

.arco-dropdown-option-content > div {
  line-height: 26px;
  height: 26px;
  display: flex;
}
.arco-dropdown-option {
  padding: 0 4px !important;
}
.gengduo {
  width: 24px;
  height: 24px;
  min-height: 24px;
  display: inline-block;
}
.arco-btn-text.arco-btn-disabled.gengduo {
  cursor: default !important;
}
.gengduo:hover {
  color: rgb(var(--primary-6));
  background: rgba(var(--primary-6), 0.1);
}

.arco-btn.gengduo {
  width: 24px;
  height: 24px;
  min-height: 24px;
  margin: 0;
  padding: 0;
  background: transparent;
  border-color: transparent;
  border-radius: 4px;
}

.arco-btn.gengduo .iconfont {
  font-size: 20px;
  line-height: 20px;
}

.arco-btn.label {
  width: 24px;
  height: 24px;
  min-height: 24px;
  margin: 0;
  padding: 0;
  background: transparent;
  border-color: transparent;
  border-radius: 4px;
  cursor: default;
}
.arco-btn.label .iconfont {
  font-size: 20px;
  line-height: 20px;
}

.popimg {
  padding: 0 !important;
}

.popimg .arco-popover-content {
  margin-top: 0 !important;
}

.rightmenu .arco-dropdown-option {
  line-height: 26px !important;
}
.rightmenu.arco-dropdown-list-wrapper,
.rightmenu .arco-dropdown-list-wrapper {
  max-height: 300px !important;
  overflow-y: auto;
}

.draging .fileitem.selected,
.draging .griditem.selected {
  opacity: 0.6;
}
.draging .fileitem *,
.draging .griditem *,
.ranging .fileitem *,
.ranging .griditem * {
  pointer-events: none;
}

.pandraging {
  pointer-events: none;
}

#PanRightShowUpload {
  position: fixed;
  z-index: 2000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  background-image: linear-gradient(to top, rgba(120, 115, 245, 0.3) 0%, rgba(120, 115, 245, 0.06) 22%, rgba(236, 119, 171, 0.01) 80%);
}
#PanRightShowUpload .ShowUpload {
  max-width: 80%;
  margin: 16px auto 48px auto;
  overflow: hidden;
  text-align: center;
  pointer-events: none;
}

#PanRightShowUpload .ShowUpload .ShowUploadTitle {
  margin: 0 auto;
  padding: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}
#PanRightShowUpload .ShowUpload .link {
  overflow: hidden;
  color: #1976d2;
  font-size: 14px;
  white-space: nowrap !important;
  text-overflow: ellipsis;
  word-break: keep-all !important;
}
#PanRightShowUpload .ShowUpload .iconfont {
  color: rgb(120, 115, 245);
}
.fileorder .arco-btn-size-small {
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  min-width: 102px;
}
.fileorder .iconfont {
  font-size: 18px;
  line-height: 24px;
}

#panfilelist .fileitem,
#panfilelist .griditem {
  -webkit-user-drag: element;
}

.toppantip {
  color: var(--color-text-3);
  font-size: 12px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 26px;
  padding: 4px 8px 0 0;
  line-height: 19px;
}

.arco-skeleton-animation .arco-skeleton-line-row {
  opacity: 0.35;
}
</style>
