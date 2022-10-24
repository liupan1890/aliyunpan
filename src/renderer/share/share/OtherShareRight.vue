<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore, useKeyboardStore, KeyboardState, useOtherShareStore, useWinStore, IOtherShareLinkModel } from '../../store'
import ShareDAL from './sharedal'
import { onShowRightMenu, onHideRightMenuScroll, TestCtrl, TestKey, TestKeyboardScroll, TestKeyboardSelect } from '../../utils/keyboardhelper'
import { copyToClipboard, getFromClipboard, openExternal } from '../../utils/electronhelper'
import message from '../../utils/message'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'
import { modalShowShareLink } from '../../utils/modal'
import { ArrayKeyList } from '../../utils/utils'
import { GetShareUrlFormate } from '../../utils/shareurl'

const daoruModel = ref(false)
const daoruModelLoading = ref(false)
const daoruModelText = ref('')

const viewlist = ref()
const inputsearch = ref()

const appStore = useAppStore()
const winStore = useWinStore()
const othershareStore = useOtherShareStore()

const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'share' || appStore.GetAppTabMenu != 'OtherShareRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => othershareStore.mSelectAll())) return
  if (TestCtrl('b', state.KeyDownEvent, handleBrowserLink)) return
  if (TestCtrl('c', state.KeyDownEvent, handleCopySelectedLink)) return
  if (TestCtrl('Delete', state.KeyDownEvent, () => handleDeleteSelectedLink('selected'))) return
  if (TestCtrl('f', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f3', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey(' ', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestCtrl('n', state.KeyDownEvent, handleDaoRuLink)) return 
  if (TestCtrl('u', state.KeyDownEvent, handleRefreshStats)) return 

  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return

  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, othershareStore, handleOpenLink)) return 
  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, othershareStore)) return 
})

const handleRefresh = () => ShareDAL.aReloadOtherShare()
const handleSelectAll = () => othershareStore.mSelectAll()
const handleOrder = (order: string) => othershareStore.mOrderListData(order)
const handleSelect = (share_id: string, event: any, isCtrl: boolean = false) => {
  onHideRightMenuScroll()
  othershareStore.mMouseSelect(share_id, event.ctrlKey || isCtrl, event.shiftKey)
}

const handleOpenLink = (share: any) => {
  if (share && share.share_id) {
    // donothing
  } else {
    share = othershareStore.GetSelectedFirst()
  }
  if (!share.share_id) {
    message.error('没有选中分享链接！')
  } else {
    modalShowShareLink(share.share_id, share.share_pwd, '', true, [])
  }
}
const handleCopySelectedLink = () => {
  const list = othershareStore.GetSelected()
  let link = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    link += GetShareUrlFormate(item.share_name, 'https://www.aliyundrive.com/s/' + item.share_id, item.share_pwd) + '\n'
  }
  if (list.length == 0) {
    message.error('没有选中分享链接！')
  } else {
    copyToClipboard(link)
    message.success('分享链接已复制到剪切板(' + list.length.toString() + ')')
  }
}
const handleBrowserLink = () => {
  const first = othershareStore.GetSelectedFirst()
  if (!first) return
  if (first.share_id) openExternal('https://www.aliyundrive.com/s/' + first.share_id)
  if (first.share_pwd) {
    copyToClipboard(first.share_pwd)
    message.success('提取码已复制到剪切板')
  }
}

const handleDeleteSelectedLink = (delby: string) => {
  let list: IOtherShareLinkModel[] = []
  if (delby == 'selected') {
    list = othershareStore.GetSelected()
  }
  if (list.length == 0) {
    message.error('没有选择要删除的分享链接！')
    return
  }

  const selectKeys = ArrayKeyList<string>('share_id', list)
  ShareDAL.DeleteOtherShare(selectKeys).then(() => {
    message.success('成功删除' + selectKeys.length + '条')
  })
}
const handleDaoRuLink = () => {
  daoruModel.value = true
  const txt = getFromClipboard()
  if (txt.indexOf('.aliyundrive.com/s/') > 0) {
    daoruModelText.value = txt
    setTimeout(() => {
      document.getElementById('OSRDaoRuLink')?.focus()
    }, 200)
  }
}

const handleSaveDaoRuLink = () => {
  const text = daoruModelText.value
  if (!text) {
    message.error('请先粘贴要导入的分享链接！')
    return
  }
  daoruModelLoading.value = true
  ShareDAL.SaveOtherShareText(text).then((success: boolean) => {
    daoruModelLoading.value = false
    if (success) {
      daoruModelText.value = ''
      daoruModel.value = false
    }
  })
}
const handleRefreshStats = () => {
  ShareDAL.SaveOtherShareRefresh()
}

const handleSearchInput = (value: string) => {
  othershareStore.mSearchListData(value)
  viewlist.value.scrollIntoView(0)
}
const handleSearchEnter = (event: any) => {
  event.target.blur()
  viewlist.value.scrollIntoView(0)
}
const handleRightClick = (e: { event: MouseEvent; node: any }) => {
  const key = e.node.key
  
  if (!othershareStore.ListSelected.has(key)) othershareStore.mMouseSelect(key, false, false)
  onShowRightMenu('rightothersharemenu', e.event.clientX, e.event.clientY)
}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px"></div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" :loading="othershareStore.ListLoading" title="F5" @click="handleRefresh">
        <template #icon>
          <i class="iconfont iconreload-1-icon" />
        </template>
        刷新</a-button
      >
    </div>
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+N" @click="handleDaoRuLink"><i class="iconfont iconlink2" />导入</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+U" @click="handleRefreshStats"><i class="iconfont iconyibu" />更新</a-button>
    </div>
    <div v-show="othershareStore.IsListSelected" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+O" @click="handleOpenLink"><i class="iconfont iconchakan" />查看</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+C" @click="handleCopySelectedLink"><i class="iconfont iconcopy" />复制链接</a-button>
      <a-button type="text" size="small" tabindex="-1" title="Ctrl+B" @click="handleBrowserLink"><i class="iconfont iconchrome" />浏览器</a-button>
      <a-button type="text" size="small" tabindex="-1" class="danger" title="Ctrl+Delete" @click="handleDeleteSelectedLink('selected')"><i class="iconfont icondelete" />删除</a-button>
    </div>

    <div style="flex-grow: 1"></div>
    <div class="toppanbtn">
      <a-input-search ref="inputsearch" tabindex="-1" size="small" title="Ctrl+F / F3 / Space" placeholder="快速筛选" :model-value="othershareStore.ListSearchKey" @input="(val:any)=>handleSearchInput(val as string)" @press-enter="handleSearchEnter" @keydown.esc=";($event.target as any).blur()" />
    </div>
    <div></div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" title="Ctrl+A" @click="handleSelectAll">
          <i :class="othershareStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ othershareStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>
    <div class="cell tiquma">提取码</div>
    <div :class="'cell sharestate order ' + (othershareStore.ListOrderKey == 'state' ? 'active' : '')" @click="handleOrder('state')">
      状态
      <i class="iconfont iconxia" />
    </div>
    <div :class="'cell sharetime order ' + (othershareStore.ListOrderKey == 'time' ? 'active' : '')" @click="handleOrder('time')">
      导入时间
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
      :data="othershareStore.ListDataShow"
      tabindex="-1"
      @scroll="onHideRightMenuScroll">
      <template #empty><a-empty description="没导入过任何分享链接" /></template>
      <template #item="{ item, index }">
        <div :key="item.share_id" class="listitemdiv">
          <div
            :class="'fileitem' + (othershareStore.ListSelected.has(item.share_id) ? ' selected' : '') + (othershareStore.ListFocusKey == item.share_id ? ' focus' : '')"
            @click="handleSelect(item.share_id, $event)"
            @contextmenu="(event:MouseEvent)=>handleRightClick({event,node:{key:item.share_id}} )">
            <div style="margin: 2px">
              <a-button shape="circle" type="text" tabindex="-1" class="select" :title="index" @click.prevent.stop="handleSelect(item.share_id, $event, true)">
                <i :class="othershareStore.ListSelected.has(item.share_id) ? 'iconfont iconrsuccess' : 'iconfont iconpic2'" />
              </a-button>
            </div>
            <div class="fileicon">
              <i class="iconfont iconlink2" aria-hidden="true"></i>
            </div>
            <div class="filename">
              <div :title="'https://www.aliyundrive.com/s/' + item.share_id" @click="handleOpenLink(item)">
                {{ item.share_name }}
              </div>
            </div>
            <div class="cell tiquma">{{ item.share_pwd }}</div>
            <div v-if="item.expired" class="cell sharestate expired">过期失效</div>
            <div v-else-if="item.share_msg == '已失效'" class="cell sharestate expired">已失效</div>
            <div v-else class="cell sharestate active">{{ item.share_msg }}</div>

            <div class="cell sharetime">{{ item.saved_at.replace(' ', '\n') }}</div>
          </div>
        </div>
      </template>
    </a-list>

    <a-dropdown id="rightothersharemenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
      <template #content>
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
          <template #default>删除记录</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>

  <a-modal v-model:visible="daoruModel" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title> 批量导入分享链接记录 </template>
    <div style="width: 500px">
      <div style="margin-bottom: 32px">
        <div class="arco-textarea-wrapper arco-textarea-scroll">
          <textarea v-model="daoruModelText" class="arco-textarea daoruinput" placeholder="请粘贴，每行一条分享链接，例如：https://www.aliyundrive.com/s/9inQ0eeZ8w8 提取码: CNp7"></textarea>
        </div>
        <div>
          <span class="oporg">注：仅导入记录，不会导入分享的文件</span>
        </div>
      </div>
      <div class="flex" style="justify-content: center; align-items: center; margin-bottom: 0px">
        <a-button id="OSRDaoRuLink" type="primary" size="small" tabindex="-1" :loading="daoruModelLoading" @click="handleSaveDaoRuLink">批量导入</a-button>
      </div>
    </div>
  </a-modal>
</template>

<style></style>
