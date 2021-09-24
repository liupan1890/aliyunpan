<template>
  <q-page class="column items-start">
    <div class="self-stretch headdesc">好玩的插件</div>
    <div class="self-stretch">
      <q-tabs
        align="left"
        class="leftMenuTab"
        active-color="leftMenuTabActive"
        indicator-color="leftMenuTabActive"
        active-bg-color="leftMenuTabActive"
        inline-label
        :switch-indicator="false"
        swipeable
        vertical
        dense
      >
        <q-route-tab
          :ripple="false"
          align="left"
          name="search"
          label="聚合搜索"
          icon="iconfont iconrvip"
          to="/rss/RssSearch"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="filesync"
          label="文件同步盘"
          icon="iconfont iconcloud-sync"
          to="/rss/RssFileSync"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="filescan"
          label="重复文件扫描"
          icon="iconfont iconclear"
          to="/rss/RssFileScan"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="filecopy"
          label="帐号间文件复制"
          icon="iconfont iconyonghu"
          to="/rss/RssFileCopy"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="offline"
          label="离线任务"
          icon="iconfont iconcloud-download"
          to="/rss/RssOffline"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab :ripple="false" align="left" name="help" label="操作帮助" icon="iconfont iconbulb" to="/rss/RssHelp" style="justify-content: flex-start !important; padding-left: 15px" exact />
      </q-tabs>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RssLeft',
  components: {},
  setup() {
    //
  },
});
</script>
