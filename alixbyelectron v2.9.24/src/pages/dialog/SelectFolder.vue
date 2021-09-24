<template>
  <q-dialog ref="dialogsf" persistent no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="height: 80vh; max-height: 600px; width: 80vw; max-width: 680px">
      <q-toolbar class="non-selectable" style="min-height: 40px">
        <q-toolbar-title class="text-h6 text-center">{{ $props.dialogtitle }}</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup title="关闭" />
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
        <q-btn-dropdown outline dense split label="新建文件夹　" :disable="rootloading" @click="menuCreatNewDir(selectedKey, '')" dropdown-icon="iconfont icondown">
          <q-list>
            <q-item clickable v-close-popup @click="menuCreatNewDir(selectedKey, 'time')">
              <q-item-section>
                <q-item-label>新建日期文件夹</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn dense color="primary" :label="$props.dialogoktitle" style="padding: 0 12px" :disable="rootloading" @click="onMoveFiles"> </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { StoreRoot, StoreUI } from 'src/store';
import { menuCreatNewDir } from 'src/pages/pan/filemenu';
import { NotifyError } from 'src/aliapi/notify';
import { IStateTreeItem } from 'src/store/models';
export default defineComponent({
  name: 'SelectFolder',
  methods: {
    show() {
      (this.$refs.dialogsf as any).show();
    },

    hide() {
      (this.$refs.dialogsf as any).$emit('ok', { selectedKey: '' });
      (this.$refs.dialogsf as any).hide();
    },
  },
  props: {
    parentid: String,

    dialogtitle: {
      type: String,
      required: true,
    },
    dialogoktitle: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const selectedKey = ref('');
    const dialogsf = ref();
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
      if (props.parentid) key = props.parentid;
      if (!key || key == '') key = 'root';
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
      }, 500);
    });

    function onMoveFiles() {
      const moveto_dir_id = selectedKey.value;
      if (!moveto_dir_id || moveto_dir_id == '') {
        NotifyError('没有选择任何文件夹');
        return;
      }
      localStorage.setItem('MoveFiles', selectedKey.value);
      dialogsf.value.$emit('ok', { selectedKey: selectedKey.value });
      dialogsf.value.hide();
    }

    async function onRefreshTree() {
      treedom.value.setExpanded('root', false);
      rootloading.value = true;
      await StoreRoot.aRefreshAllDirList();
      rootloading.value = false;
      treedom.value.setExpanded('root', true);
    }

    return { dialogsf, treedom, tree, fileColor, selectedKey, rootloading, menuCreatNewDir, onMoveFiles, onRefreshTree };
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

.q-btn-dropdown--split .q-btn--outline:before,
.q-btn-dropdown--split .q-btn-dropdown__arrow-container.q-btn--outline {
  border-color: rgba(0, 0, 0, 0.24);
}
</style>
