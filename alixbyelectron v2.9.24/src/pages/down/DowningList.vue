<template>
  <RecycleScroller id="DownRightDFileList" class="scroller DownRightFileList" :items="downingList.list" :item-size="50" key-field="DownID" page-mode>
    <template v-slot="{ item, index }">
      <div
        class="downitem"
        :class="(selectedFiles.has(item.DownID) ? 'selected' : '') + (item.Down.IsDowning ? ' runing' : '')"
        @click="onSelectFile($event, item.DownID, false)"
        @dblclick.stop="onDoubleClick($event, item.DownID, item.Down.IsDowning)"
      >
        <div>
          <q-btn
            flat
            round
            color="primary"
            :icon="selectedFiles.has(item.DownID) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'"
            class="select"
            @click.stop="onSelectFile($event, item.DownID, true)"
            :title="index"
          ></q-btn>
        </div>
        <div class="fileicon">
          <i class="q-icon iconfont" :class="item.Info.icon" aria-hidden="true" role="img"></i>
        </div>
        <div class="filename">
          <div :title="item.Info.DownSavePath">
            {{ item.Info.name }}
          </div>
        </div>

        <div class="filesize">{{ item.Info.sizestr }}</div>
        <div class="downprogress">
          <div class="transfering-state">
            <p class="text-state">{{ item.Down.DownState }}</p>
            <div class="progress-total">
              <div
                :class="item.Down.IsDowning ? 'progress-current active' : item.Down.IsCompleted ? 'progress-current succeed' : item.Down.IsFailed ? 'progress-current error' : 'progress-current'"
                :style="'width: ' + item.Down.DownProcess.toString() + '%'"
              ></div>
            </div>
            <p class="text-error">{{ item.Down.FailedMessage }}</p>
          </div>
        </div>
        <div class="downspeed">{{ item.Down.DownSpeedStr }}</div>
      </div>
    </template>
    <template #after>
      <div class="downHideTip" v-if="gDowningCount < 1">
        <div style="margin-top: 20%"></div>
        <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
        <br />没有下载中的任务
      </div>
      <div class="downHideTip" v-if="gDowningCount > 5000">只显示前5000条记录，之后的先被省略...</div>
    </template>
  </RecycleScroller>
</template>

<script lang="ts">
import { StoreDown } from 'src/store';
import { defineComponent, computed, reactive, watch, ref } from 'vue';
import { topStartDown, topStopDown } from './down';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { IStateDownFile } from 'src/store/models';
export default defineComponent({
  name: 'DowningList',
  components: { RecycleScroller },
  setup() {
    const selectedFiles = computed(() => StoreDown.selectedFiles);
    const changDowningTime = computed(() => StoreDown.changDowningTime);
    const gDowningCount = ref(StoreDown.gDowningCount());
    const downingList = reactive({ list: StoreDown.gDowningList() });
    watch(changDowningTime, () => {
      const DowningList = StoreDown.gDowningList();
      gDowningCount.value = DowningList.length;
      const dlist: IStateDownFile[] = [];
      const max = Math.min(5000, DowningList.length);
      for (let i = 0; i < max; i++) {
        dlist.push(DowningList[i]);
      }
      downingList.list = dlist;
    });

    function onSelectFile(event: MouseEvent, DownID: string, ctrl: boolean) {
      StoreDown.mChangSelectedFile({ DownID, ctrl, shift: event.shiftKey });
    }

    function onDoubleClick(event: MouseEvent, DownID: string, IsDowning: boolean) {
      StoreDown.mChangSelectedFile({ DownID: '', ctrl: false, shift: event.shiftKey });
      StoreDown.mChangSelectedFile({ DownID, ctrl: false, shift: event.shiftKey });
      if (IsDowning) topStopDown(true);
      else topStartDown(true);
    }
    return { selectedFiles, downingList, gDowningCount, onSelectFile, onDoubleClick };
  },
});
</script>
<style>
.DownRightFileList .icondownload {
  color: #bcb3b399;
}
.DownRightFileList .runing .icondownload {
  color: #2196f3;
}

.downitem {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 50px;
  word-wrap: break-word;
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;

  border-bottom: 1px solid #e5e8ed99;
}
.fileicon.ml {
  margin-left: 7px;
}
.downitem:hover {
  background: #f7f8fadd;
}
.downitem .select {
  color: #bcb3b366 !important;
}
.downitem.selected .select i {
  color: #637dff !important;
}
.downitem.selected {
  background: #f7f8fa;
}

.downitem .filesize {
  font-size: 16px;
  width: 72px;
  text-align: right;
  flex-shrink: 0;
  flex-grow: 0;
  margin-right: 16px;
}
.downprogress {
  width: 90px;
  flex-shrink: 0;
  flex-grow: 0;
  margin-right: 8px;
}
.downspeed {
  width: 126px;
  font-size: 26px;
  color: #00000033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  flex-shrink: 0;
  flex-grow: 0;
  text-align: right;
}

.transfering-state {
  display: block;
  width: 100%;
  overflow: visible;
}
.text-state {
  font-size: 12px;
  line-height: 16px;
  color: #00000066;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  height: 16px;
  margin: 0;
}
.text-error {
  color: #f35b51;
  font-size: 12px;
  line-height: 16px;
  width: 100%;
  overflow: visible;
  white-space: nowrap;
  height: 16px;
  margin: 0;
}
.progress-total {
  width: 100%;
  height: 3px;
  background: #84858d14;
  border-radius: 1.5px;
  margin-top: 2px;
  position: relative;
}
.progress-total .progress-current {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 100%;
  min-width: 6px;
  height: 100%;
  border-radius: 1.5px;
  background: #00000033;
  -webkit-transition: width 0.3s ease, opacity 0.3s ease;
  -o-transition: width 0.3s ease, opacity 0.3s ease;
  transition: width 0.3s ease, opacity 0.3s ease;
}
.progress-total .progress-current.succeed {
  background: #099970;
}
.progress-total .progress-current.error {
  background: #f35b51;
}
.progress-total .progress-current.active {
  background: linear-gradient(270deg, #ffba7a 0%, #ff74c7 8.56%, #637dff 26.04%, rgba(99, 125, 255, 0.2) 100%);
}

.downHideTip {
  text-align: center;
  padding: 8px;
  opacity: 0.5;
}
</style>
