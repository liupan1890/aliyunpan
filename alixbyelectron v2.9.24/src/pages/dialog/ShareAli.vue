<template>
  <q-dialog ref="dialogsali" persistent no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="height: 240px; max-height: 240px; width: 80vw; max-width: 460px">
      <q-toolbar class="non-selectable" style="min-height: 40px">
        <q-toolbar-title class="text-h6 text-center">导入阿里云盘分享链接</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 100px)" class="scroll">
        <q-input filled square v-model="linktxt" dense autofocus spellcheck="false">
          <template v-slot:before><span class="beforlabel">阿里分享链接</span></template>
        </q-input>
        <div class="hintlabel">aliyundrive.com/s/xxxxxx</div>
        <br />
        <q-input filled square v-model="linkpwd" dense spellcheck="false">
          <template v-slot:before><span class="beforlabel">密码(没有不填)</span> </template>
        </q-input>
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px">
        <div style="flex-grow: 1"></div>
        <q-checkbox color="primary" class="shareChecked" v-model="shareChecked" label="分享到聚合搜索">
          <q-tooltip>默认不勾选，手动勾选后，这些文件会被分享到聚合搜索中，可以被别人搜索到</q-tooltip>
        </q-checkbox>
        <q-btn dense color="primary" label="解析文件" style="padding: 0 12px" :loading="btnloading" @click="onClick"> </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { StoreUser } from 'src/store';
import { NotifyError } from 'src/aliapi/notify';
import { Dialog } from 'quasar';
import ShareAli from 'src/aliapi/shareali';
import { ILinkTxt } from 'src/store/models';
import ShareDaoru from 'src/pages/dialog/ShareDaoru.vue';
export default defineComponent({
  name: 'ShareAli',
  methods: {
    show() {
      (this.$refs.dialogsali as any).show();
    },

    hide() {
      (this.$refs.dialogsali as any).hide();
    },
  },

  props: {
    parentid: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dialogsali = ref();
    const linktxt = ref('');
    const linkpwd = ref('');
    const btnloading = ref(false);
    const shareChecked = ref(false);
    let text = window.electron.clipboard.readText() as string;

    FixFormate(text);
    function FixFormate(text: string) {
      if (linktxt.value.indexOf('aliyundrive.com/s/') > 0 && linkpwd.value.length == 4) return;
      if (text && text.indexOf('提取码') >= 0) {
        text.replace('提取码:', '提取码').replace('提取码：', '提取码');
        linkpwd.value = text.substr(text.indexOf('提取码') + '提取码'.length, 4);
      }

      if (text && text.length == 11) {
        linktxt.value = 'https://www.aliyundrive.com/s/' + text;
      }

      if (text && text.indexOf('aliyundrive.com/s/') >= 0) {
        linktxt.value = 'https://www.aliyundrive.com/s/' + text.substr(text.indexOf('aliyundrive.com/s/') + 'aliyundrive.com/s/'.length, 11);
      }
    }
    function onClick() {
      FixFormate(linktxt.value);
      const link = linktxt.value;
      const pwd = linkpwd.value;
      if (link.indexOf('aliyundrive.com/s/') >= 0) {
        btnloading.value = true;
        const sid = link.split(/\.com\/s\/([\w]+)/)[1];
        const token = Object.assign({}, StoreUser.tokeninfo);
        ShareAli.GetLinkFilesAli(sid, pwd, shareChecked.value, token).then((data: string | ILinkTxt) => {
          btnloading.value = false;
          if (typeof data == 'string') {
            NotifyError('解析链接出错，' + data);
          } else if (token.share_token === undefined || token.share_token == '') {
            NotifyError('解析链接出错，无效的ShareToken');
          } else {
            Dialog.create({
              component: ShareDaoru,
              componentProps: { linkdata: data, shareid: sid, sharetoken: token.share_token },
            });
            if (dialogsali.value) dialogsali.value.hide();
          }
        });
      } else {
        NotifyError('解析链接出错，必须为 https://www.aliyundrive.com/s/xxxxxxxxxxx 格式的链接');
      }
    }

    return { dialogsali, btnloading, shareChecked, linktxt, linkpwd, onClick };
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
</style>
