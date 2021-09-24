<template>
  <q-dialog ref="dialogfd" no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="height: 80vh; max-height: 500px; width: 80vw; max-width: 400px">
      <q-toolbar class="q-electron-drag non-selectable" style="min-height: 40px">
        <q-toolbar-title class="text-h6 text-center">详细信息</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 50px); padding: 4px; margin: 0 16px" class="scroll">
        <div class="detail">
          <div class="detailfilename"><span>文件名</span>{{ filename }}</div>
          <div class="detailfilepath" v-html="filepath"></div>
          <div v-if="isdir" class="detailfileinfo">
            <span>包含</span><q-spinner-hourglass v-if="fileloading" color="primary" size="18px" />{{ fileinfo }}
            <p v-html="fileinfo2"></p>
          </div>
          <div>
            <q-input standout v-model="filetype" readonly dense class="desc">
              <template v-slot:before><span>文件类型</span> </template>
            </q-input>
          </div>
          <div>
            <q-input standout v-model="filesize" readonly dense class="desc">
              <template v-slot:before><span>大小</span> </template>
              <template v-slot:append>
                <q-spinner-hourglass v-if="fileloading" color="primary" size="18px" />
              </template>
            </q-input>
          </div>
          <div>
            <q-input standout v-model="fileupdate" readonly dense class="desc">
              <template v-slot:before><span>修改时间</span> </template>
            </q-input>
          </div>
          <div v-if="isdir" style="text-align: center; margin-top: 16px">
            <q-btn :disable="fileloading" dense color="primary" @click="onRefresh" style="width: 120px">
              刷新缓存
              <q-tooltip> 有时可能因为本地缓存导致文件夹体积不准确，可以刷新更新准确的文件夹体积 </q-tooltip>
            </q-btn>
          </div>
          <div v-else style="text-align: center; margin-top: 16px">
            <q-btn dense :loading="urlLoading" color="primary" @click="onUrlCheck" style="width: 120px">
              复制下载链接
              <q-tooltip> 阿里云盘官方限制，不能直接粘贴到浏览器下载<br />下载软件下载时必须填写 Referer=https://www.aliyundrive.com/ 的http头<br />IDM可以在创建下载任务时添加Referer </q-tooltip>
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Loading...
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import { SQL, StoreRoot, StoreUI, StoreUser } from 'src/store';
import { format, copyToClipboard } from 'quasar';
import AliFile from 'src/aliapi/file';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import { ProtoPanFileInfo } from 'src/store/proto';

export default defineComponent({
  name: 'FilesDetail',
  methods: {
    show() {
      (this.$refs.dialogfd as any).show();
    },

    hide() {
      (this.$refs.dialogfd as any).hide();
    },
  },

  props: {
    istree: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const dir_id = StoreRoot.showDir.file_id;
    let info = { ispan: StoreUI.gIsPanPage, file_id: '', parent_file_id: '', name: '', sizestr: '', isDir: false, isvideo: false, timestr: '', file_extension: '', width: 0, height: 0, duration: 0 };

    if (props.istree) {
      info.file_id = StoreRoot.showDir.file_id;
      info.parent_file_id = StoreRoot.showDir.parent_file_id;
      info.name = StoreRoot.showDir.name;
      info.isDir = true;
      info.isvideo = false;
      info.timestr = StoreRoot.showDir.timestr;
      info.sizestr = StoreRoot.showDir.sizestr;
    } else {
      const file = StoreRoot.gSelectedFileFirst;
      if (file) {
        const buff = Buffer.from(file.info, 'base64');
        const fileinfo = (ProtoPanFileInfo.decode(buff) as any) || { isvideo: false };

        info.file_id = file.file_id;
        info.parent_file_id = file.parent_file_id;
        info.name = file.name;
        info.isDir = file.isDir;
        info.isvideo = fileinfo.isvideo;
        info.sizestr = file.sizestr;
        info.width = file.width;
        info.height = file.height;
        info.duration = file.duration;
        info.timestr = file.timestr;
        info.file_extension = file.ext;
      }
    }

    const dialogfd = ref();
    const isdir = ref(info.isDir);
    const isvideo = ref(info.isvideo);
    const filename = ref(info.name);
    const filesize = ref(info.sizestr);
    const filetype = ref(info.isDir ? '文件夹' : info.file_extension);

    if (info.width > 0) filetype.value += '  分辨率:' + info.width.toString() + 'x' + info.height.toString();
    if (info.duration > 0)
      filetype.value +=
        '  时长:' +
        Math.floor(info.duration / 3600)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor((info.duration % 3600) / 60)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor(info.duration % 60)
          .toString()
          .padStart(2, '0');
    const fileupdate = ref(info.timestr);
    const filepath = ref('<span>位置</span>');
    const fileinfo = ref('');
    const fileinfo2 = ref('');
    const fileurl = ref('');
    const fileloading = ref(false);
    const urlLoading = ref(false);

    let path = StoreRoot.gFileFullPathName(info.parent_file_id);
    let path2 = '<span>位置</span>' + (info.ispan ? '网盘' : '相册');
    for (let i = 0; i < path.length; i++) {
      path2 += ' <b>/</b> ' + path[i];
    }
    filepath.value = path2;

    async function getDirSize(user_id: string, drive_id: string, sizeinfo: { size: number; dirCount: number; fileCount: number; isloading: boolean; ext: Map<string, number> }, files: string[]) {
      for (let n = 0; n < files.length; n++) {
        const items = await SQL.GetFileByDir(user_id, drive_id, files[n]);
        if (items == undefined || items.loading == 1629795158000) {
          sizeinfo.isloading = true;
        } else {
          const dirlist = [];
          for (let i = 0; i < items.filelist.length; i++) {
            const item = items.filelist[i];
            if (items.filelist[i].isDir) {
              sizeinfo.dirCount++;
              dirlist.push(item.file_id);
            } else {
              sizeinfo.fileCount++;
              sizeinfo.size += item.size;
              let ext = sizeinfo.ext.get(item.ext);
              if (ext) sizeinfo.ext.set(item.ext, ext + 1);
              else sizeinfo.ext.set(item.ext, 1);
            }
          }
          await getDirSize(user_id, drive_id, sizeinfo, dirlist);
        }
      }
    }
    const user_id = StoreRoot.user_id;
    const drive_id = StoreRoot.drive_id;
    let timer: NodeJS.Timeout | undefined = undefined;
    const func = () => {
      if (isdir.value == false) return;
      if (dir_id == 'trash') return;
      let sizeinfo = { size: 0, dirCount: 0, fileCount: 0, isloading: false, ext: new Map() };

      getDirSize(user_id, drive_id, sizeinfo, [info.file_id]).then(() => {
        let infostr = (sizeinfo.dirCount > 0 ? sizeinfo.dirCount.toString() + '个子文件夹,' : '') + sizeinfo.fileCount.toString() + '个文件    ';
        let infostr2 = '';
        for (const [key, value] of sizeinfo.ext) {
          infostr2 += '<span class="detailfileextcount">' + key + ':  ' + value.toString() + '</span> ';
        }
        fileinfo.value = infostr;
        fileinfo2.value = infostr2;
        filesize.value = format.humanStorageSize(sizeinfo.size);
        fileloading.value = sizeinfo.isloading;
        if (sizeinfo.isloading) timer = setTimeout(func, 1000);
      });
    };
    timer = setTimeout(func, 1000);

    if (isdir.value && dir_id != 'trash') {
      StoreRoot.aDirDetail(info.file_id); 
      fileloading.value = true;
    }

    onUnmounted(() => {
      isdir.value = false;
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    });

    function onUrlCheck() {
      if (dir_id == 'trash') {
        NotifyError('复制失败!回收站内文件不能下载');
        return;
      }

      const token = Object.assign({}, StoreUser.tokeninfo);
      const isfrompan = StoreUI.gIsPanPage;
      urlLoading.value = true;
      AliFile.ApiFileDownloadUrl(isfrompan ? 'pan' : 'pic', info.file_id, 14000, token).then((data) => {
        urlLoading.value = false;
        if (typeof data !== 'string') {
          copyToClipboard(data.url)
            .then(() => {
              NotifySuccess('下载地址已复制到剪切板');
            })
            .catch(() => {
              NotifyError('复制失败');
            });
        } else {
          NotifyError('生成下载地址失败' + data);
        }
      });
    }

    async function onRefresh() {
      if (dir_id == 'trash') {
        NotifyError('刷新失败!回收站内文件不能刷新缓存');
        return;
      }
      const fulllist = await SQL.GetAllChildDir(user_id, drive_id, info.file_id);
      SQL.DeleteDirLoading(user_id, drive_id, fulllist).then(() => {
        StoreRoot.aDirDetail(info.file_id); 
        fileloading.value = true;
        timer = setTimeout(func, 1000);
      });
    }
    return { dialogfd, isdir, isvideo, filename, filesize, filetype, fileupdate, filepath, fileinfo, fileinfo2, fileurl, fileloading, urlLoading, onUrlCheck, onRefresh };
  },
});
</script>
<style>
.detail .q-field--filled .q-field__control:before {
  border: none !important;
}

.detail .desc {
  margin: 8px 0;
}
.detail .q-field__before span,
.detail > div > span {
  font-size: 14px;
  display: inline-block;
  text-align: right;
  min-width: 56px;
  color: rgba(0, 0, 0, 0.54);
}
.detail > div > span {
  min-width: 44px;
  margin-right: 18px;
}
.detail > div > b {
  color: var(--q-primary) !important;
  user-select: text;
}
.detail .desc .q-field__native {
  line-height: 18px;
  letter-spacing: 0.00937em;
  border: none;
  border-radius: 0;
  background: none;
}
.q-field--dense.desc,
.desc .q-field__control,
.desc .q-field__before,
.desc .q-field__append {
  height: 26px !important;
  min-height: 26px !important;
}

.detailfilename,
.detailfilepath,
.detailfileinfo {
  line-height: 18px;
  width: 100%;
  letter-spacing: 1px;
  padding: 12px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px 4px 0 0;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: text;
}
.detailfileextcount {
  display: inline-block;
  min-width: 100px;
}
</style>
