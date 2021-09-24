<template>
  <q-tabs dense inline-label shrink stretch class="q-electron-drag--exception text-primary" align="left" narrow-indicator :model-value="uiheaderindex">
    <q-tab name="/pan" label="网盘" :disable="isLogin" class="topnavitem" @click="go('pan')" />
    <q-tab name="/pic" label="相册" :disable="true" class="topnavitem" @click="go('pic')" />
    <q-tab name="/down" label="传输" :disable="isLogin" class="topnavitem" @click="go('down')" />
    <q-tab name="/share" label="分享" :disable="isLogin" class="topnavitem" @click="go('share')" />
    <q-tab name="/rss" label="插件" :disable="isLogin" class="topnavitem" @click="go('rss')" />
  </q-tabs>
</template>

<script lang="ts">
import { StoreUser, StoreUI } from '../store';
import { useRouter } from 'vue-router';
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'TopNav',

  setup() {
    const isLogin = computed(() => !StoreUser.isLogin);

    const uiheaderindex = computed(() => StoreUI.uiheaderindex);

    const router = useRouter();
    function go(tab: string) {
      let url = '/pan';
      if (tab == 'pan') {
        url = StoreUI.uiheaderindexpan;
      } else if (tab == 'pic') {
        url = StoreUI.uiheaderindexpic;
      } else if (tab == 'down') {
        url = StoreUI.uiheaderindexdown;
      } else if (tab == 'rss') {
        url = StoreUI.uiheaderindexrss;
      } else if (tab == 'share') {
        url = StoreUI.uiheaderindexshare;
      }
      router.push(url);
    }
    return {
      isLogin,
      uiheaderindex,
      go,
    };
  },
});
</script>
<style>
.topnavitem {
  padding: 0 8px;
}

@media (min-width: 900px) {
  .topnavitem .q-tab__content {
    min-width: 52px !important;
  }
}

@media (min-width: 1024px) {
  .topnavitem .q-tab__content {
    min-width: 60px !important;
  }
}
@media (min-width: 1280px) {
  .topnavitem .q-tab__content {
    min-width: 68px !important;
  }
}

@media (min-width: 1440px) {
  .topnavitem .q-tab__content {
    min-width: 68px !important;
  }
}
</style>
