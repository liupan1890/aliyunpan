<script setup lang="ts">
import { computed } from 'vue'
import message from '../utils/message'
import DebugLog from '../utils/debuglog'
import { useLogStore, useWinStore } from '../store'
import { copyToClipboard } from '../utils/electronhelper'

const logStore = useLogStore()
const winStore = useWinStore()

const logHeight = computed(() => winStore.height - 316)

const handleSaveLogRefresh = () => {
  DebugLog.aLoadFromDB()
}
const handleSaveLogClear = () => {
  DebugLog.mSaveLogClear()
}
const handleSaveLogCopy = () => {
  let logstr = ''
  const logList = DebugLog.logList
  for (let i = 0, maxi = logList.length; i < maxi; i++) {
    const item = logList[i]
    logstr += item.logtime + ' : ' + item.logtype + ' : ' + item.logmessage + '\n'
  }
  copyToClipboard(logstr)
  message.success('运行日志已复制到剪切板')
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:运行日志</div>

    <a-list
      :bordered="false"
      :max-height="logHeight"
      :style="{ height: logHeight + 'px' }"
      :data="DebugLog.logList"
      class="loglist"
      :data-refresh="logStore.logTime"
      :virtual-list-props="{
        height: logHeight,
        threshold: 1
      }">
      <template #item="{ item, index }">
        <a-list-item :key="index">
          <a-typography-text :type="item.logtype"> [{{ item.logtime }}] </a-typography-text>
          {{ item.logmessage }}
        </a-list-item>
      </template>
    </a-list>

    <div class="settingspace"></div>
    <div class="settingrow">
      <a-button type="outline" size="small" tabindex="-1" @click="handleSaveLogRefresh">刷新</a-button>
      <span style="margin-right: 16px"></span>
      <a-button type="outline" size="small" tabindex="-1" @click="handleSaveLogClear">清空日志</a-button>
      <span style="margin-right: 16px"></span>
      <a-button type="outline" size="small" tabindex="-1" @click="handleSaveLogCopy">复制日志</a-button>
    </div>
  </div>
</template>

<style>
.loglist {
  box-sizing: content-box;
  border: 1px solid var(--color-neutral-3);
}
.loglist .arco-list {
  height: 100%;
  overflow-y: hidden !important;
}
.loglist .arco-list-item {
  padding: 4px 8px !important; /*8px 16px;*/
  font-size: 12px;
}
.loglist .arco-list-item-content {
  user-select: text;
  -webkit-user-drag: none;
}
</style>
