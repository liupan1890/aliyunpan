<template>
  <RecycleScroller id="DownRightDDFileList" class="scroller DownRightFileList" :items="downedList.list" :item-size="50" key-field="DownID" page-mode>
    <template v-slot="{ item, index }">
      <div class="downitem" :class="selected == item.DownID ? 'selected' : ''" @click="onSelectFile(item, 'select')">
        <div class="fileicon ml" :title="index">
          <i class="q-icon iconfont" :class="item.Info.icon" aria-hidden="true" role="img"></i>
        </div>
        <div class="filename">
          <div :title="item.Info.DownSavePath">
            {{ item.Info.name }}
          </div>
        </div>

        <div class="filesize">{{ item.Info.sizestr }}</div>
        <div class="filebtn2">
          <q-btn v-show="!item.Info.ariaRemote" flat dense color="primary" icon="iconfont iconwenjian" @click="onSelectFile(item, 'file')">
            <q-tooltip>打开文件</q-tooltip>
          </q-btn>
          <q-btn v-show="!item.Info.ariaRemote" flat dense color="primary" icon="iconfont iconfolder" @click="onSelectFile(item, 'dir')">
            <q-tooltip>打开所在位置</q-tooltip>
          </q-btn>
          <q-btn flat dense color="primary" icon="iconfont icondelete" @click="onSelectFile(item, 'delete')">
            <q-tooltip>删除记录</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>
    <template #after>
      <div class="downHideTip" v-if="gDownedCount < 1">
        <div style="margin-top: 20%"></div>
        <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
        <br />没有下载过任何文件?
      </div>
    </template>
  </RecycleScroller>
</template>

<script lang="ts">
import { StoreDown } from 'src/store';
import { IStateDownFile } from 'src/store/models';
import { defineComponent, ref, computed, watch, reactive } from 'vue';
import { topDeleteDowned } from './down';
import path from 'path';
import { NotifyError } from 'src/aliapi/notify';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
const fs = window.require('fs');
export default defineComponent({
  name: 'DownedList',
  components: { RecycleScroller },
  setup() {
    const selected = ref('');
    const changDownedTime = computed(() => StoreDown.changDownedTime);
    const gDownedCount = ref(StoreDown.gDownedCount());
    const downedList = reactive({ list: StoreDown.gDownedList() });
    watch(changDownedTime, () => {
      const DownedList = StoreDown.gDownedList();
      gDownedCount.value = DownedList.length;
      const dlist = [...DownedList];
      Object.freeze(dlist);
      downedList.list = dlist;
    });

    function onSelectFile(file: IStateDownFile, cmd: string) {
      selected.value = file.DownID;
      if (cmd == 'file') {
        if (file.Info.ariaRemote) {
          NotifyError('文件在远程Aria服务器上，不能在本地打开');
          return;
        }
        const full = path.join(file.Info.DownSavePath, file.Info.name);
        try {
          if (fs.existsSync(full)) {
            window.electron.shell.openPath(full);
          } else {
            NotifyError('文件可能已经被删除');
          }
        } catch {}
      }
      if (cmd == 'dir') {
        if (file.Info.ariaRemote) {
          NotifyError('文件在远程Aria服务器上，不能在本地打开');
          return;
        }
        const full = file.Info.DownSavePath;
        try {
          if (fs.existsSync(full)) {
            window.electron.shell.showItemInFolder(path.join(file.Info.DownSavePath, file.Info.name));
          } else {
            NotifyError('文件夹可能已经被删除');
          }
        } catch {}
      }
      if (cmd == 'delete') {
        topDeleteDowned(file.DownID);
      }
    }

    return { selected, downedList, gDownedCount, onSelectFile };
  },
});
</script>
<style>
.filebtn2 {
  margin: 0 8px 0 0;
  flex-shrink: 0;
  flex-grow: 0;
  width: 120px;
  text-align: right;
}
.filebtn2 .q-btn {
  margin: 4px;
}
</style>
