<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import SettingPlay from './SettingPlay.vue'
import SettingPan from './SettingPan.vue'
import SettingUI from './SettingUI.vue'
import SettingDown from './SettingDown.vue'
import SettingDebug from './SettingDebug.vue'
import SettingUpload from './SettingUpload.vue'
import SettingLog from './SettingLog.vue'
import { useAppStore } from '../store'
import SettingProxy from './SettingProxy.vue'

const appStore = useAppStore()

let observer: any

const hideSetting = computed(() => appStore.appTab !== 'setting')

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.length > 0 && entries[0].isIntersecting) {
        appStore.toggleTabSetting('setting', entries[0].target.id)
      }
    },
    {
      root: document.getElementById('SettingObserver'),
      threshold: 0.5
    }
  )

  observer.observe(document.getElementById('SettingUI')!)
  observer.observe(document.getElementById('SettingDown')!)
  observer.observe(document.getElementById('SettingUpload')!)
  observer.observe(document.getElementById('SettingPlay')!)
  observer.observe(document.getElementById('SettingPan')!)
  observer.observe(document.getElementById('SettingDebug')!)
  observer.observe(document.getElementById('SettingProxy')!)
  observer.observe(document.getElementById('SettingLog')!)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <a-layout style="height: 100%">
    <a-layout-sider hide-trigger :width="158" class="xbyleft" tabindex="-1" @keydown.tab.prevent="() => true">
      <div class="headdesc">APP 设置项</div>
      <a-menu :selected-keys="[appStore.GetAppTabMenu]" :style="{ width: '100%' }" class="xbyleftmenu" @update:selected-keys="appStore.toggleTabMenu('setting', $event[0])">
        <a-menu-item key="SettingUI">
          <template #icon><i class="iconfont iconui" /></template>
          APP
        </a-menu-item>
        <a-menu-item key="SettingDown">
          <template #icon><i class="iconfont icondownload" /></template>
          下载
        </a-menu-item>
        <a-menu-item key="SettingUpload">
          <template #icon><i class="iconfont iconupload" /></template>
          上传
        </a-menu-item>
        <a-menu-item key="SettingPlay">
          <template #icon><i class="iconfont iconshipin" /></template>
          在线播放
        </a-menu-item>
        <a-menu-item key="SettingPan">
          <template #icon><i class="iconfont iconfile-folder" /></template>
          网盘
        </a-menu-item>
        <a-menu-item key="SettingDebug">
          <template #icon><i class="iconfont iconlogoff" /></template>
          高级选项
        </a-menu-item>
        <a-menu-item key="SettingProxy">
          <template #icon><i class="iconfont iconyuanduanfuzhi" /></template>
          网络代理
        </a-menu-item>
        <a-menu-item key="SettingLog">
          <template #icon><i class="iconfont icondebug" /></template>
          运行日志
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content id="SettingObserver" class="xbyright fullscroll" tabindex="-1" @keydown.tab.prevent="() => true">
      <div id="SettingDiv" style="position: relative">
        <div id="SettingUI">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">APP</a-divider>
          </div>
          <SettingUI />
        </div>
        <div id="SettingDown">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">下载</a-divider>
          </div>
          <SettingDown />
        </div>

        <div id="SettingUpload">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">上传</a-divider>
          </div>
          <SettingUpload />
        </div>
        <div id="SettingPlay">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">在线播放</a-divider>
          </div>
          <SettingPlay />
        </div>
        <div id="SettingPan">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">网盘</a-divider>
          </div>
          <SettingPan />
        </div>
        <div id="SettingDebug">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">高级选项</a-divider>
          </div>
          <SettingDebug />
        </div>
        <div id="SettingProxy">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">网络代理</a-divider>
          </div>
          <SettingProxy />
        </div>
        <div id="SettingLog">
          <div>
            <div style="height: 10px"></div>
            <a-divider orientation="center" class="settinghr">运行日志</a-divider>
          </div>
          <div v-if="hideSetting" style="min-height: 602px"></div>
          <SettingLog v-else />
        </div>
        <div style="height: 10px"></div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
#SettingObserver {
  background: var(--rightbg2);
  padding: 0 20px !important;
}
.settinghr {
  margin: 40px 0 !important;
  user-select: none;
}

.settingcard {
  margin-bottom: 12px;
  padding: 24px;
  margin: 20px 0;
  border-radius: 6px;
  background-color: var(--color-bg-1);
  user-select: none;
  -webkit-user-drag: none;
}
.settingcard .iconbulb,
.settingrow .iconbulb {
  display: inline-block;
  height: 22px;
  margin-left: 4px;
  color: #ffc107dd;
  font-size: 18px;
  line-height: 22px;
  cursor: help;
}
.settinghead {
  display: inline-block;
  margin-bottom: 4px;
  padding: 0px 0 4px 0;
  font-size: 15px;
  line-height: 20px;
  user-select: none;
}
.settinghead::after {
  display: block;
  width: 100%;
  height: 2px;
  background: rgb(var(--primary-6));
  opacity: 0.75;
  content: '';
}
.settingrow {
  padding-top: 4px;
  max-width: 450px;
  margin-right: auto;
}
.settingspace {
  height: 16px;
  user-select: none;
}
.hrspace {
  padding-top: 8px;
}

.opred {
  padding: 0 2px;
  color: rgb(223, 86, 89);
  background: rgba(223, 86, 89, 0.1);
}

.oporg {
  padding: 0 2px;
  color: rgb(255, 111, 0);
  background: rgba(255, 111, 0, 0.1);
}

.opblue {
  padding: 0 2px;
  color: rgb(30, 136, 229);
  background: rgba(30, 136, 229, 0.1);
}

.arco-popover-content hr {
  opacity: 0.2;
  border-top: none;
}
</style>
