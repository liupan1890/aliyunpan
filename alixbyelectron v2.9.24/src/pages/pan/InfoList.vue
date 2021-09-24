<template>
  <RecycleScroller id="PanRightVFileList" ref="vfileList" class="scroller" :items="showDirFiles" :item-size="50" key-field="file_id" page-mode emitUpdate @update="onVirtualScroll">
    <template v-slot="{ item, index }">
      <div
        class="fileitem"
        :class="selectedFiles.has(item.file_id) ? 'selected' : ''"
        @click="onSelectFile($event, false, item.file_id, false)"
        @contextmenu.stop="onSelectFile($event, true, item.file_id, false)"
        @mouseover="onSelectRang(item.file_id)"
      >
        <div class="rangselect" :class="rangSelectFiles[item.file_id] ? (rangSelectStart == item.file_id ? 'rangstart' : rangSelectEnd == item.file_id ? 'rangend' : 'rang') : ''">
          <q-btn
            flat
            round
            color="primary"
            :icon="selectedFiles.has(item.file_id) ? (item.starred ? 'iconfont iconcrown' : 'iconfont iconrsuccess') : item.starred ? 'iconfont iconcrown' : 'iconfont iconrpic'"
            class="select"
            @click.stop="onSelectFile($event, false, item.file_id, true)"
            :title="index"
          ></q-btn>
        </div>
        <div class="fileicon">
          <i class="q-icon iconfont" :class="item.icon" aria-hidden="true" role="img"></i>
        </div>
        <div class="filename">
          <div @click="onClickFileName($event, item)" :class="fileColor.get(item.file_id)">
            {{ item.name }}
            <q-tooltip :delay="1000" :offset="[0, 10]" v-if="item.thumbnail"
              ><div class="preimg"><img :src="item.thumbnail" /></div
            ></q-tooltip>
          </div>
        </div>
        <div class="filebtn">
          <q-btn flat color="primary" icon="iconfont icongengduo" class="gengduo" @click.stop="onSelectFile($event, true, item.file_id, false)">
            <q-tooltip>在这一行上右击鼠标显示菜单</q-tooltip>
          </q-btn>
        </div>
        <div class="filesize">{{ item.sizestr }}</div>
        <div class="filetime">{{ item.timestr }}</div>
      </div>
    </template>
    <template #after>
      <div class="downHideTip" v-if="showDir.loading == 0 && showDirFiles.length < 1">
        <div style="margin-top: 20%"></div>
        <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
        <br />文件夹是空的?
      </div>
      <div class="downHideTip" v-if="(isTrash || isFavor) && showDir.loading == 0 && showDirFiles.length == 5000">只显示前5000条记录，之后的先被省略...</div>
    </template>
  </RecycleScroller>
  <div style="height: 30px; width: 100%" @contextmenu.stop="onFileMenuHide()"></div>

  <q-menu class="filemenu2" ref="filemenu" :touch-position="true" :noRefocus="true" context-menu target="#PanRightVFileList" @hide="onFileMenuHide">
    <q-list v-show="!isTrash" dense style="min-width: 100px">
      <q-item v-show="!isTrash" clickable v-close-popup @click="menuDownload(false)">
        <q-item-section avatar>
          <q-icon name="iconfont icondownload" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}下载</q-item-section>
      </q-item>
      <q-item v-show="!isTrash" v-close-popup>
        <q-item-section avatar>
          <q-icon name="iconfont iconfenxiang" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}分享</q-item-section>
      </q-item>
      <q-item v-show="!isTrash && !isFavor" clickable v-close-popup @click="menuFavSelectFile(false)">
        <q-item-section avatar>
          <q-icon name="iconfont iconcrown" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}收藏</q-item-section>
      </q-item>
      <q-item v-show="!isTrash" clickable v-close-popup @click="menuRenameSelectFile(false)">
        <q-item-section avatar>
          <q-icon name="iconfont iconedit-square" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}改名</q-item-section>
      </q-item>
      <q-item v-show="!isTrash && selectedMutil == ''" clickable v-close-popup @click="menuFilesDetail(false)">
        <q-item-section avatar>
          <q-icon name="iconfont iconinfo_circle" />
        </q-item-section>
        <q-item-section>详情</q-item-section>
      </q-item>
      <q-item v-show="!isTrash" clickable>
        <q-item-section avatar>
          <q-icon name="iconfont iconcopy" />
        </q-item-section>
        <q-item-section>复制移动</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="menuMoveFiles(false, false)">
              <q-item-section avatar>
                <q-icon name="iconfont iconcopy" />
              </q-item-section>
              <q-item-section>{{ selectedMutil }}复制到...</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="menuMoveFiles(false, true)">
              <q-item-section avatar>
                <q-icon name="iconfont iconscissor" />
              </q-item-section>
              <q-item-section>{{ selectedMutil }}移动到...</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item v-show="!isTrash" clickable>
        <q-item-section avatar>
          <q-icon name="iconfont iconcheckbox-full" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}标记</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="menuChangeColor('#df565966')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #df5659" />
              </q-item-section>
              <q-item-section style="color: #df5659">鹅冠红</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#9c27b066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #9c27b0" />
              </q-item-section>
              <q-item-section style="color: #9c27b0">兰花紫</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#3f51b566')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #3f51b5" />
              </q-item-section>
              <q-item-section style="color: #3f51b5">海涛蓝</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#42a5f566')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #42a5f5" />
              </q-item-section>
              <q-item-section style="color: #42a5f5">晴蓝</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#00bc9966')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #00bc99" />
              </q-item-section>
              <q-item-section style="color: #00bc99">竹绿</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#4caf5066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #4caf50" />
              </q-item-section>
              <q-item-section style="color: #4caf50">宝石绿</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#ff980066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #ff9800" />
              </q-item-section>
              <q-item-section style="color: #ff9800">金盏黄</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="menuChangeColor('#ff572266')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #ff5722" />
              </q-item-section>
              <q-item-section style="color: #ff5722">芙蓉橙</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="menuChangeColor('#000000aa')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" />
              </q-item-section>
              <q-item-section>取消标记</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item v-show="!isTrash" clickable>
        <q-item-section avatar>
          <q-icon name="iconfont icondelete" />
        </q-item-section>
        <q-item-section>{{ selectedMutil }}删除</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="menuTrashSelectFile(false, false)">
              <q-item-section>删除到回收站</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="menuTrashSelectFile(false, true)">
              <q-item-section>直接彻底删除</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { StoreRoot, StoreSetting, StoreUI } from 'src/store';
import { menuDownload, menuChangeColor, menuRenameSelectFile, menuTrashSelectFile, menuFavSelectFile, menuMoveFiles, menuFilesDetail } from 'src/pages/pan/filemenu';
import { onClickFileName } from 'src/pages/pan/filename';
import { defineComponent, computed, ref, watch, watchEffect, onMounted, onUnmounted } from 'vue';
import { IStatePanFile, IStatePanFileList } from 'src/store/models';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default defineComponent({
  name: 'InfoList',
  components: {
    RecycleScroller,
  },
  setup() {
    const filemenu = ref();
    const vfileList = ref();
    const filemenutarget = ref('');
    const selectedFiles = computed(() => StoreRoot.selectedFiles);
    const showDir = computed(() => StoreRoot.showDir);
    const isTrash = ref(false);
    const isFavor = ref(false);
    const showDirFiles = ref<IStatePanFile[] | IStatePanFileList[]>([]);

    const fileColor = computed(() => StoreUI.fileColor);
    const uiFileMode = computed(() => StoreSetting.uiFileMode);
    const rangSelectID = ref('');
    const rangSelectStart = ref('');
    const rangSelectEnd = ref('');
    const rangSelectFiles = ref<{ [k: string]: any }>({});
    const selectedMutil = computed(() => (StoreRoot.gSelectedFilesCount > 1 ? '批量' : ''));

    function onSelectRang(file_id: string) {
      if (StoreRoot.rangSelect && rangSelectID.value != '') {

        const start = rangSelectID.value;
        const s: { [k: string]: any } = {};
        const children = StoreRoot.gShowDirFiles();
        let a = -1;
        let b = -1;
        for (let i = 0; i < children.length; i++) {
          if (children[i].file_id == file_id) a = i;
          if (children[i].file_id == start) b = i;
          if (a > 0 && b > 0) break;
        }
        if (a >= 0 && b >= 0) {
          if (a > b) {
            [a, b] = [b, a]; 
            rangSelectStart.value = start;
            rangSelectEnd.value = file_id;
          } else {
            rangSelectStart.value = file_id;
            rangSelectEnd.value = start;
          }
          for (let n = a; n <= b; n++) {
            s[children[n].file_id] = true;
          }
        }
        rangSelectFiles.value = s;
      }
    }

    function onSelectFile(event: MouseEvent, menu: boolean, file_id: string, ctrl: boolean) {
      if (StoreRoot.rangSelect) {
        if (event.button != 0) {
          if (filemenu.value) filemenu.value.hide();
          event.preventDefault();
          return;
        }
        if (rangSelectID.value == '') {
          if (!selectedFiles.value.has(file_id)) StoreRoot.mChangSelectedFile({ file_id, ctrl: true, shift: false });
          rangSelectID.value = file_id;
          rangSelectStart.value = file_id;
          rangSelectFiles.value = { [file_id]: true };
        } else {
          const start = rangSelectID.value;
          const children = StoreRoot.gShowDirFiles();
          let a = -1;
          let b = -1;
          for (let i = 0; i < children.length; i++) {
            if (children[i].file_id == file_id) a = i;
            if (children[i].file_id == start) b = i;
            if (a > 0 && b > 0) break;
          }
          const filelist: string[] = [];
          if (a >= 0 && b >= 0) {
            if (a > b) [a, b] = [b, a]; 
            for (let n = a; n <= b; n++) {
              filelist.push(children[n].file_id);
            }
          }
          StoreRoot.mChangSelectedFileRang(filelist);
          rangSelectID.value = '';
          rangSelectStart.value = '';
          rangSelectEnd.value = '';
          rangSelectFiles.value = {};
        }
        return;
      }

      if (menu) {
        if (!selectedFiles.value.has(file_id)) {
          StoreRoot.mChangSelectedFile({ file_id, ctrl: event.ctrlKey, shift: event.shiftKey });
        }
        if (filemenu.value) {
          filemenutarget.value = '#PanRightVFileList';
          filemenu.value.hide();
          filemenu.value.show(event);
        }
      } else {
        StoreRoot.mChangSelectedFile({ file_id, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey });
        if (filemenu.value) filemenu.value.hide();
      }
    }

    function onFileMenuHide() {
      if (filemenu.value) filemenu.value.hide();
      filemenutarget.value = '';
    }
    function onVirtualScroll() {
      if (filemenu.value) filemenu.value.hide();
    }
    const RowSize = ref(3);
    onMounted(() => {
      window.addEventListener('resize', setRowSize);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', setRowSize);
    });
    function setRowSize() {
      let width = document.getElementById('PanRight')?.clientWidth || 0;
      let newChunkSize = 2;
      if (width >= 1200) newChunkSize = 5;
      else if (width >= 992) newChunkSize = 4;
      else if (width >= 768) newChunkSize = 3;

      if (newChunkSize === RowSize.value) {
        return;
      } else {
        RowSize.value = newChunkSize;
      }
    }
    watchEffect(() => {
     
      showDirFiles.value = StoreRoot.gShowDirFiles();
      isTrash.value = showDir.value.file_id == 'trash';
      isFavor.value = showDir.value.file_id == 'favorite';
    });

    const gSelectedFilesCount = computed(() => StoreRoot.gSelectedFilesCount);
    watch(gSelectedFilesCount, (newval: number) => {
      if (newval == 0) {
        if (filemenu.value) filemenu.value.hide();
      }
    });

    return {
      fileColor,
      showDir,
      showDirFiles,
      selectedFiles,
      gSelectedFilesCount,
      selectedMutil,
      filemenu,
      filemenutarget,
      vfileList,
      uiFileMode,
      isTrash,
      isFavor,
      rangSelectStart,
      rangSelectEnd,
      rangSelectFiles,
      onSelectRang,
      onSelectFile,
      onClickFileName,
      onFileMenuHide,
      onVirtualScroll,
      menuDownload,
      menuChangeColor,
      menuRenameSelectFile,
      menuTrashSelectFile,
      menuFavSelectFile,
      menuMoveFiles,
      menuFilesDetail,
    };
  },
});
</script>
<style>
.fileitem {
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
.fileitem:hover {
  background: #f7f8fadd;
}
.fileitem.selected {
  background: #f7f8fa;
}
.fileicon {
  width: 26px;
  padding-right: 4px;
}
.fileicon i {
  font-size: 22px;
  color: #525359;
}
.fileicon .iconfolder {
  color: #ffb74d !important;
}

.iconfile_video,
.iconfile-video,
.iconfile-mkv,
.iconfile-avi,
.iconfile-flv,
.iconfile-mp4,
.iconfile-mov,
.iconfile-asf,
.iconfile-wmv,
.iconfile-ts,
.iconfile-rmvb,
.iconfile-swf {
  color: #3482f0 !important;
}
.iconfile-audio,
.iconfile-flac,
.iconfile-ape,
.iconfile-wav,
.iconfile-cue,
.iconfile-ogg,
.iconfile-mp3 {
  color: #565bf5 !important;
}
.iconfile-image,
.iconfile-img,
.iconfile-ai,
.iconfile-bmp,
.iconfile-eps,
.iconfile-gif,
.iconfile-png,
.iconfile-jpg,
.iconfile-psd,
.iconfile-svg,
.iconfile-tif {
  color: #fa8d11 !important;
}
.iconfile-bt,
.iconfile_txt2,
.iconfile-txt,
.iconfile-ssa,
.iconfile-ass,
.iconfile-srt,
.iconfile-stl,
.iconfile-scc,
.iconfile-doc,
.iconfile-html,
.iconfile-pdf,
.iconfile-ppt,
.iconfile-xsl,
.iconfile-wps {
  color: #8bc755 !important;
}
.iconfile-7z,
.iconfile-rar,
.iconfile-zip,
.iconfile-tar {
  color: #7c5bf3 !important;
}

.iconfile-img2,
.iconfile-xci,
.iconfile-nsp,
.iconfile-bin,
.iconfile-dmg,
.iconfile-vmdk,
.iconfile-iso,
.iconfile-gho,
.iconfile-mds,
.iconfile-vhd,
.iconfile-god {
  color: #8049d1 !important;
}
.iconfile-exe {
  color: #db4716 !important;
}

.iconweifa {
  color: #d81e06 !important;
}

.q-item {
  font-size: 13px !important;
}
.filename {
  color: #323339;
  font-size: 14px;
  flex-grow: 1;
  display: block;
  max-width: 100%;
  max-height: 36px;

  overflow: hidden;
}
.filename > div {
  line-height: 18px;
  width: fit-content;

  max-height: 36px;
  letter-spacing: 1px;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  min-width: 50px;
}
#PanRightVFileList .filename > div {
  cursor: pointer;
}
#PanRightVFileList .filename > div:hover {
  color: #3482f0;
}
.filebtn {
  width: 26px;
  flex-shrink: 0;
  flex-grow: 0;
}
.filetime,
.filesize {
  color: #25262bb8;
  word-wrap: break-word;
  word-break: keep-all;
  flex-shrink: 0;
  flex-grow: 0;
}
.filesize {
  font-size: 14px;
  width: 62px;
  text-align: right;
}
.filetime {
  font-size: 12px;
  width: 80px;
  text-align: right;
  line-height: 14px;
  padding-right: 2px;
}

.gengduo {
  width: 12px;
  height: 28px;
  min-height: 18px;
  border-radius: 4px;
  padding: 2px 0;
  display: none;
}

.fileitem:hover .gengduo {
  display: block;
}
.gengduo .q-icon {
  width: 12px;
  height: 24px;
  font-size: 24px;
}
.gengduo .q-focus-helper {
  background: currentColor !important;
  opacity: 0.15 !important;
}
.preimg {
  width: 200px;
  max-width: 200px;
  text-align: center;
  margin: 0 auto;
  min-height: 100px;
  object-fit: cover;
}
.preimg img {
  width: 200px;
  max-width: 200px;
}

.filemenu {
  background: #ffffff;
  box-shadow: none;
  min-width: 398px;
  box-shadow: rgb(0 0 0 / 8%) 2px 4px 12px 2px;
}
.filemenu .q-btn {
  color: #df5659;
  background: #df565908 !important;
}
.filemenu .q-btn--outline:before {
  border: 1px solid #df565988;
}
.filemenu2 .q-item {
  color: #323339;
}
.filemenu2 .q-item__section--avatar {
  min-width: 24px;
}
.filemenu2 .q-item__section--side > .q-icon {
  font-size: 18px;
}
.filemenu2 .q-item__section--side {
  padding: 0 3px !important;
}
.filemenu2 .q-list--dense > .q-item,
.filemenu2 .q-item--dense {
  padding: 2px 8px 2px 6px;
}

.cdf5659 {
  color: #df5659;
}
.c9c27b0 {
  color: #9c27b0;
}
.c3f51b5 {
  color: #3f51b5;
}
.c42a5f5 {
  color: #42a5f5;
}
.c00bc99 {
  color: #00bc99;
}
.c4caf50 {
  color: #4caf50;
}
.cff9800 {
  color: #ff9800;
}
.cff5722 {
  color: #ff5722;
}
.cvideo {
  color: #507090;
}
.rangselect {
  height: 49px;
  padding-top: 7px;
  margin: 2px;
  border: 1px dashed transparent;
}
.rangselect.rang {
  border-left: 1px dashed #637dff;
  border-right: 1px dashed #637dff;
  background: rgba(25, 118, 210, 0.1);
}
.rangselect.rangstart {
  border-left: 1px dashed #637dff;
  border-right: 1px dashed #637dff;
  background: rgba(25, 118, 210, 0.1);

  border-top: 1px dashed #637dff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  margin-top: 9px !important;
  padding-top: 0px !important;
  height: 42px !important;
}
.rangselect.rangend {
  border-left: 1px dashed #637dff;
  border-right: 1px dashed #637dff;
  background: rgba(99, 125, 255, 0.1);

  border-bottom: 1px dashed #637dff;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;

  margin-bottom: 9px !important;
  height: 43px !important;
}

.rangselect.rang i,
.rangselect.rangstart i,
.rangselect.rangend i {
  color: #637dff;
}

.grid {
  display: grid;
  padding: 0 1rem;
  grid-gap: 2rem;
  grid-template-columns: repeat(2, 1fr);
  place-items: start stretch;
}
@media (min-width: 760px) {
  .grid {
    padding: 1.5rem;
    grid-gap: 3rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1140px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 1520px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (min-width: 1900px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
@media (min-width: 2280px) {
  .grid {
    grid-template-columns: repeat(7, 1fr);
  }
}
@media (min-width: 2660px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
  }
}
@media (min-width: 3040px) {
  .grid {
    grid-template-columns: repeat(9, 1fr);
  }
}
@media (min-width: 3420px) {
  .grid {
    grid-template-columns: repeat(10, 1fr);
  }
}
.griditem {
  width: 200px;
  height: 200px;
  overflow: hidden;
}
</style>
