<template>
  <q-dialog ref="dialogsdsp" class="dialogsdsp" persistent no-focus no-refocus style="z-index:z-index: 6006;">
    <q-card class="q-dialog-plugin" style="height: 240px; max-height: 240px; width: 80vw; max-width: 460px;z-index:z-index: 6006;">
      <q-toolbar class="non-selectable" style="min-height: 40px">
        <q-toolbar-title class="text-h6 text-center">选择下载文件的保存位置</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 100px)" class="scroll">
        <q-input dense outlined readonly spellcheck="false" :model-value="savePath" webkitdirectory>
          <template v-slot:prepend>
            <q-icon name="iconfont iconfolder" />
          </template>
          <template v-slot:after>
            <q-btn dense color="primary" label="选择" style="padding: 0 12px" @click="SelectDir"> </q-btn>
          </template>
        </q-input>

        <br />
        <div style="line-height: 18px" class="text-grey">
          设置里的保存位置，会附加网盘里的完整路径，<br />
          在这里可以选择要把文件直接保存到哪里，去掉了网盘路径<br />
          不想看到这个弹窗请在设置里关闭“每次下载都选择保存位置”选项
        </div>
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px">
        <div style="flex-grow: 1"></div>
        <q-btn dense color="primary" label="确定" style="padding: 0 12px" @click="onClick"> </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import path from 'path';
export default defineComponent({
  name: 'DownSavePath',
  methods: {
    show() {
      (this.$refs.dialogsdsp as any).show();
    },
    hide() {
      (this.$refs.dialogsf as any).$emit('ok', { savePath: '' });
      (this.$refs.dialogsdsp as any).hide();
    },
  },

  props: {
    parentid: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dialogsdsp = ref();
    let savepath = localStorage.getItem('SavePath') || '';

    if (savepath.endsWith('/')) savepath = savepath.substr(0, savepath.length - 1);
    if (savepath.endsWith('\\')) savepath = savepath.substr(0, savepath.length - 1);
    if (savepath.endsWith(path.sep) == false && savepath) savepath = savepath + path.sep;
    const savePath = ref(savepath);

    function SelectDir() {
      if (window.WebShowOpenDialogSync) {
        window.WebShowOpenDialogSync(
          {
            title: '选择一个文件夹，把所有文件下载到此文件夹内',
            buttonLabel: '选择',
            properties: ['openDirectory'],
            defaultPath: savePath.value,
          },
          (result: string[] | undefined) => {
            if (result && result[0]) {
              let selectdir = result[0];
              if (selectdir.endsWith(path.sep) == false && selectdir) selectdir = selectdir + path.sep;
              localStorage.setItem('SavePath', selectdir);
              savePath.value = selectdir;
            }
          }
        );
      }
    }

    function onClick() {
      //
      dialogsdsp.value.$emit('ok', { savePath: savePath.value });
      dialogsdsp.value.hide();
    }
    return { dialogsdsp, savePath, SelectDir, onClick };
  },
});
</script>
<style>
.beforlabel {
  font-size: 14px;
  display: inline-block;
  min-width: 100px;
  text-align: right;
}
.hintlabel {
  width: 100%;
  text-align: right;
  color: rgba(0, 0, 0, 0.54);
  font-size: 12px;
}
.dialogsdsp {
  z-index: 6006 !important;
}
</style>
