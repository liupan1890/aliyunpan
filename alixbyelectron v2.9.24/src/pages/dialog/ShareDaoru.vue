/* eslint-disable @typescript-eslint/ban-types */
<template>
  <q-dialog ref="dialogsdr" persistent maximized no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="">
      <q-toolbar class="q-electron-drag non-selectable" style="min-height: 40px; margin-top: 2px">
        <q-toolbar-title class="text-h6 text-center">导入阿里云盘分享链接里的文件</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 120px)" class="scroll dialogcardsection">
        <ZTree :nodes="nodes" :setting="setting" @onClick="onClick" @onCheck="onCheck" @onCreated="handleCreated" />
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px; align-items: flex-start">
        <div style="flex-grow: 1; line-height: 32px">{{ saveInfo }}</div>
        <q-btn dense outline disable color="primary" label="导入勾选的文件" style="padding: 0 12px" :loading="saveloading" @click="onSaveFiles" title="下个版本实现"> </q-btn>
        <q-btn dense color="primary" label="导入全部文件" style="padding: 0 12px" :loading="saveloading" @click="onSaveFiles"> </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted, PropType } from 'vue';
import { StoreUser } from 'src/store';
import { IZtreeNode, ILinkTxt, ILinkTxtFile } from 'src/store/models';
import { format, debounce, Dialog } from 'quasar';
import ZTree from 'sag-ztree-vue';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import ShareAli from 'src/aliapi/shareali';
import SelectFolder from './SelectFolder.vue';
export default defineComponent({
  name: 'ShareDaoru',
  components: {
    ZTree,
  },
  methods: {
    show() {
      (this.$refs.dialogsdr as any).show();
    },

    hide() {
      (this.$refs.dialogsdr as any).hide();
    },
  },

  props: {
    shareid: {
      type: String,
      required: true,
    },
    sharetoken: {
      type: String,
      required: true,
    },
    linkdata: {
      type: Object as PropType<ILinkTxt>,
      required: true,
    },
  },
  setup(props) {
    const saveInfo = ref('');
    const saveloading = ref(false);
    const shareChecked = ref(false);
    const dialogsdr = ref();

    const setting = ref({ check: { enable: true }, data: { simpleData: { enable: false } }, view: { showIcon: true, selectedMulti: false, dblClickExpand: false } });

    function getDirSize(sizeinfo: { size: number; dirCount: number; fileCount: number }, treedata: IZtreeNode[], LinkList: ILinkTxt[]) {
      for (let n = 0; n < LinkList.length; n++) {
        const item = LinkList[n];
        const children: IZtreeNode[] = [];
        getDirSize(sizeinfo, children, item.DirList);
        sizeinfo.dirCount += item.DirList.length;
        sizeinfo.fileCount += item.FileList.length;
        for (let d = 0; d < item.FileList.length; d++) {
          let fitem = item.FileList[d] as ILinkTxtFile;
          sizeinfo.size += fitem.Size;
          children.push({
            key: fitem.Key,
            name: fitem.Name + '　 - ' + format.humanStorageSize(fitem.Size),
            filename: fitem.Name,
            filesha1: '',
            iconSkin: 'iconfont iconwenjian f',
            open: false,
            checked: true,
            isParent: false,
            size: fitem.Size,
          });
        }
        treedata.push({
          key: item.Key || '',
          name: item.Name,
          filename: item.Name,
          filesha1: '',
          iconSkin: 'iconfont iconfolder f',
          open: false,
          checked: true,
          isParent: true,
          size: 0,
          children,
        });
      }
    }
    let treelist: IZtreeNode[] = [];
    let sizeinfo = { size: 0, dirCount: 0, fileCount: 0 };
    try {
      getDirSize(sizeinfo, treelist, [props.linkdata]);
      if (treelist.length > 0 && treelist[0].children) treelist = treelist[0].children; 
    } catch {}
    Object.freeze(treelist);

    saveInfo.value = '包含 ' + sizeinfo.dirCount.toString() + '个文件夹，' + sizeinfo.fileCount.toString() + '个文件，共' + format.humanStorageSize(sizeinfo.size);
    expandAll(treelist, sizeinfo.fileCount <= 500); 
    const nodes = ref<IZtreeNode[]>(treelist);
    onMounted(() => {
      //
    });
    onUnmounted(() => {
      if (ZTreeObj) ZTreeObj.destroy();
    });
    function expandAll(treedata: IZtreeNode[] | undefined, all: boolean) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].isParent) {
          treedata[i].open = true;
          if (all) expandAll(treedata[i].children, all);
        }
      }
    }

    function onSaveFiles() {
      Dialog.create({
        component: SelectFolder,
        componentProps: { dialogtitle: '选择文件保存的位置', dialogoktitle: '确认选择' },
      }).onOk((folder: { selectedKey: string }) => {
        if (folder.selectedKey == '') {
          return;
        }
        const parentid = folder.selectedKey;
        saveloading.value = true;

        const treedata = ZTreeObj.getNodes() as IZtreeNode[];
        const token = Object.assign({}, StoreUser.tokeninfo);
        const drive_id = token.default_drive_id;
        token.share_token = props.sharetoken;
        const files: string[] = [];
        for (let i = 0; i < treedata.length; i++) {
          files.push(treedata[i].key);
        }
        ShareAli.ApiSaveShareFilesBatch(props.shareid, drive_id, parentid, files, token).then((data) => {
          saveloading.value = false;
          if (data == 'success' || data == 'async') {
            if (data == 'success') {
              NotifySuccess('保存文件成功');
            } else {
              NotifySuccess('保存文件成功!因文件较多正在异步复制，请稍后手动刷新文件夹');
            }
            if (dialogsdr.value) dialogsdr.value.hide();
          } else {
            if (data == 'error') NotifyError('保存文件时出错，请重试');
            else NotifyError('保存文件时出错，' + data);
          }
        });
      });
    }

    function refreshSize(treedata: IZtreeNode[] | undefined, info: { size: number; fileCount: number; dirCount: number }) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].checked) {
          if (treedata[i].isParent) {
            info.dirCount++;
            refreshSize(treedata[i].children, info);
          } else {
            info.fileCount++;
            info.size += treedata[i].size;
          }
        }
      }
    }

    const onRefreshSize = debounce(() => {
      const nodes = ZTreeObj.getNodes() as IZtreeNode[];
      const info = { size: 0, fileCount: 0, dirCount: 0 };
      refreshSize(nodes, info);
      saveInfo.value = '包含 ' + info.dirCount.toString() + '个文件夹，' + info.fileCount.toString() + '个文件，共' + format.humanStorageSize(info.size);
    }, 1000);
    function onCheck(_evt: any, _treeId: string, _treeNode: any) {
      onRefreshSize();
    }
    function onClick(_evt: any, _treeId: string, treeNode: any) {
      if (treeNode.isParent && ZTreeObj) ZTreeObj.expandNode(treeNode);
    }

    let ZTreeObj: any | undefined = undefined;
    function handleCreated(ztreeObj: any) {
      ZTreeObj = ztreeObj;
    }

    return { dialogsdr, saveInfo, saveloading, setting, nodes, shareChecked, onSaveFiles, onClick, onCheck, handleCreated };
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
  padding-left: 2px;
}
#dialogtreedom .q-tree__children .q-tree__node-header {
  max-width: 100%;
  text-overflow: ellipsis;
}

#dialogtreedom .q-checkbox__bg {
  border: 1px solid #637dff;
  left: 10%;
  top: 10%;
  width: 80%;
  height: 80%;
}
#dialogtreedom .q-checkbox__inner--truthy .q-checkbox__bg,
#dialogtreedom .q-checkbox__inner--indet .q-checkbox__bg {
  background: #637dff;
}

#dialogtreedom .iconfont.q-tree__icon {
  font-size: 19px;
  padding: 1px;
}

.ztree .button.iconfont {
  font-size: 18px;
}
.ztree .button.iconfont::before {
  top: -2px;
  position: relative;
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

.miaochuansavename {
  flex-grow: 1;
  height: unset !important;
}
.miaochuansavename .q-field__control {
  height: unset !important;
}

.shareChecked {
  margin-right: 16px;
}
.shareChecked .q-checkbox__inner {
  font-size: 32px;
}
</style>
