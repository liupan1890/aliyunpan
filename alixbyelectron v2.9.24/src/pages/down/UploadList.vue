<template>
  <RecycleScroller id="DownRightUDFileList" class="scroller DownRightFileList" :items="uploadedList.list" :item-size="50" key-field="UploadID" page-mode>
    <template v-slot="{ item, index }">
      <div class="downitem" :class="selected == item.UploadID ? 'selected' : ''" @click="onSelectFile(item, 'select')">
        <div class="fileicon ml" :title="index">
          <i class="q-icon" :class="item.Info.icon" aria-hidden="true" role="img"></i>
        </div>
        <div class="filename">
          <div :title="item.Info.localFilePath">
            {{ item.Info.name }}
          </div>
        </div>

        <div class="filesize">{{ item.Info.sizestr }}</div>
        <div class="filebtn2">
          <q-btn v-show="!item.Info.isMiaoChuan" flat dense color="primary" icon="iconfont iconwenjian" @click="onSelectFile(item, 'file')">
            <q-tooltip>打开文件</q-tooltip>
          </q-btn>
          <q-btn v-show="!item.Info.isMiaoChuan" flat dense color="primary" icon="iconfont iconfolder" @click="onSelectFile(item, 'dir')">
            <q-tooltip>打开所在位置</q-tooltip>
          </q-btn>
          <q-btn flat dense color="primary" icon="iconfont icondelete" @click="onSelectFile(item, 'delete')">
            <q-tooltip>删除记录</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>
    <template #after>
      <div class="downHideTip" v-if="gUploadedCount < 1">
        <div style="margin-top: 20%"></div>
        <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
        <br />没有上传过任何文件?
      </div>
    </template>
  </RecycleScroller>
</template>

<script lang="ts">
import { StoreUpload } from 'src/store';
import { IStateUploadFile } from 'src/store/models';
import { defineComponent, ref, computed, watch, reactive } from 'vue';
import { topDeleteUploaded } from './down';
import { NotifyError } from 'src/aliapi/notify';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
const fs = window.require('fs');
export default defineComponent({
  name: 'UploadedList',
  components: { RecycleScroller },
  setup() {
    const selected = ref('');
    const changUploadedTime = computed(() => StoreUpload.changUploadedTime);
    const gUploadedCount = ref(StoreUpload.gUploadedCount());
    const uploadedList = reactive({ list: StoreUpload.gUploadedList() });
    watch(changUploadedTime, () => {
      const UploadedList = StoreUpload.gUploadedList();
      gUploadedCount.value = UploadedList.length;
      const dlist = [...UploadedList];
      Object.freeze(dlist);
      uploadedList.list = dlist;
    });

    function onSelectFile(file: IStateUploadFile, cmd: string) {
      selected.value = file.UploadID;
      if (cmd == 'file') {
        const full = file.Info.localFilePath;
        try {
          if (fs.existsSync(full)) {
            window.electron.shell.openPath(full);
          } else {
            NotifyError('文件可能已经被删除');
          }
        } catch {}
      }
      if (cmd == 'dir') {
        const full = file.Info.localFilePath;
        try {
          if (fs.existsSync(full)) {
            window.electron.shell.showItemInFolder(file.Info.localFilePath);
          } else {
            NotifyError('文件夹可能已经被删除');
          }
        } catch {}
      }
      if (cmd == 'delete') {
        topDeleteUploaded(file.UploadID);
      }
    }
    return { selected, uploadedList, gUploadedCount, onSelectFile };
  },
});
</script>
<style></style>
