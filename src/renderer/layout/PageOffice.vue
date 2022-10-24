<script lang="ts">
import { useAppStore } from '../store'
import { defineComponent, onMounted } from 'vue'

declare namespace aliyun {
  class Config {
    setToken(token: { token: string }): any
  }
  // eslint-disable-next-line no-unused-vars
  function config({ mount, url }: { mount: Element; url: string }): Config
}

export default defineComponent({
  setup() {
    const handleHideClick = (_e: any) => {
      window.close()
    }
    const appStore = useAppStore()

    onMounted(() => {
      const docOptions = aliyun.config({
        mount: document.querySelector('#doc-preview')!,
        url: appStore.pageOffice?.preview_url || '' 
      })
      docOptions.setToken({ token: appStore.pageOffice?.access_token || '' })
      const doc = document.getElementById('iframe-preview')
      if (doc) doc.setAttribute('src', appStore.pageOffice?.preview_url || '')
      const name = appStore.pageOffice?.file_name || '文档在线预览'
      setTimeout(() => {
        document.title = name
      }, 1000)
      setTimeout(() => {
        document.title = name
      }, 10000)
    })
    return { handleHideClick, appStore }
  }
})
</script>

<template>
  <a-layout style="height: 100vh; background: #f2f4f7" draggable="false">
    <a-layout-header id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <a-button type="text" tabindex="-1">
          <i class="iconfont iconfile-wps"></i>
        </a-button>
        <div class="title">{{ appStore.pageOffice?.file_name || '文档在线预览' }}</div>
        <div class="flexauto"></div>
        <a-button type="text" tabindex="-1" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content style="height: calc(100vh - 42px); padding-top: 8px; background: #f2f4f7">
      <div id="doc-preview" class="doc-preview" style="width: 100%; height: 100%"></div>
    </a-layout-content>
  </a-layout>
</template>

<style></style>
