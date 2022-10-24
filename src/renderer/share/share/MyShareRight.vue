<script setup lang="ts">
import { ref } from 'vue'
import { IAliShareItem } from '../../aliapi/alimodels'
import { useAppStore, useKeyboardStore, KeyboardState, useMyShareStore, useUserStore, useWinStore } from '../../store'
import { humanCount } from '../../utils/format'
import ShareDAL from './sharedal'
import { onShowRightMenu, onHideRightMenuScroll, TestCtrl, TestKey, TestKeyboardScroll, TestKeyboardSelect } from '../../utils/keyboardhelper'
import { copyToClipboard, openExternal } from '../../utils/electronhelper'
import message from '../../utils/message'
import AliShare from '../../aliapi/share'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'
import { modalEditShareLink, modalShowShareLink } from '../../utils/modal'
import { ArrayKeyList } from '../../utils/utils'
import { GetShareUrlFormate } from '../../utils/shareurl'

const viewlist = ref()
const inputsearch = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const myshareStore = useMyShareStore()

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'share' || appStore.GetAppTabMenu != 'MyShareRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => myshareStore.mSelectAll())) return
  if (TestCtrl('b', state.KeyDownEvent, handleBrowserLink)) return
  if (TestCtrl('c', state.KeyDownEvent, handleCopySelectedLink)) return
  if (TestCtrl('Delete', state.KeyDownEvent, () => handleDeleteSelectedLink('selected'))) return
  if (TestCtrl('e', state.KeyDownEvent, handleEdit)) return
  if (TestKey('f2', state.KeyDownEvent, handleEdit)) return
  if (TestCtrl('f', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f3', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey(' ', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return

  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, myshareStore, undefined)) return 
  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, myshareStore)) return 
})

const handleRefresh = () => ShareDAL.aReloadMyShare(useUserStore().user_id, true)
const handleSelectAll = () => myshareStore.mSelectAll()
const handleOrder = (order: string) => myshareStore.mOrderListData(order)
const handleSelect = (share_id: string, event: any, isCtrl: boolean = false) => {
  onHideRightMenuScroll()
  myshareStore.mMouseSelect(share_id, event.ctrlKey || isCtrl, event.shiftKey)
}

const handleClickName = (share: IAliShareItem) => {
  handleEdit(share)
}
const handleEdit = (share: any) => {
  let list: IAliShareItem[]
  if (share && share.share_id) {
    list = [share]
  } else {
    list = myshareStore.GetSelected()
  }
  if (list && list.length > 0) modalEditShareLink(list)
  else {
    message.error('没有选中任何分享链接！')
  }
}
const handleOpenLink = () => {
  const share = myshareStore.GetSelectedFirst()
  if (!share) {
    message.error('没有选中分享链接！')
  } else {
    modalShowShareLink(share.share_id, share.share_pwd, '', false, [])
  }
}
const handleCopySelectedLink = () => {
  const list = myshareStore.GetSelected()
  let link = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    link += GetShareUrlFormate(item.share_name, item.share_url, item.share_pwd) + '\n'
  }
  if (list.length == 0) {
    message.error('没有选中分享链接！')
  } else {
    copyToClipboard(link)
    message.success('分享链接已复制到剪切板(' + list.length.toString() + ')')
  }
}
const handleBrowserLink = () => {
  const first = myshareStore.GetSelectedFirst()
  if (!first) return
  if (first.share_url) openExternal(first.share_url)
  if (first.share_pwd) {
    copyToClipboard(first.share_pwd)
    message.success('提取码已复制到剪切板')
  }
}
const handleDeleteSelectedLink = (delby: any) => {
  const name = delby == 'selected' ? '取消选中的分享' : delby == 'expired' ? '清理全部过期已失效' : '清理全部文件已删除'
  let list: IAliShareItem[]
  if (delby == 'selected') {
    list = myshareStore.GetSelected()
  } else {
    list = []
    const allList = myshareStore.ListDataRaw
    let item: IAliShareItem
    for (let i = 0, maxi = allList.length; i < maxi; i++) {
      item = allList[i]
      if (delby == 'expired') {
        if (item.expired && item.first_file) list.push(item) 
      } else {
        if (!item.first_file) list.push(item) 
      }
    }
  }

  if (list.length == 0) {
    message.error('没有需要清理的分享链接！')
    return
  }

  const selectKeys = ArrayKeyList<string>('share_id', list)
  AliShare.ApiCancelShareBatch(useUserStore().user_id, selectKeys).then((success: string[]) => {
    useMyShareStore().mDeleteFiles(success)
    message.success(name + '成功！')
  })
}

const handleSearchInput = (value: string) => {
  myshareStore.mSearchListData(value)
  viewlist.value.scrollIntoView(0)
}
const handleSearchEnter = (event: any) => {
  event.target.blur()
  viewlist.value.scrollIntoView(0)
}
const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key
  
  if (!myshareStore.ListSelected.has(key)) myshareStore.mMouseSelect(key, false, false)
  onShowRightMenu('rightmysharemenu', e.event.clientX, e.event.clientY)
}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="flex flexauto"></div>
    <div class="flex flexnoauto cellcount" title="2天内过期">
      <a-badge color="#637dff" :text="'临期 ' + myshareStore.ListStats.expir2day" />
    </div>
    <div class="flex flexnoauto cellcount" title="总过期">
      <a-badge color="#637dff" :text="'过期 ' + myshareStore.ListStats.expired" />
    </div>
    <div class="flex flexnoauto cellcount" title="总违规">
      <a-badge color="#637dff" :text="'违规 ' + myshareStore.ListStats.forbidden" />
    </div>

    <div class="flex flexnoauto cellcount" title="总浏览">
      <a-badge color="#637dff" :text="'浏览 ' + myshareStore.ListStats.preview" />
    </div>
    <div class="flex flexnoauto cellcount" title="总下载">
      <a-badge color="#637dff" :text="'下载 ' + myshareStore.ListStats.download" />
    </div>
    <div class="flex flexnoauto cellcount" title="总转存">
      <a-badge color="#637dff" :text="'转存 ' + myshareStore.ListStats.save" />
    </div>
    <div class="flex flexnoauto cellcount" title="最大的浏览数">
      <a-badge color="#637dff" :text="'Max ' + myshareStore.ListStats.previewMax" />
    </div>
  </div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" :loading="myshareStore.ListLoading" title="F5" @click="handleRefresh"
        ><template #icon> <i class="iconfont iconreload-1-icon" /> </template
      ></a-button>
    </div>
    <div v-show="myshareStore.IsListSelected" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" title="F2 / Ctrl+E" @click="handleEdit"><i class="iconfont iconedit-square" />修改</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+O" @click="handleOpenLink"><i class="iconfont iconchakan" />查看</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+C" @click="handleCopySelectedLink"><i class="iconfont iconcopy" />复制链接</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+B" @click="handleBrowserLink"><i class="iconfont iconchrome" />浏览器</a-button>
      <a-button type="text" size="small" tabindex="-1" class="danger" title="Ctrl+Delete" @click="handleDeleteSelectedLink('selected')"><i class="iconfont icondelete" />取消分享</a-button>
    </div>
    <div v-show="!myshareStore.IsListSelected" class="toppanbtn">
      <a-dropdown trigger="hover" position="bl" @select="handleDeleteSelectedLink">
        <a-button type="text" size="small" tabindex="-1"><i class="iconfont iconrest" />清理全部 <i class="iconfont icondown" /></a-button>

        <template #content>
          <a-doption :value="'expired'" class="danger">删除全部 过期已失效</a-doption>
          <a-doption :value="'deleted'" class="danger">删除全部 文件已删除</a-doption>
        </template>
      </a-dropdown>
    </div>
    <div style="flex-grow: 1"></div>
    <div class="toppanbtn">
      <a-input-search ref="inputsearch" tabindex="-1" size="small" title="Ctrl+F / F3 / Space" placeholder="快速筛选" :model-value="myshareStore.ListSearchKey" @input="(val:any)=>handleSearchInput(val as string)" @press-enter="handleSearchEnter" @keydown.esc=";($event.target as any).blur()" />
    </div>
    <div></div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" title="Ctrl+A" @click="handleSelectAll">
          <i :class="myshareStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo" style="min-width: 266px">{{ myshareStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>
    <div class="cell tiquma">提取码</div>
    <div :class="'cell sharestate order ' + (myshareStore.ListOrderKey == 'state' ? 'active' : '')" @click="handleOrder('state')">
      状态
      <i class="iconfont iconxia" />
    </div>
    <div :class="'cell count order ' + (myshareStore.ListOrderKey == 'preview' ? 'active' : '')" @click="handleOrder('preview')">
      浏览
      <i class="iconfont iconxia" />
    </div>
    <div :class="'cell count order ' + (myshareStore.ListOrderKey == 'download' ? 'active' : '')" @click="handleOrder('download')">
      下载
      <i class="iconfont iconxia" />
    </div>
    <div :class="'cell count order ' + (myshareStore.ListOrderKey == 'save' ? 'active' : '')" @click="handleOrder('save')">
      转存
      <i class="iconfont iconxia" />
    </div>
    <div :class="'cell sharetime order ' + (myshareStore.ListOrderKey == 'time' ? 'active' : '')" @click="handleOrder('time')">
      创建时间
      <i class="iconfont iconxia" />
    </div>
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" @keydown.space.prevent="() => true">
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
        itemKey: 'share_id'
      }"
      style="width: 100%"
      :data="myshareStore.ListDataShow"
      :loading="myshareStore.ListLoading"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="没创建过任何分享链接" /></template>

      <template #item="{ item, index }">
        <div :key="item.share_id" class="listitemdiv">
          <div :class="'fileitem' + (myshareStore.ListSelected.has(item.share_id) ? ' selected' : '') + (myshareStore.ListFocusKey == item.share_id ? ' focus' : '')" @click="handleSelect(item.share_id, $event)" @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.share_id}} )">
            <div style="margin: 2px">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.share_id, $event, true)">
                <i :class="myshareStore.ListSelected.has(item.share_id) ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i :class="'iconfont ' + item.icon" aria-hidden="true"></i>
            </div>
            <div class="filename">
              <div :title="'https://www.aliyundrive.com/s/' + item.share_id" @click="handleClickName(item)">
                {{ item.share_name }}
              </div>
            </div>
            <div class="cell tiquma">{{ item.share_pwd }}</div>
            <div v-if="item.status == 'forbidden'" class="cell sharestate forbidden">分享违规</div>
            <div v-else-if="item.expired" class="cell sharestate expired">过期失效</div>
            <div v-else-if="!item.first_file" class="cell sharestate deleted">文件已删</div>
            <div v-else class="cell sharestate active">{{ item.share_msg }}</div>
            <div class="cell count">{{ humanCount(item.preview_count) }}</div>
            <div class="cell count">{{ humanCount(item.download_count) }}</div>
            <div class="cell count">{{ humanCount(item.save_count) }}</div>

            <div class="cell sharetime">{{ item.created_at.replace(' ', '\n') }}</div>
          </div>
        </div>
      </template>
    </a-list>
    <a-dropdown id="rightmysharemenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
      <template #content>
        <a-doption @click="handleEdit">
          <template #icon> <i class="iconfont iconedit-square" /> </template>
          <template #default>修改</template>
        </a-doption>
        <a-doption @click="handleOpenLink">
          <template #icon> <i class="iconfont iconchakan" /> </template>
          <template #default>查看</template>
        </a-doption>

        <a-doption @click="handleCopySelectedLink">
          <template #icon> <i class="iconfont iconcopy" /> </template>
          <template #default>复制链接</template>
        </a-doption>
        <a-doption @click="handleBrowserLink">
          <template #icon> <i class="iconfont iconchrome" /> </template>
          <template #default>浏览器</template>
        </a-doption>

        <a-doption class="danger" @click="handleDeleteSelectedLink('selected')">
          <template #icon> <i class="iconfont icondelete" /> </template>
          <template #default>取消分享</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<style>
.cellcount {
  align-items: 'center';
  margin-right: 16px;
}
.cellcount .arco-badge .arco-badge-status-text {
  margin-left: 4px;
  color: var(--color-text-3);
  line-height: 26px;
}
body[arco-theme='dark'] .toppanarea .cell {
  color: rgba(211, 216, 241, 0.45);
}

.cell {
  color: var(--color-text-3);
  overflow: hidden;
  text-align: center;
  flex-grow: 0;
  flex-shrink: 0;
  display: inline-block;
  line-height: 18px;
  min-height: 18px;
  padding: 0 4px;
  justify-content: center;
}

.cell.tiquma {
  width: 60px;
  font-size: 12px;
}
.cell.count {
  width: 60px;
  font-size: 12px;
}
.cell.sharetime {
  width: 80px;
  font-size: 12px;
  line-height: 14px;
  text-align: right;
  word-wrap: break-word;
  word-break: keep-all;
}
.cell.sharetime.active {
  color: rgb(217, 48, 37);
}
.cell.sharestate {
  width: 70px;
  font-size: 12px;
}
.cell.sharestate.active {
  color: rgb(var(--primary-6));
}
.cell.sharestate.forbidden {
  color: rgb(217, 48, 37);
}
.cell.sharestate.deleted {
  text-decoration: line-through;
}
.cell.p5 {
  width: 5px;
}
.cell.pr {
  width: 12px;
}

.toppanarea .cell.order {
  cursor: pointer;
}
.toppanarea .cell.order:hover {
  color: rgb(var(--primary-6));
}
</style>
