<script setup lang="ts">
const handleClick = () => {}
</script>

<template>
  <div style="height: 7px"></div>
  <div class="toppanbtns" style="height: 26px"></div>
  <div style="height: 14px"></div>
  <div class="toppanbtns" style="height: 26px">
    <div class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconstart" />开始全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconpause" />暂停全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconrest" />清除全部</a-button>
    </div>

    <div v-if="false" class="toppanbtn">
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconstart" />开始</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconpause" />暂停</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont icondelete" />清除</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconyouxian" />优先传输</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont icondian" /></a-button>

      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconstart" />开始全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconpause" />暂停全部</a-button>
      <a-button type="text" size="small" tabindex="-1" @click="handleClick"><i class="iconfont iconrest" />清空全部</a-button>
    </div>
  </div>
  <div style="height: 9px"></div>
  <div class="toppanarea">
    <div class="cell pr"></div>
  </div>
  <div class="toppanlist" @keydown.space.prevent="() => true"></div>
</template>

<style></style>
