<script setup lang="ts">
import { useServerStore } from '../../store'
import { openExternal } from '../../utils/electronhelper'
import { B64decode } from '../../utils/format'

const serverStore = useServerStore()

const handleSite = (url: string) => {
  if (url.startsWith('http')) {
    openExternal(url)
  } else {
    const ourl = B64decode(url)
    if (ourl) openExternal(ourl)
  }
}
</script>

<template>
  <div class="fullscroll">
    <a-card :bordered="false" style="width: calc(100% - 32px); margin: 24px 24px 24px 8px; box-sizing: border-box" title="搜索到的一些阿里云盘分享网站,欢迎投稿" class="sitelist">
      <a-card-grid v-for="(item, index) in serverStore.shareSiteList" :key="index" :hoverable="index % 2 === 0" class="sitelistitem">
        <a @click="handleSite(item.url)" v-html="item.title.replace('[', '<small>').replace(']', '</small>')"></a>
      </a-card-grid>
    </a-card>
  </div>
</template>

<style>
.sitelist {
  margin-top: 40px !important;
  text-align: center;
}
.sitelist .arco-card-header {
  border-bottom: none !important;
}
.sitelistitem {
  width: 33.33%;
  padding: 28px 0;
  text-align: center;
  font-size: 16px;

  color: rgb(188, 143, 143);
}
.sitelistitem a {
  cursor: pointer;
  color: rgb(var(--color-link-light-2));
}
.sitelistitem:hover {
  background-color: var(--color-fill-2);
  color: rgb(var(--primary-6));
}

.sitelistitem small {
  padding-left: 4px;
  font-size: 12px;
}
</style>
