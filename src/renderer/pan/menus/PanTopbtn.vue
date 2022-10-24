<script lang="ts">
import { defineComponent } from 'vue'

import { handleUpload } from '../topbtns/topbtn'

import { modalCreatNewFile, modalCreatNewDir, modalDaoRuShareLink } from '../../utils/modal'
export default defineComponent({
  props: {
    dirtype: {
      type: String,
      required: true
    },
    isselected: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    return { modalCreatNewFile, modalCreatNewDir, handleUpload, modalDaoRuShareLink }
  }
})
</script>

<template>
  <div v-show="!isselected && dirtype == 'pan'" class="toppanbtn">
    <a-dropdown trigger="hover" class="rightmenu" position="bl">
      <a-button type="text" size="small" tabindex="-1"><i class="iconfont iconplus" />新建<i class="iconfont icondown" /></a-button>
      <template #content>
        <a-doption value="newfile" title="Ctrl+N" @click="modalCreatNewFile">
          <template #icon> <i class="iconfont iconwenjian" /> </template>
          <template #default>新建文件</template>
        </a-doption>
        <a-doption value="newfolder" title="Ctrl+Shift+N" @click="() => modalCreatNewDir('folder')">
          <template #icon> <i class="iconfont iconfile-folder" /> </template>
          <template #default>新建文件夹</template>
        </a-doption>
        <a-doption value="newdatefolder" @click="() => modalCreatNewDir('datefolder')">
          <template #icon> <i class="iconfont iconfolderadd" /> </template>
          <template #default>日期+序号</template>
        </a-doption>
      </template>
    </a-dropdown>
    <a-dropdown trigger="hover" class="rightmenu" position="bl">
      <a-button type="text" size="small" tabindex="-1"><i class="iconfont iconupload" />上传<i class="iconfont icondown" /></a-button>
      <template #content>
        <a-doption value="uploadfile" title="Ctrl+U" @click="() => handleUpload('file')">
          <template #icon> <i class="iconfont iconwenjian" /> </template>
          <template #default>上传文件</template>
        </a-doption>
        <a-doption value="uploaddir" title="Ctrl+Shift+U" @click="() => handleUpload('folder')">
          <template #icon> <i class="iconfont iconfile-folder" /> </template>
          <template #default>上传文件夹</template>
        </a-doption>
      </template>
    </a-dropdown>
    <a-button type="text" size="small" tabindex="-1" title="Ctrl+L" @click="modalDaoRuShareLink"><i class="iconfont iconlink2" />导入分享</a-button>
  </div>
</template>
<style></style>
