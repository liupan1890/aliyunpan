<template>
  <q-layout view="hHh lpR fFf" class="full-height" spellcheck="false">
    <q-header class="q-py-xs tophead" height-hint="48">
      <!-- 状态栏 -->
      <q-toolbar class="q-electron-drag" style="padding: 0 8px; min-height: 46px">
        <q-btn flat dense round aria-label="Menu" :icon="leftDrawerIcon" @click="onDrawerClick()" />
        <!-- toolbar - title -->
        <q-toolbar-title shrink class="text-weight-bold non-selectable" v-if="$q.screen.gt.xs"> 小白羊 </q-toolbar-title>
        <q-tabs dense inline-label shrink stretch class="q-electron-drag--exception text-primary" style="margin-top: -4px" align="left" narrow-indicator :model-value="uiheaderindex">
          <q-tab name="/pan" label="网盘" :disable="isLogin" class="topnavitem" @click="go('pan')" />
          <q-tab name="/pic" label="相册" :disable="true" class="topnavitem" @click="go('pic')" />
          <q-tab name="/down" label="传输" :disable="isLogin" class="topnavitem" @click="go('down')" />
          <q-tab name="/share" label="分享" :disable="isLogin" class="topnavitem" @click="go('share')" />
          <q-tab name="/rss" label="插件" :disable="isLogin" class="topnavitem" @click="go('rss')" />
        </q-tabs>
        <q-space />
        <TopBtns />
      </q-toolbar>
    </q-header>

    <q-drawer id="Left" v-model="leftDrawerOpen" :breakpoint="890" show-if-above :width="splitterWidth">
      <router-view v-slot="{ Component }" name="Left">
        <keep-alive :max="200">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-drawer>

    <q-page-container id="Right" class="app-main full-height">
      <router-view v-slot="{ Component }" name="Right">
        <keep-alive :max="200">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import TopNav from 'src/components/TopNav.vue';
import TopBtns from 'src/components/TopBtns.vue';
import { defineComponent, ref, computed, watch } from 'vue';
import { StoreUI, StoreUser } from '../store';
import { useRouter } from 'vue-router';
import { Screen } from 'quasar';
export default defineComponent({
  name: 'MainLayout',

  components: {
    TopNav,
    TopBtns,
  },

  computed: {
    key(): string {
      return this.$route.name ? this.$route.fullPath + new Date().toString() : (this.$route.name as string) + new Date().toString();
    },
  },

  setup() {
    const isLogin = computed(() => !StoreUser.isLogin);
    const ScreenWidth = computed(() => Screen.width);
    const leftDrawerOpen = ref(false);
    const splitterWidth = ref(260);
    const uiheaderindex = computed(() => StoreUI.uiheaderindex);
    const leftDrawerIcon = computed(() => (splitterWidth.value >= 60 && leftDrawerOpen.value ? 'iconfont iconmenuoff' : 'iconfont iconmenuon'));

    function onDrawerClick() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }
    watch(ScreenWidth, () => {
      FixWidth(uiheaderindex.value);
    });

    function FixWidth(url: string) {
      let width = 0;

      if (url == '/pan' || url == '/pic') {
        if (ScreenWidth.value <= 880) width = 300;
        else {
          width = Math.ceil(ScreenWidth.value * 0.3223);
          if (width > 460) width = 460;
        }
      } else {
        width = 240;
      }
      splitterWidth.value = width;
    }
    FixWidth(uiheaderindex.value);

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
      FixWidth(url);
    }

    //overlay
    return {
      isLogin,
      uiheaderindex,
      leftDrawerOpen,
      splitterWidth,
      leftDrawerIcon,
      onDrawerClick,
      go,
    };
  },
});
</script>

<style>
body {
  height: 100vh;
  overflow: hidden;
}
.app-main {
  height: 100vh;
}

#Left {
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #fcfcff;
  -webkit-user-drag: none;
}
#Right {
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  -webkit-user-drag: none;
}
.q-tab--inactive {
  opacity: 1;
}
.tophead {
  background: #ffffff;
  color: #616161;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
  padding: 4px 4px 1px 4px;
}
</style>
