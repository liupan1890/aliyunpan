<script setup lang="ts">
import { ref } from 'vue'
import useSettingStore from './settingstore'
import MySwitch from '../layout/MySwitch.vue'
import Config from '../utils/config'
import ServerHttp from '../aliapi/server'

const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}

const verLoading = ref(false)

const handleCheckVer = () => {
  verLoading.value = true
  ServerHttp.CheckUpgrade(true).then(() => {
    verLoading.value = false
  })
}
</script>

<template>
  <div class="settingcard">
    <div class="appver">阿里云盘小白羊版 {{ Config.appVersion }}</div>
    <div class="appver">
      <a-button type="outline" size="mini" tabindex="-1" :loading="verLoading" @click="handleCheckVer">检查更新</a-button>
    </div>
    <div class="settingspace"></div>
    <div class="settingspace"></div>
    <div class="settinghead">:界面颜色</div>
    <div class="settingrow">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiTheme" @update:model-value="cb({ uiTheme: $event })">
        <a-radio tabindex="-1" value="system">跟随系统</a-radio>
        <a-radio tabindex="-1" value="light">浅色模式</a-radio>
        <a-radio tabindex="-1" value="dark">深色模式</a-radio>
      </a-radio-group>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:关闭窗口时彻底退出</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiExitOnClose" @update:value="cb({ uiExitOnClose: $event })">关闭窗口时彻底退出小白羊</MySwitch>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            默认是点击窗口上的关闭按钮时<br />最小化到托盘，继续上传/下载<br /><br />开启此设置后直接彻底退出小白羊程序
          </div>
        </template>
      </a-popover>
    </div>
  </div>
</template>

<style scoped>
.appver {
  margin-bottom: 0.5em;
  font-weight: 600;
  font-size: 20px;
  line-height: 1.4;
  text-align: center;
}
</style>
