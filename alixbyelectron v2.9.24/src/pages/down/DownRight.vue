<template>
  <div id="DownRightTop" class="RightTop">
    <div v-if="gIsDowningPage">
      <div v-if="gSelectedDowningCount == 0 || gSelectedDowningCount == gDowningCount">
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconstart" size="md" label="开始全部" @click="topStartDownAll(true)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停全部" @click="topStopDownAll(true)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除全部" @click="topDeleteDownAll(true)" />
        </q-btn-group>
      </div>
      <div v-else>
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconstart" size="md" label="开始" @click="topStartDown(true)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停" @click="topStopDown(true)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除" @click="topDeleteDown(true)" />
          <q-btn outline icon="iconfont iconyouxian" size="md" label="优先传输" @click="topOrderDown(true)" />
          <q-btn outline icon="iconfont icondian" size="md" />
          <q-btn outline icon="iconfont iconstart" size="md" label="开始全部" @click="topStartDownAll(true)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停全部" @click="topStopDownAll(true)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除全部" @click="topDeleteDownAll(true)" />
        </q-btn-group>
      </div>
    </div>
    <div v-else-if="gIsUploadingPage">
      <div v-if="gSelectedUploadingCount == 0 || gSelectedUploadingCount == gUploadingCount">
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconstart" size="md" label="开始全部" @click="topStartDownAll(false)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停全部" @click="topStopDownAll(false)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除全部" @click="topDeleteDownAll(false)" />
        </q-btn-group>
      </div>
      <div v-else>
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconstart" size="md" label="开始" @click="topStartDown(false)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停" @click="topStopDown(false)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除" @click="topDeleteDown(false)" />
          <q-btn outline icon="iconfont iconyouxian" size="md" label="优先传输" @click="topOrderDown(false)" />
          <q-btn outline icon="iconfont icondian" size="md" />
          <q-btn outline icon="iconfont iconstart" size="md" label="开始全部" @click="topStartDownAll(false)" />
          <q-btn outline icon="iconfont iconpause" size="md" label="暂停全部" @click="topStopDownAll(false)" />
          <q-btn outline icon="iconfont icondelete" size="md" label="清除全部" @click="topDeleteDownAll(false)" />
        </q-btn-group>
      </div>
    </div>
    <div v-else-if="gIsDownedPage">
      <q-btn outline icon="iconfont icondelete" size="md" label="清除全部下载记录" @click="topDeleteDownedAll(true)" />
    </div>
    <div v-else>
      <q-btn outline icon="iconfont icondelete" size="md" label="清除全部上传记录" @click="topDeleteDownedAll(false)" />
    </div>
  </div>
  <div id="DownRightSelected" class="RightSelected" v-if="gIsDowningPage">
    <div>
      <q-btn flat round color="primary" :icon="gSelectedDowningCount == gDowningCount ? 'iconfont iconrsuccess' : 'iconfont iconrpic'" class="select all" @click="onSelectAll(true)">
        <q-tooltip>全选</q-tooltip>
      </q-btn>
    </div>
    <div>已选中 {{ gSelectedDowningCount }} / {{ gDowningCount }} 个</div>
    <div style="flex-grow: 1"></div>
    <div class="downspeed" v-if="gIsDowningPage">{{ totalDownSpeed }}</div>
  </div>
  <div id="DownRightSelected" class="RightSelected" v-else-if="gIsUploadingPage">
    <div>
      <q-btn flat round color="primary" :icon="gSelectedUploadingCount == gUploadingCount ? 'iconfont iconrsuccess' : 'iconfont iconrpic'" class="select all" @click="onSelectAll(false)">
        <q-tooltip>全选</q-tooltip>
      </q-btn>
    </div>
    <div>已选中 {{ gSelectedUploadingCount }} / {{ gUploadingCount }} 个</div>
    <div style="flex-grow: 1"></div>
  </div>
  <div id="DownRightSelected" class="RightSelected" v-else-if="gIsDownedPage">
    <div>已成功下载 {{ gDownedCount }} 个</div>
  </div>
  <div id="DownRightSelected" class="RightSelected" v-else>
    <div>已成功上传 {{ gUploadedCount }} 个</div>
  </div>
  <div id="DownRight" class="RightContentDown">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
import { StoreDown, StoreUI, StoreUpload } from 'src/store';
import { defineComponent, computed, ref, watch } from 'vue';
import { topStartDown, topStopDown, topStartDownAll, topStopDownAll, topDeleteDownAll, topDeleteDown, topOrderDown, topDeleteDownedAll, onSelectAll } from './down';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
export default defineComponent({
  name: 'DownRight',
  components: { RecycleScroller },
  setup() {
    const gIsDowningPage = computed(() => StoreUI.gIsDowningPage);
    const gIsDownedPage = computed(() => StoreUI.gIsDownedPage);
    const gIsUploadingPage = computed(() => StoreUI.gIsUploadingPage);

    const gDowningCount = ref(StoreDown.gDowningCount());
    const changDowningTime = computed(() => StoreDown.changDowningTime);
    watch(changDowningTime, () => {
      gDowningCount.value = StoreDown.gDowningCount();
    });
    const gDownedCount = ref(StoreDown.gDownedCount());
    const changDownedTime = computed(() => StoreDown.changDownedTime);
    watch(changDownedTime, () => {
      gDownedCount.value = StoreDown.gDownedCount();
    });

    const totalDownSpeed = computed(() => StoreDown.totalDownSpeed);
    const gSelectedDowningCount = computed(() => StoreDown.gSelectedDowningCount);

    const gUploadingCount = ref(StoreUpload.gUploadingCount());
    const changUploadingTime = computed(() => StoreUpload.changUploadingTime);
    watch(changUploadingTime, () => {
      gUploadingCount.value = StoreUpload.gUploadingCount();
    });
    const gUploadedCount = ref(StoreUpload.gUploadedCount());
    const changUploadedTime = computed(() => StoreUpload.changUploadedTime);
    watch(changUploadedTime, () => {
      gUploadedCount.value = StoreUpload.gUploadedCount();
    });
    const gSelectedUploadingCount = computed(() => StoreUpload.gSelectedUploadingCount);

    return {
      gIsDowningPage,
      gIsDownedPage,
      gIsUploadingPage,
      gDowningCount,
      gDownedCount,
      gSelectedDowningCount,
      gUploadingCount,
      gUploadedCount,
      gSelectedUploadingCount,
      totalDownSpeed,
      onSelectAll,
      topStartDown,
      topStopDown,
      topStartDownAll,
      topStopDownAll,
      topDeleteDownAll,
      topDeleteDown,
      topOrderDown,
      topDeleteDownedAll,
    };
  },
});
</script>
<style>
.RightContentDown {
  flex-grow: 1;
  padding: 1px 0 0 16px;
  width: calc(100% - 10px);
  margin-right: 10px;
  height: calc(100vh - 52px - 36px - 52px - 12px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
