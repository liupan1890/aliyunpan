<script lang="ts">
import { defineComponent } from 'vue'

import { menuFavSelectFile, menuTrashSelectFile, menuCopySelectedFile, menuFileColorChange, menuCreatShare, menuJumpToDir, menuVideoXBT, menuDLNA, menuM3U8Download, menuCopyFileName, menuCopyFileTree } from '../topbtns/topbtn'
import { modalRename, modalShuXing } from '../../utils/modal'
import { useSettingStore } from '../../store'

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
    const settingStore = useSettingStore()
    const istree = false
    return { istree, settingStore, menuCreatShare, menuFavSelectFile, menuTrashSelectFile, menuCopySelectedFile, menuFileColorChange, modalRename, modalShuXing, menuJumpToDir, menuVideoXBT, menuDLNA, menuM3U8Download, menuCopyFileName, menuCopyFileTree }
  }
})
</script>

<template>
  <a-dropdown id="rightpanmenu" class="rightmenu" :popup-visible="true" style="z-index: -1; left: -200px; opacity: 0">
    <template #content>
      <a-doption>
        <template #icon> <i class="iconfont icondownload" /> </template>
        <template #default>下载</template>
      </a-doption>
      <a-doption @click="() => menuCreatShare(istree, 'pan')">
        <template #icon> <i class="iconfont iconfenxiang" /> </template>
        <template #default>分享</template>
      </a-doption>

      <a-doption v-show="!isallfavored" @click="() => menuFavSelectFile(istree, true)">
        <template #icon> <i class="iconfont iconcrown" /> </template>
        <template #default>收藏</template>
      </a-doption>
      <a-doption v-show="isallfavored" @click="() => menuFavSelectFile(istree, false)">
        <template #icon> <i class="iconfont iconcrown2" /> </template>
        <template #default>取消收藏</template>
      </a-doption>
      <a-dsubmenu id="rightpansubbiaoji" class="rightmenu" trigger="hover">
        <template #default>
          <div @click.stop="() => {}">
            <span class="arco-dropdown-option-icon"><i class="iconfont iconwbiaoqian" style="opacity: 0.8"></i></span>标记
          </div>
        </template>
        <template #content>
          <a-doption v-for="item in settingStore.uiFileColorArray" :key="item.key" @click="() => menuFileColorChange(istree, item.key)">
            <template #icon> <i class="iconfont iconcheckbox-full" :style="{ color: item.key }" /> </template>
            <template #default>{{ item.title || item.key }}</template>
          </a-doption>

          <a-doption @click="() => menuFileColorChange(istree, '#5b89b8')">
            <template #icon> <i class="iconfont iconcheckbox-full" style="color: #5b89b8" /> </template>
            <template #default>视频灰</template>
          </a-doption>
          <a-doption @click="() => menuFileColorChange(istree, '')">
            <template #icon> <i class="iconfont iconfangkuang" /> </template>
            <template #default>清除标记</template>
          </a-doption>
        </template>
      </a-dsubmenu>
      <a-dsubmenu id="rightpansubmove" class="rightmenu" trigger="hover">
        <template #default>
          <div @click.stop="() => {}">
            <span class="arco-dropdown-option-icon"><i class="iconfont iconmoveto" style="opacity: 0.8"></i></span>移动
          </div>
        </template>
        <template #content>
          <a-doption @click="() => menuCopySelectedFile(istree, 'cut')">
            <template #icon> <i class="iconfont iconscissor" /> </template>
            <template #default>移动到...</template>
          </a-doption>
          <a-doption @click="() => menuCopySelectedFile(istree, 'copy')">
            <template #icon> <i class="iconfont iconcopy" /> </template>
            <template #default>复制到...</template>
          </a-doption>
          <a-doption class="danger" @click="() => menuTrashSelectFile(istree, false)">
            <template #icon> <i class="iconfont icondelete" /> </template>
            <template #default>回收站</template>
          </a-doption>
        </template>
      </a-dsubmenu>

      <a-doption v-show="dirtype != 'video'" @click="() => modalRename(istree, isselectedmulti)">
        <template #icon> <i class="iconfont iconedit-square" /> </template>
        <template #default>重命名</template>
      </a-doption>

      <a-dsubmenu id="rightpansubmore" class="rightmenu" trigger="hover">
        <template #default>
          <div @click.stop="() => {}">
            <span class="arco-dropdown-option-icon"><i class="iconfont icongengduo1" style="opacity: 0.8"></i></span>更多
          </div>
        </template>
        <template #content>
          <a-doption @click="() => modalShuXing(istree, isselectedmulti)">
            <template #icon> <i class="iconfont iconshuxing" /> </template>
            <template #default>属性</template>
          </a-doption>
          <a-doption v-show="isselected && !isselectedmulti && (dirtype == 'favorite' || dirtype == 'search' || dirtype == 'color' || dirtype == 'video')" @click="() => menuJumpToDir()">
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
          <a-doption v-show="isselected" @click="() => menuCopyFileName()">
            <template #icon> <i class="iconfont iconlist" /> </template>
            <template #default>复制文件名</template>
          </a-doption>
          <a-doption v-show="isselected && !isselectedmulti" @click="() => menuCopyFileTree()">
            <template #icon> <i class="iconfont iconnode-tree1" /> </template>
            <template #default>复制目录树</template>
          </a-doption>
        </template>
      </a-dsubmenu>
    </template>
  </a-dropdown>
</template>
<style></style>
