<template>
  <q-dialog ref="dialogpvc" persistent maximized no-focus no-refocus style="z-index: 6001">
    <div>
      <div ref="codeBlock" class="fullwidthcode">
        <pre class="line-numbers" :class="language" style="white-space: pre-wrap"><code>{{codeString}}</code></pre>
      </div>
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

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { IStatePanFile } from 'src/store/models';
import { NotifyInfo } from 'src/aliapi/notify';
import { StoreUser } from 'src/store';
import { pageDownloadFiles } from '../pagecommand';
import AliFile from 'src/aliapi/file';
export default defineComponent({
  name: 'PreViewCode',
  methods: {
    show() {
      this.$refs.dialogpvc.show();
    },
    hide() {
      this.$refs.dialogpvc.hide();
    },
  },
  props: {
    file: IStatePanFile,
  },
  setup(props) {
    const dialogpvc = ref();
    const codeBlock = ref();
    const showtop = ref(true);
    const fileid = ref(props.file.file_id);
    const filename = ref(props.file.name);
    const language = ref('language-' + props.file.file_extension);
    const codeString = ref('');
    const token = Object.assign({}, StoreUser.tokeninfo);
    function showCode() {
      AliFile.ApiFileDownText(props.file.drive_id, props.file.file_id, props.file.size, 512 * 1024, token).then((data) => {
        codeString.value = data;
        if (props.file.size > 512 * 1024) {
          NotifyInfo('文件较大，只显示了前 512KB 的内容');
        }
        let fext = props.file.file_extension;
        if (fext == 'plain' && data.indexOf('{') >= 0 && data.indexOf(':') > 0 && data.indexOf('}') > 0 && data.indexOf('"') > 0) {
          fext = 'json';
        }

        if (props.file.size > 150 * 1024 || fext == 'plain') return;
        setTimeout(() => {
          if (codeBlock.value) Prism.highlightAllUnder(codeBlock.value);
        }, 500);
      });
    }

    onMounted(() => {
      showCode();
    });

    function onDownload() {
      pageDownloadFiles(true, [props.file]);
    }

    return { showtop, fileid, filename, language, dialogpvc, codeBlock, codeString, onDownload };
  },
});
</script>
<style>
.fullwidthcode {
  padding: 40px 0 8px 0;

  background-color: #1e1e1e;
  min-height: 100%;
}
.fullwidthcode pre {
  width: 100%;
  background-color: #1e1e1e;
  user-select: text;
  -webkit-user-drag: auto;
  overflow-x: hidden !important;
  font-size: 14px;
}
.fullwidthcode pre:focus {
  outline: none;
}
.fullwidthcode pre * {
  user-select: text;
  -webkit-user-drag: auto;
}

.checkbox_true_part::after,
.checkbox_true_part_focus::after {
  width: 8px !important;
}
</style>
