<script setup lang="ts">
import { useAppStore } from '../store'
import DownSync from './DownSync.vue'
import DownDowning from './DownDowning.vue'
import DownDowned from './DownDowned.vue'
import DownUploading from './DownUploading.vue'
import DownUploaded from './DownUploaded.vue'
import DownM3U8 from './DownM3U8.vue'

const appStore = useAppStore()
</script>

<template>
  <a-layout style="height: 100%">
    <a-layout-sider hide-trigger :width="158" class="xbyleft">
      <div class="headdesc">上传下载文件</div>
      <a-menu :style="{ width: '100%' }" class="xbyleftmenu" :selected-keys="[appStore.GetAppTabMenu]" @update:selected-keys="appStore.toggleTabMenu('down', $event[0])">
        <a-menu-item key="DowningRight">
          <template #icon><i class="iconfont icondownload" /></template>
          下载中 x
        </a-menu-item>
        <a-menu-item key="DownedRight">
          <template #icon><i class="iconfont icondesktop" /></template>
          已下载完 x
        </a-menu-item>
        <a-menu-item key="UploadingRight">
          <template #icon><i class="iconfont iconcloud-upload" /></template>
          上传中
        </a-menu-item>
        <a-menu-item key="UploadedRight">
          <template #icon><i class="iconfont iconcloud_success" /></template>
          已上传完
        </a-menu-item>
        <a-menu-item key="SyncRight">
          <template #icon><i class="iconfont iconcloud-sync" /></template>
          文件夹同步 x
        </a-menu-item>
        <a-menu-item key="M3U8Right">
          <template #icon><i class="iconfont iconluxiang" /></template>
          M3U8视频 x
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content class="xbyright">
      <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="appStore.GetAppTabMenu">
        <a-tab-pane key="DowningRight" title="1"><DownDowning /></a-tab-pane>
        <a-tab-pane key="DownedRight" title="2"><DownDowned /></a-tab-pane>
        <a-tab-pane key="UploadingRight" title="3"><DownUploading /></a-tab-pane>
        <a-tab-pane key="UploadedRight" title="4"><DownUploaded /></a-tab-pane>
        <a-tab-pane key="SyncRight" title="5"><DownSync /></a-tab-pane>
        <a-tab-pane key="M3U8Right" title="5"><DownM3U8 /></a-tab-pane>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<style></style>
