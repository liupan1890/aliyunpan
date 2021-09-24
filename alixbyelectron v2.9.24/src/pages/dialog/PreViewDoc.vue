<template>
  <q-dialog ref="dialog" persistent maximized no-focus no-refocus>
    <q-card class="q-dialog-plugin">
      <q-toolbar class="q-electron-drag non-selectable" style="min-height: 40px; margin-top: 2px">
        <q-toolbar-title class="text-h7 text-center">{{ file.name }}</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 50px); padding: 0">
        <div id="docdiv" class="row" style="height: calc(100%); text-align: center">
          <iframe
            class="web-office-iframe"
            id="office-iframe"
            :src="preview_url"
            scrolling="no"
            frameborder="0"
            allowfullscreen="allowfullscreen"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            style="width: 100%; height: 100%"
          ></iframe>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'PreViewDoc',
  methods: {
    show() {
      this.$refs.dialog.show();
    },
    hide() {
      this.$refs.dialog.hide();
    },
  },
  props: {
    file,
    access_token: String,
    preview_url: String,
  },
  setup(props) {
    console.log(props);
    return {};
  },
});
</script>
<style></style>
