<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore, useOtherFollowingStore, FollowingState, useKeyboardStore, KeyboardState, useMyFollowingStore, useUserStore } from '../../store'
import FollowingDAL from './followingdal'
import { copyToClipboard, openExternal } from '../../utils/electronhelper'
import message from '../../utils/message'
import { TestKey } from '../../utils/keyboardhelper'
import { IAliOtherFollowingModel } from '../../aliapi/alimodels'
const otherfollowingStore = useOtherFollowingStore()
const myfollowingStore = useMyFollowingStore()
const appStore = useAppStore()
const keyboardStore = useKeyboardStore()
keyboardStore.$subscribe((_m: any, state: KeyboardState) => {
  if (appStore.appTab != 'share' || appStore.GetAppTabMenu != 'OtherFollowingRight') return

  if (TestKey('f5', state.KeyDownEvent, handleRefresh)) return
})
const handleRefresh = () => FollowingDAL.aReloadOtherFollowingList(useUserStore().user_id, true)

const tuijianSelectKey = ref(otherfollowingStore.TuiJianList[0].key)
const tuijianList = ref<IAliOtherFollowingModel[]>(otherfollowingStore.TuiJianList[0].list)

otherfollowingStore.$subscribe((_m: any, state: FollowingState) => {
  handleSelectList(tuijianSelectKey.value)
})

const handleSelectList = (key: string) => {
  tuijianSelectKey.value = key
  let list: IAliOtherFollowingModel[] = []
  for (let i = 0, maxi = otherfollowingStore.TuiJianList.length; i < maxi; i++) {
    if (otherfollowingStore.TuiJianList[i].key == key) {
      list = otherfollowingStore.TuiJianList[i].list
      break
    }
  }
  tuijianList.value = list
}
const handleCopyLink = (followingid: string, nick_name: string) => {
  const url = 'https://www.aliyundrive.com/u/' + followingid + '/feed#' + nick_name
  copyToClipboard(url)
  message.success('订阅链接已复制到剪切板')
}
const handleOpenLink = (followingid: string) => {
  const url = 'https://www.aliyundrive.com/u/' + followingid + '/feed'
  openExternal(url)
}
const handleFollowing = (followingid: string, isFollowing: boolean) => {
  const userStore = useUserStore()
  FollowingDAL.aSetFollowing(userStore.user_id, followingid, isFollowing)
}
</script>

<template>
  <div class="fullscroll" style="padding-left: 12px; padding-right: 16px; overflow-x: hidden">
    <p class="tuijiantitle">感谢这些优秀的创作者</p>
    <p class="tuijiandesc">挑选你感兴趣的分享者，订阅即可第一时间获取他们分享的资源</p>
    <div class="tuijian">
      <div class="tuijianmenu">
        <a-tag checkable :checked="false" color="arcoblue" :loading="otherfollowingStore.TuiJianLoading" @click="handleRefresh">刷新</a-tag>
        <a-tag v-for="item in otherfollowingStore.TuiJianList" :key="item.key" checkable :color="item.color" :checked="item.key == tuijianSelectKey" @click="handleSelectList(item.key)">{{ item.key }}</a-tag>
      </div>
      <div class="tuijianlist">
        <div v-for="item in tuijianList" :key="item.user_id" class="dingyuecardp">
          <div class="dingyuecard">
            <div class="dingyueimage">
              <a-avatar v-if="item.avatar" :size="120" shape="square">
                <img :src="item.avatar" />
              </a-avatar>
              <a-avatar v-else :size="120" shape="square">{{ item.nick_name }}</a-avatar>
            </div>
            <div class="dingyuetitle" @click="handleOpenLink(item.user_id)">{{ item.nick_name }}</div>
            <div class="dingyuedesc">{{ item.description }}</div>

            <div class="dingyueaction">
              <a-button v-if="myfollowingStore.FollowingKeys.has(item.user_id)" type="text" size="small" tabindex="-1" title="取消订阅" @click="handleFollowing(item.user_id, false)"><i class="iconfont icondingyueno" /></a-button>
              <a-button v-else type="text" size="small" tabindex="-1" title="订阅" @click="handleFollowing(item.user_id, true)"><i class="iconfont icondingyue" /></a-button>
              <a-button type="text" size="small" tabindex="-1" title="查看详情" @click="handleOpenLink(item.user_id)"><i class="iconfont iconchakan" /></a-button>
              <a-button type="text" size="small" tabindex="-1" title="复制链接" @click="handleCopyLink(item.user_id, item.nick_name)"><i class="iconfont iconcopy" /></a-button>
            </div>
          </div>
        </div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
        <div class="dingyuecardp"></div>
      </div>
    </div>
  </div>
</template>

<style>
.fullscroll {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.tuijiantitle {
  margin: 0;
  font-size: 18px;
  line-height: 40px;
  font-weight: 500;
  color: var(--color-text-1);
  padding: 40px 0 0 0;
}
.tuijiandesc {
  margin: 0 0 23px 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-3);
}
.tuijian {
  background-color: var(--rightbg2);
  border-radius: 10px;
  margin-top: 20px;
  margin-bottom: 32px;
  padding: 16px;
}
.tuijianmenu {
  padding: 0 8px 16px 8px;
}
.tuijianmenu .arco-tag {
  margin-right: 8px;
  margin-bottom: 4px;
  user-select: none;
}

.tuijianlist {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: flex-start;
  min-height: 548px;
}
.tuijianlist .dingyuecardp {
  padding: 16px;
  min-width: 160px;
  max-width: 240px;
  width: 25%;
  flex-grow: 1;
  flex-shrink: 1;
}
.tuijianlist .dingyuecard {
  min-width: 144px;
  padding: 16px 8px 8px 8px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-1);
  flex-shrink: 0;
  flex-grow: 1;
}
.dingyuecard .dingyueimage {
  width: 100%;
  text-align: center;
  margin: 0 auto;
  flex-shrink: 0;
  flex-grow: 0;
}
.dingyuecard .dingyueimage .arco-avatar {
  cursor: default;
}

.dingyuecard .dingyueimage .arco-avatar-text2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
}

.dingyuecard .dingyuedesc {
  height: 42px;
  font-size: 12px;
  line-height: 14px;
  color: var(--color-text-3);
  margin: 4px 0 8px 0;
  flex-shrink: 0;
  flex-grow: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
}
.dingyuecard .dingyuetitle {
  text-align: center;
  font-size: 14px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: clip;
  height: 16px;
  margin: 16px 0 0 0;
  color: var(--color-text-2);
  flex-shrink: 0;
  flex-grow: 0;
  cursor: pointer;
}
.dingyuecard .dingyuetitle:hover,
.dingyuecard .dingyuetitle:active {
  color: rgb(var(--primary-6));
}

.dingyueaction .arco-btn {
  width: 33.33%;
  padding: 0;
}
.dingyueaction .arco-btn .iconfont {
  font-size: 18px;
  line-height: 24px;
}

.dingyueaction .arco-btn .iconfont.icondingyueno {
  color: rgb(var(--orangered-6));
}

.dingyueaction .arco-btn:hover,
.dingyueaction .arco-btn:active {
  background: rgba(var(--primary-6), 0.1) !important;
}

.tuijianmenu .arco-tag.arco-tag-checkable.arco-tag-arcoblue {
  color: rgb(var(--arcoblue-6));
  background-color: rgb(var(--arcoblue-1));
}
.tuijianmenu .arco-tag.arco-tag-checkable.arco-tag-checked.arco-tag-arcoblue {
  background-color: rgb(var(--arcoblue-2));
}

.tuijianmenu .arco-tag.arco-tag-checkable.arco-tag-orangered {
  color: rgb(var(--orangered-6));
  background-color: rgb(var(--orangered-1));
  border: 1px solid transparent;
}
.tuijianmenu .arco-tag.arco-tag-checkable.arco-tag-checked.arco-tag-orangered.arco-tag {
  background-color: rgb(var(--orangered-2));
  border-color: transparent;
}
</style>
