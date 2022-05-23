<script setup lang="ts">
const handleClick = () => {}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px"></div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont icondelete" />清除全部上传记录</a-button>
    </div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" @keydown.space.prevent="() => true"></div>
</template>

<style></style>
