<template>
  <q-page class="column items-center">
    <div class="self-stretch headdesc">阿里云盘分享</div>
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
          name="MyShare"
          label="我创建的分享"
          icon="iconfont iconfenxiang"
          to="/share/MyShare"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="OtherShare"
          label="其他人的分享"
          icon="iconfont iconfenxiang1"
          to="/share/OtherShare"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="RssShare"
          label="订阅源的推送"
          icon="iconfont iconxiaoxituisong"
          to="/share/RssShare"
          style="justify-content: flex-start !important; padding-left: 15px"
          exact
        />
        <q-route-tab
          :ripple="false"
          align="left"
          name="RssSend"
          label="我发布的订阅"
          icon="iconfont iconrss-xby"
          to="/share/RssSend"
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
  name: 'ShareLeft',
  components: {},
  setup() {
    //
  },
});
</script>
