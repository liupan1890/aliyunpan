/* eslint-disable @typescript-eslint/ban-types */
<template>
  <q-dialog ref="dialogadr" persistent maximized no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="">
      <q-toolbar class="q-electron-drag non-selectable" style="min-height: 40px; margin-top: 2px">
        <q-toolbar-title class="text-h6 text-center">保存在线解压的文件</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 120px)" class="scroll dialogcardsection">
        <ZTree :nodes="nodes" :setting="setting" @onClick="onClick" @onCheck="onCheck" @onCreated="handleCreated" />
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px; align-items: flex-start">
        <div style="flex-grow: 1; line-height: 32px">{{ saveInfo }}</div>
        <q-btn :disable="fileloading || saveloading" dense outline color="primary" label="保存勾选的文件" style="padding: 0 12px" @click="onSaveFiles(false)"> </q-btn>
        <q-btn :disable="fileloading || saveloading" dense color="primary" label="保存全部文件" style="padding: 0 12px" @click="onSaveFiles(true)"> </q-btn>
      </q-card-actions>
      <q-inner-loading :showing="fileloading">
        <q-spinner-clock size="40px" color="primary"></q-spinner-clock>
        <br />
        <q-chip square label="正在列出文件..." />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted, PropType } from 'vue';
import { StoreUser } from 'src/store';
import { IZtreeNode, ILinkTxt, IStatePanFile, ITokenInfo, ILinkTxtFile } from 'src/store/models';
import { format, debounce, Dialog, Notify } from 'quasar';
import ZTree from 'sag-ztree-vue';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import SelectFolder from './SelectFolder.vue';
import AliArchive, { IArchiveData } from 'src/aliapi/archive';
import ServerHttp from 'src/aliapi/server';
import { ProtoPanFileInfo } from 'src/store/proto';
export default defineComponent({
  name: 'ArchiveDaoru',
  components: {
    ZTree,
  },
  methods: {
    show() {
      (this.$refs.dialogadr as any).show();
    },

    hide() {
      (this.$refs.dialogadr as any).hide();
    },
  },

  props: {
    file: {
      type: Object as PropType<IStatePanFile>,
      required: true,
    },
    data: {
      type: Object as PropType<IArchiveData>,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const saveInfo = ref('');
    const fileloading = ref(true);
    const saveloading = ref(false);
    const dialogadr = ref();

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
    const nodes = ref<IZtreeNode[]>([]);
    onMounted(() => {
      //
    });
    onUnmounted(() => {
      if (ZTreeObj) ZTreeObj.destroy();
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
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
    let timer: NodeJS.Timeout | undefined = undefined;
    if (props.data.state == 'Succeed') {
      fileloading.value = false;
      const treelist: IZtreeNode[] = [];
      let sizeinfo = { size: 0, dirCount: 0, fileCount: 0 };
      try {
        const file_list = Object.assign({}, props.data.file_list, { Name: props.file.name, Size: props.file.size });
        getDirSize(sizeinfo, treelist, [file_list]);
        Object.freeze(treelist);
        expandAll(treelist, sizeinfo.fileCount <= 500); 
        nodes.value = treelist; 
      } catch {}
      saveInfo.value = '包含 ' + sizeinfo.dirCount.toString() + '个文件夹，' + sizeinfo.fileCount.toString() + '个文件，共' + format.humanStorageSize(sizeinfo.size);
    } else {
      const token = Object.assign({}, StoreUser.tokeninfo);
      const func = () => {
        const buff = Buffer.from(props.file.info, 'base64');
        const info = (ProtoPanFileInfo.decode(buff) as any) || { domainid: '' };
        AliArchive.ApiArchiveStatus(props.file.drive_id, props.file.file_id, info.domainid || '', props.data.task_id, token)
          .then((data: IArchiveData) => {
            if (data.state == 'Succeed') {
              if (timer) clearTimeout(timer);
              fileloading.value = false;
              const treelist: IZtreeNode[] = [];
              let sizeinfo = { size: 0, dirCount: 0, fileCount: 0 };
              try {
                data.file_list.Name = props.file.name;
                data.file_list.Size = props.file.size;
                getDirSize(sizeinfo, treelist, [data.file_list]);
                Object.freeze(treelist);
                expandAll(treelist, sizeinfo.fileCount <= 500); 
                nodes.value = treelist; 
              } catch {}
              saveInfo.value = '包含 ' + sizeinfo.dirCount.toString() + '个文件夹，' + sizeinfo.fileCount.toString() + '个文件，共' + format.humanStorageSize(sizeinfo.size);
            } else if (data.state == 'Running') {
              if (timer) timer = setTimeout(func, 800);
            } else {
              fileloading.value = false;
              if (timer) clearTimeout(timer);
              NotifyError('列出压缩包内文件时出错 ' + data.state);
              if (dialogadr.value) dialogadr.value.hide(); 
            }
          })
          .catch(() => {
            if (timer) clearTimeout(timer);
          });
      };
      timer = setTimeout(func, 800);
    }
    function Uncompress(
      file_sha1: string,
      file_size: number,
      drive_id: string,
      file_id: string,
      domain_id: string,
      archive_type: string,
      target_drive_id: string,
      target_file_id: string,
      password: string,
      file_list: string[],
      token: ITokenInfo
    ) {
      AliArchive.ApiArchiveUncompress(drive_id, file_id, domain_id, archive_type, target_drive_id, target_file_id, password, file_list, token).then((data) => {
        if (data.state == 'Running') {
          const name = props.file.name;
          const notif = Notify.create({
            group: false,
            timeout: 0,
            spinner: true,
            position: 'bottom-right',
            classes: 'taskprogress',
            type: 'positive',
            message: '解压中[0] ' + name,
          });
          const task_id = data.task_id;
          let p = 0;
          const funpro = () => {
            p++;
            if (p > 99) p = 0;

            if (p > 8 && saveloading.value == true) {
              saveloading.value = false;
              NotifySuccess('操作成功!正在异步复制');
              if (dialogadr.value) {
                dialogadr.value.hide();
                dialogadr.value = undefined;
              }
            }
            notif({ timeout: 2500 });
            AliArchive.ApiArchiveStatus(drive_id, file_id, domain_id, task_id, token)
              .then((ap: IArchiveData) => {
                notif({
                  message: `解压中[${ap.progress == 0 ? p : ((ap.progress * 100 + p * 2) / 100.0).toFixed(1)}] ` + name,
                });
                if (ap.state === 'Succeed') {
                  ServerHttp.PostToServer({ cmd: 'PostZipPwd', sha1: file_sha1, size: file_size, password });
                  notif({
                    icon: 'iconfont iconcheck',
                    spinner: false,
                    message: '解压完成!',
                    timeout: 2500,
                  });
                  if (saveloading.value == true) {
                    saveloading.value = false;
                    NotifySuccess('操作成功!正在异步复制');
                    if (dialogadr.value) {
                      dialogadr.value.hide();
                      dialogadr.value = undefined;
                    }
                  }
                  clearTimeout(interval);
                } else if (ap.state == '密码错误') {
                  notif({ timeout: 10 });
                  const pwdp = new Promise<string>((resolve) => {
                    const pwddialog = Dialog.create({
                      title: '输入压缩包解压密码',
                      message: '这个压缩包是加密的压缩包，需要提供解压密码',
                      prompt: {
                        model: '',
                        isValid: (val: string) => val.length >= 1,
                        type: 'text',
                      },
                      persistent: true,
                      ok: {
                        label: '确定',
                      },
                      cancel: {
                        label: '取消',
                        flat: true,
                      },
                    })
                      .onOk((pwd: string) => {
                        resolve(pwd);
                      })
                      .onCancel(() => {
                        resolve('');
                      });
                    ServerHttp.PostToServer({ cmd: 'GetZipPwd', sha1: file_sha1, size: file_size }).then((serdata) => {
                      if (serdata.password) {
                        pwddialog.hide();
                        resolve(serdata.password);
                      }
                    });
                  });

                  pwdp.then((pwd: string) => {
                    if (pwd == '') return; 
                    Uncompress(file_sha1, file_size, drive_id, file_id, domain_id, archive_type, target_drive_id, target_file_id, pwd, file_list, token);
                  });
                } else if (ap.state != 'Running') {
                  notif({
                    icon: 'iconfont iconrstop',
                    spinner: false,
                    type: 'negative',
                    message: '解压操作失败!',
                    timeout: 3500,
                  });
                  clearTimeout(interval);
                } else {
                  interval = setTimeout(funpro, 1000);
                }
              })
              .catch(() => {
                console.log('catch');
                clearTimeout(interval);
                notif({ timeout: 10 });
              });
          };
          let interval = setTimeout(funpro, 1000);
        } else {
          saveloading.value = false;
          NotifyError('解压失败 ' + data.state);
        }
      });
    }
    function onSaveFiles(all: boolean) {
      Dialog.create({
        component: SelectFolder,
        componentProps: { dialogtitle: '选择文件保存的位置', dialogoktitle: '确认选择' },
      }).onOk((folder: { selectedKey: string }) => {
        if (folder.selectedKey == '') {
          return;
        }
        const parentid = folder.selectedKey;
        saveloading.value = true;

        const token = Object.assign({}, StoreUser.tokeninfo);
        const drive_id = props.file.drive_id;
        const file_id = props.file.file_id;
        const buff = Buffer.from(props.file.info, 'base64');
        const info = (ProtoPanFileInfo.decode(buff) as any) || { domainid: '' };
        const domain_id = info.domainid || '';

        const files: string[] = [];
        if (all == false) {
          const treedata = ZTreeObj.getNodes() as IZtreeNode[];
          const funcadd = (files: string[], treedata: IZtreeNode[]) => {
            for (let i = 0; i < treedata.length; i++) {
              const treeitem = treedata[i];
              if (treeitem.checked) {
                if (treeitem.isParent && treeitem.children && treeitem.children.length > 0) funcadd(files, treeitem.children);
                else files.push(treeitem.key);
              }
            }
          };
          funcadd(files, treedata);
        }
        Uncompress(props.file.sha1, props.file.size, drive_id, file_id, domain_id, props.file.ext, drive_id, parentid, props.password, files, token);
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

    return { dialogadr, saveInfo, saveloading, fileloading, setting, nodes, onSaveFiles, onClick, onCheck, handleCreated };
  },
});
</script>
<style></style>
