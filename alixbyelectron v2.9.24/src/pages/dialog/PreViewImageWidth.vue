<template>
  <q-dialog id="dialogpviw" ref="dialogpviw" persistent maximized no-refocus style="z-index: 6001" tabindex="1">
    <div>
      <div class="fullwidthimage scroll">
        <q-img data-autofocus :src="fileurl" spinner-color="white" spinner-size="82px" :width="filewidth" transition="scale" class="rounded-borders" style="max-width: 100%" fit="" position="">
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-negative text-white">Cannot load image</div>
          </template>
        </q-img>
      </div>
    </div>

    <div v-show="showtop" class="non-selectable dialogtopbar q-electron-drag">
      <div class="text-h7 dialogtopbartitle">{{ filename }}</div>
      <div class="dialogtopbarbtn q-electron-drag--exception">
        <q-btn :disable="disablepre" flat dense label="上一张" @click="onPreImage" />
        <q-btn :disable="disablenext" flat dense label="下一张" @click="onNextImage" />
        <q-btn flat round dense icon="iconfont icondownload" @click="onDownload" title="下载" />
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, onMounted, onUnmounted } from 'vue';
import { IStatePanFile } from 'src/store/models';
import { StoreRoot } from 'src/store';
import { pageDownloadFiles } from '../pagecommand';
import { ProtoPanFileInfo } from 'src/store/proto';
import { nextTick } from 'process';
export default defineComponent({
  name: 'PreViewImageWidth',
  methods: {
    show() {
      (this.$refs.dialogpviw as any).show();
    },
    hide() {
      (this.$refs.dialogpviw as any).hide();
    },
  },
  props: {
    file: {
      type: Object as PropType<IStatePanFile>,
      required: true,
    },
  },
  setup(props) {
    const dialogpviw = ref();
    const showtop = ref(true);
    const fileid = ref(props.file.file_id);
    let fileindex = 0;
    const filelist: IStatePanFile[] = [];
    const children = StoreRoot.gShowDirFiles();
    for (let i = 0; i < children.length; i++) {
      const buff = Buffer.from(children[i].info, 'base64');
      const info = (ProtoPanFileInfo.decode(buff) as any) || { isimage: false, url: '' };
      if (info.isimage && children[i].thumbnail && info.url) {
        filelist.push(children[i]);
        if (children[i].file_id == fileid.value) {
          fileindex = filelist.length - 1;
        }
      }
    }

    const filename = ref('');
    const fileurl = ref('');
    const filewidth = ref('');
    const disablepre = ref(true);
    const disablenext = ref(true);

    function showImage() {
      disablepre.value = fileindex <= 0;
      disablenext.value = fileindex + 1 >= filelist.length;
      const file = filelist[fileindex];
      filewidth.value = '0px';
      nextTick(() => {
        const buff = Buffer.from(file.info, 'base64');
        const info = (ProtoPanFileInfo.decode(buff) as any) || { url: '' };
        fileurl.value = info.url || file.thumbnail || '';
        filename.value = '[' + (fileindex + 1).toString() + '/' + filelist.length.toString() + '] ' + file.name;
        filewidth.value = file.width > 0 ? file.width.toString() + 'px' : '100%';
      });
    }
    showImage();
    function onPreImage() {
      if (fileindex <= 0) {
        fileindex = 0;
      }
      if (fileindex + 1 >= filelist.length) {
        fileindex = filelist.length - 1;
      }
      if (fileindex > 0) {
        fileindex = fileindex - 1;
      }
      showImage();
    }
    function onNextImage() {
      if (fileindex <= 0) {
        fileindex = 0;
      }
      if (fileindex + 1 >= filelist.length) {
        fileindex = filelist.length - 1;
      }
      if (fileindex + 1 < filelist.length) {
        fileindex = fileindex + 1;
      }
      showImage();
    }

    function onDownload() {
      pageDownloadFiles(true, [filelist[fileindex]]);
    }
    function onKeyDown(event: any) {
      event.stopPropagation();
      if (event.code == 'ArrowRight') {
        onNextImage();
      } else if (event.code == 'ArrowLeft') {
        onPreImage();
      }
    }
    onMounted(() => {
      document.body.addEventListener('keydown', onKeyDown, false);
    });
    onUnmounted(() => {
      document.body.removeEventListener('keydown', onKeyDown, false);
    });
    return { showtop, filename, filewidth, fileurl, dialogpviw, onPreImage, onNextImage, disablepre, disablenext, onDownload };
  },
});
</script>
<style>
.fullwidthimage {
  padding: 44px 0 8px 0;
  text-align: center;
  vertical-align: middle;
  background-color: #555555;
  min-height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
</style>
