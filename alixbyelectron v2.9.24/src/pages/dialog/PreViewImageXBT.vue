<template>
  <q-dialog ref="dialogpvxbt" persistent maximized no-focus no-refocus style="z-index: 6001">
    <div>
      <div class="row items-start xbtimage scroll" data-autofocus>
        <q-img v-for="item in imagelist" :key="item.time" :src="item.url" spinner-color="white" spinner-size="52px" width="25%" transition="scale" class="rounded-borders">
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-negative text-white">Error</div>
          </template>
          <div class="absolute-bottom text-center text-body2" style="padding: 0">{{ item.time }}</div>
        </q-img>
      </div>
    </div>

    <div v-show="showtop" class="non-selectable dialogtopbar q-electron-drag">
      <div class="text-h7 dialogtopbartitle">{{ filename }}</div>
      <div class="dialogtopbarbtn q-electron-drag--exception">
        <q-btn flat round dense icon="iconfont iconlink2" @click="onUrlCheck" title="复制下载链接" />
        <q-btn flat round dense icon="iconfont icondownload" @click="onDownload" title="下载" />
        <q-btn flat round dense icon="iconfont iconstart" @click="onPlay" title="播放" />
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { StoreUser, StoreSetting, StoreUI } from 'src/store';
import AliFile from 'src/aliapi/file';
import { IVideoXBTUrl } from 'src/aliapi/models';
import { copyToClipboard } from 'quasar';
import { pageDownloadFiles } from '../pagecommand';
import { IStatePanFile } from 'src/store/models';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import { Player } from 'src/store/player';
export default defineComponent({
  name: 'PreViewImageXBT',
  methods: {
    show() {
      (this.$refs.dialogpvxbt as any).show();
    },
    hide() {
      (this.$refs.dialogpvxbt as any).hide();
    },
  },
  props: {
    ispan: {
      type: Boolean,
      required: true,
    },
    file: {
      type: Object as PropType<IStatePanFile>,
      required: true,
    },
  },
  setup(props) {
    const dialogpvxbt = ref();
    const showtop = ref(true);
    const filename = ref(props.file.name);
    const ispan = ref(props.ispan);
    const token = Object.assign({}, StoreUser.tokeninfo);
    const imagelist = ref<IVideoXBTUrl[]>([]);
    AliFile.ApiBiXueTuBatch(ispan.value ? 'pan' : 'pic', props.file.file_id, props.file.duration, StoreSetting.uiXBTNumber, 400, token).then((data) => {
      imagelist.value = data;
    });
    function onDownload() {
      pageDownloadFiles(true, [props.file]);
    }
    function onUrlCheck() {
      const token = Object.assign({}, StoreUser.tokeninfo);
      const isfrompan = StoreUI.gIsPanPage;
      AliFile.ApiFileDownloadUrl(isfrompan ? 'pan' : 'pic', props.file.file_id, 14000, token).then((data) => {
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
    function onPlay() {
      Player(props.file.file_id, props.file.name);
    }
    return { dialogpvxbt, showtop, filename, imagelist, onUrlCheck, onDownload, onPlay };
  },
});
</script>
<style>
.dialogtopbar {
  height: 40px !important;
  line-height: 32px;
  padding: 4px 8px;
  position: absolute;
  top: 4px !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 6001;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  display: flex;
  flex-direction: row;
  margin-top: 1px;
}
.dialogtopbartitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis !important;
  flex-grow: 1;
  flex-shrink: 1;
}
.dialogtopbarbtn {
  color: #ffffff;
  flex-grow: 0;
  flex-shrink: 0;
}
.dialogtopbarbtn .q-btn {
  margin-left: 8px;
}

.xbtimage {
  padding: 44px 0 8px 0;
  background-color: #555555;
  min-height: 100%;
}
</style>
