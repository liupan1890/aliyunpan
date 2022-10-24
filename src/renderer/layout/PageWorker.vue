<script setup lang="ts">
const handleHideClick = (_e: any) => {
  window.close()
}
</script>
<template>
  <a-layout style="height: 100vh" draggable="false">
    <a-layout-header id="xbyhead" draggable="false">
      <div id="xbyhead2" class="q-electron-drag">
        <div class="title">阿里云盘</div>

        <div class="flexauto"></div>

        <a-button type="text" tabindex="-1" @click="handleHideClick">
          <i class="iconfont iconclose"></i>
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content id="xbybody">
      <h3 id="xbyworker">工作进程</h3>
    </a-layout-content>
    <a-layout-footer id="xbyfoot" draggable="false"> </a-layout-footer>
  </a-layout>
</template>
<style></style>
