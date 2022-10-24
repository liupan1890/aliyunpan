<script setup lang="ts">
import { useAppStore } from '../store'
import RssScanClean from './rssscanclean/RssScanClean.vue'
import AppSame from './appsame/AppSame.vue'
import RssXiMa from './rssxima/RssXiMa.vue'
import RssScanSame from './rssscansame/RssScanSame.vue'
import RssScanPunish from './rssscanpunish/RssScanPunish.vue'
import RssScanEnmpty from './rssscanenmpty/RssScanEnmpty.vue'
import RssUserCopy from './rssusercopy/RssUserCopy.vue'
import RssJiaMi from './rssjiami/RssJiaMi.vue'
import RssDriveCopy from './rssdrivecopy/RssDriveCopy.vue'
import RssRename from './rssrename/RssRename.vue'

const appStore = useAppStore()
</script>

<template>
  <a-layout style="height: 100%">
    <a-layout-sider hide-trigger :width="158" class="xbyleft">
      <div class="headdesc">好玩的插件</div>
      <a-menu :style="{ width: '100%' }" class="xbyleftmenu" :selected-keys="[appStore.GetAppTabMenu]" @update:selected-keys="appStore.toggleTabMenu('rss', $event[0])">
        <a-menu-item key="AppSame">
          <template #icon><i class="iconfont iconcopy" /></template>
          重复文件清理
        </a-menu-item>
        <a-menu-item key="RssXiMa">
          <template #icon><i class="iconfont iconcameraadd" /></template>
          视频文件洗码
        </a-menu-item>
        <a-menu-item key="RssJiaMi">
          <template #icon><i class="iconfont iconsafebox" /></template>
          文件加密 x
        </a-menu-item>
        <a-menu-item key="RssScanClean">
          <template #icon><i class="iconfont iconclear" /></template>
          扫描大文件
        </a-menu-item>
        <a-menu-item key="RssScanSame">
          <template #icon><i class="iconfont iconcopy" /></template>
          扫描重复文件
        </a-menu-item>
        <a-menu-item key="RssScanPunish">
          <template #icon><i class="iconfont iconweixiang" /></template>
          扫描违规文件
        </a-menu-item>
        <a-menu-item key="RssScanEnmpty">
          <template #icon><i class="iconfont iconempty" /></template>
          扫描空文件夹
        </a-menu-item>
        <a-menu-item key="RssDriveCopy">
          <template #icon><i class="iconfont iconchuanshu2" /></template>
          网盘相册间复制
        </a-menu-item>
        <a-menu-item key="RssUserCopy">
          <template #icon><i class="iconfont iconyonghu" /></template>
          帐号间复制 x
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content>
      <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="appStore.GetAppTabMenu">
        <a-tab-pane key="AppSame" title="1"><AppSame /></a-tab-pane>
        <a-tab-pane key="RssXiMa" title="1"><RssXiMa /></a-tab-pane>
        <a-tab-pane key="RssRename" title="1"><RssRename /></a-tab-pane>
        <a-tab-pane key="RssJiaMi" title="1"><RssJiaMi /></a-tab-pane>
        <a-tab-pane key="RssScanClean" title="1"><RssScanClean /></a-tab-pane>
        <a-tab-pane key="RssScanSame" title="2"><RssScanSame /></a-tab-pane>
        <a-tab-pane key="RssScanPunish" title="3"><RssScanPunish /></a-tab-pane>
        <a-tab-pane key="RssScanEnmpty" title="4"><RssScanEnmpty /></a-tab-pane>
        <a-tab-pane key="RssDriveCopy" title="5"><RssDriveCopy /></a-tab-pane>
        <a-tab-pane key="RssUserCopy" title="5"><RssUserCopy /></a-tab-pane>
        <a-tab-pane key="RssMakeFileTree" title="5">生成指定文件夹的全部子文件夹和子文件的详细列表(类似 cmd > dir linux > ls)，功能正在规划中，以后提供</a-tab-pane>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<style>
.iconnode-tree1,
.iconshuzhuangtu {
  opacity: 0.8;
}
</style>
