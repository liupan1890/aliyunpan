<script lang="ts">
import { defineComponent } from 'vue'
import { topTrashDeleteAll, topRestoreSelectedFile, menuTrashSelectFile, topRecoverSelectedFile } from '../topbtns/topbtn'
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
    return { topTrashDeleteAll, topRestoreSelectedFile, menuTrashSelectFile, topRecoverSelectedFile }
  }
})
</script>

<template>
  <div class="toppanbtn" v-show="dirtype == 'trash'">
    <a-button type="text" size="small" tabindex="-1" @click="topTrashDeleteAll" class="danger"><i class="iconfont iconqingkong" />清空回收站</a-button>
  </div>
  <div class="toppanbtn" v-show="dirtype == 'trash' && isselected">
    <a-button type="text" size="small" tabindex="-1" @click="topRestoreSelectedFile"><i class="iconfont iconrecover" />还原选中</a-button>
    <a-button type="text" size="small" tabindex="-1" @click="() => menuTrashSelectFile(false, true)" class="danger"><i class="iconfont iconrest" />彻底删除</a-button>
  </div>

  <div class="toppanbtn" v-show="dirtype == 'recover' && isselected">
    <a-button type="text" size="small" tabindex="-1" @click="topRecoverSelectedFile"><i class="iconfont iconrecover" />恢复选中</a-button>
  </div>
</template>
<style></style>
