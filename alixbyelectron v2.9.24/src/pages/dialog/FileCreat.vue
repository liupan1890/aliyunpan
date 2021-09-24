<template>
  <q-dialog ref="dialogfc" persistent maximized no-refocus style="z-index: 6001">
    <div>
      <div class="fullwidthcode">
        <div style="padding: 16px 16px 0 16px">
          <q-input dark filled v-model="filename" label="文件名" autofocus spellcheck="false" />
          <br />
          <q-input dark v-model="context" filled autogrow type="textarea" class="filecontext" spellcheck="false" />
          <div style="text-align: right; padding-top: 18px">
            <q-btn dense color="primary" label="保存并创建文件" style="padding: 0 12px" @click="onSave"> </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div v-show="showtop" class="non-selectable dialogtopbar q-electron-drag">
      <div class="text-h7 dialogtopbartitle">新建文件</div>
      <div class="dialogtopbarbtn q-electron-drag--exception">
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { StoreRoot, StoreUser } from 'src/store';
import AliUploadMem from 'src/aliapi/uploadmem';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
export default defineComponent({
  name: 'FileCreat',
  methods: {
    show() {
      (this.$refs.dialogfc as any).show();
    },
    hide() {
      (this.$refs.dialogfc as any).hide();
    },
  },
  props: {
    drive_id: {
      type: String,
      required: true,
    },
    parentid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const dialogfc = ref();

    const showtop = ref(true);
    const filename = ref('');
    const context = ref('');


    onMounted(() => {
      // showCode();
    });

    function onSave() {
      const token = Object.assign({}, StoreUser.tokeninfo);
      AliUploadMem.UploadMem(props.drive_id, props.parentid, filename.value, context.value, token).then((data) => {
        if (data && data == 'success') {
          NotifySuccess('新建文件 成功');
          StoreRoot.aReLoadDir({ dir_id: props.parentid, deletecache: true });
          if (dialogfc.value) dialogfc.value.hide();
        } else {
          NotifyError('新建文件 失败 ' + data);
        }
      });
    }

    return { showtop, filename, context, dialogfc, onSave };
  },
});
</script>
<style>
.fullwidthcode {
  padding: 40px 0 8px 0;

  background-color: #1e1e1e;
  min-height: 100%;
}

.filecontext textarea {
  height: calc(100vh - 220px) !important;
}
</style>
