<template>
  <div id="PanRightTop" tabindex="1">
    <div class="toppannav">
      <div class="toppannavitem" v-for="item in showDirPath" :key="item[0]" @click="GoToPath(item[0])">
        {{ item[1] }}
      </div>
    </div>
    <div class="RightTop">
      <div v-if="isFavor">
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconsync" size="md" label="刷新" @click="menuRefreshFile(false)" />
          <q-btn :disable="gSelectedFilesCount < 1" outline icon="iconfont iconcrown2" size="md" label="取消收藏" @click="topUnFavSelectFile()" />
          <q-btn outline icon="iconfont iconcrown2" size="md" label="清空收藏夹" @click="topUnFavClear()" />
        </q-btn-group>
      </div>
      <div v-else-if="isTrash">
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconsync" size="md" label="刷新" @click="menuRefreshFile(false)" />
          <q-btn :disable="gSelectedFilesCount < 1" outline icon="iconfont iconrecover" size="md" label="恢复" @click="topRestoreSelectFile()" />
          <q-btn :disable="gSelectedFilesCount < 1" outline icon="iconfont icondelete" size="md" label="彻底删除" @click="topTrashDeleteSelectFile()">
            <q-tooltip>删除选中项</q-tooltip>
          </q-btn>
          <q-btn outline icon="iconfont icondelete" size="md" label="清空回收站" @click="topTrashClear()"> <q-tooltip>删除全部项</q-tooltip> </q-btn>
        </q-btn-group>
      </div>
      <div v-else-if="gSelectedFilesCount < 2">
        <q-btn-group outline class="shadow back">
          <q-btn outline icon="iconfont iconfanhui" size="md" @click="menuBack()"><q-tooltip>返回上级</q-tooltip></q-btn>
          <q-btn outline icon="iconfont iconfenzhi1" size="md">
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list style="min-width: 100px">
                <q-item dense clickable v-close-popup v-for="item in showDirPath" :key="item[0]" @click="GoToPath(item[0])" class="menupannavitem">
                  <q-item-section avatar> <q-icon name="iconfont iconfolder" /></q-item-section>
                  <q-item-section> {{ item[1] }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>路径</q-tooltip></q-btn
          >
          <q-btn outline disable icon="iconfont iconsearch" size="md" @click="menuBack()"><q-tooltip>本文件夹内搜索</q-tooltip></q-btn>
        </q-btn-group>
        <q-btn-group outline class="shadow">
          <q-btn outline icon="iconfont iconsync" size="md" label="刷新" @click="menuRefreshFile(true)" />
          <q-btn-dropdown outline icon="iconfont iconplus" size="md" label="新建" dropdown-icon="iconfont icondown">
            <q-list>
              <q-item clickable v-close-popup @click="menuCreatNewFile('')">
                <q-item-section>
                  <q-item-label>新建文件</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="menuCreatNewDir('', '')">
                <q-item-section>
                  <q-item-label>新建文件夹</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="menuCreatNewDir('', 'time')">
                <q-item-section>
                  <q-item-label>新建日期文件夹</q-item-label>
                </q-item-section>
              </q-item>
              <q-tooltip>{{ '创建到：' + showDirName + ' 里面' }}</q-tooltip>
            </q-list>
          </q-btn-dropdown>
          <q-btn-dropdown outline icon="iconfont iconupload" size="md" label="上传" dropdown-icon="iconfont icondown">
            <q-list>
              <q-item clickable v-close-popup @click="onUpload('file')">
                <q-item-section>
                  <q-item-label>上传文件</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onUpload('folder')">
                <q-item-section>
                  <q-item-label>上传文件夹</q-item-label>
                </q-item-section>
              </q-item>
              <q-tooltip>{{ '上传到：' + showDirName + ' 里面' }}</q-tooltip>
            </q-list>
          </q-btn-dropdown>
          <q-btn outline icon="iconfont iconlink2" size="md" label="导入分享" @click="onShare('ali')" />
        </q-btn-group>
      </div>
      <div v-else>
        <q-btn-group outline class="shadow back">
          <q-btn outline icon="iconfont iconfanhui" size="md" @click="menuBack()"><q-tooltip>返回上级</q-tooltip></q-btn>
          <q-btn outline icon="iconfont iconfenzhi1" size="md" @click="menuBack()"><q-tooltip>路径</q-tooltip></q-btn>
          <q-btn outline disable icon="iconfont iconsearch" size="md" @click="menuBack()"><q-tooltip>本文件夹内搜索</q-tooltip></q-btn>
        </q-btn-group>
        <q-btn-group outline class="shadow">
          <q-btn dense outline size="md" icon="iconfont icondownload" label="下载" @click="menuDownload(false)" />
          <q-btn disable dense outline size="md" icon="iconfont iconfenxiang" label="分享" />
          <q-btn dense outline size="md" icon="iconfont iconcrown" label="收藏" @click="menuFavSelectFile(false)" />
          <q-btn dense outline size="md" icon="iconfont iconedit-square" label="改名" @click="menuRenameSelectFile(false)" />
          <q-btn dense outline size="md" icon="iconfont iconcopy" label="复制" @click="menuMoveFiles(false, false)" />
          <q-btn dense outline size="md" icon="iconfont iconscissor" label="移动" @click="menuMoveFiles(false, true)" />
          <q-btn dense outline size="md" icon="iconfont icondelete" label="删除" @click="menuTrashSelectFile(false, false)" />
        </q-btn-group>
      </div>
    </div>
  </div>
  <div id="PanRightSelected" class="RightSelected" tabindex="1">
    <div style="margin: 0 2px">
      <q-btn flat round color="primary" :icon="gSelectedFilesCount == gShowFilesCount ? 'iconfont iconrsuccess' : 'iconfont iconrpic'" class="select all" @click="onSelectAll">
        <q-tooltip>全选</q-tooltip>
      </q-btn>
    </div>
    <div style="padding-top: 1px; margin-right: 8px">已选中 {{ gSelectedFilesCount }} / {{ gShowFilesCount }} 个</div>
    <div>
      <q-btn :flat="!rangSelect" color="primary" :label="rangSelect ? '取消选择' : '区间选择'" @click="onRangeSelect">
        <q-tooltip>第一步: 点击区间选择这个按钮<br />第二步: 鼠标先点击一个文件<br />第三步: 鼠标再点击另外一个文件</q-tooltip>
      </q-btn>
    </div>
    <div style="flex-grow: 1"></div>
    <div v-if="showDir.loading == 0" style="height: 30px">
      <q-btn-dropdown flat color="primary" icon="iconfont iconpaixu" size="md" :label="'按' + uiFileOrder" class="paixu" auto-close dropdown-icon="iconfont icondown">
        <q-list>
          <q-item clickable @click="onOrder('name asc')">
            <q-item-section>
              <q-item-label>文件名 升序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('name desc')">
            <q-item-section>
              <q-item-label>文件名 降序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('time asc')">
            <q-item-section>
              <q-item-label>修改时间 升序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('time desc')">
            <q-item-section>
              <q-item-label>修改时间 降序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('size asc')">
            <q-item-section>
              <q-item-label>文件大小 升序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('size desc')">
            <q-item-section>
              <q-item-label>文件大小 降序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('ext asc')">
            <q-item-section>
              <q-item-label>文件类型 升序</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="onOrder('ext desc')">
            <q-item-section>
              <q-item-label>文件类型 降序</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div v-else style="height: 30px">
      <q-spinner-clock size="16" color="primary"></q-spinner-clock>
      <span style="padding-top: 1px; padding-right: 8px; padding-left: 4px">加载中(不要操作)...</span>
    </div>
    <div>
      <q-btn flat round icon="iconfont iconliebiaomoshi" class="select" @click="onMode('list')">
        <q-tooltip>列表模式</q-tooltip>
      </q-btn>
    </div>
    <div>
      <q-btn flat round disable icon="iconfont iconsuoluetumoshi" class="select" @click="onMode('image')">
        <q-tooltip>缩略图模式</q-tooltip>
      </q-btn>
    </div>
    <div>
      <q-btn flat round disable icon="iconfont iconpubuliumoshi" class="select" @click="onMode('flow')">
        <q-tooltip>瀑布流模式</q-tooltip>
      </q-btn>
    </div>
  </div>
  <div id="PanRight" class="RightContentPan" @drop="onDrop($event)" @dragover="onDragOver($event)" tabindex="1">
    <InfoList />
  </div>
  <div v-show="showDrag.show" id="PanRightShowUpload" @drop="onDrop($event)" @dragover="onDragOver($event)">
    <div class="ShowUpload">
      <q-icon name="iconfont iconyouxian" style="font-size: 64px" />
      <div class="ShowUploadTitle">
        <span class="link">上传到：{{ showDirName }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import InfoList from './InfoList.vue';
import { defineComponent, computed, reactive, ref, watchEffect, onMounted } from 'vue';
import { StoreRoot, StoreSetting, StoreUI, StoreUser } from 'src/store';
import { topRestoreSelectFile, topTrashDeleteSelectFile, topTrashClear, topUnFavSelectFile, topUnFavClear } from 'src/pages/pan/filetop';
import { menuDownload, menuRenameSelectFile, menuCreatNewFile, menuCreatNewDir, menuTrashSelectFile, menuFavSelectFile, menuMoveFiles } from 'src/pages/pan/filemenu';
import { Dialog } from 'quasar';
import { UploadLocalFiles } from './filelist';
import ShareAli from '../dialog/ShareAli.vue';

export default defineComponent({
  name: 'PanRight',
  components: {
    InfoList,
  },
  setup() {
    const showDrag = reactive({ show: false });
    const uiFileOrder = computed(() => {
      let order = StoreSetting.uiFileOrder;
      if (StoreSetting.uiFileOrderDuli) {
        order = StoreSetting.uiFileOrderDuli;
        const duli = localStorage.getItem(StoreRoot.user_id + '-' + StoreRoot.showDir.file_id);
        if (duli) order = duli;
      }
      return order.replace('asc', '升序').replace('desc', '降序').replace('name', '文件名').replace('ext', '文件类型').replace('size', '文件大小').replace('time', '修改时间');
    });
    const uiFileMode = computed(() => StoreSetting.uiFileMode);
    const showDirName = ref('');
    const gShowFilesCount = ref(0);

    const isTrash = ref(false);
    const isFavor = ref(false);
    const parentid = ref('');

    const showDir = computed(() => StoreRoot.showDir);
    const rangSelect = computed(() => StoreRoot.rangSelect);
    const gSelectedFilesCount = computed(() => StoreRoot.gSelectedFilesCount);
    const showDirPath = ref<string[][]>(StoreRoot.gFileFullPath(showDir.value.file_id));
    watchEffect(() => {
      showDirName.value = showDir.value.name;
      parentid.value = showDir.value.parent_file_id;
      showDirPath.value = StoreRoot.gFileFullPath(showDir.value.file_id);
      gShowFilesCount.value = StoreRoot.gShowFilesCount();
      isTrash.value = showDir.value.file_id == 'trash';
      isFavor.value = showDir.value.file_id == 'favorite';
    });

    function onSelectAll() {
      StoreRoot.mChangSelectedFile({ file_id: 'all', ctrl: false, shift: false });
    }

    function onRangeSelect() {
      StoreRoot.mRangSelect(!rangSelect.value);
    }

    function onOrder(order: string) {
      if (StoreSetting.uiFileOrderDuli) {
        localStorage.setItem(StoreRoot.user_id + '-' + StoreRoot.showDir.file_id, order);
      } else {
        StoreSetting.mSaveUiFileOrder(order);
      }
      StoreRoot.mChangSelectedDirFileList({ dir_id: 'order', items: [] });
      StoreRoot.mChangDirTree();
    }
    function onMode(mode: string) {
      StoreSetting.mSaveUiFileMode(mode);
    }

    function menuBack() {
      const parentid = StoreRoot.showDir.parent_file_id;
      if (parentid == '') return;
      StoreRoot.aChangSelectedDir(parentid);
    }
    function onShare(type: string) {
      if (type == 'ali') {
        Dialog.create({
          component: ShareAli,
          componentProps: { parentid: StoreRoot.showDir.file_id },
        });
      }
    }

    function onDrop(e: any) {
      e.preventDefault();
      const fileslist = e.dataTransfer.files;
      if (fileslist && fileslist.length > 0) {
        const files: string[] = [];
        for (let i = 0; i < fileslist.length; i++) {
          const path = fileslist[i].path;
          files.push(path);
        }
        const token = Object.assign({}, StoreUser.tokeninfo);
        UploadLocalFiles(token.user_id, token.default_drive_id, StoreRoot.showDir.file_id, files, true);
      }
      ts = 0;
      showDrag.show = false;
    }

    let ts = 0;
    const func = () => {
      if (Date.now() - ts < 300) {
        if (showDrag.show != true) showDrag.show = true;
        setTimeout(func, 300);
      } else {
        ts = 0;
        if (showDrag.show != false) showDrag.show = false;
      }
    };
    function onDragOver(e: any) {
      if (ts == 0) {
        ts = Date.now();
        setTimeout(func, 10);
      }
      ts = Date.now();
      e.preventDefault();
    }
    const uploadLoading = ref(false);
    function onUpload(type: string) {
      if (type == 'file') {
        uploadLoading.value = true;
        window.WebShowOpenDialogSync({ title: '选择多个文件上传到网盘', buttonLabel: '上传选中的文件', properties: ['openFile', 'multiSelections'] }, (files: string[] | undefined) => {
          if (files && files.length > 0) {
            const token = Object.assign({}, StoreUser.tokeninfo);
            UploadLocalFiles(token.user_id, token.default_drive_id, StoreRoot.showDir.file_id, files, true);
          } else {
            uploadLoading.value = false;
          }
        });
      } else {
        uploadLoading.value = true;
        window.WebShowOpenDialogSync({ title: '选择多个文件夹上传到网盘', buttonLabel: '上传文件夹', properties: ['openDirectory', 'multiSelections'] }, (files: string[] | undefined) => {
          if (files && files.length > 0) {
            const token = Object.assign({}, StoreUser.tokeninfo);
            UploadLocalFiles(token.user_id, token.default_drive_id, StoreRoot.showDir.file_id, files, true);
          } else {
            uploadLoading.value = false;
          }
        });
      }
    }

    function menuRefreshFile(isdir: boolean) {
      if (!StoreUser.tokeninfo.user_id) return;
      StoreRoot.mClearSelectedFile(); 
      StoreRoot.aReLoadDir({ dir_id: StoreRoot.showDir.file_id, deletecache: true });
      if (isdir) {
        StoreRoot.mShowDirTime(Date.now()); 
      }
    }

    function GoToPath(file_id: string) {
      StoreRoot.aChangSelectedDir(file_id);
    }
    onMounted(() => {
      document.body.addEventListener(
        'keydown',
        function (event: any) {
          const path = event.path;
          for (let i = 0; i < path.length; i++) {
            if (path[i].id == 'PanRightTop' || path[i].id == 'PanRightSelected' || path[i].id == 'PanRight' || path[i].id == 'pantree') {
              if (event.code == 'F5' && StoreUI.gIsPanPage) {
                menuRefreshFile(false);
              } else if (event.code == 'Backspace' && StoreUI.gIsPanPage) {
                menuBack();
              }
              event.stopPropagation();
              return;
            }
          }
        },
        false
      );
    });

    return {
      showDir,
      showDrag,
      showDirName,
      uiFileOrder,
      uiFileMode,
      gShowFilesCount,
      gSelectedFilesCount,
      isTrash,
      isFavor,
      parentid,
      showDirPath,
      rangSelect,
      onRangeSelect,
      onSelectAll,
      onOrder,
      onShare,
      onDrop,
      onDragOver,
      onUpload,
      onMode,
      GoToPath,
      menuBack,
      menuDownload,
      menuRenameSelectFile,
      menuRefreshFile,
      menuCreatNewFile,
      menuCreatNewDir,
      menuFavSelectFile,
      menuTrashSelectFile,
      menuMoveFiles,
      topTrashDeleteSelectFile,
      topTrashClear,
      topRestoreSelectFile,
      topUnFavSelectFile,
      topUnFavClear,
    };
  },
});
</script>
<style>
.RightTop > div {
  min-width: 586px;
  overflow: hidden;
  width: 100%;
  height: 52px;
  padding-top: 13px;
  padding-left: 16px;
  padding-bottom: 3px;
  flex-grow: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.RightTop .q-btn {
  font-size: 14px !important;
  line-height: 18px !important;
  padding: 0px 6px !important;
  min-height: 26px !important;
  height: 26px !important;
  white-space: nowrap;
  word-break: keep-all;
}
.RightTop .q-btn .q-btn__content {
  flex-wrap: nowrap;
}
.RightTop .q-btn {
  color: #df5659;
}
.RightTop .q-btn--outline:before {
  border: 1px solid #df565988;
}
.RightTop .shadow {
  box-shadow: none;
  border-radius: 4px;
}
.RightTop .shadow.back {
  margin-right: 12px !important;
  border-radius: 4px !important;
}
.RightTop .shadow.back .q-btn {
  padding: 0 2px !important;
}

.RightTop .q-btn .q-icon.on-left {
  font-size: 18px !important;
  margin-right: 2px !important;
}
.RightTop .q-btn-dropdown--simple * + .q-btn-dropdown__arrow {
  font-size: 18px !important;
  margin-left: 0px !important;
}
.RightContentPan {
  flex-grow: 1;
  padding: 1px 0 0 16px;
  width: calc(100% - 10px);
  margin-right: 10px;
  height: calc(100vh - 52px - 36px - 52px - 46px);
  overflow-y: auto;
  overflow-x: hidden;
}
.RightSelected {
  margin-left: 16px;
  margin-right: 10px;
  color: #323339;
  height: 40px;
  border-top: 1px solid #e5e8ed99;
  border-bottom: 1px solid #e5e8ed99;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  line-height: 38px;
}
.RightSelected .q-btn {
  font-size: 14px !important;
  line-height: 18px !important;
  padding: 0px 6px !important;
  min-height: 26px !important;
}
.RightSelected .q-btn .q-icon.on-left {
  font-size: 18px !important;
  margin-right: 2px !important;
}
.RightSelected .q-btn-dropdown--simple * + .q-btn-dropdown__arrow {
  font-size: 18px !important;
  margin-left: 0px !important;
}

.RightSelected .paixu {
  font-size: 14px !important;
}
.RightSelected .paixu .q-icon {
  font-size: 16px !important;
}
.select {
  font-size: 14px;
  color: #637dff !important;
  min-width: 34px !important;
  min-height: 34px !important;
  height: 34px !important;
}

.fileitem .select {
  color: #bcb3b366 !important;
}

.select.all,
.fileitem.selected .select i {
  color: #637dff !important;
}

.q-item {
  min-height: 26px;
  padding: 8px 16px;
}

#PanRightShowUpload {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-image: linear-gradient(to top, rgba(120, 115, 245, 0.4) 0%, rgba(120, 115, 245, 0.1) 25%, rgba(236, 119, 171, 0.05) 100%);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
#PanRightShowUpload .ShowUpload {
  margin: 0 16px 16px 0;
  text-align: center;
}

#PanRightShowUpload .ShowUpload .ShowUploadTitle {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  padding: 4px;
}
#PanRightShowUpload .ShowUpload .link {
  color: #1976d2;
  font-size: 14px;
}
#PanRightShowUpload .ShowUpload .iconfont {
  color: rgb(120, 115, 245);
}

.toppannav {
  width: 100%;
  height: 36px;
  padding: 16px 16px 0 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow: hidden;
}
.toppannavitem {
  padding-right: 4px;
  flex-grow: 0;
  flex-shrink: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 58px;
  max-width: 258px;
  line-height: 20px;
  height: 20px;
  color: #3482f0;
  cursor: pointer;
}
.toppannavitem:hover {
  background: #e6f1fc;
  border-radius: 4px;
}
.toppannavitem::before {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  vertical-align: bottom;
  color: #323339;
  content: '\e660';
}
.toppannavitem:first-child,
.toppannavitem:last-child {
  flex-shrink: 0 !important;
}

.menupannavitem {
  min-height: 26px !important;
  padding: 8px !important;
  line-height: 1.2em !important;
}

.menupannavitem .q-item__section--avatar {
  padding-right: 4px;
  min-width: 20px;
}
.menupannavitem .q-icon {
  font-size: 16px !important;
}
.menupannavitem .iconfolder {
  color: #ffb74d !important;
}
</style>
