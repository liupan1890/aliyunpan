<script lang="ts">
import { defineComponent, ref } from 'vue'

import { menuFavSelectFile, menuTrashSelectFile, menuCopySelectedFile, menuJumpToDir, menuCreatShare, menuVideoXBT, menuDLNA, menuM3U8Download } from '../topbtns/topbtn'
import { modalRename, modalShuXing } from '../../utils/modal'

export default defineComponent({
  props: {
    dirtype: {
      type: String,
      required: true
    },
    isvideo: {
      type: Boolean,
      required: true
    },
    isselected: {
      type: Boolean,
      required: true
    },
    isselectedmulti: {
      type: Boolean,
      required: true
    },
    isallfavored: {
      type: Boolean,
      required: true
    }
  },
  setup() {
    const istree = false
    return { istree, menuCreatShare, menuFavSelectFile, menuTrashSelectFile, modalRename, menuCopySelectedFile, modalShuXing, menuJumpToDir, menuVideoXBT, menuDLNA, menuM3U8Download }
  }
})
</script>

<template>
  <div class="toppanbtn" v-show="isselected && dirtype !== 'trash' && dirtype !== 'recover'">
    <a-button type="text" size="small" tabindex="-1" @click="" title="Ctrl+D"><i class="iconfont icondownload" />下载</a-button>
    <a-button v-show="dirtype == 'pan'" type="text" size="small" tabindex="-1" @click="() => menuCreatShare(istree, 'pan')" title="Ctrl+S"><i class="iconfont iconfenxiang" />分享</a-button>
    <a-button v-show="!isallfavored" type="text" size="small" tabindex="-1" @click="() => menuFavSelectFile(istree, true)" title="Ctrl+G"><i class="iconfont iconcrown" />收藏</a-button>
    <a-button v-show="isallfavored" type="text" size="small" tabindex="-1" @click="() => menuFavSelectFile(istree, false)" title="Ctrl+G"><i class="iconfont iconcrown2" />取消收藏</a-button>

    <a-dropdown trigger="hover" class="rightmenu" position="bl" tabindex="-1" :draggable="false">
      <a-button type="text" size="small" tabindex="-1" class="danger"><i class="iconfont icondelete" />删除<i class="iconfont icondown" /></a-button>
      <template #content>
        <a-doption title="Ctrl+Delete" @click="() => menuTrashSelectFile(istree, false)" class="danger">
          <template #icon> <i class="iconfont icondelete" /> </template>
          <template #default>放回收站</template>
        </a-doption>
        <a-dsubmenu class="rightmenu" trigger="hover" tabindex="-1" :draggable="false">
          <template #default>
            <span class="arco-dropdown-option-icon"><i class="iconfont iconrest"></i></span>彻底删除
          </template>
          <template #content>
            <a-doption title="Ctrl+Shift+Delete" @click="() => menuTrashSelectFile(istree, true)" class="danger">
              <template #default>删除后无法还原</template>
            </a-doption>
          </template>
        </a-dsubmenu>
      </template>
    </a-dropdown>

    <a-dropdown trigger="hover" class="rightmenu" position="bl" tabindex="-1" :draggable="false">
      <a-button type="text" size="small" tabindex="-1">更多<i class="iconfont icondown" /></a-button>
      <template #content>
        <a-doption v-show="dirtype != 'video'" title="F2 / Ctrl+E" @click="() => modalRename(istree, isselectedmulti)">
          <template #icon> <i class="iconfont iconedit-square" /> </template>
          <template #default>重命名</template>
        </a-doption>
        <a-doption v-show="dirtype != 'video'" title="Ctrl+X" @click="() => menuCopySelectedFile(istree, 'move')">
          <template #icon> <i class="iconfont iconscissor" /> </template>
          <template #default>移动到...</template>
        </a-doption>
        <a-doption v-show="dirtype != 'video'" title="Ctrl+C" @click="() => menuCopySelectedFile(istree, 'copy')">
          <template #icon> <i class="iconfont iconcopy" /> </template>
          <template #default>复制到...</template>
        </a-doption>
        <a-doption title="Ctrl+P" @click="() => modalShuXing(istree, isselectedmulti)">
          <template #icon> <i class="iconfont iconshuxing" /> </template>
          <template #default>属性</template>
        </a-doption>
        <a-doption v-show="isselected && !isselectedmulti && (dirtype == 'favorite' || dirtype == 'search')" @click="() => menuJumpToDir()">
          <template #icon> <i class="iconfont icondakaiwenjianjia1" /> </template>
          <template #default>打开位置</template>
        </a-doption>
        <a-doption v-show="isvideo" @click="() => menuVideoXBT()">
          <template #icon> <i class="iconfont iconjietu" /> </template>
          <template #default>雪碧图</template>
        </a-doption>
        <a-doption v-show="false && isvideo" @click="() => menuDLNA()">
          <template #icon> <i class="iconfont icontouping2" /> </template>
          <template #default>DLNA</template>
        </a-doption>
        <a-doption v-show="isvideo" @click="() => menuM3U8Download()">
          <template #icon> <i class="iconfont iconluxiang" /> </template>
          <template #default>m3u8</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>
<style></style>
