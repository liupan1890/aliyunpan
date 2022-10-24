<script lang="ts">
import { defineComponent } from 'vue'
import { topRestoreSelectedFile, topRecoverSelectedFile, menuTrashSelectFile } from '../topbtns/topbtn'
export default defineComponent({
  props: {
    dirtype: {
      type: String,
      required: true
    }
  },
  setup() {
    return { topRecoverSelectedFile, topRestoreSelectedFile, menuTrashSelectFile }
  }
})
</script>

<template>
  <a-dropdown id="rightpantrashmenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
    <template #content>
      <a-doption v-show="dirtype == 'recover'" @click="topRecoverSelectedFile">
        <template #icon> <i class="iconfont iconrecover" /> </template>
        <template #default>恢复选中</template>
      </a-doption>
      <a-doption v-show="dirtype == 'trash'" @click="topRestoreSelectedFile">
        <template #icon> <i class="iconfont iconrecover" /> </template>
        <template #default>还原选中</template>
      </a-doption>

      <a-doption v-show="dirtype == 'trash'" @click="() => menuTrashSelectFile(false, true)">
        <template #icon> <i class="iconfont iconrest" /> </template>
        <template #default>彻底删除</template>
      </a-doption>
    </template>
  </a-dropdown>
</template>
<style></style>
