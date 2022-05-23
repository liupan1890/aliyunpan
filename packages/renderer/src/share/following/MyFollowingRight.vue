<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore, useMyFollowingStore, useKeyboardStore, KeyboardState, useUserStore, useWinStore } from '@/store'
import FollowingDAL from './followingdal'
import { copyToClipboard, getFromClipboard, openExternal } from '@/utils/electronhelper'
import { RefreshScroll, TestCtrl, TestKey, TestKeyboardSelect, TestKeyboardScroll, RefreshScrollTo, onHideRightMenuScroll } from '@/utils/keyboardhelper'
import message from '@/utils/message'
import { ArrayKeyList } from '@/utils/utils'
import AliFollowing from '@/aliapi/following'
import AliShare from '@/aliapi/share'

import { Tooltip as AntdTooltip } from 'ant-design-vue'
import 'ant-design-vue/es/tooltip/style/css'
import { modalShowShareLink } from '@/utils/modal'

const daoruModel = ref(false)
const daoruModelLoading = ref(false)
const daoruModelText = ref('')

const viewlist = ref()
const inputsearch = ref()
const myfollowingStore = useMyFollowingStore()

const winStore = useWinStore()
const appStore = useAppStore()
const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'share' || appStore.GetAppTabMenu != 'MyFollowingRight') return

  if (TestCtrl('a', state.KeyDownEvent, () => myfollowingStore.mSelectAll())) return
  if (TestCtrl('b', state.KeyDownEvent, handleBrowserLink)) return
  if (TestCtrl('c', state.KeyDownEvent, handleCopySelectedLink)) return
  if (TestCtrl('Delete', state.KeyDownEvent, handleDeleteSelectedLink)) return
  if (TestCtrl('n', state.KeyDownEvent, handleDaoRuLink)) return
  if (TestCtrl('f', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f3', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey(' ', state.KeyDownEvent, () => inputsearch.value.focus())) return 
  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return

  if (TestKeyboardScroll(state.KeyDownEvent, viewlist.value, myfollowingStore)) return 
  if (TestKeyboardSelect(state.KeyDownEvent, viewlist.value, myfollowingStore, handleOpenLink)) return 
})

const handleRefresh = () => FollowingDAL.aReloadMyFollowing(useUserStore().userID, true)
const handleSelectAll = () => myfollowingStore.mSelectAll()
const handleSelect = (followingid: string, event: MouseEvent) => {
  onHideRightMenuScroll()
  myfollowingStore.mMouseSelect(followingid, event.ctrlKey, event.shiftKey)
}

const handleOpenLink = (followingid: string) => {
  AliFollowing.ApiSetFollowingMarkRead(useUserStore().userID, followingid) 
  const url = 'https://www.aliyundrive.com/u/' + followingid + '/feed'
  openExternal(url)
}
const handleOpenShare = (share_id: string, share_pwd: string, file_id_list: string[]) => {
  AliShare.ApisSubscription(useUserStore().userID, share_id) 
  modalShowShareLink(share_id, share_pwd, '', true, file_id_list)
}
const handleCopySelectedLink = () => {
  const list = myfollowingStore.GetSelected()
  if (list.length == 0) return
  let copy = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    copy += 'https://www.aliyundrive.com/u/' + list[i].user_id + '/feed#' + list[i].nick_name
  }
  copyToClipboard(copy)
  message.success('选中的公众号订阅链接，已复制到剪切板')
}
const handleBrowserLink = () => {
  let first = myfollowingStore.GetSelectedFirst()
  if (!first) return
  let url = 'https://www.aliyundrive.com/u/' + first.user_id + '/feed#' + first.nick_name
  openExternal(url)
}
const handleDeleteSelectedLink = () => {
  const list = myfollowingStore.GetSelected()
  if (list.length == 0) return
  let idlist = ArrayKeyList('user_id', list)
  FollowingDAL.aSetFollowingBatch(useUserStore().userID, idlist, false)
}
const handleDaoRuLink = () => {
  daoruModel.value = true
  let txt = getFromClipboard()
  if (txt.indexOf('.aliyundrive.com/u/') > 0) {
    daoruModelText.value = txt
    setTimeout(() => {
      document.getElementById('MFRDaoRuLink')?.focus()
    }, 200)
  }
}

const handleSaveDaoRuLink = () => {
  let text = daoruModelText.value
  if (!text) return
  daoruModelLoading.value = true
  FollowingDAL.aSetFollowingText(useUserStore().userID, text, true).then((success: boolean) => {
    daoruModelLoading.value = false
    if (success) {
      daoruModelText.value = ''
      daoruModel.value = false
      FollowingDAL.aReloadMyFollowing(useUserStore().userID, true) 
    }
  })
}
const handleSearchInput = (value: string) => {
  myfollowingStore.mSearchListData(value)
  RefreshScrollTo(viewlist.value.$el, 0)
}
const handleSearchEnter = (event: any) => {
  event.target.blur()
  RefreshScroll(viewlist.value.$el)
}
</script>

<template>
  <div style="height: 47px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" :loading="myfollowingStore.ListLoading" @click="handleRefresh" title="F5"
        ><template #icon> <i class="iconfont iconreload-1-icon" /> </template>刷新</a-button
      >
    </div>
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="handleDaoRuLink" title="Ctrl+N"><i class="iconfont iconlink2" />导入订阅</a-button>
    </div>
    <div class="toppanbtn" v-show="myfollowingStore.IsListSelected">
      <a-button type="text" size="small" tabindex="-1" @click="handleCopySelectedLink" title="Ctrl+C"><i class="iconfont iconcopy" />复制链接</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleBrowserLink" title="Ctrl+B"><i class="iconfont iconchrome" />浏览器</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleDeleteSelectedLink" title="Ctrl+Delete"><i class="iconfont icondelete" />取消订阅</a-button>
    </div>
    <div style="flex-grow: 1"></div>
    <div class="toppanbtn">
      <a-input-search
        tabindex="-1"
        ref="inputsearch"
        size="small"
        title="Ctrl+F / F3 / Space"
        placeholder="快速筛选"
        :model-value="myfollowingStore.ListSearchKey"
        @input="(val :any)=>handleSearchInput(val as string)"
        @press-enter="handleSearchEnter"
        @keydown.esc="($event.target as any).blur()"
      />
    </div>
    <div></div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div style="margin: 0 3px">
      <AntdTooltip title="点击全选" placement="left">
        <a-button shape="circle" type="text" tabindex="-1" class="select all" @click="handleSelectAll" title="Ctrl+A">
          <i :class="myfollowingStore.IsListSelectedAll ? 'iconfont iconrsuccess' : 'iconfont iconrpic'" />
        </a-button>
      </AntdTooltip>
    </div>
    <div class="selectInfo">{{ myfollowingStore.ListDataSelectCountInfo }}</div>

    <div style="flex-grow: 1"></div>
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" @keydown.space.prevent="() => true">
    <a-list
      ref="viewlist"
      :bordered="false"
      :split="false"
      :max-height="winStore.GetListHeightNumber"
      :virtualListProps="{
        height: winStore.GetListHeightNumber,
        isStaticItemHeight: true,
        estimatedItemHeight: 106,
        threshold: 1,
        itemKey: 'user_id'
      }"
      style="width: 100%"
      :data="myfollowingStore.ListDataShow"
      :loading="myfollowingStore.ListLoading"
      tabindex="-1"
    >
      <template #item="{ item, index }">
        <div :key="item.user_id" class="listitemdiv" :data-id="item.user_id">
          <div :class="'following' + (myfollowingStore.ListSelected.has(item.user_id) ? ' selected' : '') + (myfollowingStore.ListFocusKey == item.user_id ? ' focus' : '')" @click="handleSelect(item.user_id, $event)">
            <a-avatar :size="80" shape="square">
              <img alt="avatar" :src="item.avatar" />
            </a-avatar>
            <div class="followingmessages">
              <div class="followingname" @click="handleOpenLink(item.user_id)">{{ item.nick_name }} <a-badge v-if="item.has_unread_message" status="processing"></a-badge></div>
              <div class="followingmessage" v-for="msg in item.latest_messages" @click="handleOpenShare(msg.content.share.share_id, msg.content.share.share_pwd, msg.content.file_id_list)">{{ msg.createdstr }} : {{ msg.display_action }}</div>
            </div>
          </div>
        </div>
      </template>
    </a-list>
  </div>
  <a-modal v-model:visible="daoruModel" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title> 批量导入订阅 </template>
    <div style="width: 500px">
      <div style="margin-bottom: 32px">
        <div class="arco-textarea-wrapper arco-textarea-scroll">
          <textarea v-model="daoruModelText" class="arco-textarea daoruinput" placeholder="请粘贴，每行一条订阅链接，例如：https://www.aliyundrive.com/u/ec11691148db442aa7aa374ca707543c"></textarea>
        </div>
      </div>
      <div class="flex" style="justify-content: center; align-items: center; margin-bottom: 0px">
        <a-button id="MFRDaoRuLink" type="primary" size="small" tabindex="-1" :loading="daoruModelLoading" @click="handleSaveDaoRuLink">批量订阅</a-button>
      </div>
    </div>
  </a-modal>
</template>

<style>
.arco-list-wrapper:focus {
  outline: none;
}
.following {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 106px;
  padding: 12px 12px;
  border-radius: 10px;
  border: transparent solid 1px;
  margin-right: 2px;
}
.following:hover {
  background-color: var(--listhoverbg);
}
.following.focus {
  border: rgba(var(--primary-6), 0.6) dotted 1px;
}

.following.selected {
  background-color: var(--listselectbg);
}

.following .arco-avatar {
  flex-grow: 0;
  flex-shrink: 0;
  cursor: default;
}
.following .followingmessages {
  flex-grow: 1;
  flex-shrink: 1;
  margin-left: 12px;
  height: 80px;
  overflow: hidden;
}

.followingname {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  display: inline-flex;
  cursor: pointer;
}
.followingname:hover,
.followingname:active {
  color: rgb(var(--primary-6));
}

.followingname .arco-badge {
  line-height: 6px;
  width: 6px;
  height: 6px;
}
.followingmessage {
  font-size: 12px;
  color: var(--color-text-3);
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  width: fit-content;
  max-width: 100%;
  cursor: pointer;
  margin-top: 1px;
}
.followingmessage:hover,
.followingmessage:active {
  color: rgb(var(--primary-6));
}

.daoruinput {
  white-space: nowrap;
  word-break: keep-all;
  overflow: auto;
  height: 228px !important;
  resize: none !important;
}

.arco-avatar-square {
  box-shadow: 0 4px 6px rgb(0 0 0 / 12%) !important;
  border-radius: 10.5px !important;
}
</style>
