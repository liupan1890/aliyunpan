<template>
  <q-dialog ref="dialogpvi" persistent maximized no-focus no-refocus style="z-index: 6001" class="previewimagedialog">
    <div class="viewer-wrapper">
      <viewer ref="viewer" :options="options" :images="images" rebuild class="viewer" @inited="inited" data-autofocus>
        <template #default="scope">
          <div v-for="{ fileindex, src, datasource } in scope.images" :key="fileindex" class="image-wrapper">
            <img class="image" :src="src" :data-source="datasource" width="0" height="0" />
          </div>
        </template>
      </viewer>
    </div>

    <div v-show="showtop" class="non-selectable dialogtopbar q-electron-drag">
      <div class="text-h7 dialogtopbartitle">{{ filename }}</div>
      <div class="dialogtopbarbtn q-electron-drag--exception">
        <q-btn flat round dense icon="iconfont icondownload" @click="onDownload" title="下载" />
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, PropType } from 'vue';
import VueViewer, { component } from 'v-viewer';
import { IStatePanFile } from 'src/store/models';
import 'viewerjs/dist/viewer.css';
import { StoreRoot } from 'src/store';
import { pageDownloadFiles } from '../pagecommand';
import { ProtoPanFileInfo } from 'src/store/proto';
export default defineComponent({
  name: 'PreViewImage',
  components: {
    viewer: component,
  },
  methods: {
    show() {
      (this.$refs.dialogpvi as any).show();
    },
    hide() {
      (this.$refs.dialogpvi as any).hide();
    },
  },
  props: {
    file: {
      type: Object as PropType<IStatePanFile>,
      required: true,
    },
  },
  setup(props) {
    const dialogpvi = ref();
    const showtop = ref(true);
    VueViewer.setDefaults({ zIndex: 6000, zIndexInline: 6000 });
    const fileid = ref(props.file.file_id);

    let fileindex = 0;
    const filelist: IStatePanFile[] = [];
    const children = StoreRoot.gShowDirFiles();
    for (let i = 0; i < children.length; i++) {
      const buff = Buffer.from(children[i].info, 'base64');
      const info = (ProtoPanFileInfo.decode(buff) as any) || { url: '' };
      if (info.isimage && children[i].thumbnail && info.url) {
        filelist.push(children[i]);
        if (children[i].file_id == fileid.value) {
          fileindex = filelist.length - 1;
        }
      }
    }

    const filename = ref('[' + (fileindex + 1).toString() + '/' + filelist.length.toString() + '] ' + props.file.name);
    const showlist = [];
    const start = Math.max(fileindex - 31, 0);
    const end = Math.min(start + 61, filelist.length);
    let imageindex = fileindex - start;
    for (let i = start; i < end; i++) {
      const buff = Buffer.from(filelist[i].info, 'base64');
      const info = (ProtoPanFileInfo.decode(buff) as any) || { url: '' };
      showlist.push({ fileindex: i, src: filelist[i].thumbnail, datasource: info.url || filelist[i].thumbnail });
    }
    let $viewer;
    const images = reactive(showlist);
    const options = reactive({
      inline: false,
      button: false,
      navbar: true,
      title: false,
      toolbar: true,
      tooltip: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      transition: true,
      fullscreen: false,
      keyboard: true,
      backdrop: false,
      loop: false,
      url: 'data-source',

      view: (e: any) => {
        const index = e.detail.index;
        const fileindex2 = images[index].fileindex;
        fileindex = images[index].fileindex;
        fileid.value = filelist[fileindex2].file_id;
        filename.value = '[' + (fileindex2 + 1).toString() + '/' + filelist.length.toString() + '] ' + filelist[fileindex2].name;
        const max = images.length - 1;
        if (index >= max && index != imageindex) {
          const last = images[images.length - 1].fileindex + 1;
          if (last < filelist.length) {
            const showlist2 = [];
            const start2 = last;
            const end2 = Math.min(start2 + 10, filelist.length);
            for (let i = start2; i < end2; i++) {
              const buff = Buffer.from(filelist[i].info, 'base64');
              const info = (ProtoPanFileInfo.decode(buff) as any) || { url: '' };
              showlist2.push({ fileindex: i, src: filelist[i].thumbnail, datasource: info.url || filelist[i].thumbnail });
            }
            images.push(...showlist2);
            imageindex = index;
          }
        } else if (index <= 0 && index != imageindex) {
          const begin = images[0].fileindex;
          if (begin > 0) {
            const showlist2 = [];
            const start2 = Math.max(begin - 10, 0);
            const end2 = begin;
            for (let i = start2; i < end2; i++) {
              const buff = Buffer.from(filelist[i].info, 'base64');
              const info = (ProtoPanFileInfo.decode(buff) as any) || { url: '' };
              showlist2.push({ fileindex: i, src: filelist[i].thumbnail, datasource: info.url || filelist[i].thumbnail });
            }
            images.splice(0, 0, ...showlist2);
            imageindex = showlist2.length;
          }
        }
      },
      play() {
        showtop.value = false;
      },
      stop() {
        showtop.value = true;
      },
      hide: () => {
        if (dialogpvi.value) dialogpvi.value.hide();
      },
    });

    function inited(viewer: any) {
      $viewer = viewer;
      $viewer.view(imageindex);
    }

    function onDownload() {
      pageDownloadFiles(true, [filelist[fileindex]]);
    }

    return { showtop, filename, dialogpvi, options, images, inited, onDownload };
  },
});
</script>
<style>
.image-wrapper {
  display: inline-block;
  width: 0px;
  margin: 5px 5px 0 5px;
}
.image {
  display: none;
}
.viewer-container {
  background-color: #555555;
}
.viewer-player.viewer-show {
  z-index: 6003;
  cursor: default;
}

.viewer-wrapper,
.previewimagedialog .q-dialog__backdrop {
  display: none;
}
</style>
