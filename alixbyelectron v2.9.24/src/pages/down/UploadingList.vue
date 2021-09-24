<template>
  <RecycleScroller id="DownRightUFileList" class="scroller DownRightFileList" :items="uploadingList.list" :item-size="50" key-field="UploadID" page-mode>
    <template v-slot="{ item, index }">
      <div
        class="downitem"
        :class="(selectedFiles.has(item.UploadID) ? 'selected' : '') + (item.Upload.IsDowning ? ' runing' : '')"
        @click="onSelectFile($event, item.UploadID, false)"
        @dblclick.stop="onDoubleClick($event, item.UploadID, item.Upload.IsDowning)"
      >
        <div>
          <q-btn
            flat
            round
            color="primary"
            :icon="selectedFiles.has(item.UploadID) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'"
            class="select"
            @click.stop="onSelectFile($event, item.UploadID, true)"
            :title="index"
          ></q-btn>
        </div>
        <div class="fileicon">
          <i class="q-icon" :class="item.Info.icon" aria-hidden="true" role="img"></i>
        </div>
        <div class="filename">
          <div :title="item.Info.localFilePath">
            {{ item.Info.name }}
          </div>
        </div>

        <div class="filesize">{{ item.Info.sizestr }}</div>
        <div class="downprogress">
          <div class="transfering-state">
            <p class="text-state">{{ item.Upload.DownState }}</p>
            <div class="progress-total">
              <div
                :class="item.Upload.IsDowning ? 'progress-current active' : item.Upload.IsCompleted ? 'progress-current succeed' : item.Upload.IsFailed ? 'progress-current error' : 'progress-current'"
                :style="'width: ' + item.Upload.DownProcess.toString() + '%'"
              ></div>
            </div>
            <p class="text-error">{{ item.Upload.FailedMessage }}</p>
          </div>
        </div>
        <div class="downspeed">{{ item.Upload.DownSpeedStr }}</div>
      </div>
    </template>
    <template #after>
      <div class="downHideTip" v-if="gUploadingCount < 1">
        <div style="margin-top: 20%"></div>
        <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
        <br />没有上传中的任务
      </div>
      <div class="downHideTip" v-if="gUploadingCount > 5000">只显示前5000条记录，之后的先被省略...</div>
    </template>
  </RecycleScroller>
</template>

<script lang="ts">
import { StoreUpload } from 'src/store';
import { IStateUploadFile } from 'src/store/models';
import { defineComponent, computed, reactive, watch, ref } from 'vue';
import { topStartDown, topStopDown } from './down';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
export default defineComponent({
  name: 'UploadingList',
  components: { RecycleScroller },
  setup() {
    const selectedFiles = computed(() => StoreUpload.selectedFiles);

    const changUploadingTime = computed(() => StoreUpload.changUploadingTime);
    const gUploadingCount = ref(StoreUpload.gUploadingCount());
    const uploadingList = reactive({ list: StoreUpload.gUploadingList() });
    watch(changUploadingTime, () => {
      const UploadingList = StoreUpload.gUploadingList();
      gUploadingCount.value = UploadingList.length;
      const dlist: IStateUploadFile[] = [];
      const max = Math.min(5000, UploadingList.length);
      for (let i = 0; i < max; i++) {
        dlist.push(UploadingList[i]);
      }
      uploadingList.list = dlist;
    });
    function onSelectFile(event: MouseEvent, UploadID: string, ctrl: boolean) {
      StoreUpload.mChangSelectedFile({ UploadID, ctrl, shift: event.shiftKey });
    }
    function onDoubleClick(event: MouseEvent, UploadID: string, IsUploading: boolean) {
      StoreUpload.mChangSelectedFile({ UploadID: '', ctrl: false, shift: event.shiftKey });
      StoreUpload.mChangSelectedFile({ UploadID, ctrl: false, shift: event.shiftKey });
      if (IsUploading) topStopDown(false);
      else topStartDown(false);
    }
    return { selectedFiles, uploadingList, gUploadingCount, onSelectFile, onDoubleClick };
  },
});
</script>
<style></style>
