<template>
  <q-page class="column items-center">
    <div class="self-stretch headdesc">本地下载/上传的文件</div>
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
          name="downing"
          label="下载中"
          icon="iconfont icondownload"
          to="/down/DowningList"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="downed"
          label="已下载完"
          icon="iconfont icondesktop"
          to="/down/DownedList"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />

        <q-route-tab
          :ripple="false"
          align="left"
          name="uploading"
          label="上传中"
          icon="iconfont iconcloud-upload"
          to="/down/UploadingList"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="upload"
          label="已上传完"
          icon="iconfont iconcloud_success"
          to="/down/UploadList"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
      </q-tabs>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DownLeft',
  components: {},
  setup() {
    //
  },
});
</script>
<style>
.leftMenuTab {
  color: #616161;
}
.bg-leftMenuTabActive {
  background: #ffebee;
}
.text-leftMenuTabActive {
  color: var(--q-primary);
}
</style>
