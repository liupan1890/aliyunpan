<script lang="ts">
import { defineComponent, onMounted } from 'vue'
const { getCurrentWindow } = window.require('@electron/remote')

export default defineComponent({
  setup() {
    const handleHideClick = (_e: any) => {
      getCurrentWindow().close()
    }

    onMounted(() => {
      setTimeout(() => {
        document.title = '小白羊帮助文档'
      }, 1000)
      setTimeout(() => {
        document.title = '小白羊帮助文档'
      }, 10000)
    })
    return { handleHideClick }
  }
})
</script>

<template>
  <a-layout style="height: 100vh; background: #f2f4f7" draggable="false">
    <a-layout-header id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <div class="title">阿里云盘小白羊版</div>
        <div class="flexauto"></div>

        <a-button type="text" tabindex="-1" title="关闭 Alt+F4" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="height: calc(100vh - 42px); padding-top: 8px; background: #f2f4f7">
      <div className="doc-preview" id="doc-preview" style="width: 100%; height: 100%">
        <Webview style="width: 100%; height: 100%" src="https://github.com/liupan1890/aliyunpan/wiki"></Webview>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style></style>
