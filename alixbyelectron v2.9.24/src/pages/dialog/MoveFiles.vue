<template>
  <q-dialog ref="dialogmvf" persistent no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="height: 80vh; max-height: 600px; width: 80vw; max-width: 680px">
      <q-toolbar class="non-selectable" style="min-height: 40px">
        <q-toolbar-title class="text-h6 text-center">批量{{ Name }}文件/文件夹</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 100px)" class="scroll dialogcardsection">
        <q-tree id="dialogtreedom" ref="treedom" :nodes="tree" node-key="key" label-key="label" icon="iconfont" selected-color="primary" v-model:selected="selectedKey">
          <template v-slot:default-header="prop">
            <i :id="'tree-' + prop.node.key" class="iconfont iconfolder q-icon q-tree__icon q-mr-sm" aria-hidden="true" role="presentation"> </i>
            <div class="q-tree__label" :class="fileColor.get(prop.node.key)">{{ prop.node.label }}</div>
          </template>
        </q-tree>
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px">
        <q-btn dense flat color="primary" label="刷新目录" style="padding: 0 12px" :loading="rootloading" @click="onRefreshTree"> </q-btn>
        <div style="flex-grow: 1"></div>
        <q-btn-dropdown outline dense split label="新建文件夹　" @click="menuCreatNewDir(selectedKey, '')" dropdown-icon="iconfont icondown">
          <q-list>
            <q-item clickable v-close-popup @click="menuCreatNewDir(selectedKey, 'time')">
              <q-item-section>
                <q-item-label>新建日期文件夹</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn dense color="primary" :label="Name + '到选中位置'" style="padding: 0 12px" @click="onMoveFiles"> </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { SQL, StoreRoot, StoreUI, StoreUser } from 'src/store';
import { menuCreatNewDir } from 'src/pages/pan/filemenu';
import AliFile from 'src/aliapi/file';
import { Notify } from 'quasar';
import { NotifyError } from 'src/aliapi/notify';
import { IStateTreeItem } from 'src/store/models';
export default defineComponent({
  name: 'MoveFiles',
  methods: {
    show() {
      (this.$refs.dialogmvf as any).show();
    },

    hide() {
      (this.$refs.dialogmvf as any).hide();
    },

    onOKClick() {
      this.$emit('ok');
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },
  },
  data: function () {
    return {
      filename: '',
    };
  },

  props: {
    istree: {
      type: Boolean,
      required: true,
    },
    ismove: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const Name = ref(props.ismove ? '移动' : '复制');
    const selectedKey = ref('');
    const dialogmvf = ref();
    const treedom = ref();
    const rootloading = ref(false);
    const refreshDirTreeTime = computed(() => StoreRoot.refreshDirTreeTime);
    const tree = ref<IStateTreeItem[]>(StoreRoot.gShowDirTree());
    const fileColor = computed(() => StoreUI.fileColor);
    watch(refreshDirTreeTime, () => {
      tree.value = StoreRoot.gShowDirTree();
      setTimeout(() => {
        try {
          if (treedom.value && selectedKey.value != '') treedom.value.setExpanded(selectedKey.value, true);
        } catch {}
      }, 200);
    });

    watch(selectedKey, (newval) => {
      setTimeout(() => {
        try {
          if (treedom.value && newval != '') treedom.value.setExpanded(newval, true);
        } catch {}
      }, 200);
    });

    onMounted(() => {
      let key = localStorage.getItem('MoveFiles');
      if (!key) key = 'root';
      selectedKey.value = key;
      setTimeout(() => {
        try {
          if (treedom.value) treedom.value.setExpanded('root', true);
          if (treedom.value && selectedKey.value != '') {
            const list = StoreRoot.gFileFullPathID(selectedKey.value); 
            for (let i = 0; i < list.length; i++) {
              treedom.value.setExpanded(list[i], true);
            }
          }
        } catch {}
      }, 1000);
    });

    async function onMoveFiles() {
      localStorage.setItem('MoveFiles', selectedKey.value);

      if (!StoreUser.tokeninfo.user_id) {
        NotifyError('用户token错误');
        return;
      }
      const token = Object.assign({}, StoreUser.tokeninfo);
      const drive_id = token.default_drive_id;
      let parentid = '';
      let files = [];
      let names = [];
      if (props.istree) {
        parentid = StoreRoot.showDir.parent_file_id;
        files = [StoreRoot.showDir.file_id];
        names = [StoreRoot.showDir.name];
      } else {
        parentid = StoreRoot.showDir.file_id;
        const sf = StoreRoot.gSelectedFiles;
        for (let s = 0; s < sf.length; s++) {
          files.push(sf[s].file_id);
          names.push(sf[s].name);
        }
      }
      if (!files || files.length == 0) {
        NotifyError('没有选择要' + Name.value + '的文件/文件夹');
        return;
      }

      const moveto_drive_id = token.default_drive_id;
      if (!moveto_drive_id || moveto_drive_id == '') {
        NotifyError('用户drive_id错误');
        return;
      }
      const moveto_dir_id = selectedKey.value;
      if (!moveto_dir_id || moveto_dir_id == '') {
        NotifyError('没有选择要' + Name.value + '到的文件夹');
        return;
      }
      if (!moveto_dir_id || moveto_dir_id == '') {
        NotifyError('没有选择要' + Name.value + '到的文件夹');
        return;
      }
      if (parentid == moveto_dir_id) {
        NotifyError('不能' + Name.value + '到原位置');
        return;
      }
      let count = 0;
      if (props.ismove) {
        count = await AliFile.ApiMoveBatch(drive_id, files, moveto_drive_id, moveto_dir_id, token);
        if (count == files.length) {
          StoreRoot.mDeleteFiles({ parentid, files }); 
          await SQL.DeleteFiles(token.user_id, drive_id, parentid, files);
          StoreRoot.aRefreshDirSize(parentid);
        } else {
          StoreRoot.mClearSelectedFile(); 
          StoreRoot.aReLoadDir({ dir_id: StoreRoot.showDir.file_id, deletecache: true });
        }
        StoreRoot.selectedFiles;
      } else {
        count = await AliFile.ApiCopyBatch(drive_id, files, names, moveto_drive_id, moveto_dir_id, token);
      }
      StoreRoot.mClearSelectedFile(); 
      StoreRoot.aReLoadDir({ dir_id: moveto_dir_id, deletecache: true });
      Notify.create({
        icon: count >= files.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
        type: count >= files.length ? 'positive' : 'negative',
        message: Name.value + '文件 成功 ' + count.toString() + '个' + (count < files.length ? ' 失败 ' + (files.length - count).toString() + ' 个(空间不足?有重名?)' : ''),
      });

      if (dialogmvf.value) dialogmvf.value.hide();
    }
    async function onRefreshTree() {
      treedom.value.setExpanded('root', false);
      rootloading.value = true;
      await StoreRoot.aRefreshAllDirList();
      rootloading.value = false;
      treedom.value.setExpanded('root', true);
    }

    return { dialogmvf, treedom, rootloading, tree, fileColor, selectedKey, Name, menuCreatNewDir, onMoveFiles, onRefreshTree };
  },
});
</script>
<style>
#dialogtreedom {
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
}
#dialogtreedom .q-tree__label {
  width: calc(100% - 21px);
  max-width: calc(100% - 21px);
  text-overflow: ellipsis;
  overflow: hidden;
}
#dialogtreedom .q-tree__children .q-tree__node-header {
  max-width: 100%;
  text-overflow: ellipsis;
}
.taskprogress {
  min-height: 24px !important;
  padding: 0 8px !important;
  overflow: hidden;
}
.taskprogress .q-notification__spinner {
  font-size: 24px !important;
  width: 24px !important;
  height: 24px !important;
}
.taskprogress .q-notification__message {
  padding: 4px 0 !important;
}
.q-btn-dropdown--split .q-btn-dropdown__arrow-container.q-btn {
  min-width: 16px !important;
  padding: 0 !important;
}
.q-card__actions .q-btn-group .q-btn--dense {
  font-size: 14px;
  padding: 0 8px;
}
</style>
